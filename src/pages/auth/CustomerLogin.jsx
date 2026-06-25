import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  ArrowRightIcon,
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon
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

const REGISTER_INITIAL = { full_name: '', username: '', email: '', phone: '', password: '', password_confirmation: '' };

export default function CustomerLogin() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Register form
  const [regForm, setRegForm] = useState(REGISTER_INITIAL);
  const [regErrors, setRegErrors] = useState({});
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw] = useState(false);

  const { login } = useAuth();
  const location = useLocation();
  const hasToasted = useRef(false);

  useEffect(() => {
    if (hasToasted.current) return;
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    if (err) {
      toast.error(err);
      hasToasted.current = true;
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const setReg = (k) => (e) => setRegForm((f) => ({ ...f, [k]: e.target.value }));

  /* ── Login logic ─────────────────────────────────── */
  const validateLogin = () => {
    const e = {};
    if (!loginForm.email) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) e.email = 'Format email tidak valid';
    if (!loginForm.password) e.password = 'Password wajib diisi';
    else if (loginForm.password.length < 6) e.password = 'Password minimal 6 karakter';
    setLoginErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoginLoading(true);
    try {
      const res = await authApi.login(loginForm.email, loginForm.password);
      const { user, token } = res.data.data;
      login(user, token);
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Login gagal. Periksa email dan password.';
      if (err.response?.status === 422) {
        setLoginErrors(err.response.data.errors ?? {});
      } else {
        toast.error(msg);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  /* ── Register logic ──────────────────────────────── */
  const validateRegister = () => {
    const e = {};
    if (!regForm.full_name || regForm.full_name.length < 3) e.full_name = 'Nama minimal 3 karakter';
    if (!regForm.username || regForm.username.length < 3) e.username = 'Username minimal 3 karakter';
    else if (!/^[a-zA-Z0-9_]+$/.test(regForm.username)) e.username = 'Hanya huruf, angka, dan underscore';
    if (!regForm.email || !/\S+@\S+\.\S+/.test(regForm.email)) e.email = 'Email tidak valid';
    if (!regForm.phone || !/^(\+62|62|0)8[0-9]{8,11}$/.test(regForm.phone)) e.phone = 'Nomor HP tidak valid';
    if (!regForm.password || regForm.password.length < 8) e.password = 'Password minimal 8 karakter';
    if (regForm.password !== regForm.password_confirmation) e.password_confirmation = 'Password tidak cocok';
    setRegErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setRegLoading(true);
    try {
      const res = await authApi.register(regForm);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success('Akun berhasil dibuat!');
    } catch (err) {
      if (err.response?.status === 422) {
        setRegErrors(err.response.data.errors ?? {});
      } else {
        toast.error(err.response?.data?.message ?? 'Pendaftaran gagal');
      }
    } finally {
      setRegLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setLoginErrors({});
    setRegErrors({});
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
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Pesan Makanan Jadi Lebih Mudah</p>
      </div>

      {/* Main Card */}
      <div className="kk-auth-card">
        {/* Tab Header */}
        <div className="kk-auth-header">
          <div className="flex items-center justify-center gap-1 w-full">
            <button
              onClick={() => switchMode('login')}
              className={`px-6 py-2 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`px-6 py-2 text-sm font-black uppercase tracking-widest rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Daftar
            </button>
          </div>
        </div>

        <div className="kk-auth-body">
          {/* ── LOGIN FORM ──────────────────────────── */}
          {mode === 'login' && (
            <div className="kk-auth-slide">
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                Masuk dengan akun yang sudah terdaftar untuk mulai memesan makanan.
              </p>

              <form onSubmit={handleLogin}>
                <div className="kk-auth-input-wrapper">
                  <EnvelopeIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type="email"
                    autoFocus
                    placeholder="Email Anda"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className={`kk-auth-input ${loginErrors.email ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  {loginErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{loginErrors.email}</p>}
                </div>

                <div className="kk-auth-input-wrapper">
                  <LockClosedIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type={showLoginPw ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={`kk-auth-input ${loginErrors.password ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showLoginPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  {loginErrors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{loginErrors.password}</p>}
                </div>

                <div className="flex justify-end mb-6">
                  <Link to="/forgot-password" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
                    Lupa password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="kk-btn kk-btn-primary kk-btn-block kk-btn-lg shadow-xl shadow-emerald-900/20 mb-4"
                >
                  {loginLoading ? 'Memproses...' : (
                    <>Masuk Sekarang <ArrowRightIcon className="w-4 h-4 ml-1" /></>
                  )}
                </button>

                <div className="kk-auth-divider">Atau masuk dengan</div>

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

          {/* ── REGISTER FORM ───────────────────────── */}
          {mode === 'register' && (
            <div className="kk-auth-slide">
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                Buat akun baru untuk mulai memesan makanan dari kantin favorit Anda.
              </p>

              <form onSubmit={handleRegister}>
                <div className="kk-auth-input-wrapper">
                  <UserIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nama Lengkap"
                    value={regForm.full_name}
                    onChange={setReg('full_name')}
                    className={`kk-auth-input ${regErrors.full_name ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  {regErrors.full_name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{regErrors.full_name}</p>}
                </div>

                <div className="kk-auth-input-wrapper">
                  <IdentificationIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={regForm.username}
                    onChange={setReg('username')}
                    className={`kk-auth-input ${regErrors.username ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  {regErrors.username && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{regErrors.username}</p>}
                </div>

                <div className="kk-auth-input-wrapper">
                  <EnvelopeIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={regForm.email}
                    onChange={setReg('email')}
                    className={`kk-auth-input ${regErrors.email ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  {regErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{regErrors.email}</p>}
                </div>

                <div className="kk-auth-input-wrapper">
                  <PhoneIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type="tel"
                    placeholder="No. HP (contoh: 08123456789)"
                    value={regForm.phone}
                    onChange={setReg('phone')}
                    className={`kk-auth-input ${regErrors.phone ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  {regErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{regErrors.phone}</p>}
                </div>

                <div className="kk-auth-input-wrapper">
                  <LockClosedIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type={showRegPw ? 'text' : 'password'}
                    placeholder="Password (min. 8 karakter)"
                    value={regForm.password}
                    onChange={setReg('password')}
                    className={`kk-auth-input ${regErrors.password ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  <button type="button" onClick={() => setShowRegPw(!showRegPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showRegPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  {regErrors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{regErrors.password}</p>}
                </div>

                <div className="kk-auth-input-wrapper">
                  <LockClosedIcon className="kk-auth-input-icon w-5 h-5" />
                  <input
                    type={showRegConfirmPw ? 'text' : 'password'}
                    placeholder="Konfirmasi Password"
                    value={regForm.password_confirmation}
                    onChange={setReg('password_confirmation')}
                    className={`kk-auth-input ${regErrors.password_confirmation ? '!border-red-500 !bg-red-50' : ''}`}
                  />
                  <button type="button" onClick={() => setShowRegConfirmPw(!showRegConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showRegConfirmPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                  {regErrors.password_confirmation && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{regErrors.password_confirmation}</p>}
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="kk-btn kk-btn-primary kk-btn-block kk-btn-lg shadow-xl shadow-emerald-900/20 mb-4 mt-2"
                >
                  {regLoading ? 'Mendaftar...' : (
                    <>Buat Akun <ArrowRightIcon className="w-4 h-4 ml-1" /></>
                  )}
                </button>

                <div className="kk-auth-divider">Atau daftar dengan</div>

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

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium">
            {mode === 'login' ? (
              <>Belum punya akun?{' '}
                <button onClick={() => switchMode('register')} className="text-emerald-700 font-black hover:underline underline-offset-4">
                  Daftar Sekarang
                </button>
              </>
            ) : (
              <>Sudah punya akun?{' '}
                <button onClick={() => switchMode('login')} className="text-emerald-700 font-black hover:underline underline-offset-4">
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Back to main login */}
      <div className="mt-6 text-center">
        <Link to="/login" className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors">
          &larr; Masuk sebagai Staff / Owner / Admin
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-gray-400 font-bold text-[10px] uppercase tracking-[3px]">
        &copy; 2024 KantinKita &bull; V2.0 Stable
      </div>
    </div>
  );
}
