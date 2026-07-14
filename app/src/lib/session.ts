import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Reads the currently logged in user from the session cookie.
 * Returns the full user object or null if not logged in.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_session')?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

/**
 * Helper to ensure the user is logged in and has a specific role.
 */
export async function requireAuth(role?: Role) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  if (role && user.role !== role) {
    throw new Error('Forbidden');
  }
  return user;
}
