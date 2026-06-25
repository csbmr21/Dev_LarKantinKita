import { useAuthStore } from '../store/authStore';

export function useImpersonation() {
  const { isImpersonating, stopImpersonating } = useAuthStore();

  const handleStopImpersonating = async () => {
    try {
      // Revoke current (impersonated) token di backend
      const { authApi } = await import('../api/auth');
      await authApi.logout();
    } catch (_) {
      // silently ignore — token mungkin sudah invalid
    } finally {
      stopImpersonating();
    }
  };

  return { 
    isImpersonating, 
    stopImpersonating: handleStopImpersonating 
  };
}
