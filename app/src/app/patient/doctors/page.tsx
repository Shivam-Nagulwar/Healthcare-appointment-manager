'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  SearchIcon, StarFilledIcon, MapPinIcon, ClockIcon,
  ChevronRightIcon, FilterIcon, AwardIcon, BriefcaseIcon,
} from '@/components/Icons';
import { mockCurrentUser, mockDoctors, specializations } from '@/lib/mockData';
import type { DoctorProfile } from '@/lib/mockData';
import Link from 'next/link';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const avatarColors = [
  'linear-gradient(135deg, #0891b2, #0e7490)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ec4899, #db2777)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
];

export default function FindDoctorsPage() {
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'reviews'>('rating');

  const filteredDoctors = useMemo(() => {
    let docs = [...mockDoctors];
    
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    }

    if (selectedSpec !== 'All') {
      docs = docs.filter(d => d.specialization === selectedSpec);
    }

    docs.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      return b.totalReviews - a.totalReviews;
    });

    return docs;
  }, [search, selectedSpec, sortBy]);

  const availableSpecs = ['All', ...new Set(mockDoctors.map(d => d.specialization))];

  return (
    <div className="dashboard-layout">
      <Sidebar role="PATIENT" userName={mockCurrentUser.name} userEmail={mockCurrentUser.email} />
      <div className="main-content">
        <Navbar title="Find Doctors" subtitle="Search by specialty, location, or name" />
        <main className="page-content">
          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <SearchIcon size={20} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by doctor name, specialty, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.filterRow}>
              <div className={styles.specFilters}>
                {availableSpecs.map(spec => (
                  <button
                    key={spec}
                    className={`${styles.specChip} ${selectedSpec === spec ? styles.specChipActive : ''}`}
                    onClick={() => setSelectedSpec(spec)}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              <div className={styles.sortDropdown}>
                <FilterIcon size={14} />
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'experience' | 'reviews')}
                  style={{ border: 'none', background: 'transparent', fontSize: 'var(--text-sm)' }}
                >
                  <option value="rating">Top Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
            </span>
          </div>

          <div className={styles.doctorGrid}>
            {filteredDoctors.map((doc, idx) => (
              <DoctorCard key={doc.id} doctor={doc} index={idx} colorIndex={idx % avatarColors.length} />
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">No doctors found</h3>
              <p className="empty-state-text">Try adjusting your search or filters to find doctors.</p>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setSelectedSpec('All'); }}>
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function DoctorCard({ doctor, index, colorIndex }: { doctor: DoctorProfile; index: number; colorIndex: number }) {
  const workingDays = Object.keys(doctor.workingHours).map(d =>
    d.charAt(0).toUpperCase() + d.slice(1, 3)
  );

  return (
    <div
      className={`card card-interactive ${styles.doctorCard} animate-fade-in-up`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={styles.doctorHeader}>
        <div
          className={`avatar avatar-lg ${styles.doctorAvatar}`}
          style={{ background: avatarColors[colorIndex] }}
        >
          {getInitials(doctor.name)}
        </div>
        <div className={styles.doctorMainInfo}>
          <h3 className={styles.doctorName}>{doctor.name}</h3>
          <p className={styles.doctorSpec}>{doctor.specialization}</p>
          <div className={styles.doctorRating}>
            <StarFilledIcon size={14} style={{ color: 'var(--accent-500)' }} />
            <span className={styles.ratingValue}>{doctor.rating}</span>
            <span className={styles.ratingCount}>({doctor.totalReviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className={styles.doctorMeta}>
        <div className={styles.metaItem}>
          <BriefcaseIcon size={14} />
          <span>{doctor.experience} years exp.</span>
        </div>
        <div className={styles.metaItem}>
          <MapPinIcon size={14} />
          <span>{doctor.location}</span>
        </div>
        <div className={styles.metaItem}>
          <ClockIcon size={14} />
          <span>{doctor.slotDurationMin} min slots</span>
        </div>
      </div>

      <p className={styles.doctorBio}>{doctor.bio}</p>

      <div className={styles.workingDays}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <span
            key={day}
            className={`${styles.dayChip} ${workingDays.includes(day) ? styles.dayActive : ''}`}
          >
            {day.charAt(0)}
          </span>
        ))}
      </div>

      <div className={styles.doctorActions}>
        <Link href={`/patient/doctors/${doctor.id}/book`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
          Book Appointment
        </Link>
        <Link href={`/patient/doctors/${doctor.id}`} className="btn btn-secondary btn-sm">
          View Profile <ChevronRightIcon size={14} />
        </Link>
      </div>
    </div>
  );
}
