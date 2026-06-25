import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../../../api/order';
import { tenantApi } from '../../../../api/tenant';
import { unwrap, fmt } from '../../../../utils/api';
import { getMenuEmoji } from '../../../../utils/orderStatus';
import { ErrorFallback } from './ErrorBoundary';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, ShoppingBagIcon, TrashIcon,
  CheckCircleIcon, ArrowPathIcon, CheckBadgeIcon,
  PlusIcon, MinusIcon,
} from '@heroicons/react/24/outline';

export default function PosPage({ time }) {
  const [cartItems, setCartItems] = useState([]);
  const [payMethod, setPayMethod] = useState('cash');
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  const qc = useQueryClient();

  const { data: menus = [], isLoading: loadingMenus, error: menuError } = useQuery({
    queryKey: ['staff-menus', search, activeCat],
    queryFn: () => tenantApi.getMenus({ search: search || undefined, category: activeCat || undefined }).then(unwrap),
    keepPreviousData: true,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['staff-categories'],
    queryFn: () => tenantApi.getCategories().then(unwrap),
  });

  const { mutate: checkout, isLoading: submitting } = useMutation({
    mutationFn: (payload) => orderApi.createWalkInOrder(payload),
    onSuccess: (res) => {
      const data = res?.data?.data ?? {};
      const snapToken = data?.snap_token;

      if (payMethod === 'midtrans') {
        if (snapToken && window.snap && !snapToken.startsWith('mock-')) {
          window.snap.pay(snapToken, {
            onSuccess: () => {
              toast.success('Pembayaran berhasil!');
              setShowSuccess(true);
              setCartItems([]);
              setNotes('');
              qc.invalidateQueries({ queryKey: ['staff-orders'] });
              qc.invalidateQueries({ queryKey: ['staff-order-summary'] });
              setTimeout(() => setShowSuccess(false), 2500);
            },
            onPending: () => {
              toast('Menunggu pembayaran pelanggan');
              setCartItems([]);
              setNotes('');
              qc.invalidateQueries({ queryKey: ['staff-orders'] });
              qc.invalidateQueries({ queryKey: ['staff-order-summary'] });
            },
            onError: () => toast.error('Pembayaran gagal.'),
            onClose: () => toast('Pembayaran dibatalkan.'),
          });
        } else {
          toast.success('Pesanan berhasil dibuat (Mock Mode)!');
          setShowSuccess(true);
          setCartItems([]);
          setNotes('');
          qc.invalidateQueries({ queryKey: ['staff-orders'] });
          qc.invalidateQueries({ queryKey: ['staff-order-summary'] });
          setTimeout(() => setShowSuccess(false), 2500);
        }
      } else {
        setShowSuccess(true);
        setCartItems([]);
        setNotes('');
        qc.invalidateQueries({ queryKey: ['staff-orders'] });
        qc.invalidateQueries({ queryKey: ['staff-order-summary'] });
        setTimeout(() => setShowSuccess(false), 2500);
      }
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Gagal memproses transaksi.'),
  });

  const { mutate: toggleStock } = useMutation({
    mutationFn: (id) => tenantApi.toggleMenuAvailability(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-menus'] }),
  });

  const addToCart = useCallback((menu) => {
    setCartItems(prev => {
      const existing = prev.find(x => x.id === menu.id);
      return existing ? prev.map(x => x.id === menu.id ? { ...x, qty: x.qty + 1 } : x) : [...prev, { ...menu, qty: 1 }];
    });
  }, []);

  const updateCartQty = useCallback((id, delta) => {
    setCartItems(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x).filter(x => x.qty > 0));
  }, []);

  const totalPrice = useMemo(() => cartItems.reduce((s, x) => s + x.price * x.qty, 0), [cartItems]);

  if (menuError) return <ErrorFallback error={menuError} resetErrorBoundary={() => qc.invalidateQueries({ queryKey: ['staff-menus'] })} />;

  return (
    <div className="flex h-full bg-[#F9FAFB]">
      {/* Menu Grid */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100">
        <div className="p-5 bg-white border-b border-gray-100 space-y-4">
          <div className="relative group">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#40916C] transition-colors" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari menu lezat..."
              className="w-full h-12 pl-12 pr-5 bg-gray-50 border-1.5 border-gray-100 rounded-[18px] text-[13px] font-bold focus:bg-white focus:ring-4 focus:ring-[#40916C]/5 focus:border-[#40916C] transition-all outline-none" />
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            <button onClick={() => setActiveCat('')} className={`px-5 h-10 rounded-[14px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-1.5 ${activeCat === '' ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-lg shadow-emerald-900/20' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}>Semua Menu</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`px-5 h-10 rounded-[14px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-1.5 ${activeCat === cat.id ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-lg shadow-emerald-900/20' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}>{cat.name}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F9FAFB]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loadingMenus ? [...Array(15)].map((_, i) => <div key={i} className="aspect-[4/5] bg-white rounded-[24px] border border-gray-100 animate-pulse" />) :
              menus.map(m => {
                const inCart = cartItems.find(x => x.id === m.id);
                const outOfStock = !m.is_available;
                return (
                  <div key={m.id} onClick={() => !outOfStock && addToCart(m)} className={`relative group bg-white p-3.5 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col hover:-translate-y-1 ${inCart ? 'border-[#52B788] bg-[#F0FBF3]/30 shadow-xl shadow-emerald-900/5' : 'border-white hover:border-[#B7E4C7] shadow-sm hover:shadow-xl hover:shadow-emerald-900/5'} ${outOfStock ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    <div className="aspect-square bg-gray-50 rounded-[18px] mb-3.5 overflow-hidden relative shadow-inner">
                      {m.photo_url ? <img src={m.photo_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-4xl opacity-50 group-hover:scale-110 transition-transform duration-500">{getMenuEmoji(m)}</div>}
                      {inCart && <div className="absolute top-2.5 right-2.5 w-8 h-8 bg-[#40916C] text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg animate-scaleIn">{inCart.qty}</div>}
                    </div>
                    <div className="flex-1 min-w-0 px-0.5">
                      <p className="text-[12px] font-black text-[#081C0F] truncate leading-tight mb-1.5">{m.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-black text-[#2D6A4F]">{fmt(m.price)}</p>
                        <button onClick={(e) => { e.stopPropagation(); toggleStock(m.id); }} className={`p-1.5 rounded-xl transition-all ${m.is_available ? 'text-gray-200 hover:text-red-500 hover:bg-red-50' : 'text-red-500 hover:text-emerald-500'}`}><CheckBadgeIcon className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[360px] bg-white flex flex-col flex-shrink-0 shadow-2xl z-10 border-l border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div>
            <p className="text-xs font-black text-[#081C0F] uppercase tracking-[0.15em]">Detail Order</p>
            <p className="text-[10px] font-mono font-bold text-gray-400 mt-1.5 uppercase tracking-tight">WALK-IN • {time.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</p>
          </div>
          {cartItems.length > 0 && <button onClick={() => setCartItems([])} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"><TrashIcon className="w-5 h-5" /></button>}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 custom-scrollbar min-h-0">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 text-center">
              <ShoppingBagIcon className="w-20 h-20 mb-5" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em]">Keranjang Kosong</p>
            </div>
          ) : cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-[24px] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">{getMenuEmoji(item)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black text-[#081C0F] truncate tracking-tight">{item.name}</p>
                <p className="text-[11px] font-black text-[#2D6A4F] mt-1">{fmt(item.price)}</p>
              </div>
              <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                <button onClick={() => updateCartQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors active:scale-90"><MinusIcon className="w-3.5 h-3.5" /></button>
                <input type="number" value={item.qty}
                  onChange={(e) => { const val = parseInt(e.target.value); if (!isNaN(val)) updateCartQty(item.id, val - item.qty); }}
                  onBlur={(e) => { if (parseInt(e.target.value) <= 0 || isNaN(parseInt(e.target.value))) updateCartQty(item.id, -item.qty + 1); }}
                  className="text-[12px] font-black text-[#081C0F] w-8 text-center bg-transparent border-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button onClick={() => addToCart(item)} className="w-7 h-7 bg-[#2D6A4F] text-white rounded-lg flex items-center justify-center shadow-md active:scale-90 transition-transform"><PlusIcon className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-6">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ada request khusus? (Opsional)" className="w-full h-20 p-4 bg-white border border-gray-200 rounded-[20px] text-[11px] font-bold focus:ring-4 focus:ring-[#40916C]/5 focus:border-[#40916C] transition-all outline-none resize-none placeholder:text-gray-300" />
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest px-1"><span>Metode Pembayaran</span><span className="text-[#2D6A4F]">Pilih Satu</span></div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['cash', '💵 Tunai'],
                ['qris_manual', '📱 QRIS'],
                ['midtrans', '💳 Midtrans']
              ].map(([v, l]) => (
                <button key={v} onClick={() => setPayMethod(v)} className={`h-12 rounded-[16px] text-[10px] font-black uppercase tracking-tight transition-all border-2 ${payMethod === v ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xl shadow-emerald-900/20' : 'bg-white text-gray-500 border-gray-100 hover:border-[#B7E4C7] hover:bg-gray-50'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="pt-5 border-t border-dashed border-gray-300">
            <div className="flex justify-between items-end mb-6"><span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Tagihan</span><span className="text-3xl font-black text-[#2D6A4F] tracking-tighter leading-none">{fmt(totalPrice)}</span></div>
            <button onClick={() => checkout({ payment_method: payMethod, notes, items: cartItems.map(x => ({ menu_id: x.id, qty: x.qty })) })} disabled={cartItems.length === 0 || submitting} className="w-full h-16 bg-[#2D6A4F] text-white rounded-[20px] text-sm font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/30 transition-all active:scale-[0.98] hover:bg-[#1B4332] disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-3">
              {submitting ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <><CheckCircleIcon className="w-6 h-6" /> Proses Transaksi</>}
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[300] bg-[#081C0F]/90 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn p-10">
          <div className="w-28 h-28 bg-[#52B788] rounded-full flex items-center justify-center text-5xl mb-8 shadow-2xl animate-bounce">✅</div>
          <p className="text-3xl font-black text-white mb-3 uppercase tracking-[0.2em] text-center">Transaksi Berhasil!</p>
          <p className="text-[#B7E4C7] font-bold text-lg text-center leading-relaxed">Pesanan walk-in telah dicatat<br/>dan siap diproses.</p>
        </div>
      )}
    </div>
  );
}
