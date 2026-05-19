import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { tenantApi } from '../../api/tenant';
import MenuCard from '../../components/shared/MenuCard';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';

const BANNER = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80';

export default function TenantDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const { data: tenant, isLoading: tLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantApi.getTenantDetail(id).then((r) => r.data.data?.data ?? r.data.data),
    refetchInterval: 30000, // Sync info kantin tiap 30 detik
  });

  const { data: menus = [], isLoading: mLoading } = useQuery({
    queryKey: ['tenant-menus', id],
    queryFn: () => tenantApi.getTenantMenus(id).then((r) => r.data.data?.data ?? r.data.data),
    enabled: !!id,
    refetchInterval: 30000, // Sync stok/harga menu tiap 30 detik
  });

  const categories = [...new Set(menus.map((m) => m.category?.name).filter(Boolean))];
  const filtered   = activeCategory
    ? menus.filter((m) => m.category?.name === activeCategory)
    : menus;

  const cartCount = getTotalItems();

  if (tLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="relative h-48">
        <img
          src={tenant?.photo_url || BANNER}
          alt={tenant?.tenant_name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => { e.target.src = BANNER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"
        >
          <ArrowLeftIcon className="w-4 h-4 text-gray-700" />
        </button>
        <Badge
          variant={Number(tenant?.is_open) === 1 ? 'success' : 'gray'}
          className="absolute top-4 right-4"
          dot
        >
          {Number(tenant?.is_open) === 1 ? 'Buka' : 'Tutup'}
        </Badge>
      </div>

      {/* Info */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800 mb-1">{tenant?.tenant_name}</h1>
        {tenant?.address && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            <MapPinIcon className="w-3.5 h-3.5" />{tenant.address}
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>Min. order: {formatCurrency(tenant?.min_order ?? 0)}</span>
          {tenant?.open_hours && (
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{tenant.open_hours?.open} – {tenant.open_hours?.close}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-white sticky top-[57px] z-10 border-b border-gray-100">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !activeCategory ? 'bg-[#2D6A4F] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat ? 'bg-[#2D6A4F] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Menus */}
      <div className="px-4 pt-4">
        {mLoading ? (
          <LoadingSpinner label="Memuat menu..." />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🍽️" title="Menu tidak tersedia" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                tenantId={tenant?.id}
                tenantName={tenant?.tenant_name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-screen-sm mx-auto z-20">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-[#2D6A4F] text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-lg hover:bg-[#245A41] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
              <span className="text-sm font-semibold">Lihat Keranjang</span>
            </div>
            <span className="text-sm font-bold">{formatCurrency(getTotalPrice())}</span>
          </button>
        </div>
      )}
    </div>
  );
}
