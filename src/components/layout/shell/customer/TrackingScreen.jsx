import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../../../api/order';
import { unwrap, fmt } from '../../../../utils/api';
import { getStatusIcon } from '../../../../utils/orderStatus';
import { STATUS_COLOR, TRACKING_STEPS, TRACKING_STEP_I } from './constants';
import {
  MapPinIcon, CreditCardIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function TrackingScreen() {
  const { data: rawOrders = [] } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => orderApi.getOrders().then(unwrap).catch(() => []),
    refetchInterval: 5000,
  });

  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const activeOrder = orders.find(o => !['completed', 'cancelled', 'expired', 'refunded'].includes(o.status));

  if (!activeOrder) return (
    <div className="kk-screen-container">
      <div className="kk-empty-state">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6"><MapPinIcon className="w-10 h-10 text-emerald-500" /></div>
        <p className="kk-empty-title">Tidak ada pesanan aktif</p>
        <p className="text-sm text-gray-400 max-w-[240px] mb-8">Pesanan yang sedang diproses akan muncul di sini untuk kamu pantau.</p>
        <button className="kk-btn kk-btn-primary px-10" onClick={() => window.location.href = '/'}>Pesan Sekarang</button>
      </div>
    </div>
  );

  const step = TRACKING_STEP_I[activeOrder.status] ?? 0;
  const statusLabel = STATUS_COLOR[activeOrder.status]?.label ?? 'Memproses…';
  const StatusIcon = getStatusIcon(activeOrder.status);

  return (
    <div className="kk-screen-container bg-gray-50/50">
      <div className="app-scroll">
        <div className="kk-tracking-banner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="kk-tracking-icon-wrap bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl mb-4">
              {typeof StatusIcon === 'string' ? StatusIcon : <StatusIcon className="w-8 h-8" />}
            </div>
            <div className="kk-tracking-status-text text-xl font-black">{statusLabel}</div>
            <div className="kk-tracking-eta mt-1 text-emerald-100/80 font-medium">
              {activeOrder.status === 'processing' ? 'Pesananmu sedang disiapkan' : 'Selesaikan pembayaranmu'}
            </div>
            <div className="kk-tracking-id mt-4 px-4 py-1.5 bg-black/20 rounded-full text-[10px] font-bold tracking-widest text-white/90 uppercase border border-white/10">
              Order ID: {activeOrder.order_number ?? `#${activeOrder.id}`}
            </div>
          </div>
        </div>

        <div className="px-4 -mt-6 relative z-20">
          <div className="kk-card p-6 shadow-xl shadow-emerald-900/5">
            <div className="kk-steps-row justify-between">
              {TRACKING_STEPS.map((label, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-2 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
                      i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-emerald-700 text-white scale-110 shadow-lg shadow-emerald-700/30' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < step ? <CheckCircleIcon className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${i <= step ? 'text-emerald-800' : 'text-gray-300'}`}>{label.split(' ')[0]}</span>
                  </div>
                  {i < TRACKING_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                      <div className={`h-full bg-emerald-500 transition-all duration-700 ${i < step ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {activeOrder.status === 'pending_payment' && activeOrder.payment?.snap_token && (
          <div className="m-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><CreditCardIcon className="w-5 h-5 text-amber-600" /><p className="text-sm font-black text-amber-900">Selesaikan Pembayaran</p></div>
            <p className="text-xs text-amber-700/80 leading-relaxed mb-4">Pesananmu sudah masuk, tapi belum dibayar. Klik tombol di bawah untuk lanjut ke pembayaran aman.</p>
            <button className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20 transition-all active:scale-95"
              onClick={() => window.open(activeOrder.payment.payment_url ?? '#', '_blank')}>Bayar Sekarang via Midtrans</button>
          </div>
        )}

        <div className="m-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-gray-900">Ringkasan Pesanan</p>
            <span className="text-[10px] font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">{activeOrder.tenant?.tenant_name}</span>
          </div>
          <div className="space-y-3">
            {activeOrder.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">{item.menu_name} <span className="text-gray-900 font-bold ml-1">×{item.quantity}</span></span>
                <span className="font-bold text-gray-900">{fmt(item.subtotal)}</span>
              </div>
            ))}
          </div>
          {activeOrder.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Catatan:</p>
              <p className="text-xs text-gray-600 italic">"{activeOrder.notes}"</p>
            </div>
          )}
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">Total Akhir</span>
            <span className="text-lg font-black text-emerald-700">{fmt(activeOrder.grand_total ?? activeOrder.total_amount ?? 0)}</span>
          </div>
        </div>
        <div className="h-48" />
      </div>
    </div>
  );
}
