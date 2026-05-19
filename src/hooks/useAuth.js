import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const ROLE_DASHBOARDS = {
  admin:    '/admin',
  owner:    '/owner',
  staff:    '/staff',
  customer: '/',
};

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const getDashboardPath = useCallback(() => {
    return ROLE_DASHBOARDS[user?.role] ?? '/';
  }, [user?.role]);

  const handleLogin = useCallback(
    (userData, userToken) => {
      login(userData, userToken);
      const path = ROLE_DASHBOARDS[userData.role] ?? '/';
      navigate(path, { replace: true });
    },
    [login, navigate]
  );

  const handleLogout = useCallback(async () => {
    try {
      const { authApi } = await import('../api/auth');
      await authApi.logout();
    } catch (_) {
      // silently ignore — token may already be invalid
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  }, [logout, navigate]);

  const hasRole = useCallback(
    (...roles) => roles.includes(user?.role),
    [user?.role]
  );

  return {
    user,
    token,
    isAuthenticated,
    role: user?.role ?? null,
    getDashboardPath,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    hasRole,
  };
}
