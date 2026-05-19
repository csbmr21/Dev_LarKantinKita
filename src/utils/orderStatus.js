/**
 * Order Status Configuration untuk KantinKita
 */

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const STATUS_CONFIG = {
  pending_payment: {
    label: 'Menunggu Pembayaran',
    shortLabel: 'Menunggu',
    color: 'bg-yellow-100 text-yellow-700',
    dotColor: 'bg-yellow-400',
    icon: '⏳',
    description: 'Pesanan menunggu pembayaran dari customer.',
  },
  paid: {
    label: 'Sudah Dibayar',
    shortLabel: 'Dibayar',
    color: 'bg-blue-100 text-blue-700',
    dotColor: 'bg-blue-400',
    icon: '💳',
    description: 'Pembayaran berhasil, menunggu diproses staff.',
  },
  processing: {
    label: 'Sedang Diproses',
    shortLabel: 'Diproses',
    color: 'bg-orange-100 text-orange-700',
    dotColor: 'bg-orange-400',
    icon: '🍳',
    description: 'Staff sedang memproses pesanan Anda.',
  },
  completed: {
    label: 'Selesai',
    shortLabel: 'Selesai',
    color: 'bg-green-100 text-green-700',
    dotColor: 'bg-green-400',
    icon: '✅',
    description: 'Pesanan telah selesai.',
  },
  expired: {
    label: 'Kadaluarsa',
    shortLabel: 'Expired',
    color: 'bg-gray-100 text-gray-600',
    dotColor: 'bg-gray-400',
    icon: '⌛',
    description: 'Waktu pembayaran habis.',
  },
  cancelled: {
    label: 'Dibatalkan',
    shortLabel: 'Batal',
    color: 'bg-red-100 text-red-600',
    dotColor: 'bg-red-400',
    icon: '❌',
    description: 'Pesanan dibatalkan.',
  },
  refunded: {
    label: 'Dikembalikan',
    shortLabel: 'Refund',
    color: 'bg-purple-100 text-purple-700',
    dotColor: 'bg-purple-400',
    icon: '↩️',
    description: 'Dana pesanan telah dikembalikan.',
  },
};

export function getStatusLabel(status) {
  return STATUS_CONFIG[status]?.label ?? status;
}

export function getStatusShortLabel(status) {
  return STATUS_CONFIG[status]?.shortLabel ?? status;
}

export function getStatusColor(status) {
  return STATUS_CONFIG[status]?.color ?? 'bg-gray-100 text-gray-600';
}

export function getStatusDotColor(status) {
  return STATUS_CONFIG[status]?.dotColor ?? 'bg-gray-400';
}

export function getStatusIcon(status) {
  return STATUS_CONFIG[status]?.icon ?? '❓';
}

export function getStatusDescription(status) {
  return STATUS_CONFIG[status]?.description ?? '';
}

export function isCompletedStatus(status) {
  return ['completed', 'expired', 'cancelled', 'refunded'].includes(status);
}

export function isActiveStatus(status) {
  return ['paid', 'processing'].includes(status);
}

export const STAFF_FILTER_TABS = [
  { value: 'paid',       label: 'Baru',      icon: '🔔' },
  { value: 'processing', label: 'Diproses',  icon: '🍳' },
  { value: 'completed',  label: 'Selesai',   icon: '✅' },
];

export const CUSTOMER_FILTER_TABS = [
  { value: '',            label: 'Semua'   },
  { value: 'pending_payment', label: 'Menunggu' },
  { value: 'processing',  label: 'Diproses' },
  { value: 'completed',   label: 'Selesai'  },
];
