import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DoctorsClient from './DoctorsClient';

export default async function AdminDoctorsPage() {
  const user = await requireAuth(Role.ADMIN);

  const doctors = await prisma.doctorProfile.findMany({
    include: {
      user: true
    },
    orderBy: { user: { name: 'asc' } }
  });

  return (
    <div className="dashboard-layout">
      <Sidebar role="ADMIN" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Manage Doctors" subtitle="Add, edit, or remove doctors from the platform" />
        <main className="page-content">
          <DoctorsClient initialDoctors={doctors} />
        </main>
      </div>
    </div>
  );
}
