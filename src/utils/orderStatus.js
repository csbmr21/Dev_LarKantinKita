import { 
  ClockIcon, 
  CreditCardIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowUturnLeftIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Order Status Configuration untuk KantinKita
 * Synced with backend Order model constants:
 *   pending_payment | paid | processing | completed | expired | cancelled | refunded
 */

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID:            'paid',
  PROCESSING:      'processing',
  COMPLETED:       'completed',
  EXPIRED:         'expired',
  CANCELLED:       'cancelled',
  REFUNDED:        'refunded',
};

const STATUS_CONFIG = {
  pending_payment: {
    label:      'Menunggu Pembayaran',
    shortLabel: 'Menunggu',
    color:      'bg-yellow-100 text-yellow-700',
    dotColor:   'bg-yellow-400',
    icon:       ClockIcon,
    description: 'Pesanan menunggu pembayaran dari customer.',
  },
  paid: {
    label:      'Sudah Dibayar',
    shortLabel: 'Dibayar',
    color:      'bg-blue-100 text-blue-700',
    dotColor:   'bg-blue-400',
    icon:       CreditCardIcon,
    description: 'Pembayaran berhasil, menunggu diproses staff.',
  },
  processing: {
    label:      'Sedang Diproses',
    shortLabel: 'Diproses',
    color:      'bg-orange-100 text-orange-700',
    dotColor:   'bg-orange-400',
    icon:       ArrowPathIcon,
    description: 'Staff sedang memproses pesanan Anda.',
  },
  completed: {
    label:      'Selesai',
    shortLabel: 'Selesai',
    color:      'bg-green-100 text-green-700',
    dotColor:   'bg-green-400',
    icon:       CheckCircleIcon,
    description: 'Pesanan telah selesai.',
  },
  expired: {
    label:      'Kadaluarsa',
    shortLabel: 'Expired',
    color:      'bg-gray-100 text-gray-600',
    dotColor:   'bg-gray-400',
    icon:       ClockIcon,
    description: 'Waktu pembayaran habis.',
  },
  cancelled: {
    label:      'Dibatalkan',
    shortLabel: 'Batal',
    color:      'bg-red-100 text-red-600',
    dotColor:   'bg-red-400',
    icon:       XCircleIcon,
    description: 'Pesanan dibatalkan.',
  },
  refunded: {
    label:      'Dikembalikan',
    shortLabel: 'Refund',
    color:      'bg-purple-100 text-purple-700',
    dotColor:   'bg-purple-400',
    icon:       ArrowUturnLeftIcon,
    description: 'Dana pesanan telah dikembalikan.',
  },
};

export const getStatusLabel       = (s) => STATUS_CONFIG[s]?.label       ?? s;
export const getStatusShortLabel  = (s) => STATUS_CONFIG[s]?.shortLabel  ?? s;
export const getStatusColor       = (s) => STATUS_CONFIG[s]?.color       ?? 'bg-gray-100 text-gray-600';
export const getStatusDotColor    = (s) => STATUS_CONFIG[s]?.dotColor    ?? 'bg-gray-400';
export const getStatusIcon        = (s) => STATUS_CONFIG[s]?.icon        ?? QuestionMarkCircleIcon;
export const getStatusDescription = (s) => STATUS_CONFIG[s]?.description ?? '';

export const isCompletedStatus = (s) =>
  ['completed', 'expired', 'cancelled', 'refunded'].includes(s);

export const isActiveStatus = (s) =>
  ['paid', 'processing'].includes(s);

/** Tabs for Staff — synced to real DB status enum values */
export const STAFF_FILTER_TABS = [
  { value: 'paid',        label: 'Baru Masuk',  icon: '🔔' },
  { value: 'processing',  label: 'Diproses',    icon: '🍳' },
  { value: 'completed',   label: 'Selesai',     icon: '✅' },
];

/** Tabs for Customer order history */
export const CUSTOMER_FILTER_TABS = [
  { value: '',                label: 'Semua'    },
  { value: 'pending_payment', label: 'Menunggu' },
  { value: 'processing',      label: 'Diproses' },
  { value: 'completed',       label: 'Selesai'  },
];

/**
 * Return a category / name-based emoji for menus that don't have a photo.
 * Menus have no `emoji` column in DB — this is a purely frontend utility.
 */
const CATEGORY_EMOJI_MAP = {
  'nasi':      '🍚', 'lauk':    '🍖', 'mie':      '🍜',
  'pasta':     '🍝', 'minum':   '🧋', 'minuman':  '🥤',
  'snack':     '🍟', 'cemilan': '🍿', 'dessert':  '🍰',
  'kue':       '🎂', 'soup':    '🍲', 'soto':     '🍲',
  'goreng':    '🍗', 'bakar':   '🔥', 'ayam':     '🍗',
  'ikan':      '🐟', 'sayur':   '🥦', 'salad':    '🥗',
  'sandwich':  '🥪', 'burger':  '🍔', 'pizza':    '🍕',
  'kopi':      '☕', 'teh':     '🍵', 'jus':      '🍹',
  'smoothie':  '🥤', 'es':      '🧊', 'susu':     '🥛',
  'sehat':     '🥗', 'fruit':   '🍎', 'buah':     '🍎',
};

export const getMenuEmoji = (menu) => {
  if (!menu) return '🍽️';
  const text = `${menu.name ?? ''} ${menu.category?.name ?? ''}`.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
    if (text.includes(key)) return emoji;
  }
  return '🍛';
};
