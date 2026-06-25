import React, { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { cartApi } from '../../../api/cart';
import toast from 'react-hot-toast';
import {
  ChevronLeftIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  MapPinIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

// Eager imports for critical screens
import HomeScreen from './customer/HomeScreen';
import CartScreen from './customer/CartScreen';
import OrdersScreen from './customer/OrdersScreen';

// Lazy imports for non-critical screens
const TrackingScreen    = React.lazy(() => import('./customer/TrackingScreen'));
const ProfileScreen     = React.lazy(() => import('./customer/ProfileScreen'));
const EditProfileScreen = React.lazy(() => import('./customer/EditProfileScreen'));
const FavoritesScreen   = React.lazy(() => import('./customer/FavoritesScreen'));

const ShellFallback = () => (
  <div className="kk-screen-container flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      <span className="text-xs font-semibold text-gray-400 tracking-wide">Memuat…</span>
    </div>
  </div>
);

const TABS = [
  { key: 'home',     icon: <BuildingStorefrontIcon    className="w-[22px] h-[22px]" />, label: 'Beranda'   },
  { key: 'orders',   icon: <ClipboardDocumentListIcon className="w-[22px] h-[22px]" />, label: 'Pesanan'   },
  { key: 'tracking', icon: <MapPinIcon                className="w-[22px] h-[22px]" />, label: 'Lacak'     },
  { key: 'cart',     icon: <ShoppingBagIcon           className="w-[22px] h-[22px]" />, label: 'Keranjang' },
  { key: 'profile',  icon: <UserCircleIcon            className="w-[22px] h-[22px]" />, label: 'Profil'    },
];

export default function CustomerView() {
  const [screen, setScreen]               = useState('home');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const { logout } = useAuthStore();

  const { data: cartData } = useQuery({
    queryKey: ['customer-cart'],
    queryFn: () => cartApi.getCart().then(r => r.data?.data ?? {}).catch(() => ({})),
    refetchInterval: 5000,
  });
  const totalItems = cartData?.item_count ?? 0;

  const navigate = (s) => {
    setScreen(s);
    if (s === 'home') setSelectedTenant(null);
  };

  const handleLogout = () => {
    toast.promise(logout(), {
      loading: 'Keluar…',
      success: 'Sampai jumpa!',
      error: 'Gagal keluar.',
    });
  };

  const isInTenantMenu = screen === 'home' && selectedTenant;

  return (
    <div className="kk-customer-shell">

      {/* ── App Header ── */}
      <header className="kk-mobile-header">
        {/* Left: Logo or back button */}
        <div className="flex items-center gap-3">
          {isInTenantMenu || screen !== 'home' ? (
            <button
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-emerald-50 flex items-center justify-center text-gray-700 transition-colors"
              onClick={() => {
                if (isInTenantMenu) setSelectedTenant(null);
                else if (screen === 'edit-profile') navigate('profile');
                else if (screen === 'favorites') navigate('profile');
                else navigate('home');
              }}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[11px] font-black tracking-tight">KK</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[14px] font-black text-gray-900">KantinKita</span>
                <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-widest mt-0.5">Kantin Digital</span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Desktop nav tabs */}
        {!isInTenantMenu && (
          <nav className="kk-customer-desktop-nav-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`kk-customer-desktop-nav-tab ${screen === tab.key ? 'active' : ''}`}
                onClick={() => navigate(tab.key)}
              >
                {tab.label}
                {tab.key === 'cart' && totalItems > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors relative"
            onClick={() => navigate('orders')}
            title="Pesanan saya"
          >
            <BellIcon className="w-4 h-4" />
          </button>
          {screen !== 'cart' && (
            <button
              className="w-9 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center text-white transition-colors relative"
              onClick={() => navigate('cart')}
              title="Keranjang"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white leading-none">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* ── Content Area ── */}
      <div className="kk-customer-desktop-layout">
        <div className="kk-customer-main-content">
          {screen === 'home'     && <HomeScreen onNavigate={navigate} selectedTenant={selectedTenant} setSelectedTenant={setSelectedTenant} />}
          {screen === 'cart'     && <CartScreen onNavigate={navigate} />}
          {screen === 'tracking' && <Suspense fallback={<ShellFallback />}><TrackingScreen /></Suspense>}
          {screen === 'orders'   && <OrdersScreen />}
          {screen === 'profile'        && <Suspense fallback={<ShellFallback />}><ProfileScreen onLogout={handleLogout} onNavigate={navigate} /></Suspense>}
          {screen === 'edit-profile'   && <Suspense fallback={<ShellFallback />}><EditProfileScreen onBack={() => navigate('profile')} /></Suspense>}
          {screen === 'favorites'      && <Suspense fallback={<ShellFallback />}><FavoritesScreen onBack={() => navigate('profile')} onNavigate={navigate} /></Suspense>}
        </div>

        {/* Desktop Sidebar Cart — shown on home page only */}
        {screen === 'home' && !selectedTenant && (
          <aside className="kk-customer-sidebar-cart">
            <div className="px-5 py-4 border-b border-gray-100 bg-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <ShoppingBagIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[13px] font-black text-gray-900">Keranjang</span>
              </div>
              {totalItems > 0 && (
                <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-black rounded-full">
                  {totalItems} item
                </span>
              )}
            </div>
            <CartScreen onNavigate={navigate} />
          </aside>
        )}
      </div>

      {/* ── Bottom Navigation (Mobile only) ── */}
      <nav className="kk-bottom-nav">
        {TABS.map(tab => {
          const isActive = screen === tab.key;
          return (
            <button
              key={tab.key}
              className={`app-nav-tab py-2 relative`}
              onClick={() => navigate(tab.key)}
            >
              {/* Active indicator pill background */}
              {isActive && (
                <span className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl bg-emerald-50 -z-0" />
              )}
              <div className={`app-nav-icon-wrap z-10 transition-all duration-200 ${isActive ? '-translate-y-0.5' : ''}`}>
                <span className={`transition-colors duration-200 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                {tab.key === 'cart' && totalItems > 0 && (
                  <span className="absolute -top-1 -right-0.5 bg-amber-400 text-amber-950 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border-[1.5px] border-white leading-none">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold tracking-wide z-10 transition-colors duration-200 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
