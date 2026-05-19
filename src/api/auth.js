import api from './axios';

export const authApi = {
  checkCompany: (company_code) =>
    api.post('/api/v1/auth/check-company', { company_code }),

  login: (email, password) =>
    api.post('/api/v1/auth/login', { email, password }),

  register: (data) =>
    api.post('/api/v1/auth/register', data),

  logout: () =>
    api.post('/api/v1/auth/logout'),

  me: () =>
    api.get('/api/v1/auth/me'),

  updateProfile: (data) => {
    return api.post('/api/v1/auth/profile', data); // Use explicit POST for file uploads
  },

  changePassword: (data) =>
    api.put('/api/v1/auth/password', data),

  verifyGoogleOtp: (data) => api.post('/api/v1/auth/google/verify-otp', data),
  forgotPassword: (email) => api.post('/api/v1/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/v1/auth/reset-password', data),
};
