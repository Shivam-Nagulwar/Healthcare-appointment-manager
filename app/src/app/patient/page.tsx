'use client';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, ClockIcon, SearchIcon, ChevronRightIcon,
  StarFilledIcon, MapPinIcon, SparklesIcon, ActivityIcon,
  TrendingUpIcon, HeartIcon, AlertTriangleIcon,
} from '@/components/Icons';
import { mockCurrentUser, mockAppointments, mockDoctors } from '@/lib/mockData';
import type { Appointment } from '@/lib/mockData';
import Link from 'next/link';
import styles from './page.module.css';

function getStatusBadge(status: string) {
  const map: Record<string, { className: string; label: string }> = {
    BOOKED: { className: 'badge-primary', label: 'Upcoming' },
    COMPLETED: { className: 'badge-success', label: 'Completed' },
    CANCELLED: { className: 'badge-danger', label: 'Cancelled' },
    HELD: { className: 'badge-warning', label: 'Held' },
  };
  const { className, label } = map[status] || { className: 'badge-neutral', label: status };
  return <span className={`badge ${className}`}>{label}</span>;
}

function getUrgencyBadge(level: string | null | undefined) {
  if (!level) return null;
  const map: Record<string, { className: string }> = {
    LOW: { className: 'badge-success' },
    MEDIUM: { className: 'badge-warning' },
    HIGH: { className: 'badge-danger' },
  };
  const { className } = map[level] || { className: 'badge-neutral' };
  return <span className={`badge ${className}`}>{level}</span>;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getRelativeDay(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return formatDate(iso);
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function PatientDashboard() {
  const user = mockCurrentUser;
  const patientAppointments = mockAppointments.filter(a => a.patientName === user.name);
  const upcoming = patientAppointments
    .filter(a => a.status === 'BOOKED')
    .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
  const past = patientAppointments
    .filter(a => a.status === 'COMPLETED')
    .sort((a, b) => new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime());

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title={`${greeting()}, ${user.name.split(' ')[0]}! 👋`} subtitle="Here's your health overview" />
        <main className="page-content">
          {/* Stats Row */}
          <div className={`grid-4 ${styles.statsRow}`}>
            <div className="stat-card animate-fade-in-up stagger-1">
              <div className="stat-card-icon primary">
                <CalendarIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Upcoming Appointments</div>
                <div className="stat-card-value">{upcoming.length}</div>
                <div className="stat-card-change positive">
                  <TrendingUpIcon size={12} /> Next: {upcoming[0] ? getRelativeDay(upcoming[0].slotStart) : 'None'}
                </div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-2">
              <div className="stat-card-icon success">
                <ActivityIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Completed Visits</div>
                <div className="stat-card-value">{past.length}</div>
                <div className="stat-card-change positive">
                  <TrendingUpIcon size={12} /> All records available
                </div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-3">
              <div className="stat-card-icon warning">
                <HeartIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Active Prescriptions</div>
                <div className="stat-card-value">2</div>
                <div className="stat-card-change positive">
                  <ClockIcon size={12} /> On track
                </div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-4">
              <div className="stat-card-icon accent">
                <SparklesIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">AI Summaries</div>
                <div className="stat-card-value">{patientAppointments.filter(a => a.preVisitSummary?.llmStatus === 'OK').length}</div>
                <div className="stat-card-change positive">
                  <SparklesIcon size={12} /> Powered by Gemini
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className={styles.mainGrid}>
            {/* Left Column — Upcoming Appointments */}
            <div className={styles.leftColumn}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <CalendarIcon size={20} />
                  Upcoming Appointments
                </h2>
                <Link href="/patient/appointments" className="btn btn-ghost btn-sm">
                  View All <ChevronRightIcon size={14} />
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📅</div>
                  <h3 style={{ marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>No upcoming appointments</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>Book an appointment with a doctor to get started.</p>
                  <Link href="/patient/doctors" className="btn btn-primary">
                    <SearchIcon size={16} /> Find a Doctor
                  </Link>
                </div>
              ) : (
                <div className={styles.appointmentsList}>
                  {upcoming.map((apt, idx) => (
                    <AppointmentCard key={apt.id} appointment={apt} index={idx} />
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className={styles.sectionHeader} style={{ marginTop: 'var(--space-8)' }}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
              </div>
              <div className={styles.quickActions}>
                <Link href="/patient/doctors" className={`card card-interactive ${styles.quickActionCard}`}>
                  <div className={styles.quickActionIcon} style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                    <SearchIcon size={24} />
                  </div>
                  <h3>Find a Doctor</h3>
                  <p>Search by specialty and book</p>
                </Link>
                <Link href="/patient/appointments" className={`card card-interactive ${styles.quickActionCard}`}>
                  <div className={styles.quickActionIcon} style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                    <CalendarIcon size={24} />
                  </div>
                  <h3>My Appointments</h3>
                  <p>View and manage bookings</p>
                </Link>
                <Link href="/patient/records" className={`card card-interactive ${styles.quickActionCard}`}>
                  <div className={styles.quickActionIcon} style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
                    <SparklesIcon size={24} />
                  </div>
                  <h3>AI Health Insights</h3>
                  <p>View your AI summaries</p>
                </Link>
              </div>
            </div>

            {/* Right Column — Sidebar Info */}
            <div className={styles.rightColumn}>
              {/* Recent Activity */}
              <div className="card animate-fade-in-up">
                <h3 className={styles.cardTitle}>Recent Activity</h3>
                <div className={styles.activityList}>
                  {past.slice(0, 3).map((apt) => (
                    <div key={apt.id} className={styles.activityItem}>
                      <div className={styles.activityDot} />
                      <div className={styles.activityContent}>
                        <p className={styles.activityText}>
                          Visit with <strong>{apt.doctorName}</strong>
                        </p>
                        <span className={styles.activityTime}>{formatDate(apt.slotStart)}</span>
                        {apt.postVisitNote && (
                          <span className="badge badge-success" style={{ marginLeft: 'var(--space-2)' }}>
                            Summary Available
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {past.length === 0 && (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No recent activity</p>
                  )}
                </div>
              </div>

              {/* Top Doctors */}
              <div className="card animate-fade-in-up" style={{ marginTop: 'var(--space-6)' }}>
                <h3 className={styles.cardTitle}>Recommended Doctors</h3>
                <div className={styles.doctorsList}>
                  {mockDoctors.slice(0, 3).map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/patient/doctors/${doc.id}`}
                      className={styles.doctorMini}
                    >
                      <div className="avatar avatar-sm avatar-primary">
                        {getInitials(doc.name)}
                      </div>
                      <div className={styles.doctorMiniInfo}>
                        <span className={styles.doctorMiniName}>{doc.name}</span>
                        <span className={styles.doctorMiniSpec}>{doc.specialization}</span>
                      </div>
                      <div className={styles.doctorMiniRating}>
                        <StarFilledIcon size={12} style={{ color: 'var(--accent-500)' }} />
                        <span>{doc.rating}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/patient/doctors" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                  View All Doctors
                </Link>
              </div>

              {/* Health Tip */}
              <div className={`${styles.healthTip} animate-fade-in-up`} style={{ marginTop: 'var(--space-6)' }}>
                <div className={styles.healthTipIcon}>💡</div>
                <h4>Health Tip</h4>
                <p>Regular check-ups can catch health issues early. Schedule a preventive visit with your general physician every 6 months.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, index }: { appointment: Appointment; index: number }) {
  const isUrgent = appointment.preVisitSummary?.urgencyLevel === 'HIGH';

  return (
    <div
      className={`card card-interactive animate-fade-in-up ${styles.appointmentCard} ${isUrgent ? styles.urgentBorder : ''}`}
      style={{ animationDelay: `${(index + 1) * 80}ms` }}
    >
      <div className={styles.appointmentHeader}>
        <div className={styles.appointmentDoctor}>
          <div className="avatar avatar-primary">
            {getInitials(appointment.doctorName)}
          </div>
          <div>
            <h3 className={styles.appointmentDoctorName}>{appointment.doctorName}</h3>
            <p className={styles.appointmentSpec}>{appointment.doctorSpecialization}</p>
          </div>
        </div>
        <div className={styles.appointmentStatus}>
          {getStatusBadge(appointment.status)}
          {isUrgent && (
            <span className="badge badge-danger" style={{ marginLeft: 'var(--space-1)' }}>
              <AlertTriangleIcon size={10} /> Urgent
            </span>
          )}
        </div>
      </div>

      <div className={styles.appointmentDetails}>
        <div className={styles.appointmentDetailItem}>
          <CalendarIcon size={14} />
          <span>{getRelativeDay(appointment.slotStart)}</span>
        </div>
        <div className={styles.appointmentDetailItem}>
          <ClockIcon size={14} />
          <span>{formatTime(appointment.slotStart)} - {formatTime(appointment.slotEnd)}</span>
        </div>
        {appointment.preVisitSummary?.chiefComplaint && (
          <div className={styles.appointmentDetailItem}>
            <SparklesIcon size={14} />
            <span className={styles.chiefComplaint}>{appointment.preVisitSummary.chiefComplaint}</span>
          </div>
        )}
      </div>

      {/* AI Summary Preview */}
      {appointment.preVisitSummary && appointment.preVisitSummary.llmStatus === 'OK' && (
        <div className={styles.aiPreview}>
          <div className={styles.aiPreviewHeader}>
            <SparklesIcon size={14} style={{ color: 'var(--primary-500)' }} />
            <span>AI Pre-Visit Summary</span>
            {getUrgencyBadge(appointment.preVisitSummary.urgencyLevel)}
          </div>
          {appointment.preVisitSummary.suggestedQuestions && (
            <div className={styles.suggestedQuestions}>
              <p className={styles.sqLabel}>Suggested questions:</p>
              <ul>
                {appointment.preVisitSummary.suggestedQuestions.slice(0, 2).map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className={styles.appointmentActions}>
        <Link href={`/patient/appointments/${appointment.id}`} className="btn btn-secondary btn-sm">
          View Details
        </Link>
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-500)' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}


