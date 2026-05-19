import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Silakan masukkan email Anda');

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
      toast.success('Instruksi reset password telah dikirim!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-[#2D6A4F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2D6A4F]/20 mb-4 transition-transform hover:scale-110 duration-300">
          <span className="text-2xl" role="img" aria-label="KantinKita Logo">🍽️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KantinKita</h1>
      </div>

      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
        {!isSent ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Lupa Password?</h2>
              <p className="text-sm text-gray-500">
                Masukkan email Anda untuk menerima instruksi pengaturan ulang password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Alamat Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<EnvelopeIcon className="w-5 h-5 text-gray-400" />}
                required
              />

              <Button
                type="submit"
                className="w-full py-3.5 rounded-xl font-semibold shadow-lg shadow-[#2D6A4F]/20"
                isLoading={isLoading}
              >
                Kirim Instruksi
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Cek Email Anda!</h2>
            <p className="text-sm text-gray-500 mb-8 px-4">
              Kami telah mengirimkan instruksi ke <strong>{email}</strong>. 
              Silakan cek kotak masuk (atau folder spam) Anda.
            </p>
            <Link 
              to="/reset-password" 
              className="text-[#2D6A4F] font-semibold hover:underline"
            >
              Sudah punya token? Masukkan di sini
            </Link>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2D6A4F] font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
