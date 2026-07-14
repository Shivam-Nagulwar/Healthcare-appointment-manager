'use server';

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import { generatePreVisitSummary } from '@/lib/ai';
import { sendBookingConfirmation, sendBookingCancellation } from '@/lib/email';
import { createCalendarEvent, deleteCalendarEvent, createPatientCalendarEvent, deletePatientCalendarEvent } from '@/lib/calendar';
import { revalidatePath } from 'next/cache';

export async function holdAppointmentSlot(doctorId: string, slotStart: string, slotEnd: string) {
  const user = await requireAuth(Role.PATIENT);
  const startDate = new Date(slotStart);
  const endDate = new Date(slotEnd);
  
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    // Use a Serializable transaction to absolutely prevent exact-millisecond race conditions
    const appointmentId = await prisma.$transaction(async (tx) => {
      // Check for conflicts
      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          doctorId,
          OR: [
            { status: { in: ['BOOKED', 'COMPLETED'] } },
            { status: 'HELD', createdAt: { gt: fiveMinutesAgo } }
          ],
          slotStart: { lt: endDate },
          slotEnd: { gt: startDate },
        }
      });

      if (conflictingAppointment) {
        throw new Error('This time slot is no longer available. Please select another slot.');
      }

      // Create HELD appointment
      const appointment = await tx.appointment.create({
        data: {
          patient: { connect: { userId: user.id } },
          doctor: { connect: { id: doctorId } },
          slotStart: startDate,
          slotEnd: endDate,
          status: 'HELD',
        }
      });
      return appointment.id;
    }, {
      isolationLevel: 'Serializable'
    });

    return { success: true, id: appointmentId };
  } catch (err: any) {
    return { error: err.message || 'This time slot is no longer available. Please select another slot.' };
  }
}

export async function bookAppointment(appointmentId: string, symptoms: string) {
  const user = await requireAuth(Role.PATIENT);

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true }
  });

  if (!appointment) return { error: 'Appointment not found.' };
  if (appointment.patient.userId !== user.id) return { error: 'Unauthorized.' };

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  if (appointment.status === 'BOOKED') return { success: true, id: appointment.id };

  if (appointment.status !== 'HELD') {
    return { error: 'Invalid appointment status.' };
  }

  if (appointment.createdAt < fiveMinutesAgo) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED', cancelReason: 'Reservation expired' }
    });
    return { error: 'Your reservation expired. Please go back and select a slot again.' };
  }

  // Call the AI Service
  let aiSummary: any = null;
  let llmStatus: 'OK' | 'FAILED' = 'OK';
  
  try {
    aiSummary = await generatePreVisitSummary(symptoms);
  } catch (err) {
    console.error('AI Generation Failed:', err);
    llmStatus = 'FAILED';
  }

  // Confirm booking
  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'BOOKED',
      preVisitSummary: {
        create: {
          rawSymptoms: symptoms,
          llmStatus,
          ...(aiSummary ? {
            urgencyLevel: aiSummary.urgencyLevel,
            chiefComplaint: aiSummary.chiefComplaint,
            differentialDiagnosis: aiSummary.differentialDiagnosis,
            suggestedQuestions: aiSummary.suggestedQuestions,
            redFlags: aiSummary.redFlags,
            patientFriendlySummary: aiSummary.patientFriendlySummary,
          } : {})
        },
      },
    },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
      preVisitSummary: true
    }
  });

  // Send Email Notifications
  try {
    await sendBookingConfirmation(
      updated.patient.user.email,
      updated.doctor.user.name,
      updated.slotStart,
      updated.doctor.user.email
    );
  } catch (err) {
    console.error('Failed to send confirmation email', err);
  }

  // Create Google Calendar Event
  try {
    const hasPatientConnectedCalendar = !!updated.patient.googleRefreshToken;

    const googleEventId = await createCalendarEvent(
      updated.doctorId,
      updated.patient.user.email,
      updated.patient.user.name,
      updated.slotStart,
      updated.slotEnd,
      `Appointment with ${updated.patient.user.name}. Chief Complaint: ${updated.preVisitSummary?.chiefComplaint || 'None provided'}`,
      !hasPatientConnectedCalendar // Add attendee if patient has NOT connected their calendar
    );

    let patientGoogleEventId = null;
    if (hasPatientConnectedCalendar) {
      patientGoogleEventId = await createPatientCalendarEvent(
        updated.patientId,
        updated.doctor.user.name,
        updated.slotStart,
        updated.slotEnd,
        `Appointment with Dr. ${updated.doctor.user.name}.`
      );
    }

    if (googleEventId || patientGoogleEventId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { 
          ...(googleEventId ? { googleEventId } : {}),
          ...(patientGoogleEventId ? { patientGoogleEventId } : {})
        }
      });
    }
  } catch (err) {
    console.error('Failed to create google calendar event', err);
  }

  revalidatePath('/patient/doctors');
  revalidatePath(`/patient/doctors/${appointment.doctorId}/book`);
  revalidatePath('/patient/appointments');
  return { success: true };
}

