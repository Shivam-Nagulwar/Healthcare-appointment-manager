'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/actions/auth';
import { StethoscopeIcon, ArrowRightIcon, MailIcon, LockIcon, UserIcon } from '@/components/Icons';
import styles from '../login/page.module.css'; 

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('role', 'PATIENT');

    try {
      const res = await registerUser(formData);
      
      if (res?.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else if (res?.success && res?.redirectUrl) {
        router.push(res.redirectUrl);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Left side: Branding / Visual */}
      <div className={styles.authVisual}>
        <div className={styles.visualContent}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <StethoscopeIcon size={24} />
            </div>
            <span className={styles.logoText}>CareSync</span>
          </Link>
          <h1 className={styles.visualTitle}>Join Us Today.</h1>
          <p className={styles.visualSubtitle}>
            Create your account to start booking appointments, managing records, and connecting with specialists.
          </p>
          <div className={styles.visualIllustration}>
            <div className={styles.glassCard}>
              <div className={styles.pulseCircle} style={{ background: 'var(--accent-400)' }}></div>
              <span>Network Sync Active</span>
            </div>
          </div>
        </div>
        <div className={styles.authVisualOverlay}></div>
      </div>

      {/* Right side: Register Form */}
      <div className={styles.authFormSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2>Create an account</h2>
            <p>Enter your details below to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div style={{ color: 'var(--danger-500)', fontSize: '14px', marginBottom: '10px' }}>
                {error}
              </div>
            )}


            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <div className={styles.inputWrapper}>
                <UserIcon size={18} className={styles.inputIcon} />
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <MailIcon size={18} className={styles.inputIcon} />
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <LockIcon size={18} className={styles.inputIcon} />
                <input
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'} <ArrowRightIcon size={16} />
            </button>
          </form>

          <p className={styles.formFooter}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
