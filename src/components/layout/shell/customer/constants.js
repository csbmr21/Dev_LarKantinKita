/** Status colour map — synced to real DB enum values */
export const STATUS_COLOR = {
  pending_payment: { bg: 'var(--kk-amber-100)',   text: '#92400E',               label: 'Menunggu Bayar' },
  paid:            { bg: 'var(--kk-blue-100)',     text: 'var(--kk-blue-600)',    label: 'Sudah Dibayar'  },
  processing:      { bg: 'var(--kk-amber-100)',    text: '#92400E',               label: 'Diproses'       },
  completed:       { bg: 'var(--kk-emerald-100)',  text: 'var(--kk-emerald-600)', label: 'Selesai'        },
  cancelled:       { bg: 'var(--kk-red-100)',      text: 'var(--kk-red-600)',     label: 'Dibatalkan'     },
  expired:         { bg: 'var(--kk-neutral-100)',  text: 'var(--kk-neutral-500)', label: 'Kadaluarsa'     },
  refunded:        { bg: 'var(--kk-violet-100)',   text: '#5B21B6',               label: 'Refunded'       },
};

/** Real order tracking steps based on DB status */
export const TRACKING_STEPS  = ['Menunggu Bayar', 'Sudah Dibayar', 'Diproses', 'Selesai'];
export const TRACKING_STEP_I = { pending_payment: 0, paid: 1, processing: 2, completed: 3 };
