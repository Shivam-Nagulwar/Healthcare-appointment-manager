'use client';

import { useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  ClipboardIcon, CalendarIcon, ClockIcon, SparklesIcon,
  FileTextIcon, ChevronRightIcon, PillIcon, HeartIcon
} from '@/components/Icons';
import { mockCurrentUser, mockAppointments } from '@/lib/mockData';
import Link from 'next/link';
import styles from './page.module.css';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PatientRecordsPage() {
  // Only completed appointments are part of medical history
  const medicalRecords = useMemo(() => {
    return mockAppointments
      .filter(a => a.patientId === mockCurrentUser.id && a.status === 'COMPLETED')
      .sort((a, b) => new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime());
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
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
                  <span className={styles.statValue}>{new Set(medicalRecords.map(r => r.doctorName)).size}</span>
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
                            <h3 className={styles.doctorName}>{record.doctorName}</h3>
                            <span className={styles.doctorSpecialty}>{record.doctorSpecialization}</span>
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
                          {record.postVisitNote && record.postVisitNote.prescription.length > 0 && (
                            <div className={styles.rxQuickView}>
                              <PillIcon size={14} style={{ color: 'var(--text-tertiary)' }} />
                              <span>Prescribed {record.postVisitNote.prescription.length} medication(s)</span>
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
