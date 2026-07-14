import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import LeavesClient from './LeavesClient';

export default async function AdminLeavesPage() {
  const user = await requireAuth(Role.ADMIN);

  const [leaves, doctors] = await Promise.all([
    prisma.doctorLeave.findMany({
      include: { doctor: { include: { user: true } } },
      orderBy: { startDate: 'asc' }
    }),
    prisma.doctorProfile.findMany({
      include: { user: true },
      orderBy: { user: { name: 'asc' } }
    })
  ]);

  return (
    <div className="dashboard-layout">
      <Sidebar role="ADMIN" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Leave Management" subtitle="Manage doctor leaves and unavailabilities" />
        <main className="page-content">
          <LeavesClient leaves={leaves} doctors={doctors} />
        </main>
      </div>
    </div>
  );
}
