'use client';

import { useState } from 'react';
import { updateSettings } from '@/actions/settings';

export default function SettingsClient({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateSettings(formData);

    setIsSubmitting(false);
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: 'Settings updated successfully.' });
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {message && (
          <div style={{
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: message.type === 'error' ? 'var(--danger-50)' : 'var(--success-50)',
            color: message.type === 'error' ? 'var(--danger-700)' : 'var(--success-700)',
          }}>
            {message.text}
          </div>
        )}

        {/* Basic Info Section */}
        <section>
          <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Account Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" className="input" defaultValue={user.name} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" className="input" defaultValue={user.email} required />
            </div>
            <div className="form-group">
              <label>New Password (Optional)</label>
              <input type="password" name="password" className="input" placeholder="Leave blank to keep current password" />
            </div>
          </div>
        </section>

        {/* Patient Profile Section */}
        {user.role === 'PATIENT' && user.patientProfile && (
          <section>
            <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Patient Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" name="phone" className="input" defaultValue={user.patientProfile.phone || ''} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" className="input" defaultValue={user.patientProfile.dob ? new Date(user.patientProfile.dob).toISOString().split('T')[0] : ''} />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <input type="text" name="bloodGroup" className="input" defaultValue={user.patientProfile.bloodGroup || ''} placeholder="e.g. O+, A-" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" className="input" defaultValue={user.patientProfile.gender || ''}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Emergency Contact</label>
                <input type="text" name="emergencyContact" className="input" defaultValue={user.patientProfile.emergencyContact || ''} placeholder="Name and Phone Number" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <input type="text" name="address" className="input" defaultValue={user.patientProfile.address || ''} />
              </div>
            </div>
          </section>
        )}

        {/* Doctor Profile Section */}
        {user.role === 'DOCTOR' && user.doctorProfile && (
          <section>
            <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Professional Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Specialization</label>
                <input type="text" name="specialization" className="input" defaultValue={user.doctorProfile.specialization || ''} required />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" name="experience" className="input" defaultValue={user.doctorProfile.experience || 0} min="0" required />
              </div>
              <div className="form-group">
                <label>Education</label>
                <input type="text" name="education" className="input" defaultValue={user.doctorProfile.education || ''} />
              </div>
              <div className="form-group">
                <label>Clinic Location</label>
                <input type="text" name="location" className="input" defaultValue={user.doctorProfile.location || ''} />
              </div>
              <div className="form-group">
                <label>Slot Duration (Minutes)</label>
                <select name="slotDurationMin" className="input" defaultValue={user.doctorProfile.slotDurationMin || 30}>
                  <option value="15">15 mins</option>
                  <option value="30">30 mins</option>
                  <option value="45">45 mins</option>
                  <option value="60">60 mins</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Biography</label>
                <textarea name="bio" className="input" rows={4} defaultValue={user.doctorProfile.bio || ''} placeholder="Tell patients about yourself..."></textarea>
              </div>
            </div>
          </section>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
