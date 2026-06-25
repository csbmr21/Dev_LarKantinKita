import api from './axios';

export const cartApi = {
  getCart: () =>
    api.get('/api/v1/customer/cart'),

  addItem: (menuId, quantity) =>
    api.post('/api/v1/customer/cart/add', { menu_id: menuId, quantity }),

  updateItem: (cartItemId, quantity) =>
    api.put(`/api/v1/customer/cart/${cartItemId}`, { quantity }),

  removeItem: (cartItemId) =>
    api.delete(`/api/v1/customer/cart/${cartItemId}`),

  clearCart: () =>
    api.delete('/api/v1/customer/cart/clear'),
};
