import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { reportApi } from '../../api/report';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatDateTime } from '../../utils/formatDate';

const METHOD_COLOR = {
  POST: 'primary', GET: 'info', PUT: 'warning', PATCH: 'orange', DELETE: 'danger',
};

export default function AuditLog() {
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { query, page }],
    queryFn: () => reportApi.getAuditLogs({ search: query || undefined, page }).then((r) => r.data),
  });

  const logs = data?.data?.data ?? [];
  const meta = data?.data ?? {};

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Audit Log</h1>
        <p className="text-sm text-gray-400">Semua aktivitas pada sistem</p>
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1); }} className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Cari log..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20" />
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Waktu', 'User', 'Aksi', 'Method', 'URL', 'IP', 'Status', 'Deskripsi'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-mono text-[11px]">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8"><SkeletonList count={5} /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon="📋" title="Tidak ada log" /></td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3 text-gray-700 font-bold">{log.user?.username ?? 'Guest'}</td>
                  <td className="px-4 py-3 text-gray-600 uppercase font-medium">{log.action}</td>
                  <td className="px-4 py-3">
                    <Badge variant={METHOD_COLOR[log.method] ?? 'gray'} size="sm">{log.method || '-'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{log.url || '-'}</td>
                  <td className="px-4 py-3 text-gray-400">{log.ip_address}</td>
                  <td className="px-4 py-3">
                    <Badge variant={log.status_code < 400 ? 'success' : 'danger'} size="sm">
                      {log.status_code || '-'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {meta.last_page > 1 && (
        <Pagination currentPage={page} totalPages={meta.last_page} onPageChange={setPage}
          totalItems={meta.total} perPage={meta.per_page} />
      )}
    </div>
  );
}
