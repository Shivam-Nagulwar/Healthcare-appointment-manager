import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctor Dashboard | MedCare',
  description: "View today's schedule, review AI pre-visit summaries, and manage patient appointments.",
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
