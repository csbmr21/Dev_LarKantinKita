import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../../api/admin';
import toast from 'react-hot-toast';

const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

const unwrapObj = (r) => r?.data?.data ?? r?.data ?? {};

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function AdminSubscriptions() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // { type: 'approve'|'reject'|'detail', sub: obj }
  const [adminNotes, setAdminNotes] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);

  const { data: statsRaw } = useQuery({
    queryKey: ['admin-sub-stats'],
    queryFn: () => adminApi.getSubscriptionStats().catch(() => ({})),
  });
  const { data: subsRaw, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => adminApi.getSubscriptions().catch(() => []),
    refetchInterval: 30000,
  });

  const approveMut = useMutation({
    mutationFn: ({ id, data }) => adminApi.approveSubscription(id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }); 
      qc.invalidateQueries({ queryKey: ['admin-sub-stats'] });
      setModal(null); 
      setAdminNotes(''); 
      setDurationMonths(1);
      toast.success('Persetujuan langganan berhasil disimpan');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Gagal menyetujui langganan');
    }
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, data }) => adminApi.rejectSubscription(id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }); 
      qc.invalidateQueries({ queryKey: ['admin-sub-stats'] });
      setModal(null); 
      setAdminNotes(''); 
      toast.success('Persetujuan langganan berhasil ditolak');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Gagal menolak langganan');
    }
  });

  const stats = unwrapObj(statsRaw);
  const subs = unwrapList(subsRaw);

  const PLAN_MAP = {
    Pro:       { cls: 'badge-info',   price: 99000  },
    Business:  { cls: 'badge-violet', price: 299000 },
    Starter:   { cls: 'badge-neu',    price: 0      },
  };

  const STATUS_MAP = {
    active:   { cls: 'badge-ok',   label: 'Berhasil'  },
    approved: { cls: 'badge-ok',   label: 'Aktif'     },
    expired:  { cls: 'badge-err',  label: 'Expired'   },
    pending:  { cls: 'badge-warn', label: 'Pending'   },
    rejected: { cls: 'badge-err',  label: 'Ditolak'   },
    suspended:{ cls: 'badge-err',  label: 'Suspended' },
    trial:    { cls: 'badge-warn', label: 'Trial'     },
  };

  const countByPlan = (name) =>
    subs.filter(s => (s.plan ?? s.plan_name ?? '').toLowerCase().includes(name.toLowerCase())).length;

  return (
    <div className="scroll-area">
      {/* Modals */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          
          {(modal.type === 'approve' || modal.type === 'reject') && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 500, width: '90%' }}>
              <div className={`kk-modal-icon ${modal.type === 'reject' ? 'danger' : 'ok'}`}>
                {modal.type === 'reject' ? '✕' : '✓'}
              </div>
              <div className="kk-modal-title">{modal.type === 'reject' ? 'Tolak Pembayaran?' : 'Approve Pembayaran?'}</div>
              <div className="kk-modal-body" style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 'var(--r-md)', marginTop: 16 }}>
                <div className="metric-row"><span className="metric-name">Tenant</span><span className="metric-val">{modal.sub.tenant?.tenant_name ?? modal.sub.tenant_name ?? 'Tenant'}</span></div>
                <div className="metric-row"><span className="metric-name">Paket</span><span className="metric-val" style={{ textTransform: 'capitalize' }}>{modal.sub.plan ?? 'Starter'}</span></div>
                <div className="metric-row"><span className="metric-name">Jumlah</span><span className="metric-val" style={{ color: 'var(--c-primary-400)', fontWeight: 800 }}>{fmt(modal.sub.amount ?? 0)}</span></div>
                <div className="metric-row"><span className="metric-name">Tgl Request</span><span className="metric-val tx-mono">{modal.sub.created_at ? new Date(modal.sub.created_at).toLocaleDateString('id-ID') : '—'}</span></div>
                
                {modal.type === 'approve' && (
                  <div className="fg" style={{ marginTop: 16, textAlign: 'left' }}>
                    <label className="lbl">Durasi Aktif Paket</label>
                    <select 
                      className="input" 
                      style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--border-light)', borderRadius: 'var(--r-sm)', background: 'var(--bg-panel)', color: 'var(--text-main)', outline: 'none' }}
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                    >
                      {[1, 3, 6, 12, 24].map((m) => (
                        <option key={m} value={m} style={{ background: 'var(--bg-panel)', color: 'var(--text-main)' }}>{m} Bulan</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="fg" style={{ marginTop: 16, textAlign: 'left' }}>
                  <label className="lbl">Catatan Admin (Opsional)</label>
                  <textarea 
                    className="input" 
                    style={{ height: 60, resize: 'none' }} 
                    placeholder={modal.type === 'reject' ? "Alasan penolakan..." : "Catatan approval..."}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="kk-modal-btns" style={{ marginTop: 24 }}>
                <button className="btn-cancel" onClick={() => { setModal(null); setAdminNotes(''); setDurationMonths(1); }}>Batal</button>
                <button 
                  className={`btn-confirm ${modal.type === 'reject' ? 'danger' : ''}`} 
                  disabled={approveMut.isPending || rejectMut.isPending} 
                  onClick={() => {
                    if (modal.type === 'approve') {
                      approveMut.mutate({ 
                        id: modal.sub.id, 
                        data: { admin_notes: adminNotes, duration_months: durationMonths } 
                      });
                    } else {
                      rejectMut.mutate({ 
                        id: modal.sub.id, 
                        data: { admin_notes: adminNotes } 
                      });
                    }
                  }}
                >
                  {approveMut.isPending || rejectMut.isPending ? '⏳ Memproses...' : 'Ya, Lanjutkan'}
                </button>
              </div>
            </div>
          )}

          {modal.type === 'detail' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 650, width: '90%' }}>
              <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                <div className="panel-title">Detail Komprehensif Langganan</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  
                  {/* Left Column */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Langganan</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">ID Berlangganan</span><span className="metric-val tx-mono">{modal.sub.id}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Tenant Terkait</span><span className="metric-val">{modal.sub.tenant?.tenant_name ?? modal.sub.tenant_name ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Nama Paket</span><span className="metric-val" style={{ textTransform: 'capitalize' }}>{modal.sub.plan ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Nominal</span><span className="metric-val" style={{ color: 'var(--c-primary-400)', fontWeight: 800 }}>{fmt(modal.sub.amount ?? 0)}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">No. Invoice</span><span className="metric-val tx-mono">{modal.sub.invoice_number ?? '—'}</span></div>
                    
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '20px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Status Pembayaran</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Status Tagihan</span><span className="metric-val">{STATUS_MAP[modal.sub.billing_status ?? 'active']?.label ?? modal.sub.billing_status ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Status Approval</span><span className="metric-val">{STATUS_MAP[modal.sub.approval_status ?? modal.sub.status ?? 'pending']?.label ?? modal.sub.approval_status ?? modal.sub.status ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Catatan Admin</span><span className="metric-val" style={{ textAlign: 'right', maxWidth: 180 }}>{modal.sub.admin_notes ?? '—'}</span></div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Periode Berlangganan</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Mulai Aktif</span><span className="metric-val tx-mono">{modal.sub.billing_start ? new Date(modal.sub.billing_start).toLocaleString('id-ID') : '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Akhir Aktif (Exp)</span><span className="metric-val tx-mono">{modal.sub.billing_end ? new Date(modal.sub.billing_end).toLocaleString('id-ID') : '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Tanggal Request</span><span className="metric-val tx-mono">{modal.sub.created_at ? new Date(modal.sub.created_at).toLocaleString('id-ID') : '—'}</span></div>
                    
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '20px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Sistem & Audit</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Company Code</span><span className="metric-val tx-mono">{modal.sub.company_code ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Dibuat Oleh</span><span className="metric-val tx-mono">{modal.sub.created_by ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Disetujui Oleh (ID)</span><span className="metric-val tx-mono">{modal.sub.approved_by ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Diupdate Oleh</span><span className="metric-val tx-mono">{modal.sub.updated_by ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Updated At</span><span className="metric-val tx-mono">{modal.sub.updated_at ? new Date(modal.sub.updated_at).toLocaleString('id-ID') : '—'}</span></div>
                  </div>
                </div>

                {modal.sub.payment_proof && (
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12 }}>Bukti Pembayaran Terlampir</div>
                    <img src={modal.sub.payment_proof} alt="Bukti transfer" style={{ width: '100%', maxWidth: 400, borderRadius: 'var(--r-md)', border: '1px solid var(--border-light)' }} />
                  </div>
                )}
                <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                  <button className="btn btn-ghost btn-block" onClick={() => setModal(null)}>Tutup Detail</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="stat-grid sg3">
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--c-primary-400)' }}>{stats.starter_count ?? countByPlan('starter')}</div>
          <div className="stat-label">Starter (Gratis)</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#FCD34D' }}>{stats.pro_count ?? countByPlan('pro')}</div>
          <div className="stat-label">Pro (Rp 99K/bln)</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#C4B5FD' }}>{stats.business_count ?? countByPlan('business')}</div>
          <div className="stat-label">Business (Rp 299K/bln)</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-title">💳 Riwayat Langganan ({subs.length})</div>
          <button className="btn btn-ghost btn-sm">↑ Export</button>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Tenant</th><th>Paket</th><th>Jumlah</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-400)' }}>Memuat...</td></tr>}
            {!isLoading && subs.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-400)' }}>Tidak ada data</td></tr>
            )}
            {subs.map((s, i) => {
              const rawPlan = s.plan ?? s.plan_name ?? 'starter';
              const isPro = rawPlan.toLowerCase().includes('pro');
              const isBiz = rawPlan.toLowerCase().includes('busi') || rawPlan.toLowerCase().includes('bisnis');
              const planName = isBiz ? 'Business' : isPro ? 'Professional' : 'Starter';
              const pm = isBiz ? PLAN_MAP.Business : isPro ? PLAN_MAP.Pro : PLAN_MAP.Starter;
              
              const status = s.approval_status ?? s.billing_status ?? s.status ?? 'active';
              const sm = STATUS_MAP[status] ?? STATUS_MAP.active;
              const tenantName = s.tenant?.tenant_name ?? s.tenant_name ?? '—';
              const amount = s.amount ?? pm.price;
              const createdAt = s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              return (
                <tr key={s.id ?? i}>
                  <td className="tx-strong">{tenantName}</td>
                  <td><span className={`badge ${pm.cls}`}>{planName}</span></td>
                  <td className="tx-strong" style={{ color: amount > 0 ? 'var(--c-primary-400)' : 'inherit' }}>{fmt(amount)}</td>
                  <td className="tx-mono">{createdAt}</td>
                  <td><span className={`badge ${sm.cls}`}>{sm.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'detail', sub: s })}>Detail</button>
                      {status === 'pending' && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'approve', sub: s })}>Approve</button>
                          <button className="btn btn-danger-outline btn-sm" onClick={() => setModal({ type: 'reject', sub: s })}>Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
