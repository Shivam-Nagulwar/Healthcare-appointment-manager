import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import AppointmentsClient from './AppointmentsClient';
import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import styles from './page.module.css';

export default async function PatientAppointmentsPage() {
  const user = await requireAuth(Role.PATIENT);

  const dbAppointments = await prisma.appointment.findMany({
    where: { patient: { userId: user.id } },
    include: {
      doctor: { include: { user: true } },
      preVisitSummary: true,
      postVisitNote: true,
    },
    orderBy: { slotStart: 'desc' },
  });

  const appointments = dbAppointments.map(a => ({
    id: a.id,
    status: a.status,
    slotStart: a.slotStart,
    slotEnd: a.slotEnd,
    doctorName: a.doctor.user.name,
    doctorSpecialization: a.doctor.specialization,
    preVisitSummary: a.preVisitSummary,
  }));

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="My Appointments" subtitle="View and manage your appointment history" />
        <main className="page-content">
          <AppointmentsClient appointments={appointments} />
        </main>
      </div>
    </div>
  );
}
