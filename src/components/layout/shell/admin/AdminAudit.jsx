import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../../api/admin';
import toast from 'react-hot-toast';
import { 
  DocumentMagnifyingGlassIcon, 
  ArrowDownTrayIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CommandLineIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

const TAG_MAP = {
  danger: { cls: 'at-danger', label: 'DANGER' },
  update: { cls: 'at-update', label: 'UPDATE' },
  system: { cls: 'at-system', label: 'SYSTEM' },
  auto:   { cls: 'at-auto',   label: 'AUTO'   },
  warn:   { cls: 'at-warn',   label: 'WARN'   },
};

const classifyLog = (log) => {
  const action = (log.event ?? log.action ?? log.description ?? '').toLowerCase();
  if (action.includes('delete') || action.includes('suspend') || action.includes('banned')) return 'danger';
  if (action.includes('system') || action.includes('backup') || action.includes('startup')) return 'system';
  if (action.includes('auto') || action.includes('renew') || action.includes('scheduled')) return 'auto';
  return 'update';
};

export default function AdminAudit() {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modal, setModal] = useState(null); // { type: 'detail', log: obj }

  const { data: raw, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminApi.getAuditLogs({ per_page: 50 }).catch(() => []),
    refetchInterval: 15000,
  });
  const logs = unwrapList(raw);

  const filtered = logs.filter(l => {
    const type = classifyLog(l);
    const matchType = typeFilter === 'all' || type === typeFilter;
    const text = (l.description ?? l.event ?? l.action ?? '').toLowerCase();
    const causer = (l.causer?.name ?? l.causer?.email ?? '').toLowerCase();
    const matchText = filter === '' || text.includes(filter.toLowerCase()) || causer.includes(filter.toLowerCase());
    return matchType && matchText;
  });

  return (
    <div className="scroll-area">
      {/* Detail Modal */}
      {modal && modal.type === 'detail' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 650, width: '90%' }}>
            <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
              <div className="panel-title">Detail Audit Log</div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="panel-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Informasi Request</div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Waktu</span><span className="metric-val tx-mono">{modal.log.created_at ? new Date(modal.log.created_at).toLocaleString('id-ID') : '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Action</span><span className="metric-val">{modal.log.event ?? modal.log.action ?? modal.log.description ?? '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">IP Address</span><span className="metric-val tx-mono">{modal.log.properties?.ip ?? modal.log.ip_address ?? '127.0.0.1'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">User Agent</span><span className="metric-val" style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{modal.log.properties?.user_agent ?? modal.log.user_agent ?? 'Mozilla/5.0...'}</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Context / Subjek</div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Causer (User)</span><span className="metric-val">{modal.log.causer?.name ?? modal.log.causer?.email ?? 'System'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Causer ID</span><span className="metric-val tx-mono">{modal.log.causer_id ?? '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Subject Type</span><span className="metric-val tx-mono">{modal.log.subject_type?.split('\\').pop() ?? '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Subject ID</span><span className="metric-val tx-mono">{modal.log.subject_id ?? '—'}</span></div>
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Data Perubahan (Properties)</div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--r-md)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-300)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowX: 'auto', border: '1px solid var(--border-light)' }}>
                {JSON.stringify(modal.log.properties ?? modal.log.changes ?? { message: "No payload properties logged" }, null, 2)}
              </div>
              
              <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                <button className="btn btn-ghost btn-block" onClick={() => setModal(null)}>Tutup Detail</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <DocumentMagnifyingGlassIcon className="w-5 h-5" /> Audit Log
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="badge badge-ok"><span className="badge-dot" />Live</span>
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input" style={{ width: 180, paddingLeft: 32 }} placeholder="Cari log..." value={filter} onChange={e => setFilter(e.target.value)} />
          </div>
          <select className="input" style={{ width: 120 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">Semua Tipe</option>
            <option value="danger">DANGER</option>
            <option value="update">UPDATE</option>
            <option value="system">SYSTEM</option>
            <option value="auto">AUTO</option>
          </select>
          <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={async () => {
              try {
                const res = await adminApi.exportAuditLogs({ type: typeFilter !== 'all' ? typeFilter : undefined, search: filter || undefined });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const a = document.createElement('a');
                a.href = url; a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
                a.click(); window.URL.revokeObjectURL(url);
                toast.success('Audit log berhasil diekspor');
              } catch { toast.error('Gagal mengekspor audit log'); }
            }}>
            <ArrowDownTrayIcon className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CommandLineIcon className="w-4 h-4" /> Log Aktivitas</div>
          <span style={{ fontSize: 11, color: 'var(--text-400)' }}>
            {isLoading ? 'Memuat...' : `${filtered.length} entri`}
          </span>
        </div>
        <div>
          {isLoading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-400)' }}>Memuat audit log...</div>}
          {!isLoading && filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-400)' }}>Tidak ada log</div>
          )}
          {filtered.map((log, i) => {
            const type = classifyLog(log);
            const tm = TAG_MAP[type] ?? TAG_MAP.update;
            const isDanger = type === 'danger';
            const causerName = log.causer?.name ?? log.causer?.email ?? 'System';
            const desc = log.description ?? log.event ?? log.action ?? '';
            const time = log.created_at
              ? new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '--:--:--';
            const model = log.subject_type?.split('\\').pop() ?? '';
            return (
              <div key={log.id ?? i} className={`audit-row${isDanger ? ' danger-row' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setModal({ type: 'detail', log })}>
                <div className="audit-time">{time}</div>
                <div className="audit-msg">
                  <strong>{causerName}</strong>{' '}{desc}
                  {model && <span style={{ color: 'var(--text-400)', fontSize: 10, marginLeft: 4 }}>({model})</span>}
                </div>
                <span className={`audit-tag ${tm.cls}`}>{tm.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
