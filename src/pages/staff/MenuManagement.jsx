import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, PencilIcon, TrashIcon, PhotoIcon, 
  CheckIcon, XMarkIcon, TagIcon 
} from '@heroicons/react/24/outline';
import { tenantApi } from '../../api/tenant';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Toggle from '../../components/ui/Toggle';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import { usePermission } from '../../hooks/usePermission';

const EMPTY_FORM = { name: '', description: '', price: '', category_id: '', is_available: true };

export default function MenuManagement() {
  const { can } = usePermission();
  const qc = useQueryClient();
  const [search, setSearch]     = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  
  // Menu Modal State
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  // Category Management State
  const [catModal, setCatModal] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName]   = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName]   = useState('');

  const { data: categories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => tenantApi.getCategories().then((r) => r.data.data?.data ?? r.data.data),
  });

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['staff-menus', { search, category_id: activeCategory }],
    queryFn: () => tenantApi.getMenus({ search: search || undefined, category_id: activeCategory || undefined }).then((r) => r.data.data?.data ?? r.data.data),
  });

  // --- Mutations ---
  const saveMutation = useMutation({
    mutationFn: (data) => editing ? tenantApi.updateMenu(editing.id, data) : tenantApi.createMenu(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-menus'] });
      toast.success(editing ? 'Menu diperbarui' : 'Menu ditambahkan');
      closeModal();
    },
    onError: (err) => {
      setErrors(err.response?.data?.errors ?? {});
      toast.error(err.response?.data?.message ?? 'Gagal menyimpan menu');
    },
  });

  const categoryMutation = useMutation({
    mutationFn: (name) => tenantApi.createCategory({ name }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setForm(f => ({ ...f, category_id: res.data.data.id }));
      setIsAddingCat(false);
      setNewCatName('');
      toast.success('Kategori ditambahkan');
    },
    onError: () => toast.error('Gagal menambah kategori'),
  });

  const updateCatMutation = useMutation({
    mutationFn: ({ id, name }) => tenantApi.updateCategory(id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['staff-menus'] });
      setEditingCatId(null);
      toast.success('Kategori diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui kategori'),
  });

  const deleteCatMutation = useMutation({
    mutationFn: tenantApi.deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['staff-menus'] });
      toast.success('Kategori dihapus');
    },
    onError: () => toast.error('Gagal menghapus kategori'),
  });

  const toggleMutation = useMutation({
    mutationFn: tenantApi.toggleMenuAvailability,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-menus'] }),
    onError: () => toast.error('Gagal mengubah ketersediaan'),
  });

  const deleteMutation = useMutation({
    mutationFn: tenantApi.deleteMenu,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-menus'] }); toast.success('Menu dihapus'); },
    onError: () => toast.error('Gagal menghapus menu'),
  });

  // --- Handlers ---
  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setPhotoPreview(null); setModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ name: m.name, description: m.description ?? '', price: String(m.price), category_id: m.category_id, is_available: !!m.is_available }); setErrors({}); setPhotoPreview(m.photo_url); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setErrors({}); setPhotoPreview(null); setIsAddingCat(false); };

  const handleQuickAddCat = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    categoryMutation.mutate(newCatName);
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Nama minimal 3 karakter';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Harga tidak valid';
    if (!form.category_id) e.category_id = 'Pilih kategori';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const formData = new FormData();
    if (editing) formData.append('_method', 'PUT');

    Object.entries(form).forEach(([k, v]) => { 
      if (v !== '' && v !== null && v !== undefined) {
        if (k === 'photo' && !(v instanceof File)) return;
        const value = typeof v === 'boolean' ? (v ? '1' : '0') : v;
        formData.append(k, value); 
      }
    });
    saveMutation.mutate(formData);
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Foto max 2MB'); return; }
    setForm((f) => ({ ...f, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen Menu</h1>
          <p className="text-sm text-gray-400">{menus.length} menu tersedia</p>
        </div>
        <div className="flex gap-2">
          {can('update-menu') && (
            <Button variant="outline" size="sm" leftIcon={<TagIcon className="w-4 h-4" />} onClick={() => setCatModal(true)}>
              Kategori
            </Button>
          )}
          {can('create-menu') && (
            <Button variant="primary" size="sm" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={openAdd}>
              Tambah Menu
            </Button>
          )}
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search" placeholder="Cari menu..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
        />
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 transition-all bg-white"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : menus.length === 0 ? (
        <EmptyState icon="🍱" title="Belum ada menu" actionLabel="Tambah Menu" onAction={openAdd} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
              <div className="h-28 bg-gray-100 relative overflow-hidden">
                <img src={menu.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'} alt={menu.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'; }} />
                {!menu.is_available && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Habis</span>
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{menu.name}</p>
                  {can('update-menu') && (
                    <Toggle size="sm" checked={!!menu.is_available} onChange={() => toggleMutation.mutate(menu.id)} />
                  )}
                </div>
                <p className="text-[11px] text-gray-400 font-medium px-1.5 py-0.5 bg-gray-50 rounded-md inline-block">
                  {menu.category?.name || 'Tanpa Kategori'}
                </p>
                <p className="text-sm font-bold text-[#2D6A4F]">{formatCurrency(menu.price)}</p>
                <div className="flex gap-1.5 pt-1">
                  {can('update-menu') && (
                    <button onClick={() => openEdit(menu)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold hover:bg-blue-100 transition-colors">
                      <PencilIcon className="w-3 h-3" /> EDIT
                    </button>
                  )}
                  {can('delete-menu') && (
                    <button onClick={() => { if(confirm('Hapus menu ini?')) deleteMutation.mutate(menu.id) }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-500 text-[10px] font-bold hover:bg-red-100 transition-colors">
                      <TrashIcon className="w-3 h-3" /> HAPUS
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Menu */}
      <Modal isOpen={modal} onClose={closeModal} title={editing ? 'Edit Menu' : 'Tambah Menu'}
        footer={<>
          <Button variant="outline" size="sm" onClick={closeModal}>Batal</Button>
          <Button variant="primary" size="sm" loading={saveMutation.isPending} onClick={handleSubmit}>Simpan Menu</Button>
        </>}
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Photo Upload */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Foto Menu</label>
            <label className="cursor-pointer block">
              <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#2D6A4F] flex items-center justify-center overflow-hidden transition-all bg-gray-50 group">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <PhotoIcon className="w-8 h-8" />
                    <p className="text-[10px] font-medium">Klik untuk upload (max 2MB)</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori *</label>
              {!isAddingCat && (
                <button 
                  type="button" 
                  onClick={() => setIsAddingCat(true)}
                  className="text-[10px] font-bold text-[#2D6A4F] hover:underline flex items-center gap-1"
                >
                  <PlusIcon className="w-3 h-3" /> TAMBAH BARU
                </button>
              )}
            </div>
            
            {isAddingCat ? (
              <div className="flex gap-2 animate-fade-in">
                <input
                  autoFocus
                  placeholder="Nama kategori baru..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                />
                <button onClick={handleQuickAddCat} disabled={categoryMutation.isPending} className="p-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1B4332] disabled:opacity-50">
                  <CheckIcon className="w-5 h-5" />
                </button>
                <button onClick={() => { setIsAddingCat(false); setNewCatName(''); }} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 transition-all bg-white">
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            {errors.category_id && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.category_id}</p>}
          </div>

          <Input label="Nama Menu" placeholder="Nasi Goreng Spesial" value={form.name} error={errors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />

          <Input label="Deskripsi" placeholder="Deskripsi singkat menu..." value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} textarea rows={2} />

          <Input label="Harga" type="number" placeholder="15000" prefix="Rp" value={form.price} error={errors.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />

          <Toggle label="Tersedia untuk dipesan" checked={form.is_available}
            onChange={(v) => setForm((f) => ({ ...f, is_available: v }))} />
        </form>
      </Modal>

      {/* Modal Manage Categories */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Kelola Kategori"
        footer={<Button variant="primary" size="sm" onClick={() => setCatModal(false)}>Selesai</Button>}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              placeholder="Kategori baru..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
            />
            <Button size="sm" loading={categoryMutation.isPending} onClick={() => { if(newCatName.trim()) categoryMutation.mutate(newCatName); }}>
              Tambah
            </Button>
          </div>

          <div className="divide-y border rounded-xl overflow-hidden">
            {isCatLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Belum ada kategori</div>
            ) : categories.map(c => (
              <div key={c.id} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                {editingCatId === c.id ? (
                  <div className="flex-1 flex gap-2">
                    <input autoFocus value={editCatName} onChange={(e) => setEditCatName(e.target.value)} 
                      className="flex-1 border-b border-[#2D6A4F] text-sm focus:outline-none bg-transparent" />
                    <button onClick={() => updateCatMutation.mutate({ id: c.id, name: editCatName })} className="text-green-600">
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditingCatId(null)} className="text-gray-400">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCatId(c.id); setEditCatName(c.name); }} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if(confirm('Hapus kategori ini? Menus yang menggunakan kategori ini akan menjadi Tanpa Kategori')) deleteCatMutation.mutate(c.id) }} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
