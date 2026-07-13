'use client';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { mockAdminUser, mockAppointments, mockDoctors } from '@/lib/mockData';
import { UsersIcon, StethoscopeIcon, CalendarIcon, ActivityIcon } from '@/components/Icons';
import styles from './page.module.css';

export default function AdminAnalyticsPage() {
  const totalPatients = 14; // Mocked fallback number
  const totalDoctors = mockDoctors.length;
  const totalAppointments = mockAppointments.length;
  
  const completedAppointments = mockAppointments.filter(a => a.status === 'COMPLETED').length;
  const completionRate = Math.round((completedAppointments / totalAppointments) * 100) || 0;

  // Mock bar chart data for Appointments over last 7 days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = [12, 19, 15, 25, 22, 10, 8];
  const maxVal = Math.max(...chartData);

  return (
    <div className="dashboard-layout">
      <Sidebar role="ADMIN" userName={mockAdminUser.name} userEmail={mockAdminUser.email} />
      <div className="main-content">
        <Navbar title="Platform Analytics" subtitle="Monitor platform usage and trends" />
        <main className="page-content">
          
          {/* KPI Cards */}
          <div className={styles.kpiGrid}>
            <div className={`card ${styles.kpiCard} animate-fade-in-up stagger-1`}>
              <div className={styles.kpiHeader}>
                <h3 className={styles.kpiTitle}>Total Patients</h3>
                <div className={`${styles.kpiIcon} ${styles.iconPatient}`}><UsersIcon size={20} /></div>
              </div>
              <div className={styles.kpiValue}>{totalPatients * 125}</div>
              <div className={styles.kpiTrend}><span className={styles.trendUp}>+12%</span> from last month</div>
            </div>
            
            <div className={`card ${styles.kpiCard} animate-fade-in-up stagger-2`}>
              <div className={styles.kpiHeader}>
                <h3 className={styles.kpiTitle}>Active Doctors</h3>
                <div className={`${styles.kpiIcon} ${styles.iconDoctor}`}><StethoscopeIcon size={20} /></div>
              </div>
              <div className={styles.kpiValue}>{totalDoctors}</div>
              <div className={styles.kpiTrend}><span className={styles.trendUp}>+2</span> from last month</div>
            </div>

            <div className={`card ${styles.kpiCard} animate-fade-in-up stagger-3`}>
              <div className={styles.kpiHeader}>
                <h3 className={styles.kpiTitle}>Total Appointments</h3>
                <div className={`${styles.kpiIcon} ${styles.iconAppt}`}><CalendarIcon size={20} /></div>
              </div>
              <div className={styles.kpiValue}>{totalAppointments * 42}</div>
              <div className={styles.kpiTrend}><span className={styles.trendUp}>+18%</span> from last month</div>
            </div>

            <div className={`card ${styles.kpiCard} animate-fade-in-up stagger-4`}>
              <div className={styles.kpiHeader}>
                <h3 className={styles.kpiTitle}>Completion Rate</h3>
                <div className={`${styles.kpiIcon} ${styles.iconRate}`}><ActivityIcon size={20} /></div>
              </div>
              <div className={styles.kpiValue}>{completionRate}%</div>
              <div className={styles.kpiTrend}><span className={styles.trendDown}>-2%</span> from last month</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className={styles.chartsRow}>
            {/* Appointments Trend */}
            <div className={`card ${styles.chartCard} animate-fade-in-up`} style={{ animationDelay: '200ms' }}>
              <div className={styles.chartHeader}>
                <h3>Appointments (Last 7 Days)</h3>
              </div>
              <div className={styles.barChart}>
                {chartData.map((val, idx) => (
                  <div key={idx} className={styles.barWrapper}>
                    <div className={styles.barTooltip}>{val} appts</div>
                    <div 
                      className={styles.bar} 
                      style={{ height: `${(val / maxVal) * 100}%` }}
                    ></div>
                    <span className={styles.barLabel}>{days[idx]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Demographics / Quick Stats */}
            <div className={`card ${styles.chartCard} animate-fade-in-up`} style={{ animationDelay: '250ms' }}>
              <div className={styles.chartHeader}>
                <h3>Specialty Distribution</h3>
              </div>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <div className={styles.statInfo}>
                    <span className={styles.statDot} style={{ background: 'var(--primary-500)' }}></span>
                    <span className={styles.statName}>General Physician</span>
                  </div>
                  <span className={styles.statNum}>42%</span>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statInfo}>
                    <span className={styles.statDot} style={{ background: 'var(--accent-500)' }}></span>
                    <span className={styles.statName}>Cardiology</span>
                  </div>
                  <span className={styles.statNum}>28%</span>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statInfo}>
                    <span className={styles.statDot} style={{ background: 'var(--success-500)' }}></span>
                    <span className={styles.statName}>Dermatology</span>
                  </div>
                  <span className={styles.statNum}>18%</span>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statInfo}>
                    <span className={styles.statDot} style={{ background: 'var(--warning-500)' }}></span>
                    <span className={styles.statName}>Neurology</span>
                  </div>
                  <span className={styles.statNum}>12%</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
