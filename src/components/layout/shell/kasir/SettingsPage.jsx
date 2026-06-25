import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../../../../api/tenant';
import toast from 'react-hot-toast';
import {
  ShoppingBagIcon, PrinterIcon, BellIcon, BanknotesIcon, ShieldCheckIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: tenant } = useQuery({
    queryKey: ['my-tenant-settings'],
    queryFn: () => tenantApi.getMyTenant().then(r => r.data?.data ?? r.data),
  });

  const [form, setForm] = useState({
    tenant_name: '',
    address: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const photoRef = useRef(null);

  useEffect(() => {
    if (tenant) {
      setForm({
        tenant_name: tenant.tenant_name || '',
        address: tenant.address || '',
      });
      setPhotoPreview(tenant.photo_url ?? null);
    }
  }, [tenant?.tenant_name, tenant?.address, tenant?.photo_url]);

  const { mutate: update, isLoading: saving } = useMutation({
    mutationFn: (data) => tenantApi.updateMyTenant(data),
    onSuccess: () => {
      toast.success('Pengaturan berhasil disimpan');
      qc.invalidateQueries({ queryKey: ['my-tenant-settings'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal menyimpan pengaturan'),
  });

  const handleSave = () => {
    const formData = new FormData();
    formData.append('tenant_name', form.tenant_name);
    formData.append('address', form.address);
    if (photoFile) formData.append('photo', photoFile);
    update(formData);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Foto maksimal 2MB'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
              <ShoppingBagIcon className="w-5 h-5 text-[#2D6A4F]" />
              <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Informasi Toko</span>
            </div>
            <div className="p-8 space-y-5">
              {/* Photo Upload */}
              <div className="flex items-center gap-4 pb-5 border-b border-gray-50">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden">
                    {photoPreview
                      ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                      : (tenant?.tenant_name?.charAt(0)?.toUpperCase() ?? 'T')
                    }
                  </div>
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#2D6A4F] rounded-lg shadow-lg flex items-center justify-center text-white hover:bg-[#1B4332] transition-colors"
                  >
                    <CameraIcon className="w-3.5 h-3.5" />
                  </button>
                  <input type="file" ref={photoRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>
                <div>
                  <p className="text-[12px] font-black text-gray-900">Foto Profil Toko</p>
                  <p className="text-[10px] font-bold text-gray-400">JPG/PNG, maks 2MB</p>
                </div>
              </div>

              <div className="form-group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nama Toko</label>
                <input 
                  value={form.tenant_name} 
                  onChange={e => setForm(f => ({ ...f, tenant_name: e.target.value }))}
                  className="w-full h-12 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-[#40916C] transition-all" 
                />
              </div>
              <div className="form-group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Alamat / Lokasi</label>
                <input 
                  value={form.address} 
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full h-12 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-[#40916C] transition-all" 
                />
              </div>
              <button 
                disabled={saving}
                onClick={handleSave}
                className="w-full h-14 bg-[#2D6A4F] text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
              <PrinterIcon className="w-5 h-5 text-[#2D6A4F]" />
              <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Printer & Struk</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-3xl transition-all group">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">🖨</div>
                <div className="flex-1"><p className="text-[13px] font-black text-gray-900">Printer Struk</p><p className="text-[10px] font-bold text-gray-400">Epson TM-T20III · USB Connected</p></div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full uppercase">Online</span>
              </div>
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-3xl transition-all group">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">📋</div>
                <div className="flex-1"><p className="text-[13px] font-black text-gray-900">Auto Print Struk</p><p className="text-[10px] font-bold text-gray-400">Cetak struk setiap transaksi selesai</p></div>
                <div className="w-11 h-6 bg-[#2D6A4F] rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
              <BellIcon className="w-5 h-5 text-[#2D6A4F]" />
              <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Notifikasi</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-3xl transition-all group">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">🔔</div>
                <div className="flex-1"><p className="text-[13px] font-black text-gray-900">Notif Order Baru</p><p className="text-[10px] font-bold text-gray-400">Bunyi + Visual saat pesanan masuk</p></div>
                <div className="w-11 h-6 bg-[#2D6A4F] rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
              </div>
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-3xl transition-all group">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl">⚠️</div>
                <div className="flex-1"><p className="text-[13px] font-black text-gray-900">Notif Stok Menipis</p><p className="text-[10px] font-bold text-gray-400">Peringatan saat stok menu &lt; 5</p></div>
                <div className="w-11 h-6 bg-[#2D6A4F] rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
              <BanknotesIcon className="w-5 h-5 text-[#2D6A4F]" />
              <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Pajak & Biaya</span>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div><p className="text-[13px] font-black text-gray-900">Aktifkan PPN (11%)</p><p className="text-[10px] font-bold text-gray-400">Ditambahkan otomatis ke total</p></div>
                <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
              </div>
              <div className="form-group"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Biaya Layanan (Rp)</label><input className="w-full h-12 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-bold outline-none" defaultValue="500" /></div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-[#2D6A4F]" />
              <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Keamanan</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-3xl transition-all group">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">🔑</div>
                <div className="flex-1"><p className="text-[13px] font-black text-gray-900">PIN Kasir</p><p className="text-[10px] font-bold text-gray-400">Wajib input PIN untuk akses shift</p></div>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-[9px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all">Ubah PIN</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
