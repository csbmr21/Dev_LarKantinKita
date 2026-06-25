import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../../../api/order';
import { unwrap, fmt, tenantName } from '../../../../utils/api';
import { getStatusIcon, getStatusLabel } from '../../../../utils/orderStatus';
import { STATUS_COLOR } from './constants';
import {
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

/* ─── Payment method label helper ─── */
const PAY_LABEL = {
  midtrans:    { label: 'Midtrans',   icon: <CreditCardIcon className="w-3 h-3" />,  color: 'bg-blue-50 text-blue-700 border-blue-100' },
  cash:        { label: 'Tunai',      icon: <BanknotesIcon  className="w-3 h-3" />,  color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  qris:        { label: 'QRIS',       icon: <CreditCardIcon className="w-3 h-3" />,  color: 'bg-violet-50 text-violet-700 border-violet-100' },
  bca:         { label: 'Transfer BCA',icon: <CreditCardIcon className="w-3 h-3" />, color: 'bg-blue-50 text-blue-700 border-blue-100' },
  dana:        { label: 'DANA',       icon: <CreditCardIcon className="w-3 h-3" />,  color: 'bg-sky-50 text-sky-700 border-sky-100' },
  qris_manual: { label: 'QRIS Manual',icon: <CreditCardIcon className="w-3 h-3" />, color: 'bg-violet-50 text-violet-700 border-violet-100' },
};

function payInfo(order) {
  const key = order.payment?.payment_type ?? order.payment_method ?? 'cash';
  return PAY_LABEL[key] ?? { label: key, icon: <CreditCardIcon className="w-3 h-3" />, color: 'bg-gray-50 text-gray-600 border-gray-100' };
}

/* ─── Timeline step ─── */
function TimelineStep({ done, active, label, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
          done   ? 'bg-emerald-500 border-emerald-500' :
          active ? 'bg-amber-400 border-amber-400 animate-pulse' :
                   'bg-gray-100 border-gray-200'
        }`} />
        <div className="w-0.5 h-5 bg-gray-100 mt-0.5 last:hidden" />
      </div>
      <div className="pb-4 min-w-0">
        <p className={`text-[11px] font-black uppercase tracking-wide ${done || active ? 'text-gray-800' : 'text-gray-300'}`}>{label}</p>
        {time && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{new Date(time).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</p>}
      </div>
    </div>
  );
}

/* ─── Single order card ─── */
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const sc = STATUS_COLOR[order.status] ?? STATUS_COLOR.paid;
  const StatusIcon = getStatusIcon(order.status);
  const pay = payInfo(order);
  const isPending = order.status === 'pending_payment';
  const createdAt = order.created_at ? new Date(order.created_at) : null;

  const steps = [
    { label: 'Pesanan Dibuat',     done: true,                          time: order.created_at },
    { label: 'Pembayaran Diterima', done: !!order.paid_at,              time: order.paid_at,        active: isPending },
    { label: 'Sedang Diproses',    done: !!order.processing_at,         time: order.processing_at,  active: order.status === 'paid' },
    { label: 'Pesanan Selesai',    done: order.status === 'completed',  time: order.completed_at,   active: order.status === 'processing' },
  ];

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${open ? 'border-emerald-200 shadow-lg shadow-emerald-900/5' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'}`}>
      {/* Header */}
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setOpen(o => !o)}
      >
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {order.tenant?.photo_url
            ? <img src={order.tenant.photo_url} alt="" className="w-full h-full object-cover" onError={e => { e.target.onerror=null; e.target.style.display='none'; }} />
            : <BuildingStorefrontIcon className="w-6 h-6 text-emerald-300" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-[13px] font-black text-gray-900 leading-tight truncate">{tenantName(order.tenant) || 'Kantin'}</p>
            <span className="text-[10px] font-bold text-gray-300 font-mono flex-shrink-0">#{order.order_number?.slice(-6) ?? order.id}</span>
          </div>

          <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-1 mb-2">
            {order.items?.map(i => `${i.menu_name} ×${i.quantity}`).join(', ') || '—'}
          </p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-black text-emerald-700">{fmt(order.grand_total ?? order.total_amount ?? 0)}</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg border" style={{ background: sc.bg, borderColor: sc.bg }}>
                <StatusIcon className="w-3 h-3 flex-shrink-0" style={{ color: sc.text }} />
                <span className="text-[10px] font-extrabold uppercase tracking-tight" style={{ color: sc.text }}>{sc.label}</span>
              </div>
              {open ? <ChevronUpIcon className="w-4 h-4 text-gray-300" /> : <ChevronDownIcon className="w-4 h-4 text-gray-300" />}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      {open && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-4 animate-fade-in">

          {/* Pending payment info box */}
          {isPending && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3">
              <ClockIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-black text-amber-800 mb-0.5">Menunggu Pembayaran</p>
                <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
                  {order.payment_method === 'midtrans'
                    ? 'Selesaikan pembayaran melalui Midtrans. Pesanan akan otomatis dikonfirmasi setelah pembayaran berhasil.'
                    : 'Silakan bayar tunai ke kasir. Kasir akan mengkonfirmasi pembayaran Anda.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Items breakdown */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Item Pesanan</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-center text-[9px] font-black text-gray-500 flex-shrink-0">×{item.quantity}</span>
                    <span className="text-[12px] font-semibold text-gray-700 truncate">{item.menu_name}</span>
                  </div>
                  <span className="text-[12px] font-black text-gray-800 flex-shrink-0">{fmt(item.subtotal ?? 0)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-dashed border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Tagihan</span>
                <span className="text-[14px] font-black text-emerald-700">{fmt(order.grand_total ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Payment method */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wide ${pay.color}`}>
              {pay.icon}
              {pay.label}
            </div>

            {/* Date */}
            {createdAt && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-500">
                <ClockIcon className="w-3 h-3" />
                {createdAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                {' '}
                {createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}

            {/* Catatan */}
            {order.notes && (
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Catatan</p>
                <p className="text-[11px] text-gray-600 font-medium italic">"{order.notes}"</p>
              </div>
            )}
          </div>

          {/* Progress timeline — only for non-terminal statuses */}
          {!['cancelled', 'expired', 'refunded'].includes(order.status) && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Progress Pesanan</p>
              <div className="pl-1">
                {steps.map((s, i) => (
                  <TimelineStep key={i} done={s.done} active={s.active} label={s.label} time={s.time} />
                ))}
              </div>
            </div>
          )}

          {/* Cancelled / Expired info */}
          {['cancelled', 'expired'].includes(order.status) && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-3">
              <XCircleIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-red-600 leading-relaxed">
                {order.status === 'expired'
                  ? 'Pesanan ini kadaluarsa karena waktu pembayaran habis.'
                  : 'Pesanan ini telah dibatalkan.'}
              </p>
            </div>
          )}

          {/* Completed */}
          {order.status === 'completed' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-3">
              <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-emerald-700 leading-relaxed">
                Pesanan selesai
                {order.completed_at ? ` pada ${new Date(order.completed_at).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}` : ''}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Screen ─── */
export default function OrdersScreen() {
  const [tab, setTab] = useState('aktif');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => orderApi.getOrders().then(unwrap).catch(() => []),
    refetchInterval: 5000,
  });

  const active    = orders.filter(o => !['completed', 'cancelled', 'expired', 'refunded'].includes(o.status));
  const done      = orders.filter(o => o.status === 'completed');
  const cancelled = orders.filter(o => ['cancelled', 'expired', 'refunded'].includes(o.status));
  const displayed = tab === 'aktif' ? active : tab === 'selesai' ? done : cancelled;

  const TABS = [
    { key: 'aktif',      label: 'Aktif',   count: active.length },
    { key: 'selesai',    label: 'Selesai', count: done.length },
    { key: 'dibatalkan', label: 'Batal',   count: cancelled.length },
  ];

  if (isLoading) return (
    <div className="kk-screen-container p-4 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="kkPulse h-20 bg-gray-50 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div className="kk-screen-container">
      {/* Tab Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex gap-2">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black transition-all ${
              tab === t.key
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
              <ClipboardDocumentListIcon className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-sm font-black text-gray-800 mb-1">
              {tab === 'aktif' ? 'Tidak ada pesanan aktif' : tab === 'selesai' ? 'Belum ada pesanan selesai' : 'Tidak ada pesanan dibatalkan'}
            </p>
            <p className="text-xs text-gray-400 font-medium">
              {tab === 'aktif' ? 'Pesanan yang sedang berjalan akan muncul di sini' : 'Riwayat pesanan kamu akan muncul di sini'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3 pb-24">
            {/* Summary header */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                {displayed.length} Pesanan
              </p>
              {tab === 'aktif' && active.some(o => o.status === 'pending_payment') && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-full border border-amber-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-black text-amber-700">Ada yang menunggu bayar</span>
                </div>
              )}
              {tab === 'aktif' && active.some(o => ['paid','processing'].includes(o.status)) && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full border border-blue-100">
                  <ArrowPathIcon className="w-3 h-3 text-blue-500 animate-spin" />
                  <span className="text-[10px] font-black text-blue-700">Sedang diproses</span>
                </div>
              )}
            </div>

            {displayed.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  );
}
