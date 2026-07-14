'use server';

import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendDoctorLeaveNotification } from '@/lib/email';

export async function saveLeave(formData: any) {
  const admin = await requireAuth(Role.ADMIN);

  const { doctorId, startDate, endDate, reason } = formData;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    await prisma.doctorLeave.create({
      data: {
        doctorId,
        startDate: start,
        endDate: end,
        reason
      }
    });

    // Find overlapping BOOKED appointments
    const affectedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: 'BOOKED',
        slotStart: { lt: end },
        slotEnd: { gt: start },
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } }
      }
    });

    if (affectedAppointments.length > 0) {
      // 1. Cancel them
      await prisma.appointment.updateMany({
        where: { id: { in: affectedAppointments.map(a => a.id) } },
        data: { status: 'CANCELLED' }
      });

      // 2. Notify patients in DB
      const notifications = affectedAppointments.map(app => ({
        userId: app.patient.userId,
        type: 'SYSTEM' as const,
        title: 'Appointment Cancelled - Doctor on Leave',
        message: `Your appointment with Dr. ${app.doctor.user.name} on ${new Date(app.slotStart).toLocaleDateString()} has been cancelled due to unforeseen doctor leave. Please book a new slot.`,
        link: '/patient/doctors'
      }));

      await prisma.notification.createMany({
        data: notifications
      });

      // 3. Send Emails
      for (const app of affectedAppointments) {
        try {
          await sendDoctorLeaveNotification(
            app.patient.user.email,
            app.doctor.user.name,
            app.slotStart
          );
        } catch (e) {
          console.error('Failed to send leave email to', app.patient.user.email, e);
        }
      }
    }
    
    revalidatePath('/admin');
    revalidatePath('/admin/leaves');
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message };
  }
}

export async function deleteLeave(leaveId: string) {
  const admin = await requireAuth(Role.ADMIN);

  try {
    await prisma.doctorLeave.delete({ where: { id: leaveId } });
    revalidatePath('/admin');
    revalidatePath('/admin/leaves');
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message };
  }
}
