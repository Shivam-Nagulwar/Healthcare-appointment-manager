'use client';

import { useState } from 'react';
import { cancelAppointment } from '@/actions/appointments';

export default function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    const res = await cancelAppointment(appointmentId);
    if (res.error) {
      alert(res.error);
    }
    setIsLoading(false);
  };

  return (
    <button 
      className="btn btn-ghost" 
      style={{ color: 'var(--danger-500)' }}
      onClick={handleCancel}
      disabled={isLoading}
    >
      {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
    </button>
  );
}
