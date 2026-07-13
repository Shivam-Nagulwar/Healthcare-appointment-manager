'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BellIcon, MenuIcon, SearchIcon, CheckIcon } from './Icons';
import { mockNotifications, mockCurrentUser, mockDoctorUser, mockAdminUser } from '@/lib/mockData';
import type { AppNotification } from '@/lib/mockData';

interface NavbarProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function Navbar({ title, subtitle, onMenuToggle }: NavbarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Determine user based on route for demo purposes
    let userId = '';
    if (pathname.startsWith('/patient')) userId = mockCurrentUser.id;
    else if (pathname.startsWith('/doctor')) userId = mockDoctorUser.id;
    else if (pathname.startsWith('/admin')) userId = mockAdminUser.id;

    if (userId) {
      setNotifications(mockNotifications.filter(n => n.userId === userId));
    }
  }, [pathname]);

  useEffect(() => {
    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {onMenuToggle && (
          <button className="navbar-icon-btn" onClick={onMenuToggle} style={{ display: 'none' }}>
            <MenuIcon />
          </button>
        )}
        <div>
          <h1 className="navbar-title">{title}</h1>
          {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="navbar-right">
        {/* Search */}
        <div style={{ position: 'relative' }}>
          {showSearch && (
            <input
              type="text"
              className="form-input animate-fade-in"
              placeholder="Search..."
              autoFocus
              onBlur={() => setShowSearch(false)}
              style={{
                position: 'absolute',
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 240,
                marginRight: 'var(--space-2)',
              }}
            />
          )}
          <button className="navbar-icon-btn" onClick={() => setShowSearch(!showSearch)}>
            <SearchIcon />
          </button>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className="navbar-icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ color: showNotifications ? 'var(--primary-500)' : undefined }}
          >
            <BellIcon />
            {unreadCount > 0 && <span className="navbar-notification-dot"></span>}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown animate-fade-in-up">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={markAllRead}>
                    <CheckIcon size={14} /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <BellIcon size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="notification-content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notification-time">{timeAgo(notif.timestamp)}</span>
                      </div>
                      {notif.link && (
                        <Link href={notif.link} className="notification-link" onClick={() => setShowNotifications(false)}>
                          View
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Today's Date */}
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          fontWeight: 500,
          padding: '0 var(--space-2)',
        }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>
    </header>
  );
}
