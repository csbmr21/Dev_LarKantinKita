import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, PencilIcon, PowerIcon } from '@heroicons/react/24/outline';
import { tenantApi } from '../../api/tenant';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const EMPTY_FORM = { full_name: '', username: '', email: '', phone: '', password: '' };

export default function StaffManagement() {
  const qc = useQueryClient();
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['owner-staff'],
    queryFn: () => tenantApi.getStaffList().then((r) => r.data.data?.data ?? r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? tenantApi.updateStaff(editing.id, data) : tenantApi.createStaff(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-staff'] });
      toast.success(editing ? 'Staff diperbarui' : 'Staff berhasil ditambahkan');
      closeModal();
    },
    onError: (err) => {
      setErrors(err.response?.data?.errors ?? {});
      toast.error(err.response?.data?.message ?? 'Gagal menyimpan staff');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: tenantApi.toggleStaff,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['owner-staff'] });
      toast.success(res.data?.message ?? 'Status staff diperbarui');
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal mengubah status'),
  });

  const removeMutation = useMutation({
    mutationFn: tenantApi.removeStaff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-staff'] });
      toast.success('Staff dihapus dari tenant');
    },
    onError: () => toast.error('Gagal menghapus staff'),
  });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModal(true);
  };

  const openEdit = (staff) => {
    setEditing(staff);
    setForm({
      full_name: staff.full_name || '',
      username: staff.username || '',
      email: staff.email || '',
      phone: staff.phone || '',
      password: '',
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

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen Staff</h1>
          <p className="text-sm text-gray-400">{staffList.length} staff aktif</p>
        </div>
        <Button size="sm" variant="primary" leftIcon={<PlusIcon />} onClick={openAdd}>
          Tambah Staff
        </Button>
      </div>

      {isLoading ? <SkeletonList count={3} /> : staffList.length === 0 ? (
        <EmptyState icon="👥" title="Belum ada staff" description="Tambahkan staff untuk memproses pesanan"
          actionLabel="Tambah Staff" onAction={openAdd} />
      ) : (
        <div className="space-y-3">
          {staffList.map((staff) => (
            <div key={staff.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] font-bold">
                  {staff.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{staff.full_name}</p>
                    <Badge variant={Number(staff.status) === 1 ? 'success' : 'gray'} dot size="xs">
                      {Number(staff.status) === 1 ? 'Aktif' : 'Non-aktif'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">@{staff.username} • {staff.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(staff)} className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => toggleMutation.mutate(staff.id)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${Number(staff.status) === 1 ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}>
                  <PowerIcon className="w-4 h-4" />
                </button>
                <button onClick={() => { if(window.confirm('Hapus staff ini?')) removeMutation.mutate(staff.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Edit Staff' : 'Tambah Staff'}
        footer={<>
          <Button size="sm" variant="outline" onClick={closeModal}>Batal</Button>
          <Button size="sm" variant="primary" loading={saveMutation.isPending} onClick={handleSave}>Simpan</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Nama Lengkap" placeholder="Nama staff..." value={form.full_name} error={errors.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required />
          
          {!editing && (
            <Input label="Username" placeholder="username_staff" value={form.username} error={errors.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" placeholder="staff@example.com" value={form.email} error={errors.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            <Input label="Telepon" placeholder="08..." value={form.phone} error={errors.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
          </div>

          <Input label={editing ? "Password (kosongkan jika tidak diubah)" : "Password"} type="password" placeholder="••••••••" value={form.password} error={errors.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required={!editing} />
        </div>
      </Modal>
    </div>
  );
}
