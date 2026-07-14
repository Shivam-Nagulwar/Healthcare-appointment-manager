import { requireAuth } from '@/lib/session';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import SettingsClient from './SettingsClient';
import { notFound } from 'next/navigation';

export default async function SettingsPage() {
  const sessionUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      patientProfile: true,
      doctorProfile: true,
    }
  });

  if (!user) notFound();

  return (
    <div className="dashboard-layout">
      <Sidebar role={user.role} userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Settings" subtitle="Manage your account preferences and profile" />
        <main className="page-content">
          <SettingsClient user={user} />
        </main>
      </div>
    </div>
  );
}
