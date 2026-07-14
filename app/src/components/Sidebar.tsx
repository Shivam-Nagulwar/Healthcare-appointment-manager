'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import {
  HomeIcon, CalendarIcon, SearchIcon, ClipboardIcon,
  UsersIcon, UserIcon, SettingsIcon, LogOutIcon,
  SunIcon, MoonIcon, HeartIcon, BarChartIcon,
  StethoscopeIcon, ShieldIcon,
} from './Icons';
import type { Role } from '@prisma/client';
import { logout } from '@/actions/auth';

interface SidebarProps {
  role: Role;
  userName: string;
  userEmail: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

function getNavSections(role: Role): NavSection[] {
  switch (role) {
    case 'PATIENT':
      return [
        {
          items: [
            { label: 'Dashboard', href: '/patient', icon: <HomeIcon /> },
            { label: 'Find Doctors', href: '/patient/doctors', icon: <SearchIcon /> },
            { label: 'My Appointments', href: '/patient/appointments', icon: <CalendarIcon />, badge: 2 },
          ],
        },
        {
          label: 'Health',
          items: [
            { label: 'Medical Records', href: '/patient/records', icon: <ClipboardIcon /> },
            { label: 'Prescriptions', href: '/patient/prescriptions', icon: <HeartIcon /> },
          ],
        },
      ];
    case 'DOCTOR':
      return [
        {
          items: [
            { label: 'Dashboard', href: '/doctor', icon: <HomeIcon /> },
            { label: 'Appointments', href: '/doctor/appointments', icon: <CalendarIcon />, badge: 3 },
          ],
        },
        {
          label: 'Patients',
          items: [
            { label: 'My Patients', href: '/doctor/patients', icon: <UsersIcon /> },
            { label: 'Clinical Notes', href: '/doctor/notes', icon: <ClipboardIcon /> },
          ],
        },
      ];
    case 'ADMIN':
      return [
        {
          items: [
            { label: 'Dashboard', href: '/admin', icon: <HomeIcon /> },
            { label: 'Manage Doctors', href: '/admin/doctors', icon: <StethoscopeIcon /> },
          ],
        },
        {
          label: 'Management',
          items: [
            { label: 'Leave Calendar', href: '/admin/leaves', icon: <CalendarIcon /> },
            { label: 'Analytics', href: '/admin/analytics', icon: <BarChartIcon /> },
          ],
        },
      ];
  }
}

function getRoleColor(role: Role): string {
  switch (role) {
    case 'PATIENT': return 'var(--primary-500)';
    case 'DOCTOR': return 'var(--success-500)';
    case 'ADMIN': return 'var(--accent-500)';
  }
}

function getRoleLabel(role: Role): string {
  switch (role) {
    case 'PATIENT': return 'Patient';
    case 'DOCTOR': return 'Doctor';
    case 'ADMIN': return 'Administrator';
  }
}

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const navSections = getNavSections(role);

  const isActive = (href: string) => {
    if (href === `/${role.toLowerCase()}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <HeartIcon size={20} />
        </div>
        <div className="sidebar-logo-text">
          Med<span>Care</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.label && (
              <div className="sidebar-section-label">{section.label}</div>
            )}
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="sidebar-link-badge">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        ))}

        {/* Settings */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
          <div className="sidebar-section-label">Preferences</div>
          <button
            className="sidebar-link"
            onClick={toggleTheme}
            style={{ width: '100%', border: 'none', cursor: 'pointer' }}
          >
            <span className="sidebar-link-icon">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </span>
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <Link href="/settings" className="sidebar-link">
            <span className="sidebar-link-icon"><SettingsIcon /></span>
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* User info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar avatar-sm avatar-primary">
            {userName.charAt(0)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-role" style={{ color: getRoleColor(role) }}>
              {getRoleLabel(role)}
            </div>
          </div>
          <form action={logout} style={{ marginLeft: 'auto' }}>
            <button
              type="submit"
              className="btn btn-ghost btn-icon"
              title="Sign Out"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <LogOutIcon size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
