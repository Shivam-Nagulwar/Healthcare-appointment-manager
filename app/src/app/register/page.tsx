'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { StethoscopeIcon, ArrowRightIcon, MailIcon, LockIcon, UserIcon } from '@/components/Icons';
import styles from '../login/page.module.css'; // Re-use the layout styles from Login

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication and route based on role
    if (role === 'PATIENT') router.push('/patient');
    if (role === 'DOCTOR') router.push('/doctor');
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

          <form onSubmit={handleRegister} className={styles.form}>
            {/* Role Selection */}
            <div className={styles.roleSelector}>
              <p className={styles.roleLabel}>I am signing up as a:</p>
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
                  Healthcare Provider
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <div className={styles.inputWrapper}>
                <UserIcon size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <MailIcon size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <LockIcon size={18} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
              Create Account <ArrowRightIcon size={16} />
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
