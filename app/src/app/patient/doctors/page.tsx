import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import DoctorsClient from './DoctorsClient';

export default async function FindDoctorsPage() {
  const user = await requireAuth(Role.PATIENT);

  const dbDoctors = await prisma.doctorProfile.findMany({
    include: {
      user: true,
    },
  });

  const doctorsList = dbDoctors.map(doc => ({
    id: doc.id,
    name: doc.user.name,
    specialization: doc.specialization,
    experience: doc.experience,
    bio: doc.bio,
    location: doc.location,
    slotDurationMin: doc.slotDurationMin,
    rating: doc.rating,
    totalReviews: doc.totalReviews,
    workingHours: doc.workingHours,
  }));

  return <DoctorsClient doctors={doctorsList} user={user} />;
}
