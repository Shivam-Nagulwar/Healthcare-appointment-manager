'use client';

import { useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  HeartIcon, CalendarIcon, UserIcon, CheckIcon, PillIcon
} from '@/components/Icons';
import { mockCurrentUser, mockAppointments } from '@/lib/mockData';
import styles from './page.module.css';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PatientPrescriptionsPage() {
  const prescriptions = useMemo(() => {
    const patientApts = mockAppointments.filter(a => a.patientId === mockCurrentUser.id && a.status === 'COMPLETED' && a.postVisitNote && a.postVisitNote.prescription.length > 0);
    
    const allPrescriptions = [];
    for (const apt of patientApts) {
      for (const rx of apt.postVisitNote!.prescription) {
        allPrescriptions.push({
          ...rx,
          datePrescribed: apt.slotStart,
          doctorName: apt.doctorName,
          appointmentId: apt.id
        });
      }
    }
    
    // Sort by most recent
    return allPrescriptions.sort((a, b) => new Date(b.datePrescribed).getTime() - new Date(a.datePrescribed).getTime());
  }, []);

  const activePrescriptions = prescriptions.filter(rx => {
    const prescribedDate = new Date(rx.datePrescribed);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - prescribedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= rx.durationDays;
  });

  const pastPrescriptions = prescriptions.filter(rx => {
    const prescribedDate = new Date(rx.datePrescribed);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - prescribedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > rx.durationDays;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
      <div className="main-content">
        <Navbar title="My Prescriptions" subtitle="Manage your medications and active prescriptions" />
        <main className="page-content">
          
          <div className={styles.prescriptionsLayout}>
            {/* Active Prescriptions */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.iconWrapper}><PillIcon size={20} /></span>
                Active Medications
                <span className={styles.countBadge}>{activePrescriptions.length}</span>
              </h2>
              
              {activePrescriptions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <h3 className="empty-state-title">No Active Medications</h3>
                  <p className="empty-state-text">You don&apos;t have any active prescriptions at this time.</p>
                </div>
              ) : (
                <div className={styles.prescriptionGrid}>
                  {activePrescriptions.map((rx, i) => (
                    <div key={i} className={`card ${styles.rxCard} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms` }}>
                      <div className={styles.rxHeader}>
                        <div className={styles.rxIconWrapper}><PillIcon size={24} /></div>
                        <div className={styles.rxTitleGroup}>
                          <h3 className={styles.rxMedication}>{rx.medication}</h3>
                          <span className={styles.rxDosage}>{rx.dosage}</span>
                        </div>
                        <span className="badge badge-success">Active</span>
                      </div>
                      
                      <div className={styles.rxDetails}>
                        <div className={styles.rxDetailItem}>
                          <span className={styles.rxLabel}>Frequency</span>
                          <span className={styles.rxValue}>{rx.frequency}</span>
                        </div>
                        <div className={styles.rxDetailItem}>
                          <span className={styles.rxLabel}>Duration</span>
                          <span className={styles.rxValue}>{rx.durationDays} days</span>
                        </div>
                      </div>

                      <div className={styles.rxFooter}>
                        <div className={styles.rxMeta}>
                          <UserIcon size={14} /> Prescribed by {rx.doctorName}
                        </div>
                        <div className={styles.rxMeta}>
                          <CalendarIcon size={14} /> {formatDate(rx.datePrescribed)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Prescriptions */}
            <div className={styles.section} style={{ marginTop: 'var(--space-8)' }}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.iconWrapper} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}><CheckIcon size={20} /></span>
                Past Medications
                <span className={styles.countBadge} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{pastPrescriptions.length}</span>
              </h2>
              
              {pastPrescriptions.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No past prescriptions found.</p>
              ) : (
                <div className={styles.pastRxList}>
                  {pastPrescriptions.map((rx, i) => (
                    <div key={i} className={`${styles.pastRxRow} animate-fade-in-up`} style={{ animationDelay: `${i * 30}ms` }}>
                      <div className={styles.pastRxMain}>
                        <h4 className={styles.pastRxMedication}>{rx.medication} <span className={styles.pastRxDosage}>{rx.dosage}</span></h4>
                        <span className={styles.pastRxFreq}>{rx.frequency} for {rx.durationDays} days</span>
                      </div>
                      <div className={styles.pastRxMetaGroup}>
                        <span className={styles.pastRxMeta}><UserIcon size={12} /> {rx.doctorName}</span>
                        <span className={styles.pastRxMeta}><CalendarIcon size={12} /> {formatDate(rx.datePrescribed)}</span>
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
