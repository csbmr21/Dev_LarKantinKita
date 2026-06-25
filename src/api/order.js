import api from './axios';

export const orderApi = {
  // ── Customer ────────────────────────────────────────────────
  /**
   * Checkout — backend reads the server-side cart (status='cart' order).
   * Only optional `notes` is sent; items are already stored on the server.
   */
  checkout: (data = {}) =>
    api.post('/api/v1/customer/checkout', { notes: data.notes ?? '', payment_method: data.payment_method }),

  getOrders: (params = {}) =>
    api.get('/api/v1/customer/orders', { params }),

  getOrderDetail: (id) =>
    api.get(`/api/v1/customer/orders/${id}`),

  // ── Staff ────────────────────────────────────────────────────
  getStaffOrders: (params = {}) =>
    api.get('/api/v1/staff/orders', { params }),

  getStaffOrderSummary: () =>
    api.get('/api/v1/staff/orders/summary'),

  createWalkInOrder: (data) =>
    api.post('/api/v1/staff/orders', data),

  /**
   * Valid target statuses: 'processing' | 'completed' | 'cancelled'
   * Backend validates transitions:  paid → processing → completed
   */
  updateOrderStatus: (id, status, data = {}) =>
    api.put(`/api/v1/staff/orders/${id}/status`, { status, ...data }),

  bulkUpdateOrderStatus: (ids, status) =>
    api.post('/api/v1/staff/orders/bulk-status', { ids, status }),

  // ── Owner ────────────────────────────────────────────────────
  getOwnerOrders: (params = {}) =>
    api.get('/api/v1/owner/orders', { params }),

  requestRefund: (orderId, reason) =>
    api.post('/api/v1/owner/refund', { order_id: orderId, refund_reason: reason }),

  getRefundHistory: (params = {}) =>
    api.get('/api/v1/owner/refund/history', { params }),
};
