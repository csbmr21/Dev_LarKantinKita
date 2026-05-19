import React, { useState, useRef, useEffect } from 'react';

const ALL_TABS = [
  { id: 'customer',  label: 'Customer',  icon: '📱', roles: ['customer', 'admin'] },
  { id: 'kasir',    label: 'Kasir',     icon: '🖥️', roles: ['staff',   'admin'] },
  { id: 'merchant', label: 'Merchant',  icon: '🏪', roles: ['owner',   'admin'] },
  { id: 'admin',    label: 'Admin',     icon: '⚙️', roles: ['admin']            },
];

const ROLE_LABEL = {
  customer: 'Customer',
  staff:    'Kasir / Staff',
  owner:    'Merchant',
  admin:    'Administrator',
};

export default function RoleBar({ activeRole, onRoleChange, userRoleName, isAdmin, user, onLogout }) {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const initials = user?.full_name
    ? user.full_name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
    : 'U';

  const roleLabel = ROLE_LABEL[userRoleName] ?? userRoleName;

  // Tabs visible to this user (used inside dropdown for admin)
  const visibleTabs = isAdmin
    ? ALL_TABS
    : ALL_TABS.filter(t => t.roles.includes(userRoleName));

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="kk-rolebar">
      {/* ── Left: Logo ─────────────────────────────── */}
      <div className="kk-logo-mark">KK</div>
      <span className="kk-logo-text">KantinKita</span>

      {/* ── Right: User Identity ───────────────────── */}
      <div className="kk-rolebar-right">
        {/* Role switcher for admin — compact dropdown */}
        {isAdmin && (
          <div style={{ position: 'relative' }} ref={dropRef}>
            <button
              className="kk-view-switch-btn"
              onClick={() => setDropOpen(o => !o)}
              title="Ganti tampilan"
            >
              {ALL_TABS.find(t => t.id === activeRole)?.icon ?? '⚙️'}
              <span style={{ fontSize: 11, fontWeight: 700 }}>
                {ALL_TABS.find(t => t.id === activeRole)?.label}
              </span>
              <span style={{ fontSize: 9, opacity: .6 }}>▼</span>
            </button>

            {dropOpen && (
              <div className="kk-role-dropdown">
                {visibleTabs.map(t => (
                  <button
                    key={t.id}
                    className={`kk-role-dropdown-item ${activeRole === t.id ? 'active' : ''}`}
                    onClick={() => { onRoleChange(t.id); setDropOpen(false); }}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Pill */}
        <div className="kk-user-pill">
          <div className="kk-user-avatar">{initials}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0 }}>
            <span className="kk-user-name">
              {user?.full_name?.split(' ')[0] ?? 'User'}
            </span>
            <span style={{ fontSize: 9, color: 'var(--c-primary-400)', fontWeight: 700, lineHeight: 1 }}>
              {roleLabel}
            </span>
          </div>
        </div>

        <button className="kk-logout-btn" onClick={onLogout} title="Keluar">⏏</button>
      </div>
    </div>
  );
}
