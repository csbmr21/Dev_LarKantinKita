import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../../store/cartStore';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Cart() {
  const navigate  = useNavigate();
  const { items, tenantName, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [notes, setNotes] = useState('');

  const subtotal   = getTotalPrice();
  const feePercent = 2;
  const fee        = Math.ceil(subtotal * feePercent / 100);
  const total      = subtotal + fee;

  if (items.length === 0) {
    return (
      <div className="px-4 pt-8">
        <h1 className="text-lg font-bold text-gray-800 mb-6">Keranjang Belanja</h1>
        <EmptyState
          icon="🛒"
          title="Keranjang Kosong"
          description="Tambahkan menu dari kantin favoritmu"
          actionLabel="Pilih Kantin"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Keranjang Belanja</h1>
        <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 font-medium">
          Hapus Semua
        </button>
      </div>

      {/* Tenant Info */}
      <div className="flex items-center gap-2 bg-[#f0fdf4] rounded-xl px-3 py-2.5">
        <BuildingStorefrontIcon className="w-4 h-4 text-[#2D6A4F]" />
        <span className="text-sm font-semibold text-[#2D6A4F]">{tenantName}</span>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.menuId} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-[#2D6A4F] font-bold mt-0.5">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <MinusIcon className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <span className="text-sm font-bold text-gray-800 w-5 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                className="w-6 h-6 rounded-full bg-[#2D6A4F] flex items-center justify-center hover:bg-[#245A41]"
              >
                <PlusIcon className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={() => removeItem(item.menuId)}
                className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 ml-1"
              >
                <TrashIcon className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Catatan (opsional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Contoh: tidak pedas, tambah nasi..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
        />
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Ringkasan</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Biaya Layanan ({feePercent}%)</span>
          <span>{formatCurrency(fee)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-800">
          <span>Total</span>
          <span className="text-[#2D6A4F]">{formatCurrency(total)}</span>
        </div>
      </div>

      <Button
        fullWidth
        variant="primary"
        size="lg"
        onClick={() => navigate('/checkout', { state: { notes, total, fee } })}
      >
        Lanjut ke Pembayaran
      </Button>
    </div>
  );
}
