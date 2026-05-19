import api from './axios';

export const adminApi = {
  // Users
  getUsers: (params) => api.get('/api/v1/admin/users', { params }),
  createUser: (data) => api.post('/api/v1/admin/users', data),
  updateUser: (id, data) => api.put(`/api/v1/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/v1/admin/users/${id}`),
  toggleUser: (id) => api.patch(`/api/v1/admin/users/${id}/toggle`),
  impersonateUser: (id) => api.post(`/api/v1/admin/users/${id}/impersonate`),

  // Roles
  getRoles: () => api.get('/api/v1/admin/roles'),
  createRole: (data) => api.post('/api/v1/admin/roles', data),
  updateRole: (id, data) => api.put(`/api/v1/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/api/v1/admin/roles/${id}`),
  syncRolePermissions: (id, data) => api.post(`/api/v1/admin/roles/${id}/sync`, data),

  // Permissions
  getPermissions: () => api.get('/api/v1/admin/permissions'),
  createPermission: (data) => api.post('/api/v1/admin/permissions', data),
  updatePermission: (id, data) => api.put(`/api/v1/admin/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/api/v1/admin/permissions/${id}`),

  // Document Types
  getDocumentTypes: () => api.get('/api/v1/admin/document-types'),
  createDocumentType: (data) => api.post('/api/v1/admin/document-types', data),
  updateDocumentType: (id, data) => api.put(`/api/v1/admin/document-types/${id}`, data),
  deleteDocumentType: (id) => api.delete(`/api/v1/admin/document-types/${id}`),

  // Subscriptions
  getSubscriptions: (params) => api.get('/api/v1/admin/subscriptions', { params }),
  getSubscriptionStats: () => api.get('/api/v1/admin/subscriptions/stats'),
  approveSubscription: (id, data) => api.put(`/api/v1/admin/subscriptions/${id}/approve`, data),
  rejectSubscription: (id, data) => api.put(`/api/v1/admin/subscriptions/${id}/reject`, data),

  // Tenants
  getTenants: (params) => api.get('/api/v1/admin/tenants', { params }),
  createTenant: (data) => api.post('/api/v1/admin/tenants', data),
  updateTenant: (id, data) => api.put(`/api/v1/admin/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/api/v1/admin/tenants/${id}`),
  toggleTenant: (id) => api.patch(`/api/v1/admin/tenants/${id}/toggle`),
};
