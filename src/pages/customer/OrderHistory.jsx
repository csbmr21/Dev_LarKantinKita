import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order';
import OrderCard from '../../components/shared/OrderCard';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { CUSTOMER_FILTER_TABS } from '../../utils/orderStatus';

export default function OrderHistory() {
  const [status, setStatus]  = useState('');
  const [page,   setPage]    = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', { status, page }],
    queryFn: () => orderApi.getOrders({ status: status || undefined, page }).then((r) => r.data),
    staleTime: 30_000,
  });

  const result     = data?.data;
  const orders     = result?.data ?? [];
  const totalPages = result?.last_page ?? 1;
  const meta       = result ?? {};

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <h1 className="text-lg font-bold text-gray-800">Riwayat Pesanan</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CUSTOMER_FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              status === tab.value
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <SkeletonList count={4} />
      ) : isError ? (
        <EmptyState icon="⚠️" title="Gagal memuat pesanan" description="Coba lagi beberapa saat" />
      ) : orders.length === 0 ? (
        <EmptyState icon="📦" title="Belum ada pesanan" description="Pesan makanan favoritmu sekarang!" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} showTenant />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={meta.total}
          perPage={meta.per_page}
        />
      )}
    </div>
  );
}
