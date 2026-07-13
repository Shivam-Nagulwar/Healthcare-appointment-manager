'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  StethoscopeIcon, SearchIcon, PlusIcon, EditIcon,
  TrashIcon, StarFilledIcon, CheckIcon, XIcon,
} from '@/components/Icons';
import { mockAdminUser, mockDoctors } from '@/lib/mockData';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function AdminDoctorsPage() {
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState(mockDoctors);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: 0,
    slotDurationMin: 30,
    location: '',
    education: '',
    bio: '',
  });

  const filteredDoctors = useMemo(() => {
    if (!search) return doctors;
    const q = search.toLowerCase();
    return doctors.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialization.toLowerCase().includes(q)
    );
  }, [search, doctors]);

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      email: '',
      specialization: '',
      experience: 0,
      slotDurationMin: 30,
      location: '',
      education: '',
      bio: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      experience: doctor.experience || 0,
      slotDurationMin: doctor.slotDurationMin || 30,
      location: doctor.location || '',
      education: doctor.education || '',
      bio: doctor.bio || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this doctor?')) {
      setDoctors(doctors.filter(d => d.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor) {
      setDoctors(doctors.map(d => d.id === editingDoctor.id ? { ...d, ...formData } : d));
    } else {
      const newDoctor = {
        id: `doc-${Date.now()}`,
        userId: `usr-${Date.now()}`,
        ...formData,
        rating: 0,
        totalReviews: 0,
        workingHours: {
          mon: ['09:00', '17:00'],
          tue: ['09:00', '17:00'],
          wed: ['09:00', '17:00'],
          thu: ['09:00', '17:00'],
          fri: ['09:00', '17:00'],
        } as Record<string, [string, string]>
      };
      setDoctors([newDoctor, ...doctors]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="ADMIN" userName={mockAdminUser.name} userEmail={mockAdminUser.email} />
      <div className="main-content">
        <Navbar title="Manage Doctors" subtitle="Add, edit, or remove doctors from the platform" />
        <main className="page-content">
          
          {/* Action Bar */}
          <div className={styles.actionBar}>
            <div className={styles.searchBar}>
              <SearchIcon size={18} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search doctors by name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <PlusIcon size={16} /> Add Doctor
            </button>
          </div>

          {/* Data Table */}
          <div className="data-table-wrapper animate-fade-in-up">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Slot Duration</th>
                  <th>Rating</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                      No doctors found.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div className="avatar avatar-primary">{getInitials(doc.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{doc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{doc.specialization}</span>
                      </td>
                      <td>{doc.experience} years</td>
                      <td>{doc.slotDurationMin} mins</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StarFilledIcon size={14} style={{ color: 'var(--accent-500)' }} />
                          <span style={{ fontWeight: 600 }}>{doc.rating}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleOpenEdit(doc)}>
                            <EditIcon size={16} />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm btn-icon" 
                            style={{ color: 'var(--danger-500)' }}
                            onClick={() => handleDelete(doc.id)}
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`card ${styles.modal} animate-fade-in-up`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setIsModalOpen(false)}>
                <XIcon size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className={styles.modalBody}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.specialization}
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    min="0"
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Slot Duration (Mins)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    min="15"
                    step="15"
                    value={formData.slotDurationMin}
                    onChange={e => setFormData({...formData, slotDurationMin: parseInt(e.target.value) || 30})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location (Clinic / Hospital)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., City Hospital, NY"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Education & Qualifications</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.education}
                  onChange={e => setFormData({...formData, education: e.target.value})}
                  placeholder="e.g., MBBS, MD (Cardiology)"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Professional Bio</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Brief description of the doctor's background and expertise..."
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingDoctor ? 'Save Changes' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
