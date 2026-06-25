import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../../store/authStore';
import { orderApi } from '../../../../api/order';
import { unwrap } from '../../../../utils/api';
import toast from 'react-hot-toast';
import {
  ChevronRightIcon,
  HeartIcon as HeartIconOutline,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  LockClosedIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function ProfileScreen({ onLogout, onNavigate }) {
  const { user } = useAuthStore();

  const { data: orderData = [] } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => orderApi.getOrders().then(unwrap).catch(() => []),
  });
  const totalOrders = orderData.length;
  const doneOrders  = orderData.filter(o => o.status === 'completed').length;
  const avgRating   = user?.avg_rating ?? (doneOrders > 0 ? (orderData.filter(o => o.rating).reduce((sum, o) => sum + Number(o.rating), 0) / Math.max(orderData.filter(o => o.rating).length, 1)).toFixed(1) : '0');

  const PROFILE_SECTIONS = [
    {
      title: 'Akun Saya',
      items: [
        { icon: <UserCircleIcon className="w-5 h-5" />, bg: 'bg-emerald-50 text-emerald-600',  label: 'Edit Profil',     badge: null, action: () => onNavigate?.('edit-profile') },
        { icon: <ClipboardDocumentListIcon className="w-5 h-5" />, bg: 'bg-blue-50 text-blue-600',    label: 'Riwayat Pesanan', badge: totalOrders > 0 ? String(totalOrders) : null, action: () => onNavigate?.('orders') },
        { icon: <HeartIconOutline className="w-5 h-5" />, bg: 'bg-red-50 text-red-600',     label: 'Menu Favorit',    badge: null, action: () => onNavigate?.('favorites') },
      ],
    },
    {
      title: 'Pengaturan',
      items: [
        { icon: <BellIcon className="w-5 h-5" />, bg: 'bg-amber-50 text-amber-600',   label: 'Notifikasi',         badge: null, action: () => toast('Segera hadir!', { icon: '🔔' }) },
        { icon: <LockClosedIcon className="w-5 h-5" />, bg: 'bg-gray-100 text-gray-600', label: 'Keamanan & Privasi', badge: null, action: () => onNavigate?.('edit-profile') },
        { icon: <InformationCircleIcon className="w-5 h-5" />, bg: 'bg-gray-100 text-gray-600', label: 'Tentang Aplikasi',    badge: null, action: () => toast('KantinKita v1.0 — Kantin Digital', { icon: '📱' }) },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        { icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />, bg: 'bg-red-50 text-red-600', label: 'Keluar Aplikasi', danger: true, action: onLogout },
      ],
    },
  ];

  return (
    <div className="kk-screen-container bg-gray-50/50">
      <div className="app-scroll">
        {/* Profile Hero */}
        <div className="kk-profile-hero relative overflow-hidden pb-12">
          <div className="absolute top-0 left-0 w-full h-full bg-emerald-900/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="kk-profile-avatar mb-4 shadow-2xl shadow-emerald-900/40">
              {user?.photo_url || user?.photo
                ? <img src={user.photo_url || user.photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : <UserCircleIcon className="w-12 h-12 text-white/50" />}
            </div>
            <div className="kk-profile-name text-2xl">{user?.full_name ?? 'Pengguna'}</div>
            <div className="kk-profile-nim mt-1 text-emerald-100/60">{user?.email}</div>
            
            <div className="flex gap-8 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-white">{totalOrders}</span>
                <span className="text-[10px] font-bold text-emerald-100/50 uppercase tracking-widest">Pesanan</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-white">{doneOrders}</span>
                <span className="text-[10px] font-bold text-emerald-100/50 uppercase tracking-widest">Selesai</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-white">{avgRating}</span>
                <span className="text-[10px] font-bold text-emerald-100/50 uppercase tracking-widest">Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Menu */}
        <div className="relative z-20 -mt-6 mx-4 mb-10 bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden">
          {PROFILE_SECTIONS.map((section, si) => (
            <div key={si}>
              <div className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                {section.title}
              </div>
              <div className="divide-y divide-gray-50">
                {section.items.map((item, ii) => (
                  <button
                    key={ii}
                    className={`w-full px-6 py-4 flex items-center gap-4 transition-all duration-150 cursor-pointer hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98] ${item.danger ? 'hover:bg-red-50 active:bg-red-100' : ''}`}
                    onClick={item.action ?? undefined}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-150 group-active:scale-95 ${item.bg}`}>
                      {item.icon}
                    </div>
                    <span className={`flex-1 text-sm font-bold text-left ${item.danger ? 'text-red-600' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRightIcon className={`w-4 h-4 transition-transform duration-150 ${item.danger ? 'text-red-300' : 'text-gray-300'} group-hover:translate-x-0.5`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="h-48" />
      </div>
    </div>
  );
}
