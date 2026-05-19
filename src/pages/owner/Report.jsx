import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { reportApi } from '../../api/report';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, formatDateInput } from '../../utils/formatDate';
import { getStatusLabel, getStatusColor } from '../../utils/orderStatus';
import { subDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function OwnerReport() {
  const today = new Date();
  const [startDate, setStartDate] = useState(formatDateInput(subDays(today, 29)));
  const [endDate,   setEndDate]   = useState(formatDateInput(today));
  const [page,      setPage]      = useState(1);
  const [exporting, setExporting] = useState(null);

  const params = { start_date: startDate, end_date: endDate, page };

  const { data, isLoading } = useQuery({
    queryKey: ['owner-sales', params],
    queryFn: () => reportApi.getSalesReport(params).then((r) => r.data),
  });

  const orders     = data?.data?.data ?? [];
  const meta       = data?.data ?? {};
  const summary    = data?.summary ?? {};

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const fn = type === 'pdf' ? reportApi.exportPdf : reportApi.exportCsv;
      const res = await fn({ start_date: startDate, end_date: endDate });
      const url  = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.download = `laporan-${startDate}-sd-${endDate}.${type}`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Laporan ${type.toUpperCase()} berhasil diunduh`);
    } catch {
      toast.error('Gagal mengekspor laporan');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Laporan Penjualan</h1>
          <p className="text-sm text-gray-400">Export laporan dalam format PDF atau CSV</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" loading={exporting === 'pdf'} onClick={() => handleExport('pdf')}
            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}>PDF</Button>
          <Button size="sm" variant="primary" loading={exporting === 'csv'} onClick={() => handleExport('csv')}
            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}>CSV</Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 font-medium">Dari</label>
          <input type="date" value={startDate} max={endDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 font-medium">Sampai</label>
          <input type="date" value={endDate} min={startDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20" />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Pendapatan', value: formatCurrency(summary.total_revenue ?? 0) },
            { label: 'Total Order', value: summary.total_orders ?? 0 },
            { label: 'Order Selesai', value: summary.completed_orders ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['No. Order', 'Tanggal', 'Items', 'Status', 'Total'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8"><SkeletonList count={3} /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon="📊" title="Tidak ada data" description="Ubah rentang tanggal" /></td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.order_number}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(order.created_at)}</td>
                  <td className="px-4 py-3 text-gray-600">{order.items?.length ?? 0} item</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(order.grand_total)}</td>
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