export async function retryAIGeneration(appointmentId: string) {
  const user = await requireAuth();

  const summary = await prisma.preVisitSummary.findUnique({
    where: { appointmentId },
  });

  if (!summary || !summary.rawSymptoms) {
    return { error: 'No symptoms found to analyze.' };
  }

  try {
    const aiSummary = await generatePreVisitSummary(summary.rawSymptoms);
    
    await prisma.preVisitSummary.update({
      where: { appointmentId },
      data: {
        llmStatus: 'OK',
        urgencyLevel: aiSummary.urgencyLevel,
        chiefComplaint: aiSummary.chiefComplaint,
        differentialDiagnosis: aiSummary.differentialDiagnosis,
        suggestedQuestions: aiSummary.suggestedQuestions,
        redFlags: aiSummary.redFlags,
        patientFriendlySummary: aiSummary.patientFriendlySummary,
      },
    });

    revalidatePath(`/patient/appointments/${appointmentId}`);
    revalidatePath('/doctor/appointments');
    return { success: true };
  } catch (err) {
    console.error('AI Retry Failed:', err);
    return { error: 'Failed to generate AI summary. Please check your API key and try again.' };
  }
}

export async function cancelAppointment(appointmentId: string) {
  const user = await requireAuth(); // Could be patient, doctor, or admin

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } }
    }
  });

  if (!appointment) return { error: 'Appointment not found' };

  // Check authorization
  const isPatient = appointment.patient.userId === user.id;
  const isDoctor = appointment.doctor.userId === user.id;
  const isAdmin = user.role === Role.ADMIN;

  if (!isPatient && !isDoctor && !isAdmin) {
    return { error: 'Unauthorized to cancel this appointment' };
  }

  // Update status
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' }
  });

  // Determine who cancelled it for the email
  const cancelledBy = isPatient ? 'patient' : 'doctor';

  // 1. Create DB Notifications
  const notificationTitle = 'Appointment Cancelled';
  const notificationMessage = `The appointment with Dr. ${appointment.doctor.user.name} on ${new Date(appointment.slotStart).toLocaleDateString()} has been cancelled by the ${cancelledBy}.`;

  await prisma.notification.createMany({
    data: [
      {
        userId: appointment.patient.userId,
        type: 'SYSTEM',
        title: notificationTitle,
        message: notificationMessage,
        link: '/patient/appointments'
      },
      {
        userId: appointment.doctor.userId,
        type: 'SYSTEM',
        title: notificationTitle,
        message: notificationMessage,
        link: '/doctor/appointments'
      }
    ]
  });

  // 2. Send Emails
  try {
    await sendBookingCancellation(
      appointment.patient.user.email,
      appointment.doctor.user.email,
      appointment.doctor.user.name,
      appointment.slotStart,
      cancelledBy
    );
  } catch (err) {
    console.error('Failed to send cancellation email', err);
  }

  // 3. Delete Google Calendar Event
  if (appointment.googleEventId) {
    await deleteCalendarEvent(appointment.doctorId, appointment.googleEventId);
  }
  if (appointment.patientGoogleEventId) {
    await deletePatientCalendarEvent(appointment.patientId, appointment.patientGoogleEventId);
  }

  revalidatePath('/patient/appointments');
  revalidatePath('/doctor/appointments');
  revalidatePath(`/patient/appointments/${appointmentId}`);
  revalidatePath(`/doctor/appointments/${appointmentId}`);
  
  return { success: true };
}
