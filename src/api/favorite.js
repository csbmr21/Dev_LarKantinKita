import api from './axios';

export const favoriteApi = {
  /** Get customer's favorite menus (liked + frequently ordered) */
  getFavorites: () =>
    api.get('/api/v1/customer/favorites'),

  /** Toggle like/unlike a menu */
  toggleFavorite: (menuId) =>
    api.post(`/api/v1/customer/favorites/${menuId}/toggle`),

  /** Batch check which menus are liked */
  checkFavorites: (menuIds) =>
    api.post('/api/v1/customer/favorites/check', { menu_ids: menuIds }),
};
