'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { StethoscopeIcon, ArrowRightIcon, MailIcon, LockIcon } from '@/components/Icons';
import { login } from '@/actions/auth';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    // Explicitly add the role to the formData
    formData.append('role', role);
    
    try {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.success && result?.redirectUrl) {
        // Redirect client-side to prevent Next.js from throwing an error in the try/catch
        router.push(result.redirectUrl);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
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
          <h1 className={styles.visualTitle}>Welcome Back.</h1>
          <p className={styles.visualSubtitle}>
            Access your appointments, medical records, and personalized care seamlessly.
          </p>
          <div className={styles.visualIllustration}>
            <div className={styles.glassCard}>
              <div className={styles.pulseCircle}></div>
              <span>Secure Connection Established</span>
            </div>
          </div>
        </div>
        <div className={styles.authVisualOverlay}></div>
      </div>

      {/* Right side: Login Form */}
      <div className={styles.authFormSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2>Sign in to your account</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            {/* Role Selector */}
            <div className={styles.roleSelector}>
              <p className={styles.roleLabel}>I am a:</p>
              <div className={styles.roleTabs}>
                <button
                  type="button"
                  className={`${styles.roleTab} ${role === 'PATIENT' ? styles.activeTab : ''}`}
                  onClick={() => setRole('PATIENT')}
                >
                  Patient
                </button>
                <button
                  type="button"
                  className={`${styles.roleTab} ${role === 'DOCTOR' ? styles.activeTab : ''}`}
                  onClick={() => setRole('DOCTOR')}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  className={`${styles.roleTab} ${role === 'ADMIN' ? styles.activeTab : ''}`}
                  onClick={() => setRole('ADMIN')}
                >
                  Admin
                </button>
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--danger-500)', fontSize: 'var(--text-sm)', marginBottom: '1rem', padding: '0.75rem', background: 'var(--danger-50)', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <MailIcon size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
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
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" />
                <span>Remember for 30 days</span>
              </label>
              <a href="#" className={styles.forgotPassword}>Forgot password?</a>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isLoading}>
              {isLoading ? 'Signing In...' : (
                <>Sign In <ArrowRightIcon size={16} /></>
              )}
            </button>
          </form>

          <p className={styles.formFooter}>
            Don&apos;t have an account? <Link href="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
