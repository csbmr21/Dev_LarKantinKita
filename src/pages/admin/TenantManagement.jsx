import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../../api/tenant';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { 
  BuildingStorefrontIcon, 
  MapPinIcon, 
  UserCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  HashtagIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function TenantManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants', { query, status, page }],
    queryFn: () => tenantApi.adminGetTenants({ search: query || undefined, status: status || undefined, page }).then((r) => r.data),
  });

  const tenants    = data?.data?.data ?? [];
  const meta       = data?.data ?? {};

  const toggleMutation = useMutation({
    mutationFn: tenantApi.adminToggleTenant,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-tenants'] }); 
      toast.success('Status tenant diperbarui'); 
    },
    onError: () => toast.error('Gagal memperbarui status'),
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BuildingStorefrontIcon className="w-8 h-8 text-[#2D6A4F]" />
            Manajemen Tenant
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ditemukan <span className="text-[#2D6A4F] font-bold">{meta.total ?? 0}</span> mitra kantin yang terdaftar dalam ekosistem.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-4 py-2 bg-[#2D6A4F]/5 rounded-2xl border border-[#2D6A4F]/10">
              <p className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-widest">Sistem Aktif</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse" />
                <span className="text-xs font-bold text-gray-700">UNIV Campus Network</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1); }} 
          className="flex-1 relative group"
        >
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2D6A4F] transition-colors" />
          <input 
            type="search" 
            placeholder="Cari berdasarkan nama tenant atau owner..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-white text-sm focus:ring-4 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] transition-all outline-none font-medium shadow-sm" 
          />
        </form>
        <div className="flex gap-2">
          {['', '1', '0'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={clsx(
                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                status === s 
                  ? "bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/20" 
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              )}
            >
              {s === '' ? 'Semua' : s === '1' ? 'Aktif' : 'Non-aktif'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12"><SkeletonList count={5} /></div>
        ) : tenants.length === 0 ? (
          <EmptyState icon="🏪" title="Tenant tidak ditemukan" description="Coba sesuaikan kata kunci atau filter pencarian Anda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 italic">
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-6">Profil Bisnis</th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6 py-6 border-l border-gray-50">Pengelola</th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6 py-6 border-l border-gray-50 text-center">Metrik & Billing</th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6 py-6 border-l border-gray-50 text-center">Status</th>
                  <th className="px-8 border-l border-gray-50"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.map((tenant) => {
                  const isTrial = tenant.trial_ends_at && new Date(tenant.trial_ends_at) > new Date();
                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className={clsx(
                            "w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-sm relative overflow-hidden shrink-0",
                            tenant.status ? "bg-[#2D6A4F]/10 text-[#2D6A4F]" : "bg-gray-100 text-gray-400"
                          )}>
                             <BuildingStorefrontIcon className="w-8 h-8" />
                             {tenant.is_open && (
                               <div className="absolute bottom-0 inset-x-0 bg-[#2D6A4F] h-1.5 animate-pulse" />
                             )}
                          </div>
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
                               <h3 className="font-black text-gray-900 text-lg leading-none tracking-tight group-hover:text-[#2D6A4F] transition-colors">
                                 {tenant.tenant_name}
                               </h3>
                               <span className="font-mono text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold tracking-widest uppercase">
                                 {tenant.company_code}
                               </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-xs text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                {tenant.address || 'Alamat belum disetel'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <CalendarDaysIcon className="w-3.5 h-3.5 text-[#2D6A4F]/40" />
                              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest italic leading-none">
                                Bergabung {formatDate(tenant.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 border-l border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                            <UserCircleIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-none">{tenant.owner?.full_name || 'No Owner'}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">@{tenant.owner?.username || 'unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 border-l border-gray-50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-10">
                            <div className="flex items-center gap-2">
                              <BanknotesIcon className="w-4 h-4 text-[#2D6A4F]" />
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Min. Order</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900">{formatCurrency(tenant.min_order)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-10">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Paket</span>
                            <Badge variant={tenant.subscription?.status === 'active' ? 'success' : 'gray'} className="text-[9px] px-2 py-0.5 border-none uppercase font-black italic">
                              {tenant.subscription?.plan ?? 'Free Plan'}
                            </Badge>
                          </div>
                          {isTrial && (
                             <div className="flex items-center justify-between gap-10">
                               <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Masa Trial</span>
                               <span className="text-[9px] font-black text-amber-600 italic">Aktif</span>
                             </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 border-l border-gray-50 text-center">
                        <Badge variant={tenant.status ? 'success' : 'gray'} dot className="text-[10px] font-black tracking-widest uppercase py-1 border-none bg-transparent">
                          {tenant.status ? 'Terverifikasi' : 'Non-aktif'}
                        </Badge>
                        <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">Health Level: {tenant.status ? '100%' : '0%'}</p>
                      </td>
                      <td className="px-8 py-6 border-l border-gray-50 text-right min-w-[200px]">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest py-2.5 px-4 shadow-sm transition-colors"
                          >
                            Detail
                          </button>
                          <Button 
                            size="xs" 
                            variant={tenant.status ? 'danger' : 'primary'}
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest py-2.5 px-4 shadow-sm"
                            loading={toggleMutation.isPending}
                            onClick={() => toggleMutation.mutate(tenant.id)}
                          >
                            {tenant.status ? 'Suspend' : 'Aktifkan'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.last_page > 1 && (
        <div className="flex justify-center pt-8">
          <Pagination 
            currentPage={page} 
            totalPages={meta.last_page} 
            onPageChange={setPage}
            totalItems={meta.total} 
            perPage={meta.per_page} 
          />
        </div>
      )}

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTenant(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-[#2D6A4F] text-white p-8 relative">
              <button 
                onClick={() => setSelectedTenant(null)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
                   <BuildingStorefrontIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedTenant.tenant_name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={selectedTenant.status ? 'success' : 'danger'} dot className="text-[10px] uppercase font-black bg-white/20 text-white border-none py-1">
                      {selectedTenant.status ? 'Aktif' : 'Suspend'}
                    </Badge>
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-80">
                      Bergabung {formatDate(selectedTenant.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Info Kantin */}
                <div className="space-y-6">
                  <div>
                     <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <BuildingStorefrontIcon className="w-4 h-4" /> Informasi Bisnis
                     </h3>
                     <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Company Code</p>
                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                             <HashtagIcon className="w-4 h-4 text-[#2D6A4F]" />
                             <span className="font-mono font-bold text-gray-900 tracking-widest text-lg">{selectedTenant.company_code}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 italic">Kode ini digunakan staff/owner untuk login ke sistem.</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Minimum Order</p>
                          <p className="font-bold text-gray-900">{formatCurrency(selectedTenant.min_order)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Alamat Outlet</p>
                          <p className="text-sm font-medium text-gray-700">{selectedTenant.address || '-'}</p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Info Pemilik */}
                <div className="space-y-6">
                  <div>
                     <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <UserCircleIcon className="w-4 h-4" /> Informasi Pengelola
                     </h3>
                     <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 border border-gray-200">
                            <UserCircleIcon className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{selectedTenant.owner?.full_name}</p>
                            <p className="text-xs text-gray-500 font-mono">@{selectedTenant.owner?.username}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200 space-y-3">
                          <div className="flex items-center gap-3">
                            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700">{selectedTenant.owner?.email || '-'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700">{selectedTenant.owner?.phone || '-'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <IdentificationIcon className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700">{selectedTenant.owner?.no_ktp || 'Belum diisi'}</p>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>

              </div>
              
              <div className="mt-8 flex justify-end">
                 <button
                   onClick={() => setSelectedTenant(null)}
                   className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
                 >
                   Tutup
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

