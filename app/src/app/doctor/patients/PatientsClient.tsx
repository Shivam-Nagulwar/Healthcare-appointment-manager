'use client';

import { useState, useMemo } from 'react';
import {
  SearchIcon, CalendarIcon, ClockIcon, ChevronRightIcon,
  SparklesIcon, AlertTriangleIcon, UserIcon, ActivityIcon,
} from '@/components/Icons';
import Link from 'next/link';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type PatientAggregate = {
  id: string;
  name: string;
  totalVisits: number;
  completedVisits: number;
  upcomingVisits: number;
  lastVisit: string | null;
  nextVisit: string | null;
  hasAiSummary: boolean;
  highUrgency: boolean;
  nextApptId?: string;
  lastApptId?: string;
};

export default function PatientsClient({ patients }: { patients: PatientAggregate[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return patients;
    const q = search.toLowerCase();
    return patients.filter(p => p.name.toLowerCase().includes(q));
  }, [search, patients]);

  return (
    <>
      {/* Search */}
      <div className={styles.searchRow}>
        <div className={styles.searchBar}>
          <SearchIcon size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Patient Cards */}
      <div className={styles.patientGrid}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">👥</div>
            <h3 className="empty-state-title">No patients found</h3>
            <p className="empty-state-text">
              {search ? 'No patients match your search.' : 'You have no patients yet.'}
            </p>
          </div>
        ) : (
          filtered.map((patient, idx) => (
            <div
              key={patient.id}
              className={`card ${styles.patientCard} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={styles.patientHeader}>
                <div className={styles.patientInfo}>
                  <div className="avatar avatar-accent">
                    {getInitials(patient.name)}
                  </div>
                  <div>
                    <h3 className={styles.patientName}>{patient.name}</h3>
                    <span className={styles.patientId}>ID: {patient.id}</span>
                  </div>
                </div>
                <div className={styles.badges}>
                  {patient.highUrgency && (
                    <span className="badge badge-danger" style={{ gap: '4px' }}>
                      <AlertTriangleIcon size={10} /> Urgent
                    </span>
                  )}
                  {patient.hasAiSummary && (
                    <span className="badge badge-primary" style={{ gap: '4px' }}>
                      <SparklesIcon size={10} /> AI
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{patient.totalVisits}</span>
                  <span className={styles.statLabel}>Total Visits</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{patient.completedVisits}</span>
                  <span className={styles.statLabel}>Completed</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{patient.upcomingVisits}</span>
                  <span className={styles.statLabel}>Upcoming</span>
                </div>
              </div>

              <div className={styles.dateInfo}>
                {patient.lastVisit && (
                  <div className={styles.dateRow}>
                    <CalendarIcon size={14} />
                    <span>Last visit: {formatDate(patient.lastVisit)}</span>
                  </div>
                )}
                {patient.nextVisit && (
                  <div className={styles.dateRow}>
                    <ClockIcon size={14} />
                    <span>Next: {formatDate(patient.nextVisit)}</span>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                {patient.nextApptId && (
                  <Link
                    href={`/doctor/appointments/${patient.nextApptId}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Appointment
                  </Link>
                )}
                {patient.lastApptId && (
                  <Link
                    href={`/doctor/appointments/${patient.lastApptId}`}
                    className="btn btn-ghost btn-sm"
                  >
                    View History
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
