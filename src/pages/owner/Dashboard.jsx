import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useLocation } from 'react-router-dom';
import { reportApi } from '../../api/report';
import Button from '../../components/ui/Button';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatCurrency, formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDate, formatDateInput } from '../../utils/formatDate';
import {
  ClipboardDocumentListIcon, StarIcon, ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { subDays } from 'date-fns';
import clsx from 'clsx';

const fmtCurrencyAxis = (v) => formatCurrencyShort(v);
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 p-4 text-xs">
      <p className="text-gray-500 font-bold mb-3">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 font-medium uppercase tracking-widest">{p.name}:</span>
          <span className="font-black text-gray-900 text-sm">
            {p.name === 'Revenue' ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function OwnerDashboard() {
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(location.state?.showWelcome || false);
  const welcomeData = location.state || {};

  const today = new Date();
  const [startDate, setStartDate] = useState(formatDateInput(subDays(today, 6)));
  const [endDate,   setEndDate]   = useState(formatDateInput(today));

  const { data, isLoading } = useQuery({
    queryKey: ['owner-report', { startDate, endDate }],
    queryFn: () => reportApi.getSalesReport({ start_date: startDate, end_date: endDate }).then((r) => r.data.summary),
  });

  const stats     = data ?? {};
  const chartData = data?.daily_chart ?? [];
  const topMenus  = data?.top_menus?.map(m => ({ name: m.menu_name, total_sold: m.total_qty })) ?? [];
  
  // Calculate max sold for progress bar width
  const maxSold = topMenus.length > 0 ? Math.max(...topMenus.map(m => m.total_sold)) : 1;

  return (
    <div className="space-y-6 relative pb-10">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWelcome(false)}></div>
          <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-[2.5rem] p-10 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-[6px] border-white shadow-lg">
              <svg className="w-12 h-12 text-[#2D6A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Selamat Datang!</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Kantin <span className="text-gray-900 font-bold">{welcomeData.tenantName}</span> telah berhasil terdaftar dalam sistem. <br/>
              Simpan <span className="text-[#2D6A4F] font-bold">KODE PERUSAHAAN</span> Anda untuk akses selanjutnya:
            </p>
            
            <div className="bg-[#2D6A4F]/5 border-2 border-[#2D6A4F]/20 border-dashed rounded-3xl p-8 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D6A4F]/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <span className="block text-[10px] text-[#2D6A4F] font-black uppercase tracking-widest mb-2">KODE KANTIN MERK</span>
              <span className="text-5xl font-black text-[#1a4731] tracking-wider">{welcomeData.companyCode}</span>
            </div>

            <Button 
              onClick={() => setShowWelcome(false)} 
              fullWidth 
              className="h-14 rounded-2xl text-lg font-black shadow-xl shadow-[#2D6A4F]/20 bg-[#2D6A4F] hover:bg-[#1B4332] uppercase tracking-widest"
            >
              Mulai Kelola Bisnis
            </Button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Overview Analytics</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium text-gray-500">{formatDate(today)}</span>
            <span className="text-gray-300">•</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-1 rounded-lg">Real-time data</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dynamic Date Filter using existing logic */}
          <div className="flex items-center bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden p-1">
            <input 
              type="date" 
              value={startDate} 
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-bold text-gray-700 focus:outline-none bg-transparent py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors" 
            />
            <span className="text-gray-300 px-2 font-bold">–</span>
            <input 
              type="date" 
              value={endDate} 
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-bold text-gray-700 focus:outline-none bg-transparent py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors" 
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[2rem] p-8 mt-6">
          <SkeletonList count={3} />
        </div>
      ) : (
        <>
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Primary Revenue Card */}
            <div className="md:col-span-6 lg:col-span-5 bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] rounded-[2rem] p-8 text-white shadow-2xl shadow-[#2D6A4F]/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-white/10 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Total Pendapatan Terpilih</h3>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                  {formatCurrencyShort(stats.total_revenue ?? 0)}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-[#A8DADC] bg-black/20 w-fit px-3 py-1.5 rounded-xl border border-white/10">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span>Avg Order: {formatCurrencyShort(stats.avg_order ?? 0)}</span>
                </div>
              </div>
            </div>

            {/* Total Transaction Card */}
            <div className="md:col-span-3 lg:col-span-4 bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                  <ClipboardDocumentListIcon className="w-6 h-6" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stats.total_orders ?? 0}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Total Transaksi</p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <span className="text-[#2D6A4F] text-[10px] font-black underline decoration-[#2D6A4F]/30 uppercase tracking-wider">{stats.completed_orders ?? 0} Selesai</span>
              </div>
            </div>

            {/* Ratings / Performance Card (Using mapped stats for consistency) */}
            <div className="md:col-span-3 lg:col-span-3 bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                  <StarIcon className="w-6 h-6" />
                </div>
                {/* Fallback to something like order completion rate if no rating exists in logic */}
                <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                  {stats.total_orders ? Math.round((stats.completed_orders / stats.total_orders) * 100) : 0}%
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Rasio Penyelesaian</p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                 <span className="text-blue-500 text-[10px] font-black uppercase tracking-wider border border-blue-100 bg-blue-50 px-2 py-1 rounded-lg">Performa Operasional</span>
              </div>
            </div>
          </div>

          {/* Main Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#2D6A4F]/10 rounded-xl text-[#2D6A4F]">
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-gray-900">Omset Periode Terpilih</h3>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#2D6A4F] bg-[#2D6A4F]/5 px-3 py-1.5 rounded-lg border border-[#2D6A4F]/10">
                  Dalam Rupiah
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={fmtCurrencyAxis} 
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 2, strokeDasharray: '3 3' }} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue" 
                      stroke="#2D6A4F" 
                      strokeWidth={4} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#2D6A4F' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Menus Custom UI List */}
            <div className="lg:col-span-1 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <span>🏆</span> Menu Terlaris
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {topMenus.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <span className="text-3xl mb-3">🍽️</span>
                    <p className="text-xs text-gray-400 font-medium">Belum ada data penjualan menu pada periode ini.</p>
                  </div>
                ) : (
                  topMenus.map((menu, index) => {
                    const widthPercent = Math.max((menu.total_sold / maxSold) * 100, 5); // min 5% width for visibility
                    return (
                      <div key={index} className="flex flex-col group">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <span className={clsx(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                              index === 0 ? "bg-amber-100 text-amber-600" : 
                              index === 1 ? "bg-slate-100 text-slate-500" :
                              index === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"
                            )}>
                              {index + 1}
                            </span>
                            <span className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#2D6A4F] transition-colors">{menu.name}</span>
                          </div>
                          <span className="text-xs font-black text-gray-900">{menu.total_sold} <span className="text-[9px] text-gray-400 uppercase">porsi</span></span>
                        </div>
                        {/* Custom Progress Bar */}
                        <div className="ml-9 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              "h-full rounded-full transition-all duration-1000",
                              index < 3 ? "bg-gradient-to-r from-[#2D6A4F]/80 to-[#2D6A4F]" : "bg-gray-300"
                            )}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
