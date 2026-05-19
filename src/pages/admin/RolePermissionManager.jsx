import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheckIcon,
  CheckBadgeIcon,
  ArrowsRightLeftIcon,
  CircleStackIcon,
  DeviceTabletIcon,
  IdentificationIcon,
  KeyIcon,
  InboxStackIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import clsx from 'clsx';

const ACTIONS = ['Read', 'Create', 'Update', 'Delete'];
const RESOURCE_ICONS = {
  Menu: <InboxStackIcon className="w-5 h-5" />,
  Pesanan: <DeviceTabletIcon className="w-5 h-5" />,
  Laporan: <CircleStackIcon className="w-5 h-5" />,
  User: <IdentificationIcon className="w-5 h-5" />,
  Tenant: <CheckBadgeIcon className="w-5 h-5" />,
  Sistem: <ShieldCheckIcon className="w-5 h-5" />,
};

export default function RolePermissionManager() {
  const qc = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [pendingPermissions, setPendingPermissions] = useState([]);

  // 1. Fetch Data
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles-matrix'],
    queryFn: () => adminApi.getRoles().then(r => r.data),
  });

  const { data: permsData, isLoading: permsLoading } = useQuery({
    queryKey: ['admin-permissions-matrix'],
    queryFn: () => adminApi.getPermissions().then(r => r.data),
  });

  const roles = rolesData?.data ?? [];
  const permissionsList = permsData?.data ?? [];

  // 2. Select initial role
  React.useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      const adminRole = roles.find(r => r.slug === 'admin') || roles[0];
      handleRoleChange(adminRole);
    }
  }, [roles]);

  const handleRoleChange = (role) => {
    setSelectedRoleId(role.id);
    setPendingPermissions(role.permissions?.map(p => p.id) || []);
  };

  // 3. Group permissions by resource
  const matrixData = useMemo(() => {
    const grouped = {};
    permissionsList.forEach(p => {
      if (!grouped[p.resource]) grouped[p.resource] = {};
      
      const action = ACTIONS.find(a => p.name.startsWith(a));
      if (action) {
        grouped[p.resource][action] = p;
      }
    });
    return grouped;
  }, [permissionsList]);

  // 4. Mutations
  const syncMutation = useMutation({
    mutationFn: () => adminApi.syncRolePermissions(selectedRoleId, { permissions: pendingPermissions }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles-matrix'] });
      toast.success('Matriks hak akses diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui hak akses'),
  });

  const togglePermission = (id) => {
    setPendingPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleRow = (resource, permissions) => {
    const resourcePermIds = Object.values(permissions).map(p => p.id);
    const allChecked = resourcePermIds.every(id => pendingPermissions.includes(id));

    if (allChecked) {
      setPendingPermissions(prev => prev.filter(id => !resourcePermIds.includes(id)));
    } else {
      setPendingPermissions(prev => [...new Set([...prev, ...resourcePermIds])]);
    }
  };

  if (rolesLoading || permsLoading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const currentRole = roles.find(r => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <KeyIcon className="w-8 h-8 text-[#2D6A4F]" />
            Manajer Otoritas Role
          </h1>
          <p className="text-gray-500 text-sm mt-1">Konfigurasi matriks hak akses untuk setiap peran dalam sistem.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedRoleId || ''} 
            onChange={(e) => handleRoleChange(roles.find(r => r.id === parseInt(e.target.value)))}
            className="rounded-2xl border-gray-100 bg-gray-50 text-sm font-bold px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 transition-all"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name} (@{r.slug})</option>
            ))}
          </select>
          <Button 
            variant="primary" 
            loading={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
            className="shadow-xl shadow-[#2D6A4F]/20"
          >
            Simpan Matriks
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 italic">
                <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-6">Modul / Resource</th>
                {ACTIONS.map(action => (
                  <th key={action} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6 py-6 border-l border-gray-50">
                    {action}
                  </th>
                ))}
                <th className="px-8 border-l border-gray-50"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.entries(matrixData).map(([resource, actions]) => {
                const resourcePermIds = Object.values(actions).map(p => p.id);
                const allChecked = resourcePermIds.every(id => pendingPermissions.includes(id));

                return (
                  <tr key={resource} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                          allChecked ? "bg-[#2D6A4F] text-white rotate-6" : "bg-gray-100 text-gray-400 group-hover:rotate-3"
                        )}>
                          {RESOURCE_ICONS[resource] || <ShieldCheckIcon className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-base leading-none">{resource}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1.5">Module</p>
                        </div>
                      </div>
                    </td>
                    
                    {ACTIONS.map(action => {
                      const permission = actions[action];
                      if (!permission) return (
                        <td key={action} className="text-center border-l border-gray-50 px-4">
                          <div className="w-8 h-1 bg-gray-100 mx-auto rounded-full opacity-30" />
                        </td>
                      );
                      
                      const isChecked = pendingPermissions.includes(permission.id);

                      return (
                        <td key={action} className="text-center border-l border-gray-50 px-4">
                          <button
                            type="button"
                            onClick={() => togglePermission(permission.id)}
                            className={clsx(
                              "relative inline-flex items-center justify-center w-10 h-10 rounded-2xl cursor-pointer transition-all duration-300",
                              isChecked 
                                ? "bg-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/30 scale-105" 
                                : "bg-gray-100 text-gray-300 hover:bg-gray-200 hover:text-gray-400"
                            )}
                          >
                            <svg className={clsx("w-5 h-5 transition-transform duration-300", isChecked ? "scale-100" : "scale-0 opacity-0")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {!isChecked && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />}
                          </button>
                        </td>
                      );
                    })}
                    
                    <td className="text-right px-8 border-l border-gray-50">
                      <button 
                        onClick={() => toggleRow(resource, actions)}
                        className={clsx(
                          "text-[10px] font-black uppercase tracking-tighter italic transition-all px-3 py-1.5 rounded-lg border",
                          allChecked 
                            ? "text-red-500 border-red-100 bg-red-50 hover:bg-red-100" 
                            : "text-[#2D6A4F] border-[#2D6A4F]/20 bg-[#2D6A4F]/5 hover:bg-[#2D6A4F]/10"
                        )}
                      >
                        {allChecked ? 'Batal Semua' : 'Centang Semua'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#2D6A4F]/20 relative overflow-hidden group/card">
          <ArrowsRightLeftIcon className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12 group-hover/card:scale-110 group-hover/card:rotate-0 transition-transform duration-700" />
          <h3 className="text-lg font-bold">Ringkasan Konfigurasi</h3>
          <p className="text-sm text-white/60 mt-2">Peran <span className="text-yellow-400 font-bold underline decoration-yellow-400/30 underline-offset-4">{currentRole?.name}</span> saat ini memiliki akses ke:</p>
          <div className="mt-8 flex items-center gap-4">
            <div className="text-4xl font-black">{pendingPermissions.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/50 leading-tight">
              Hak Akses<br/>Telah Diberikan
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="warning" className="bg-white/10 text-white border-white/20 px-3 py-1 text-[10px]">
              {pendingPermissions.length}/{permissionsList.length} Total Kapasitas
            </Badge>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100/50 flex items-start gap-6">
          <div className="p-4 bg-blue-500 rounded-[1.5rem] text-white shadow-xl shadow-blue-500/20 rotate-3 animate-pulse">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-blue-900 font-black italic uppercase tracking-[0.2em] text-[10px]">Pusat Bantuan Otoritas</h3>
            <p className="text-blue-800/70 text-sm mt-4 leading-relaxed font-medium">
              Matriks ini mengontrol akses pengguna di tingkat aplikasi. <br/>
              <span className="text-blue-900/40">•</span> Pilih <strong>Role</strong> untuk memuat konfigurasi saat ini.<br/>
              <span className="text-blue-900/40">•</span> Gunakan <strong>Centang Semua</strong> untuk memberikan akses penuh per modul.<br/>
              <span className="text-blue-900/40">•</span> Klik <strong>Simpan Matriks</strong> untuk menerapkan perubahan secara instan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
