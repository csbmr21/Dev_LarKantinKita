import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../../../store/authStore';
import { authApi } from '../../../../api/auth';
import toast from 'react-hot-toast';
import {
  ChevronLeftIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

export default function EditProfileScreen({ onBack }) {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    dob: user?.dob ?? '',
    phone: user?.phone ?? '',
  });
  const [pwForm, setPwForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [photoPreview, setPhotoPreview] = useState(user?.photo_url ?? user?.photo ?? null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm((f) => ({ ...f, [k]: e.target.value }));

  /* ── Photo Upload ─────────────────────────────────── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Foto maksimal 2MB');
      return;
    }
    setSelectedFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ── Save Profile ─────────────────────────────────── */
  const handleSaveProfile = async () => {
    setLoading(true);
    setErrors({});
    try {
      const formData = new FormData();
      formData.append('full_name', user?.full_name ?? 'Pengguna');
      formData.append('phone', form.phone);
      if (form.dob) formData.append('dob', form.dob);
      if (selectedFile) formData.append('photo', selectedFile);

      const res = await authApi.updateProfile(formData);
      updateUser(res.data.data);
      setSelectedFile(null);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      const e = err.response?.data?.errors ?? {};
      setErrors(e);
      toast.error(err.response?.data?.message ?? 'Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  /* ── Change Password ──────────────────────────────── */
  const handleChangePassword = async () => {
    const e = {};
    if (!pwForm.current_password) e.current_password = 'Password saat ini wajib diisi';
    if (pwForm.password.length < 8) e.password = 'Password baru minimal 8 karakter';
    if (pwForm.password !== pwForm.password_confirmation) e.password_confirmation = 'Konfirmasi password tidak cocok';
    if (Object.keys(e).length) { setPwErrors(e); return; }

    setPwLoading(true);
    setPwErrors({});
    try {
      await authApi.changePassword(pwForm);
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Password berhasil diubah');
    } catch (err) {
      const e = err.response?.data?.errors ?? {};
      setPwErrors(e);
      toast.error(err.response?.data?.message ?? 'Gagal mengubah password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="kk-screen-container bg-gray-50/50">
      <div className="app-scroll">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <h1 className="text-base font-black text-gray-900">Edit Profil</h1>
        </div>

        <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
          {/* ── Avatar ──────────────────────────────── */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-[#2D6A4F] flex items-center justify-center text-white text-4xl font-bold">
                {photoPreview ? (
                  <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 bg-emerald-600 rounded-full shadow-lg text-white hover:bg-emerald-700 transition-colors"
                title="Ganti foto profil"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">Ketuk ikon kamera untuk mengganti foto</p>
          </div>

          {/* ── Profile Info ────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informasi Akun</span>
            </div>
            <div className="divide-y divide-gray-50">
              {/* Nama Lengkap (Read-only) */}
              <div className="px-5 py-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Nama Lengkap</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-700 flex-1">{user?.full_name ?? '-'}</p>
                  <LockClosedIcon className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Hanya admin yang dapat mengubah</p>
              </div>

              {/* Username (Read-only) */}
              <div className="px-5 py-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Nama Pengguna</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-700 flex-1">@{user?.username ?? '-'}</p>
                  <LockClosedIcon className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Hanya admin yang dapat mengubah</p>
              </div>

              {/* Email (Read-only) */}
              <div className="px-5 py-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Alamat Email</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-700 flex-1">{user?.email ?? '-'}</p>
                  <LockClosedIcon className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Hanya admin yang dapat mengubah</p>
              </div>

              {/* Tanggal Lahir (Editable) */}
              <div className="px-5 py-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Tanggal Lahir</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={set('dob')}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                {errors.dob && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.dob}</p>}
              </div>

              {/* Nomor Telepon (Editable) */}
              <div className="px-5 py-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Nomor Telepon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="08123456789"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Save Profile Button */}
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-black shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {loading ? '⏳ Menyimpan…' : 'Simpan Perubahan'}
          </button>

          {/* ── Password Section ────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keamanan</span>
            </div>
            <div className="divide-y divide-gray-50 px-5 py-4 space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={pwForm.current_password}
                    onChange={setPw('current_password')}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrentPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {pwErrors.current_password && <p className="text-[10px] text-red-500 font-bold mt-1">{pwErrors.current_password}</p>}
              </div>

              {/* New Password */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={pwForm.password}
                    onChange={setPw('password')}
                    placeholder="Min. 8 karakter"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {pwErrors.password && <p className="text-[10px] text-red-500 font-bold mt-1">{pwErrors.password}</p>}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  value={pwForm.password_confirmation}
                  onChange={setPw('password_confirmation')}
                  placeholder="Ulangi password baru"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                {pwErrors.password_confirmation && <p className="text-[10px] text-red-500 font-bold mt-1">{pwErrors.password_confirmation}</p>}
              </div>
            </div>
          </div>

          {/* Change Password Button */}
          <button
            onClick={handleChangePassword}
            disabled={pwLoading}
            className="w-full py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white text-sm font-black shadow-lg transition-all disabled:opacity-50"
          >
            {pwLoading ? '⏳ Mengubah…' : '🔒 Ubah Kata Sandi'}
          </button>

          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}
