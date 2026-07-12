'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, ClockIcon, SearchIcon, ChevronRightIcon,
  SparklesIcon, FilterIcon, AlertTriangleIcon,
} from '@/components/Icons';
import { mockCurrentUser, mockAppointments } from '@/lib/mockData';
import type { Appointment } from '@/lib/mockData';
import Link from 'next/link';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso: string) {
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

export default function PatientAppointmentsPage() {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const patientAppointments = mockAppointments
    .filter(a => a.patientName === mockCurrentUser.name)
    .sort((a, b) => new Date(b.slotStart).getTime() - new Date(a.slotStart).getTime());

  const filtered = useMemo(() => {
    let result = [...patientAppointments];
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
  }, [filter, search, patientAppointments]);

  const counts = {
    ALL: patientAppointments.length,
    BOOKED: patientAppointments.filter(a => a.status === 'BOOKED').length,
    COMPLETED: patientAppointments.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: patientAppointments.filter(a => a.status === 'CANCELLED').length,
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
      <div className="main-content">
        <Navbar title="My Appointments" subtitle="View and manage your appointment history" />
        <main className="page-content">
          {/* Filter Tabs */}
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

          {/* Search */}
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

          {/* Appointments List */}
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
        </main>
      </div>
    </div>
  );
}
