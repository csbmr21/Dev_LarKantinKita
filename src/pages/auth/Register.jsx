import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const INITIAL = { full_name: '', username: '', email: '', phone: '', password: '', password_confirmation: '' };

export default function Register() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const hasToasted = React.useRef(false);

  useEffect(() => {
    if (hasToasted.current) return;
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    if (err) {
      toast.error(err);
      hasToasted.current = true;
      // Clean up url
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.full_name || form.full_name.length < 3) e.full_name = 'Nama minimal 3 karakter';
    if (!form.username || form.username.length < 3) e.username = 'Username minimal 3 karakter';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Hanya huruf, angka, dan underscore';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email tidak valid';
    if (!form.phone || !/^(\+62|62|0)8[0-9]{8,11}$/.test(form.phone)) e.phone = 'Nomor HP tidak valid';
    if (!form.password || form.password.length < 8) e.password = 'Password minimal 8 karakter';
    if (form.password !== form.password_confirmation) e.password_confirmation = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register(form);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success('Akun berhasil dibuat!');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        toast.error(err.response?.data?.message ?? 'Pendaftaran gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-white flex flex-col items-center justify-center px-5 py-12">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🍽️</div>
        <h1 className="text-2xl font-bold text-[#2D6A4F]">KantinKita</h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Buat Akun Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <Input label="Nama Lengkap" placeholder="John Doe" value={form.full_name}
            onChange={set('full_name')} error={errors.full_name} required />
          <Input label="Username" placeholder="johndoe" value={form.username}
            onChange={set('username')} error={errors.username} required />
          <Input label="Email" type="email" placeholder="john@email.com" value={form.email}
            onChange={set('email')} error={errors.email} required />
          <Input label="No. HP" type="tel" placeholder="08123456789" value={form.phone}
            onChange={set('phone')} error={errors.phone} required />
          <Input label="Password" type="password" placeholder="Min. 8 karakter" value={form.password}
            onChange={set('password')} error={errors.password} required />
          <Input label="Konfirmasi Password" type="password" placeholder="Ulangi password" value={form.password_confirmation}
            onChange={set('password_confirmation')} error={errors.password_confirmation} required />
          <Button type="submit" fullWidth loading={loading} className="mt-2">
            Daftar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#2D6A4F] font-semibold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
