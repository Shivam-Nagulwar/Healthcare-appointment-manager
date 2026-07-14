import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import NotesHistoryClient from './NotesHistoryClient';
import { notFound } from 'next/navigation';

export default async function DoctorNotesPage() {
  const user = await requireAuth(Role.DOCTOR);

  const dbDoctor = await prisma.doctorProfile.findFirst({
    where: { userId: user.id },
  });

  if (!dbDoctor) notFound();

  const doctorAppointments = await prisma.appointment.findMany({
    where: { doctorId: dbDoctor.id },
    include: {
      patient: { include: { user: true } },
      preVisitSummary: true,
      postVisitNote: { include: { prescriptions: true } }
    },
    orderBy: { slotStart: 'desc' }
  });

  const serializedAppointments = doctorAppointments.map(a => ({
    id: a.id,
    patientName: a.patient.user.name,
    status: a.status,
    slotStart: a.slotStart,
    postVisitNote: a.postVisitNote,
    preVisitSummary: a.preVisitSummary,
  }));

  return (
    <div className="dashboard-layout">
      <Sidebar role="DOCTOR" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Clinical Notes" subtitle="Manage your post-visit documentation" />
        <main className="page-content">
          <NotesHistoryClient doctorAppointments={serializedAppointments} />
        </main>
      </div>
    </div>
  );
}
