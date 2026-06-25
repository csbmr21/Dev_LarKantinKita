import React, { useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  ArrowRightIcon, 
  ChevronLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

/* ─── tiny Google SVG ─────────────────────────────────── */
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login() {
  // Step management
  const [step, setStep] = useState(1); // 1 = company code, 2 = email/pass or google
  const [companyCode, setCompanyCode] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null); // { company_name, company_code, tenant_count }
  const [companyError, setCompanyError] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);

  // Login form
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  const { login } = useAuth();
  const location = useLocation();
  const hasToasted = useRef(false);
  const codeInputRef = useRef(null);

  React.useEffect(() => {
    if (hasToasted.current) return;
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    if (err) {
      toast.error(err);
      hasToasted.current = true;
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  /* ── Step 1: Verifikasi company code ─────────────── */
  const handleCheckCompany = async (e) => {
    e.preventDefault();
    if (!companyCode.trim()) {
      setCompanyError('Kode perusahaan wajib diisi');
      return;
    }
    setCompanyError('');
    setCompanyLoading(true);
    try {
      const res = await authApi.checkCompany(companyCode.trim().toUpperCase());
      setCompanyInfo(res.data.data);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Kode perusahaan tidak valid.';
      setCompanyError(msg);
    } finally {
      setCompanyLoading(false);
    }
  };

  /* ── Step 2: Login dengan email/password ─────────── */
  const validateLogin = () => {
    const e = {};
    if (!form.email) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.password) e.password = 'Password wajib diisi';
    else if (form.password.length < 6) e.password = 'Password minimal 6 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoginLoading(true);
    try {
      const res = await authApi.login(form.email, form.password);
      const { user, token } = res.data.data;
      login(user, token);
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Login gagal. Periksa email dan password.';
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        toast.error(msg);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setCompanyInfo(null);
    setErrors({});
    setForm({ email: '', password: '' });
  };

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
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Platform Kantin Digital</p>
      </div>

      {/* Main Card */}
      <div className="kk-auth-card">
        {/* Progress Header */}
        <div className="kk-auth-header">
          <div className="flex items-center justify-between">
            <div>
              <div className="kk-step-indicator">
                <div className={`kk-step-dot ${step === 1 ? 'active' : 'done'}`} />
                <div className={`kk-step-dot ${step === 2 ? 'active' : ''}`} />
              </div>
              <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
                Langkah {step} dari 2
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white font-black">
                {step === 1 ? 'Verifikasi Instansi' : 'Masuk ke Akun'}
              </p>
            </div>
          </div>
        </div>

        <div className="kk-auth-body">
          {/* STEP 1: Company Code */}
          {step === 1 && (
            <div className="kk-auth-slide">
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                Silakan masukkan <span className="text-emerald-700 font-bold underline decoration-emerald-200 underline-offset-4">kode instansi</span> yang diberikan oleh pengelola kantin Anda,Jika anda customer silahkan input sesuai dengan <span className="text-emerald-700 font-bold underline decoration-emerald-200 underline-offset-4">wilayah </span> Anda.
              </p>

              <form onSubmit={handleCheckCompany}>
                <div className="kk-auth-input-wrapper">
                  <BuildingOfficeIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    ref={codeInputRef}
                    type="text"
                    autoFocus
                    placeholder="KODE INSTANSI (Contoh: UNIV01)"
                    value={companyCode}
                    onChange={(e) => {
                      setCompanyCode(e.target.value.toUpperCase());
                      if (companyError) setCompanyError('');
                    }}
                    className={`kk-auth-input ${companyError ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                </div>

                {companyError && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold mb-4 px-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {companyError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={companyLoading}
                  className="kk-btn kk-btn-primary kk-btn-block kk-btn-lg shadow-xl shadow-emerald-900/20"
                >
                  {companyLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memverifikasi…
                    </div>
                  ) : (
                    <>Lanjutkan <ArrowRightIcon className="w-4 h-4 ml-1" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Login Details */}
          {step === 2 && (
            <div className="kk-auth-slide">
              <div className="flex items-center gap-3 mb-6 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest leading-none">Instansi Terverifikasi</p>
                  <p className="text-sm font-black text-gray-900 truncate">{companyInfo?.company_name}</p>
                </div>
                <button 
                  onClick={handleBackToStep1}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Ganti Instansi"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLogin}>
                <div className="kk-auth-input-wrapper">
                  <EnvelopeIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email Anda"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`kk-auth-input ${errors.email ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.email}</p>}
                </div>

                <div className="kk-auth-input-wrapper">
                  <LockClosedIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`kk-auth-input ${errors.password ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.password}</p>}
                </div>

                <div className="flex justify-end mb-6">
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
                    Lupa password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="kk-btn kk-btn-primary kk-btn-block kk-btn-lg shadow-xl shadow-emerald-900/20 mb-4"
                >
                  {loginLoading ? 'Memproses…' : 'Masuk Sekarang'}
                </button>

                <div className="kk-auth-divider">Atau masuk with</div>

                <button 
                  type="button"
                  className="kk-btn-social"
                  onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/google/redirect`}
                >
                  <GoogleIcon />
                  Google Account
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center space-y-3">
          <p className="text-xs text-gray-500 font-medium">
            Belum punya akun?{' '}
            <Link to="/register" className="text-emerald-700 font-black hover:underline underline-offset-4">
              Daftar Instansi Baru
            </Link>
          </p>
          <Link
            to="/customer-login"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-sm font-black shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Saya Pelanggan — Masuk / Daftar
          </Link>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="mt-12 text-center text-gray-400 font-bold text-[10px] uppercase tracking-[3px]">
        &copy; 2024 KantinKita &bull; V2.0 Stable
      </div>
    </div>
  );
}
