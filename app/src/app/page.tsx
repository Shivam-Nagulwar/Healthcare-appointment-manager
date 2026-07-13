'use client';

import Link from 'next/link';
import { useTheme } from '@/lib/ThemeContext';
import {
  HeartIcon, CalendarIcon, SparklesIcon, ShieldIcon,
  UserIcon, StethoscopeIcon, SunIcon, MoonIcon,
  ChevronRightIcon, StarFilledIcon, ClockIcon,
  SearchIcon, BellIcon, ActivityIcon,
} from '@/components/Icons';
import styles from './page.module.css';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.landing}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <HeartIcon size={20} />
            </div>
            <span className={styles.logoText}>Med<span>Care</span></span>
          </div>
          <nav className={styles.topNav}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#portals" className={styles.navLink}>Portals</a>
            <button onClick={toggleTheme} className={styles.themeBtn}>
              {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </button>
            <Link href="/login" className="btn btn-primary">
              Get Started <ChevronRightIcon size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <SparklesIcon size={14} />
            AI-Powered Healthcare Platform
          </div>
          <h1 className={styles.heroTitle}>
            Your Health,<br />
            <span className={styles.heroGradient}>Simplified.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Book appointments, get AI-generated pre-visit summaries, receive smart post-visit
            insights, and stay on top of your health — all in one beautiful platform.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/register" className="btn btn-primary btn-lg">
              <CalendarIcon size={18} />
              Book an Appointment
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Login to Portals
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>6+</span>
              <span className={styles.heroStatLabel}>Specialist Doctors</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>500+</span>
              <span className={styles.heroStatLabel}>Patient Reviews</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>AI</span>
              <span className={styles.heroStatLabel}>Gemini Powered</span>
            </div>
          </div>
        </div>

        {/* Hero Visual - Floating Cards */}
        <div className={styles.heroVisual}>
          <div className={`${styles.floatingCard} ${styles.float1}`}>
            <div className={styles.floatingCardIcon} style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <CalendarIcon size={20} />
            </div>
            <div>
              <div className={styles.floatingCardTitle}>Next Appointment</div>
              <div className={styles.floatingCardValue}>Tomorrow, 10:00 AM</div>
            </div>
          </div>
          <div className={`${styles.floatingCard} ${styles.float2}`}>
            <div className={styles.floatingCardIcon} style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
              <SparklesIcon size={20} />
            </div>
            <div>
              <div className={styles.floatingCardTitle}>AI Summary Ready</div>
              <div className={styles.floatingCardValue}>Pre-visit analysis complete</div>
            </div>
          </div>
          <div className={`${styles.floatingCard} ${styles.float3}`}>
            <div className={styles.floatingCardIcon} style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
              <BellIcon size={20} />
            </div>
            <div>
              <div className={styles.floatingCardTitle}>Medication Reminder</div>
              <div className={styles.floatingCardValue}>Paracetamol 500mg — 2:00 PM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.featuresInner}>
          <h2 className={styles.sectionTitle}>Everything You Need for Better Healthcare</h2>
          <p className={styles.sectionSubtitle}>Powered by AI, designed for humans.</p>
          <div className={styles.featureGrid}>
            <div className={`card ${styles.featureCard} animate-fade-in-up`}>
              <div className={styles.featureIcon} style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                <SearchIcon size={24} />
              </div>
              <h3>Smart Doctor Search</h3>
              <p>Find doctors by specialization, view ratings, and check real-time availability — all in one search.</p>
            </div>
            <div className={`card ${styles.featureCard} animate-fade-in-up`} style={{ animationDelay: '100ms' }}>
              <div className={styles.featureIcon} style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
                <CalendarIcon size={24} />
              </div>
              <h3>Instant Booking</h3>
              <p>Book appointments with a few clicks. Slot-hold mechanism ensures your chosen time won&apos;t be taken.</p>
            </div>
            <div className={`card ${styles.featureCard} animate-fade-in-up`} style={{ animationDelay: '200ms' }}>
              <div className={styles.featureIcon} style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
                <SparklesIcon size={24} />
              </div>
              <h3>AI Health Summaries</h3>
              <p>Get AI-generated pre-visit summaries from your symptoms and patient-friendly post-visit notes.</p>
            </div>
            <div className={`card ${styles.featureCard} animate-fade-in-up`} style={{ animationDelay: '300ms' }}>
              <div className={styles.featureIcon} style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
                <BellIcon size={24} />
              </div>
              <h3>Smart Notifications</h3>
              <p>Automated email confirmations, reminders, and medication alerts — never miss a dose.</p>
            </div>
            <div className={`card ${styles.featureCard} animate-fade-in-up`} style={{ animationDelay: '400ms' }}>
              <div className={styles.featureIcon} style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
                <ShieldIcon size={24} />
              </div>
              <h3>Double-Booking Prevention</h3>
              <p>Database-level constraints guarantee no two patients can book the same slot — ever.</p>
            </div>
            <div className={`card ${styles.featureCard} animate-fade-in-up`} style={{ animationDelay: '500ms' }}>
              <div className={styles.featureIcon} style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--accent-50))', color: 'var(--primary-600)' }}>
                <ActivityIcon size={24} />
              </div>
              <h3>Google Calendar Sync</h3>
              <p>Appointments sync directly to your Google Calendar for both patients and doctors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Selection */}
      <section id="portals" className={styles.portals}>
        <div className={styles.portalsInner}>
          <h2 className={styles.sectionTitle}>Choose Your Portal</h2>
          <p className={styles.sectionSubtitle}>Three role-based experiences tailored for every user.</p>
          <div className={styles.portalGrid}>
            <Link href="/patient" className={`${styles.portalCard} ${styles.portalPatient}`}>
              <div className={styles.portalIcon}>
                <UserIcon size={32} />
              </div>
              <h3>Patient Portal</h3>
              <p>Search doctors, book appointments, submit symptoms, and view AI-generated health summaries.</p>
              <span className={styles.portalCta}>
                Enter as Patient <ChevronRightIcon size={16} />
              </span>
            </Link>
            <Link href="/doctor" className={`${styles.portalCard} ${styles.portalDoctor}`}>
              <div className={styles.portalIcon}>
                <StethoscopeIcon size={32} />
              </div>
              <h3>Doctor Portal</h3>
              <p>View today&apos;s schedule, review pre-visit AI summaries, and submit post-visit clinical notes.</p>
              <span className={styles.portalCta}>
                Enter as Doctor <ChevronRightIcon size={16} />
              </span>
            </Link>
            <Link href="/admin" className={`${styles.portalCard} ${styles.portalAdmin}`}>
              <div className={styles.portalIcon}>
                <ShieldIcon size={32} />
              </div>
              <h3>Admin Portal</h3>
              <p>Manage doctor profiles, configure leave calendars, and oversee the entire clinic operations.</p>
              <span className={styles.portalCta}>
                Enter as Admin <ChevronRightIcon size={16} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <HeartIcon size={18} />
            </div>
            <span className={styles.logoText}>Med<span>Care</span></span>
          </div>
          <p className={styles.footerText}>
            Healthcare Appointment & Follow-up Manager — Built with Next.js, PostgreSQL, Prisma, and Gemini AI.
          </p>
          <p className={styles.footerCopy}>© 2026 MedCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
