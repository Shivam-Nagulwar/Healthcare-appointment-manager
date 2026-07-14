'use client';

import { useState, useMemo } from 'react';
import {
  CalendarIcon, ClockIcon, SearchIcon, ChevronRightIcon,
  SparklesIcon, AlertTriangleIcon,
} from '@/components/Icons';
import Link from 'next/link';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(iso: Date) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso: Date) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusConfig(status: string) {
  const map: Record<string, { className: string; label: string }> = {
    BOOKED: { className: 'badge-primary', label: 'Upcoming' },
    COMPLETED: { className: 'badge-success', label: 'Completed' },
    CANCELLED: { className: 'badge-danger', label: 'Cancelled' },
    HELD: { className: 'badge-warning', label: 'On Hold' },
  };
  return map[status] || { className: 'badge-neutral', label: status };
}

type AppointmentData = {
  id: string;
  status: string;
  slotStart: Date;
  slotEnd: Date;
  doctorName: string;
  doctorSpecialization: string;
  preVisitSummary: any;
};

export default function AppointmentsClient({ appointments }: { appointments: AppointmentData[] }) {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...appointments];
    if (filter !== 'ALL') {
      result = result.filter(a => a.status === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.doctorName.toLowerCase().includes(q) ||
        a.doctorSpecialization.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, search, appointments]);

  const counts = {
    ALL: appointments.length,
    BOOKED: appointments.filter(a => a.status === 'BOOKED').length,
    COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  return (
    <>
      <div className={styles.tabBar}>
        {(['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${filter === tab ? styles.tabActive : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'ALL' ? 'All' : getStatusConfig(tab).label}
            <span className={styles.tabCount}>{counts[tab]}</span>
          </button>
        ))}
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchBar}>
          <SearchIcon size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by doctor or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.appointmentList}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">No appointments found</h3>
            <p className="empty-state-text">
              {filter === 'ALL'
                ? 'You haven\'t booked any appointments yet.'
                : `No ${getStatusConfig(filter).label.toLowerCase()} appointments.`
              }
            </p>
            <Link href="/patient/doctors" className="btn btn-primary">
              <SearchIcon size={16} /> Find a Doctor
            </Link>
          </div>
        ) : (
          filtered.map((apt, idx) => (
            <Link
              key={apt.id}
              href={`/patient/appointments/${apt.id}`}
              className={`${styles.appointmentRow} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={styles.rowLeft}>
                <div className="avatar avatar-primary">
                  {getInitials(apt.doctorName)}
                </div>
                <div className={styles.rowInfo}>
                  <h3 className={styles.rowDoctorName}>{apt.doctorName}</h3>
                  <p className={styles.rowSpec}>{apt.doctorSpecialization}</p>
                </div>
              </div>

              <div className={styles.rowCenter}>
                <div className={styles.rowDetail}>
                  <CalendarIcon size={14} />
                  <span>{formatDate(apt.slotStart)}</span>
                </div>
                <div className={styles.rowDetail}>
                  <ClockIcon size={14} />
                  <span>{formatTime(apt.slotStart)} — {formatTime(apt.slotEnd)}</span>
                </div>
              </div>

              <div className={styles.rowRight}>
                {apt.preVisitSummary?.llmStatus === 'OK' && (
                  <span className="badge badge-primary" style={{ gap: '4px' }}>
                    <SparklesIcon size={10} /> AI Summary
                  </span>
                )}
                {apt.preVisitSummary?.urgencyLevel === 'HIGH' && (
                  <span className="badge badge-danger" style={{ gap: '4px' }}>
                    <AlertTriangleIcon size={10} /> Urgent
                  </span>
                )}
                <span className={`badge ${getStatusConfig(apt.status).className}`}>
                  {getStatusConfig(apt.status).label}
                </span>
                <ChevronRightIcon size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
