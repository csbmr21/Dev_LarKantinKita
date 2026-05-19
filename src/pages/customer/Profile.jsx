import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { CameraIcon } from '@heroicons/react/24/solid';
import { useRef } from 'react';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const fileInputRef            = useRef(null);
  const [tab, setTab]           = useState('profile');
  const [profile, setProfile]   = useState({ full_name: user?.full_name ?? '', phone: user?.phone ?? '' });
  const [pwForm, setPwForm]     = useState({ current_password: '', password: '', password_confirmation: '' });
  const [photoPreview, setPhotoPreview] = useState(user?.photo_url ?? null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Gamba maksimal 2MB');
        return;
      }
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.full_name) { setErrors({ full_name: 'Nama wajib diisi' }); return; }
    setLoading(true);
    try {
      let data = profile;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('full_name', profile.full_name);
        formData.append('phone', profile.phone);
        formData.append('photo', selectedFile);
        data = formData;
      }
      
      const res = await authApi.updateProfile(data);
      updateUser(res.data.data);
      toast.success('Profil berhasil diperbarui');
      setErrors({});
      setSelectedFile(null);
    } catch (err) {
      const e = err.response?.data?.errors ?? {};
      setErrors(e);
      toast.error(err.response?.data?.message ?? 'Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!pwForm.current_password) e2.current_password = 'Wajib diisi';
    if (pwForm.password.length < 8) e2.password = 'Min. 8 karakter';
    if (pwForm.password !== pwForm.password_confirmation) e2.password_confirmation = 'Tidak cocok';
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setLoading(true);
    try {
      await authApi.changePassword(pwForm);
      toast.success('Password berhasil diubah');
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
      setErrors({});
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {});
      toast.error(err.response?.data?.message ?? 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-4 space-y-4 max-w-lg mx-auto">
      {/* Photo & Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-[#2D6A4F] flex items-center justify-center text-white text-3xl font-bold">
            {photoPreview ? (
              <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user?.full_name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-[#2D6A4F] hover:bg-gray-50 transition-colors"
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
        
        <div>
          <h1 className="text-xl font-bold text-gray-800">{user?.full_name}</h1>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="text-xs bg-[#f0fdf4] text-[#2D6A4F] font-semibold px-2 py-0.5 rounded-full capitalize mt-1 inline-block">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[['profile','Profil'], ['password','Password']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <Input label="Nama Lengkap" value={profile.full_name} error={errors.full_name}
            onChange={(e) => setProfile((f) => ({ ...f, full_name: e.target.value }))} required />
          <Input label="No. HP" type="tel" value={profile.phone} error={errors.phone}
            onChange={(e) => setProfile((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" value={user?.email ?? ''} disabled
            hint="Email tidak dapat diubah" />
          <Button type="submit" fullWidth loading={loading}>Simpan Perubahan</Button>
        </form>
      )}

      {/* Password Form */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordSave} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <Input label="Password Saat Ini" type="password" value={pwForm.current_password} error={errors.current_password}
            onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))} required />
          <Input label="Password Baru" type="password" value={pwForm.password} error={errors.password}
            onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))} hint="Min. 8 karakter" required />
          <Input label="Konfirmasi Password" type="password" value={pwForm.password_confirmation} error={errors.password_confirmation}
            onChange={(e) => setPwForm((f) => ({ ...f, password_confirmation: e.target.value }))} required />
          <Button type="submit" fullWidth loading={loading} variant="ghost">Ubah Password</Button>
        </form>
      )}

      {/* Logout Button */}
      <div className="pt-8 mb-6">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center p-3 rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
