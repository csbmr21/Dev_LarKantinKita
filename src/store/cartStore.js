import { create } from 'zustand';
import toast from 'react-hot-toast';

/**
 * Client-side cart UI cache.
 * 
 * IMPORTANT: The SERVER-SIDE cart (Order with status='cart' via CartController)
 * is the canonical source of truth. This store is a transient UI cache only —
 * it does NOT persist to localStorage. On page reload, the server cart is
 * fetched via TanStack Query (`customer-cart` query key).
 * 
 * This eliminates state desync between client and server cart.
 */
export const useCartStore = create(
  (set, get) => ({
    items: [],
    tenantId: null,
    tenantName: null,

    /**
     * Sync from server cart data.
     * Called after fetching the server cart via TanStack Query.
     */
    syncFromServer: (serverCart) => {
      if (!serverCart?.items) {
        set({ items: [], tenantId: null, tenantName: null });
        return;
      }
      set({
        items: serverCart.items.map(item => ({
          menuId: item.menu_id ?? item.menuId,
          cartItemId: item.id ?? item.cartItemId,
          name: item.menu_name ?? item.name,
          price: item.price,
          photo: item.menu?.photo_url ?? item.photo,
          tenantId: serverCart.tenant?.id ?? serverCart.tenant_id,
          tenantName: serverCart.tenant?.tenant_name ?? serverCart.tenant?.name,
          quantity: item.quantity,
        })),
        tenantId: serverCart.tenant?.id ?? serverCart.tenant_id ?? null,
        tenantName: serverCart.tenant?.tenant_name ?? serverCart.tenant?.name ?? null,
      });
    },

    setItems: (items, tenantId, tenantName) =>
      set({ items, tenantId, tenantName }),

    addItem: (item) => {
      const { items, tenantId } = get();

      if (items.length > 0 && tenantId !== null && tenantId !== item.tenantId) {
        toast.error('Gagal menambahkan. Anda harus menyelesaikan atau mengosongkan pesanan sebelumnya dari kantin lain.', { duration: 4000 });
        return;
      }

      const existing = items.find((i) => i.menuId === item.menuId);
      if (existing) {
        set({
          items: items.map((i) =>
            i.menuId === item.menuId
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          ),
        });
      } else {
        set({
          items: [
            ...items,
            {
              menuId: item.menuId,
              cartItemId: item.cartItemId ?? null,
              name: item.name,
              price: item.price,
              photo: item.photo,
              tenantId: item.tenantId,
              tenantName: item.tenantName,
              quantity: item.quantity || 1,
            },
          ],
          tenantId: item.tenantId,
          tenantName: item.tenantName,
        });
      }
    },

    removeItem: (menuId) =>
      set((state) => {
        const newItems = state.items.filter((i) => i.menuId !== menuId);
        return {
          items: newItems,
          tenantId: newItems.length === 0 ? null : state.tenantId,
          tenantName: newItems.length === 0 ? null : state.tenantName,
        };
      }),

    updateQuantity: (menuId, quantity) => {
      if (quantity <= 0) {
        get().removeItem(menuId);
        return;
      }
      set((state) => ({
        items: state.items.map((i) =>
          i.menuId === menuId ? { ...i, quantity } : i
        ),
      }));
    },

    clearCart: () =>
      set({ items: [], tenantId: null, tenantName: null }),

    getTotalItems: () =>
      get().items.reduce((sum, i) => sum + i.quantity, 0),

    getTotalPrice: () =>
      get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  })
);
