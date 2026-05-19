import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const hasToasted = React.useRef(false);

  useEffect(() => {
    if (hasToasted.current) return;
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    const error = params.get('error');
    const intent = params.get('intent');
    const email = params.get('email');

    if (error) {
      hasToasted.current = true;
      toast.error(error);
      navigate('/login', { replace: true });
      return;
    }

    if (intent && email) {
      hasToasted.current = true;
      navigate(`/auth/otp?email=${encodeURIComponent(email)}&intent=${intent}`, { replace: true });
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        login(user, token);
        toast.success(`Selamat datang, ${user.name}`);
        hasToasted.current = true;
      } catch (e) {
        hasToasted.current = true;
        toast.error('Gagal memproses data login.');
        navigate('/login', { replace: true });
      }
    } else {
      hasToasted.current = true;
      toast.error('Gagal mengautentikasi.');
      navigate('/login', { replace: true });
    }
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-gray-600">Memproses login Google...</p>
    </div>
  );
}
