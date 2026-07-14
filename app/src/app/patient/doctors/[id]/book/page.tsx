import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BookClient from './BookClient';

export default async function BookAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(Role.PATIENT);
  const resolvedParams = await params;

  const dbDoctor = await prisma.doctorProfile.findUnique({
    where: { id: resolvedParams.id },
    include: { user: true },
  });

  if (!dbDoctor) {
    notFound();
  }

  const doctorData = {
    id: dbDoctor.id,
    name: dbDoctor.user.name,
    specialization: dbDoctor.specialization,
    experience: dbDoctor.experience,
    location: dbDoctor.location,
    slotDurationMin: dbDoctor.slotDurationMin,
    rating: dbDoctor.rating,
    totalReviews: dbDoctor.totalReviews,
    workingHours: dbDoctor.workingHours,
  };

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const rawBookedSlots = await prisma.appointment.findMany({
    where: {
      doctorId: dbDoctor.id,
      OR: [
        { status: { in: ['BOOKED', 'COMPLETED'] } },
        { status: 'HELD', createdAt: { gt: fiveMinutesAgo } }
      ],
      slotStart: { gte: new Date() } // only future slots
    },
    select: { slotStart: true, slotEnd: true }
  });

  const bookedSlots = rawBookedSlots.map(s => ({
    slotStart: s.slotStart.toISOString(),
    slotEnd: s.slotEnd.toISOString(),
  }));

  return <BookClient doctor={doctorData} user={user} bookedSlots={bookedSlots} />;
}
