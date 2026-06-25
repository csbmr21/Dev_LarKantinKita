import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  MegaphoneIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon, 
  FireIcon, 
  WrenchIcon,
  ClockIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

export default function AdminNotifications() {
  const [type, setType] = useState('info');
  const [modal, setModal] = useState(null); // { type: 'detail', notif: obj }
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('Semua User');

  const history = [
    { title:'Maintenance 15 Mar', target:'Semua User', date:'15 Mar 08:00', status:'Terkirim (12.847)' },
    { title:'Fitur Baru: QRIS', target:'Customer', date:'10 Mar 09:00', status:'Terkirim (12.658)' },
    { title:'Update Kebijakan', target:'Merchant', date:'01 Mar 10:00', status:'Terkirim (47)' },
  ];

  return (
    <div className="scroll-area">
      {/* Detail Modal */}
      {modal && modal.type === 'detail' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} className="kk-modal" style={{ maxWidth: 500, width: '90%' }}>
            <div className="panel-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
              <div className="panel-title">Detail Broadcast Notifikasi</div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-400)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Judul</span><span className="metric-val">{modal.notif.title}</span></div>
              <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Target</span><span className="metric-val">{modal.notif.target}</span></div>
              <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Tanggal Dikirim</span><span className="metric-val tx-mono">{modal.notif.date}</span></div>
              <div className="metric-row" style={{ padding: '6px 0' }}><span className="metric-name">Status</span><span className="metric-val"><span className="badge badge-ok">{modal.notif.status}</span></span></div>
              
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary-400)', marginTop: 20, marginBottom: 8 }}>Isi Pesan</div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-200)', lineHeight: '1.6' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sistem kami akan mengalami maintenance pada tanggal {modal.notif.date} untuk peningkatan performa.
              </div>
              
              <div className="kk-modal-btns" style={{ marginTop: 32, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                <button className="btn btn-ghost btn-block" onClick={() => setModal(null)}>Tutup Detail</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{fontSize:16,fontWeight:800,color:'var(--text-100)',marginBottom:12}}>Broadcast Notifikasi</div>
      
      <div className="g2">
        <div className="panel" style={{marginBottom:0}}>
          <div className="panel-header"><div className="panel-title">📢 Kirim Notifikasi</div></div>
          <div className="panel-body" style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="fg" style={{marginBottom:0}}>
              <label className="lbl">Target Penerima</label>
              <select className="input" value={target} onChange={e => setTarget(e.target.value)}>
                <option>Semua User</option>
                <option>Semua Customer</option>
                <option>Semua Merchant</option>
                <option>Semua Staff</option>
                <option>Tenant Tertentu</option>
              </select>
            </div>
            
            <div className="fg" style={{marginBottom:0}}>
              <label className="lbl">Judul Notifikasi</label>
              <input className="input" placeholder="Contoh: Maintenance Terjadwal" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            
            <div className="fg" style={{marginBottom:0}}>
              <label className="lbl">Pesan</label>
              <textarea className="input" style={{height:80,paddingTop:8,resize:'none'}} placeholder="Isi pesan notifikasi..." value={message} onChange={e => setMessage(e.target.value)}></textarea>
            </div>
            
            <div className="fg" style={{marginBottom:0}}>
              <label className="lbl">Jenis</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[
                  { id:'info', label:'Info', icon: <InformationCircleIcon className="w-4 h-4" /> },
                  { id:'warn', label:'Warning', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
                  { id:'promo', label:'Promo', icon: <FireIcon className="w-4 h-4" /> },
                  { id:'maint', label:'Maintenance', icon: <WrenchIcon className="w-4 h-4" /> }
                ].map(t => (
                  <button 
                    key={t.id}
                    className={`btn btn-sm ${type === t.id ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: type === t.id ? 'rgba(82,183,136,0.15)' : 'transparent',
                      color: type === t.id ? 'var(--c-primary-400)' : 'var(--text-300)',
                      border: `1.5px solid ${type === t.id ? 'rgba(82,183,136,0.35)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 'var(--r-full)'
                    }}
                    onClick={() => setType(t.id)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="btn btn-primary btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => {
                if (!title.trim() || !message.trim()) { toast.error('Judul dan pesan wajib diisi'); return; }
                toast.success(`Notifikasi "${title}" berhasil dikirim ke ${target}`);
                setTitle(''); setMessage('');
              }}>
              <MegaphoneIcon className="w-4 h-4" /> Kirim Sekarang
            </button>
          </div>
        </div>
        
        <div className="panel" style={{marginBottom:0}}>
          <div className="panel-header"><div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ListBulletIcon className="w-4 h-4" /> Riwayat Broadcast</div></div>
          <table className="tbl">
            <thead><tr><th>Judul</th><th>Target</th><th>Dikirim</th><th>Status</th></tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setModal({ type: 'detail', notif: h })}>
                  <td className="tx-strong">{h.title}</td>
                  <td>{h.target}</td>
                  <td className="tx-mono">{h.date}</td>
                  <td><span className="badge badge-ok">{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
