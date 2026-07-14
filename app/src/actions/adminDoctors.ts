'use server';

import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as bcrypt from 'bcryptjs';

export async function saveDoctor(formData: any, doctorId?: string) {
  const admin = await requireAuth(Role.ADMIN);

  const { name, email, specialization, experience, slotDurationMin, location, education, bio } = formData;

  try {
    if (doctorId) {
      // Update
      await prisma.doctorProfile.update({
        where: { id: doctorId },
        data: {
          specialization,
          experience: Number(experience),
          slotDurationMin: Number(slotDurationMin),
          location,
          education,
          bio,
          user: {
            update: {
              name,
              email,
            }
          }
        }
      });
    } else {
      const hashedPassword = await bcrypt.hash('Doctor123!', 10);

      // Create new user & doctor profile
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: Role.DOCTOR,
          doctorProfile: {
            create: {
              specialization,
              experience: Number(experience),
              slotDurationMin: Number(slotDurationMin),
              location,
              education,
              bio,
              workingHours: {
                mon: ['09:00', '17:00'],
                tue: ['09:00', '17:00'],
                wed: ['09:00', '17:00'],
                thu: ['09:00', '17:00'],
                fri: ['09:00', '17:00'],
              }
            }
          }
        }
      });
    }
    revalidatePath('/admin');
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: err.message };
  }
}

export async function deleteDoctor(doctorId: string) {
  const admin = await requireAuth(Role.ADMIN);

  try {
    const doc = await prisma.doctorProfile.findUnique({ where: { id: doctorId }, select: { userId: true } });
    if (doc) {
      // Need to delete related appointments/leaves before deleting the doctor if foreign keys enforce it.
      // For prototype, we can delete appointments or just leave them if we cascade.
      // By default prisma restricts deletion. We'll manually delete appointments & leaves for clean demo, or we can just try catching error.
      await prisma.appointment.deleteMany({ where: { doctorId } });
      await prisma.doctorLeave.deleteMany({ where: { doctorId } });
      
      await prisma.doctorProfile.delete({ where: { id: doctorId } });
      await prisma.user.delete({ where: { id: doc.userId } });
    }
    revalidatePath('/admin');
    revalidatePath('/admin/doctors');
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { error: 'Could not delete doctor because they have active data.' };
  }
}
