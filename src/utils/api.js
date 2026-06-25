/**
 * Shared API response utilities for KantinKita frontend.
 * Eliminates duplicated unwrap(), fmt(), tenantName() helpers across views.
 */

/**
 * Safely unwrap Laravel paginated/list response → always Array.
 * Handles: { data: [] } | { data: { data: [] } } | { data: { data: { data: [] } } } | []
 *
 * @param {Object|Array} r - Axios response object
 * @returns {Array}
 */
export const unwrap = (r) => {
  const d = r?.data;
  if (Array.isArray(d))             return d;
  if (Array.isArray(d?.data))       return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

/**
 * Format number as Indonesian Rupiah currency.
 * @param {number|string|null} n
 * @returns {string}
 */
export const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

/**
 * Normalize tenant name — DB column is `tenant_name`, but some APIs return `name`.
 * @param {Object|null} t - Tenant object
 * @returns {string}
 */
export const tenantName = (t) => t?.tenant_name ?? t?.name ?? 'Kantin';
