'use client';

import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, ClockIcon, ChevronLeftIcon, SparklesIcon,
  AlertTriangleIcon, FileTextIcon, CheckIcon, ActivityIcon,
  UserIcon, HeartIcon, EyeIcon,
} from '@/components/Icons';
import { mockDoctorUser, mockAppointments, mockDoctors } from '@/lib/mockData';
import Link from 'next/link';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function getStatusConfig(status: string) {
  const map: Record<string, { className: string; label: string; color: string }> = {
    BOOKED: { className: 'badge-primary', label: 'Scheduled', color: 'var(--primary-500)' },
    COMPLETED: { className: 'badge-success', label: 'Completed', color: 'var(--success-500)' },
    CANCELLED: { className: 'badge-danger', label: 'Cancelled', color: 'var(--danger-500)' },
    HELD: { className: 'badge-warning', label: 'On Hold', color: 'var(--warning-500)' },
  };
  return map[status] || { className: 'badge-neutral', label: status, color: 'var(--slate-400)' };
}

function getUrgencyConfig(level: string) {
  const map: Record<string, { className: string; color: string; label: string; bg: string }> = {
    LOW: { className: 'badge-success', color: 'var(--success-500)', label: 'Low Urgency', bg: 'var(--success-50)' },
    MEDIUM: { className: 'badge-warning', color: 'var(--warning-500)', label: 'Medium Urgency', bg: 'var(--warning-50)' },
    HIGH: { className: 'badge-danger', color: 'var(--danger-500)', label: 'High Urgency', bg: 'var(--danger-50)' },
  };
  return map[level] || { className: 'badge-neutral', color: 'var(--slate-400)', label: level, bg: 'var(--slate-50)' };
}

