import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../../../../api/tenant';
import { unwrap, fmt } from '../../../../utils/api';
import { ErrorFallback } from './ErrorBoundary';
import {
  ShoppingBagIcon, ChartBarIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function ReportsSubpage({ type }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const qc = useQueryClient();

  const startDate = type === 'daily' ? selectedDate : (() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  })();
  const endDate = selectedDate;

  const { data: report = {}, isLoading, error } = useQuery({
    queryKey: ['staff-reports', type, startDate, endDate],
    queryFn: () => tenantApi.getReportsForStaff({ start_date: startDate, end_date: endDate }).then(r => r.data),
    refetchInterval: 30000,
    retry: 1,
  });

  const orders = useMemo(() => {
    if (!report) return [];
    return unwrap(report);
  }, [report]);

  const summary = useMemo(() => report?.summary ?? {}, [report]);

  // Wire real chart data from API (replaces hardcoded [35, 65, 45, 90, 55, 80, 40])
  const dailyChart = useMemo(() => {
    const chart = report?.daily_chart ?? [];
    if (chart.length === 0) return [];
    const maxRev = Math.max(...chart.map(d => d.revenue ?? d.total ?? 0), 1);
    return chart.map(d => ({
      label: d.date ? new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' }) : '',
      value: Math.round(((d.revenue ?? d.total ?? 0) / maxRev) * 100),
      revenue: d.revenue ?? d.total ?? 0,
    }));
  }, [report]);

  // Wire real top menus from API (replaces hardcoded Nasi Ayam Geprek etc.)
  const topMenus = useMemo(() => report?.top_menus ?? [], [report]);

  if (error) return <ErrorFallback error={error} resetErrorBoundary={() => qc.invalidateQueries({ queryKey: ['staff-reports'] })} />;

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Filter Periode</p>
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{type === 'daily' ? new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : `Range: ${new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}</p>
        </div>
        <div className="flex gap-4">
          <input type="date" max={new Date().toISOString().slice(0, 10)} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-5 h-12 bg-gray-50 border border-gray-100 rounded-2xl text-[12px] font-black text-[#081C0F] shadow-inner focus:ring-4 focus:ring-[#40916C]/5 focus:border-[#40916C] transition-all outline-none" />
          <button className="px-6 h-12 bg-[#2D6A4F] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1B4332] transition-all shadow-lg shadow-emerald-900/20 active:scale-95">↑ Export PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-[#F0FBF3] rounded-2xl flex items-center justify-center text-xl group-hover:bg-[#52B788] group-hover:text-white transition-all mb-4">💰</div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Omset Penjualan</p>
          <p className="text-2xl font-black text-[#2D6A4F] tracking-tighter">{fmt(summary.total_revenue ?? 0)}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">▲ +12% <span className="text-gray-300 font-medium">vs periode lalu</span></p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-500 group-hover:text-white transition-all mb-4">📋</div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pesanan</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">{summary.total_orders ?? 0}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">▲ +5 <span className="text-gray-300 font-medium">vs periode lalu</span></p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-amber-500 group-hover:text-white transition-all mb-4">🛍️</div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rata-rata Order</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">{fmt(summary.avg_order_value ?? 0)}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1">→ Stabil <span className="text-gray-300 font-medium">vs periode lalu</span></p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-purple-500 group-hover:text-white transition-all mb-4">⭐</div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating Tenant</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">{summary.avg_rating ?? '4.8'}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">▲ +0.1 <span className="text-gray-300 font-medium">vs periode lalu</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Real chart data from API */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Grafik Penjualan</span>
            <ChartBarIcon className="w-5 h-5 text-gray-300" />
          </div>
          <div className="flex-1 flex items-end gap-3 min-h-[160px] pb-4">
            {dailyChart.length > 0 ? dailyChart.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full bg-gray-50 rounded-t-xl relative overflow-hidden h-full">
                  <div className="absolute bottom-0 left-0 w-full bg-[#52B788] group-hover:bg-[#2D6A4F] transition-all duration-500 rounded-t-xl" style={{ height: `${d.value}%` }} />
                </div>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{d.label || `Day ${i+1}`}</span>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm font-bold py-10">Belum ada data grafik</div>
            )}
          </div>
        </div>

        {/* Real top menus from API */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Menu Terlaris</span>
            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-5">
            {topMenus.length > 0 ? topMenus.slice(0, 5).map((m, i) => {
              const maxQty = topMenus[0]?.quantity ?? topMenus[0]?.count ?? 150;
              const qty = m.quantity ?? m.count ?? 0;
              return (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{i+1}</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-black text-gray-900">{m.name ?? m.menu_name}</p>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(qty / maxQty) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[13px] font-black text-gray-400">{qty} <span className="text-[10px] uppercase">pcs</span></span>
                </div>
              );
            }) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm font-bold py-10">Belum ada data menu terlaris</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Riwayat Transaksi</span>
        </div>
        <div className="overflow-x-auto p-6">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead><tr className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4"><th className="px-6 py-2">Order</th><th className="px-6 py-2">Pelanggan</th><th className="px-6 py-2">Item</th><th className="px-6 py-2 text-right">Total</th><th className="px-6 py-2">Metode</th><th className="px-6 py-2 text-center">Waktu</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="text-center py-20 text-gray-400 font-bold animate-pulse">Memuat data...</td></tr> : orders.length === 0 ? <tr><td colSpan={6} className="text-center py-24 opacity-20 grayscale"><ShoppingBagIcon className="w-12 h-12 mx-auto mb-4"/><p className="font-black uppercase text-[11px]">Belum Ada Transaksi</p></td></tr> :
                orders.map((o) => (
                  <tr key={o.id} className="bg-white hover:bg-gray-50/80 transition-all shadow-sm border border-gray-100">
                    <td className="px-6 py-4 rounded-l-2xl border-y border-l border-gray-50 font-mono text-xs font-bold text-gray-400">{o.order_number ?? `#${o.id}`}</td>
                    <td className="px-6 py-4 border-y border-gray-50 text-[13px] font-black text-gray-900">{o.user?.full_name ?? 'Pelanggan'}</td>
                    <td className="px-6 py-4 border-y border-gray-50 text-[11px] font-bold text-gray-400 max-w-xs truncate">{o.items?.map(i => `${i.menu_name} x${i.quantity}`).join(', ')}</td>
                    <td className="px-6 py-4 border-y border-gray-50 font-black text-[#2D6A4F] text-right text-[13px]">{fmt(o.grand_total)}</td>
                    <td className="px-6 py-4 border-y border-gray-50"><span className="px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black text-gray-500 uppercase tracking-tighter">{o.payment?.payment_type ?? o.payment_method ?? 'Cash'}</span></td>
                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-50 text-center font-mono text-[11px] font-bold text-gray-300">{new Date(o.created_at).toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
