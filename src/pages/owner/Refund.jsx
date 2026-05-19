import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order';
import { useRequestRefund } from '../../hooks/useOrders';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

export default function OwnerRefund() {
  const [modal, setModal]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError]   = useState('');
  const { mutate: requestRefund, isPending } = useRequestRefund();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['owner-orders-refundable'],
    queryFn: () => orderApi.getOwnerOrders({ status: 'paid,processing' }).then((r) => r.data.data.data),
    staleTime: 30_000,
  });

  const openModal = (order) => { setSelected(order); setReason(''); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setSelected(null); };

  const handleRefund = () => {
    if (!reason.trim()) { setError('Alasan refund wajib diisi'); return; }
    requestRefund({ id: selected.id, reason }, { onSuccess: closeModal });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Manajemen Refund</h1>
        <p className="text-sm text-gray-400">Proses pengembalian dana untuk pesanan yang sudah dibayar</p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
        ⚠️ Refund hanya dapat dilakukan untuk pesanan dengan status <strong>Dibayar</strong> atau <strong>Diproses</strong>.
      </div>

      {isLoading ? <SkeletonList count={3} /> : orders.length === 0 ? (
        <EmptyState icon="↩️" title="Tidak ada pesanan yang bisa direfund" description="Hanya pesanan berstatus Dibayar atau Diproses yang dapat direfund" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-gray-400">#{order.order_number}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {order.user?.full_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.created_at)}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-bold text-[#2D6A4F]">{formatCurrency(order.grand_total)}</span>
                  <Badge variant={order.status === 'paid' ? 'info' : 'orange'} dot>
                    {order.status === 'paid' ? 'Dibayar' : 'Diproses'}
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="danger" onClick={() => openModal(order)}>
                Refund
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={closeModal} title="Konfirmasi Refund"
        footer={<>
          <Button size="sm" variant="outline" onClick={closeModal}>Batal</Button>
          <Button size="sm" variant="danger" loading={isPending} onClick={handleRefund}>Proses Refund</Button>
        </>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order</span>
                <span className="font-mono text-gray-700">#{selected.order_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="text-gray-700">{selected.user?.full_name}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-700">Total Refund</span>
                <span className="text-red-600">{formatCurrency(selected.grand_total)}</span>
              </div>
            </div>
            <Input
              label="Alasan Refund"
              placeholder="Jelaskan alasan refund..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              error={error}
              textarea
              rows={3}
              required
            />
            <p className="text-xs text-gray-400">Refund akan diproses oleh Midtrans dan dana dikembalikan ke customer dalam 1-5 hari kerja.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
