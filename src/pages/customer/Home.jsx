import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { tenantApi } from '../../api/tenant';
import TenantCard from '../../components/shared/TenantCard';
import { SkeletonCard, SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const FILTERS = [
  { label: 'Semua', value: '' },
  { label: 'Buka',  value: '1' },
  { label: 'Tutup', value: '0' },
];

export default function Home() {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('');
  const [query,  setQuery]    = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants', { search: query, is_open: filter }],
    queryFn: () =>
      tenantApi.getTenants({ search: query, is_open: filter || undefined }).then((r) => r.data.data.data),
    refetchInterval: 60000, // Sync status kantin tiap 1 menit
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <div className="px-4 pt-4 pb-4 space-y-5">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#2D6A4F] to-[#3a8a64] rounded-2xl p-5 text-white">
        <p className="text-xs font-medium opacity-80 mb-1">Makan siang hari ini?</p>
        <p className="text-lg font-bold leading-tight">Pesan dari kantin favoritmu 🍱</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          placeholder="Cari kantin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
        />
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f.value
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#2D6A4F]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tenant Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon="⚠️" title="Gagal memuat data" description="Periksa koneksi internet Anda" />
      ) : !data?.length ? (
        <EmptyState icon="🍽️" title="Kantin tidak ditemukan" description="Coba kata kunci lain" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {data.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
