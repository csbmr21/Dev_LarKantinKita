import React, { useState, useEffect, useRef } from 'react';
import { fmt } from '../../../../utils/api';
import { STATUS_COLS, NEXT_STATUS } from './constants';
import toast from 'react-hot-toast';
import {
  XMarkIcon, PrinterIcon, ClockIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';

export default function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [estTime, setEstTime] = useState(15);
  const modalRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  
  if (!order) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast.error('Pop-up terblokir! Izinkan pop-up untuk mencetak.');
    
    const itemsHtml = order.items.map(i => `
      <tr>
        <td style="padding: 4px 0;">${i.menu_name} x${i.quantity}</td>
        <td style="text-align: right;">${fmt(i.subtotal)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html><head><title>Struk KantinKita - ${order.order_number}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 10px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .footer { text-align: center; margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .total { font-weight: bold; border-top: 1px solid #000; margin-top: 5px; padding-top: 5px; }
        </style></head><body>
          <div class="header"><h2 style="margin: 0;">KantinKita</h2><p style="margin: 5px 0;">Order: ${order.order_number}</p><p style="margin: 0;">${new Date(order.created_at).toLocaleString('id-ID')}</p></div>
          <table>${itemsHtml}</table>
          <div class="total"><div style="display: flex; justify-content: space-between;"><span>TOTAL</span><span>${fmt(order.grand_total)}</span></div></div>
          <div class="footer"><p>Terima Kasih!</p><p>Selamat Menikmati</p></div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={modalRef} className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Detail Pesanan</h3>
            <p className="text-[11px] font-mono font-bold text-emerald-600 mt-1">{order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white rounded-2xl text-gray-400 transition-all shadow-sm border border-transparent hover:border-gray-100 active:scale-90">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Timeline Tracking */}
          <div className="space-y-5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Riwayat Status</p>
            <div className="relative pl-7 space-y-6 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              <div className="relative">
                <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-md transition-colors duration-500 ${order.paid_at ? 'bg-blue-500' : 'bg-gray-200'}`} />
                <p className="text-xs font-black text-gray-900 leading-none">Dibayar</p>
                <p className="text-[10px] font-bold text-gray-400 mt-1.5">{order.paid_at ? new Date(order.paid_at).toLocaleTimeString('id-ID') : 'Menunggu'}</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-md transition-colors duration-500 ${order.processing_at ? 'bg-amber-500' : 'bg-gray-200'}`} />
                <p className="text-xs font-black text-gray-900 leading-none">Diproses</p>
                <p className="text-[10px] font-bold text-gray-400 mt-1.5">{order.processing_at ? new Date(order.processing_at).toLocaleTimeString('id-ID') : 'Antre'}</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-md transition-colors duration-500 ${order.completed_at ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                <p className="text-xs font-black text-gray-900 leading-none">Selesai</p>
                <p className="text-[10px] font-bold text-gray-400 mt-1.5">{order.completed_at ? new Date(order.completed_at).toLocaleTimeString('id-ID') : 'Belum Selesai'}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Customer Info */}
          <div className="flex items-center gap-4 p-5 bg-[#F0FBF3] rounded-3xl border border-[#D8F3DC]">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm text-lg font-black">
              {order.user?.full_name?.charAt(0) ?? 'P'}
            </div>
            <div>
              <p className="text-sm font-black text-[#081C0F]">{order.user?.full_name ?? 'Pelanggan Walk-in'}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">{order.payment?.payment_type ?? order.payment_method ?? 'Cash'}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Pesanan</p>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate group-hover:text-emerald-700 transition-colors">{item.menu_name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Jumlah: {item.quantity}</p>
                  </div>
                  <span className="font-black text-gray-900 text-sm">{fmt(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Tagihan</span>
              <span className="text-lg font-black text-emerald-700 leading-none">{fmt(order.grand_total)}</span>
            </div>
          </div>

          {/* Estimation for Processing */}
          {order.status === 'paid' && (
            <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 space-y-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Estimasi Waktu Selesai</span>
              </div>
              <div className="flex items-center gap-4">
                <input type="range" min="5" max="60" step="5" value={estTime}
                  onChange={(e) => setEstTime(Number(e.target.value))}
                  className="flex-1 accent-amber-600 h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer" />
                <span className="w-14 h-9 bg-white border border-amber-200 rounded-xl flex items-center justify-center text-sm font-black text-amber-900 shadow-sm">{estTime}m</span>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Catatan Khusus:</p>
              <p className="text-xs text-gray-600 italic leading-relaxed">"{order.notes}"</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
          <button onClick={handlePrint} className="flex-1 h-14 bg-white border border-gray-200 text-gray-700 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm active:scale-95">
            <PrinterIcon className="w-5 h-5" /> Cetak
          </button>
          {(() => {
            const nextStatus = order.status === 'pending_payment'
              ? (order.payment_method !== 'midtrans' ? 'paid' : null)
              : NEXT_STATUS[order.status];
            if (!nextStatus) return null;
            return (
              <button onClick={() => onUpdateStatus(order.id, nextStatus, nextStatus === 'paid' ? {} : { estimated_ready_time: estTime })}
                className="flex-[2] h-14 bg-[#2D6A4F] text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-emerald-900/20 hover:bg-[#1B4332] transition-all active:scale-95 flex items-center justify-center gap-2">
                {nextStatus === 'paid' ? 'Diterima' : `Update Ke ${STATUS_COLS.find(s => s.key === nextStatus)?.label}`}
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
