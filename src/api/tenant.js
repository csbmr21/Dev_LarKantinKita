import api from './axios';

export const tenantApi = {
  getTenants: (params = {}) =>
    api.get('/api/v1/tenants', { params }),

  getTenantDetail: (id) =>
    api.get(`/api/v1/tenants/${id}`),

  getTenantMenus: (id, params = {}) =>
    api.get(`/api/v1/tenants/${id}/menus`, { params }),

  // Staff / Owner
  getMyTenant: () =>
    api.get('/api/v1/tenant/me'),

  updateMyTenant: (data) => {
    return api.post('/api/v1/tenant/me', data);
  },

  getMenus: (params = {}) =>
    api.get('/api/v1/staff/menus', { params }),

  createMenu: (data) =>
    api.post('/api/v1/staff/menus', data),

  updateMenu: (id, data) => {
    // Laravel bug: PUT/PATCH doesn't parse multipart/form-data. 
    // We use POST with _method spoofing if it's FormData.
    if (data instanceof FormData) {
      return api.post(`/api/v1/staff/menus/${id}`, data);
    }
    return api.put(`/api/v1/staff/menus/${id}`, data);
  },

  deleteMenu: (id) =>
    api.delete(`/api/v1/staff/menus/${id}`),

  toggleMenuAvailability: (id) =>
    api.put(`/api/v1/staff/menus/${id}/availability`),

  getCategories: () =>
    api.get('/api/v1/staff/categories'),

  createCategory: (data) =>
    api.post('/api/v1/staff/categories', data),

  updateCategory: (id, data) =>
    api.put(`/api/v1/staff/categories/${id}`, data),

  deleteCategory: (id) =>
    api.delete(`/api/v1/staff/categories/${id}`),

  // Admin
  adminGetTenants: (params = {}) =>
    api.get('/api/v1/admin/tenants', { params }),

  adminToggleTenant: (id) =>
    api.patch(`/api/v1/admin/tenants/${id}/toggle`),

  // Staff management
  getStaffList: () =>
    api.get('/api/v1/owner/staff'),

  createStaff: (data) =>
    api.post('/api/v1/owner/staff', data),

  updateStaff: (id, data) =>
    api.put(`/api/v1/owner/staff/${id}`, data),

  removeStaff: (id) =>
    api.delete(`/api/v1/owner/staff/${id}`),

  toggleStaff: (id) =>
    api.put(`/api/v1/owner/staff/${id}/toggle`),

};
