import api from './axios';

export const cartApi = {
  getCart: () =>
    api.get('/api/v1/cart'),

  addItem: (menuId, quantity) =>
    api.post('/api/v1/cart', { menu_id: menuId, quantity }),

  updateItem: (cartItemId, quantity) =>
    api.put(`/api/v1/cart/${cartItemId}`, { quantity }),

  removeItem: (cartItemId) =>
    api.delete(`/api/v1/cart/${cartItemId}`),

  clearCart: () =>
    api.delete('/api/v1/cart'),
};
