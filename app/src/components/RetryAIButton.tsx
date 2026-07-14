'use client';

import { useState } from 'react';
import { SparklesIcon } from '@/components/Icons';
import { retryAIGeneration } from '@/actions/appointments';

export default function RetryAIButton({ appointmentId }: { appointmentId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    const res = await retryAIGeneration(appointmentId);
    if (res?.error) {
      setError(res.error);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <button
        onClick={handleRetry}
        disabled={isLoading}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <SparklesIcon size={16} />
        {isLoading ? 'Generating Summary...' : 'Retry AI Generation'}
      </button>
      {error && (
        <p style={{ color: 'var(--danger-500)', fontSize: 'var(--text-xs)', textAlign: 'center', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
