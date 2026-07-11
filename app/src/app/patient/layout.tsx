import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patient Dashboard | MedCare',
  description: 'View your upcoming appointments, find doctors, and manage your healthcare journey with MedCare.',
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
