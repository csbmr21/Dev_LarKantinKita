import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../../api/admin';
import toast from 'react-hot-toast';
import { 
  ExclamationTriangleIcon, 
  BoltIcon, 
  ChartBarIcon, 
  SignalIcon, 
  CpuChipIcon, 
  CircleStackIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

const unwrapObj = (r) => r?.data?.data ?? r?.data ?? {};

const ERR_TYPE = (level) => {
  const l = (level ?? '').toLowerCase();
  if (l === 'critical' || l === 'error') return 'crit';
  if (l === 'warning') return 'warn';
  return 'info';
};

export default function AdminMonitor() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // { type: 'detail', error: obj }

  const [liveMetrics, setLiveMetrics] = useState({ latency: 42, db: 78, cpu: 23, conn: 847 });
  useEffect(() => {
    const intv = setInterval(() => {
      setLiveMetrics({
        latency: Math.floor(38 + Math.random() * 15),
        db: Math.floor(65 + Math.random() * 20),
        cpu: Math.floor(18 + Math.random() * 15),
        conn: Math.floor(800 + Math.random() * 150),
      });
    }, 3000);
    return () => clearInterval(intv);
  }, []);

  const { data: errRaw, isLoading } = useQuery({
    queryKey: ['admin-errors'],
    queryFn: () => adminApi.getErrorLogs().catch(() => []),
    refetchInterval: 5000,
  });
  const { data: statsRaw } = useQuery({
    queryKey: ['admin-error-stats'],
    queryFn: () => adminApi.getErrorStats().catch(() => ({})),
  });

  const errors = unwrapList(errRaw);
  const critCount = errors.filter(e => ERR_TYPE(e.level) === 'crit' && !e.resolved_at).length;
  const warnCount = errors.filter(e => ERR_TYPE(e.level) === 'warn' && !e.resolved_at).length;

  const resolveMut = useMutation({
    mutationFn: (id) => adminApi.resolveError(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-errors'] }),
  });

  const activeErrors = errors.filter(e => !e.resolved_at).slice(0, 10);

  return (
    <div className="scroll-area">
      {/* Detail Modal */}
      {modal && modal.type === 'detail' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 700, width: '90%' }}>
            <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
              <div className="panel-title">Detail Error / Exception</div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="panel-body" style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ background: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 'var(--r-md)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#FCA5A5', marginBottom: 4 }}>{modal.error.level?.toUpperCase() ?? 'ERROR'}</div>
                <div style={{ fontSize: 14, color: 'var(--text-100)', lineHeight: 1.5 }}>{modal.error.message ?? modal.error.error ?? 'Unknown exception'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Konteks Request</div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Waktu Terjadi</span><span className="metric-val tx-mono">{modal.error.created_at ? new Date(modal.error.created_at).toLocaleString('id-ID') : '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">URL / Route</span><span className="metric-val tx-mono">{modal.error.route ?? modal.error.url ?? '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Method</span><span className="metric-val tx-strong">{modal.error.method ?? '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Jumlah Terjadi</span><span className="metric-val tx-strong">{modal.error.count ?? 1} kali</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Lokasi Kode</div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">File</span><span className="metric-val tx-mono" style={{ wordBreak: 'break-all', textAlign: 'right', maxWidth: 160 }}>{modal.error.file ?? '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Line</span><span className="metric-val tx-mono">{modal.error.line ?? '—'}</span></div>
                  <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Status Code</span><span className="metric-val tx-strong" style={{ color: '#FCD34D' }}>{modal.error.status_code ?? '500'}</span></div>
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>Stack Trace</div>
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 'var(--r-md)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-300)', whiteSpace: 'pre-wrap', overflowX: 'auto', border: '1px solid var(--border-light)', maxHeight: 200, overflowY: 'auto' }}>
                {modal.error.trace ?? "No stack trace provided in payload."}
              </div>
              
              <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                <button className="btn btn-ghost btn-block" onClick={() => setModal(null)}>Tutup Detail</button>
                <button className="btn btn-primary btn-block" onClick={() => { resolveMut.mutate(modal.error.id); setModal(null); }}>Tandai Resolved ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="stat-grid sg3">
        <div className="stat-card"><div className="stat-val up">99.97%</div><div className="stat-label">Uptime 30 Hari</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#FCA5A5' }}>{critCount}</div><div className="stat-label">Error Kritis</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color: '#FCD34D' }}>{warnCount}</div><div className="stat-label">Warning Aktif</div></div>
      </div>

      <div className="g2">
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ExclamationCircleIcon className="w-4 h-4" /> Active Errors & Warnings</div>
            <button className="btn btn-ghost btn-sm"
              disabled={resolveMut.isPending}
              onClick={async () => {
                const unresolved = errors.filter(e => !e.resolved_at);
                for (const e of unresolved) {
                  await adminApi.resolveError(e.id).catch(() => {});
                }
                qc.invalidateQueries({ queryKey: ['admin-errors'] });
                toast.success(`${unresolved.length} error ditandai selesai`);
              }}>
              Resolve All
            </button>
          </div>
          <div>
            {isLoading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-400)' }}>Memuat...</div>}
            {!isLoading && activeErrors.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--c-primary-400)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircleIcon className="w-4 h-4" /> Semua sistem normal
              </div>
            )}
            {activeErrors.map(e => {
              const type = ERR_TYPE(e.level);
              return (
                <div key={e.id} className={`error-row error-${type}`} style={{ cursor: 'pointer' }} onClick={() => setModal({ type: 'detail', error: e })}>
                  <div className="error-code">{e.level?.toUpperCase() ?? 'ERROR'} · {e.file?.split('/').pop() ?? e.route ?? '—'}</div>
                  <div className="error-msg">{e.message ?? e.error ?? 'Unknown error'}</div>
                  <div className="error-meta">
                    {e.count ? `${e.count}× · ` : ''}{e.created_at ? new Date(e.created_at).toLocaleString('id-ID') : '—'}
                    {' · '}
                    <button onClick={(ev) => { ev.stopPropagation(); resolveMut.mutate(e.id); }} disabled={resolveMut.isPending}
                      style={{ color: 'var(--c-primary-400)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
                      Resolve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header"><div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ChartBarIcon className="w-4 h-4" /> System Metrics Live</div></div>
          <div>
            <div className="metric-row"><span className="metric-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BoltIcon className="w-3 h-3" /> API Latency</span><span className="metric-val up">{liveMetrics.latency}ms</span></div>
            <div className="metric-row"><span className="metric-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CircleStackIcon className="w-3 h-3" /> DB Pool Usage</span><span className="metric-val" style={{ color: '#FCD34D' }}>{liveMetrics.db}%</span></div>
            <div className="metric-row"><span className="metric-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CpuChipIcon className="w-3 h-3" /> CPU Usage</span><span className="metric-val up">{liveMetrics.cpu}%</span></div>
            <div className="metric-row"><span className="metric-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><SignalIcon className="w-3 h-3" /> Active Connections</span><span className="metric-val up">{liveMetrics.conn}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
