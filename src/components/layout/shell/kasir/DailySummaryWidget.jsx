import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../../../api/order';
import { fmt } from '../../../../utils/api';
import { ShoppingBagIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function DailySummaryWidget() {
  const { data: summary, error } = useQuery({
    queryKey: ['staff-order-summary'],
    queryFn: () => orderApi.getStaffOrderSummary().then(r => r.data.data),
    refetchInterval: 10000,
    retry: 1,
  });

  if (error) return null;
  if (!summary) return <div className="h-24 bg-gray-50 animate-pulse mx-6 mt-5 rounded-[20px]" />;

  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-5 bg-gray-50/50 border-b border-gray-100">
      <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 group">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <ShoppingBagIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Total Pesanan</p>
          <p className="text-xl font-black text-gray-900 leading-none">{summary.total_orders}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 group">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <BanknotesIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Pendapatan</p>
          <p className="text-xl font-black text-gray-900 leading-none">{fmt(summary.total_revenue)}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 group">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
          <ClockIcon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Tertunda</p>
          <p className="text-xl font-black text-gray-900 leading-none">{summary.pending_count}</p>
        </div>
      </div>
    </div>
  );
}
