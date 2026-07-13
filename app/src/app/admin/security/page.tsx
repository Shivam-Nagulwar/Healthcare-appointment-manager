'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { mockAdminUser } from '@/lib/mockData';
import { ShieldIcon, ClockIcon, UsersIcon } from '@/components/Icons';
import styles from './page.module.css';

export default function AdminSecurityPage() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [strictPasswords, setStrictPasswords] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const auditLogs = [
    { id: 1, action: 'Admin Login', user: 'Admin System', time: '10 mins ago', ip: '192.168.1.1' },
    { id: 2, action: 'Doctor Created', user: 'Admin System', time: '1 hour ago', ip: '192.168.1.1' },
    { id: 3, action: 'Leave Record Added', user: 'Admin System', time: '2 hours ago', ip: '192.168.1.1' },
    { id: 4, action: 'Failed Login Attempt', user: 'Unknown', time: '5 hours ago', ip: '10.0.0.42' },
    { id: 5, action: 'System Backup', user: 'System', time: '1 day ago', ip: 'localhost' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="ADMIN" userName={mockAdminUser.name} userEmail={mockAdminUser.email} />
      <div className="main-content">
        <Navbar title="Security & Audit" subtitle="Manage platform security settings and view audit logs" />
        <main className="page-content">
          
          <div className={styles.securityLayout}>
            {/* Settings Panel */}
            <div className={styles.settingsPanel}>
              <div className={styles.panelHeader}>
                <ShieldIcon size={20} style={{ color: 'var(--primary-500)' }} />
                <h3>Global Security Settings</h3>
              </div>
              
              <div className={styles.settingsList}>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <ShieldIcon size={18} style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <h4>Enforce Multi-Factor Authentication (MFA)</h4>
                      <p>Require all doctors and admins to use 2FA.</p>
                    </div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={mfaEnabled} onChange={() => setMfaEnabled(!mfaEnabled)} />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <UsersIcon size={18} style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <h4>Strict Password Policy</h4>
                      <p>Passwords must be 12+ chars with symbols & numbers.</p>
                    </div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={strictPasswords} onChange={() => setStrictPasswords(!strictPasswords)} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <ClockIcon size={18} style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <h4>Session Timeout</h4>
                      <p>Auto-logout users after inactivity.</p>
                    </div>
                  </div>
                  <select 
                    className="form-input" 
                    style={{ width: '140px' }}
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.panelFooter}>
                <button className="btn btn-primary">Save Settings</button>
              </div>
            </div>

            {/* Audit Logs */}
            <div className={`card ${styles.auditCard}`}>
              <div className={styles.panelHeader}>
                <ClockIcon size={20} style={{ color: 'var(--text-tertiary)' }} />
                <h3>Recent Audit Logs</h3>
              </div>
              
              <div className={styles.tableWrapper}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>User</th>
                      <th>IP Address</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span style={{ fontWeight: 500, color: log.action.includes('Failed') ? 'var(--danger-500)' : 'var(--text-primary)' }}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.user}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{log.ip}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
