import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { reportApi } from '../../api/report';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Subscription() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-subscription'],
    queryFn: () => reportApi.getSubscription().then((r) => r.data.data),
  });

  const { data: plansData = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => reportApi.getSubscriptionPlans().then((r) => r.data.data),
  });

  const plans = Array.isArray(plansData) ? plansData : [];

  const subscribeMutation = useMutation({
    mutationFn: (planId) => reportApi.subscribe({ plan: planId }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['owner-subscription'] });
      toast.success(res.data?.message || 'Pengajuan paket berhasil dikirim!');
      setModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gagal mengirim pengajuan'),
  });

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  const isSubActive = data?.is_active ?? false;
  const trialActive = data?.trial_active ?? false;
  const trialDays = data?.trial_days_remaining ?? 0;
  const subDaysLeft = data?.days_remaining ?? 0;
  const currentSub = data?.subscription;
  const hasPending = currentSub?.approval_status === 'pending';

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <RocketLaunchIcon className="w-7 h-7 text-[#2D6A4F]" />
          Langganan & Paket
        </h1>
        <p className="text-gray-500 text-sm mt-1">Kelola paket berlangganan kantin Anda</p>
      </div>

      {/* Trial Status Banner */}
      {trialActive && !isSubActive && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-xl shadow-amber-500/20">
          <SparklesIcon className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
          <div className="flex items-center gap-3 mb-2">
            <ClockIcon className="w-6 h-6" />
            <h2 className="text-lg font-bold">Masa Trial Aktif</h2>
          </div>
          <p className="text-white/80 text-sm">
            Anda memiliki <span className="font-black text-white">{Math.max(0, Math.ceil(trialDays))} hari</span> tersisa dalam masa trial.
            {data?.trial_ends_at && <span> Berakhir pada <strong>{formatDate(data.trial_ends_at)}</strong>.</span>}
          </p>
          <p className="text-white/60 text-xs mt-2">
            Pilih paket di bawah untuk melanjutkan setelah masa trial berakhir.
          </p>
        </div>
      )}

      {/* Trial Expired Banner */}
      {!trialActive && !isSubActive && !hasPending && (
        <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircleIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-bold text-red-800">Masa Trial Berakhir</h2>
          </div>
          <p className="text-red-600 text-sm">
            Masa trial Anda telah berakhir. Pilih paket berlangganan untuk melanjutkan menggunakan semua fitur.
          </p>
        </div>
      )}

      {/* Active Subscription */}
      {isSubActive && (
        <div className="rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] p-6 text-white shadow-xl shadow-[#2D6A4F]/20 relative overflow-hidden">
          <SparklesIcon className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-6 h-6 text-emerald-300" />
                <h2 className="text-lg font-bold">Paket {currentSub?.plan?.charAt(0).toUpperCase() + currentSub?.plan?.slice(1)}</h2>
                <Badge variant="success" size="sm" className="bg-white/20 text-white border-white/30">AKTIF</Badge>
              </div>
              <p className="text-white/70 text-sm">
                Aktif hingga <strong className="text-white">{formatDate(currentSub?.billing_end)}</strong> · {Math.max(0, Math.ceil(subDaysLeft))} hari lagi
              </p>
            </div>
            <p className="text-2xl font-black">{formatCurrency(currentSub?.amount ?? 0)}<span className="text-sm font-normal text-white/50">/bln</span></p>
          </div>
          {subDaysLeft <= 7 && subDaysLeft > 0 && (
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-2.5 text-xs text-yellow-200 border border-white/20">
              ⚠️ Langganan Anda akan berakhir dalam {Math.ceil(subDaysLeft)} hari. Segera perpanjang!
            </div>
          )}
        </div>
      )}

      {/* Pending Status */}
      {hasPending && (
        <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <ClockIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-bold text-blue-800">Pengajuan Sedang Diproses</h2>
          </div>
          <p className="text-blue-600 text-sm">
            Pengajuan paket <strong className="uppercase">{currentSub?.plan}</strong> sedang menunggu persetujuan admin.
            Anda akan mendapatkan notifikasi setelah disetujui.
          </p>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Pilih Paket</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentSub?.plan === plan.id && isSubActive;
            return (
              <div
                key={plan.id}
                className={clsx(
                  'relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg',
                  isCurrentPlan
                    ? 'border-[#2D6A4F] bg-[#f0fdf4] shadow-md'
                    : 'border-gray-100 bg-white hover:border-[#2D6A4F]/30'
                )}
              >
                {plan.is_recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#F4845F] to-[#FF6B6B] text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-lg">
                      Rekomendasi
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-black text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-black text-[#2D6A4F] mt-2">
                  {formatCurrency(plan.price)}<span className="text-xs font-normal text-gray-400">/bln</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features?.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Button
                    variant={isCurrentPlan ? 'ghost' : 'primary'}
                    size="sm"
                    className="w-full"
                    disabled={isCurrentPlan || hasPending}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isCurrentPlan ? '✓ Paket Aktif' : hasPending ? 'Menunggu Approval' : 'Pilih Paket'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Konfirmasi Pengajuan Paket"
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button
              size="sm"
              variant="primary"
              loading={subscribeMutation.isPending}
              onClick={() => subscribeMutation.mutate(selectedPlan?.id)}
            >
              Kirim Pengajuan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Paket yang dipilih:</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-black text-gray-900">{selectedPlan?.name}</span>
              <span className="text-lg font-black text-[#2D6A4F]">{formatCurrency(selectedPlan?.price ?? 0)}/bln</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Cara kerja:</strong> Setelah Anda mengirim pengajuan, admin akan menerima notifikasi.
              Lakukan pembayaran sesuai instruksi, kemudian admin akan mengaktifkan paket Anda setelah pembayaran dikonfirmasi.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
