import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
});

// ── Request Interceptor ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (!error.response) {
      toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      return Promise.reject(error);
    }

    switch (status) {
      case 401:
        useAuthStore.getState().logout();
        window.location.href = '/login';
        break;

      case 403:
        toast.error('Akses ditolak: ' + (error.response?.data?.message || 'Anda tidak memiliki izin.'));
        // Jangan redirect hard reload agar popup/toast tidak hilang
        // window.location.href = '/unauthorized';
        break;

      case 500:
      case 503:
        toast.error('Terjadi kesalahan pada server. Coba beberapa saat lagi.');
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default api;
