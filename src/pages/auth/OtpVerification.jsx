import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function OtpVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const email = searchParams.get('email');
  const intent = searchParams.get('intent');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email || !intent) {
      toast.error('Sesi tidak valid');
      navigate('/login');
    }
  }, [email, intent, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData('text').trim();
    if (data.length === 6 && !isNaN(data)) {
      setOtp(data.split(''));
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Masukkan 6 digit kode OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyGoogleOtp({
        email,
        intent,
        otp: code
      });
      
      const { user, token } = res.data.data;
      login(user, token);
      
      toast.success('Verifikasi berhasil!');
      
      if (!user.profile_completed) {
        navigate('/account-setup');
      } else {
        const dashboard = user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/';
        navigate(dashboard);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verifikasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email ? email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => { 
    return gp2 + gp3.replace(/./g, '*'); 
  }) : '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      {/* Branding / Logo Area */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-[#2D6A4F] rounded-xl flex items-center justify-center shadow-lg shadow-[#2D6A4F]/20 mb-3">
          <span className="text-white font-black text-xl">K</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">KantinKita</h2>
      </div>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50 p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#2D6A4F] to-[#52B788]" />

          <div className="w-20 h-20 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-8 text-[#2D6A4F] ring-8 ring-[#f0fdf4]/50">
            <ShieldCheckIcon className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-3">Verifikasi Keamanan</h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed px-4">
            Kami telah mengirimkan kode 6-digit ke email:<br />
            <span className="font-bold text-[#2D6A4F] bg-[#f0fdf4] px-2 py-0.5 rounded-md mt-2 inline-block">
              {maskedEmail}
            </span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full aspect-[4/5] text-center text-2xl font-bold bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#2D6A4F] focus:bg-white focus:ring-4 focus:ring-[#2D6A4F]/10 transition-all outline-none text-gray-800"
                />
              ))}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="rounded-2xl py-4 shadow-lg shadow-[#2D6A4F]/20"
            >
              Verifikasi & Lanjutkan
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50">
            <p className="text-gray-400 text-xs font-medium">
              Tidak menerima kode? <br />
              <button 
                type="button"
                className="text-[#2D6A4F] font-bold hover:text-[#1B4332] transition-colors mt-2"
                onClick={() => toast.success('Kode baru telah dikirim!')}
              >
                Kirim Ulang Email
              </button>
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <span>&larr;</span> Kembali ke Login
        </button>
      </div>
    </div>
  );
}
