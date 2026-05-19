import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="relative mb-6">
        <div className="text-8xl font-black text-gray-100 select-none leading-none">404</div>
        <div className="text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">🍽️</div>
      </div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        Sepertinya menu yang Anda cari sudah habis. Mari kembali ke halaman utama.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          ← Kembali
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/', { replace: true })}>
          Ke Beranda
        </Button>
      </div>
    </div>
  );
}
