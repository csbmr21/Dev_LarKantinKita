import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownTrayIcon, TrashIcon, CircleStackIcon, PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { reportApi } from '../../api/report';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatDateTime, formatRelative } from '../../utils/formatDate';
import toast from 'react-hot-toast';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${units[i]}`;
}

export default function BackupRestore() {
  const qc    = useQueryClient();
  const [creating,    setCreating]    = useState(false);
  const [downloading, setDownloading] = useState(null);

  const { data: backups = [], isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: () => reportApi.getBackups().then((r) => r.data.data?.data ?? r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: reportApi.createBackup,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['backups'] }); toast.success('Backup berhasil dibuat'); },
    onError: () => toast.error('Gagal membuat backup'),
  });

  const deleteMutation = useMutation({
    mutationFn: reportApi.deleteBackup,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['backups'] }); toast.success('Backup dihapus'); },
    onError: () => toast.error('Gagal menghapus backup'),
  });

  const handleDownload = async (filename) => {
    setDownloading(filename);
    try {
      const res = await reportApi.downloadBackup(filename);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup berhasil diunduh');
    } catch {
      toast.error('Gagal mengunduh backup');
    } finally {
      setDownloading(null);
    }
  };

  const handleCreate = () => {
    if (!confirm('Buat backup database sekarang?')) return;
    createMutation.mutate();
  };

  const handleDelete = (filename) => {
    if (!confirm(`Hapus backup "${filename}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    deleteMutation.mutate(filename);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Backup & Restore</h1>
          <p className="text-sm text-gray-400">{backups.length} backup tersimpan</p>
        </div>
        <Button variant="primary" size="sm" loading={createMutation.isPending}
          leftIcon={<PlusCircleIcon />} onClick={handleCreate}>
          Buat Backup
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        ℹ️ Backup dibuat secara otomatis setiap hari pukul <strong>02:00 WIB</strong>. Backup disimpan selama <strong>30 hari</strong>.
      </div>

      {/* Backup List */}
      {isLoading ? (
        <SkeletonList count={3} />
      ) : backups.length === 0 ? (
        <EmptyState icon="💾" title="Belum ada backup" description="Buat backup pertama Anda"
          actionLabel="Buat Backup" onAction={handleCreate} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {backups.map((backup) => (
            <div key={backup.filename} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <CircleStackIcon className="w-8 h-8 text-[#2D6A4F] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{backup.filename}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span>📦 {formatBytes(backup.size)}</span>
                    <span>🕐 {formatRelative(backup.created_at)}</span>
                    {backup.type === 'auto' && (
                      <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Auto</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(backup.filename)}
                  disabled={downloading === backup.filename}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f0fdf4] text-[#2D6A4F] hover:bg-[#dcfce7] transition-colors disabled:opacity-50"
                  title="Unduh"
                >
                  {downloading === backup.filename ? (
                    <div className="w-4 h-4 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(backup.filename)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  title="Hapus"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
