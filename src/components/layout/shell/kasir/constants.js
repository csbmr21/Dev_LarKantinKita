export const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';

export const STATUS_COLS = [
  { key: 'pending_payment', label: 'Belum Bayar', color: '#DC2626', bg: 'rgba(220,38,38,0.1)', icon: '⏳' },
  { key: 'paid',            label: 'Baru Masuk',  color: '#2563EB', bg: 'rgba(59,130,246,0.1)', icon: '📥' },
  { key: 'processing',      label: 'Diproses',    color: '#D97706', bg: 'rgba(245,158,11,0.1)', icon: '👨‍🍳' },
  { key: 'completed',       label: 'Selesai',     color: '#059669', bg: 'rgba(16,185,129,0.1)', icon: '✅' },
];

export const NEXT_STATUS = {
  paid:       'processing',
  processing: 'completed',
};
