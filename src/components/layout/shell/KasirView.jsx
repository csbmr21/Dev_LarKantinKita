import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { orderApi }    from '../../../api/order';
import { unwrap }      from '../../../utils/api';
import { useRealtime } from '../../../hooks/useRealtime';
import MenuManagement   from '../../../pages/staff/MenuManagement';
import toast            from 'react-hot-toast';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// Eager imports – critical for POS flow
import ErrorBoundary       from './kasir/ErrorBoundary';
import DailySummaryWidget  from './kasir/DailySummaryWidget';
import PosPage             from './kasir/PosPage';
import OrdersKanban        from './kasir/OrdersKanban';

// Lazy imports – non-critical screens
const ReportsSubpage = React.lazy(() => import('./kasir/ReportsSubpage'));
const StaffPage      = React.lazy(() => import('./kasir/StaffPage'));
const SettingsPage   = React.lazy(() => import('./kasir/SettingsPage'));

import { NOTIFICATION_SOUND_URL } from './kasir/constants';

/* ── Shell fallback spinner ──────────────────────────── */
function ShellFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-[#2D6A4F]/20 border-t-[#2D6A4F] rounded-full animate-spin" />
    </div>
  );
}

/* ============================================================
   KASIR VIEW SHELL
   ============================================================ */
export default function KasirView() {
  const { user, logout } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('kasir-active-tab') || 'pos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const audioRef = useRef(new Audio(NOTIFICATION_SOUND_URL));
  const prevOrdersRef = useRef([]);

  const tenantId = user?.tenant_id ?? user?.tenant?.id ?? null;

  // Real-time via Pusher — subscribe to tenant channel
  useRealtime(tenantId ? `tenant.${tenantId}` : null, {
    NewOrderReceived: () => {
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
      qc.invalidateQueries({ queryKey: ['staff-order-summary'] });
    },
    OrderStatusChanged: () => {
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
      qc.invalidateQueries({ queryKey: ['staff-order-summary'] });
    },
  });

  useEffect(() => {
    localStorage.setItem('kasir-active-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ['staff-orders'],
    queryFn: () => orderApi.getStaffOrders().then(unwrap).catch(() => []),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!Array.isArray(orders)) return;
    const newPaidOrders = orders.filter(o => o.status === 'paid');
    const prevPaidIds = (prevOrdersRef.current || []).filter(o => o.status === 'paid').map(o => o.id);
    const hasNew = newPaidOrders.some(o => !prevPaidIds.includes(o.id));
    
    if (hasNew && prevOrdersRef.current.length > 0) {
      audioRef.current.play().catch(() => {});
      toast.success('🔔 Pesanan baru masuk!', { icon: '📥', duration: 4000, position: 'bottom-right' });
    }
    prevOrdersRef.current = orders;
  }, [orders]);

  const menuItems = useMemo(() => [
    { id: 'pos', label: 'Point of Sale', icon: '🧾', section: 'Transaksi' },
    { id: 'orders', label: 'Daftar Order', icon: '📋', section: 'Transaksi', badge: true, count: orders.filter(o => o.status === 'paid').length },
    { id: 'menu', label: 'Kelola Menu', icon: '🍛', section: 'Manajemen' },
    { id: 'staff', label: 'Data Staff', icon: '👥', section: 'Manajemen' },
    { id: 'reports_daily', label: 'Laporan Harian', icon: '📊', section: 'Laporan' },
    { id: 'reports_weekly', label: 'Laporan Mingguan', icon: '📈', section: 'Laporan' },
    { id: 'settings', label: 'Pengaturan Kasir', icon: '⚙️', section: 'Konfigurasi' },
  ], [orders]);

  const handleLogout = useCallback(() => {
    toast.promise(logout(), {
      loading: 'Keluar...',
      success: 'Sampai jumpa lagi!',
      error: 'Gagal keluar.',
    });
  }, [logout]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#F9FAFB] font-sans">
      {/* Mobile hamburger */}
      <button className="kk-mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
        <span style={{fontSize:18}}>{sidebarOpen ? '\u2715' : '\u2630'}</span>
      </button>
      <div className={`kk-sidebar-overlay ${sidebarOpen ? 'kk-sidebar-open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* SIDEBAR */}
      <div className={`w-[240px] bg-[#081C0F] flex flex-col flex-shrink-0 shadow-2xl z-20 kk-shell-sidebar ${sidebarOpen ? 'kk-sidebar-open' : ''}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5 flex-shrink-0">
          <div className="w-9 h-9 bg-[#52B788] rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg shadow-emerald-900/40">KK</div>
          <div className="min-w-0">
            <p className="text-[15px] font-black text-white leading-none tracking-tight">KantinKita</p>
            <p className="text-[10px] text-white/30 font-bold mt-1.5 truncate uppercase tracking-tighter">
              {user?.tenant?.tenant_name || user?.tenant?.name || 'Staff Kasir'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {['Transaksi', 'Manajemen', 'Laporan', 'Konfigurasi'].map(section => (
            <div key={section} className="mb-6">
              <p className="px-6 py-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{section}</p>
              {menuItems.filter(item => item.section === section).map(item => (
                <button
                  key={item.id}
                  onClick={() => {setActiveTab(item.id); setSidebarOpen(false);}}
                  className={`w-full flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-bold transition-all group ${
                    activeTab === item.id 
                      ? 'bg-[#52B788]/15 text-[#52B788] border-r-[4px] border-[#52B788]' 
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span className={`text-lg leading-none transition-transform group-hover:scale-110 ${activeTab === item.id ? 'opacity-100' : 'opacity-50'}`}>{item.icon}</span>
                  <span className="flex-1 text-left tracking-wide">{item.label}</span>
                  {item.badge && item.count > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse shadow-lg shadow-red-900/20">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xs font-black text-white border border-white/10 shadow-inner">
              {user?.username?.charAt(0).toUpperCase() || 'K'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black text-white/90 truncate tracking-tight">{user?.full_name || user?.username}</p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mt-0.5">Shift Pagi</p>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">
              {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F0FBF3] rounded-full border border-[#D8F3DC]/50 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black text-[#059669] uppercase tracking-[0.15em]">Shift Aktif</span>
            </div>
            <div className="px-5 py-2 bg-gray-50 rounded-[14px] border border-gray-100 font-mono text-[12px] font-black text-gray-500 shadow-inner">
              {time.toLocaleTimeString('id-ID', { hour12: false })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <React.Suspense fallback={<ShellFallback />}>
              {activeTab === 'pos' && <PosPage time={time} />}
              {activeTab === 'orders' && <OrdersKanban orders={orders} />}
              {activeTab === 'menu' && (
                <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
                  <MenuManagement />
                </div>
              )}
              {activeTab === 'staff' && <StaffPage />}
              {activeTab === 'reports_daily' && <ReportsSubpage type="daily" />}
              {activeTab === 'reports_weekly' && <ReportsSubpage type="weekly" />}
              {activeTab === 'settings' && <SettingsPage />}
            </React.Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
