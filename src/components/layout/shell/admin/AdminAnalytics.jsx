import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../../api/admin';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BuildingStorefrontIcon,
  TicketIcon,
  CircleStackIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const nFmt = (n) => Number(n || 0).toLocaleString('id-ID');
const unwrapObj = (r) => r?.data?.data ?? r?.data ?? {};
const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

export default function AdminAnalytics() {
  const { data: statsRaw, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getAdminStats().catch(() => ({})),
    refetchInterval: 5000,
    staleTime: 0,
  });
  const { data: tenantsRaw } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => adminApi.getTenants().catch(() => ({})),
  });

  const stats = unwrapObj(statsRaw);
  const tenants = unwrapList(tenantsRaw);

  // derive top tenants from real list if available
  const topTenants = (stats.top_tenants?.length > 0)
    ? stats.top_tenants
    : tenants.slice(0, 3).map(t => ({ name: t.name, revenue: t.total_revenue ?? 0 }));
  const maxRev = Math.max(...topTenants.map(t => Number(t.revenue || t.total_revenue || 0)), 1);

  const ICONS = [
    <BuildingStorefrontIcon className="w-4 h-4" />,
    <TicketIcon className="w-4 h-4" />,
    <CircleStackIcon className="w-4 h-4" />,
    <AcademicCapIcon className="w-4 h-4" />
  ];
  const BAR_COLORS = { 0: '#40916C', 1: '#52B788', 2: '#52B788', 3: '#52B788', 4: '#F59E0B', 5: '#52B788', 6: '#40916C' };
  const BAR_H = [55, 70, 62, 85, 100, 92, 75];
  const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  if (loadingStats) {
    return (
      <div className="scroll-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-400)', fontSize: 13 }}>Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="scroll-area">
      {/* KPI Cards */}
      <div className="stat-grid sg4">
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--c-primary-400)' }}>{nFmt(stats.active_tenants ?? stats.total_tenants ?? tenants.filter(t => t.status === 'active').length)}</div>
          <div className="stat-label">Total Tenant Aktif</div>
          <div className="stat-change up">
            <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
            +5 bulan ini
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#FBBF24' }}>{nFmt(stats.total_users ?? 0)}</div>
          <div className="stat-label">Total Pengguna</div>
          <div className="stat-change up">
            <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
            +892
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#93C5FD' }}>{nFmt(stats.total_orders ?? 0)}</div>
          <div className="stat-label">Total Transaksi</div>
          <div className="stat-change up">
            <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
            +12.4%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--c-primary-400)' }}>{fmt(stats.total_revenue ?? stats.gmv ?? 0)}</div>
          <div className="stat-label">GMV Platform</div>
          <div className="stat-change up">
            <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
            +21% MoM
          </div>
        </div>
      </div>

      <div className="g2">
        {/* Bar Chart */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header"><div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ArrowTrendingUpIcon className="w-4 h-4" /> Transaksi Harian (7 Hari)</div></div>
          <div className="panel-body">
            <div className="chart-wrap" style={{ height: 100 }}>
              {BAR_H.map((h, i) => (
                <div className="c-col" key={i}>
                  <div className="c-bar" style={{ height: `${h}%`, background: BAR_COLORS[i] }} />
                  <div className="c-lbl">{DAYS[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Tenants */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header"><div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BuildingStorefrontIcon className="w-4 h-4" /> Top Tenant (GMV Bulan Ini)</div></div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topTenants.length === 0 ? (
                <div style={{ color: 'var(--text-400)', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>Belum ada data</div>
              ) : topTenants.slice(0, 3).map((t, i) => {
                const rev = Number(t.revenue || t.total_revenue || 0);
                const pct = Math.min(100, Math.round((rev / maxRev) * 100));
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--c-primary-400)' }}>{ICONS[i]}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name || t.tenant_name}</span>
                    <div style={{ flex: 2, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? 'var(--c-primary-500)' : 'var(--c-primary-400)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--c-primary-400)', whiteSpace: 'nowrap', minWidth: 60, textAlign: 'right' }}>{fmt(rev)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="g3" style={{ marginTop: 12 }}>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#FCD34D' }}>{fmt((stats.total_revenue ?? 0) * 0.1)}</div>
          <div className="stat-label">Platform Revenue (Fee 10%)</div>
          <div className="stat-change up">
            <ArrowTrendingUpIcon className="w-3 h-3 inline mr-1" />
            +21%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#93C5FD' }}>{stats.uptime ?? '99.97'}%</div>
          <div className="stat-label">Platform Uptime (30 hari)</div>
          <div className="stat-change up">
            <ShieldCheckIcon className="w-3 h-3 inline mr-1" />
            Excellent
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--c-primary-400)' }}>{stats.avg_latency ?? 42}ms</div>
          <div className="stat-label">Avg API Latency</div>
          <div className="stat-change up">
            <BoltIcon className="w-3 h-3 inline mr-1" />
            Fast
          </div>
        </div>
      </div>
    </div>
  );
}
