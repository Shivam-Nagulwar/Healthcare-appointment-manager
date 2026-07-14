'use server';

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { generatePostVisitSummary } from '@/lib/ai';

interface PrescriptionInput {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export async function submitNotes(appointmentId: string, notes: string, prescriptions: PrescriptionInput[], followUp: boolean, followUpDays: string) {
  const user = await requireAuth(Role.DOCTOR);
  
  const dbDoctor = await prisma.doctorProfile.findFirst({
    where: { userId: user.id }
  });
  if (!dbDoctor) throw new Error('Doctor not found');

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId: dbDoctor.id }
  });
  if (!appointment) throw new Error('Appointment not found');

  const validPrescriptions = prescriptions
    .filter(rx => rx.medication.trim().length > 0)
    .map(rx => ({
      medication: rx.medication,
      dosage: rx.dosage,
      frequency: rx.frequency,
      durationDays: parseInt(rx.duration, 10) || 7
    }));

  let patientSummary: string | null = null;
  let llmStatus: 'OK' | 'FAILED' = 'OK';
  
  try {
    patientSummary = await generatePostVisitSummary(notes, validPrescriptions);
  } catch (err) {
    console.error('Post-Visit AI Generation Failed:', err);
    llmStatus = 'FAILED';
  }

  const existingNote = await prisma.postVisitNote.findUnique({
    where: { appointmentId }
  });

  if (existingNote) {
    // delete old prescriptions
    await prisma.prescriptionItem.deleteMany({
      where: { postVisitNoteId: existingNote.id }
    });

    await prisma.postVisitNote.update({
      where: { id: existingNote.id },
      data: {
        clinicalNotes: notes,
        patientSummary,
        llmStatus,
        followUpRecommended: followUp,
        followUpDays: followUp ? parseInt(followUpDays, 10) || null : null,
        prescriptions: {
          create: validPrescriptions
        }
      }
    });
  } else {
    await prisma.postVisitNote.create({
      data: {
        appointmentId,
        clinicalNotes: notes,
        patientSummary,
        llmStatus,
        followUpRecommended: followUp,
        followUpDays: followUp ? parseInt(followUpDays, 10) || null : null,
        prescriptions: {
          create: validPrescriptions
        }
      }
    });
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'COMPLETED' }
  });

  revalidatePath('/doctor');
  revalidatePath('/doctor/appointments');
  revalidatePath(`/doctor/appointments/${appointmentId}`);
}

export async function retryPostVisitAIGeneration(appointmentId: string) {
  const note = await prisma.postVisitNote.findUnique({
    where: { appointmentId },
    include: { prescriptions: true }
  });

  if (!note) return { error: 'Post-visit note not found.' };

  try {
    const summary = await generatePostVisitSummary(note.clinicalNotes, note.prescriptions);
    await prisma.postVisitNote.update({
      where: { appointmentId },
      data: {
        patientSummary: summary,
        llmStatus: 'OK'
      }
    });
    revalidatePath(`/patient/appointments/${appointmentId}`);
    revalidatePath(`/doctor/appointments/${appointmentId}`);
    return { success: true };
  } catch (err) {
    console.error('Retry Post-Visit AI failed:', err);
    return { error: 'Failed to connect to AI service. Please try again.' };
  }
}
