'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function mockLogin(role: Role) {
  // Find the first user in the database with the requested role
  const user = await prisma.user.findFirst({
    where: { role },
  });

  if (!user) {
    throw new Error(`No mock user found for role: ${role}`);
  }

  // Set a simple cookie to track the session
  const cookieStore = await cookies();
  cookieStore.set('auth_session', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  // Redirect to the appropriate portal
  switch (role) {
    case Role.PATIENT:
      redirect('/patient');
      break;
    case Role.DOCTOR:
      redirect('/doctor');
      break;
    case Role.ADMIN:
      redirect('/admin');
      break;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
  redirect('/');
}
