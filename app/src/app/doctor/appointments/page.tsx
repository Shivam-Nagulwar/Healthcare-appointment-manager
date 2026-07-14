import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DoctorAppointmentsClient from './DoctorAppointmentsClient';
import { notFound } from 'next/navigation';

export default async function DoctorAppointmentsPage() {
  const user = await requireAuth(Role.DOCTOR);

  const dbDoctor = await prisma.doctorProfile.findFirst({
    where: { userId: user.id },
    include: { user: true }
  });

  if (!dbDoctor) notFound();

  const doctorAppointments = await prisma.appointment.findMany({
    where: { doctorId: dbDoctor.id },
    include: {
      patient: { include: { user: true } },
      preVisitSummary: true,
      postVisitNote: true,
    },
    orderBy: { slotStart: 'desc' }
  });

  const serializedAppointments = doctorAppointments.map(a => ({
    id: a.id,
    patientName: a.patient.user.name,
    status: a.status,
    slotStart: a.slotStart,
    slotEnd: a.slotEnd,
    preVisitSummary: a.preVisitSummary,
    postVisitNote: a.postVisitNote,
  }));

  return (
    <div className="dashboard-layout">
      <Sidebar role="DOCTOR" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="My Appointments" subtitle="Manage your schedule and patients" />
        <main className="page-content">
          <DoctorAppointmentsClient doctorAppointments={serializedAppointments} />
        </main>
      </div>
    </div>
  );
}
