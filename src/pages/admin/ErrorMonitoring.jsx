import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../../api/report';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatDateTime, formatRelative } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const LEVEL_COLOR = { error: 'danger', warning: 'warning', info: 'info', critical: 'danger' };

export default function ErrorMonitoring() {
  const qc = useQueryClient();
  const [level,    setLevel]    = useState('');
  const [resolved, setResolved] = useState('0');
  const [page,     setPage]     = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['error-logs', { level, resolved, page }],
    queryFn: () => reportApi.getErrorLogs({ level: level || undefined, is_resolved: resolved, page }).then((r) => r.data),
    refetchInterval: 60_000,
  });

  const logs = data?.data?.data ?? [];
  const meta = data?.data ?? {};

  const resolveMutation = useMutation({
    mutationFn: reportApi.resolveError,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['error-logs'] }); toast.success('Error ditandai selesai'); },
    onError: () => toast.error('Gagal memperbarui error'),
  });

  const unresolvedCount = data?.unresolved_count ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Error Monitoring</h1>
          <p className="text-sm text-gray-400">Pantau error aplikasi secara real-time</p>
        </div>
        {unresolvedCount > 0 && (
          <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
            {unresolvedCount} belum diselesaikan
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none">
          <option value="">Semua Level</option>
          {['critical','error','warning','info'].map((l) => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
        <select value={resolved} onChange={(e) => { setResolved(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none">
          <option value="0">Belum Diselesaikan</option>
          <option value="1">Sudah Diselesaikan</option>
          <option value="">Semua</option>
        </select>
      </div>

      {/* Error Cards */}
      {isLoading ? (
        <SkeletonList count={4} />
      ) : logs.length === 0 ? (
        <EmptyState icon="✅" title="Tidak ada error" description="Sistem berjalan normal" />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className={`bg-white rounded-xl border shadow-sm p-4 space-y-3 ${
              log.is_resolved ? 'border-gray-100 opacity-70' : 'border-red-100'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Badge variant={LEVEL_COLOR[log.level] ?? 'gray'}>
                    {log.level?.toUpperCase()}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{log.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {log.file}:{log.line} · {formatRelative(log.created_at)}
                    </p>
                  </div>
                </div>
                {!log.is_resolved && (
                  <Button size="xs" variant="outline" loading={resolveMutation.isPending}
                    onClick={() => resolveMutation.mutate(log.id)}>
                    Resolve
                  </Button>
                )}
              </div>

              {log.context && (
                <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap max-h-32 font-mono">
                  {typeof log.context === 'string' ? log.context : JSON.stringify(log.context, null, 2)}
                </pre>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                <span>📅 {formatDateTime(log.created_at)}</span>
                {log.url && <span>🔗 {log.url}</span>}
                {log.user_id && <span>👤 User #{log.user_id}</span>}
                {log.occurrences > 1 && (
                  <span className="text-orange-500 font-medium">🔄 {log.occurrences}× terjadi</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {meta.last_page > 1 && (
        <Pagination currentPage={page} totalPages={meta.last_page} onPageChange={setPage}
          totalItems={meta.total} perPage={meta.per_page} />
      )}
    </div>
  );
}
