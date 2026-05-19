import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
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

const EMPTY_FORM = { name: '', is_required: false, description: '' };

export default function DocumentTypeManagement() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-doc-types-list'],
    queryFn: () => adminApi.getDocumentTypes().then(r => r.data),
  });

  const docTypes = data?.data ?? [];

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? adminApi.updateDocumentType(editing.id, data) : adminApi.createDocumentType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-doc-types-list'] });
      toast.success(editing ? 'Tipe dokumen diperbarui' : 'Tipe dokumen dibuat');
      closeModal();
    },
    onError: (err) => {
      setErrors(err.response?.data?.errors ?? {});
      toast.error(err.response?.data?.message ?? 'Gagal menyimpan');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteDocumentType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-doc-types-list'] });
      toast.success('Tipe dokumen dihapus');
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal menghapus')
  });

  const openModal = (p = null) => {
    if (p) {
      setEditing(p);
      setForm({ name: p.name, is_required: p.is_required, description: p.description || '' });
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

  const filteredDocs = docTypes.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Konfigurasi Berkas Tenant</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola jenis dokumen persyaratan yang harus dilengkapi oleh mitra kantin.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => openModal()}
          icon={<PlusIcon className="w-5 h-5" />}
          className="shadow-xl shadow-[#2D6A4F]/20"
        >
          Tambah Berkas
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari nama dokumen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" className="bg-blue-50 text-blue-600 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">
              {docTypes.filter(d => d.is_required).length} Berkas Wajib
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6"><SkeletonList count={5} /></div>
        ) : filteredDocs.length === 0 ? (
          <EmptyState title="Tipe dokumen tidak ditemukan" description="Belum ada data tipe dokumen yang terdaftar." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            {filteredDocs.map((p) => (
              <div key={p.id} className="bg-white p-6 group transition-colors hover:bg-gray-50/50 relative">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                    p.is_required ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"
                  )}>
                    <DocumentDuplicateIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-gray-900 leading-none">{p.name}</h3>
                      {p.is_required ? (
                        <Badge variant="danger" size="sm" className="font-black italic px-2 py-0.5 text-[8px] bg-red-100 text-red-600 border-none uppercase">Wajib</Badge>
                      ) : (
                        <Badge variant="gray" size="sm" className="font-bold text-[8px] border-none uppercase">Opsional</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-2 mb-3">Identitas: {p.slug}</p>
                    <p className="text-xs text-gray-500 leading-relaxed italic line-clamp-2 pr-12">
                      {p.description || 'Tidak ada instruksi khusus untuk berkas ini.'}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      Terdaftar pada {formatDate(p.created_at)}
                    </div>
                  </div>
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  <button 
                    onClick={() => openModal(p)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Ubah Konfigurasi"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Hapus tipe dokumen ini?')) deleteMutation.mutate(p.id); }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Hapus"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <Panel
        isOpen={modal}
        onClose={closeModal}
        title={editing ? 'Ubah Tipe Dokumen' : 'Tipe Dokumen Baru'}
        subtitle={editing ? `Update persyaratan dokumen: ${editing.slug}` : 'Tambahkan jenis dokumen baru yang diperlukan tenant'}
        footer={<>
          <Button variant="outline" size="sm" onClick={closeModal} className="px-6">Batal</Button>
          <Button 
            variant="primary" 
            size="sm" 
            loading={saveMutation.isPending} 
            onClick={() => saveMutation.mutate(form)}
            className="px-10"
          >
            Simpan Tipe
          </Button>
        </>}
      >
        <div className="space-y-6">
          <Input 
            label="Nama Dokumen *" 
            placeholder="Contoh: KTP Pemilik / SIUP" 
            value={form.name} 
            error={errors.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            required 
          />
          
          <div 
            onClick={() => setForm({...form, is_required: !form.is_required})}
            className={clsx(
              "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
              form.is_required ? "border-red-500 bg-red-50" : "border-gray-100 bg-white hover:border-gray-200"
            )}
          >
            <div>
              <p className={clsx("text-sm font-bold", form.is_required ? "text-red-700" : "text-gray-700")}>
                Wajib Diunggah?
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Jika aktif, user tidak bisa menyelesaikan pendaftaran tanpa dokumen ini.</p>
            </div>
            <div className={clsx(
              "w-12 h-6 rounded-full relative transition-colors p-1",
              form.is_required ? "bg-red-500" : "bg-gray-200"
            )}>
              <div className={clsx(
                "w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                form.is_required ? "translate-x-6" : "translate-x-0"
              )} />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2 text-xs">Instruksi Khusus (Opsional)</label>
            <textarea
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-[#2D6A4F]/20 transition-all min-h-[120px]"
              placeholder="Berikan instruksi cara mengunggah atau format yang diinginkan..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}
