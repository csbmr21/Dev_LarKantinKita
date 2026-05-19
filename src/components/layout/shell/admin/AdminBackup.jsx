import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '../../../../api/report';

const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

export default function AdminBackup() {
  const qc = useQueryClient();
  const [toggles, setToggles] = useState({ daily: true, incremental: true });
  const [modal, setModal] = useState(null); // { type: 'detail'|'restore', backup: obj }
  const toggle = (k) => setToggles(t => ({ ...t, [k]: !t[k] }));

  const { data: raw, isLoading } = useQuery({
    queryKey: ['admin-backups'],
    queryFn: () => reportApi.getBackups().catch(() => []),
  });

  const backups = unwrapList(raw);

  const createMut = useMutation({
    mutationFn: () => reportApi.createBackup(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-backups'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (filename) => reportApi.deleteBackup(filename),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-backups'] }),
  });

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes > 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    return (bytes / 1e3).toFixed(0) + ' KB';
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const isFullBackup = (b) =>
    (b.type ?? b.filename ?? '').toLowerCase().includes('full');

  // Display real or placeholder
  const displayBackups = backups.length > 0 ? backups : [
    { filename: 'backup_full_20260315_093000.sql', type: 'full', size: 2400000000, created_at: '2026-03-15T09:30:00Z' },
    { filename: 'backup_full_20260314_093000.sql', type: 'full', size: 2300000000, created_at: '2026-03-14T09:30:00Z' },
    { filename: 'backup_incr_20260315_060000.sql', type: 'incr', size: 120000000, created_at: '2026-03-15T06:00:00Z' },
    { filename: 'backup_incr_20260314_180000.sql', type: 'incr', size: 98000000,  created_at: '2026-03-14T18:00:00Z' },
    { filename: 'backup_incr_20260314_060000.sql', type: 'incr', size: 87000000,  created_at: '2026-03-14T06:00:00Z' },
    { filename: 'backup_full_20260313_093000.sql', type: 'full', size: 2200000000, created_at: '2026-03-13T09:30:00Z' },
  ];

  return (
    <div className="scroll-area">
      {/* Modals */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          
          {modal.type === 'detail' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 500, width: '90%' }}>
              <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
                <div className="panel-title">Detail Berkas Backup</div>
                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Nama File</span><span className="metric-val tx-mono">{modal.backup.filename}</span></div>
                <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Tipe Backup</span><span className="metric-val">{isFullBackup(modal.backup) ? 'FULL BACKUP' : 'INCREMENTAL'}</span></div>
                <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Ukuran</span><span className="metric-val tx-strong">{formatSize(modal.backup.size)}</span></div>
                <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Waktu Dibuat</span><span className="metric-val tx-mono">{formatDate(modal.backup.created_at)}</span></div>
                <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Trigger</span><span className="metric-val">{modal.backup.type === 'manual' ? 'Manual (User)' : 'Otomatis (Sistem)'}</span></div>
                
                <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                  <button className="btn-cancel" onClick={() => setModal(null)}>Tutup Detail</button>
                  {isFullBackup(modal.backup) && <button className="btn-danger-outline" onClick={() => setModal({ type: 'restore', backup: modal.backup })}>🔄 Restore Ini</button>}
                </div>
              </div>
            </div>
          )}

          {modal.type === 'restore' && (
            <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 450, width: '90%' }}>
              <div className="kk-modal-icon danger">!</div>
              <div className="kk-modal-title">Konfirmasi Restore Database</div>
              <div className="kk-modal-body" style={{ textAlign: 'center', margin: '16px 0' }}>
                <div style={{ color: 'var(--text-100)', fontWeight: 600, marginBottom: 8 }}>Anda yakin ingin me-restore dari backup:</div>
                <div className="tx-mono" style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 6, color: '#FCA5A5' }}>{modal.backup.filename}</div>
                <div style={{ fontSize: 11, color: 'var(--text-400)', marginTop: 12, lineHeight: 1.5 }}>
                  Tindakan ini akan <strong>menghapus seluruh data produksi saat ini</strong> dan menggantinya dengan snapshot data pada {formatDate(modal.backup.created_at)}. 
                  <br/><br/>Tindakan ini <b>TIDAK DAPAT DIBATALKAN</b>.
                </div>
              </div>
              <div className="kk-modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Batal</button>
                <button className="btn-confirm danger" onClick={() => { alert('Restore in progress (simulated)...'); setModal(null); }}>Ya, Restore Sekarang</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-100)' }}>Backup & Restore</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm">📅 Jadwal</button>
          <button className="btn btn-primary" onClick={() => createMut.mutate()} disabled={createMut.isPending}>
            {createMut.isPending ? '⏳ Running...' : '▶ Run Now'}
          </button>
        </div>
      </div>

      <div className="g2">
        {/* Backup list */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">💾 Riwayat Backup ({displayBackups.length})</div>
            {isLoading && <span style={{ fontSize: 11, color: 'var(--text-400)' }}>Memuat...</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: 12 }}>
            {displayBackups.map((b, i) => {
              const full = isFullBackup(b);
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--border-main)', borderRadius: 'var(--r-md)', padding: 10, position: 'relative', cursor: 'pointer', transition: 'border 0.2s' }} onClick={() => setModal({ type: 'detail', backup: b })} onMouseOver={(e)=>e.currentTarget.style.border='1px solid var(--c-primary-500)'} onMouseOut={(e)=>e.currentTarget.style.border='1px solid var(--border-main)'}>
                  {full
                    ? <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-primary-400)', marginBottom: 3 }}>✓ FULL</div>
                    : <div style={{ fontSize: 10, fontWeight: 800, color: '#93C5FD', marginBottom: 3 }}>⚡ INCR</div>
                  }
                  <div style={{ fontSize: 11, color: 'var(--text-100)', fontWeight: 600, marginBottom: 2 }}>{formatDate(b.created_at)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-400)' }}>{formatSize(b.size)} · {b.type === 'manual' ? 'Manual' : 'Auto'}</div>
                  {b.filename && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMut.mutate(b.filename); }}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,.4)', fontSize: 12, padding: 2 }}
                      title="Hapus"
                    >✕</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Config */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header"><div className="panel-title">⚙️ Backup Configuration</div></div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>Full Backup Harian</div>
                <div style={{ fontSize: 11, color: 'var(--text-400)' }}>Setiap hari jam 03:00</div>
              </div>
              <button className={`toggle ${toggles.daily ? 'on' : 'off'}`} onClick={() => toggle('daily')} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>Incremental Backup (6 jam)</div></div>
              <button className={`toggle ${toggles.incremental ? 'on' : 'off'}`} onClick={() => toggle('incremental')} />
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="lbl">Retensi Backup (hari)</label>
              <input className="input" type="number" defaultValue="30" />
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="lbl">Enkripsi</label>
              <select className="input"><option>AES-256</option><option>AES-128</option></select>
            </div>
            <div className="metric-row" style={{ padding: 0 }}>
              <span className="metric-name" style={{ fontSize: 11 }}>Storage Backup</span>
              <span className="metric-val up" style={{ fontSize: 11 }}>
                {displayBackups.reduce((a, b) => a + (b.size || 0), 0) > 0
                  ? (displayBackups.reduce((a, b) => a + (b.size || 0), 0) / 1e9).toFixed(1) + ' GB'
                  : '12.4 GB'
                } / 100 GB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restore */}
      <div className="panel" style={{ marginTop: 12, marginBottom: 0 }}>
        <div className="panel-header"><div className="panel-title">🔄 Restore Database</div></div>
        <div className="panel-body">
          <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 'var(--r-md)', padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FCA5A5', marginBottom: 4 }}>⚠️ PERHATIAN</div>
            <div style={{ fontSize: 11, color: 'var(--text-300)' }}>Restore akan menimpa SEMUA data produksi. Proses ini tidak bisa dibatalkan.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="input" style={{ flex: 1 }}>
              <option>Pilih backup untuk restore...</option>
              {displayBackups.filter(b => isFullBackup(b)).map((b, i) => (
                <option key={i}>✓ FULL — {formatDate(b.created_at)} ({(b.size / 1e9).toFixed(1)} GB)</option>
              ))}
            </select>
            <button className="btn btn-danger-outline">🔄 Restore</button>
          </div>
        </div>
      </div>
    </div>
  );
}
