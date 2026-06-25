import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { orderApi }    from '../../../api/order';
import { adminApi }     from '../../../api/admin';
import { reportApi }   from '../../../api/report';
import { tenantApi }   from '../../../api/tenant';
import { unwrap, fmt } from '../../../utils/api';
import { useRealtime } from '../../../hooks/useRealtime';
import toast           from 'react-hot-toast';
import { 
  ChartBarIcon, 
  ClipboardDocumentListIcon, 
  StarIcon, 
  ArrowTrendingUpIcon, 
  BuildingStorefrontIcon, 
  UsersIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  BoltIcon, 
  ShieldCheckIcon,
  CheckIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  FireIcon,
  CubeIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

// Fully-implemented owner sub-pages (already have their own API integration)
import MenuManagement from '../../../pages/staff/MenuManagement';
import StaffManagement from '../../../pages/owner/StaffManagement';
import OwnerReport    from '../../../pages/owner/Report';
import OwnerRefund    from '../../../pages/owner/Refund';

/* ── HELPERS ─────────────────────────────────────────── */
// fmt, unwrap imported from utils/api.js


/* ============================================================
   OVERVIEW PAGE  –  KPI + chart + top menus from real API
   ============================================================ */
function OverviewPage() {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['owner-aggregate'],
    queryFn: () => reportApi.getAggregateReport().then(r => r?.data ?? {}).catch(() => ({})),
    refetchInterval: 60000,
  });

  const stats    = reportData?.summary ?? {};
  const topMenus = reportData?.top_menus ?? [];
  const barData  = reportData?.daily_revenue ?? [];
  const maxRev   = barData.length > 0 ? Math.max(...barData.map(d => d.total ?? 0), 1) : 1;

  const formatTrend = (val) => {
    if (val === undefined || val === null) return '0%';
    return val > 0 ? `+${val}%` : `${val}%`;
  };

  const KPI = [
    { label: 'Omset Penjualan', value: fmt(stats.total_revenue ?? 0), icon: '💰', trend: formatTrend(stats.revenue_trend), color: 'from-[#2D6A4F] to-[#1B4332]', textColor: 'text-white' },
    { label: 'Total Pesanan',   value: stats.total_orders ?? 0,      icon: '📋', trend: formatTrend(stats.orders_trend),  color: 'from-white to-gray-50',     textColor: 'text-gray-900', border: true },
    { label: 'Rating Tenant',   value: stats.avg_rating ? stats.avg_rating.toFixed(1) : 'Belum ada', icon: '⭐', trend: '-', color: 'from-white to-gray-50', textColor: 'text-gray-900', border: true },
  ];

  if (isLoading) return <div className="p-8 grid grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-[32px] animate-pulse" />)}</div>;

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-6">
        {KPI.map((s, i) => (
          <div key={i} className={`relative overflow-hidden p-8 rounded-[40px] shadow-sm flex flex-col justify-between group transition-all hover:shadow-xl ${s.border ? 'border border-gray-100' : ''} bg-gradient-to-br ${s.color}`}>
            {!s.border && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />}
            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-sm ${s.border ? 'bg-gray-50 border border-gray-100' : 'bg-white/20 border border-white/10'}`}>{s.icon}</div>
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 ${s.border ? 'text-gray-400' : 'text-white/60'}`}>{s.label}</p>
              <p className={`text-3xl font-black tracking-tighter ${s.textColor}`}>{s.value}</p>
            </div>
            <div className={`mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${s.border ? 'text-emerald-500' : 'text-white/80'}`}>
              <span className={`px-2 py-1 rounded-lg ${s.border ? 'bg-emerald-50 text-emerald-600' : 'bg-black/20'}`}>
                {s.trend.startsWith('+') ? '▲ ' : s.trend.startsWith('-') && s.trend !== '-' ? '▼ ' : ''}{s.trend}
              </span>
              <span className={s.border ? 'text-gray-300' : 'text-white/40'}>vs bulan lalu</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Omset 7 hari */}
        <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] mb-1">Tren Omset Mingguan</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">7 Hari Terakhir</p>
            </div>
            <ChartBarIcon className="w-5 h-5 text-gray-300 group-hover:text-[#52B788] transition-colors" />
          </div>
          <div className="flex-1 flex items-end gap-4 min-h-[180px] pb-4">
            {barData.length > 0 ? barData.map((d, i) => {
              const height = maxRev > 0 ? Math.round((d.total / maxRev) * 100) : 5;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-4 group/bar">
                  <div className="w-full bg-gray-50 rounded-2xl relative overflow-hidden h-full shadow-inner border border-gray-100/50">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-[#52B788] group-hover/bar:bg-[#2D6A4F] transition-all duration-700 rounded-2xl shadow-lg shadow-emerald-900/10" 
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute top-2 left-0 w-full h-4 bg-white/20 blur-sm opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover/bar:text-gray-900 transition-colors">{d.day}</span>
                </div>
              );
            }) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-300 uppercase tracking-widest">Belum ada data</div>
            )}
          </div>
        </div>

        {/* Top menu */}
        <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
            <div>
              <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] mb-1">Menu Terlaris</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bulan Ini</p>
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-[#52B788]" />
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {topMenus.length > 0 ? topMenus.map((m, i) => {
              const maxCount = (topMenus[0]?.count ?? 1) || 1;
              return (
                <div key={i} className="flex items-center gap-5 group/item">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm transition-transform group-hover/item:scale-110 ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-gray-100 text-gray-500' : 'bg-[#F0FBF3] text-[#2D6A4F]'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2.5">
                      <p className="text-[13px] font-black text-gray-900 truncate group-hover/item:text-[#2D6A4F] transition-colors">{m.name}</p>
                      <p className="text-[12px] font-black text-gray-400">{m.count} <span className="text-[10px] uppercase">porsi</span></p>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100">
                      <div 
                        className="h-full bg-gradient-to-r from-[#52B788] to-[#2D6A4F] transition-all duration-1000 rounded-full" 
                        style={{ width: `${(m.count / maxCount) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            }) : (
               <div className="h-full flex items-center justify-center text-sm font-bold text-gray-300 uppercase tracking-widest pt-8">Belum ada pesanan</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   LIVE ORDERS PAGE  –  active orders read-only view for owner
   ============================================================ */
function LiveOrdersPage() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ['owner-live-orders'],
    queryFn: () => orderApi.getStaffOrders().then(unwrap).catch(() => []),
    refetchInterval: 60000,
  });

  const { mutate: updateStatus, variables: pendingVars } = useMutation({
    mutationFn: ({ id, status }) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-live-orders'] });
      toast.success('Status pesanan diperbarui');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal update status'),
  });

  const COLS = [
    { key: 'pending_payment', label: 'Belum Bayar', icon: '💳', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', btn: 'Konfirmasi Bayar', next: 'paid' },
    { key: 'paid',       label: 'Menunggu', icon: '⏳', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', btn: 'Terima & Masak', next: 'processing' },
    { key: 'processing', label: 'Dimasak',  icon: '🔥', color: 'text-blue-500',  bg: 'bg-blue-50',  border: 'border-blue-100',  btn: 'Tandai Siap',    next: 'completed' },
    { key: 'completed',  label: 'Siap Saji', icon: '✅', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', btn: 'Selesaikan',   next: 'picked_up' },
  ];

  return (
    <div className="flex h-full p-8 gap-8 overflow-x-auto custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      {COLS.map(col => {
        const colOrders = orders.filter(o => o.status === col.key);
        return (
          <div key={col.key} className="flex-1 min-w-[340px] flex flex-col bg-gray-100/30 rounded-[40px] border border-gray-100/50 p-5">
            <div className="flex items-center justify-between mb-6 px-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm border ${col.border} ${col.bg}`}>{col.icon}</div>
                <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">{col.label}</span>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-[11px] font-black shadow-sm border border-white/50 bg-white text-gray-500">{colOrders.length}</span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1.5">
              {colOrders.length === 0 && (
                <div className="py-24 text-center opacity-10 grayscale">
                  <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">Tidak ada antrean</p>
                </div>
              )}
              {colOrders.map(order => {
                const isUpdating = pendingVars?.id === order.id;
                return (
                  <div key={order.id} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group animate-slideIn">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-mono font-bold text-gray-300 mb-1 tracking-tighter">{order.order_number}</p>
                        <p className="text-[13px] font-black text-[#081C0F] tracking-tight">{order.user?.full_name ?? 'Walk-in Customer'}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-50">
                          <span className="text-[11px] font-bold text-gray-600 truncate mr-2">{item.menu_name}</span>
                          <span className="text-[11px] font-black text-[#2D6A4F] bg-white px-2 py-0.5 rounded-lg border border-gray-100 shadow-sm">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-[14px] font-black text-gray-900">{fmt(order.grand_total)}</span>
                      {(() => {
                        const nextStatus = order.status === 'pending_payment'
                          ? (order.payment_method !== 'midtrans' ? 'paid' : null)
                          : col.next;
                        
                        if (!nextStatus) return (
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">Menunggu Pelanggan</span>
                        );

                        return (
                          <button 
                            onClick={() => updateStatus({ id: order.id, status: nextStatus })}
                            disabled={isUpdating}
                            className={`h-10 px-5 rounded-[16px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all active:scale-90 shadow-lg disabled:opacity-50 ${
                              col.key === 'pending_payment' ? 'bg-red-600 text-white shadow-red-900/10' :
                              col.key === 'paid' ? 'bg-[#2D6A4F] text-white shadow-emerald-900/10' : 
                              col.key === 'processing' ? 'bg-blue-600 text-white shadow-blue-900/10' : 
                              'bg-emerald-100 text-emerald-700 shadow-emerald-900/5 border border-emerald-200'
                            }`}
                          >
                            {isUpdating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : col.btn}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* ============================================================
   REVIEWS PAGE
   ============================================================ */
function ReviewsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 rounded-[22px] flex items-center justify-center text-2xl text-amber-500">⭐</div>
          <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rating Rata-rata</p><p className="text-2xl font-black text-gray-900 leading-none">— / 5.0</p></div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-[22px] flex items-center justify-center text-2xl text-emerald-500">💬</div>
          <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total Ulasan</p><p className="text-2xl font-black text-gray-900 leading-none">0 Ulasan</p></div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-[22px] flex items-center justify-center text-2xl text-blue-500">🤝</div>
          <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Respon Rate</p><p className="text-2xl font-black text-gray-900 leading-none">—</p></div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex-1">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Ulasan Pelanggan</span>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-5xl mb-8 grayscale opacity-30">⭐</div>
          <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Fitur Ulasan Akan Segera Hadir</h3>
          <p className="text-sm font-bold text-gray-400 max-w-md leading-relaxed">
            Kami sedang menyiapkan sistem ulasan pelanggan agar Anda bisa melihat dan merespons feedback secara langsung.
          </p>
          <div className="mt-8 px-6 py-3 bg-emerald-50 rounded-full border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FINANCE PAGE
   ============================================================ */
function FinancePage() {
  const { data: finData = {}, isLoading: finLoading } = useQuery({
    queryKey: ['owner-finance-summary'],
    queryFn: () => adminApi.getFinanceSummary().then(r => r?.data?.data ?? r?.data ?? {}).catch(() => ({})),
  });

  const totalRevenue  = finData?.total_revenue  ?? 0;
  const platformFee   = finData?.platform_fee   ?? 0;
  const netIncome     = finData?.net_income     ?? (totalRevenue - platformFee);
  const withdrawals   = finData?.withdrawals   ?? [];

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      {/* Finance Hero */}
      <div className="bg-gradient-to-br from-[#081C0F] to-[#1B4332] p-10 rounded-[48px] shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Total Pendapatan Bersih</p>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-6">{finLoading ? '...' : fmt(netIncome)}</h2>
            <div className="flex gap-4">
              <button className="px-8 h-12 bg-[#52B788] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/40 hover:scale-105 transition-all active:scale-95">Tarik Dana</button>
              <button className="px-8 h-12 bg-white/10 text-white border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Atur Rekening</button>
            </div>
          </div>
          <div className="w-32 h-32 bg-white/10 rounded-[40px] border border-white/10 backdrop-blur-md flex items-center justify-center text-5xl">💰</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em]">Rekening Terdaftar</h3>
            <span className="text-[10px] font-black text-emerald-500 uppercase">Terverifikasi</span>
          </div>
          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs italic shadow-md">BCA</div>
            <div>
              <p className="text-[13px] font-black text-gray-900">Budi Santoso</p>
              <p className="text-[11px] font-bold text-gray-400">8820 **** **** 1234</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em]">Potongan Platform</h3>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Biaya 2.5%</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-[13px] font-bold"><span className="text-gray-400">Total Omset</span><span className="text-gray-900">{fmt(totalRevenue)}</span></div>
            <div className="flex justify-between text-[13px] font-bold"><span className="text-gray-400">Biaya Layanan</span><span className="text-red-500">- {fmt(platformFee)}</span></div>
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[11px] font-black text-gray-900 uppercase">Net Income</span>
              <span className="text-xl font-black text-[#2D6A4F]">{fmt(netIncome)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex-1">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
          <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Riwayat Penarikan Dana</span>
        </div>
        <div className="p-6">
          {withdrawals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-gray-400">Belum ada riwayat penarikan dana.</p>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">Fitur penarikan akan segera tersedia.</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead><tr className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4"><th className="px-6 py-2">ID Trx</th><th className="px-6 py-2">Tanggal</th><th className="px-6 py-2">Jumlah</th><th className="px-6 py-2">Rekening</th><th className="px-6 py-2 text-center">Status</th></tr></thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} className="bg-white hover:bg-gray-50/80 transition-all shadow-sm border border-gray-100">
                    <td className="px-6 py-4 rounded-l-2xl border-y border-l border-gray-50 font-mono text-[11px] font-bold text-gray-400">{w.id}</td>
                    <td className="px-6 py-4 border-y border-gray-50 text-[12px] font-black text-gray-900">{new Date(w.date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 border-y border-gray-50 text-[12px] font-black text-[#2D6A4F]">{fmt(w.amount)}</td>
                    <td className="px-6 py-4 border-y border-gray-50 text-[11px] font-bold text-gray-400">{w.bank ?? '-'}</td>
                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-50 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${w.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {w.status === 'success' ? 'Berhasil' : 'Diproses'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   SUBSCRIPTION PAGE
   ============================================================ */
function SubscriptionPage() {
  const qc = useQueryClient();
  const { data: plansData = [] } = useQuery({
    queryKey: ['owner-subscription-plans'],
    queryFn: () => adminApi.getSubscriptionPlans().then(r => r?.data?.data ?? r?.data ?? []).catch(() => []),
  });
  const { data: currentPlan = {} } = useQuery({
    queryKey: ['owner-subscription-current'],
    queryFn: () => adminApi.getSubscription().then(r => r?.data?.data ?? r?.data ?? {}).catch(() => ({})),
  });

  const { mutate: subscribe, isLoading: subscribing } = useMutation({
    mutationFn: (planId) => adminApi.subscribe({ plan: planId }),
    onSuccess: () => {
      toast.success('Pengajuan paket berhasil! Menunggu persetujuan admin.');
      qc.invalidateQueries({ queryKey: ['owner-subscription-current'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal memproses langganan'),
  });

  const hasSubscription = currentPlan?.has_subscription === true;
  const sub = currentPlan?.subscription;
  const currentPlanId = hasSubscription ? (sub?.plan ?? null) : null;
  const isPending = sub?.approval_status === 'pending';
  const isActive = currentPlan?.is_active === true;

  const plans = plansData.length > 0 ? plansData.map(p => {
    const pid = p.id ?? p.slug;
    const isCurrent = pid === currentPlanId && hasSubscription;
    let btn = `Pilih ${p.name}`;
    if (isCurrent && isActive) btn = 'Paket Aktif';
    else if (isCurrent && isPending) btn = 'Menunggu Approval';
    else if (isCurrent) btn = 'Paket Saat Ini';
    return {
      id: pid,
      name: p.name ?? 'Plan',
      price: p.price > 0 ? fmt(p.price) : 'Gratis',
      desc: p.description ?? '',
      features: p.features ?? [],
      color: isCurrent ? 'border-[#52B788] bg-[#F0FBF3]/30' : 'border-gray-200',
      btn,
      active: isCurrent,
      popular: p.is_recommended ?? false,
    };
  }) : [
    { id: 'starter', name: 'Starter', price: 'Gratis', desc: 'Cocok untuk kantin kecil baru mulai.', features: ['Hingga 20 Menu', 'Laporan Harian', 'Fitur POS Dasar', '1 Staff'], color: 'border-gray-200', btn: 'Pilih Starter', active: false },
    { id: 'pro', name: 'Merchant Pro', price: 'Rp 49rb', desc: 'Tingkatkan efisiensi & branding.', features: ['Menu Tanpa Batas', 'Analytics Lanjutan', 'Manajemen Promo', '5 Staff', 'Auto Print Struk'], color: 'border-gray-200', btn: 'Pilih Pro', popular: true },
    { id: 'business', name: 'Business', price: 'Rp 99rb', desc: 'Untuk merchant skala besar.', features: ['Semua fitur Pro', 'Multi-outlet', 'Priority Support', 'Custom Domain', 'Export Excel'], color: 'border-gray-200', btn: 'Hubungi Sales' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-[#081C0F] tracking-tighter mb-4 uppercase">Paket & Langganan</h2>
        <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Pilih paket yang sesuai dengan kebutuhan bisnismu untuk fitur yang lebih powerful.</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {plans.map(p => (
          <div key={p.id} className={`p-10 rounded-[48px] border-2 shadow-sm flex flex-col transition-all hover:shadow-2xl hover:-translate-y-2 relative group ${p.color}`}>
            {p.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">Paling Populer</div>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{p.name}</h3>
              <p className="text-[11px] font-bold text-gray-400 leading-relaxed mb-6">{p.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#2D6A4F] tracking-tighter">{p.price}</span>
                {p.id !== 'starter' && <span className="text-[10px] font-bold text-gray-400 uppercase">/ bulan</span>}
              </div>
            </div>
            
            <div className="flex-1 space-y-4 mb-10">
              {p.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-[12px] font-bold text-gray-600">{typeof f === 'string' ? f : f.name ?? ''}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => !p.active && subscribe(p.id)}
              disabled={p.active || subscribing}
              className={`w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${p.active ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-[#2D6A4F] text-white shadow-xl shadow-emerald-900/20 hover:bg-[#1B4332]'} disabled:opacity-50`}
            >
              {subscribing && !p.active ? 'Memproses...' : p.btn}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#081C0F] p-8 rounded-[40px] flex items-center justify-between shadow-2xl shadow-emerald-900/10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-3xl">🎁</div>
          <div>
            <p className="text-white font-black text-lg tracking-tight">Punya kode promo atau referral?</p>
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">Masukkan kode untuk mendapatkan diskon langganan.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input placeholder="Kode Promo" className="w-48 h-12 bg-white/5 border border-white/10 rounded-xl px-5 text-white text-[12px] font-bold outline-none focus:border-[#52B788]" />
          <button className="px-8 bg-[#52B788] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Gunakan</button>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   SETTINGS PAGE
   ============================================================ */
function SettingsPage({ subActive, trialActive, subStatus, setPage }) {
  const qc = useQueryClient();
  const { data: tenant } = useQuery({
    queryKey: ['owner-tenant-settings'],
    queryFn: () => tenantApi.getMyTenant().then(r => r.data?.data ?? r.data),
  });

  const [form, setForm] = useState({ tenant_name: '', address: '', description: '', phone: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const photoRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (tenant) {
      setForm({
        tenant_name: tenant.tenant_name || '',
        address: tenant.address || '',
        description: tenant.description || '',
        phone: tenant.phone || '',
      });
      setPhotoPreview(tenant.photo_url ?? null);
      setBannerPreview(tenant.banner_url ?? null);
    }
  }, [tenant?.tenant_name, tenant?.address, tenant?.description, tenant?.phone, tenant?.photo_url, tenant?.banner_url]);

  const { mutate: update, isLoading: saving } = useMutation({
    mutationFn: (data) => tenantApi.updateMyTenant(data),
    onSuccess: () => {
      toast.success('Pengaturan berhasil disimpan');
      qc.invalidateQueries({ queryKey: ['owner-tenant-settings'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal menyimpan pengaturan'),
  });

  const handleSave = () => {
    const formData = new FormData();
    formData.append('tenant_name', form.tenant_name);
    formData.append('address', form.address);
    formData.append('description', form.description);
    formData.append('phone', form.phone);
    if (photoFile) formData.append('photo', photoFile);
    if (bannerFile) formData.append('banner', bannerFile);
    update(formData);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Foto maksimal 2MB'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Banner maksimal 5MB'); return; }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4">
              <BuildingStorefrontIcon className="w-6 h-6 text-[#2D6A4F]" />
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Profil Merchant</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Informasi dasar toko Anda</p>
              </div>
            </div>
            <div className="p-10 space-y-6">
              {/* Photo & Banner Upload */}
              <div className="flex items-start gap-8 pb-6 border-b border-gray-50">
                {/* Tenant Photo */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden border-4 border-white">
                      {photoPreview
                        ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                        : (tenant?.tenant_name?.charAt(0)?.toUpperCase() ?? 'T')
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => photoRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#2D6A4F] rounded-xl shadow-lg flex items-center justify-center text-white hover:bg-[#1B4332] transition-colors"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>
                    <input type="file" ref={photoRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Foto Profil</span>
                </div>

                {/* Banner */}
                <div className="flex-1 flex flex-col gap-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Banner Toko</label>
                  <div
                    className="relative h-28 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-[#40916C] transition-colors group"
                    onClick={() => bannerRef.current?.click()}
                  >
                    {bannerPreview
                      ? <img src={bannerPreview} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <div className="text-center">
                            <CameraIcon className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-[10px] font-bold">Klik untuk upload banner</span>
                          </div>
                        </div>
                    }
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="text-white font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-3 py-1 rounded-lg">Ganti Banner</span>
                    </div>
                  </div>
                  <input type="file" ref={bannerRef} className="hidden" accept="image/*" onChange={handleBannerChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Kantin</label>
                  <input value={form.tenant_name} onChange={e => setForm(f => ({ ...f, tenant_name: e.target.value }))} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-[#40916C] focus:ring-4 focus:ring-[#40916C]/5 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. WhatsApp</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-[#40916C] focus:ring-4 focus:ring-[#40916C]/5 transition-all" placeholder="0812..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap / Gedung</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-[#40916C] focus:ring-4 focus:ring-[#40916C]/5 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Toko</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full p-6 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-[#40916C] focus:ring-4 focus:ring-[#40916C]/5 transition-all resize-none" placeholder="Ceritakan sedikit tentang kantin Anda..." />
              </div>
              <div className="pt-6 border-t border-gray-50">
                <button onClick={handleSave} disabled={saving} className="h-14 px-10 bg-[#2D6A4F] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all disabled:opacity-50">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4">
              <BoltIcon className="w-6 h-6 text-[#2D6A4F]" />
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Operasional</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Atur perilaku toko otomatis</p>
              </div>
            </div>
            <div className="p-10 space-y-6">
              <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-gray-100">⚡</div>
                  <div>
                    <p className="text-[13px] font-black text-gray-900">Auto-Accept Order</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Terima pesanan otomatis tanpa konfirmasi</p>
                  </div>
                </div>
                <div className="w-14 h-7 bg-[#2D6A4F] rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm" /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* ── Merchant Pro Card (unified) ── */}
          <div className="bg-[#081C0F] p-8 rounded-[48px] shadow-2xl shadow-emerald-900/20 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-1000" />
            <div className="w-20 h-20 bg-white/10 rounded-[32px] border border-white/10 flex items-center justify-center text-3xl mx-auto mb-6">👑</div>
            <h4 className="text-white font-black text-lg mb-1">Merchant Pro</h4>

            {/* Sisa waktu berlangganan */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-black text-[#52B788]">
                {subActive
                  ? Math.ceil(subStatus?.days_remaining ?? 0)
                  : trialActive
                    ? Math.ceil(subStatus?.trial_days_remaining ?? 0)
                    : 0}
              </span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-left leading-tight">
                hari<br />tersisa
              </span>
            </div>

            {/* Status label */}
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-6">
              {subActive ? 'Langganan Aktif' : trialActive ? 'Masa Trial' : 'Belum Berlangganan · 0 Hari'}
            </p>

            {/* Single button: Perpanjangan */}
            <button
              onClick={() => setPage('subscription')}
              className="w-full h-12 bg-[#52B788] hover:bg-[#40916C] active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/30"
            >
              Perpanjangan
            </button>
          </div>


          <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Keamanan</h3>
            <div className="space-y-4">
              <button className="w-full h-12 px-6 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-gray-900 uppercase tracking-widest hover:bg-white hover:border-[#52B788] transition-all flex items-center justify-between group">
                Ubah PIN Kasir <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#52B788]" />
              </button>
              <button className="w-full h-12 px-6 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-gray-900 uppercase tracking-widest hover:bg-white hover:border-[#52B788] transition-all flex items-center justify-between group">
                Ganti Password <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#52B788]" />
              </button>
            </div>
          </div>

          <div className="p-8 rounded-[48px] bg-red-50 border border-red-100">
            <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] mb-6">Danger Zone</h3>
            <button className="w-full h-12 bg-white border border-red-200 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Nonaktifkan Toko</button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   MAIN MerchantView Shell
   ============================================================ */
const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',      icon: <ChartBarIcon className="w-5 h-5" />, section: 'Dashboard' },
  { id: 'live-orders',  label: 'Live Orders',   icon: <BoltIcon className="w-5 h-5" />,     section: 'Dashboard', badge: true },
  { id: 'menu',         label: 'Kelola Menu',   icon: <BuildingStorefrontIcon className="w-5 h-5" />, section: 'Manajemen' },
  { id: 'promo',        label: 'Promo & Diskon',icon: <FireIcon className="w-5 h-5" />,     section: 'Manajemen' },
  { id: 'stock',        label: 'Stok & Inventory',icon: <CubeIcon className="w-5 h-5" />,    section: 'Manajemen' },
  { id: 'report',       label: 'Analytics',     icon: <ArrowTrendingUpIcon className="w-5 h-5" />, section: 'Laporan' },
  { id: 'refund',       label: 'Riwayat Order', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, section: 'Laporan' },
  { id: 'reviews',      label: 'Ulasan',        icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, section: 'Laporan' },
  { id: 'finance',      label: 'Pendapatan',    icon: <BanknotesIcon className="w-5 h-5" />, section: 'Keuangan' },
  { id: 'subscription', label: 'Langganan',     icon: <CreditCardIcon className="w-5 h-5" />, section: 'Keuangan' },
  { id: 'settings',     label: 'Pengaturan',    icon: <Cog6ToothIcon className="w-5 h-5" />, section: 'Pengaturan' },
];

const SECTIONS = ['Dashboard', 'Manajemen', 'Laporan', 'Keuangan', 'Pengaturan'];

export default function MerchantView() {
  const { user }    = useAuthStore();
  const qc          = useQueryClient();
  const [page, setPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials   = user?.full_name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? 'OW';
  const tenantName = user?.tenant?.tenant_name ?? 'Toko Saya';
  const tenantId   = user?.tenant_id ?? user?.tenant?.id ?? null;
  const dateLabel  = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /* ── Subscription status (controls store toggle & banners) ── */
  const { data: subStatus = {} } = useQuery({
    queryKey: ['owner-sub-status'],
    queryFn: () => adminApi.getSubscription().then(r => r?.data?.data ?? r?.data ?? {}).catch(() => ({})),
    staleTime: 60_000,
  });
  const trialActive = subStatus?.trial_active === true;
  const subActive   = subStatus?.is_active === true;
  const subPending  = subStatus?.subscription?.approval_status === 'pending';
  const canOperate  = trialActive || subActive; // can open store & use features

  // Real-time via Pusher — subscribe to tenant channel
  useRealtime(tenantId ? `tenant.${tenantId}` : null, {
    NewOrderReceived: () => {
      qc.invalidateQueries({ queryKey: ['owner-live-orders'] });
      qc.invalidateQueries({ queryKey: ['owner-aggregate'] });
    },
    OrderStatusChanged: () => {
      qc.invalidateQueries({ queryKey: ['owner-live-orders'] });
      qc.invalidateQueries({ queryKey: ['owner-aggregate'] });
    },
  });

  /* Toggle buka/tutup toko via API */
  const { data: tenantData } = useQuery({
    queryKey: ['my-tenant'],
    queryFn: () => tenantApi.getMyTenant().then(r => r?.data?.data ?? r?.data ?? {}).catch(() => ({})),
    staleTime: 60_000,
  });
  const isOpen = tenantData?.is_open ?? true;

  const { mutate: toggleTenant, isLoading: toggling } = useMutation({
    mutationFn: () => {
      if (!canOperate) {
        toast.error('Aktifkan paket langganan terlebih dahulu untuk membuka toko.');
        return Promise.reject(new Error('no-subscription'));
      }
      return tenantApi.updateMyTenant({ is_open: !isOpen });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-tenant'] });
      toast.success(isOpen ? '🔴 Toko ditutup' : '🟢 Toko dibuka');
    },
    onError: (err) => {
      if (err?.message !== 'no-subscription') toast.error('Gagal mengubah status toko.');
    },
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 44px)', overflow: 'hidden', width: '100%' }}>
      {/* Mobile hamburger */}
      <button className="kk-mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
        <span style={{fontSize:18}}>{sidebarOpen ? '\u2715' : '\u2630'}</span>
      </button>
      <div className={`kk-sidebar-overlay ${sidebarOpen ? 'kk-sidebar-open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* ── Sidebar ── */}
      <div className={`w-[240px] bg-[#0E1F14] flex flex-col flex-shrink-0 border-r border-white/5 z-20 kk-shell-sidebar ${sidebarOpen ? 'kk-sidebar-open' : ''}`}>
        <div className="h-14 flex items-center gap-3 px-6 border-b border-white/5 bg-[#081C0F]/50">
          <div className="w-8 h-8 bg-[#52B788] rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-emerald-900/20">KK</div>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-white truncate tracking-tight">{tenantName}</p>
            <p className="text-[9px] font-bold text-[#52B788]/50 uppercase tracking-widest">Merchant Dashboard</p>
          </div>
          <div className={`ml-auto w-2 h-2 rounded-full ${isOpen ? 'bg-[#52B788] shadow-[0_0_8px_rgba(82,183,136,0.8)]' : 'bg-gray-600'}`} />
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {SECTIONS.map(sec => (
            <div key={sec} className="mb-6">
              <p className="px-6 py-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{sec}</p>
              {NAV_ITEMS.filter(n => n.section === sec).map(n => (
                <button
                  key={n.id}
                  onClick={() => {setPage(n.id); setSidebarOpen(false);}}
                  className={`w-full flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-bold transition-all group ${
                    page === n.id 
                      ? 'bg-[#52B788]/15 text-[#52B788] border-r-[4px] border-[#52B788]' 
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span className={`transition-transform group-hover:scale-110 ${page === n.id ? 'opacity-100' : 'opacity-50'}`}>{n.icon}</span>
                  <span className="flex-1 text-left tracking-wide">{n.label}</span>
                  {n.badge && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full animate-pulse shadow-lg shadow-emerald-900/20">
                      Live
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#081C0F]/30">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-[#52B788]/20 flex items-center justify-center text-[11px] font-black text-[#52B788] border border-[#52B788]/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-black text-white truncate">{user?.full_name ?? 'Owner'}</p>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Merchant Owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] relative overflow-hidden">
        {/* Topbar */}
        <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <div>
            <h2 className="text-[15px] font-black text-gray-900 tracking-tight uppercase">{NAV_ITEMS.find(n => n.id === page)?.label}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{dateLabel} · <span className="text-[#52B788]">Online</span></p>
          </div>
          <div className="flex items-center gap-4">
            {/* No subscription warning */}
            {!canOperate && !subPending && (
              <button
                onClick={() => setPage('subscription')}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-200 hover:bg-red-100 transition-colors"
              >
                <span className="text-xs">⚠️</span>
                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Belum Berlangganan</span>
              </button>
            )}
            {/* Pending approval */}
            {subPending && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                <span className="text-xs">⏳</span>
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Menunggu Approval</span>
              </div>
            )}
            {/* Trial active */}
            {trialActive && (
              <button
                onClick={() => setPage('subscription')}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <span className="text-xs">🎉</span>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Trial {Math.ceil(subStatus?.trial_days_remaining ?? 0)} Hari</span>
              </button>
            )}
            {/* Active subscription */}
            {subActive && !trialActive && (
              <button
                onClick={() => setPage('subscription')}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <span className="text-xs">✅</span>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Aktif {Math.ceil(subStatus?.days_remaining ?? 0)} Hari</span>
              </button>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${canOperate ? 'bg-[#F0FBF3] border-[#D8F3DC]' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`w-2 h-2 rounded-full ${canOperate && isOpen ? 'bg-[#10B981] animate-pulse' : 'bg-gray-300'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${canOperate && isOpen ? 'text-[#059669]' : 'text-gray-400'}`}>Toko {isOpen && canOperate ? 'Buka' : 'Tutup'}</span>
            </div>
            <button
              onClick={() => toggleTenant()}
              disabled={toggling || !canOperate}
              className={`h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                !canOperate
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                  : isOpen 
                    ? 'bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 shadow-red-900/5' 
                    : 'bg-[#2D6A4F] text-white hover:bg-[#1B4332] shadow-emerald-900/20'
              }`}
            >
              {!canOperate ? 'Langganan Diperlukan' : toggling ? '...' : isOpen ? 'Tutup Toko' : 'Buka Toko'}
            </button>
          </div>
        </div>

        {/* Subpages Container */}
        <div className="flex-1 overflow-hidden relative">
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'overview' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <OverviewPage />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'live-orders' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <LiveOrdersPage />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'menu' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} p-8 overflow-y-auto custom-scrollbar`}>
            <MenuManagement />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'promo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="h-full flex flex-col items-center justify-center p-8 opacity-40 grayscale">
              <FireIcon className="w-16 h-16 mb-4 text-orange-500" />
              <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Promo & Diskon</h2>
              <p className="text-sm font-bold text-gray-500">Fitur strategi marketing akan segera hadir.</p>
            </div>
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'stock' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="h-full flex flex-col items-center justify-center p-8 opacity-40 grayscale">
              <CubeIcon className="w-16 h-16 mb-4 text-blue-500" />
              <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Stok & Inventory</h2>
              <p className="text-sm font-bold text-gray-500">Manajemen stok real-time sedang disiapkan.</p>
            </div>
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'report' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} p-8 overflow-y-auto custom-scrollbar`}>
            <OwnerReport />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'refund' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} p-8 overflow-y-auto custom-scrollbar`}>
            <OwnerRefund />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'reviews' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <ReviewsPage />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'finance' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <FinancePage />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'subscription' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <SubscriptionPage />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${page === 'settings' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <SettingsPage subActive={subActive} trialActive={trialActive} subStatus={subStatus} setPage={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
