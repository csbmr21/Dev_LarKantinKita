import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { ArrowUturnLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ImpersonationBanner() {
  const { isImpersonating, user, originalUser, stopImpersonating } = useAuthStore();
  const navigate = useNavigate();

  if (!isImpersonating) return null;

  const handleStop = () => {
    stopImpersonating();
    toast.success('Kembali ke akun administrator');
    window.location.href = '/admin/users';
  };

  return (
    <div className="bg-orange-600 text-white px-4 py-2.5 flex items-center justify-center gap-4 sticky top-0 z-[60] shadow-lg animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <ExclamationTriangleIcon className="w-5 h-5 text-orange-200 animate-pulse" />
        <p className="text-sm font-medium">
          Anda sedang menyamar sebagai <span className="font-bold underline">{user?.full_name}</span> ({user?.role})
        </p>
      </div>
      
      <div className="h-4 w-px bg-orange-500/50 hidden sm:block" />

      <button
        onClick={handleStop}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-xs font-bold transition-all border border-white/20 whitespace-nowrap"
      >
        <ArrowUturnLeftIcon className="w-3 h-3" />
        Berhenti Menyamar
      </button>
    </div>
  );
}
