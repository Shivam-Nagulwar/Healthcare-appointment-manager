'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import * as bcrypt from 'bcryptjs';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as Role;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return { error: 'Invalid email or password' };
  }

  if (user.role !== role) {
    return { error: `Account exists, but is not registered as a ${role.toLowerCase()}.` };
  }

  const cookieStore = await cookies();
  cookieStore.set('auth_session', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  if (user.role === Role.PATIENT) return { success: true, redirectUrl: '/patient' };
  if (user.role === Role.DOCTOR) return { success: true, redirectUrl: '/doctor' };
  if (user.role === Role.ADMIN) return { success: true, redirectUrl: '/admin' };
  return { success: true, redirectUrl: '/' };
}

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as Role;

  if (role !== Role.PATIENT) {
    return { error: 'Only patients can register publicly. Doctors must be added by an admin.' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'Email already in use' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role,
      patientProfile: {
        create: {
          dob: new Date(),
          phone: '',
          bloodGroup: '',
        }
      }
    }
  });
  const cookieStore = await cookies();
  cookieStore.set('auth_session', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return { success: true, redirectUrl: '/patient' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
  redirect('/');
}
