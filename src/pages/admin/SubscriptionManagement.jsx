import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Panel from '../../components/ui/Panel';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import clsx from 'clsx';

const STATUS_CONFIG = {
  pending:  { label: 'Menunggu', variant: 'warning', icon: ClockIcon },
  approved: { label: 'Disetujui', variant: 'success', icon: CheckCircleIcon },
  rejected: { label: 'Ditolak', variant: 'danger', icon: XCircleIcon },
};

const PLAN_COLORS = {
  starter: 'from-gray-500 to-gray-600',
  professional: 'from-blue-500 to-indigo-600',
  enterprise: 'from-purple-500 to-pink-600',
};

export default function SubscriptionManagement() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [approveForm, setApproveForm] = useState({ duration_months: 1, admin_notes: '' });
  const [rejectForm, setRejectForm] = useState({ admin_notes: '' });

  const { data: statsData } = useQuery({
    queryKey: ['admin-sub-stats'],
    queryFn: () => adminApi.getSubscriptionStats().then(r => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions', filter, search],
    queryFn: () => adminApi.getSubscriptions({ status: filter, search }).then(r => r.data),
  });

  const stats = statsData?.data ?? {};
  const subscriptions = data?.data?.data ?? [];

  const approveMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.approveSubscription(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['admin-sub-stats'] });
      toast.success('Langganan berhasil disetujui');
      setApproveModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal menyetujui'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.rejectSubscription(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['admin-sub-stats'] });
      toast.success('Langganan ditolak');
      setRejectModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Gagal menolak'),
  });

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CreditCardIcon className="w-8 h-8 text-[#2D6A4F]" />
            Manajemen Langganan
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pengajuan dan persetujuan paket berlangganan tenant.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Menunggu', value: stats.pending ?? 0, gradient: 'from-amber-400 to-orange-500', icon: ClockIcon },
          { label: 'Disetujui', value: stats.approved ?? 0, gradient: 'from-emerald-400 to-teal-600', icon: CheckCircleIcon },
          { label: 'Ditolak', value: stats.rejected ?? 0, gradient: 'from-rose-400 to-red-600', icon: XCircleIcon },
          { label: 'Aktif', value: stats.active ?? 0, gradient: 'from-blue-400 to-indigo-600', icon: CreditCardIcon },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group">
            <div className={clsx("absolute -right-4 -bottom-4 w-20 h-20 opacity-5 transition-transform duration-500 group-hover:scale-110", s.gradient.split(' ')[1])}>
              <s.icon className="w-full h-full text-current" />
            </div>
            <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg", s.gradient)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{s.label}</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2D6A4F] transition-colors" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama tenant atau paket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs focus:ring-4 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] transition-all outline-none font-medium shadow-sm"
            />
          </div>
          <div className="flex gap-2 p-1 bg-gray-100/50 rounded-2xl border border-gray-200/50">
            {['', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                  filter === s
                    ? 'bg-white text-[#2D6A4F] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {s === '' ? 'Semua' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-12"><SkeletonList count={5} /></div>
        ) : subscriptions.length === 0 ? (
          <EmptyState icon="📋" title="Belum ada pengajuan" description="Belum ada tenant yang mengajukan langganan paket premium." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                  {['Entitas Bisnis', 'Paket Layanan', 'Total Tagihan', 'Status Approval', 'Riwayat Pengajuan', 'Tindakan'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscriptions.map((sub) => {
                  const cfg = STATUS_CONFIG[sub.approval_status] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#2D6A4F]/10 group-hover:text-[#2D6A4F] transition-all shadow-sm">
                            <BuildingStorefrontIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-base leading-none tracking-tight">{sub.tenant?.tenant_name ?? '-'}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5 uppercase font-bold tracking-widest">Owner: {sub.tenant?.owner?.full_name ?? '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={clsx(
                          'inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-gradient-to-r shadow-lg',
                          PLAN_COLORS[sub.plan] ?? 'from-gray-500 to-gray-600'
                        )}>
                          {sub.plan}
                        </span>
                      </td>
                      <td className="px-6 py-6 transition-all">
                        <p className="font-black text-gray-900 text-base">{formatCurrency(sub.amount)}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Nett Amount</p>
                      </td>
                      <td className="px-6 py-6">
                        <Badge variant={cfg.variant} size="sm" className="font-black px-3 py-1 border-none uppercase italic tracking-widest text-[9px]">
                          <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                           <CalendarDaysIcon className="w-4 h-4 text-gray-300" />
                           <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{formatDate(sub.created_at)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {sub.approval_status === 'pending' ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => { setApproveModal(sub); setApproveForm({ duration_months: 1, admin_notes: '' }); }}
                              className="px-4 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1B4332] transition-all shadow-lg shadow-[#2D6A4F]/20"
                            >
                              Konfirmasi
                            </button>
                            <button
                              onClick={() => { setRejectModal(sub); setRejectForm({ admin_notes: '' }); }}
                              className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : sub.approval_status === 'approved' && sub.billing_end ? (
                          <div className="flex items-center gap-2 text-[#2D6A4F]">
                             <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-tighter italic">Berakhir {formatDate(sub.billing_end)}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic">Tidak Aktif</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Approve Modal */}
      <Panel
        isOpen={!!approveModal}
        onClose={() => setApproveModal(null)}
        title="Setujui Langganan"
        subtitle={`Paket ${approveModal?.plan?.toUpperCase()} untuk ${approveModal?.tenant?.tenant_name}`}
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setApproveModal(null)}>Batal</Button>
          <Button
            variant="primary"
            size="sm"
            loading={approveMutation.isPending}
            onClick={() => approveMutation.mutate({ id: approveModal.id, data: approveForm })}
          >
            Setujui & Aktifkan
          </Button>
        </>}
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Durasi Langganan (Bulan) *</label>
            <select
              value={approveForm.duration_months}
              onChange={(e) => setApproveForm({ ...approveForm, duration_months: parseInt(e.target.value) })}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
            >
              {[1, 3, 6, 12].map(m => (
                <option key={m} value={m}>{m} Bulan</option>
              ))}
            </select>
          </div>
          <Input
            label="Catatan Admin (Opsional)"
            placeholder="Contoh: Pembayaran sudah dikonfirmasi via transfer"
            value={approveForm.admin_notes}
            onChange={(e) => setApproveForm({ ...approveForm, admin_notes: e.target.value })}
          />
        </div>
      </Panel>

      {/* Reject Modal */}
      <Panel
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Tolak Langganan"
        subtitle={`Menolak paket ${rejectModal?.plan?.toUpperCase()} untuk ${rejectModal?.tenant?.tenant_name}`}
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setRejectModal(null)}>Batal</Button>
          <Button
            variant="danger"
            size="sm"
            loading={rejectMutation.isPending}
            onClick={() => rejectMutation.mutate({ id: rejectModal.id, data: rejectForm })}
          >
            Tolak Pengajuan
          </Button>
        </>}
      >
        <div className="space-y-5">
          <Input
            label="Alasan Penolakan *"
            placeholder="Berikan alasan mengapa pengajuan ini ditolak..."
            value={rejectForm.admin_notes}
            onChange={(e) => setRejectForm({ ...rejectForm, admin_notes: e.target.value })}
            required
          />
        </div>
      </Panel>
    </div>
  );
}
