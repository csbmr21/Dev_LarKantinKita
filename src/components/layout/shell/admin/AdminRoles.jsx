import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../../api/admin';

import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  InformationCircleIcon, 
  ChartBarIcon, 
  UsersIcon,
  BriefcaseIcon,
  CreditCardIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

// Permission categories to display in matrix
const PERM_CATEGORIES = ['pos', 'analytics', 'user', 'tenant', 'system'];
const PERM_LABELS = ['POS / Kasir', 'Analytics', 'User Mgmt', 'Tenant Mgmt', 'System Config'];

const getPermScore = (role, category) => {
  const perms = role.permissions ?? [];
  const matched = perms.filter(p => (p.slug ?? p.name ?? '').toLowerCase().includes(category));
  if (matched.length === 0) return 'no';
  if (matched.some(p => p.slug?.includes('all') || p.name?.includes('all'))) return 'yes';
  return 'partial';
};

const STATIC_MATRIX = {
  admin:    ['yes', 'yes', 'yes', 'yes', 'yes'],
  owner:    ['yes', 'yes', 'partial', 'no', 'no'],
  staff:    ['yes', 'no', 'no', 'no', 'no'],
  kasir:    ['yes', 'no', 'no', 'no', 'no'],
  customer: ['no', 'no', 'no', 'no', 'no'],
};

