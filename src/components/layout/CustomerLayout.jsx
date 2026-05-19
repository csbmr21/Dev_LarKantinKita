import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  ShoppingCartIcon as CartSolid,
  ClipboardDocumentListIcon as OrderSolid,
  UserCircleIcon as UserSolid,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import ImpersonationBanner from '../shared/ImpersonationBanner';

const NAV_ITEMS = [
  { path: '/',        label: 'Beranda', Icon: HomeIcon,                 ActiveIcon: HomeSolid                 },
  { path: '/cart',    label: 'Keranjang', Icon: ShoppingCartIcon,       ActiveIcon: CartSolid, badge: true    },
  { path: '/orders',  label: 'Pesanan', Icon: ClipboardDocumentListIcon, ActiveIcon: OrderSolid               },
  { path: '/profile', label: 'Profil',  Icon: UserCircleIcon,           ActiveIcon: UserSolid                 },
];

export default function CustomerLayout() {
  const { user } = useAuthStore();
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ImpersonationBanner />
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🍽️</span>
            <span className="font-bold text-[#2D6A4F] text-base">KantinKita</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Hei, {user?.full_name?.split(' ')[0] ?? 'Pelanggan'} 👋
          </p>
        </div>
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <BellIcon className="w-5 h-5 text-gray-500" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 max-w-screen-sm mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex safe-area-inset-bottom">
        <div className="max-w-screen-sm mx-auto w-full flex">
          {NAV_ITEMS.map(({ path, label, Icon, ActiveIcon, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors',
                  isActive ? 'text-[#2D6A4F]' : 'text-gray-400'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive ? (
                      <ActiveIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                    {badge && totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#F4845F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </div>
                  <span className={clsx('text-[10px] font-medium', isActive && 'font-semibold')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
