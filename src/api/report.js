import api from './axios';

export const reportApi = {
  getSalesReport: (params = {}) =>
    api.get('/api/v1/owner/reports', { params }),

  getAggregateReport: (params = {}) =>
    api.get('/api/v1/owner/reports/aggregate', { params }),

  exportPdf: (params = {}) =>
    api.get('/api/v1/owner/reports/export/pdf', {
      params,
      responseType: 'blob',
    }),

  exportCsv: (params = {}) =>
    api.get('/api/v1/owner/reports/export/csv', {
      params,
      responseType: 'blob',
    }),

  // Admin
  getAdminStats: () =>
    api.get('/api/v1/admin/stats'),

  getAdminReport: (params = {}) =>
    api.get('/api/v1/admin/reports', { params }),

  // Settings
  getSettings: () =>
    api.get('/api/v1/admin/settings'),

  updateSettings: (settingsObj) => {
    // Transform flat object {key: val} to array [{key: k, value: v}]
    const settings = Object.entries(settingsObj).map(([key, value]) => ({ key, value }));
    return api.put('/api/v1/admin/settings', { settings });
  },

  // Users (admin)
  getUsers: (params = {}) =>
    api.get('/api/v1/admin/users', { params }),

  toggleUser: (id) =>
    api.patch(`/api/v1/admin/users/${id}/toggle`),

  createUser: (data) =>
    api.post('/api/v1/admin/users', data),

  updateUser: (id, data) =>
    api.put(`/api/v1/admin/users/${id}`, data),

  deleteUser: (id) =>
    api.delete(`/api/v1/admin/users/${id}`),

  impersonateUser: (id) =>
    api.post(`/api/v1/admin/users/${id}/impersonate`),


  // Audit logs
  getAuditLogs: (params = {}) =>
    api.get('/api/v1/admin/audit-logs', { params }),

  // Error logs
  getErrorLogs: (params = {}) =>
    api.get('/api/v1/admin/error-logs', { params }),

  resolveError: (id) =>
    api.patch(`/api/v1/admin/error-logs/${id}/resolve`),

  // Backups
  getBackups: () =>
    api.get('/api/v1/admin/backups'),

  createBackup: () =>
    api.post('/api/v1/admin/backups'),

  downloadBackup: (filename) =>
    api.get(`/api/v1/admin/backups/${filename}/download`, { responseType: 'blob' }),

  deleteBackup: (filename) =>
    api.delete(`/api/v1/admin/backups/${filename}`),

  // Subscriptions
  getSubscription: () =>
    api.get('/api/v1/owner/subscription'),

  getSubscriptionPlans: () =>
    api.get('/api/v1/owner/subscription/plans'),

  subscribe: (data) =>
    api.post('/api/v1/owner/subscription/subscribe', data),
};
