import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../../api/admin';

const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

const STATUS_MAP = {
  active:    { cls: 'badge-ok',   label: 'Aktif'     },
  approved:  { cls: 'badge-ok',   label: 'Aktif'     },
  suspended: { cls: 'badge-err',  label: 'Suspended' },
  inactive:  { cls: 'badge-err',  label: 'Suspended' },
  trial:     { cls: 'badge-warn', label: 'Trial'     },
  pending:   { cls: 'badge-info', label: 'Pending'   },
};
const PLAN_MAP = {
  Pro:      { cls: 'badge-info',   label: 'Pro'      },
  Business: { cls: 'badge-violet', label: 'Business' },
  Starter:  { cls: 'badge-neu',    label: 'Starter'  },
};

export default function AdminTenants() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null); // { type: 'suspend'|'activate'|'detail'|'form', tenant: obj }
  
  const [formData, setFormData] = useState({ name: '', slug: '', address: '', phone: '' });

  const { data: raw, isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => adminApi.getTenants().catch(() => []),
    refetchInterval: 20000,
  });
  const tenants = unwrapList(raw);

  const toggleMut = useMutation({
    mutationFn: (id) => adminApi.toggleTenant(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); setModal(null); },
  });

  const saveMut = useMutation({
    mutationFn: (data) => modal.tenant?.id ? adminApi.updateTenant(modal.tenant.id, data) : adminApi.createTenant(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); setModal(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteTenant(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); setModal(null); },
  });

  const filtered = tenants.filter(t => {
    const name = t.tenant_name ?? t.name ?? '';
    const isActive = t.status === true || t.status === 1 || t.status === '1';
    const mappedStatus = isActive ? 'active' : 'suspended';
    const matchStatus = statusFilter === 'all' || mappedStatus === statusFilter;
    const matchText = name.toLowerCase().includes(filter.toLowerCase());
    return matchStatus && matchText;
  });

  const count = (s) => tenants.filter(t => ((t.status === true || t.status === 1 || t.status === '1') ? 'active' : 'suspended') === s).length;

  const openForm = (t = null) => {
    setFormData(t ? { 
      name: t.tenant_name ?? t.name ?? '', 
      slug: t.slug ?? '', 
      description: t.description ?? '',
      address: t.address ?? '', 
      phone: t.phone ?? '',
      min_order: t.min_order ?? 0,
      is_open: t.is_open === true || t.is_open === 1 || t.is_open === '1',
      status: t.status === true || t.status === 1 || t.status === '1',
      company_code: t.company_code ?? ''
    } : { 
      name: '', slug: '', description: '', address: '', phone: '', min_order: 0, is_open: true, status: true, company_code: '' 
    });
    setModal({ type: 'form', tenant: t });
  };

  return (
    <div className="scroll-area">
      {/* Modal Overlay */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          
          {/* Status Toggle Modal */}
          {(modal.type === 'suspend' || modal.type === 'activate') && (
            <div onClick={e => e.stopPropagation()} className="kk-modal">
              <div className={`kk-modal-icon ${modal.type === 'suspend' ? 'danger' : 'ok'}`}>
                {modal.type === 'suspend' ? '⏸' : '▶'}
              </div>
              <div className="kk-modal-title">{modal.type === 'suspend' ? 'Suspend Tenant?' : 'Aktifkan Tenant?'}</div>
              <div className="kk-modal-body">
                <strong style={{ color: 'var(--text-100)' }}>{modal.tenant.tenant_name ?? modal.tenant.name}</strong><br />
                {modal.type === 'suspend' ? 'Tenant tidak bisa menerima pesanan.' : 'Tenant dapat menerima pesanan kembali.'}
              </div>
              <div className="kk-modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Batal</button>
                <button className={`btn-confirm ${modal.type === 'suspend' ? 'danger' : ''}`} disabled={toggleMut.isPending} onClick={() => toggleMut.mutate(modal.tenant.id)}>
                  {toggleMut.isPending ? '...' : 'Ya, Lanjutkan'}
                </button>
              </div>
            </div>
          )}

          {/* Form Modal (Create / Edit) */}
          {modal.type === 'form' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 700, width: '95%' }}>
              <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                <div className="panel-title">{modal.tenant ? 'Edit Data Komprehensif Tenant' : 'Tambah Tenant Baru'}</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Kiri */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Utama</div>
                    <div className="fg">
                      <label className="lbl">Nama Tenant</label>
                      <input className="input" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Kantin Pak Budi" />
                    </div>
                    <div className="fg">
                      <label className="lbl">Slug URL</label>
                      <input className="input" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="kantin-pak-budi" />
                    </div>
                    <div className="fg">
                      <label className="lbl">Company Code (Unit Kerja)</label>
                      <input className="input" value={formData.company_code || ''} onChange={e => setFormData({ ...formData, company_code: e.target.value })} placeholder="UNIV" />
                    </div>
                    <div className="fg">
                      <label className="lbl">Deskripsi Tenant</label>
                      <textarea className="input" style={{ height: 60, resize: 'none', paddingTop: 8 }} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Menjual aneka masakan..."></textarea>
                    </div>
                  </div>

                  {/* Kanan */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Kontak & Operasional</div>
                    <div className="fg">
                      <label className="lbl">No Telepon</label>
                      <input className="input" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="081234..." />
                    </div>
                    <div className="fg">
                      <label className="lbl">Alamat Lengkap</label>
                      <textarea className="input" style={{ height: 60, resize: 'none', paddingTop: 8 }} value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Jl. Raya..."></textarea>
                    </div>
                    <div className="fg">
                      <label className="lbl">Minimal Order (Rp)</label>
                      <input className="input" type="number" value={formData.min_order} onChange={e => setFormData({ ...formData, min_order: e.target.value })} />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-100)' }}>Status Toko (Buka/Tutup)</div>
                        <div style={{ fontSize: 11, color: 'var(--text-400)' }}>Tenant dapat menerima pesanan</div>
                      </div>
                      <button className={`toggle ${formData.is_open ? 'on' : 'off'}`} onClick={() => setFormData({ ...formData, is_open: !formData.is_open })} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-100)' }}>Status Akun (Aktif/Suspend)</div>
                        <div style={{ fontSize: 11, color: 'var(--text-400)' }}>Tenant dapat mengakses dashboard</div>
                      </div>
                      <button className={`toggle ${formData.status ? 'on' : 'off'}`} onClick={() => setFormData({ ...formData, status: !formData.status })} />
                    </div>
                  </div>
                </div>

                <div className="kk-modal-btns" style={{ marginTop: 24, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                  <button className="btn-cancel" onClick={() => setModal(null)}>Batal</button>
                  <button className="btn-confirm" disabled={saveMut.isPending} onClick={() => saveMut.mutate(formData)}>
                    {saveMut.isPending ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          {modal.type === 'detail' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 650, width: '90%' }}>
              <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                <div className="panel-title">Detail Komprehensif Tenant</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  
                  {/* Left Column */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Utama</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">ID</span><span className="metric-val tx-mono">{modal.tenant.id}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Nama Tenant</span><span className="metric-val">{modal.tenant.tenant_name ?? modal.tenant.name}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Slug URL</span><span className="metric-val tx-mono">{modal.tenant.slug ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Deskripsi</span><span className="metric-val" style={{ textAlign: 'right', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={modal.tenant.description}>{modal.tenant.description ?? '—'}</span></div>
                    
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '20px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Kontak & Operasional</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">No. Telepon</span><span className="metric-val">{modal.tenant.phone ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Alamat</span><span className="metric-val" style={{ textAlign: 'right', maxWidth: 180 }}>{modal.tenant.address ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Status Toko</span><span className="metric-val">{(modal.tenant.is_open === true || modal.tenant.is_open === 1 || modal.tenant.is_open === '1') ? <span style={{ color: '#52B788' }}>Buka</span> : <span style={{ color: '#FCA5A5' }}>Tutup</span>}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Min. Order</span><span className="metric-val">Rp {Number(modal.tenant.min_order ?? 0).toLocaleString('id-ID')}</span></div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Status & Langganan</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Status Akun</span><span className="metric-val">{(modal.tenant.status === true || modal.tenant.status === 1 || modal.tenant.status === '1') ? <span className="badge badge-ok">Aktif</span> : <span className="badge badge-err">Suspended</span>}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Paket Aktif</span><span className="metric-val">{modal.tenant.subscription?.plan?.name ?? modal.tenant.plan ?? 'Starter'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Masa Trial</span><span className="metric-val tx-mono">{modal.tenant.trial_ends_at ? new Date(modal.tenant.trial_ends_at).toLocaleString('id-ID') : '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Company Code</span><span className="metric-val tx-mono">{modal.tenant.company_code ?? '—'}</span></div>
                    
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '20px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Sistem & Audit</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Is Deleted</span><span className="metric-val">{modal.tenant.is_deleted ? 'Ya' : 'Tidak'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Dibuat Oleh</span><span className="metric-val tx-mono">{modal.tenant.created_by ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Diupdate Oleh</span><span className="metric-val tx-mono">{modal.tenant.updated_by ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Created At</span><span className="metric-val tx-mono">{modal.tenant.created_at ? new Date(modal.tenant.created_at).toLocaleString('id-ID') : '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Updated At</span><span className="metric-val tx-mono">{modal.tenant.updated_at ? new Date(modal.tenant.updated_at).toLocaleString('id-ID') : '—'}</span></div>
                  </div>
                </div>

                <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                  <button className="btn btn-ghost btn-block" onClick={() => deleteMut.mutate(modal.tenant.id)}>🗑️ Hapus Permanen</button>
                  <button className="btn btn-primary btn-block" onClick={() => openForm(modal.tenant)}>✏️ Edit Data</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid sg4">
        <div className="stat-card"><div className="stat-val" style={{ color: 'var(--c-primary-400)' }}>{count('active') + count('approved')}</div><div className="stat-label">Total Aktif</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#FCA5A5' }}>{count('suspended') + count('inactive')}</div><div className="stat-label">Suspended</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#FCD34D' }}>{count('trial')}</div><div className="stat-label">Trial</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#93C5FD' }}>{tenants.length}</div><div className="stat-label">Total Tenant</div></div>
      </div>

      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-title">🏪 Tenant Management</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input" style={{ width: 160 }} placeholder="Cari tenant..." value={filter} onChange={e => setFilter(e.target.value)} />
            <select className="input" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="btn btn-primary" onClick={() => openForm(null)}>+ Tenant</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Tenant</th><th>Slug</th><th>Paket</th><th>Toko</th><th>Akun</th><th>Bergabung</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-400)' }}>Memuat...</td></tr>}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-400)' }}>Tidak ada data</td></tr>
            )}
            {filtered.map(t => {
              const isActive = t.status === true || t.status === 1 || t.status === '1';
              const mappedStatus = isActive ? 'active' : 'suspended';
              const sm = STATUS_MAP[mappedStatus] ?? STATUS_MAP.active;
              const planName = t.subscription?.plan?.name ?? t.plan ?? 'Starter';
              const pm = PLAN_MAP[planName] ?? PLAN_MAP.Starter;
              const tenantName = t.tenant_name ?? t.name ?? '—';
              return (
                <tr key={t.id}>
                  <td className="tx-strong">{tenantName}</td>
                  <td className="tx-mono">{t.slug ?? '—'}</td>
                  <td><span className={`badge ${pm.cls}`}>{pm.label}</span></td>
                  <td>
                    {(t.is_open === true || t.is_open === 1 || t.is_open === '1') 
                      ? <span style={{ color: '#52B788', fontSize: 12, fontWeight: 700 }}>Buka</span> 
                      : <span style={{ color: '#FCA5A5', fontSize: 12, fontWeight: 700 }}>Tutup</span>}
                  </td>
                  <td><span className={`badge ${sm.cls}`}><span className="badge-dot" />{sm.label}</span></td>
                  <td className="tx-mono">{t.created_at?.slice(0, 10) ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'detail', tenant: t })}>Detail</button>
                      {isActive
                        ? <button className="btn btn-danger-outline btn-sm" onClick={() => setModal({ type: 'suspend', tenant: t })}>Suspend</button>
                        : <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'activate', tenant: t })}>Aktifkan</button>
                      }
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
