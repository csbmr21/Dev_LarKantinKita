import React, { useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../../../api/order';
import { fmt } from '../../../../utils/api';
import { STATUS_COLS, NEXT_STATUS } from './constants';
import OrderDetailModal from './OrderDetailModal';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, ShoppingBagIcon, ChevronRightIcon,
  ArrowPathIcon, Squares2X2Icon, ListBulletIcon,
} from '@heroicons/react/24/outline';

export default function OrdersKanban({ orders = [] }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('kanban');
  const [selected, setSelected] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);

  const { mutate: updateStatus, variables: pendingVars } = useMutation({
    mutationFn: ({ id, status, data }) => orderApi.updateOrderStatus(id, status, data),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['staff-orders'] });
      const previousOrders = qc.getQueryData(['staff-orders']);
      qc.setQueryData(['staff-orders'], (old) => (old || []).map(o => o.id === id ? { ...o, status } : o));
      return { previousOrders };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
      qc.invalidateQueries({ queryKey: ['staff-order-summary'] });
      toast.success('Status berhasil diperbarui');
      setSelected(null);
    },
    onError: (err, variables, context) => {
      qc.setQueryData(['staff-orders'], context.previousOrders);
      toast.error(err?.response?.data?.message || 'Gagal update status.');
    },
  });

  const { mutate: bulkUpdate, isLoading: bulkLoading } = useMutation({
    mutationFn: ({ ids, status }) => orderApi.bulkUpdateOrderStatus(ids, status),
    onMutate: async ({ ids, status }) => {
      await qc.cancelQueries({ queryKey: ['staff-orders'] });
      const previousOrders = qc.getQueryData(['staff-orders']);
      qc.setQueryData(['staff-orders'], (old) => (old || []).map(o => ids.includes(o.id) ? { ...o, status } : o));
      return { previousOrders };
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
      qc.invalidateQueries({ queryKey: ['staff-order-summary'] });
      toast.success(`${variables.ids.length} pesanan diperbarui`);
      setCheckedIds([]);
    },
    onError: (err, variables, context) => {
      qc.setQueryData(['staff-orders'], context.previousOrders);
      toast.error(err?.response?.data?.message || 'Gagal update status massal.');
    },
  });

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const s = search.toLowerCase();
    return orders.filter(o => (o.order_number?.toLowerCase().includes(s)) || (o.user?.full_name?.toLowerCase().includes(s)));
  }, [orders, search]);

  const toggleCheck = useCallback((id) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-fadeIn">
      {/* Search & Bulk Actions Bar */}
      <div className="px-8 py-5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-5 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1 min-w-[320px]">
          <div className="relative flex-1 max-w-sm group">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#40916C] transition-colors" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari Order # atau Nama..." className="w-full h-11 pl-12 pr-5 bg-gray-50 border-1.5 border-gray-100 rounded-2xl text-[12px] font-bold focus:bg-white focus:ring-4 focus:ring-[#40916C]/5 focus:border-[#40916C] outline-none transition-all" />
          </div>
          <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white shadow-md text-[#2D6A4F]' : 'text-gray-400 hover:text-gray-600'}`}><Squares2X2Icon className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-[#2D6A4F]' : 'text-gray-400 hover:text-gray-600'}`}><ListBulletIcon className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {checkedIds.length > 0 && (
            <div className="flex items-center gap-3 pr-5 mr-5 border-r border-gray-200 animate-slideIn">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{checkedIds.length} Terpilih</span>
              <button disabled={bulkLoading} onClick={() => bulkUpdate({ ids: checkedIds, status: 'processing' })} className="px-5 h-9 bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">Proses Semua</button>
              <button disabled={bulkLoading} onClick={() => bulkUpdate({ ids: checkedIds, status: 'completed' })} className="px-5 h-9 bg-white border-2 border-[#2D6A4F] text-[#2D6A4F] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 active:scale-95 transition-all">Selesai Semua</button>
            </div>
          )}
          <span className="flex items-center gap-2.5 px-4 py-2 bg-[#F0FBF3] rounded-full text-[10px] font-black text-[#059669] uppercase tracking-[0.15em] border border-[#D8F3DC]"><div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Live Monitoring</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'kanban' ? (
          <div className="flex h-full p-8 gap-8 overflow-x-auto custom-scrollbar">
            {STATUS_COLS.map(col => {
              const colOrders = filteredOrders.filter(o => o.status === col.key);
              return (
                <div key={col.key} className="flex-1 min-w-[340px] flex flex-col bg-gray-100/30 rounded-[32px] border border-gray-100/50 p-4">
                  <div className="flex items-center justify-between mb-6 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white/50" style={{ background: col.bg, color: col.color }}>{col.icon}</div>
                      <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">{col.label}</span>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full text-[11px] font-black shadow-sm border border-white/50 bg-white text-gray-500">{colOrders.length}</span>
                  </div>
                  <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1.5">
                    {colOrders.length === 0 && <div className="py-24 text-center opacity-10 grayscale"><ShoppingBagIcon className="w-16 h-16 mx-auto mb-4" /><p className="text-[11px] font-black uppercase tracking-[0.2em]">Tidak Ada Antrean</p></div>}
                    {colOrders.map(order => {
                      const nextStatus = order.status === 'pending_payment'
                        ? (order.payment_method !== 'midtrans' ? 'paid' : null)
                        : NEXT_STATUS[order.status];
                      const isUpdating = pendingVars?.id === order.id;
                      const isChecked = checkedIds.includes(order.id);
                      return (
                        <div key={order.id} className={`bg-white p-5 rounded-[24px] border-2 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-gray-300/40 hover:-translate-y-1 ${isChecked ? 'border-[#52B788] bg-[#F0FBF3]/30 shadow-xl shadow-emerald-900/5' : 'border-white shadow-sm'}`} onClick={() => setSelected(order)}>
                          <div className="flex justify-between items-start mb-3.5">
                            <div><p className="text-[10px] font-mono font-bold text-gray-300 mb-1 tracking-tighter">{order.order_number}</p><p className="text-[13px] font-black text-[#081C0F] tracking-tight">{order.user?.full_name ?? 'Walk-in'}</p></div>
                            <input type="checkbox" checked={isChecked} onChange={(e) => { e.stopPropagation(); toggleCheck(order.id); }} className="w-5 h-5 accent-[#40916C] rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 checked:opacity-100 transition-all border-2 border-gray-100" />
                          </div>
                          <div className="text-[11px] font-bold text-gray-500 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100/50 leading-relaxed line-clamp-2">{order.items?.map(i => `${i.menu_name} ×${i.quantity}`).join(', ')}</div>
                          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <span className="text-[14px] font-black text-[#2D6A4F]">{fmt(order.grand_total)}</span>
                            <div className="flex gap-2">
                              {nextStatus && (
                                <button onClick={(e) => { e.stopPropagation(); updateStatus({ id: order.id, status: nextStatus }); }} disabled={isUpdating}
                                  className="h-10 px-4 rounded-[14px] bg-[#F0FBF3] text-[#2D6A4F] text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-[#2D6A4F] hover:text-white transition-all active:scale-90 shadow-sm border border-[#B7E4C7]/50">
                                  {isUpdating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : (nextStatus === 'paid' ? 'Diterima' : 'Lanjutkan')}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 overflow-y-auto h-full custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead><tr className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]"><th className="px-8 py-3">No. Antrean</th><th className="px-8 py-3">Nama Pelanggan</th><th className="px-8 py-3">Menu Dipesan</th><th className="px-8 py-3">Status</th><th className="px-8 py-3 text-right">Total Tagihan</th><th className="px-8 py-3 text-center">Aksi</th></tr></thead>
              <tbody>{filteredOrders.map(order => (
                <tr key={order.id} className="bg-white hover:bg-[#F0FBF3]/30 transition-all group shadow-sm">
                  <td className="px-8 py-5 rounded-l-[24px] border-y border-l border-gray-100 font-mono text-xs font-bold text-gray-400">{order.order_number}</td>
                  <td className="px-8 py-5 border-y border-gray-100 text-[13px] font-black text-[#081C0F]">{order.user?.full_name ?? 'Walk-in'}</td>
                  <td className="px-8 py-5 border-y border-gray-100 text-[12px] font-bold text-gray-500 max-w-xs truncate">{order.items?.map(i => `${i.menu_name} x${i.quantity}`).join(', ')}</td>
                  <td className="px-8 py-5 border-y border-gray-100"><span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em]" style={{ background: STATUS_COLS.find(s => s.key === order.status)?.bg || 'rgba(156, 163, 175, 0.1)', color: STATUS_COLS.find(s => s.key === order.status)?.color || '#9CA3AF' }}>{STATUS_COLS.find(s => s.key === order.status)?.label || order.status}</span></td>
                  <td className="px-8 py-5 border-y border-gray-100 font-black text-[#2D6A4F] text-right text-[14px]">{fmt(order.grand_total)}</td>
                  <td className="px-8 py-5 rounded-r-[24px] border-y border-r border-gray-100 text-center"><button onClick={() => setSelected(order)} className="p-2.5 hover:bg-[#2D6A4F] hover:text-white text-[#2D6A4F] rounded-2xl transition-all active:scale-90 border border-gray-100 hover:border-[#2D6A4F] shadow-sm"><ChevronRightIcon className="w-5 h-5" /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      <OrderDetailModal order={selected} onClose={() => setSelected(null)} onUpdateStatus={(id, status, data) => updateStatus({ id, status, data })} />
    </div>
  );
}
