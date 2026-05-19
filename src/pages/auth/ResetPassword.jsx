import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { KeyIcon, EnvelopeIcon, ArrowLeftIcon, TicketIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-fill from URL if present
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    if (email || token) {
      setFormData(prev => ({
        ...prev,
        email: email || '',
        token: token || '',
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      return toast.error('Konfirmasi password tidak cocok');
    }

    setIsLoading(true);
    try {
      const res = await authApi.resetPassword(formData);
      toast.success(res.data.message || 'Password berhasil diubah!');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password. Periksa kembali token Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-[#2D6A4F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2D6A4F]/20 mb-4">
          <span className="text-2xl" role="img" aria-label="KantinKita Logo">🍽️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KantinKita</h1>
      </div>

      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-sm text-gray-500">
            Masukkan kode verifikasi dan password baru Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Alamat Email"
            type="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<EnvelopeIcon className="w-5 h-5 text-gray-400" />}
            required
          />

          <Input
            label="Kode Verifikasi (Token)"
            type="text"
            placeholder="8 Karakter Token"
            value={formData.token}
            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
            icon={<TicketIcon className="w-5 h-5 text-gray-400" />}
            required
          />

          <Input
            label="Password Baru"
            type="password"
            placeholder="Min. 8 karakter"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={<KeyIcon className="w-5 h-5 text-gray-400" />}
            required
          />

          <Input
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password baru"
            value={formData.password_confirmation}
            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
            icon={<KeyIcon className="w-5 h-5 text-gray-400" />}
            required
          />

          <Button
            type="submit"
            className="w-full py-3.5 rounded-xl font-semibold shadow-lg shadow-[#2D6A4F]/20 mt-4"
            isLoading={isLoading}
          >
            Ubah Password
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <Link 
            to="/forgot-password" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2D6A4F] font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Kembali ke Lupa Password
          </Link>
        </div>
      </div>
    </div>
  );
}
