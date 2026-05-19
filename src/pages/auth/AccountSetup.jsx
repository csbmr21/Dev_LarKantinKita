import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function AccountSetup() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    no_ktp: '',
    phone: '',
    dob: '',
    role: 'customer',
    tenant_name: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (user) {
      if (user.profile_completed) {
        navigate('/', { replace: true });
      } else {
        setForm({
          no_ktp: user.no_ktp || '',
          phone: user.phone || '',
          dob: user.dob || '',
          role: user.role && user.role !== 'customer' ? user.role : 'customer',
          tenant_name: '',
          password: '',
          password_confirmation: '',
        });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await api.put('/api/v1/auth/setup-profile', form);
      const responseData = res.data.data;
      
      // Use raw store login to update state WITHOUT triggering the automatic navigate 
      // from the useAuth hook's handleLogin wrapper.
      useAuthStore.getState().login(responseData, useAuthStore.getState().token);

      toast.success('Profil berhasil dilengkapi!');
      
      setTimeout(() => {
        if (responseData.role === 'owner') {
          // Direct redirect to dashboard with state to show popup
          navigate('/owner', { 
            replace: true, 
            state: { 
              showWelcome: true, 
              companyCode: responseData.company_code,
              tenantName: responseData.tenant?.tenant_name 
            } 
          });
        } else {
          // Redirect based on role immediately
          if (responseData.role === 'admin') navigate('/admin');
          else if (responseData.role === 'staff') navigate('/staff');
          else navigate('/');
        }
      }, 100);
      
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        toast.error('Cek kembali form Anda.');
      } else {
        toast.error(err.response?.data?.message || 'Gagal menyimpan profil.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-2">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (user?.name || 'U')[0].toUpperCase()
            )}
          </div>
          <span className="text-sm text-blue-500 font-medium cursor-pointer">Photo dari Google</span>
        </div>

        <div className="bg-blue-500 text-white px-4 py-2 rounded-md mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-semibold">General Info</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Info Group */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Account Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">User Id:</label>
                <input type="text" disabled value={user?.id ? `USR-${user.id}` : 'Auto ID'} className="w-full bg-gray-100 border-gray-300 rounded-md p-2 text-gray-500 border border-dashed" />
              </div>
              <Input
                label="Username *"
                name="username"
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                required
              />
              <Input
                label="Display Name *"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                error={errors.full_name}
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={form.email}
                  disabled
                  className="bg-gray-50"
                  error={errors.email}
                  required
                />
              </div>
              <Input
                label="Password *"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Buat password baru"
                required
              />
              <Input
                label="Confirm Password *"
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={handleChange}
                error={errors.password_confirmation}
                placeholder="Ketik ulang password"
                required
              />
            </div>
          </div>

          {/* Info Personal Group */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Info Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Input
                label="NIK (Sesuai KTP)"
                name="no_ktp"
                value={form.no_ktp}
                onChange={handleChange}
                error={errors.no_ktp}
                placeholder="16 digit nomor NIK"
              />
              <Input
                label="No HP"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  className={`w-full border rounded-md p-2 ${errors.dob ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                />
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob[0] || errors.dob}</p>}
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Pilih Jenis Akun</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label 
                className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-200 ${form.role === 'customer' ? 'border-[#2D6A4F] bg-[#f0fdf4] shadow-sm' : 'border-gray-200 hover:border-[#2D6A4F]/50 hover:bg-gray-50'}`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={form.role === 'customer'}
                    onChange={handleChange}
                    className="text-[#2D6A4F] focus:ring-[#2D6A4F] w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">Customer</span>
                </div>
                <p className="text-sm text-gray-500 pl-7 text-left">Saya ingin memesan makanan dari berbagai kantin.</p>
              </label>

              <label 
                className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-200 ${form.role === 'owner' ? 'border-[#2D6A4F] bg-[#f0fdf4] shadow-sm' : 'border-gray-200 hover:border-[#2D6A4F]/50 hover:bg-gray-50'}`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="radio"
                    name="role"
                    value="owner"
                    checked={form.role === 'owner'}
                    onChange={handleChange}
                    className="text-[#2D6A4F] focus:ring-[#2D6A4F] w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">Tenant / Pemilik Kantin</span>
                </div>
                <p className="text-sm text-gray-500 pl-7 text-left">Saya ingin mendaftarkan dan mengelola kantin saya.</p>
              </label>
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-2 pl-1">{errors.role[0] || errors.role}</p>}
          </div>

          {/* Tenant Name if Owner */}
          {form.role === 'owner' && (
            <div className="animate-fade-in-up">
              <Input
                label="Nama Toko / Kantin *"
                name="tenant_name"
                value={form.tenant_name}
                onChange={handleChange}
                error={errors.tenant_name}
                placeholder="Misal: Kantin Makmur Sentosa"
                required
              />
              <p className="text-xs text-gray-500 mt-1 pl-1">
                Nama kantin akan digunakan untuk menghasilkan kode perusahaan secara otomatis.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" loading={loading} className="w-full md:w-auto px-8">
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
