'use server';

import { requireAuth } from '@/lib/session';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import * as bcrypt from 'bcryptjs';

export async function updateSettings(formData: FormData) {
  const user = await requireAuth(); // any role

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string; // Optional

  if (!name || !email) {
    return { error: 'Name and email are required.' };
  }

  const updateData: any = {
    name,
    email,
  };

  // If the user wants to change their password
  if (password) {
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    if (user.role === Role.PATIENT) {
      const phone = formData.get('phone') as string;
      const bloodGroup = formData.get('bloodGroup') as string;
      const gender = formData.get('gender') as string;
      const emergencyContact = formData.get('emergencyContact') as string;
      const address = formData.get('address') as string;
      const dobStr = formData.get('dob') as string;
      
      const dob = dobStr ? new Date(dobStr) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...updateData,
          patientProfile: {
            update: {
              phone,
              bloodGroup,
              gender,
              emergencyContact,
              address,
              dob,
            },
          },
        },
      });
    } else if (user.role === Role.DOCTOR) {
      const specialization = formData.get('specialization') as string;
      const experience = Number(formData.get('experience'));
      const bio = formData.get('bio') as string;
      const education = formData.get('education') as string;
      const location = formData.get('location') as string;
      const slotDurationMin = Number(formData.get('slotDurationMin'));

      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...updateData,
          doctorProfile: {
            update: {
              specialization,
              experience: isNaN(experience) ? 0 : experience,
              bio,
              education,
              location,
              slotDurationMin: isNaN(slotDurationMin) ? 30 : slotDurationMin,
            },
          },
        },
      });
    } else if (user.role === Role.ADMIN) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2002') {
      return { error: 'Email is already in use.' };
    }
    return { error: 'An unexpected error occurred while saving your settings.' };
  }
}
