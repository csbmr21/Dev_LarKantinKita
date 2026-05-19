import { useAuthStore } from '../store/authStore';

/**
 * Hook to check for permissions in functional components
 * Usage: const { can, isRole } = usePermission();
 */
export const usePermission = () => {
  const can = useAuthStore(state => state.can);
  const isRole = useAuthStore(state => state.isRole);
  const getRole = useAuthStore(state => state.getRole);
  const user = useAuthStore(state => state.user);

  return {
    can,
    isRole,
    getRole,
    user,
    // Add logic here if you need to check multiple permissions at once e.g. canAll(['read-user', 'write-user'])
    canAny: (perms) => perms.some(p => can(p)),
    canAll: (perms) => perms.every(p => can(p)),
  };
};
