import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      tenantId: null,
      tenantName: null,

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
            items: [...items, { ...item, quantity: item.quantity || 1 }],
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
    }),
    {
      name: 'kantinkita-cart',
    }
  )
);
