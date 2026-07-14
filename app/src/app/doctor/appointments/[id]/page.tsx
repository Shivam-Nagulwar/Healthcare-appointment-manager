import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, ClockIcon, ChevronLeftIcon, SparklesIcon,
  AlertTriangleIcon, FileTextIcon, ActivityIcon,
  UserIcon, HeartIcon, EyeIcon,
} from '@/components/Icons';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import RetryAIButton from '@/components/RetryAIButton';
import RetryPostVisitAIButton from '@/components/RetryPostVisitAIButton';
import CancelAppointmentButton from '@/components/CancelAppointmentButton';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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

export default async function DoctorAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(Role.DOCTOR);
  const resolvedParams = await params;

  const dbDoctor = await prisma.doctorProfile.findFirst({
    where: { userId: user.id },
  });

  if (!dbDoctor) notFound();

  const appointment = await prisma.appointment.findFirst({
    where: { id: resolvedParams.id, doctorId: dbDoctor.id },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { user: true } },
      preVisitSummary: true,
      postVisitNote: { include: { prescriptions: true } }
    }
  });

  if (!appointment) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="DOCTOR" userName={user.name} userEmail={user.email} />
        <div className="main-content">
          <Navbar title="Appointment Details" />
          <main className="page-content">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">Appointment not found</h3>
              <p className="empty-state-text">The appointment you&apos;re looking for doesn&apos;t exist.</p>
              <Link href="/doctor/appointments" className="btn btn-primary">
                Back to Appointments
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const preVisit = appointment.preVisitSummary;
  const postVisit = appointment.postVisitNote;
  const statusConfig = getStatusConfig(appointment.status);
  
  const patientName = appointment.patient.user.name;

  return (
    <div className="dashboard-layout">
      <Sidebar role="DOCTOR" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Appointment Details" subtitle={`${patientName} — ${appointment.doctor.specialization}`} />
        <main className="page-content">
          <Link
            href="/doctor/appointments"
            className="btn btn-ghost"
            style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}
          >
            <ChevronLeftIcon size={16} /> Back to Appointments
          </Link>

          <div className={styles.detailLayout}>
            {/* Main Column */}
            <div className={styles.mainCol}>
              {/* Status Header */}
              <div className={`card ${styles.statusCard}`}>
                <div className={styles.statusHeader}>
                  <div className={styles.patientRow}>
                    <div className="avatar avatar-lg avatar-accent">
                      {getInitials(patientName)}
                    </div>
                    <div>
                      <h2 className={styles.patientName}>{patientName}</h2>
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
                      <span className={styles.metaValue}>{appointment.doctor.user.name}</span>
                    </div>
                  </div>
                  <div className={styles.metaItem}>
                    <HeartIcon size={16} />
                    <div>
                      <span className={styles.metaLabel}>Specialty</span>
                      <span className={styles.metaValue}>{appointment.doctor.specialization}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className={styles.actionRow}>
                  {appointment.status === 'BOOKED' && (
                    <>
                      <Link href={`/doctor/appointments/${appointment.id}/notes`} className="btn btn-primary">
                        <FileTextIcon size={16} /> Add Post-Visit Notes
                      </Link>
                      <CancelAppointmentButton appointmentId={appointment.id} />
                    </>
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
              {preVisit && preVisit.llmStatus === 'FAILED' && (
                <div className={`card ${styles.aiCard}`} style={{ borderLeft: '4px solid var(--danger-500)' }}>
                  <div className={styles.aiHeader}>
                    <AlertTriangleIcon size={20} style={{ color: 'var(--danger-500)' }} />
                    <h3 style={{ color: 'var(--danger-700)' }}>AI Generation Failed</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    The clinical summary couldn&apos;t be generated. The patient&apos;s original symptoms are still available below.
                  </p>
                  
                  <div className={styles.aiSection} style={{ marginBottom: 'var(--space-4)' }}>
                    <h4>Patient&apos;s Words</h4>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', backgroundColor: 'var(--slate-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                      {preVisit.rawSymptoms}
                    </p>
                  </div>

                  <RetryAIButton appointmentId={appointment.id} />
                </div>
              )}

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

                    {preVisit.differentialDiagnosis && (Array.isArray(preVisit.differentialDiagnosis) ? preVisit.differentialDiagnosis as string[] : []).length > 0 && (
                      <div className={styles.aiSection}>
                        <h4>Differential Diagnosis</h4>
                        <ul className={styles.diagnosisList}>
                          {(preVisit.differentialDiagnosis as string[]).map((d, i) => (
                            <li key={i}>
                              <ActivityIcon size={14} />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {preVisit.redFlags && (Array.isArray(preVisit.redFlags) ? preVisit.redFlags as string[] : []).length > 0 && (
                      <div className={styles.aiSection}>
                        <h4 className={styles.redFlagTitle}>⚠️ Red Flags</h4>
                        <ul className={styles.redFlagList}>
                          {(preVisit.redFlags as string[]).map((f, i) => (
                            <li key={i}>
                              <AlertTriangleIcon size={14} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {preVisit.suggestedQuestions && (Array.isArray(preVisit.suggestedQuestions) ? preVisit.suggestedQuestions as string[] : []).length > 0 && (
                      <div className={styles.aiSection}>
                        <h4>Suggested Questions</h4>
                        <ol className={styles.questionList}>
                          {(preVisit.suggestedQuestions as string[]).map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Post-Visit Notes (if completed) */}
              {postVisit && postVisit.llmStatus === 'FAILED' && (
                <div className={`card ${styles.notesCard}`} style={{ borderLeft: '4px solid var(--danger-500)' }}>
                  <div className={styles.notesHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <AlertTriangleIcon size={20} style={{ color: 'var(--danger-500)' }} />
                      <h3 style={{ color: 'var(--danger-700)', margin: 0 }}>Summary Generation Failed</h3>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    The AI failed to generate the patient-friendly summary for your notes. Your clinical notes were saved safely.
                  </p>
                  
                  <div className={styles.aiSection}>
                    <h4>Your Clinical Notes</h4>
                    <p className={styles.clinicalNotes} style={{ backgroundColor: 'var(--slate-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                      {postVisit.clinicalNotes}
                    </p>
                  </div>
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <RetryPostVisitAIButton appointmentId={appointment.id} />
                  </div>
                </div>
              )}

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

                  {postVisit.prescriptions.length > 0 && (
                    <div className={styles.aiSection}>
                      <h4>Prescriptions</h4>
                      <div className={styles.rxGrid}>
                        {postVisit.prescriptions.map((rx, i) => (
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
