import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { reportApi } from '../../api/report';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Panel from '../../components/ui/Panel';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import clsx from 'clsx';

const ROLE_COLORS = { admin: 'danger', owner: 'primary', staff: 'info', customer: 'gray' };
const EMPTY_FORM = { full_name: '', username: '', email: '', phone: '', password: '', role_id: '', role: '', permissions: [] };

const ROLE_ICONS = {
  admin: '👑',
  owner: '💼',
  staff: '👨‍🍳',
  customer: '👤'
};

export default function UserManagement() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const impersonateAction = useAuthStore((s) => s.impersonate);
  
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');
  const [role,   setRole]   = useState('');
  const [page,   setPage]   = useState(1);
  
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { query, role, page }],
    queryFn: () => adminApi.getUsers({ search: query || undefined, role: role || undefined, page }).then((r) => r.data),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles-list'],
    queryFn: () => adminApi.getRoles().then(r => r.data),
  });

  const { data: permsData } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => adminApi.getPermissions().then((r) => r.data),
  });

  const roles = rolesData?.data ?? [];
  const permissions = permsData?.data ?? [];
  const users = data?.data?.data ?? [];
  const meta  = data?.data ?? {};

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? adminApi.updateUser(editing.id, data) : adminApi.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(editing ? 'User diperbarui' : 'User berhasil dibuat');
      closeModal();
    },
    onError: (err) => {
      setErrors(err.response?.data?.errors ?? {});
      toast.error(err.response?.data?.message ?? 'Gagal menyimpan user');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleUser,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(res.data?.message ?? 'Status user diperbarui');
    },
    onError: (error) => toast.error(error.response?.data?.message ?? 'Gagal memperbarui status'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User berhasil dihapus');
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal menghapus user'),
  });
  
  const impersonateMutation = useMutation({
    mutationFn: adminApi.impersonateUser,
    onSuccess: (res) => {
      const { user, token } = res.data.data;
      impersonateAction(user, token);
      toast.success(`Sekarang menyamar sebagai ${user.full_name}`);
      
      // Use window.location.href for a full reload to clear all admin queries/state
      if (user.role === 'admin') window.location.href = '/admin';
      else if (user.role === 'owner') window.location.href = '/owner';
      else if (user.role === 'staff') window.location.href = '/staff';
      else window.location.href = '/';
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal impersonate'),
  });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      full_name: user.full_name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '', // default empty for edit
      role_id: user.role_id || '',
      role: user.assigned_role?.slug || user.role || '',
      permissions: user.permissions?.map(p => p.id) || []
    });
    setErrors({});
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const togglePermission = (id) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id]
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-sm text-gray-400">{meta.total ?? 0} user terdaftar</p>
        </div>
        <Button size="sm" variant="primary" leftIcon={<PlusIcon />} onClick={openAdd}>
          Tambah User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1); }} className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" placeholder="Cari user..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]" />
        </form>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20">
          <option value="">Semua Role</option>
          {['admin','owner','staff','customer'].map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Nama', 'Identitas', 'Role & Otoritas', 'Bergabung', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8"><SkeletonList count={4} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="👥" title="Tidak ada user" /></td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] text-xs font-bold flex-shrink-0">
                        {user.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500 font-mono">@{user.username}</p>
                    <p className="text-[10px] text-gray-400">{user.email}</p>
                  </td>
                    <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Badge variant={ROLE_COLORS[user.assigned_role?.slug || user.role] ?? 'gray'} size="sm" className="w-fit">
                        {user.assigned_role?.name || (user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'No Role')}
                      </Badge>
                      {user.role === 'owner' && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none w-fit uppercase ${
                          (user.tenant?.subscription?.plan === 'professional' || user.tenant?.subscription?.plan === 'enterprise') 
                            ? 'text-[#2D6A4F] border-[#2D6A4F]/20 bg-[#2D6A4F]/5' 
                            : 'text-orange-500 border-orange-500/20 bg-orange-50/50'
                        }`}>
                          {user.tenant?.subscription?.plan || 'starter'} plan
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={Number(user.status) === 1 ? 'success' : 'gray'} dot>
                      {Number(user.status) === 1 ? 'Aktif' : 'Suspend'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit User">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleMutation.mutate(user.id)} className={`p-1.5 rounded-lg transition-colors ${Number(user.status) === 1 ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={Number(user.status) === 1 ? 'Suspend User' : 'Aktifkan User'}>
                        <div className={`w-2 h-2 rounded-full ${Number(user.status) === 1 ? 'bg-orange-500' : 'bg-green-500'}`} />
                      </button>
                      <button onClick={() => { if(window.confirm('Hapus user ini?')) deleteMutation.mutate(user.id); }} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Hapus User">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm(`Masuk sebagai ${user.full_name}?`)) impersonateMutation.mutate(user.id); }} 
                        disabled={impersonateMutation.isPending}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" 
                        title="Impersonate User"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {meta.last_page > 1 && (
        <Pagination currentPage={page} totalPages={meta.last_page} onPageChange={setPage}
          totalItems={meta.total} perPage={meta.per_page} />
      )}

      {/* Add/Edit Side Panel */}
      <Panel 
        isOpen={modal} 
        onClose={closeModal} 
        title={editing ? 'Ubah Akun' : 'Tambah Akun Baru'}
        subtitle={editing ? `Update informasi untuk @${editing.username}` : 'Daftarkan pengguna baru ke sistem'}
        size="lg"
        footer={<>
          <Button variant="outline" size="sm" onClick={closeModal} className="px-6">Batal</Button>
          <Button variant="primary" size="sm" loading={saveMutation.isPending} onClick={handleSubmit} className="px-10">Simpan Perubahan</Button>
        </>}
      >
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-l-4 border-[#2D6A4F] pl-3">Informasi Dasar</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nama Lengkap" placeholder="John Doe" value={form.full_name} error={errors.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required />
              <Input label="Username" placeholder="johndoe123" value={form.username} error={errors.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required disabled={!!editing} />
            </div>
            <Input label="Email" type="email" placeholder="john@example.com" value={form.email} error={errors.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            <Input label="Telepon" placeholder="08123456789" value={form.phone} error={errors.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-l-4 border-blue-500 pl-3">Peran & Otoritas</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {roles.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({...form, role_id: opt.id, role: opt.slug})}
                  className={clsx(
                    "flex flex-col p-3 border rounded-xl text-left transition-all",
                    form.role_id === opt.id 
                      ? "border-[#2D6A4F] bg-[#2D6A4F]/5 ring-1 ring-[#2D6A4F]" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={clsx("text-xs font-bold", form.role_id === opt.id ? "text-[#2D6A4F]" : "text-gray-700")}>
                      {opt.name}
                    </span>
                    <span className="text-lg">{ROLE_ICONS[opt.slug]}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 leading-tight">{opt.description}</span>
                </button>
              ))}
            </div>

            {permissions.length > 0 && (
              <div className="mt-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Hak Akses Granular</label>
                <div className="space-y-2">
                  {permissions.map((auth) => {
                    const subPlan = editing?.tenant?.subscription?.plan || 'starter';
                    const isRestricted = auth.requires_plan && 
                      (auth.requires_plan === 'professional' ? (subPlan === 'starter') : 
                       auth.requires_plan === 'enterprise' ? (subPlan !== 'enterprise') : false);
                    
                    const isChecked = form.permissions.includes(auth.id);

                    return (
                      <div 
                        key={auth.id} 
                        onClick={() => !isRestricted && togglePermission(auth.id)}
                        className={clsx(
                          "relative flex items-start p-3 border rounded-xl transition-all duration-200",
                          !isRestricted ? "border-gray-100 cursor-pointer hover:border-gray-300" : "opacity-60 bg-gray-50 cursor-not-allowed",
                          isChecked && "border-[#2D6A4F] bg-[#2D6A4F]/5 shadow-sm"
                        )}
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="h-4 w-4 text-[#2D6A4F] focus:ring-[#2D6A4F] border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-xs">
                          <label className="font-bold text-gray-800 flex items-center">
                            {auth.name}
                            {isRestricted && (
                              <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-[4px] text-[8px] font-black uppercase">
                                Upgrade {auth.requires_plan}
                              </span>
                            )}
                          </label>
                          <p className="text-[10px] text-gray-400 mt-0.5">{auth.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-l-4 border-orange-500 pl-3">Keamanan</h3>
            <Input label={editing ? "Password (kosongkan jika tidak diubah)" : "Password"} type="password" placeholder="••••••••" value={form.password} error={errors.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required={!editing} />
          </div>
        </form>
      </Panel>
    </div>
  );
}

