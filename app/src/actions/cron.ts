'use server';

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';

export async function triggerMedicationReminders() {
  const admin = await requireAuth(Role.ADMIN);

  try {
    // Find all post-visit notes that have active prescriptions
    const notes = await prisma.postVisitNote.findMany({
      include: {
        prescriptions: true,
        appointment: {
          include: {
            patient: true
          }
        }
      }
    });

    const now = new Date();
    let notificationsCreated = 0;

    for (const note of notes) {
      // Check which prescriptions are still active
      for (const rx of note.prescriptions) {
        // Calculate expiration date (createdAt + durationDays)
        const expirationDate = new Date(note.createdAt);
        expirationDate.setDate(expirationDate.getDate() + rx.durationDays);

        if (now <= expirationDate) {
          // This prescription is still active, send a reminder
          await prisma.notification.create({
            data: {
              userId: note.appointment.patient.userId,
              type: 'PRESCRIPTION',
              title: `Medication Reminder: ${rx.medication}`,
              message: `Reminder to take your ${rx.medication} (${rx.dosage}). Instructions: ${rx.frequency}.`,
              link: `/patient/appointments/${note.appointmentId}`
            }
          });
          notificationsCreated++;
        }
      }
    }

    return { success: true, count: notificationsCreated };
  } catch (err: any) {
    console.error('Failed to trigger medication reminders:', err);
    return { error: err.message };
  }
}

import { sendAppointmentReminder } from '@/lib/email';

export async function triggerAppointmentReminders() {
  const admin = await requireAuth(Role.ADMIN);

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find appointments in the next 24 hours
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: 'BOOKED',
        slotStart: {
          gt: now,
          lte: tomorrow
        }
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } }
      }
    });

    let count = 0;
    for (const app of upcomingAppointments) {
      // Send Email
      try {
        await sendAppointmentReminder(
          app.patient.user.email,
          app.doctor.user.name,
          app.slotStart
        );
        count++;
      } catch (e) {
        console.error('Failed to send reminder email', e);
      }
    }

    return { success: true, count };
  } catch (err: any) {
    console.error('Failed to trigger appointment reminders:', err);
    return { error: err.message };
  }
}
