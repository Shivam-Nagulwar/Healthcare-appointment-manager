import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  ClipboardIcon, ClockIcon, SparklesIcon,
  ChevronRightIcon, PillIcon, HeartIcon
} from '@/components/Icons';
import Link from 'next/link';
import styles from './page.module.css';

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function PatientRecordsPage() {
  const user = await requireAuth(Role.PATIENT);

  const medicalRecords = await prisma.appointment.findMany({
    where: {
      patient: { userId: user.id },
      status: 'COMPLETED',
    },
    orderBy: { slotStart: 'desc' },
    include: {
      doctor: { include: { user: true } },
      preVisitSummary: true,
      postVisitNote: { include: { prescriptions: true } },
    },
  });

  const uniqueDoctors = new Set(medicalRecords.map(r => r.doctor.id)).size;

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={user.name} userEmail={user.email} />
      <div className="main-content">
        <Navbar title="Medical Records" subtitle="Your health history and visit summaries" />
        <main className="page-content">
          
          <div className={styles.recordsLayout}>
            {/* Quick Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><ClipboardIcon size={24} /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{medicalRecords.length}</span>
                  <span className={styles.statLabel}>Total Visits</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}><HeartIcon size={24} /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{uniqueDoctors}</span>
                  <span className={styles.statLabel}>Different Doctors</span>
                </div>
              </div>
            </div>

            <div className={styles.timelineWrapper}>
              <div className={styles.timelineLine} />
              
              {medicalRecords.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <h3 className="empty-state-title">No Medical Records</h3>
                  <p className="empty-state-text">You don&apos;t have any completed appointments yet.</p>
                </div>
              ) : (
                <div className={styles.timeline}>
                  {medicalRecords.map((record, idx) => (
                    <div key={record.id} className={`${styles.timelineItem} animate-fade-in-up`} style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className={styles.timelineNode}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineDate}>{formatDate(record.slotStart)}</div>
                      </div>
                      
                      <div className={`card ${styles.recordCard}`}>
                        <div className={styles.recordHeader}>
                          <div className={styles.doctorInfo}>
                            <h3 className={styles.doctorName}>{record.doctor.user.name}</h3>
                            <span className={styles.doctorSpecialty}>{record.doctor.specialization}</span>
                          </div>
                          <Link href={`/patient/appointments/${record.id}`} className="btn btn-ghost btn-sm">
                            View Full Details <ChevronRightIcon size={14} />
                          </Link>
                        </div>
                        
                        {/* Record Content */}
                        <div className={styles.recordContent}>
                          {/* Reason for visit (from pre-visit) */}
                          {record.preVisitSummary && (
                            <div className={styles.recordSection}>
                              <span className={styles.sectionLabel}>Reason for visit</span>
                              <p className={styles.sectionText}>{record.preVisitSummary.chiefComplaint || record.preVisitSummary.rawSymptoms}</p>
                            </div>
                          )}

                          {/* AI Summary from Doctor Notes */}
                          {record.postVisitNote && record.postVisitNote.patientSummary && (
                            <div className={styles.aiSummarySection}>
                              <div className={styles.aiSummaryHeader}>
                                <SparklesIcon size={14} style={{ color: 'var(--primary-500)' }} />
                                <span>AI Visit Summary</span>
                              </div>
                              <p className={styles.aiSummaryText}>{record.postVisitNote.patientSummary}</p>
                            </div>
                          )}

                          {/* No post visit notes uploaded yet */}
                          {!record.postVisitNote && (
                            <div className={styles.pendingNotes}>
                              <ClockIcon size={14} /> Clinical notes pending from doctor
                            </div>
                          )}

                          {/* Prescriptions quick view */}
                          {record.postVisitNote && record.postVisitNote.prescriptions.length > 0 && (
                            <div className={styles.rxQuickView}>
                              <PillIcon size={14} style={{ color: 'var(--text-tertiary)' }} />
                              <span>Prescribed {record.postVisitNote.prescriptions.length} medication(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
