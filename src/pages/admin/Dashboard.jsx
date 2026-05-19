import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { reportApi } from '../../api/report';
import StatCard from '../../components/shared/StatCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { formatCurrency, formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { getStatusLabel, getStatusColor } from '../../utils/orderStatus';
import {
  BuildingStorefrontIcon, UsersIcon, ShoppingBagIcon, CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => reportApi.getAdminStats().then((r) => r.data.data?.data ?? r.data.data),
    staleTime: 60_000,
  });

  const stats      = data?.stats ?? {};
  const chartData  = data?.orders_chart ?? [];
  const topTenants = data?.top_tenants ?? [];
  const recentErrors = data?.recent_errors ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Pantau seluruh platform KantinKita</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Total Tenant Aktif" value={stats.active_tenants ?? 0} color="primary"
              icon={<BuildingStorefrontIcon className="w-5 h-5" />} />
            <StatCard title="Total User" value={stats.total_users ?? 0} color="blue"
              icon={<UsersIcon className="w-5 h-5" />} />
            <StatCard title="Order Hari Ini" value={stats.orders_today ?? 0} color="orange"
              icon={<ShoppingBagIcon className="w-5 h-5" />} />
            <StatCard title="Revenue Platform" value={formatCurrency(stats.total_revenue ?? 0)} color="purple"
              icon={<CurrencyDollarIcon className="w-5 h-5" />} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Order Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Per Hari (All Tenant)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#2D6A4F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tenants */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tenant Revenue Tertinggi</h2>
          <div className="space-y-3">
            {topTenants.slice(0, 5).map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.tenant_name}</p>
                  <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-[#2D6A4F] rounded-full h-1.5"
                      style={{ width: `${topTenants[0] ? (t.revenue / topTenants[0].revenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                  {formatCurrencyShort(t.revenue)}
                </span>
              </div>
            ))}
            {topTenants.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Belum ada data</p>}
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Error Terbaru</h2>
            <span className="text-xs text-red-500 font-medium">{recentErrors.length} error</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentErrors.map((err) => (
              <div key={err.id} className="px-5 py-3 flex items-start gap-3">
                <span className="text-red-400 text-lg flex-shrink-0">🔴</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{err.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(err.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
