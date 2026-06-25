import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../../../../api/tenant';
import { cartApi } from '../../../../api/cart';
import { favoriteApi } from '../../../../api/favorite';
import { unwrap, fmt, tenantName } from '../../../../utils/api';
import { MenuFallbackIcon } from './MenuFallbackIcon';
import toast from 'react-hot-toast';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  StarIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  HeartIcon as HeartIconOutline,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

/* ============================================================
   HELPER: Generate gradient color from tenant name
   ============================================================ */
const GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-sky-600',
  'from-lime-500 to-green-600',
  'from-fuchsia-500 to-pink-500',
];

function tenantGradient(name) {
  const idx = (name ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

function TenantAvatar({ tenant, className = '', textClass = '' }) {
  const name = tenantName(tenant);
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className={`bg-gradient-to-br ${tenantGradient(name)} flex items-center justify-center ${className}`}>
      <span className={`font-black text-white ${textClass}`}>{initial}</span>
    </div>
  );
}


/* ============================================================
   MENU DETAIL SCREEN
   ============================================================ */
export function MenuDetailScreen({ menu, tenant, onBack, onAddedToCart }) {
  const [qty, setQty] = useState(1);
  const qc = useQueryClient();

  // Check if this menu is already liked
  const { data: favData } = useQuery({
    queryKey: ['customer-favorite-ids', menu.id],
    queryFn: () => favoriteApi.checkFavorites([menu.id]).then(unwrap).catch(() => ({ liked_ids: [] })),
  });
  const [isFav, setIsFav] = useState(null);
  const resolvedFav = isFav !== null ? isFav : (favData?.liked_ids?.includes(menu.id) ?? false);

  const { mutate: toggleFav } = useMutation({
    mutationFn: () => favoriteApi.toggleFavorite(menu.id),
    onSuccess: (res) => {
      const liked = res.data?.data?.is_liked ?? !resolvedFav;
      setIsFav(liked);
      qc.invalidateQueries({ queryKey: ['customer-favorite-ids'] });
      qc.invalidateQueries({ queryKey: ['customer-favorites'] });
      toast.success(liked ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
    },
    onError: () => toast.error('Gagal mengubah favorit'),
  });

  const { mutate: addToCart, isPending } = useMutation({
    mutationFn: () => cartApi.addItem(menu.id, qty),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-cart'] });
      toast.success(`${menu.name} ×${qty} ditambahkan ke keranjang!`);
      onAddedToCart?.();
      onBack();
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Gagal menambah ke keranjang'),
  });

  return (
    <div className="kk-screen-container">
      <div className="kk-mobile-header shadow-sm bg-white/80 backdrop-blur-md">
        <button onClick={onBack} className="kk-icon-btn bg-gray-50 hover:bg-emerald-50 text-gray-900 transition-colors">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Detail Menu</span>
        <button onClick={() => toggleFav()} className="kk-icon-btn bg-gray-50 hover:bg-red-50 text-gray-900 transition-colors">
          {resolvedFav ? <HeartIconSolid className="w-5 h-5 text-red-500" /> : <HeartIconOutline className="w-5 h-5" />}
        </button>
      </div>

      <div className="app-scroll">
        <div className="kk-detail-hero h-72">
          {menu.photo_url
            ? <img src={menu.photo_url} alt={menu.name} className="kk-detail-hero-img" loading="lazy"
                onError={e => { e.target.onerror = null; e.target.src = '/placeholder-menu.png'; e.target.className = 'kk-detail-hero-img opacity-20 grayscale'; }} />
            : <MenuFallbackIcon className="w-24 h-24 text-emerald-100" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="px-6 py-8">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl font-black text-gray-900 leading-tight flex-1">{menu.name}</h1>
            <div className="text-2xl font-black text-emerald-700">{fmt(menu.price)}</div>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg text-[10px] font-black text-emerald-700 uppercase tracking-wider">
              <BuildingStorefrontIcon className="w-3 h-3" />{tenantName(tenant)}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-wider">
              {menu.category?.name ?? 'Menu'}
            </div>
          </div>
          <div className="h-px bg-gray-100 w-full mb-6" />
          <p className="text-sm text-gray-500 leading-relaxed font-medium mb-8">
            {menu.description || 'Tidak ada deskripsi untuk menu ini. Rasakan kenikmatan sajian spesial dari kantin kami.'}
          </p>
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-xs font-medium text-blue-800 leading-relaxed">
              Pesanan kamu akan langsung diproses setelah pembayaran dikonfirmasi. Pastikan jumlah pesanan sudah benar.
            </p>
          </div>
        </div>
        <div className="h-48" />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] flex items-center gap-4">
        <div className="kk-qty-stepper !h-12 !rounded-2xl border-gray-100 bg-gray-50/50">
          <button className="kk-qty-btn !w-12 hover:bg-gray-100" onClick={() => setQty(q => Math.max(1, q - 1))}>
            <MinusIcon className="w-4 h-4" />
          </button>
          <div className="kk-qty-val !w-12 !border-none bg-transparent text-lg font-black">{qty}</div>
          <button className="kk-qty-btn !w-12 hover:bg-gray-100" onClick={() => setQty(q => q + 1)}>
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <button className="kk-detail-add-btn !h-12 !rounded-2xl shadow-lg shadow-emerald-700/20 transition-all active:scale-95"
          onClick={() => addToCart()} disabled={isPending}>
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <ArrowPathIcon className="w-4 h-4 animate-spin" /><span>Menambahkan…</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ShoppingBagIcon className="w-5 h-5" /><span>Tambah · {fmt(menu.price * qty)}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}


/* ============================================================
   TENANT MENU SCREEN
   ============================================================ */
export function TenantMenuScreen({ tenant, onBack }) {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(null);
  const qc = useQueryClient();

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['tenant-menus', tenant.id, query, activeCategory],
    queryFn: () => tenantApi.getTenantMenus(tenant.id, { search: query || undefined, category_id: activeCategory || undefined }).then(unwrap).catch(() => []),
  });

  // Batch check which menus are liked
  const menuIds = menus.map(m => m.id);
  const { data: favCheck } = useQuery({
    queryKey: ['tenant-fav-ids', tenant.id, menuIds.join(',')],
    queryFn: () => favoriteApi.checkFavorites(menuIds).then(unwrap).catch(() => ({ liked_ids: [] })),
    enabled: menuIds.length > 0,
  });
  const likedIds = new Set(favCheck?.liked_ids ?? []);

  const { data: cartData } = useQuery({
    queryKey: ['customer-cart'],
    queryFn: () => cartApi.getCart().then(r => r.data?.data ?? {}).catch(() => ({})),
    refetchInterval: 5000,
  });
  const cartItems = cartData?.items ?? [];

  const { mutate: addToCartQuick } = useMutation({
    mutationFn: (menuId) => cartApi.addItem(menuId, 1),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-cart'] }),
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Gagal menambah'),
  });

  const { mutate: toggleFavQuick } = useMutation({
    mutationFn: (menuId) => favoriteApi.toggleFavorite(menuId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-fav-ids'] });
      qc.invalidateQueries({ queryKey: ['customer-favorites'] });
    },
    onError: () => toast.error('Gagal mengubah favorit'),
  });

  const categories = [
    { id: '', name: 'Semua' },
    ...Object.values(menus.reduce((acc, m) => { if (m.category?.id && !acc[m.category.id]) acc[m.category.id] = m.category; return acc; }, {})),
  ];

  if (selectedMenu) {
    return <MenuDetailScreen menu={selectedMenu} tenant={tenant} onBack={() => setSelectedMenu(null)} onAddedToCart={() => qc.invalidateQueries({ queryKey: ['customer-cart'] })} />;
  }

  return (
    <div className="kk-screen-container">
      <div className="kk-tenant-hero">
        <button className="kk-tenant-back-btn" onClick={onBack}><ChevronLeftIcon className="w-5 h-5" /></button>
        <div className="kk-tenant-icon">
          {tenant.photo_url
            ? <img src={tenant.photo_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            : <TenantAvatar tenant={tenant} className="w-full h-full rounded-xl" textClass="text-lg" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-extrabold text-gray-900 leading-tight">{tenantName(tenant)}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500"><StarIcon className="w-3 h-3 fill-amber-500" /> 4.5</div>
            <span className="text-[10px] text-gray-300">•</span>
            <span className={`text-[11px] font-bold ${tenant.is_open ? 'text-emerald-600' : 'text-red-500'}`}>{tenant.is_open ? 'Buka Sekarang' : 'Sedang Tutup'}</span>
          </div>
        </div>
      </div>

      <div className="kk-search-section">
        <form onSubmit={e => { e.preventDefault(); setQuery(search); }} className="relative">
          <MagnifyingGlassIcon className="kk-search-icon w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari menu di kantin ini..." className="kk-search-input" />
          <button type="submit" className="kk-search-filter-btn"><ChevronRightIcon className="w-4 h-4" /></button>
        </form>
      </div>

      {categories.length > 1 && (
        <div className="kk-pill-tabs">
          {categories.map(cat => (
            <button key={cat.id} className={`kk-pill ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>{cat.name}</button>
          ))}
        </div>
      )}

      <div className="app-scroll">
        {isLoading ? (
          <div className="kk-product-grid">{[1,2,3,4].map(i => <div key={i} className="kkPulse h-40 bg-gray-100 rounded-2xl" />)}</div>
        ) : menus.length === 0 ? (
          <div className="kk-empty-state"><ShoppingBagIcon className="kk-empty-icon w-12 h-12 text-gray-300" /><p className="kk-empty-title">Menu tidak ditemukan</p></div>
        ) : (
          <div className="kk-product-grid">
            {menus.map(m => {
              const cartItem = cartItems.find(ci => ci.menu_id === m.id);
              const qty = cartItem?.quantity ?? 0;
              const outOfStock = !m.is_available;
              return (
                <div key={m.id} className={`kk-product-card ${outOfStock ? 'kk-product-card-disabled' : ''}`} onClick={() => !outOfStock && setSelectedMenu(m)}>
                  <div className="kk-product-image">
                    {m.photo_url ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" onError={e => { e.target.onerror=null; e.target.style.display='none'; }} /> : <MenuFallbackIcon />}
                    {outOfStock && <span className="kk-badge kk-badge-error kk-product-badge">Habis</span>}
                    {/* Heart toggle overlay */}
                    <button
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
                      onClick={(e) => { e.stopPropagation(); toggleFavQuick(m.id); }}
                    >
                      {likedIds.has(m.id)
                        ? <HeartIconSolid className="w-4 h-4 text-red-500" />
                        : <HeartIconOutline className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                  </div>
                  <div className="kk-product-body">
                    <h3 className="kk-product-title">{m.name}</h3>
                    <p className="kk-product-canteen">{m.category?.name ?? 'Menu'}</p>
                    <div className="kk-product-footer">
                      <span className="kk-product-price">{fmt(m.price)}</span>
                      <button className={`kk-product-add-btn ${qty > 0 ? 'kk-product-add-btn-active' : ''}`} disabled={outOfStock}
                        onClick={e => { e.stopPropagation(); if (!outOfStock) addToCartQuick(m.id); }}>
                        {qty > 0 ? qty : <PlusIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-48" />
      </div>
    </div>
  );
}


/* ============================================================
   HOME SCREEN
   ============================================================ */
export default function HomeScreen({ onNavigate, selectedTenant, setSelectedTenant }) {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');

  const { data: rawTenants = [], isLoading } = useQuery({
    queryKey: ['tenants', { search: query }],
    queryFn: () => tenantApi.getTenants({ search: query }).then(unwrap).catch(() => []),
    refetchInterval: 5000,
  });

  const tenants = useMemo(() => {
    let list = [...rawTenants];
    if (filter === '1') list = list.filter(t => t.is_open);
    if (filter === '0') list = list.filter(t => !t.is_open);
    return list.sort((a, b) => { if (a.is_open === b.is_open) return b.id - a.id; return a.is_open ? -1 : 1; });
  }, [rawTenants, filter]);

  const { data: cartData } = useQuery({
    queryKey: ['customer-cart'],
    queryFn: () => cartApi.getCart().then(r => r.data?.data ?? {}).catch(() => ({})),
    refetchInterval: 5000,
  });
  const cartItemCount = cartData?.item_count ?? 0;
  const cartTotal = cartData?.total ?? 0;

  if (selectedTenant) {
    return <TenantMenuScreen tenant={selectedTenant} onBack={() => setSelectedTenant(null)} />;
  }

  return (
    <div className="kk-screen-container">
      <div className="app-scroll">
        <div className="kk-home-banner">
          {tenants[0] && (
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none overflow-hidden rounded-full">
              {tenants[0].photo_url
                ? <img src={tenants[0].photo_url} alt="" className="w-full h-full object-cover" />
                : <TenantAvatar tenant={tenants[0]} className="w-full h-full" textClass="text-5xl" />
              }
            </div>
          )}
          <div className="kk-home-banner-tag">Rekomendasi Hari Ini</div>
          <div className="kk-home-banner-title">{tenants[0] ? `Makan di ${tenantName(tenants[0])}` : 'Pesan dari kantin favoritmu'}</div>
          <div className="kk-home-banner-sub">Pilihan lengkap · Bayar mudah · Cepat saji</div>
          <button className="kk-home-banner-btn flex items-center gap-1" onClick={() => tenants[0] && setSelectedTenant(tenants[0])}>
            Pesan Sekarang <ChevronRightIcon className="w-3 h-3" />
          </button>
        </div>

        <div className="kk-search-section">
          <form onSubmit={e => { e.preventDefault(); setQuery(search); }} className="relative">
            <MagnifyingGlassIcon className="kk-search-icon w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kantin atau menu..." className="kk-search-input" />
            <button type="submit" className="kk-search-filter-btn"><ChevronRightIcon className="w-4 h-4" /></button>
          </form>
        </div>

        <div className="kk-pill-tabs">
          {[['', 'Semua'], ['1', <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" /> Buka</div>], ['0', <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" /> Tutup</div>]].map(([v, l]) => (
            <button key={v} className={`kk-pill ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        <div className="kk-home-section-title flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5">
            <BuildingStorefrontIcon className="w-4 h-4 text-emerald-600" />
            <span className="font-black text-gray-900 uppercase tracking-tight text-xs">Kantin Populer</span>
          </div>
        </div>

        {isLoading ? (
          <div className="kk-canteen-row">{[1,2,3].map(i => <div key={i} className="kkPulse w-32 h-40 bg-gray-50 rounded-2xl flex-shrink-0" />)}</div>
        ) : tenants.length > 0 ? (
          <div className="kk-canteen-row pb-6">
            {tenants.slice(0, 8).map(t => (
              <div key={t.id} className="kk-canteen-card-featured" onClick={() => setSelectedTenant(t)}>
                <div className="kk-canteen-featured-img">
                  {t.photo_url
                    ? <img src={t.photo_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                    : <TenantAvatar tenant={t} className="w-full h-full" textClass="text-3xl" />
                  }
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full border border-white ${t.is_open ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                </div>
                <div className="p-3">
                  <div className="font-black text-gray-900 text-xs truncate">{tenantName(t)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <StarIcon className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span className="text-[10px] font-bold text-gray-500">4.5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="kk-home-section-title flex items-center gap-1.5 px-4 mt-2">
          <ShoppingBagIcon className="w-4 h-4 text-emerald-600" />
          <span className="font-black text-gray-900 uppercase tracking-tight text-xs">Jelajahi Semua Kantin</span>
        </div>

        {isLoading ? (
          <div className="space-y-3 px-4">{[1,2,3].map(i => <div key={i} className="kkPulse h-24 bg-gray-50 rounded-2xl" />)}</div>
        ) : tenants.length === 0 ? (
          <div className="kk-empty-state">
            <BuildingStorefrontIcon className="kk-empty-icon w-12 h-12 text-gray-300" />
            <p className="kk-empty-title">Kantin tidak ditemukan</p>
            <p className="text-xs text-gray-400">Coba ubah filter pencarian</p>
          </div>
        ) : (
          <div className="kk-tenant-list space-y-3 px-4">
            {tenants.map(t => (
              <div key={t.id} className="kk-tenant-list-item group" onClick={() => setSelectedTenant(t)}>
                <div className="kk-tenant-list-thumb">
                  {t.photo_url
                    ? <img src={t.photo_url} alt="" className="w-full h-full object-cover transition-transform group-active:scale-110" onError={e => { e.target.onerror=null; e.target.style.display='none'; }} />
                    : <TenantAvatar tenant={t} className="w-full h-full" textClass="text-xl" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 text-sm truncate">{tenantName(t)}</h3>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 rounded-md"><StarIcon className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /><span className="text-[10px] font-bold text-gray-600">4.8</span></div>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{t.description || 'Kantin pilihan dengan menu lezat'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${t.is_open ? 'bg-emerald-500' : 'bg-gray-300'}`} /><span className={`text-[10px] font-black uppercase tracking-tight ${t.is_open ? 'text-emerald-600' : 'text-gray-400'}`}>{t.is_open ? 'Buka' : 'Tutup'}</span></div>
                    <span className="text-[10px] text-gray-300 font-bold">•</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Cepat Saji</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors"><ChevronRightIcon className="w-4 h-4" /></div>
              </div>
            ))}
          </div>
        )}
        <div className="h-48" />
      </div>

      {cartItemCount > 0 && (
        <div className="absolute bottom-20 left-0 right-0 px-4 pointer-events-none z-50">
          <div className="kk-cart-bar pointer-events-auto shadow-2xl shadow-emerald-900/40 border border-white/10" onClick={() => onNavigate('cart')}>
            <div className="kk-cart-bar-count">{cartItemCount}</div>
            <div className="kk-cart-bar-label">Lihat Keranjang</div>
            <div className="kk-cart-bar-total">{fmt(cartTotal)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
