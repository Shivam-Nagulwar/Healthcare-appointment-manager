'use client';

import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, ClockIcon, ChevronLeftIcon, MapPinIcon,
  SparklesIcon, AlertTriangleIcon, StarFilledIcon,
  BriefcaseIcon, FileTextIcon, CheckIcon, HeartIcon,
  ActivityIcon,
} from '@/components/Icons';
import { mockCurrentUser, mockAppointments, mockDoctors } from '@/lib/mockData';
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
    BOOKED: { className: 'badge-primary', label: 'Upcoming', color: 'var(--primary-500)' },
    COMPLETED: { className: 'badge-success', label: 'Completed', color: 'var(--success-500)' },
    CANCELLED: { className: 'badge-danger', label: 'Cancelled', color: 'var(--danger-500)' },
    HELD: { className: 'badge-warning', label: 'On Hold', color: 'var(--warning-500)' },
  };
  return map[status] || { className: 'badge-neutral', label: status, color: 'var(--slate-400)' };
}

function getUrgencyConfig(level: string) {
  const map: Record<string, { className: string; color: string; label: string; desc: string }> = {
    LOW: { className: 'badge-success', color: 'var(--success-500)', label: 'Low Urgency', desc: 'Routine visit — no immediate concerns detected.' },
    MEDIUM: { className: 'badge-warning', color: 'var(--warning-500)', label: 'Medium Urgency', desc: 'Some concerning symptoms — prioritize this visit.' },
    HIGH: { className: 'badge-danger', color: 'var(--danger-500)', label: 'High Urgency', desc: 'Significant symptoms detected — urgent attention recommended.' },
  };
  return map[level] || { className: 'badge-neutral', color: 'var(--slate-400)', label: level, desc: '' };
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const appointment = mockAppointments.find(a => a.id === appointmentId);
  const doctor = appointment ? mockDoctors.find(d => d.name === appointment.doctorName) : null;

  if (!appointment) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
        <div className="main-content">
          <Navbar title="Appointment Details" />
          <main className="page-content">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">Appointment not found</h3>
              <p className="empty-state-text">This appointment doesn&apos;t exist or has been removed.</p>
              <button className="btn btn-primary" onClick={() => router.push('/patient/appointments')}>
                Back to Appointments
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const status = getStatusConfig(appointment.status);
  const preVisit = appointment.preVisitSummary;
  const postVisit = appointment.postVisitNote;

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
      <div className="main-content">
        <Navbar title="Appointment Details" />
        <main className="page-content">
          {/* Back Button */}
          <button
            className="btn btn-ghost"
            onClick={() => router.push('/patient/appointments')}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <ChevronLeftIcon size={16} /> Back to Appointments
          </button>

          <div className={styles.detailLayout}>
            {/* Main Content */}
            <div className={styles.mainCol}>
              {/* Header Card */}
              <div className={`card ${styles.headerCard}`}>
                <div className={styles.headerTop}>
                  <div className={styles.headerDoctor}>
                    <div className="avatar avatar-lg avatar-primary">
                      {getInitials(appointment.doctorName)}
                    </div>
                    <div>
                      <h2 className={styles.doctorName}>{appointment.doctorName}</h2>
                      <p className={styles.doctorSpec}>{appointment.doctorSpecialization}</p>
                      {doctor && (
                        <div className={styles.doctorRating}>
                          <StarFilledIcon size={14} style={{ color: 'var(--accent-500)' }} />
                          <span>{doctor.rating}</span>
                          <span className={styles.ratingCount}>({doctor.totalReviews} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.headerStatus}>
                    <span className={`badge ${status.className}`} style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-1) var(--space-4)' }}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <CalendarIcon size={18} />
                    <div>
                      <span className={styles.detailLabel}>Date</span>
                      <span className={styles.detailValue}>{formatDate(appointment.slotStart)}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <ClockIcon size={18} />
                    <div>
                      <span className={styles.detailLabel}>Time</span>
                      <span className={styles.detailValue}>{formatTime(appointment.slotStart)} — {formatTime(appointment.slotEnd)}</span>
                    </div>
                  </div>
                  {doctor && (
                    <div className={styles.detailItem}>
                      <MapPinIcon size={18} />
                      <div>
                        <span className={styles.detailLabel}>Location</span>
                        <span className={styles.detailValue}>{doctor.location}</span>
                      </div>
                    </div>
                  )}
                  {doctor && (
                    <div className={styles.detailItem}>
                      <BriefcaseIcon size={18} />
                      <div>
                        <span className={styles.detailLabel}>Duration</span>
                        <span className={styles.detailValue}>{doctor.slotDurationMin} minutes</span>
                      </div>
                    </div>
                  )}
                </div>

                {appointment.status === 'BOOKED' && (
                  <div className={styles.actionBar}>
                    <button className="btn btn-secondary">Reschedule</button>
                    <button className="btn btn-ghost" style={{ color: 'var(--danger-500)' }}>Cancel Appointment</button>
                  </div>
                )}
              </div>

              {/* AI Pre-Visit Summary */}
              {preVisit && preVisit.llmStatus === 'OK' && (
                <div className={`card ${styles.aiCard} animate-fade-in-up`}>
                  <div className={styles.aiHeader}>
                    <div className={styles.aiTitleRow}>
                      <SparklesIcon size={22} style={{ color: 'var(--primary-500)' }} />
                      <h3>AI Pre-Visit Summary</h3>
                    </div>
                    <span className={styles.aiPowered}>Powered by Gemini</span>
                  </div>

                  {/* Urgency Level */}
                  {preVisit.urgencyLevel && (
                    <div className={styles.urgencyBanner} style={{ borderLeftColor: getUrgencyConfig(preVisit.urgencyLevel).color }}>
                      <AlertTriangleIcon size={18} style={{ color: getUrgencyConfig(preVisit.urgencyLevel).color }} />
                      <div>
                        <strong>{getUrgencyConfig(preVisit.urgencyLevel).label}</strong>
                        <p>{getUrgencyConfig(preVisit.urgencyLevel).desc}</p>
                      </div>
                    </div>
                  )}

                  {/* Chief Complaint */}
                  {preVisit.chiefComplaint && (
                    <div className={styles.aiSection}>
                      <h4>Chief Complaint</h4>
                      <p>{preVisit.chiefComplaint}</p>
                    </div>
                  )}

                  {/* Differential Diagnosis */}
                  {preVisit.differentialDiagnosis && preVisit.differentialDiagnosis.length > 0 && (
                    <div className={styles.aiSection}>
                      <h4>Possible Considerations</h4>
                      <div className={styles.diagnosisList}>
                        {preVisit.differentialDiagnosis.map((d, i) => (
                          <div key={i} className={styles.diagnosisItem}>
                            <ActivityIcon size={14} style={{ color: 'var(--primary-500)' }} />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Questions */}
                  {preVisit.suggestedQuestions && preVisit.suggestedQuestions.length > 0 && (
                    <div className={styles.aiSection}>
                      <h4>Questions to Ask Your Doctor</h4>
                      <ul className={styles.questionList}>
                        {preVisit.suggestedQuestions.map((q, i) => (
                          <li key={i}>
                            <span className={styles.qNumber}>{i + 1}</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red Flags */}
                  {preVisit.redFlags && preVisit.redFlags.length > 0 && (
                    <div className={styles.aiSection}>
                      <h4 style={{ color: 'var(--danger-500)' }}>⚠️ Red Flags</h4>
                      <ul className={styles.redFlagList}>
                        {preVisit.redFlags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Patient-Friendly Summary */}
                  {preVisit.patientFriendlySummary && (
                    <div className={styles.patientSummary}>
                      <HeartIcon size={16} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
                      <div>
                        <strong>In Simple Terms</strong>
                        <p>{preVisit.patientFriendlySummary}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Post-Visit Notes */}
              {postVisit && (
                <div className={`card ${styles.postVisitCard} animate-fade-in-up`}>
                  <div className={styles.postVisitHeader}>
                    <FileTextIcon size={22} style={{ color: 'var(--success-500)' }} />
                    <h3>Post-Visit Summary</h3>
                  </div>

                  {postVisit.doctorNotesRaw && (
                    <div className={styles.aiSection}>
                      <h4>Doctor&apos;s Notes</h4>
                      <p className={styles.doctorNotes}>{postVisit.doctorNotesRaw}</p>
                    </div>
                  )}

                  {postVisit.prescriptions && postVisit.prescriptions.length > 0 && (
                    <div className={styles.aiSection}>
                      <h4>Prescriptions</h4>
                      <div className={styles.prescriptionList}>
                        {postVisit.prescriptions.map((rx, i) => (
                          <div key={i} className={styles.prescriptionItem}>
                            <div className={styles.rxIcon}>💊</div>
                            <div className={styles.rxInfo}>
                              <strong>{rx.medication}</strong>
                              <span>{rx.dosage} — {rx.frequency} for {rx.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {postVisit.followUpRecommended && (
                    <div className={styles.followUp}>
                      <CalendarIcon size={16} style={{ color: 'var(--primary-500)' }} />
                      <span>Follow-up recommended in <strong>{postVisit.followUpDays} days</strong></span>
                    </div>
                  )}

                  {postVisit.patientFriendlySummary && (
                    <div className={styles.patientSummary}>
                      <SparklesIcon size={16} style={{ color: 'var(--success-500)', flexShrink: 0 }} />
                      <div>
                        <strong>AI Summary for You</strong>
                        <p>{postVisit.patientFriendlySummary}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className={styles.sideCol}>
              {/* Doctor Card */}
              {doctor && (
                <div className="card">
                  <h3 className={styles.sideTitle}>About the Doctor</h3>
                  <p className={styles.doctorBio}>{doctor.bio}</p>
                  <div className={styles.sideMeta}>
                    <div className={styles.sideMetaItem}>
                      <BriefcaseIcon size={14} />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    <div className={styles.sideMetaItem}>
                      <span className={styles.sideMetaIcon}>🎓</span>
                      <span>{doctor.education}</span>
                    </div>
                    <div className={styles.sideMetaItem}>
                      <MapPinIcon size={14} />
                      <span>{doctor.location}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Symptoms Summary */}
              {preVisit?.rawInput && (
                <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                  <h3 className={styles.sideTitle}>Your Reported Symptoms</h3>
                  <p className={styles.symptomsText}>{preVisit.rawInput}</p>
                </div>
              )}

              {/* Appointment ID */}
              <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                <h3 className={styles.sideTitle}>Appointment Info</h3>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ID</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{appointment.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Created</span>
                  <span className={styles.infoValue}>{formatDate(appointment.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
