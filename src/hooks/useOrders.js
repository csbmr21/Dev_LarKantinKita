import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/order';
import toast from 'react-hot-toast';

export function useStaffOrders(status = 'paid') {
  return useQuery({
    queryKey: ['staff-orders', status],
    queryFn: () => orderApi.getStaffOrders({ status }).then((r) => r.data.data?.data ?? r.data.data),
    refetchInterval: 30_000, // polling fallback setiap 30 detik
    staleTime: 0,
  });
}

export function useCustomerOrders(filters = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => orderApi.getOrders(filters).then((r) => r.data),
  });
}

export function useOrderDetail(id) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrderDetail(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }) =>
      orderApi.updateOrderStatus(id, status, notes),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['staff-orders'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Status pesanan diperbarui menjadi ${status}`);
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? 'Gagal memperbarui status';
      toast.error(msg);
    },
  });
}

export function useRequestRefund() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => orderApi.requestRefund(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Permintaan refund berhasil dikirim');
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? 'Gagal meminta refund';
      toast.error(msg);
    },
  });
}
