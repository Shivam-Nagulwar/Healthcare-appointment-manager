'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  FileTextIcon, SearchIcon, CalendarIcon, ClockIcon,
  ChevronRightIcon, SparklesIcon, CheckIcon, AlertTriangleIcon,
} from '@/components/Icons';
import { mockDoctorUser, mockAppointments } from '@/lib/mockData';
import Link from 'next/link';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function DoctorNotesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'WITH_NOTES' | 'NEEDS_NOTES'>('ALL');

  const doctorAppointments = mockAppointments
    .filter(a => a.doctorId === mockDoctorUser.id || a.doctorName === mockDoctorUser.name)
    .sort((a, b) => new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime());

  const filtered = useMemo(() => {
    let result = [...doctorAppointments];

    if (filter === 'WITH_NOTES') {
      result = result.filter(a => a.postVisitNote);
    } else if (filter === 'NEEDS_NOTES') {
      result = result.filter(a => !a.postVisitNote && (a.status === 'COMPLETED' || a.status === 'BOOKED'));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => a.patientName.toLowerCase().includes(q));
    }

    return result;
  }, [filter, search, doctorAppointments]);

  const withNotes = doctorAppointments.filter(a => a.postVisitNote).length;
  const needsNotes = doctorAppointments.filter(a => !a.postVisitNote && (a.status === 'COMPLETED' || a.status === 'BOOKED')).length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="DOCTOR" userName={mockDoctorUser.name} userEmail={mockDoctorUser.email} />
      <div className="main-content">
        <Navbar title="Clinical Notes" subtitle="Manage your post-visit documentation" />
        <main className="page-content">
          {/* Summary Stats */}
          <div className={styles.summaryRow}>
            <div className={`${styles.summaryCard} animate-fade-in-up stagger-1`}>
              <FileTextIcon size={20} style={{ color: 'var(--primary-500)' }} />
              <div>
                <span className={styles.summaryValue}>{doctorAppointments.length}</span>
                <span className={styles.summaryLabel}>Total Appointments</span>
              </div>
            </div>
            <div className={`${styles.summaryCard} animate-fade-in-up stagger-2`}>
              <CheckIcon size={20} style={{ color: 'var(--success-500)' }} />
              <div>
                <span className={styles.summaryValue}>{withNotes}</span>
                <span className={styles.summaryLabel}>Notes Completed</span>
              </div>
            </div>
            <div className={`${styles.summaryCard} animate-fade-in-up stagger-3`}>
              <AlertTriangleIcon size={20} style={{ color: 'var(--warning-500)' }} />
              <div>
                <span className={styles.summaryValue}>{needsNotes}</span>
                <span className={styles.summaryLabel}>Pending Notes</span>
              </div>
            </div>
          </div>

          {/* Filter & Search */}
          <div className={styles.controlsRow}>
            <div className={styles.tabBar}>
              {([
                { key: 'ALL', label: 'All' },
                { key: 'WITH_NOTES', label: 'Completed' },
                { key: 'NEEDS_NOTES', label: 'Needs Notes' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  className={`${styles.tab} ${filter === tab.key ? styles.tabActive : ''}`}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className={styles.searchBar}>
              <SearchIcon size={18} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Notes List */}
          <div className={styles.notesList}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3 className="empty-state-title">No notes found</h3>
                <p className="empty-state-text">
                  {search ? 'No matching appointments found.' : 'No clinical notes to show for this filter.'}
                </p>
              </div>
            ) : (
              filtered.map((apt, idx) => {
                const hasNotes = !!apt.postVisitNote;
                return (
                  <Link
                    key={apt.id}
                    href={`/doctor/appointments/${apt.id}/notes`}
                    className={`${styles.noteRow} animate-fade-in-up`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className={styles.noteLeft}>
                      <div className={`${styles.noteIndicator} ${hasNotes ? styles.noteComplete : styles.notePending}`}>
                        {hasNotes ? <CheckIcon size={14} /> : <FileTextIcon size={14} />}
                      </div>
                      <div className="avatar avatar-sm avatar-accent">
                        {getInitials(apt.patientName)}
                      </div>
                      <div className={styles.noteInfo}>
                        <h3 className={styles.notePatient}>{apt.patientName}</h3>
                        <div className={styles.noteMeta}>
                          <span><CalendarIcon size={12} /> {formatDate(apt.slotStart)}</span>
                          <span><ClockIcon size={12} /> {formatTime(apt.slotStart)}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.noteRight}>
                      {hasNotes ? (
                        <>
                          <p className={styles.notePreview}>
                            {apt.postVisitNote!.clinicalNotes.slice(0, 100)}
                            {apt.postVisitNote!.clinicalNotes.length > 100 ? '...' : ''}
                          </p>
                          <div className={styles.noteTags}>
                            <span className="badge badge-success" style={{ gap: '4px' }}>
                              <CheckIcon size={10} /> Notes Saved
                            </span>
                            {apt.postVisitNote!.prescription.length > 0 && (
                              <span className="badge badge-neutral">
                                💊 {apt.postVisitNote!.prescription.length} Rx
                              </span>
                            )}
                            {apt.postVisitNote!.patientSummary && (
                              <span className="badge badge-primary" style={{ gap: '4px' }}>
                                <SparklesIcon size={10} /> AI Summary
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className={styles.noteTags}>
                          <span className="badge badge-warning">Needs Notes</span>
                          {apt.preVisitSummary?.llmStatus === 'OK' && (
                            <span className="badge badge-primary" style={{ gap: '4px' }}>
                              <SparklesIcon size={10} /> AI Pre-visit
                            </span>
                          )}
                        </div>
                      )}
                      <ChevronRightIcon size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
