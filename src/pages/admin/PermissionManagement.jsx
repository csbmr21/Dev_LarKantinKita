import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Panel from '../../components/ui/Panel';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import clsx from 'clsx';

const EMPTY_FORM = { name: '', group: 'general', description: '' };

export default function PermissionManagement() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-permissions-list'],
    queryFn: () => adminApi.getPermissions().then(r => r.data),
  });

  const permissions = data?.data ?? [];

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? adminApi.updatePermission(editing.id, data) : adminApi.createPermission(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions-list'] });
      toast.success(editing ? 'Hak akses diperbarui' : 'Hak akses dibuat');
      closeModal();
    },
    onError: (err) => {
      setErrors(err.response?.data?.errors ?? {});
      toast.error(err.response?.data?.message ?? 'Gagal menyimpan');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deletePermission,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions-list'] });
      toast.success('Hak akses dihapus');
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal menghapus')
  });

  const openModal = (p = null) => {
    if (p) {
      setEditing(p);
      setForm({ name: p.name, group: p.group, description: p.description || '' });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.group.toLowerCase().includes(query.toLowerCase())
  );

  const groupedPermissions = React.useMemo(() => {
    const groups = {};
    filteredPermissions.forEach(p => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, [filteredPermissions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pusat Otoritas Sistem</h1>
          <p className="text-gray-500 text-sm mt-1">Definisikan dan kelola hak akses granular untuk modul aplikasi.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => openModal()}
          icon={<PlusIcon className="w-5 h-5" />}
          className="shadow-xl shadow-[#2D6A4F]/20"
        >
          Tambah Otoritas
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari otoritas atau modul..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2D6A4F]">Total: {permissions.length} Otoritas</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6"><SkeletonList count={5} /></div>
        ) : filteredPermissions.length === 0 ? (
          <EmptyState title="Otoritas tidak ditemukan" description="Belum ada data hak akses yang terdaftar untuk filter ini." />
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedPermissions).map(([group, list]) => (
              <div key={group} className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="gray" size="sm" className="uppercase font-black text-[9px] tracking-[0.2em] italic bg-gray-100 text-gray-500 border-none px-2 py-1">
                    Grup: {group}
                  </Badge>
                  <div className="h-px flex-1 bg-gray-50" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((p) => (
                    <div key={p.id} className="group relative bg-white border border-gray-100 p-4 rounded-2xl hover:border-[#2D6A4F]/30 hover:shadow-lg hover:shadow-[#2D6A4F]/5 transition-all duration-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={clsx(
                             "p-2.5 rounded-xl transition-all duration-300",
                             "bg-gray-50 text-gray-400 group-hover:bg-[#2D6A4F]/10 group-hover:text-[#2D6A4F]"
                          )}>
                            <ShieldCheckIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-black text-gray-900 leading-none">{p.name}</h3>
                              <Badge variant="success" size="sm" className="bg-[#2D6A4F]/5 text-[#2D6A4F] border-none text-[8px] font-black uppercase">
                                {p.resource}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono mt-1.5 opacity-60">@{p.slug}</p>
                            <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                              {p.description || 'Tidak ada deskripsi sistem untuk otoritas ini.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                        <button 
                          onClick={() => openModal(p)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ubah"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Hapus hak akses ini?')) deleteMutation.mutate(p.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <Panel
        isOpen={modal}
        onClose={closeModal}
        title={editing ? 'Ubah Otoritas' : 'Otoritas Baru'}
        subtitle={editing ? `Update sistem hak akses: ${editing.slug}` : 'Tambahkan hak akses granular baru ke sistem'}
        footer={<>
          <Button variant="outline" size="sm" onClick={closeModal} className="px-6">Batal</Button>
          <Button 
            variant="primary" 
            size="sm" 
            loading={saveMutation.isPending} 
            onClick={() => saveMutation.mutate(form)}
            className="px-10"
          >
            Simpan Data
          </Button>
        </>}
      >
        <div className="space-y-6">
          <Input 
            label="Nama Otoritas *" 
            placeholder="Contoh: Manajemen Menu" 
            value={form.name} 
            error={errors.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            required 
          />
          
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Grup Otoritas *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                'general', 'menu', 'order', 'tenant', 'user', 
                'subscription', 'billing', 'finance', 'settings', 
                'inventory', 'system', 'report'
              ].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({...form, group: g})}
                  className={clsx(
                    "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center border-2",
                    form.group === g 
                      ? "bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/20" 
                      : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2 text-xs">Penjelasan / Deskripsi</label>
            <textarea
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-[#2D6A4F]/20 transition-all min-h-[120px]"
              placeholder="Berikan penjelasan mengenai hak akses ini..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}
