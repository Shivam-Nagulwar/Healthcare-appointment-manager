'use client';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  UsersIcon, CalendarIcon, TrendingUpIcon, ActivityIcon,
  StethoscopeIcon, ChevronRightIcon, PlusIcon, EditIcon,
  EyeIcon, TrashIcon, SearchIcon, StarFilledIcon,
  AlertTriangleIcon, CheckIcon, ClockIcon,
} from '@/components/Icons';
import { mockAdminUser, mockDoctors, mockAppointments, mockDoctorLeaves } from '@/lib/mockData';
import Link from 'next/link';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function AdminDashboard() {
  const user = mockAdminUser;
  const totalDoctors = mockDoctors.length;
  const totalAppointments = mockAppointments.length;
  const todayAppointments = mockAppointments.filter(a => {
    const d = new Date(a.slotStart);
    return d.toDateString() === new Date().toDateString();
  }).length;
  const activeLeaves = mockDoctorLeaves.length;
  const completedAppointments = mockAppointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledAppointments = mockAppointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="ADMIN" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Admin Dashboard" subtitle="Clinic management overview" />
        <main className="page-content">
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="stat-card animate-fade-in-up stagger-1">
              <div className="stat-card-icon primary">
                <StethoscopeIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Doctors</div>
                <div className="stat-card-value">{totalDoctors}</div>
                <div className="stat-card-change positive">
                  <TrendingUpIcon size={12} /> All active
                </div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-2">
              <div className="stat-card-icon success">
                <CalendarIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Today&apos;s Appointments</div>
                <div className="stat-card-value">{todayAppointments}</div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-3">
              <div className="stat-card-icon warning">
                <ActivityIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Total Appointments</div>
                <div className="stat-card-value">{totalAppointments}</div>
              </div>
            </div>
            <div className="stat-card animate-fade-in-up stagger-4">
              <div className="stat-card-icon accent">
                <AlertTriangleIcon />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Active Leaves</div>
                <div className="stat-card-value">{activeLeaves}</div>
              </div>
            </div>
          </div>

          <div className={styles.mainGrid}>
            {/* Doctors Table */}
            <div className={styles.tableSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <StethoscopeIcon size={20} />
                  Doctors
                </h2>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Link href="/admin/doctors" className="btn btn-ghost btn-sm">
                    View All <ChevronRightIcon size={14} />
                  </Link>
                  <Link href="/admin/doctors" className="btn btn-primary btn-sm">
                    <PlusIcon size={14} /> Add Doctor
                  </Link>
                </div>
              </div>

              <div className="data-table-wrapper animate-fade-in-up">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Rating</th>
                      <th>Experience</th>
                      <th>Slot Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDoctors.map((doc, idx) => {
                      const hasLeave = mockDoctorLeaves.some(l => l.doctorId === doc.id);
                      return (
                        <tr key={doc.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              <div className="avatar avatar-sm avatar-primary">
                                {getInitials(doc.name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{doc.name}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{doc.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-primary">{doc.specialization}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <StarFilledIcon size={12} style={{ color: 'var(--accent-500)' }} />
                              <span style={{ fontWeight: 600 }}>{doc.rating}</span>
                              <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>({doc.totalReviews})</span>
                            </div>
                          </td>
                          <td>{doc.experience} yrs</td>
                          <td>{doc.slotDurationMin} min</td>
                          <td>
                            {hasLeave ? (
                              <span className="badge badge-warning">On Leave</span>
                            ) : (
                              <span className="badge badge-success">Active</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                              <Link href="/admin/doctors" className="btn btn-ghost btn-icon btn-sm" title="View">
                                <EyeIcon size={14} />
                              </Link>
                              <Link href="/admin/doctors" className="btn btn-ghost btn-icon btn-sm" title="Edit">
                                <EditIcon size={14} />
                              </Link>
                              <Link href="/admin/doctors" className="btn btn-ghost btn-icon btn-sm" title="Delete" style={{ color: 'var(--danger-500)' }}>
                                <TrashIcon size={14} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightCol}>
              {/* Appointment Breakdown */}
              <div className="card animate-fade-in-up">
                <h3 className={styles.cardTitle}>Appointment Breakdown</h3>
                <div className={styles.breakdownList}>
                  <div className={styles.breakdownItem}>
                    <div className={styles.breakdownLabel}>
                      <span className={styles.breakdownDot} style={{ background: 'var(--primary-500)' }} />
                      Booked
                    </div>
                    <span className={styles.breakdownValue}>{mockAppointments.filter(a => a.status === 'BOOKED').length}</span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <div className={styles.breakdownLabel}>
                      <span className={styles.breakdownDot} style={{ background: 'var(--success-500)' }} />
                      Completed
                    </div>
                    <span className={styles.breakdownValue}>{completedAppointments}</span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <div className={styles.breakdownLabel}>
                      <span className={styles.breakdownDot} style={{ background: 'var(--danger-500)' }} />
                      Cancelled
                    </div>
                    <span className={styles.breakdownValue}>{cancelledAppointments}</span>
                  </div>
                </div>

                {/* Visual bar */}
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressSegment}
                    style={{
                      width: `${(mockAppointments.filter(a => a.status === 'BOOKED').length / totalAppointments) * 100}%`,
                      background: 'var(--primary-500)',
                      borderRadius: 'var(--radius-full) 0 0 var(--radius-full)',
                    }}
                  />
                  <div
                    className={styles.progressSegment}
                    style={{
                      width: `${(completedAppointments / totalAppointments) * 100}%`,
                      background: 'var(--success-500)',
                    }}
                  />
                  <div
                    className={styles.progressSegment}
                    style={{
                      width: `${(cancelledAppointments / totalAppointments) * 100}%`,
                      background: 'var(--danger-500)',
                      borderRadius: '0 var(--radius-full) var(--radius-full) 0',
                    }}
                  />
                </div>
              </div>

              {/* Upcoming Leaves */}
              <div className="card animate-fade-in-up" style={{ marginTop: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>Upcoming Leaves</h3>
                  <Link href="/admin/leaves" className="btn btn-ghost btn-sm">
                    Manage <ChevronRightIcon size={14} />
                  </Link>
                </div>
                <div className={styles.leaveList}>
                  {mockDoctorLeaves.map(leave => (
                    <div key={leave.id} className={styles.leaveItem}>
                      <div className="avatar avatar-sm avatar-accent">
                        {getInitials(leave.doctorName)}
                      </div>
                      <div className={styles.leaveInfo}>
                        <span className={styles.leaveName}>{leave.doctorName}</span>
                        <span className={styles.leaveDate}>
                          {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                      </div>
                      <span className="badge badge-warning">{leave.reason || 'Personal'}</span>
                    </div>
                  ))}
                  {mockDoctorLeaves.length === 0 && (
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No upcoming leaves</p>
                  )}
                </div>
              </div>

              {/* System Health */}
              <div className={`${styles.systemHealth} card animate-fade-in-up`} style={{ marginTop: 'var(--space-6)' }}>
                <h3 className={styles.cardTitle}>System Status</h3>
                <div className={styles.healthList}>
                  <div className={styles.healthItem}>
                    <CheckIcon size={14} style={{ color: 'var(--success-500)' }} />
                    <span>Database connected</span>
                  </div>
                  <div className={styles.healthItem}>
                    <CheckIcon size={14} style={{ color: 'var(--success-500)' }} />
                    <span>Email service active</span>
                  </div>
                  <div className={styles.healthItem}>
                    <CheckIcon size={14} style={{ color: 'var(--success-500)' }} />
                    <span>AI service (Gemini) online</span>
                  </div>
                  <div className={styles.healthItem}>
                    <CheckIcon size={14} style={{ color: 'var(--success-500)' }} />
                    <span>Background worker running</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
