import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | MedCare',
  description: 'Manage doctors, configure leave calendars, and oversee clinic operations.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
