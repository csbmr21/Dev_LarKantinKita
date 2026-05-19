import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { getDashboardPath, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="text-7xl mb-6 select-none">🚫</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          ← Kembali
        </Button>
        <Button variant="primary" size="sm"
          onClick={() => navigate(isAuthenticated ? getDashboardPath() : '/login', { replace: true })}>
          Ke Beranda
        </Button>
      </div>
    </div>
  );
}
