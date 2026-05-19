import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../../api/report';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Settings() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => reportApi.getSettings().then((r) => r.data.data?.data ?? r.data.data),
    onSuccess: (groupObj) => {
      // Flatten { group: [{key, value}, ...] } to { key: value }
      const flat = {};
      Object.values(groupObj).flat().forEach((s) => {
        flat[s.key] = s.value;
      });
      setLocalSettings(flat);
    },
  });

  const settings = localSettings ?? data ?? {};

  const saveMutation = useMutation({
    mutationFn: () => reportApi.updateSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Pengaturan berhasil disimpan');
    },
    onError: () => toast.error('Gagal menyimpan pengaturan'),
  });

  const set = (key, value) => setLocalSettings((s) => ({ ...s, [key]: value }));

  if (isLoading) return <LoadingSpinner label="Memuat pengaturan..." />;

  const SECTIONS = [
    {
      title: 'Biaya Platform',
      fields: [
        { key: 'platform_fee_percent', label: 'Biaya Layanan (%)', type: 'number', hint: 'Persentase biaya yang diambil dari setiap transaksi' },
        { key: 'min_order_amount', label: 'Min. Order Default (Rp)', type: 'number', hint: 'Minimal order jika tenant tidak mengatur sendiri' },
      ],
    },
    {
      title: 'Pembayaran',
      fields: [
        { key: 'payment_timeout_minutes', label: 'Batas Waktu Pembayaran (menit)', type: 'number' },
        { key: 'midtrans_environment', label: 'Midtrans Environment', type: 'select', options: ['sandbox', 'production'] },
      ],
    },
    {
      title: 'Aplikasi',
      fields: [
        { key: 'app_name', label: 'Nama Aplikasi', type: 'text' },
        { key: 'support_email', label: 'Email Support', type: 'email' },
        { key: 'support_phone', label: 'No. Telepon Support', type: 'tel' },
        { key: 'maintenance_mode', label: 'Mode Maintenance', type: 'select', options: ['false', 'true'] },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pengaturan Sistem</h1>
          <p className="text-sm text-gray-400">Konfigurasi platform KantinKita</p>
        </div>
        <Button variant="primary" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          Simpan Semua
        </Button>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">{section.title}</h2>
          </div>
          <div className="p-5 space-y-4">
            {section.fields.map((field) => (
              <div key={field.key}>
                {field.type === 'select' ? (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">{field.label}</label>
                    <select
                      value={settings[field.key] ?? ''}
                      onChange={(e) => set(field.key, e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <Input
                    label={field.label}
                    type={field.type}
                    value={settings[field.key] ?? ''}
                    hint={field.hint}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
