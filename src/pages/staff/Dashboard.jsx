import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useUpdateOrderStatus } from '../../hooks/useOrders';
import { useRealtime, playNotificationSound } from '../../hooks/useRealtime';
import { orderApi } from '../../api/order';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelative, formatTime } from '../../utils/formatDate';
import { STAFF_FILTER_TABS } from '../../utils/orderStatus';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  paid: 'info', processing: 'orange', completed: 'success',
};

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('paid');
  const qc = useQueryClient();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['staff-orders', activeTab],
    queryFn: () => orderApi.getStaffOrders({ status: activeTab }).then((r) => r.data.data.data),
    refetchInterval: 30_000,
    staleTime: 0,
  });

  const tenantId = user?.tenant_id ?? orders[0]?.tenant_id;

  // Real-time via Pusher
  useRealtime(tenantId ? `tenant.${tenantId}` : null, {
    NewOrderReceived: (order) => {
      playNotificationSound();
      toast.success(`Pesanan baru dari ${order.customer}! #${order.order_number}`, { duration: 6000 });
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
    },
    OrderStatusChanged: () => {
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
    },
  });

  const handleProcess  = (id) => updateStatus({ id, status: 'processing' });
  const handleComplete = (id) => updateStatus({ id, status: 'completed' });

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Dashboard Order</h1>
        <p className="text-sm text-gray-400">Real-time pesanan masuk · auto-refresh 30 detik</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {STAFF_FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab.value
                ? 'border-[#2D6A4F] text-[#2D6A4F]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
            {tab.value === 'paid' && orders.length > 0 && activeTab === 'paid' && (
              <span className="bg-[#F4845F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order List */}
      {isLoading ? (
        <SkeletonList count={3} />
      ) : orders.length === 0 ? (
        <EmptyState icon="📭" title="Tidak ada pesanan" description={`Tidak ada pesanan dengan status ini`} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-mono text-gray-400">#{order.order_number}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    👤 {order.user?.full_name ?? 'Customer'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={STATUS_COLOR[order.status] ?? 'gray'} dot>
                    {order.status === 'paid' ? 'Baru' : order.status === 'processing' ? 'Diproses' : 'Selesai'}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">{formatRelative(order.created_at)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}× {item.menu_name}</span>
                    <span className="text-gray-500">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                {order.notes && (
                  <p className="text-xs text-orange-600 mt-2 pt-2 border-t border-gray-200">
                    📝 {order.notes}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#2D6A4F]">{formatCurrency(order.grand_total)}</p>
                <div className="flex gap-2">
                  {order.status === 'paid' && (
                    <Button size="sm" variant="primary" loading={isPending}
                      onClick={() => handleProcess(order.id)}>
                      🍳 Proses
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button size="sm" variant="secondary" loading={isPending}
                      onClick={() => handleComplete(order.id)}>
                      ✅ Selesai
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
