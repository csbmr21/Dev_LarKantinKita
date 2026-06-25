import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../../../api/cart';
import { orderApi } from '../../../../api/order';
import { fmt, tenantName } from '../../../../utils/api';
import { MenuFallbackIcon } from './MenuFallbackIcon';
import toast from 'react-hot-toast';
import {
  ShoppingBagIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon,
  PlusIcon, MinusIcon, TrashIcon, ArrowPathIcon, CreditCardIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

export default function CartScreen({ onNavigate }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('midtrans');

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['customer-cart'],
    queryFn: () => cartApi.getCart().then(r => r.data?.data ?? {}).catch(() => ({})),
    refetchInterval: 5000,
  });

  const items = cartData?.items ?? [];
  const cartTotal = cartData?.total ?? 0;
  const itemCount = cartData?.item_count ?? 0;
  const cartTenant = cartData?.tenant;

  const { mutate: updateItem } = useMutation({
    mutationFn: ({ id, quantity }) => cartApi.updateItem(id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-cart'] }),
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Gagal update'),
  });

  const { mutate: removeItem } = useMutation({
    mutationFn: (id) => cartApi.removeItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-cart'] }),
    onError: () => toast.error('Gagal menghapus item'),
  });

  const { mutate: clearCartMut } = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer-cart'] }); toast('🗑 Keranjang dikosongkan'); },
  });

  const handleCheckout = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const response = await orderApi.checkout({ notes, payment_method: paymentMethod });
      const snapToken = response.data?.data?.snap_token;
      
      if (paymentMethod === 'midtrans') {
        if (snapToken && window.snap && !snapToken.startsWith('mock-')) {
          window.snap.pay(snapToken, {
            onSuccess: () => {
              toast.success('🎉 Pembayaran berhasil!');
              onNavigate('orders');
            },
            onPending: () => {
              toast('⏳ Menunggu pembayaran');
              onNavigate('orders');
            },
            onError: () => toast.error('Gagal melakukan pembayaran'),
            onClose: () => toast('Pembayaran dibatalkan'),
          });
        } else {
          toast.success('🎉 Pesanan berhasil dibuat (Mock Mode)!');
          onNavigate('orders');
        }
      } else {
        toast.success('🎉 Pesanan berhasil dibuat! Silakan bayar tunai/cash di kasir.');
        onNavigate('orders');
      }
      qc.invalidateQueries({ queryKey: ['customer-cart'] });
      qc.invalidateQueries({ queryKey: ['customer-orders'] });
      setShowPaymentModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Gagal membuat pesanan. Coba lagi.');
    } finally { setLoading(false); }
  };

  if (cartLoading) return (
    <div className="kk-screen-container flex items-center justify-center">
      <div className="flex flex-col items-center gap-3"><ArrowPathIcon className="w-8 h-8 text-emerald-600 animate-spin" /><span className="text-sm font-medium text-gray-500">Memuat keranjang…</span></div>
    </div>
  );

  if (!items.length) return (
    <div className="kk-screen-container">
      <div className="kk-empty-state">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><ShoppingBagIcon className="w-10 h-10 text-gray-300" /></div>
        <p className="kk-empty-title">Keranjang Kosong</p>
        <p className="text-sm text-gray-400 max-w-[240px] mb-6">Sepertinya kamu belum menambahkan menu apapun. Yuk cari makanan enak!</p>
        <button className="kk-btn kk-btn-primary px-8" onClick={() => onNavigate('home')}>Cari Menu</button>
      </div>
    </div>
  );

  return (
    <div className="kk-screen-container">
      <div className="app-scroll">
        {cartTenant && (
          <div className="sticky top-0 z-10 px-4 py-3 bg-emerald-50 border-b border-emerald-100/50 flex items-center gap-2">
            <BuildingStorefrontIcon className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Pesanan dari {tenantName(cartTenant)}</span>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {items.map(item => (
            <div key={item.id} className="kk-cart-item bg-white">
              <div className="kk-cart-item-thumb">
                {item.menu?.photo_url ? <img src={item.menu.photo_url} alt="" className="w-full h-full object-cover" onError={e => { e.target.onerror=null; e.target.style.display='none'; }} /> : <MenuFallbackIcon className="w-6 h-6" />}
              </div>
              <div className="kk-cart-item-info"><div className="kk-cart-item-name">{item.menu_name}</div><div className="kk-cart-item-price">{fmt(item.price)}</div></div>
              <div className="kk-cart-item-ctrl">
                <button className="kk-cart-qty-btn kk-cart-qty-minus" onClick={() => { if (item.quantity <= 1) removeItem(item.id); else updateItem({ id: item.id, quantity: item.quantity - 1 }); }}><MinusIcon className="w-3 h-3" /></button>
                <span className="kk-cart-qty-num">{item.quantity}</span>
                <button className="kk-cart-qty-btn kk-cart-qty-plus" onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}><PlusIcon className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50/50">
          <div className="kk-card p-4">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-3">
              <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-600" /> Catatan Pesanan
            </label>
            <textarea className="kk-textarea" style={{ minHeight: 80 }} placeholder="Contoh: Tidak pedas, sambal dipisah, dll..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="h-48" />
      </div>

      <div className="kk-cart-summary shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="space-y-2 mb-4">
          <div className="kk-summary-row"><span className="kk-summary-key">Subtotal ({itemCount} item)</span><span className="kk-summary-val">{fmt(cartTotal)}</span></div>
        </div>
        <div className="border-t border-dashed border-gray-200 pt-4 mb-5">
          <div className="flex items-end justify-between">
            <span className="text-sm font-bold text-gray-900">Total Pembayaran</span>
            <span className="text-2xl font-extrabold text-emerald-700 tracking-tight">{fmt(cartTotal)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Kosongkan Keranjang" onClick={() => clearCartMut()}>
            <TrashIcon className="w-5 h-5" />
          </button>
          <button className="kk-btn kk-btn-primary flex-1 h-12 text-sm font-bold" onClick={() => setShowPaymentModal(true)}>
            Lanjut ke Pembayaran
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Konfirmasi Pembayaran</h3>
              <button onClick={() => setShowPaymentModal(false)}><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
            </div>

            <div className="mb-6 space-y-3">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Metode Pembayaran</p>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: 'midtrans', name: 'Otomatis (Midtrans)', desc: 'Pembayaran digital QRIS/Gopay/VA otomatis' },
                  { id: 'cash', name: 'Bayar Tunai di Kasir (Cash)', desc: 'Pesan sekarang, bayar tunai di kasir kantin' }
                ].map((method) => (
                  <label key={method.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === method.id ? 'border-[#2D6A4F] bg-[#f0fdf4]' : 'border-gray-100 hover:border-[#2D6A4F]/35'}`}>
                    <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#2D6A4F] focus:ring-[#2D6A4F] border-gray-300" />
                    <div>
                      <p className="font-bold text-gray-800 text-xs">{method.name}</p>
                      <p className="text-[10px] text-gray-400">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {paymentMethod === 'midtrans' ? (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl flex gap-3 border border-blue-100">
                <CreditCardIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <p className="text-[11px] text-blue-800 leading-normal">Pembayaran akan diproses via Midtrans secara aman. Setelah klik bayar, Anda akan diarahkan ke metode pembayaran digital.</p>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-amber-50 rounded-xl flex gap-3 border border-amber-100">
                <CreditCardIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <p className="text-[11px] text-amber-800 leading-normal">Harap siapkan uang tunai dan lakukan pembayaran di kasir kantin setelah pesanan Anda berhasil dikirim.</p>
              </div>
            )}

            <button className="kk-btn kk-btn-primary w-full h-12 font-bold" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Memproses...' : paymentMethod === 'midtrans' ? `Bayar ${fmt(cartTotal)}` : `Konfirmasi Pesanan`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
