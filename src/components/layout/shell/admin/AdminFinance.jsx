import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../../../../api/report';
import { adminApi } from '../../../../api/admin';

const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};
const unwrapObj = (r) => r?.data?.data ?? r?.data ?? {};
const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function AdminFinance() {
  const [modal, setModal] = useState(null); // { type: 'detail'|'pay', settlement: obj }
  const { data: statsRaw, isLoading: statLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => reportApi.getAdminStats().catch(() => ({})),
  });
  const { data: subsRaw, isLoading: subsLoading } = useQuery({
    queryKey: ['admin-sub-stats'],
    queryFn: () => adminApi.getSubscriptionStats().catch(() => ({})),
  });

  const stats = unwrapObj(statsRaw);
  const subStats = unwrapObj(subsRaw);
  const isLoading = statLoading || subsLoading;

  const totalGmv = stats.total_revenue ?? stats.gmv ?? 1200000;
  const platformFee = totalGmv * 0.1;
  const totalDisbursed = totalGmv * 0.9;
  const subRev = (subStats.pro_count ?? 0) * 99000 + (subStats.business_count ?? 0) * 299000;
  const totalRev = platformFee + subRev;

  // Mock pending settlements based on top tenants
  const pending = (stats.top_tenants?.slice(0, 2) ?? []).map(t => ({
    name: t.name ?? t.tenant_name,
    gmv: Number(t.revenue ?? 0),
    fee: Number(t.revenue ?? 0) * 0.1,
    net: Number(t.revenue ?? 0) * 0.9,
  }));

  if (pending.length === 0) {
    pending.push({ id: 1, name: 'Kantin Pak Budi', gmv: 240000, fee: 24000, net: 216000, bank: 'BCA', account: '1234567890', account_name: 'Budi Santoso', period: '1–15 Mar' });
    pending.push({ id: 2, name: 'Warung Bu Sari', gmv: 136000, fee: 13600, net: 122400, bank: 'Mandiri', account: '0987654321', account_name: 'Sari Indah', period: '1–15 Mar' });
  }

  const BAR_H = [50, 62, 58, 75, 82, 100];
  const BAR_C = ['dim', 'green', 'green', 'green', 'bright', 'amber'];
  const MONS = ['Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar'];

  const pct = (part, total) => Math.min(100, Math.round(((part || 0) / (total || 1)) * 100));
  const proRev = (subStats.pro_count ?? 10) * 99000;
  const bizRev = (subStats.business_count ?? 3) * 299000;
  const totalPlanRev = proRev + bizRev || 1;

  return (
    <div className="scroll-area">
      {/* Modals */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          
          {modal.type === 'detail' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 650, width: '90%' }}>
              <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                <div className="panel-title">Detail Settlement & Pembayaran</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Rincian Pendapatan</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Nama Tenant</span><span className="metric-val">{modal.settlement.name}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Periode Transaksi</span><span className="metric-val">{modal.settlement.period}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Total GMV</span><span className="metric-val tx-strong">{fmt(modal.settlement.gmv)}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Fee Platform (10%)</span><span className="metric-val" style={{ color: '#FCD34D' }}>- {fmt(modal.settlement.fee)}</span></div>
                    <div className="metric-row" style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 6 }}><span className="metric-name">Net Disbursed (Cair)</span><span className="metric-val" style={{ color: 'var(--c-primary-400)', fontSize: 16, fontWeight: 800 }}>{fmt(modal.settlement.net)}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Bank Tujuan</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Bank Transfer</span><span className="metric-val">{modal.settlement.bank ?? 'BCA'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Atas Nama</span><span className="metric-val">{modal.settlement.account_name ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">No. Rekening</span><span className="metric-val tx-mono">{modal.settlement.account ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Status Settlement</span><span className="metric-val"><span className="badge badge-warn">Pending Transfer</span></span></div>
                  </div>
                </div>

                <div className="fg" style={{ marginTop: 20 }}>
                  <label className="lbl">Upload Bukti Transfer (Opsional)</label>
                  <input type="file" className="input" />
                </div>
                
                <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                  <button className="btn-cancel" onClick={() => setModal(null)}>Tutup Detail</button>
                  <button className="btn-primary" onClick={() => { alert('Disbursed!'); setModal(null); }}>Proses Pencairan Dana 💸</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="stat-grid sg4">
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--c-primary-400)' }}>{isLoading ? '...' : fmt(totalRev)}</div>
          <div className="stat-label">Platform Revenue (Bulan Ini)</div>
          <div className="stat-change up">▲ +21%</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#FCD34D' }}>{isLoading ? '...' : fmt(totalGmv)}</div>
          <div className="stat-label">Total GMV</div>
          <div className="stat-change up">▲ +18%</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#93C5FD' }}>{isLoading ? '...' : fmt(totalDisbursed)}</div>
          <div className="stat-label">Total Disbursed</div>
          <div className="stat-change up">▲ Semua cair</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#C4B5FD' }}>{isLoading ? '...' : fmt(pending.reduce((a, b) => a + b.net, 0))}</div>
          <div className="stat-label">Pending Settlement</div>
          <div className="stat-change flat">→ {pending.length} tenant</div>
        </div>
      </div>

      <div className="g2">
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header"><div className="panel-title">📊 Platform Revenue 6 Bulan</div></div>
          <div className="panel-body">
            <div className="chart-wrap" style={{ height: 100 }}>
              {BAR_H.map((h, i) => (
                <div className="c-col" key={i}>
                  <div className={`c-bar ${BAR_C[i]}`} style={{ height: `${h}%` }} />
                  <div className="c-lbl">{MONS[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header"><div className="panel-title">💳 Revenue per Paket</div></div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 60, fontSize: 11, color: 'var(--text-300)' }}>Business</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(bizRev, totalPlanRev)}%`, background: 'var(--c-primary-500)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--c-primary-400)', whiteSpace: 'nowrap', width: 60, textAlign: 'right' }}>{fmt(bizRev)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 60, fontSize: 11, color: 'var(--text-300)' }}>Pro</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(proRev, totalPlanRev)}%`, background: 'var(--c-primary-400)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--c-primary-400)', whiteSpace: 'nowrap', width: 60, textAlign: 'right' }}>{fmt(proRev)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 60, fontSize: 11, color: 'var(--text-300)' }}>Starter</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '0%', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-400)', whiteSpace: 'nowrap', width: 60, textAlign: 'right' }}>Rp 0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 12, marginBottom: 0 }}>
        <div className="panel-header"><div className="panel-title">📋 Pending Settlement</div></div>
        <table className="tbl">
          <thead>
            <tr><th>Tenant</th><th>Periode</th><th>GMV</th><th>Fee Platform</th><th>Net Disbursed</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {pending.map((p, i) => (
              <tr key={i}>
                <td className="tx-strong">{p.name}</td>
                <td className="tx-mono">{p.period ?? '1-15 Mar'}</td>
                <td className="tx-strong">{fmt(p.gmv)}</td>
                <td style={{ color: '#FCD34D' }}>{fmt(p.fee)}</td>
                <td style={{ color: 'var(--c-primary-400)', fontWeight: 700 }}>{fmt(p.net)}</td>
                <td><span className="badge badge-warn">Pending</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'detail', settlement: p })}>Detail & Proses</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
