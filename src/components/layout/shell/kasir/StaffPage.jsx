import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantApi } from '../../../../api/tenant';
import { unwrap } from '../../../../utils/api';

export default function StaffPage() {
  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staff-list-kasir'],
    queryFn: () => tenantApi.getStaffListForStaff().then(unwrap),
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar bg-[#F9FAFB] animate-fadeIn">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-[#F0FBF3] rounded-[22px] flex items-center justify-center text-2xl">👥</div>
          <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Staff Hari Ini</p><p className="text-2xl font-black text-gray-900 leading-none">{staffList.length} Staff</p></div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-[22px] flex items-center justify-center text-2xl">✅</div>
          <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Shift Aktif</p><p className="text-2xl font-black text-gray-900 leading-none">{staffList.filter(s => s.status === 'active').length} Aktif</p></div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 rounded-[22px] flex items-center justify-center text-2xl">⏰</div>
          <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Role User</p><p className="text-2xl font-black text-gray-900 leading-none">Staff</p></div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex-1">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <span className="text-[12px] font-black text-[#081C0F] uppercase tracking-[0.15em]">Daftar Rekan Staff</span>
        </div>
        <div className="p-6">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead><tr className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4"><th className="px-6 py-2">Nama</th><th className="px-6 py-2">Jabatan</th><th className="px-6 py-2">Email</th><th className="px-6 py-2 text-center">Status</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={4} className="text-center py-10 animate-pulse text-gray-400 font-bold">Memuat data staff...</td></tr> : staffList.length === 0 ? <tr><td colSpan={4} className="text-center py-10 text-gray-400 font-bold">Tidak ada data staff.</td></tr> :
                staffList.map(s => (
                  <tr key={s.id} className="bg-white hover:bg-gray-50/80 transition-all shadow-sm border border-gray-100">
                    <td className="px-6 py-4 rounded-l-2xl border-y border-l border-gray-50 font-black text-gray-900 text-[13px]">{s.full_name || s.name}</td>
                    <td className="px-6 py-4 border-y border-gray-50 text-[11px] font-bold text-gray-400 uppercase">{s.role || 'Staff'}</td>
                    <td className="px-6 py-4 border-y border-gray-50 text-[11px] font-bold text-gray-400">{s.email}</td>
                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-50 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${s.status === 'active' || s.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {s.status === 'active' || s.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
