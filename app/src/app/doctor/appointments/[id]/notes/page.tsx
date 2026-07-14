import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import NotesClient from './NotesClient';
import { notFound } from 'next/navigation';

export default async function DoctorNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(Role.DOCTOR);
  const resolvedParams = await params;

  const dbDoctor = await prisma.doctorProfile.findFirst({
    where: { userId: user.id },
  });

  if (!dbDoctor) notFound();

  const appointment = await prisma.appointment.findFirst({
    where: { id: resolvedParams.id, doctorId: dbDoctor.id },
    include: {
      patient: { include: { user: true } },
      preVisitSummary: true,
      postVisitNote: { include: { prescriptions: true } }
    }
  });

  if (!appointment) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="DOCTOR" userName={user.name} userEmail={user.email} />
        <div className="main-content">
          <Navbar title="Post-Visit Notes" />
          <main className="page-content">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">Appointment not found</h3>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Next.js components can take complex plain objects, but Date objects from Prisma might need serialization if we pass them to client.
  // Wait, in Next 14/15, passing Dates from Server to Client component is fine. We will just pass `appointment`.
  
  return (
    <div className="dashboard-layout">
      <Sidebar role="DOCTOR" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Post-Visit Notes" subtitle={`for ${appointment.patient.user.name}`} />
        <main className="page-content">
          <NotesClient appointment={appointment} />
        </main>
      </div>
    </div>
  );
}