export default function DoctorAppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const appointment = mockAppointments.find(a => a.id === appointmentId);

  if (!appointment) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="DOCTOR" userName={mockDoctorUser.name} userEmail={mockDoctorUser.email} />
        <div className="main-content">
          <Navbar title="Appointment Details" />
          <main className="page-content">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">Appointment not found</h3>
              <p className="empty-state-text">The appointment you&apos;re looking for doesn&apos;t exist.</p>
              <button className="btn btn-primary" onClick={() => router.push('/doctor/appointments')}>
                Back to Appointments
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const preVisit = appointment.preVisitSummary;
  const postVisit = appointment.postVisitNote;
  const statusConfig = getStatusConfig(appointment.status);

  return (
    <div className="dashboard-layout">
      <Sidebar role="DOCTOR" userName={mockDoctorUser.name} userEmail={mockDoctorUser.email} />
      <div className="main-content">
        <Navbar title="Appointment Details" subtitle={`${appointment.patientName} — ${appointment.doctorSpecialization}`} />
        <main className="page-content">
          <button
            className="btn btn-ghost"
            onClick={() => router.push('/doctor/appointments')}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <ChevronLeftIcon size={16} /> Back to Appointments
          </button>

          <div className={styles.detailLayout}>
            {/* Main Column */}
            <div className={styles.mainCol}>
              {/* Status Header */}
              <div className={`card ${styles.statusCard}`}>
                <div className={styles.statusHeader}>
                  <div className={styles.patientRow}>
                    <div className="avatar avatar-lg avatar-accent">
                      {getInitials(appointment.patientName)}
                    </div>
                    <div>
                      <h2 className={styles.patientName}>{appointment.patientName}</h2>
                      <p className={styles.patientId}>Patient ID: {appointment.patientId}</p>
                    </div>
                  </div>
                  <span className={`badge ${statusConfig.className}`} style={{ fontSize: 'var(--text-sm)' }}>
                    {statusConfig.label}
                  </span>
                </div>
                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <CalendarIcon size={16} />
                    <div>
                      <span className={styles.metaLabel}>Date</span>
                      <span className={styles.metaValue}>{formatDate(appointment.slotStart)}</span>
                    </div>
                  </div>
                  <div className={styles.metaItem}>
                    <ClockIcon size={16} />
                    <div>
                      <span className={styles.metaLabel}>Time</span>
                      <span className={styles.metaValue}>{formatTime(appointment.slotStart)} — {formatTime(appointment.slotEnd)}</span>
                    </div>
                  </div>
                  <div className={styles.metaItem}>
                    <UserIcon size={16} />
                    <div>
                      <span className={styles.metaLabel}>Doctor</span>
                      <span className={styles.metaValue}>{appointment.doctorName}</span>
                    </div>
                  </div>
                  <div className={styles.metaItem}>
                    <HeartIcon size={16} />
                    <div>
                      <span className={styles.metaLabel}>Specialty</span>
                      <span className={styles.metaValue}>{appointment.doctorSpecialization}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className={styles.actionRow}>
                  {appointment.status === 'BOOKED' && (
                    <Link href={`/doctor/appointments/${appointment.id}/notes`} className="btn btn-primary">
                      <FileTextIcon size={16} /> Add Post-Visit Notes
                    </Link>
                  )}
                  {appointment.status === 'COMPLETED' && !postVisit && (
                    <Link href={`/doctor/appointments/${appointment.id}/notes`} className="btn btn-primary">
                      <FileTextIcon size={16} /> Write Notes
                    </Link>
                  )}
                  {appointment.status === 'COMPLETED' && postVisit && (
                    <Link href={`/doctor/appointments/${appointment.id}/notes`} className="btn btn-secondary">
                      <EyeIcon size={16} /> View / Edit Notes
                    </Link>
                  )}
                </div>
              </div>

              {/* AI Pre-Visit Summary */}
              {preVisit && preVisit.llmStatus === 'OK' && (
                <div className={`card ${styles.aiCard}`}>
                  <div className={styles.aiHeader}>
                    <SparklesIcon size={20} style={{ color: 'var(--primary-500)' }} />
                    <h3>AI Pre-Visit Summary</h3>
                    <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>Gemini</span>
                  </div>

                  {preVisit.urgencyLevel && (
                    <div
                      className={styles.urgencyBanner}
                      style={{ borderColor: getUrgencyConfig(preVisit.urgencyLevel).color }}
                    >
                      <AlertTriangleIcon size={18} style={{ color: getUrgencyConfig(preVisit.urgencyLevel).color }} />
                      <div>
                        <span className={styles.urgencyLabel}>{getUrgencyConfig(preVisit.urgencyLevel).label}</span>
                        <p className={styles.urgencyDesc}>
                          {preVisit.urgencyLevel === 'HIGH'
                            ? 'This patient has symptoms that may require immediate attention.'
                            : preVisit.urgencyLevel === 'MEDIUM'
                            ? 'This patient has symptoms that need timely evaluation.'
                            : 'This patient\'s symptoms are routine and non-urgent.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={styles.aiSections}>
                    {preVisit.chiefComplaint && (
                      <div className={styles.aiSection}>
                        <h4>Chief Complaint</h4>
                        <p>{preVisit.chiefComplaint}</p>
                      </div>
                    )}

                    {preVisit.differentialDiagnosis && preVisit.differentialDiagnosis.length > 0 && (
                      <div className={styles.aiSection}>
                        <h4>Differential Diagnosis</h4>
                        <ul className={styles.diagnosisList}>
                          {preVisit.differentialDiagnosis.map((d, i) => (
                            <li key={i}>
                              <ActivityIcon size={14} />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {preVisit.redFlags && preVisit.redFlags.length > 0 && (
                      <div className={styles.aiSection}>
                        <h4 className={styles.redFlagTitle}>⚠️ Red Flags</h4>
                        <ul className={styles.redFlagList}>
                          {preVisit.redFlags.map((f, i) => (
                            <li key={i}>
                              <AlertTriangleIcon size={14} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {preVisit.suggestedQuestions && preVisit.suggestedQuestions.length > 0 && (
                      <div className={styles.aiSection}>
                        <h4>Suggested Questions</h4>
                        <ol className={styles.questionList}>
                          {preVisit.suggestedQuestions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Post-Visit Notes (if completed) */}
              {postVisit && postVisit.llmStatus === 'OK' && (
                <div className={`card ${styles.notesCard}`}>
                  <div className={styles.notesHeader}>
                    <FileTextIcon size={20} style={{ color: 'var(--success-500)' }} />
                    <h3>Post-Visit Notes</h3>
                    <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Completed</span>
                  </div>

                  <div className={styles.aiSection}>
                    <h4>Clinical Notes</h4>
                    <p className={styles.clinicalNotes}>{postVisit.clinicalNotes}</p>
                  </div>

                  {postVisit.prescription.length > 0 && (
                    <div className={styles.aiSection}>
                      <h4>Prescriptions</h4>
                      <div className={styles.rxGrid}>
                        {postVisit.prescription.map((rx, i) => (
                          <div key={i} className={styles.rxCard}>
                            <span className={styles.rxPill}>💊</span>
                            <div className={styles.rxInfo}>
                              <strong>{rx.medication}</strong>
                              <span>{rx.dosage} — {rx.frequency}</span>
                              <span className={styles.rxDuration}>{rx.durationDays} days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {postVisit.patientSummary && (
                    <div className={styles.aiSection}>
                      <h4>
                        <SparklesIcon size={14} style={{ color: 'var(--primary-500)' }} /> AI Patient Summary
                      </h4>
                      <div className={styles.patientSummary}>
                        <p>{postVisit.patientSummary}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Side Column */}
            <div className={styles.sideCol}>
              {/* Patient's Raw Symptoms */}
              {preVisit && (
                <div className={`card ${styles.rawSymptomsCard}`}>
                  <h3 className={styles.sideTitle}>
                    <UserIcon size={16} /> Patient&apos;s Own Words
                  </h3>
                  <blockquote className={styles.symptomsQuote}>
                    &ldquo;{preVisit.rawSymptoms}&rdquo;
                  </blockquote>
                </div>
              )}

              {/* Quick Actions */}
              <div className={`card ${styles.quickActionsCard}`}>
                <h3 className={styles.sideTitle}>Quick Actions</h3>
                <div className={styles.quickActions}>
                  <Link href={`/doctor/appointments/${appointment.id}/notes`} className={styles.quickAction}>
                    <FileTextIcon size={18} />
                    <span>{postVisit ? 'Edit Notes' : 'Add Notes'}</span>
                  </Link>
                  <button className={styles.quickAction}>
                    <CalendarIcon size={18} />
                    <span>Reschedule</span>
                  </button>
                  {appointment.status === 'BOOKED' && (
                    <button className={`${styles.quickAction} ${styles.quickActionDanger}`}>
                      <AlertTriangleIcon size={18} />
                      <span>Cancel Appointment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Appointment Info */}
              <div className={`card ${styles.infoCard}`}>
                <h3 className={styles.sideTitle}>Appointment Info</h3>
                <div className={styles.infoList}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>ID</span>
                    <span className={styles.infoValueMono}>{appointment.id}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Created</span>
                    <span className={styles.infoValue}>{new Date(appointment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Status</span>
                    <span className={`badge ${statusConfig.className}`}>{statusConfig.label}</span>
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
