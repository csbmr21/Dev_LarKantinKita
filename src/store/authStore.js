import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Impersonation state
      originalUser: null,
      originalToken: null,
      isImpersonating: false,

      login: (user, token) =>
        set({ user, token, isAuthenticated: true, isImpersonating: false, originalUser: null, originalToken: null }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, isImpersonating: false, originalUser: null, originalToken: null }),

      impersonate: (targetUser, targetToken) => {
        const { user, token, isImpersonating, originalUser, originalToken } = get();
        
        // If already impersonating, don't overwrite the original admin
        if (!isImpersonating) {
          set({
            originalUser: user,
            originalToken: token,
            isImpersonating: true,
            user: targetUser,
            token: targetToken
          });
        } else {
          // Already impersonating, just switch the current target
          set({
            user: targetUser,
            token: targetToken
          });
        }
      },

      stopImpersonating: () => {
        const { isImpersonating, originalUser, originalToken } = get();
        if (isImpersonating && originalUser) {
          set({
            user: originalUser,
            token: originalToken,
            isImpersonating: false,
            originalUser: null,
            originalToken: null
          });
        }
      },

      updateUser: (userData) =>
        set((state) => ({ user: { ...state.user, ...userData } })),

      setToken: (token) =>
        set({ token }),

      getRole: () => get().user?.role?.slug ?? get().user?.role ?? null,

      isRole: (...roles) => {
        const currentRole = get().user?.role?.slug ?? get().user?.role;
        return roles.includes(currentRole);
      },

      can: (permission) => {
        const perms = get().user?.computed_permissions || [];
        if (get().getRole() === 'admin') return true; // Shortcut for Admin
        return perms.includes(permission);
      },
    }),
    {
      name: 'kantinkita-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        originalUser: state.originalUser,
        originalToken: state.originalToken,
        isImpersonating: state.isImpersonating,
      }),
    }
  )
);
