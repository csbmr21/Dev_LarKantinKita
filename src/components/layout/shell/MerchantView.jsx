import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { orderApi } from '../../../api/order';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

/* ── OVERVIEW ────────────────────────────────────── */
function OverviewPage() {
  const { data: reportData } = useQuery({
    queryKey: ['owner-report'],
    queryFn: () => import('../../../api/report').then(m =>
      m.reportApi?.getDaily?.() ?? Promise.resolve({ data: {} })
    ).catch(() => ({ data: {} })),
  });

  const stats = reportData?.data ?? {};
  const BAR_HEIGHTS = [28, 52, 78, 95, 100, 88, 45];
  const DAYS = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];

  return (
    <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:16}}>
      {/* KPI Row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[
          { label:'Total Pendapatan', value: fmt(stats.total_revenue ?? 0), icon:'💰', grad:true },
          { label:'Total Pesanan',    value: stats.total_orders ?? 0,       icon:'📋', grad:true },
          { label:'Rating Rata-rata', value: `${stats.avg_rating ?? '—'} ⭐`,icon:'⭐', grad:true },
        ].map((s,i) => (
          <div key={i} className="stat-card-gradient" style={{display:'flex',flexDirection:'column',gap:6}}>
            <span style={{fontSize:22}}>{s.icon}</span>
            <p style={{fontSize:28,fontWeight:800,color:'white',letterSpacing:'-1px',lineHeight:1}}>{s.value}</p>
            <p style={{fontSize:'var(--text-xs)',color:'rgba(255,255,255,0.7)'}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart 7 Hari */}
      <div style={{background:'white',border:'1.5px solid var(--c-neutral-100)',borderRadius:'var(--r-lg)',padding:20}}>
        <p style={{fontSize:'var(--text-sm)',fontWeight:700,marginBottom:16}}>Pendapatan 7 Hari Terakhir</p>
        <div style={{display:'flex',alignItems:'flex-end',gap:6,height:120}}>
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <div style={{width:'100%',height:`${h}%`,background:i===4?'var(--c-primary-500)':'var(--c-primary-200)',borderRadius:'3px 3px 0 0',transition:'opacity .2s',cursor:'pointer'}} title={`${DAYS[i]}: ${h}%`}/>
              <span style={{fontSize:9,fontWeight:600,color:'var(--c-neutral-500)'}}>{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Menu */}
      <div style={{background:'white',border:'1.5px solid var(--c-neutral-100)',borderRadius:'var(--r-lg)',padding:20}}>
        <p style={{fontSize:'var(--text-sm)',fontWeight:700,marginBottom:12}}>Menu Terlaris</p>
        {(stats.top_menus ?? [{name:'Nasi Ayam',count:48},{name:'Es Teh',count:36},{name:'Bakso',count:29}]).map((m,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,paddingBottom:10,marginBottom:10,borderBottom:i<2?'1px solid var(--c-neutral-100)':'none'}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:i===0?'var(--c-amber-100)':'var(--c-primary-100)',color:i===0?'var(--c-amber-600)':'var(--c-primary-800)',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{i+1}</div>
            <div style={{flex:1}}>
              <p style={{fontSize:'var(--text-sm)',fontWeight:600,marginBottom:4}}>{m.name}</p>
              <div style={{height:4,background:'var(--c-neutral-100)',borderRadius:2}}>
                <div style={{height:'100%',width:`${Math.round((m.count/48)*100)}%`,background:'var(--c-primary-500)',borderRadius:2}}/>
              </div>
            </div>
            <span style={{fontSize:'var(--text-xs)',fontWeight:700,color:'var(--c-neutral-600)'}}>{m.count}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── LIVE ORDERS ─────────────────────────────────── */
function LiveOrdersPage() {
  const { data: rawOrders = [] } = useQuery({
    queryKey: ['owner-live-orders'],
    queryFn: () => orderApi.getOwnerOrders({ status: 'active' }).then(r => {
      const d = r?.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.data)) return d.data;
      if (Array.isArray(d?.data?.data)) return d.data.data;
      return [];
    }).catch(()=>[]),
    refetchInterval: 10000,
  });
  const orders = Array.isArray(rawOrders) ? rawOrders : [];

  const waiting = orders.filter(o => o.status === 'pending').length;
  const cooking = orders.filter(o => ['accepted','cooking'].includes(o.status)).length;
  const ready   = orders.filter(o => o.status === 'ready').length;

  const STATUS_STYLE = {
    pending:  { bg:'var(--c-blue-100)',    color:'var(--c-blue-600)',    label:'Menunggu' },
    accepted: { bg:'var(--c-amber-100)',   color:'var(--c-amber-700)',   label:'Diterima' },
    cooking:  { bg:'var(--c-amber-100)',   color:'var(--c-amber-700)',   label:'Dimasak'  },
    ready:    { bg:'var(--c-primary-100)', color:'var(--c-primary-700)', label:'Siap'     },
  };

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      <div style={{padding:'12px 20px',background:'white',borderBottom:'1px solid var(--color-border)',display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
        <span className="live-dot"/><span style={{fontSize:'var(--text-sm)',fontWeight:700}}>Live Orders</span>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginLeft:'auto',minWidth:300}}>
          {[['Menunggu',waiting,'var(--c-blue-100)','var(--c-blue-600)'],['Dimasak',cooking,'var(--c-amber-100)','var(--c-amber-700)'],['Siap',ready,'var(--c-primary-100)','var(--c-primary-700)']].map(([l,v,bg,c])=>(
            <div key={l} style={{textAlign:'center',padding:'8px',background:bg,borderRadius:'var(--r-md)'}}>
              <p style={{fontSize:24,fontWeight:800,color:c}}>{v}</p>
              <p style={{fontSize:10,fontWeight:600,color:c}}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:16,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,alignContent:'start'}}>
        {orders.length === 0 && (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:40,color:'var(--c-neutral-400)'}}>
            <p style={{fontSize:32,marginBottom:8}}>☕</p>
            <p style={{fontWeight:600}}>Tidak ada pesanan aktif</p>
          </div>
        )}
        {orders.map(o => {
          const ss = STATUS_STYLE[o.status] ?? STATUS_STYLE.pending;
          return (
            <div key={o.id} style={{background:'white',border:'1px solid var(--color-border)',borderRadius:'var(--r-lg)',padding:14,boxShadow:'var(--shadow-xs)',animation:'fadeIn .3s ease'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--c-neutral-400)'}}>{o.order_code ?? `#${o.id}`}</span>
                <span style={{padding:'4px 8px',borderRadius:'var(--r-sm)',fontSize:11,fontWeight:700,background:ss.bg,color:ss.color}}>{ss.label}</span>
              </div>
              <p style={{fontSize:'var(--text-sm)',fontWeight:700,marginBottom:4}}>{o.customer?.name ?? o.user?.full_name ?? 'Pelanggan'}</p>
              <p style={{fontSize:11,color:'var(--c-neutral-500)',lineHeight:1.4,marginBottom:8}}>
                {o.items?.map(i=>`${i.name} ×${i.quantity}`).join(', ') ?? '—'}
              </p>
              <p style={{fontSize:13,fontWeight:800,color:'var(--c-primary-700)'}}>{fmt(o.total_amount)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── FINANCE ─────────────────────────────────────── */
function FinancePage() {
  return (
    <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:16}}>
      {/* Hero Card */}
      <div style={{background:'linear-gradient(135deg,var(--c-primary-800),var(--c-primary-600))',borderRadius:'var(--r-xl)',padding:24,color:'white',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:20,bottom:-8,fontSize:80,opacity:.1}}>💰</div>
        <p style={{fontSize:'var(--text-sm)',opacity:.7,marginBottom:4}}>Saldo Tersedia</p>
        <p style={{fontSize:36,fontWeight:800,letterSpacing:'-1px'}}>Rp 2.450.000</p>
        <div style={{display:'flex',gap:24,marginTop:16}}>
          {[['Total Bulan Ini','Rp 8.120.000'],['Penarikan','Rp 5.670.000']].map(([l,v])=>(
            <div key={l}><p style={{fontSize:10,opacity:.6}}>{l}</p><p style={{fontSize:'var(--text-sm)',fontWeight:700}}>{v}</p></div>
          ))}
        </div>
      </div>
      {/* Withdraw */}
      <div style={{background:'white',border:'1.5px solid var(--c-neutral-100)',borderRadius:'var(--r-lg)',padding:16,display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:44,height:28,borderRadius:6,background:'var(--c-primary-700)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:10,fontWeight:800}}>BCA</div>
        <div style={{flex:1}}>
          <p style={{fontSize:'var(--text-sm)',fontWeight:700}}>BCA ••••3456</p>
          <p style={{fontSize:'var(--text-xs)',color:'var(--c-neutral-500)'}}>Rekening Utama</p>
        </div>
        <button className="btn-primary">Tarik Dana</button>
      </div>
    </div>
  );
}

/* ── SUBSCRIPTION ────────────────────────────────── */
function SubscriptionPage() {
  const PLANS = [
    { name:'Starter', price:99000,  features:['1 Kasir','50 Menu','Laporan Harian','Email Support'], featured:false },
    { name:'Pro',     price:249000, features:['5 Kasir','Unlimited Menu','Analytics Lanjutan','Priority Support','Custom Domain'], featured:true },
    { name:'Business',price:499000, features:['Unlimited Kasir','Unlimited Menu','API Access','Dedicated Support','SLA 99.9%'], featured:false },
  ];
  return (
    <div style={{flex:1,overflowY:'auto',padding:20}}>
      <p style={{fontSize:'var(--text-2xl)',fontWeight:800,marginBottom:4}}>Pilih Paket</p>
      <p style={{fontSize:'var(--text-sm)',color:'var(--c-neutral-500)',marginBottom:20}}>Tingkatkan fitur usaha kantin Anda</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {PLANS.map((p) => (
          <div key={p.name} style={{position:'relative',background:p.featured?'var(--c-primary-50)':'white',border:`${p.featured?2:1.5}px solid ${p.featured?'var(--c-primary-600)':'var(--c-neutral-100)'}`,borderRadius:'var(--r-xl)',padding:24}}>
            {p.featured && (
              <div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:'var(--c-primary-700)',color:'white',fontSize:10,fontWeight:700,padding:'2px 10px',borderRadius:'var(--r-full)',whiteSpace:'nowrap'}}>Paling Populer</div>
            )}
            <p style={{fontSize:'var(--text-lg)',fontWeight:800,marginBottom:4}}>{p.name}</p>
            <p style={{fontSize:28,fontWeight:800,color:'var(--c-primary-700)',letterSpacing:'-1px',marginBottom:16}}>{fmt(p.price)}<span style={{fontSize:'var(--text-xs)',fontWeight:500,color:'var(--c-neutral-500)'}}>/bln</span></p>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
              {p.features.map((f,i) => (
                <p key={i} style={{fontSize:'var(--text-sm)',display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{color:'var(--c-emerald-500)',fontWeight:700}}>✓</span> {f}
                </p>
              ))}
            </div>
            <button style={{width:'100%',height:40,background:p.featured?'var(--c-primary-700)':'white',color:p.featured?'white':'var(--c-primary-700)',border:`1.5px solid var(--c-primary-${p.featured?'700':'200'})`,borderRadius:'var(--r-md)',fontWeight:700,fontSize:'var(--text-sm)',cursor:'pointer',fontFamily:'var(--font-sans)'}}>
              {p.featured?'Mulai Sekarang':'Pilih Paket'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN MerchantView ───────────────────────────── */
const NAV_ITEMS = [
  { id:'overview',     label:'Overview',      icon:'📊', section:'UTAMA'    },
  { id:'live-orders',  label:'Live Orders',   icon:'🔴', section:'UTAMA'    },
  { id:'finance',      label:'Keuangan',      icon:'💰', section:'LAPORAN'  },
  { id:'subscription', label:'Langganan',     icon:'⭐', section:'AKUN'     },
];

export default function MerchantView() {
  const { user } = useAuthStore();
  const [page, setPage] = useState('overview');
  const [isOpen, setIsOpen] = useState(true);

  const initials = user?.full_name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() ?? 'OW';
  const tenantName = user?.tenant?.name ?? 'Toko Saya';

  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];

  return (
    <div style={{display:'flex',height:'calc(100vh - 44px)',overflow:'hidden',width:'100%'}}>
      {/* Sidebar */}
      <div className="kk-sidebar" style={{background:'#0E1F14'}}>
        <div className="kk-sidebar-header">
          <div className="kk-sidebar-logo">🏪</div>
          <div style={{minWidth:0,flex:1}}>
            <p className="kk-sidebar-brand" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tenantName}</p>
            <p className="kk-sidebar-tenant">Merchant / Owner</p>
          </div>
          <div style={{width:7,height:7,borderRadius:'50%',background:isOpen?'var(--c-emerald-500)':'var(--c-neutral-500)',boxShadow:isOpen?'0 0 6px var(--c-emerald-500)':'none',flexShrink:0}}/>
        </div>

        <nav className="kk-sidebar-nav">
          {sections.map(sec => (
            <React.Fragment key={sec}>
              <p className="kk-nav-section">{sec}</p>
              {NAV_ITEMS.filter(n=>n.section===sec).map(n => (
                <button key={n.id} className={`kk-nav-item ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}>
                  <span style={{fontSize:16}}>{n.icon}</span> {n.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="kk-sidebar-footer">
          <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'white'}}>{initials}</div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:'var(--text-xs)',fontWeight:600,color:'rgba(255,255,255,0.8)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.full_name ?? 'Owner'}</p>
            <p style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>Owner</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="kk-main" style={{background:'var(--c-neutral-50)'}}>
        <div className="kk-topbar">
          <div>
            <p className="kk-topbar-title">{NAV_ITEMS.find(n=>n.id===page)?.label}</p>
            <p className="kk-topbar-sub">{new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
          <div className="kk-topbar-right">
            <span className={`pill ${isOpen?'pill-success':'pill-danger'}`}>● Toko {isOpen?'Buka':'Tutup'}</span>
            <button className="btn-amber-outline" onClick={()=>setIsOpen(o=>!o)}>{isOpen?'Tutup Toko':'Buka Toko'}</button>
          </div>
        </div>

        <div className={`kk-subpage ${page==='overview'?'active':''}`}><OverviewPage/></div>
        <div className={`kk-subpage ${page==='live-orders'?'active':''}`}><LiveOrdersPage/></div>
        <div className={`kk-subpage ${page==='finance'?'active':''}`}><FinancePage/></div>
        <div className={`kk-subpage ${page==='subscription'?'active':''}`}><SubscriptionPage/></div>
      </div>
    </div>
  );
}
