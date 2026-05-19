/**
 * Format angka ke format Rupiah
 * @param {number} amount
 * @returns {string} "Rp 15.000"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format singkat untuk angka besar
 * @param {number} amount
 * @returns {string} "15rb" | "1,5jt"
 */
export function formatCurrencyShort(amount) {
  if (amount == null || isNaN(amount)) return '0';
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1).replace('.0', '');
    return `${val}jt`;
  }
  if (amount >= 1_000) {
    const val = (amount / 1_000).toFixed(0);
    return `${val}rb`;
  }
  return String(amount);
}

/**
 * Format untuk input — hanya angka tanpa simbol
 * @param {number} amount
 * @returns {string} "15000"
 */
export function formatCurrencyInput(amount) {
  if (!amount) return '';
  return new Intl.NumberFormat('id-ID').format(amount);
}

/**
 * Parse currency string ke number
 * @param {string} str "15.000"
 * @returns {number} 15000
 */
export function parseCurrency(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/\./g, '').replace(/,/g, ''), 10) || 0;
}
