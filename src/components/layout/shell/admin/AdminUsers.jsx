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

const getRoleName = (user) => {
  const r = user?.role ?? user?.roles?.[0];
  if (typeof r === 'string') return r.toLowerCase();
  return (r?.slug ?? r?.name ?? '').toLowerCase();
};

const ROLE_MAP = {
  admin:   { cls: 'badge-violet', label: 'Admin'    },
  owner:   { cls: 'badge-ok',     label: 'Merchant' },
  staff:   { cls: 'badge-warn',   label: 'Staff'    },
  kasir:   { cls: 'badge-warn',   label: 'Kasir'    },
  customer:{ cls: 'badge-info',   label: 'Customer' },
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modal, setModal] = useState(null); // { type: 'form'|'detail'|'delete', user: obj }
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'customer' });

  const { data: raw, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().catch(() => []),
    refetchInterval: 30000,
  });
  const users = unwrapList(raw);

  const { data: permsRaw } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => adminApi.getPermissions().catch(() => []),
  });
  const allPermissions = unwrapList(permsRaw);

  const toggleMut = useMutation({
    mutationFn: (id) => adminApi.toggleUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const saveMut = useMutation({
    mutationFn: (data) => modal.user?.id ? adminApi.updateUser(modal.user.id, data) : adminApi.createUser(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setModal(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setModal(null); },
  });

  const filtered = users.filter(u => {
    const roleName = getRoleName(u);
    const matchRole = roleFilter === 'all' || roleName.includes(roleFilter);
    const fullName = u.full_name ?? u.name ?? '';
    const email = u.email ?? '';
    const matchText = fullName.toLowerCase().includes(filter.toLowerCase())
      || email.toLowerCase().includes(filter.toLowerCase());
    return matchRole && matchText;
  });

  const countRole = (r) => users.filter(u => getRoleName(u).includes(r)).length;
  const countActive = (active) => users.filter(u => (u.status === true || u.status === 1 || u.status === '1') === active).length;

  const openForm = (u = null) => {
    setFormData(u ? { 
      full_name: u.full_name ?? u.name ?? '', 
      email: u.email ?? '', 
      password: '', 
      role: getRoleName(u) || 'customer',
      username: u.username ?? '',
      phone: u.phone ?? '',
      no_ktp: u.no_ktp ?? '',
      dob: u.dob ?? '',
      company_code: u.company_code ?? '',
      status: u.status === true || u.status === 1 || u.status === '1',
      email_notif: u.email_notif === true || u.email_notif === 1 || u.email_notif === '1',
      wa_notif: u.wa_notif === true || u.wa_notif === 1 || u.wa_notif === '1',
      permissions: (u.permissions || []).map(p => p.id)
    } : { 
      full_name: '', email: '', password: '', role: 'customer', username: '', phone: '', no_ktp: '', dob: '', company_code: '', status: true, email_notif: true, wa_notif: false, permissions: []
    });
    setModal({ type: 'form', user: u });
  };

  return (
    <div className="scroll-area">
      {/* Modals */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          
          {/* Form Modal */}
          {modal.type === 'form' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 700, width: '95%' }}>
              <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                <div className="panel-title">{modal.user ? 'Edit Data Komprehensif User' : 'Tambah User Baru'}</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Kiri */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Utama</div>
                    <div className="fg">
                      <label className="lbl">Nama Lengkap</label>
                      <input className="input" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div className="fg">
                      <label className="lbl">Email Address</label>
                      <input className="input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                    </div>
                    <div className="fg">
                      <label className="lbl">Username</label>
                      <input className="input" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="johndoe123" />
                    </div>
                    <div className="fg">
                      <label className="lbl">Password {modal.user && <span style={{ color: 'var(--text-400)', fontWeight: 400 }}>(Kosongkan jika tidak diubah)</span>}</label>
                      <input className="input" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                    </div>
                    
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '24px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Pribadi</div>
                    <div className="fg">
                      <label className="lbl">No KTP (NIK)</label>
                      <input className="input" value={formData.no_ktp} onChange={e => setFormData({ ...formData, no_ktp: e.target.value })} placeholder="3201..." />
                    </div>
                    <div className="fg">
                      <label className="lbl">Tanggal Lahir</label>
                      <input className="input" type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                    </div>
                  </div>

                  {/* Kanan */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Role & Sistem</div>
                    <div className="fg">
                      <label className="lbl">Role Akun</label>
                      <select className="input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="owner">Merchant / Owner</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </div>
                    <div className="fg">
                      <label className="lbl">Company Code</label>
                      <input className="input" value={formData.company_code} onChange={e => setFormData({ ...formData, company_code: e.target.value })} placeholder="UNIV" />
                    </div>
                    <div className="fg">
                      <label className="lbl">No Telepon / WhatsApp</label>
                      <input className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="0812345678" />
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '24px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Preferensi & Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-100)' }}>Status Akun (Aktif/Suspend)</div>
                        <div style={{ fontSize: 11, color: 'var(--text-400)' }}>Izinkan login ke sistem</div>
                      </div>
                      <button className={`toggle ${formData.status ? 'on' : 'off'}`} onClick={() => setFormData({ ...formData, status: !formData.status })} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-100)' }}>Email Notifikasi</div>
                      </div>
                      <button className={`toggle ${formData.email_notif ? 'on' : 'off'}`} onClick={() => setFormData({ ...formData, email_notif: !formData.email_notif })} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-100)' }}>WhatsApp Notifikasi</div>
                      </div>
                      <button className={`toggle ${formData.wa_notif ? 'on' : 'off'}`} onClick={() => setFormData({ ...formData, wa_notif: !formData.wa_notif })} />
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '24px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Direct Permissions (Override Role)</div>
                    <div style={{ maxHeight: 200, overflowY: 'auto', padding: 4 }}>
                      {allPermissions.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                          {allPermissions.map(p => {
                            const isChecked = formData.permissions.includes(p.id);
                            return (
                              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: isChecked ? 'rgba(82,183,136,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isChecked ? 'var(--c-primary-500)' : 'transparent'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({ ...formData, permissions: [...formData.permissions, p.id] });
                                    } else {
                                      setFormData({ ...formData, permissions: formData.permissions.filter(id => id !== p.id) });
                                    }
                                  }}
                                  style={{ accentColor: 'var(--c-primary-500)', width: 16, height: 16 }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: isChecked ? 'var(--c-primary-400)' : 'var(--text-100)' }}>{p.name}</span>
                                  <span style={{ fontSize: 11, color: 'var(--text-400)', fontFamily: 'var(--font-mono)' }}>{p.slug ?? p.name.toLowerCase()}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-main)', fontSize: 11, color: 'var(--text-300)' }}>
                          Memuat data permission API...
                        </div>
                      )}
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
                <div className="panel-title">Detail Komprehensif User</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {modal.user.photo ? (
                    <img src={modal.user.photo_url ?? modal.user.photo} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', fontWeight: 800 }}>
                      {(modal.user.full_name ?? modal.user.name ?? 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-100)' }}>{modal.user.full_name ?? modal.user.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-400)' }}>{modal.user.email} {modal.user.email_verified_at && <span style={{ color: '#52B788' }}>✓ Verified</span>}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Left Column */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Pribadi</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Username</span><span className="metric-val tx-mono">{modal.user.username ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">No. Telepon</span><span className="metric-val">{modal.user.phone ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">No. KTP</span><span className="metric-val tx-mono">{modal.user.no_ktp ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Tanggal Lahir</span><span className="metric-val">{modal.user.dob ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Profil Lengkap?</span><span className="metric-val">{modal.user.profile_completed ? 'Ya' : 'Belum'}</span></div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '20px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Preferensi & Akun</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Email Notifikasi</span><span className="metric-val">{modal.user.email_notif ? 'Aktif' : 'Off'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">WA Notifikasi</span><span className="metric-val">{modal.user.wa_notif ? 'Aktif' : 'Off'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Google Sign-In</span><span className="metric-val">{modal.user.google_id ? 'Tertaut' : 'Tidak'}</span></div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Role & Akses</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Role Sistem</span><span className="metric-val" style={{ textTransform: 'capitalize' }}>{getRoleName(modal.user)}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Direct Permissions</span>
                      <span className="metric-val" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: 160 }}>
                        {modal.user.permissions?.length > 0 
                          ? modal.user.permissions.map(p => <span key={p.id} className="badge badge-info" style={{ fontSize: 9 }}>{p.slug ?? p.name}</span>)
                          : <span style={{ color: 'var(--text-400)' }}>None (Role Only)</span>
                        }
                      </span>
                    </div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Company Code</span><span className="metric-val tx-mono">{modal.user.company_code ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Tenant Terkait</span><span className="metric-val">{modal.user.tenant?.tenant_name ?? modal.user.tenants?.[0]?.tenant_name ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Status Akun</span><span className="metric-val">{(modal.user.status === true || modal.user.status === 1 || modal.user.status === '1') ? <span className="badge badge-ok">Aktif</span> : <span className="badge badge-err">Suspended</span>}</span></div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', margin: '20px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Audit Sistem</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Dibuat Oleh</span><span className="metric-val tx-mono">{modal.user.created_by ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Diupdate Oleh</span><span className="metric-val tx-mono">{modal.user.updated_by ?? '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Is Deleted</span><span className="metric-val">{modal.user.is_deleted ? 'Ya' : 'Tidak'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Bergabung Sejak</span><span className="metric-val tx-mono">{modal.user.created_at ? new Date(modal.user.created_at).toLocaleString('id-ID') : '—'}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Update Terakhir</span><span className="metric-val tx-mono">{modal.user.updated_at ? new Date(modal.user.updated_at).toLocaleString('id-ID') : '—'}</span></div>
                  </div>
                </div>
                
                <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                  <button className="btn btn-ghost btn-block" onClick={() => deleteMut.mutate(modal.user.id)}>🗑️ Hapus Permanen</button>
                  <button className="btn btn-primary btn-block" onClick={() => openForm(modal.user)}>✏️ Edit Data</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="stat-grid sg4">
        <div className="stat-card"><div className="stat-val" style={{ color: 'var(--c-primary-400)' }}>{users.length}</div><div className="stat-label">Total Users</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#93C5FD' }}>{countRole('customer')}</div><div className="stat-label">Customer</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#FCD34D' }}>{countRole('staff') + countRole('kasir')}</div><div className="stat-label">Staff Kasir</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#C4B5FD' }}>{countRole('owner')}</div><div className="stat-label">Merchant</div></div>
      </div>

      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-title">👥 User Management</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input" style={{ width: 180 }} placeholder="Cari nama / email..." value={filter} onChange={e => setFilter(e.target.value)} />
            <select className="input" style={{ width: 120 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">Semua Role</option>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="owner">Merchant</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => openForm(null)}>+ User</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Nama</th><th>Email</th><th>Role</th><th>Tenant</th><th>Bergabung</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-400)' }}>Memuat...</td></tr>}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-400)' }}>Tidak ada data</td></tr>
            )}
            {filtered.map(u => {
              const roleName = getRoleName(u);
              const rm = ROLE_MAP[roleName] ?? ROLE_MAP.customer;
              const isActive = u.status === true || u.status === 1 || u.status === '1';
              const fullName = u.full_name ?? u.name ?? '—';
              const tenant = u.tenant?.tenant_name ?? u.tenant?.name ?? u.tenants?.[0]?.tenant_name ?? '—';
              return (
                <tr key={u.id}>
                  <td className="tx-strong">{fullName}</td>
                  <td style={{ color: 'var(--text-400)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                  <td><span className={`badge ${rm.cls}`}>{rm.label}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text-300)' }}>{tenant}</td>
                  <td className="tx-mono">{u.created_at?.slice(0, 10) ?? '—'}</td>
                  <td>
                    {isActive
                      ? <span className="badge badge-ok"><span className="badge-dot" />Aktif</span>
                      : <span className="badge badge-err"><span className="badge-dot" />Nonaktif</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'detail', user: u })}>Detail</button>
                      <button
                        className={`btn btn-sm ${isActive ? 'btn-danger-outline' : 'btn-primary'}`}
                        disabled={toggleMut.isPending}
                        onClick={() => toggleMut.mutate(u.id)}
                      >
                        {isActive ? 'Suspend' : 'Aktifkan'}
                      </button>
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
