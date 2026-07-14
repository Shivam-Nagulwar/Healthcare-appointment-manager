import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, ClockIcon, UsersIcon, ChevronRightIcon,
  SparklesIcon, ActivityIcon, TrendingUpIcon, AlertTriangleIcon,
  FileTextIcon, CheckIcon, EyeIcon,
} from '@/components/Icons';
import Link from 'next/link';
import styles from './page.module.css';
import { notFound } from 'next/navigation';

function getStatusBadge(status: string) {
  const map: Record<string, { className: string; label: string }> = {
    BOOKED: { className: 'badge-primary', label: 'Scheduled' },
    COMPLETED: { className: 'badge-success', label: 'Completed' },
    CANCELLED: { className: 'badge-danger', label: 'Cancelled' },
    HELD: { className: 'badge-warning', label: 'Held' },
  };
  const { className, label } = map[status] || { className: 'badge-neutral', label: status };
  return <span className={`badge ${className}`}>{label}</span>;
}

function getUrgencyIndicator(level: string | null | undefined) {
  if (!level) return null;
  const colors: Record<string, string> = {
    LOW: 'var(--success-500)',
    MEDIUM: 'var(--warning-500)',
    HIGH: 'var(--danger-500)',
  };
  return (
    <span className={styles.urgencyDot} style={{ background: colors[level] || 'var(--slate-400)' }} title={`${level} urgency`} />
  );
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default async function DoctorDashboard() {
  const user = await requireAuth(Role.DOCTOR);
  
  const dbDoctor = await prisma.doctorProfile.findFirst({
    where: { userId: user.id },
    include: { user: true }
  });

  if (!dbDoctor) notFound();

  const doctorAppointments = await prisma.appointment.findMany({
    where: { doctorId: dbDoctor.id },
    include: {
      patient: { include: { user: true } },
      preVisitSummary: true,
    }
  });

  const today = new Date();
  
  const todayAppointments = doctorAppointments
    .filter(a => {
      const d = new Date(a.slotStart);
      return d.toDateString() === today.toDateString() && (a.status === 'BOOKED' || a.status === 'COMPLETED');
    })
    .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());

  const upcomingAppointments = doctorAppointments
    .filter(a => {
      const d = new Date(a.slotStart);
      return d > today && a.status === 'BOOKED';
    })
    .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());

  const completedToday = todayAppointments.filter(a => a.status === 'COMPLETED').length;
  const pendingToday = todayAppointments.filter(a => a.status === 'BOOKED').length;
  const urgentCount = doctorAppointments.filter(a => a.preVisitSummary?.urgencyLevel === 'HIGH' && a.status === 'BOOKED').length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="DOCTOR" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title={`Welcome back, ${user.name.replace('Dr. ', '')}!`} subtitle="Here's your schedule for today" />
        <main className="page-content">
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="stat-card animate-fade-in-up stagger-1">
              <div className="stat-card-icon primary">
                <CalendarIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Today&apos;s Appointments</div>
                <div className="stat-card-value">{todayAppointments.length}</div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-2">
              <div className="stat-card-icon success">
                <CheckIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Completed</div>
                <div className="stat-card-value">{completedToday}</div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-3">
              <div className="stat-card-icon warning">
                <ClockIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Pending</div>
                <div className="stat-card-value">{pendingToday}</div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-4">
              <div className="stat-card-icon accent">
                <AlertTriangleIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Urgent Cases</div>
                <div className="stat-card-value" style={{ color: urgentCount > 0 ? 'var(--danger-500)' : undefined }}>{urgentCount}</div>
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            {/* Today's Schedule */}
            <div className={styles.scheduleSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <CalendarIcon size={20} />
                  Today&apos;s Schedule
                </h2>
                <Link href="/doctor/appointments" className="btn btn-ghost btn-sm">
                  View All <ChevronRightIcon size={14} />
                </Link>
              </div>

              <div className={styles.timeline}>
                {todayAppointments.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>🎉</div>
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No appointments today</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Enjoy your free day!</p>
                  </div>
                ) : (
                  todayAppointments.map((apt, idx) => (
                    <div key={apt.id} className={`${styles.timelineItem} animate-fade-in-up`} style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className={styles.timelineTime}>
                        <span className={styles.timeLabel}>{formatTime(apt.slotStart)}</span>
                        <div className={`${styles.timelineDot} ${apt.status === 'COMPLETED' ? styles.dotCompleted : styles.dotPending}`} />
                        {idx < todayAppointments.length - 1 && <div className={styles.timelineLine} />}
                      </div>
                      <div className={`card ${styles.timelineCard}`}>
                        <div className={styles.timelineCardHeader}>
                          <div className={styles.patientInfo}>
                            <div className="avatar avatar-sm avatar-accent">
                              {getInitials(apt.patient.user.name)}
                            </div>
                            <div>
                              <span className={styles.patientName}>{apt.patient.user.name}</span>
                              <span className={styles.timeRange}>{formatTime(apt.slotStart)} — {formatTime(apt.slotEnd)}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            {getUrgencyIndicator(apt.preVisitSummary?.urgencyLevel)}
                            {getStatusBadge(apt.status)}
                          </div>
                        </div>

                        {apt.preVisitSummary && apt.preVisitSummary.llmStatus === 'OK' && (
                          <div className={styles.aiInsight}>
                            <SparklesIcon size={14} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
                            <div>
                              <span className={styles.aiLabel}>Chief Complaint:</span>
                              <span className={styles.aiValue}>{apt.preVisitSummary.chiefComplaint}</span>
                            </div>
                          </div>
                        )}

                        <div className={styles.timelineActions}>
                          {apt.status === 'BOOKED' && (
                            <>
                              <Link href={`/doctor/appointments/${apt.id}`} className="btn btn-primary btn-sm">
                                <EyeIcon size={14} /> View Details
                              </Link>
                              <Link href={`/doctor/appointments/${apt.id}/notes`} className="btn btn-secondary btn-sm">
                                <FileTextIcon size={14} /> Add Notes
                              </Link>
                            </>
                          )}
                          {apt.status === 'COMPLETED' && (
                            <Link href={`/doctor/appointments/${apt.id}`} className="btn btn-ghost btn-sm">
                              <EyeIcon size={14} /> Review
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightCol}>
              {/* Google Calendar Integration */}
              <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-6)', borderLeft: dbDoctor.googleRefreshToken ? '4px solid var(--success-500)' : '4px solid var(--warning-500)' }}>
                <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CalendarIcon size={18} /> Google Calendar
                </h3>
                {dbDoctor.googleRefreshToken ? (
                  <div>
                    <p style={{ color: 'var(--success-600)', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>✓ Connected</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Appointments are syncing to your Google Calendar.</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Connect your calendar to automatically sync appointments.</p>
                    <a href="/api/auth/google/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Connect Calendar
                    </a>
                  </div>
                )}
              </div>

              {/* Upcoming */}
              <div className="card animate-fade-in-up">
                <h3 className={styles.cardTitle}>Upcoming Appointments</h3>
                {upcomingAppointments.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No upcoming appointments</p>
                ) : (
                  <div className={styles.upcomingList}>
                    {upcomingAppointments.slice(0, 5).map(apt => (
                      <div key={apt.id} className={styles.upcomingItem}>
                        <div className="avatar avatar-sm avatar-accent">
                          {getInitials(apt.patient.user.name)}
                        </div>
                        <div className={styles.upcomingInfo}>
                          <span className={styles.upcomingName}>{apt.patient.user.name}</span>
                          <span className={styles.upcomingDate}>
                            {new Date(apt.slotStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {formatTime(apt.slotStart)}
                          </span>
                        </div>
                        {getUrgencyIndicator(apt.preVisitSummary?.urgencyLevel)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className={`${styles.quickStatsCard} card animate-fade-in-up`} style={{ marginTop: 'var(--space-6)' }}>
                <h3 className={styles.cardTitle}>This Week</h3>
                <div className={styles.quickStats}>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatValue}>{doctorAppointments.filter(a => a.status === 'BOOKED').length}</span>
                    <span className={styles.quickStatLabel}>Total Booked</span>
                  </div>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatValue}>{doctorAppointments.filter(a => a.status === 'COMPLETED').length}</span>
                    <span className={styles.quickStatLabel}>Completed</span>
                  </div>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatValue}>{doctorAppointments.filter(a => a.preVisitSummary?.llmStatus === 'OK').length}</span>
                    <span className={styles.quickStatLabel}>AI Summaries</span>
                  </div>
                </div>
              </div>

              {/* AI Notice */}
              <div className={`${styles.aiNotice} animate-fade-in-up`} style={{ marginTop: 'var(--space-6)' }}>
                <SparklesIcon size={18} style={{ color: 'var(--primary-500)' }} />
                <div>
                  <h4>AI Pre-Visit Summaries</h4>
                  <p>Review AI-generated summaries before each appointment for a quick patient overview.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
