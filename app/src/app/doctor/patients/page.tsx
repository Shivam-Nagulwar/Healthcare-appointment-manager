import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import PatientsClient from './PatientsClient';
import { notFound } from 'next/navigation';

export default async function DoctorPatientsPage() {
  const user = await requireAuth(Role.DOCTOR);

  const dbDoctor = await prisma.doctorProfile.findFirst({
    where: { userId: user.id },
  });

  if (!dbDoctor) notFound();

  const doctorAppointments = await prisma.appointment.findMany({
    where: { doctorId: dbDoctor.id },
    include: {
      patient: { include: { user: true } },
      preVisitSummary: true
    },
    orderBy: { slotStart: 'desc' }
  });

  const patientMap = new Map<string, any>();

  for (const apt of doctorAppointments) {
    const existing = patientMap.get(apt.patientId);
    const isCompleted = apt.status === 'COMPLETED';
    const isBooked = apt.status === 'BOOKED';

    if (existing) {
      existing.totalVisits++;
      if (isCompleted) existing.completedVisits++;
      if (isBooked) existing.upcomingVisits++;
      if (isCompleted && (!existing.lastVisit || apt.slotStart > existing.lastVisit)) {
        existing.lastVisit = apt.slotStart;
        existing.lastApptId = apt.id;
      }
      if (isBooked && (!existing.nextVisit || apt.slotStart < existing.nextVisit)) {
        existing.nextVisit = apt.slotStart;
        existing.nextApptId = apt.id;
      }
      if (apt.preVisitSummary?.llmStatus === 'OK') existing.hasAiSummary = true;
      if (apt.preVisitSummary?.urgencyLevel === 'HIGH') existing.highUrgency = true;
    } else {
      patientMap.set(apt.patientId, {
        id: apt.patientId,
        name: apt.patient.user.name,
        totalVisits: 1,
        completedVisits: isCompleted ? 1 : 0,
        upcomingVisits: isBooked ? 1 : 0,
        lastVisit: isCompleted ? apt.slotStart : null,
        nextVisit: isBooked ? apt.slotStart : null,
        hasAiSummary: apt.preVisitSummary?.llmStatus === 'OK' || false,
        highUrgency: apt.preVisitSummary?.urgencyLevel === 'HIGH' || false,
        nextApptId: isBooked ? apt.id : undefined,
        lastApptId: isCompleted ? apt.id : undefined,
      });
    }
  }

  const patients = Array.from(patientMap.values());

  return (
    <div className="dashboard-layout">
      <Sidebar role="DOCTOR" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="My Patients" subtitle={`${patients.length} patients under your care`} />
        <main className="page-content">
          <PatientsClient patients={patients} />
        </main>
      </div>
    </div>
  );
}
