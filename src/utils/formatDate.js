import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
} from 'date-fns';
import { id } from 'date-fns/locale';

function toDate(date) {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;
  const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
  return isValid(parsed) ? parsed : null;
}

/**
 * Format tanggal: "01 Jan 2025"
 */
export function formatDate(date) {
  const d = toDate(date);
  if (!d) return '-';
  return format(d, 'dd MMM yyyy', { locale: id });
}

/**
 * Format tanggal & waktu: "01 Jan 2025, 14:30"
 */
export function formatDateTime(date) {
  const d = toDate(date);
  if (!d) return '-';
  return format(d, 'dd MMM yyyy, HH:mm', { locale: id });
}

/**
 * Format waktu saja: "14:30"
 */
export function formatTime(date) {
  const d = toDate(date);
  if (!d) return '-';
  return format(d, 'HH:mm', { locale: id });
}

/**
 * Format relatif: "2 jam lalu", "3 hari yang lalu"
 */
export function formatRelative(date) {
  const d = toDate(date);
  if (!d) return '-';
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

/**
 * Format range tanggal: "01 Jan – 31 Jan 2025"
 */
export function formatDateRange(start, end) {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return '-';
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${format(s, 'dd', { locale: id })} – ${format(e, 'dd MMM yyyy', { locale: id })}`;
  }
  if (sameYear) {
    return `${format(s, 'dd MMM', { locale: id })} – ${format(e, 'dd MMM yyyy', { locale: id })}`;
  }
  return `${format(s, 'dd MMM yyyy', { locale: id })} – ${format(e, 'dd MMM yyyy', { locale: id })}`;
}

/**
 * Format untuk input type="date": "2025-01-01"
 */
export function formatDateInput(date) {
  const d = toDate(date);
  if (!d) return '';
  return format(d, 'yyyy-MM-dd');
}
