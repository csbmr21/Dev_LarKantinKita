import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

/* ─── tiny Google SVG ─────────────────────────────────── */
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/* ─── Step indicator ──────────────────────────────────── */
const StepDot = ({ active, done, label }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
        done
          ? 'bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/30'
          : active
          ? 'bg-[#2D6A4F]/10 border-2 border-[#2D6A4F] text-[#2D6A4F]'
          : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
      }`}
    >
      {done ? '✓' : label}
    </div>
    <span className={`text-[10px] font-medium ${active || done ? 'text-[#2D6A4F]' : 'text-gray-400'}`}>
      {label === '1' ? 'Kode Kantor' : 'Masuk'}
    </span>
  </div>
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5f0 50%, #ffffff 100%)' }}>

      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div className="text-center mb-8 z-10">
        <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '12px', filter: 'drop-shadow(0 4px 12px rgba(45,106,79,0.2))' }}>🍽️</div>
        <h1 className="text-3xl font-bold" style={{ color: '#1a4731', letterSpacing: '-0.5px' }}>KantinKita</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Platform Kantin Digital</p>
      </div>

      {/* Card */}
      <div className="w-full z-10" style={{ maxWidth: '480px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(45,106,79,0.1)',
          boxShadow: '0 20px 60px rgba(45,106,79,0.08), 0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>

          {/* Header strip */}
          <div style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)', padding: '20px 28px' }}>
            <div className="flex items-center justify-between">
              {/* Steps */}
              <div className="flex items-center gap-3">
                <StepDot active={step === 1} done={step > 1} label="1" />
                <div style={{ width: '32px', height: '2px', background: step > 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)', borderRadius: '2px', transition: 'background 0.4s' }} />
                <StepDot active={step === 2} done={false} label="2" />
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Langkah {step} dari 2</p>
                <p className="text-sm text-white font-semibold mt-0.5">
                  {step === 1 ? 'Verifikasi Instansi' : 'Pilih Metode Masuk'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '28px' }}>

            {/* ═══ STEP 1: Company Code ═══════════════════════════ */}
            {step === 1 && (
              <div style={{ animation: 'fadeSlideIn 0.35s ease' }}>
                <div className="mb-6">
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Masukkan <span className="font-semibold text-[#2D6A4F]">kode instansi / perusahaan</span> Anda untuk melanjutkan proses masuk.
                  </p>
                </div>

                <form onSubmit={handleCheckCompany} noValidate>
                  {/* Code input */}
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kode Perusahaan / Instansi
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </span>
                      <input
                        ref={codeInputRef}
                        id="company_code"
                        type="text"
                        autoFocus
                        autoComplete="off"
                        value={companyCode}
                        onChange={(e) => {
                          setCompanyCode(e.target.value.toUpperCase());
                          if (companyError) setCompanyError('');
                        }}
                        placeholder="Contoh: UNIV, RS001, PJPTK"
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          border: companyError ? '1.5px solid #ef4444' : '1.5px solid #d1fae5',
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: '600',
                          letterSpacing: '2px',
                          color: '#1a4731',
                          background: '#f0fdf4',
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => { if (!companyError) e.target.style.borderColor = '#2D6A4F'; e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)'; }}
                        onBlur={(e) => { if (!companyError) e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    {companyError && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {companyError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={companyLoading}
                    style={{
                      marginTop: '20px',
                      width: '100%',
                      padding: '13px',
                      background: companyLoading ? '#6b9e8a' : 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: companyLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: companyLoading ? 'none' : '0 4px 15px rgba(45,106,79,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => { if (!companyLoading) e.target.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
                  >
                    {companyLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        Verifikasi & Lanjutkan
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-5">
                  Hubungi administrator Anda jika tidak memiliki kode perusahaan.
                </p>

                {/* ── Divider ── */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium bg-white px-3 py-1 rounded-full border border-gray-200">ATAU</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* ── Google Login ── */}
                <a
                  href="/api/v1/auth/google/redirect"
                  id="google_login_btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '12px',
                    background: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <GoogleIcon />
                  Lanjutkan dengan Google
                </a>

                <p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
                  Akun baru akan otomatis dibuat. Tanpa perlu mengingat password.
                </p>
              </div>
            )}

            {/* ═══ STEP 2: Login methods ══════════════════════════ */}
            {step === 2 && (
              <div style={{ animation: 'fadeSlideIn 0.35s ease' }}>

                {/* Company badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500">Terverifikasi sebagai</p>
                    <p className="text-sm font-bold text-[#1a4731] truncate">{companyInfo?.company_name}</p>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px',
                    background: '#2D6A4F', color: 'white',
                    fontSize: '11px', fontWeight: '700', letterSpacing: '1px',
                    flexShrink: 0,
                  }}>
                    {companyInfo?.company_code}
                  </span>
                </div>

                {/* ── Email / Password Form ── */}
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#2D6A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Masuk dengan Email & Password
                  </h3>
                  <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    <Input
                      label="Email"
                      type="email"
                      id="login_email"
                      placeholder="nama@email.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      error={errors.email}
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      id="login_password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      error={errors.password}
                      required
                    />
                    <div className="flex justify-end !mt-1">
                      <Link 
                        to="/forgot-password" 
                        className="text-xs font-semibold text-[#2D6A4F] hover:underline"
                      >
                        Lupa Password?
                      </Link>
                    </div>
                    <Button type="submit" fullWidth loading={loginLoading} className="mt-2">
                      Masuk
                    </Button>
                  </form>
                </div>
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-[#2D6A4F] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Ganti kode perusahaan
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} KantinKita &mdash; Platform Kantin Digital
        </p>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
