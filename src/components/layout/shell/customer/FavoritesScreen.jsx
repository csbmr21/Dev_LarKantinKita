import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteApi } from '../../../../api/favorite';
import { cartApi } from '../../../../api/cart';
import { unwrap, fmt, tenantName } from '../../../../utils/api';
import { MenuFallbackIcon } from './MenuFallbackIcon';
import toast from 'react-hot-toast';
import {
  ChevronLeftIcon,
  HeartIcon as HeartIconOutline,
  PlusIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function FavoritesScreen({ onBack, onNavigate }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all'); // 'all' | 'liked' | 'frequent'

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['customer-favorites'],
    queryFn: () => favoriteApi.getFavorites().then(unwrap).catch(() => []),
  });

  const { mutate: toggleFav } = useMutation({
    mutationFn: (menuId) => favoriteApi.toggleFavorite(menuId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-favorites'] });
      qc.invalidateQueries({ queryKey: ['customer-favorite-ids'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Gagal mengubah favorit'),
  });

  const { mutate: addToCart } = useMutation({
    mutationFn: (menuId) => cartApi.addItem(menuId, 1),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-cart'] });
      toast.success('Ditambahkan ke keranjang!');
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Gagal menambah'),
  });

  const filteredMenus = menus.filter(m => {
    if (filter === 'liked') return m.is_liked;
    if (filter === 'frequent') return m.is_frequent;
    return true;
  });

  const likedCount = menus.filter(m => m.is_liked).length;
  const frequentCount = menus.filter(m => m.is_frequent).length;

  return (
    <div className="kk-screen-container">
      <div className="app-scroll">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-black text-gray-900">Menu Favorit</h1>
            <p className="text-[10px] text-gray-400 font-medium">{menus.length} menu</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="kk-pill-tabs px-4 pt-4">
          <button className={`kk-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Semua ({menus.length})
          </button>
          <button className={`kk-pill ${filter === 'liked' ? 'active' : ''}`} onClick={() => setFilter('liked')}>
            <HeartIconSolid className="w-3 h-3 text-red-500" /> Disukai ({likedCount})
          </button>
          <button className={`kk-pill ${filter === 'frequent' ? 'active' : ''}`} onClick={() => setFilter('frequent')}>
            <FireIcon className="w-3 h-3 text-orange-500" /> Sering Dipesan ({frequentCount})
          </button>
        </div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="kk-product-grid px-4 mt-4">
            {[1,2,3,4].map(i => <div key={i} className="kkPulse h-40 bg-gray-100 rounded-2xl" />)}
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="kk-empty-state mt-16">
            <HeartIconOutline className="kk-empty-icon w-16 h-16 text-gray-200" />
            <p className="kk-empty-title">
              {filter === 'all' ? 'Belum ada menu favorit' : filter === 'liked' ? 'Belum ada menu yang disukai' : 'Belum ada menu yang sering dipesan'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {filter === 'all'
                ? 'Ketuk ikon hati pada menu untuk menambahkannya ke favorit'
                : filter === 'liked'
                ? 'Kunjungi halaman menu dan ketuk ikon hati'
                : 'Mulai pesan menu favoritmu!'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                Lihat Semua Favorit
              </button>
            )}
          </div>
        ) : (
          <div className="kk-product-grid px-4 mt-4">
            {filteredMenus.map(m => (
              <div key={m.id} className="kk-product-card">
                <div className="kk-product-image">
                  {m.photo_url
                    ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" onError={e => { e.target.onerror=null; e.target.style.display='none'; }} />
                    : <MenuFallbackIcon />
                  }
                  {/* Favorite Badge */}
                  {m.is_liked && (
                    <span className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                      <HeartIconSolid className="w-4 h-4 text-red-500" />
                    </span>
                  )}
                  {m.is_frequent && !m.is_liked && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-orange-500/90 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-sm">
                      <FireIcon className="w-3 h-3 text-white" />
                      <span className="text-[8px] font-black text-white uppercase">Populer</span>
                    </span>
                  )}
                  {!m.is_available && <span className="kk-badge kk-badge-error kk-product-badge">Habis</span>}
                </div>
                <div className="kk-product-body">
                  <h3 className="kk-product-title">{m.name}</h3>
                  <p className="kk-product-canteen">{m.tenant ? tenantName(m.tenant) : m.category?.name ?? 'Menu'}</p>
                  <div className="kk-product-footer">
                    <span className="kk-product-price">{fmt(m.price)}</span>
                    <div className="flex items-center gap-1.5">
                      {/* Heart Toggle */}
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-red-50 transition-colors"
                        onClick={(e) => { e.stopPropagation(); toggleFav(m.id); }}
                      >
                        {m.is_liked
                          ? <HeartIconSolid className="w-4 h-4 text-red-500" />
                          : <HeartIconOutline className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                      {/* Add to Cart */}
                      <button
                        className={`kk-product-add-btn ${!m.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!m.is_available}
                        onClick={(e) => { e.stopPropagation(); if (m.is_available) addToCart(m.id); }}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="h-48" />
      </div>
    </div>
  );
}
