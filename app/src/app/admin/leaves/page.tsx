'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import {
  CalendarIcon, PlusIcon, TrashIcon, CheckIcon, XIcon,
} from '@/components/Icons';
import { mockAdminUser, mockDoctorLeaves, mockDoctors } from '@/lib/mockData';
import styles from './page.module.css';

function getInitials(name: string) {
  return name.split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState(mockDoctorLeaves);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    doctorId: '',
    leaveDate: '',
    reason: '',
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this leave record?')) {
      setLeaves(leaves.filter(l => l.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const doctor = mockDoctors.find(d => d.id === formData.doctorId);
    if (!doctor) return;

    const newLeave = {
      id: `leave-${Date.now()}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      leaveDate: formData.leaveDate,
      reason: formData.reason,
    };
    
    setLeaves([newLeave, ...leaves].sort((a, b) => new Date(a.leaveDate).getTime() - new Date(b.leaveDate).getTime()));
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="ADMIN" userName={mockAdminUser.name} userEmail={mockAdminUser.email} />
      <div className="main-content">
        <Navbar title="Leave Management" subtitle="Manage doctor leaves and unavailabilities" />
        <main className="page-content">
          
          <div className={styles.actionBar}>
            <h2 className={styles.pageTitle}>Upcoming Leaves</h2>
            <button className="btn btn-primary" onClick={() => {
              setFormData({ doctorId: mockDoctors[0]?.id || '', leaveDate: '', reason: '' });
              setIsModalOpen(true);
            }}>
              <PlusIcon size={16} /> Log Leave
            </button>
          </div>

          <div className="data-table-wrapper animate-fade-in-up">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                      No upcoming leaves logged.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div className="avatar avatar-primary">{getInitials(leave.doctorName)}</div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{leave.doctorName}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <CalendarIcon size={14} style={{ color: 'var(--text-tertiary)' }} />
                          <span>{new Date(leave.leaveDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td>{leave.reason || <span style={{ color: 'var(--text-tertiary)' }}>No reason provided</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-ghost btn-sm btn-icon" 
                          style={{ color: 'var(--danger-500)' }}
                          onClick={() => handleDelete(leave.id)}
                        >
                          <TrashIcon size={16} />
                        </button>
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
              <h2 className={styles.modalTitle}>Log Doctor Leave</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setIsModalOpen(false)}>
                <XIcon size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className={styles.modalBody}>
              <div className="form-group">
                <label className="form-label">Doctor</label>
                <select 
                  className="form-select"
                  required
                  value={formData.doctorId}
                  onChange={e => setFormData({...formData, doctorId: e.target.value})}
                >
                  <option value="" disabled>Select a doctor</option>
                  {mockDoctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Leave Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required 
                  value={formData.leaveDate}
                  onChange={e => setFormData({...formData, leaveDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reason (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Sick leave, Personal, Conference"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                />
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CheckIcon size={16} /> Save Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
