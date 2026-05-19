import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../../../api/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import RoleBar from './RoleBar';
import CustomerView from './CustomerView';
import KasirView from './KasirView';
import MerchantView from './MerchantView';
import AdminView from './AdminView';
import './shell.css';

// Map user role -> view key
const ROLE_MAP = {
  customer: 'customer',
  staff:    'kasir',
  owner:    'merchant',
  admin:    'admin',
};

export default function AppShell() {
  const { user, logout, getRole, isImpersonating, stopImpersonating } = useAuthStore();
  const navigate = useNavigate();

  const userRoleName = getRole() ?? 'customer';
  const defaultView  = ROLE_MAP[userRoleName] || 'customer';
  const isAdmin      = userRoleName === 'admin';

  const [activeRole, setActiveRole] = useState(defaultView);

  // Sync if user role changes
  useEffect(() => { setActiveRole(defaultView); }, [defaultView]);

  const handleLogout = async () => {
    // If impersonating, stop instead of full logout
    if (isImpersonating) {
      stopImpersonating();
      return;
    }
    try { await authApi.logout(); } catch (_) {}
    logout();
    navigate('/login', { replace: true });
    toast.success('Berhasil keluar');
  };

  return (
    <div className="kk-shell">
      <RoleBar
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        userRoleName={userRoleName}
        isAdmin={isAdmin}
        user={user}
        onLogout={handleLogout}
      />
      <div className="kk-views">
        {activeRole === 'customer'  && <div className="kk-view active"><CustomerView /></div>}
        {activeRole === 'kasir'     && <div className="kk-view active"><KasirView /></div>}
        {activeRole === 'merchant'  && <div className="kk-view active"><MerchantView /></div>}
        {activeRole === 'admin'     && <div className="kk-view active"><AdminView /></div>}
      </div>
    </div>
  );
}