const ROLE_DISPLAY = {
  admin:    { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Super Admin',    color: 'var(--c-primary-400)' },
  owner:    { icon: <BriefcaseIcon className="w-5 h-5" />, label: 'Merchant Owner', color: '#FCD34D' },
  staff:    { icon: <UserIcon className="w-5 h-5" />, label: 'Staff Kasir',    color: '#93C5FD' },
  kasir:    { icon: <UserIcon className="w-5 h-5" />, label: 'Kasir',          color: '#93C5FD' },
  customer: { icon: <UsersIcon className="w-5 h-5" />, label: 'Customer',       color: 'var(--text-300)' },
};

export default function AdminRoles() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // { type: 'form'|'detail', role: obj }
  const [formData, setFormData] = useState({ name: '', slug: '', permissions: [] });

  const { data: rolesRaw, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminApi.getRoles().catch(() => []),
  });
  const roles = unwrapList(rolesRaw);

  const { data: permsRaw } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => adminApi.getPermissions().catch(() => []),
  });
  const allPermissions = unwrapList(permsRaw);

  const saveMut = useMutation({
    mutationFn: async (data) => {
      let roleRes;
      if (modal.role?.id) {
        roleRes = await adminApi.updateRole(modal.role.id, data);
      } else {
        roleRes = await adminApi.createRole(data);
      }
      const roleId = roleRes?.data?.data?.id ?? roleRes?.data?.id ?? modal.role?.id;
      if (roleId && data.permissions) {
        await adminApi.syncRolePermissions(roleId, { permissions: data.permissions });
      }
      return roleRes;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-roles'] }); setModal(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteRole(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-roles'] }); setModal(null); },
  });

  const openForm = (r = null) => {
    setFormData(r ? { 
      name: r.name, 
      slug: r.slug ?? r.name?.toLowerCase(),
      permissions: (r.permissions || []).map(p => p.id)
    } : { name: '', slug: '', permissions: [] });
    setModal({ type: 'form', role: r });
  };

  const displayRoles = roles;

  return (
    <div className="scroll-area">
      {/* Modals */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          
          {/* Form Modal */}
          {modal.type === 'form' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 650, width: '90%' }}>
              <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                <div className="panel-title">{modal.role ? 'Edit Role System' : 'Tambah Role Baru'}</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Dasar Role</div>
                    <div className="fg">
                      <label className="lbl">Nama Role</label>
                      <input className="input" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Manager Operasional" />
                    </div>
                    <div className="fg">
                      <label className="lbl">Slug Identifier</label>
                      <input className="input" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="manager_ops" />
                      <div style={{ fontSize: 10, color: 'var(--text-400)', marginTop: 4 }}>Gunakan huruf kecil dan garis bawah (_)</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Manajemen Hak Akses</div>
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
                    {saveMut.isPending ? '⏳ Menyimpan...' : '💾 Simpan Role'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          {modal.type === 'detail' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 550, width: '90%' }}>
              <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                <div className="panel-title">Detail Komprehensif Role</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Role</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">ID Role</span><span className="metric-val tx-mono">{modal.role.id}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Nama Role</span><span className="metric-val">{modal.role.name}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Slug / Identifier</span><span className="metric-val tx-mono">{modal.role.slug ?? modal.role.name?.toLowerCase()}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Statistik</div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Jumlah Hak Akses</span><span className="metric-val" style={{ color: 'var(--c-primary-400)', fontWeight: 800 }}>{modal.role.permissions?.length ?? 0}</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Pengguna Aktif</span><span className="metric-val">{modal.role.users_count ?? modal.role.users?.length ?? 0} Users</span></div>
                    <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Tanggal Dibuat</span><span className="metric-val tx-mono">{modal.role.created_at ? new Date(modal.role.created_at).toLocaleString('id-ID') : '—'}</span></div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Daftar Hak Akses (Permissions)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {modal.role.permissions && modal.role.permissions.length > 0 ? (
                    modal.role.permissions.map((p, idx) => (
                      <span key={idx} className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{p.slug ?? p.name}</span>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-400)' }}>Role ini tidak memiliki permission spesifik (atau mewarisi dari sistem).</div>
                  )}
                </div>
                
                <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                  <button className="btn btn-ghost btn-block" onClick={() => deleteMut.mutate(modal.role.id)}>🗑️ Hapus Role</button>
                  <button className="btn btn-primary btn-block" onClick={() => openForm(modal.role)}>✏️ Edit Role</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-100)' }}>Roles & Permissions</div>
        <button className="btn btn-primary btn-sm" onClick={() => openForm(null)}>+ Custom Role</button>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-header"><div className="panel-title">🔐 Permission Matrix</div></div>
        {isLoading
          ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-400)' }}>Memuat...</div>
          : displayRoles.length === 0
          ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-400)' }}>Tidak ada data roles</div>
          : (
            <>
              <div className="perm-grid">
                <div className="perm-header">Role</div>
                {PERM_LABELS.map(l => <div key={l} className="perm-header">{l}</div>)}

                {displayRoles.map(role => {
                  const slug = (role.slug ?? role.name ?? '').toLowerCase();
                  const disp = ROLE_DISPLAY[slug] ?? { icon: '🔒', label: role.name, color: 'var(--text-200)' };
                  // Ensure accurate display: if role.permissions is an array (even empty), use real data.
                  const matrix = Array.isArray(role.permissions)
                    ? PERM_CATEGORIES.map(c => getPermScore(role, c)) 
                    : (STATIC_MATRIX[slug] ?? ['no', 'no', 'no', 'no', 'no']);

                  return (
                    <div className="perm-row" key={role.id}>
                      <div className="perm-cell" style={{ fontWeight: 700, color: disp.color, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: `${disp.color}15`, color: disp.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ margin: 'auto' }}>{disp.icon}</div>
                        </div>
                        {role.name}
                      </div>
                      {matrix.map((score, i) => (
                        <div key={i} className={`perm-cell perm-${score}`}>
                          {score === 'yes' ? <CheckCircleIcon className="w-4 h-4 text-[#52B788]" /> : score === 'partial' ? <ExclamationTriangleIcon className="w-4 h-4 text-[#FCD34D]" /> : <XMarkIcon className="w-4 h-4 text-gray-400 opacity-30" />}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-400)' }}>⚠️ = Terbatas (toko sendiri saja)</div>
            </>
          )
        }
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panel-header">
          <div className="panel-title">📋 Daftar Role ({displayRoles.length})</div>
        </div>
        <table className="tbl">
          <thead><tr><th>Nama Role</th><th>Slug</th><th>Jumlah Permission</th><th>Jumlah User</th><th>Aksi</th></tr></thead>
          <tbody>
            {displayRoles.map(r => (
              <tr key={r.id}>
                <td className="tx-strong">{r.name}</td>
                <td className="tx-mono">{r.slug ?? r.name?.toLowerCase()}</td>
                <td style={{ color: 'var(--text-300)' }}>{r.permissions?.length ?? 0} permission</td>
                <td style={{ color: 'var(--text-300)' }}>{r.users_count ?? r.users?.length ?? 0} user</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'detail', role: r })}>Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
