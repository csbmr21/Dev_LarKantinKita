import api from './axios';

export const orderApi = {
  // Customer
  checkout: (data) =>
    api.post('/api/v1/customer/checkout', data),

  getOrders: (params = {}) =>
    api.get('/api/v1/customer/orders', { params }),

  getOrderDetail: (id) =>
    api.get(`/api/v1/customer/orders/${id}`),

  // Staff
  getStaffOrders: (params = {}) =>
    api.get('/api/v1/staff/orders', { params }),

  updateOrderStatus: (id, status, notes = '') =>
    api.patch(`/api/v1/orders/${id}/status`, { status, notes }),

  // Owner
  requestRefund: (id, reason) =>
    api.post(`/api/v1/orders/${id}/refund`, { reason }),

  getOwnerOrders: (params = {}) =>
    api.get('/api/v1/owner/orders', { params }),
};
