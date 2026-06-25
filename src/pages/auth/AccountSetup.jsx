import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import {
  UserIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

export default function AccountSetup() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Google users have a photo URL from Google and no real password yet
  const isGoogleUser = !!user?.google_id;
  // Fields already filled from regular registration
  const hasData = !isGoogleUser && !!user?.username;

  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    no_ktp: '',
    dob: '',
    role: 'customer',
    tenant_name: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (user?.profile_completed) {
      navigate('/', { replace: true });
      return;
    }
    if (user) {
      setForm(f => ({
        ...f,
        username:  user.username  || '',
        full_name: user.full_name || user.name || '',
        email:     user.email     || '',
        phone:     user.phone     || '',
        no_ktp:    user.no_ktp    || '',
        dob:       user.dob       || '',
        role:      (user.role && user.role !== 'customer') ? user.role : 'customer',
      }));
    }
  }, [user, navigate]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Frontend: require password only for Google users
    if (isGoogleUser && !form.password) {
      setErrors({ password: 'Password wajib diisi untuk login Google' });
      setLoading(false);
      return;
    }

    // Frontend: require NIK
    if (!form.no_ktp || form.no_ktp.length !== 16) {
      setErrors(prev => ({ ...prev, no_ktp: 'NIK wajib diisi dan harus 16 digit' }));
      setLoading(false);
      return;
    }

    try {
      const payload = { ...form };
      // If regular user and password empty, don't send it (backend keeps existing)
      if (!isGoogleUser && !payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      const res = await authApi.setupProfile(payload);
      const updatedUser = res.data?.data ?? res.data;

      useAuthStore.getState().login(updatedUser, useAuthStore.getState().token);
      toast.success('Profil berhasil dilengkapi!');

      setTimeout(() => {
        if (updatedUser.role === 'owner') {
          navigate('/owner', {
            replace: true,
            state: { showWelcome: true, companyCode: updatedUser.company_code, tenantName: updatedUser.tenant?.tenant_name },
          });
        } else if (updatedUser.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (updatedUser.role === 'staff') {
          navigate('/staff', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 100);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        toast.error('Cek kembali form Anda.');
      } else {
        toast.error(err.response?.data?.message || 'Gagal menyimpan profil.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `kk-auth-input ${errors[field] ? '!border-red-500 !bg-red-50' : ''}`;
  const errMsg = (field) =>
    errors[field] ? <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors[field]}</p> : null;

  return (
    <div className="kk-auth-container">
      {/* Decorative blobs */}
      <div className="kk-auth-blob" style={{ top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%)' }} />
      <div className="kk-auth-blob" style={{ bottom: '-80px', left: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%)' }} />

      {/* Logo Section */}
      <div className="kk-auth-logo-section">
        <div className="kk-auth-logo-icon">
          <AcademicCapIcon className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">KantinKita</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Lengkapi Data Diri Anda</p>
      </div>

      {/* Main Card */}
      <div className="kk-auth-card">
        {/* Header */}
        <div className="kk-auth-header">
          <div className="flex items-center justify-center gap-1 w-full">
            <div className="px-6 py-2 text-sm font-black uppercase tracking-widest rounded-xl bg-white text-emerald-700 shadow-md">
              Setup Akun
            </div>
          </div>
        </div>

        <div className="kk-auth-body">
          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
            {isGoogleUser
              ? 'Akun Anda berhasil dibuat via Google. Lengkapi data berikut untuk mulai menggunakan KantinKita.'
              : 'Hampir selesai! Lengkapi data berikut untuk menyempurnakan profil Anda.'}
          </p>

          {/* Show pre-filled badge for regular registration users */}
          {hasData && (
            <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-[11px] font-bold text-emerald-700">Data dari pendaftaran sudah terisi otomatis</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ── Section: Informasi Akun ────────────── */}
            <div className="mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Informasi Akun</p>
            </div>

            {/* Username */}
            <div className="kk-auth-input-wrapper">
              <UserIcon className="kk-auth-input-icon w-5 h-5" />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={set('username')}
                className={`${inputClass('username')} ${hasData ? '!bg-gray-50 !text-gray-500' : ''}`}
                readOnly={hasData}
              />
              {errMsg('username')}
            </div>

            {/* Full Name */}
            <div className="kk-auth-input-wrapper">
              <IdentificationIcon className="kk-auth-input-icon w-5 h-5" />
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={form.full_name}
                onChange={set('full_name')}
                className={`${inputClass('full_name')} ${hasData ? '!bg-gray-50 !text-gray-500' : ''}`}
                readOnly={hasData}
              />
              {errMsg('full_name')}
            </div>

            {/* Email (always read-only) */}
            <div className="kk-auth-input-wrapper">
              <EnvelopeIcon className="kk-auth-input-icon w-5 h-5" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                readOnly
                className="kk-auth-input !bg-gray-50 !text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div className="kk-auth-input-wrapper">
              <PhoneIcon className="kk-auth-input-icon w-5 h-5" />
              <input
                type="tel"
                placeholder="No. HP (contoh: 08123456789)"
                value={form.phone}
                onChange={set('phone')}
                className={`${inputClass('phone')} ${hasData && form.phone ? '!bg-gray-50 !text-gray-500' : ''}`}
                readOnly={hasData && !!form.phone}
              />
              {errMsg('phone')}
            </div>

            {/* Password */}
            <div className="kk-auth-input-wrapper">
              <LockClosedIcon className="kk-auth-input-icon w-5 h-5" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder={isGoogleUser ? 'Buat Password (min. 8 karakter)' : 'Kosongkan jika tidak ingin mengubah'}
                value={form.password}
                onChange={set('password')}
                className={inputClass('password')}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
              {errMsg('password')}
            </div>

            {/* Confirm Password (only show if password is being filled) */}
            {(isGoogleUser || form.password) && (
              <div className="kk-auth-input-wrapper animate-fadeIn">
                <LockClosedIcon className="kk-auth-input-icon w-5 h-5" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Konfirmasi Password"
                  value={form.password_confirmation}
                  onChange={set('password_confirmation')}
                  className={inputClass('password_confirmation')}
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirmPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
                {errMsg('password_confirmation')}
              </div>
            )}

            {!isGoogleUser && (
              <p className="text-[10px] text-gray-400 font-medium ml-1 -mt-1 mb-3">
                * Kosongkan password jika ingin tetap menggunakan password dari pendaftaran
              </p>
            )}

            {/* ── Section: Informasi Personal ─────────── */}
            <div className="mt-4 mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Informasi Personal</p>
            </div>

            {/* NIK */}
            <div className="kk-auth-input-wrapper">
              <CreditCardIcon className="kk-auth-input-icon w-5 h-5" />
              <input
                type="text"
                placeholder="NIK / No. KTP (16 digit)"
                value={form.no_ktp}
                onChange={set('no_ktp')}
                className={inputClass('no_ktp')}
                maxLength={16}
              />
              {errMsg('no_ktp')}
            </div>

            {/* Date of Birth */}
            <div className="kk-auth-input-wrapper">
              <CalendarDaysIcon className="kk-auth-input-icon w-5 h-5" />
              <input
                type="date"
                placeholder="Tanggal Lahir"
                value={form.dob}
                onChange={set('dob')}
                className={inputClass('dob')}
              />
              {errMsg('dob')}
            </div>

            {/* ── Section: Jenis Akun ─────────────────── */}
            <div className="mt-4 mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Jenis Akun</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Customer option */}
              <label
                className={`flex flex-col p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                  form.role === 'customer'
                    ? 'border-[#2D6A4F] bg-emerald-50 shadow-sm'
                    : 'border-gray-200 hover:border-[#2D6A4F]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={form.role === 'customer'}
                    onChange={set('role')}
                    className="text-[#2D6A4F] focus:ring-[#2D6A4F] w-4 h-4"
                  />
                  <span className="text-[13px] font-black text-gray-800">Pelanggan</span>
                </div>
                <p className="text-[10px] text-gray-500 pl-6 leading-relaxed">Pesan makanan dari kantin favorit.</p>
              </label>

              {/* Owner option */}
              <label
                className={`flex flex-col p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                  form.role === 'owner'
                    ? 'border-[#2D6A4F] bg-emerald-50 shadow-sm'
                    : 'border-gray-200 hover:border-[#2D6A4F]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="role"
                    value="owner"
                    checked={form.role === 'owner'}
                    onChange={set('role')}
                    className="text-[#2D6A4F] focus:ring-[#2D6A4F] w-4 h-4"
                  />
                  <span className="text-[13px] font-black text-gray-800">Pemilik Kantin</span>
                </div>
                <p className="text-[10px] text-gray-500 pl-6 leading-relaxed">Kelola kantin & terima pesanan.</p>
              </label>
            </div>
            {errMsg('role')}

            {/* Tenant Name if Owner */}
            {form.role === 'owner' && (
              <div className="kk-auth-input-wrapper animate-fadeIn">
                <BuildingStorefrontIcon className="kk-auth-input-icon w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nama Toko / Kantin"
                  value={form.tenant_name}
                  onChange={set('tenant_name')}
                  className={inputClass('tenant_name')}
                />
                {errMsg('tenant_name')}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="kk-btn kk-btn-primary kk-btn-block kk-btn-lg shadow-xl shadow-emerald-900/20 mt-6"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </div>
              ) : (
                <>Selesai <ArrowRightIcon className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            Data Anda akan digunakan untuk memverifikasi identitas dan memproses pesanan.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-gray-400 font-bold text-[10px] uppercase tracking-[3px]">
        &copy; 2024 KantinKita &bull; V2.0 Stable
      </div>
    </div>
  );
}
