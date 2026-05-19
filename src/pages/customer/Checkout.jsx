import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderApi } from '../../api/order';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { items, tenantId, clearCart, getTotalPrice } = useCartStore();
  const { user }   = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const notes      = location.state?.notes ?? '';

  const subtotal   = getTotalPrice();
  const feePercent = 2;
  const fee        = Math.ceil(subtotal * feePercent / 100);
  const total      = subtotal + fee;

  const processCheckout = async () => {
    setLoading(true);
    try {
      const res = await orderApi.checkout({
        tenant_id: tenantId,
        items: items.map((i) => ({ menu_id: i.menuId, quantity: i.quantity })),
        notes,
      });

      if (paymentMethod === 'midtrans') {
        if (!window.snap) {
          toast.error('Midtrans tidak tersedia. Refresh halaman.');
          setLoading(false);
          return;
        }
        const { snap_token } = res.data.data;
        window.snap.pay(snap_token, {
          onSuccess: () => {
            clearCart();
            toast.success('Pembayaran berhasil! 🎉');
            navigate('/orders');
          },
          onPending: () => {
            clearCart();
            toast('Pembayaran sedang diproses', { icon: '⏳' });
            navigate('/orders');
          },
          onError: (err) => {
            console.error('Midtrans error', err);
            toast.error('Pembayaran gagal. Coba lagi.');
          },
          onClose: () => {
            toast('Pembayaran dibatalkan', { icon: 'ℹ️' });
          },
        });
      } else {
        clearCart();
        toast.success('Pesanan dibuat! Harap tunjukkan bukti bayar ke kantin.', { icon: '🎉' });
        setModalOpen(false);
        navigate('/orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gagal membuat pesanan');
    } finally {
      if (paymentMethod !== 'midtrans') setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <h1 className="text-lg font-bold text-gray-800">Konfirmasi Pesanan</h1>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Detail Pesanan</h3>
        {items.map((item) => (
          <div key={item.menuId} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.quantity}× {item.name}</span>
            <span className="font-medium text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
        {notes && (
          <div className="pt-2 mt-2 border-t border-gray-50">
            <p className="text-xs text-gray-400">Catatan: {notes}</p>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1.5">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Info Pelanggan</h3>
        <p className="text-sm text-gray-600">{user?.full_name}</p>
        <p className="text-xs text-gray-400">{user?.phone}</p>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Rincian Pembayaran</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Biaya Layanan ({feePercent}%)</span><span>{formatCurrency(fee)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-800 text-base">
          <span>Total</span>
          <span className="text-[#2D6A4F]">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Button fullWidth variant="secondary" size="lg" onClick={() => setModalOpen(true)}>
          💳 Pilih Pembayaran & Bayar
        </Button>
        <Button fullWidth variant="outline" size="lg" onClick={() => navigate(-1)}>
          Cek Kembali Pesanan
        </Button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Pembayaran Pesanan"
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setModalOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button 
              size="sm" 
              variant="primary" 
              loading={loading}
              disabled={!paymentMethod}
              onClick={processCheckout}
            >
              Konfirmasi & Buat Pesanan
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center text-lg">
            <span className="font-bold text-gray-600">Total Tagihan:</span>
            <span className="font-bold text-[#2D6A4F]">{formatCurrency(total)}</span>
          </div>

          <div>
            <p className="font-semibold text-gray-700 text-sm mb-3">Pilih Metode Pembayaran</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'midtrans', name: 'Otomatis (Midtrans)', desc: 'Virtual Account, GoPay, ShopeePay (Verifikasi Instan)' },
                { id: 'qris', name: 'QRIS Manual', desc: 'Scan barcode QRIS Kantin' },
                { id: 'bca', name: 'Transfer BCA', desc: 'Dicek manual oleh penjual' },
                { id: 'dana', name: 'DANA', desc: 'Bayar pakai saldo DANA' }
              ].map((method) => (
                <label 
                  key={method.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === method.id ? 'border-[#2D6A4F] bg-[#f0fdf4]' : 'border-gray-200 hover:border-[#2D6A4F]/50'}`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method.id} 
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-[#2D6A4F] focus:ring-[#2D6A4F] border-gray-300"
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{method.name}</p>
                    <p className="text-xs text-gray-400">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {paymentMethod === 'midtrans' && (
            <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-center">
              <p className="text-sm font-semibold text-green-800">Pembayaran akan diteruskan ke Midtrans Gateways setelah menekan Konfirmasi.</p>
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center text-center">
              <div className="w-48 h-48 bg-white border border-gray-300 rounded-xl mb-3 flex items-center justify-center p-2">
                <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg bg-gray-50 text-center px-4">
                  <span className="text-sm font-semibold text-gray-500">Gambar QRIS Kantin Anda</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 max-w-[200px]">Silakan Lakukan pembayaran terlebih dahulu dan tunjukkan bukti transfer saat mengambil pesanan.</p>
            </div>
          )}

          {paymentMethod === 'bca' && (
            <div className="bg-[#f0f9ff] p-4 rounded-xl border border-[#bae6fd] flex flex-col items-center text-center">
              <p className="text-sm font-bold text-[#0369a1] mb-1">Transfer ke rekening Mandiri/BCA Kantin</p>
              <p className="text-xl font-mono font-bold text-[#0c4a6e] tracking-wider">Minta Rekening di Kasir</p>
              <p className="text-xs text-[#0284c7] mt-1">Harap bayar pesanan jika transfer telah berhasil</p>
            </div>
          )}

          {paymentMethod === 'dana' && (
            <div className="bg-[#eff6ff] p-4 rounded-xl border border-[#bfdbfe] flex flex-col items-center text-center">
              <p className="text-sm font-bold text-[#1e40af] mb-1">Transfer ke akun DANA Kantin</p>
              <p className="text-xl font-mono font-bold text-[#172554] tracking-wider">08XX XXXX XXXX</p>
              <p className="text-xs text-[#2563eb] mt-1">Silakan konfirmasi ke kasir untuk melihat ID Dana</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
