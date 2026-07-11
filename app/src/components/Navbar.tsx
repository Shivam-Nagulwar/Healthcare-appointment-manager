'use client';

import { useState } from 'react';
import { BellIcon, MenuIcon, SearchIcon } from './Icons';

interface NavbarProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Navbar({ title, subtitle, onMenuToggle }: NavbarProps) {
  const [showSearch, setShowSearch] = useState(false);

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
        <button className="navbar-icon-btn">
          <BellIcon />
          <span className="navbar-notification-dot"></span>
        </button>

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
