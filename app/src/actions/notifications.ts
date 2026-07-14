'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function getMyNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markNotificationAsRead(id: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  return prisma.notification.update({
    where: { id, userId: user.id },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();
  if (!user) return null;

  return prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
}
