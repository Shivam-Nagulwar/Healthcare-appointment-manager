'use client';

import { useState } from 'react';
import { triggerMedicationReminders, triggerAppointmentReminders } from '@/actions/cron';
import { ActivityIcon, CalendarIcon } from '@/components/Icons';

export default function CronTriggerCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleTriggerMedications = async () => {
    setIsLoading(true);
    setMessage(null);
    const result = await triggerMedicationReminders();
    if (result.error) setMessage({ text: result.error, type: 'error' });
    else setMessage({ text: `Success! Sent ${result.count} medication reminders.`, type: 'success' });
    setIsLoading(false);
  };

  const handleTriggerAppointments = async () => {
    setIsLoading(true);
    setMessage(null);
    const result = await triggerAppointmentReminders();
    if (result.error) setMessage({ text: result.error, type: 'error' });
    else setMessage({ text: `Success! Sent ${result.count} appointment reminders.`, type: 'success' });
    setIsLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ActivityIcon size={20} style={{ color: 'var(--primary-500)' }} />
            System Cron Jobs
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Manually trigger background tasks (usually run via Vercel Cron).
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Medication Reminders</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Scans active prescriptions and notifies patients.</p>
          </div>
          <button className="btn btn-primary" onClick={handleTriggerMedications} disabled={isLoading}>
            {isLoading ? 'Running...' : 'Run Cron'}
          </button>
        </div>

        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Appointment Reminders (24h)</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Sends emails for appointments happening tomorrow.</p>
          </div>
          <button className="btn btn-primary" onClick={handleTriggerAppointments} disabled={isLoading}>
            {isLoading ? 'Running...' : 'Run Cron'}
          </button>
        </div>
      </div>
      
      {message && (
        <div style={{ 
          marginTop: 'var(--space-4)', 
          padding: 'var(--space-3)', 
          borderRadius: 'var(--radius-sm)',
          backgroundColor: message.type === 'success' ? 'var(--success-50)' : 'var(--danger-50)',
          color: message.type === 'success' ? 'var(--success-700)' : 'var(--danger-700)',
          fontSize: 'var(--text-sm)'
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
