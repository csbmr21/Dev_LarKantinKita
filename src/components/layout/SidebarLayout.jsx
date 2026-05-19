import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import ImpersonationBanner from '../shared/ImpersonationBanner';

function SidebarLayout({ navItems, children }) {
  const [open, setOpen] = useState(false);
  const { user, logout, can } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) {}
    logout();
    navigate('/login', { replace: true });
    toast.success('Berhasil keluar');
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  const sidebar = (
    <aside style={{ fontFamily: 'var(--font-sans)' }} className={clsx(
      'flex flex-col w-60 bg-white border-r border-gray-100 h-full',
    )}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div style={{ width:30, height:30, borderRadius:'var(--r-sm)', background:'var(--c-primary-700)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'white' }}>KK</div>
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:'var(--c-primary-700)' }}>KantinKita</p>
            <p style={{ fontSize:10, color:'var(--c-neutral-400)', textTransform:'capitalize' }}>{user?.role?.name || user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path.split('/').length <= 2}
            onClick={() => setOpen(false)}
            style={({ isActive }) => isActive
              ? { background:'var(--c-primary-50)', color:'var(--c-primary-700)', borderRadius:'var(--r-lg)' }
              : {}}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              )
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--c-primary-700)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:700, flexShrink:0, overflow:'hidden' }}>
            {user?.photo_url ? (
               <img src={user.photo_url} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} referrerPolicy="no-referrer" />
            ) : (
               user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ color:'var(--c-red-500)' }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <ImpersonationBanner />
      <div className="flex flex-1 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">{sidebar}</div>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-50 flex w-60">{sidebar}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setOpen(true)}
          >
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {user?.photo_url ? (
                <img src={user.photo_url} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.full_name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
  );
}

export { SidebarLayout };
