import api from './axios';

/**
 * Consolidated Admin + Owner API client.
 * Covers: admin panel, owner reports, subscriptions, settings, and system management.
 */
export const adminApi = {
  // ── Users ────────────────────────────────────────────────
  getUsers: (params) => api.get('/api/v1/admin/users', { params }),
  createUser: (data) => api.post('/api/v1/admin/users', data),
  updateUser: (id, data) => api.put(`/api/v1/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/v1/admin/users/${id}`),
  toggleUser: (id) => api.patch(`/api/v1/admin/users/${id}/toggle`),
  impersonateUser: (id) => api.post(`/api/v1/admin/users/${id}/impersonate`),

  // ── Roles ────────────────────────────────────────────────
  getRoles: () => api.get('/api/v1/admin/roles'),
  createRole: (data) => api.post('/api/v1/admin/roles', data),
  updateRole: (id, data) => api.put(`/api/v1/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/api/v1/admin/roles/${id}`),
  syncRolePermissions: (id, data) => api.post(`/api/v1/admin/roles/${id}/sync`, data),

  // ── Permissions ──────────────────────────────────────────
  getPermissions: () => api.get('/api/v1/admin/permissions'),
  createPermission: (data) => api.post('/api/v1/admin/permissions', data),
  updatePermission: (id, data) => api.put(`/api/v1/admin/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/api/v1/admin/permissions/${id}`),

  // ── Document Types ───────────────────────────────────────
  getDocumentTypes: () => api.get('/api/v1/admin/document-types'),
  createDocumentType: (data) => api.post('/api/v1/admin/document-types', data),
  updateDocumentType: (id, data) => api.put(`/api/v1/admin/document-types/${id}`, data),
  deleteDocumentType: (id) => api.delete(`/api/v1/admin/document-types/${id}`),

  // ── Subscriptions (Admin) ────────────────────────────────
  getSubscriptions: (params) => api.get('/api/v1/admin/subscriptions', { params }),
  getSubscriptionStats: () => api.get('/api/v1/admin/subscriptions/stats'),
  approveSubscription: (id, data) => api.put(`/api/v1/admin/subscriptions/${id}/approve`, data),
  rejectSubscription: (id, data) => api.put(`/api/v1/admin/subscriptions/${id}/reject`, data),

  // ── Tenants ──────────────────────────────────────────────
  getTenants: (params) => api.get('/api/v1/admin/tenants', { params }),
  createTenant: (data) => api.post('/api/v1/admin/tenants', data),
  updateTenant: (id, data) => api.put(`/api/v1/admin/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/api/v1/admin/tenants/${id}`),
  toggleTenant: (id) => api.patch(`/api/v1/admin/tenants/${id}/toggle`),

  // ── Settings & Config ────────────────────────────────────
  getSettings: () => api.get('/api/v1/admin/settings'),
  updateSettings: (data) => {
    if (data.settings) return api.put('/api/v1/admin/settings', data);
    const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
    return api.put('/api/v1/admin/settings', { settings });
  },
  getSettingVersions: () => api.get('/api/v1/admin/settings/versions'),

  // ── Stats ────────────────────────────────────────────────
  getAdminStats: () => api.get('/api/v1/admin/stats'),

  // ── Logs & Monitor ───────────────────────────────────────
  getAuditLogs: (params) => api.get('/api/v1/admin/audit-logs', { params }),
  exportAuditLogs: (params = {}) => api.get('/api/v1/admin/audit-logs/export', { params, responseType: 'blob' }),
  getErrorLogs: (params) => api.get('/api/v1/admin/error-logs', { params }),
  getErrorStats: () => api.get('/api/v1/admin/error-logs/stats'),
  resolveError: (id) => api.patch(`/api/v1/admin/error-logs/${id}/resolve`),

  // ── Backups ──────────────────────────────────────────────
  getBackups: () => api.get('/api/v1/admin/backups'),
  createBackup: () => api.post('/api/v1/admin/backups'),
  restoreBackup: (filename) => api.post('/api/v1/admin/backups/restore', { filename }),
  deleteBackup: (filename) => api.delete(`/api/v1/admin/backups/${filename}`),
  downloadBackup: (filename) => api.get(`/api/v1/admin/backups/${filename}/download`, { responseType: 'blob' }),

  // ── Reports (Admin) ─────────────────────────────────────
  getAdminReportAggregate: (params = {}) => api.get('/api/v1/admin/reports/aggregate', { params }),

  // ── Reports (Owner) ─────────────────────────────────────
  getSalesReport: (params = {}) =>
    api.get('/api/v1/owner/reports', { params }),

  getAggregateReport: (params = {}) =>
    api.get('/api/v1/owner/reports/aggregate', { params }),

  exportPdf: (params = {}) =>
    api.get('/api/v1/owner/reports/export/pdf', { params, responseType: 'blob' }),

  exportCsv: (params = {}) =>
    api.get('/api/v1/owner/reports/export/csv', { params, responseType: 'blob' }),

  // ── Finance (Owner) ──────────────────────────────────────
  getFinanceSummary: () => api.get('/api/v1/owner/finance/summary'),

  // ── Subscriptions (Owner) ───────────────────────────────
  getSubscription: () => api.get('/api/v1/owner/subscription'),
  getSubscriptionPlans: () => api.get('/api/v1/owner/subscription/plans'),
  subscribe: (data) => api.post('/api/v1/owner/subscription/subscribe', data),
  getSubscriptionInvoices: () => api.get('/api/v1/owner/subscription/invoices'),
};

/**
 * Backward-compatible alias.
 * @deprecated Use adminApi directly. Kept for gradual migration.
 */
export const reportApi = adminApi;
