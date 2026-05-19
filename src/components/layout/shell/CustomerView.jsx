import React, { useState } from 'react';
import { useQuery }       from '@tanstack/react-query';
import { useAuthStore }   from '../../../store/authStore';
import { useCartStore }   from '../../../store/cartStore';
import { tenantApi }      from '../../../api/tenant';
import { orderApi }       from '../../../api/order';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const STATUS_STEPS = ['Dipesan', 'Diterima', 'Dimasak', 'Siap', 'Selesai'];
const STATUS_STEP_MAP = { pending: 0, accepted: 1, cooking: 2, ready: 3, done: 4 };

function StatusBar() {
  return (
    <div className="app-status-bar">
      <span className="app-status-time">{new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>
      <span className="app-status-icons">▶ WiFi 🔋</span>
    </div>
  );
}

/* ── HOME ─────────────────────────────────────────── */
function HomeScreen({ onNavigate, onSelectTenant }) {
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState('');

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants', { search: query, is_open: filter }],
    queryFn: () => tenantApi.getTenants({ search: query, is_open: filter || undefined })
                            .then(r => {
                              const d = r?.data;
                              if (Array.isArray(d)) return d;
                              if (Array.isArray(d?.data)) return d.data;
                              if (Array.isArray(d?.data?.data)) return d.data.data;
                              return [];
                            }).catch(()=>[]),
    refetchInterval: 60000,
  });

  return (
    <div className="app-scroll" style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:12}}>
      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,var(--c-primary-800),var(--c-primary-600))',borderRadius:'var(--r-xl)',padding:'16px',color:'white'}}>
        <p style={{fontSize:'var(--text-xs)',opacity:.8,marginBottom:4}}>Makan siang hari ini?</p>
        <p style={{fontSize:'var(--text-lg)',fontWeight:800,lineHeight:'var(--lh-snug)'}}>Pesan dari kantin favoritmu 🍱</p>
      </div>

      {/* Search */}
      <form onSubmit={e=>{e.preventDefault();setQuery(search);}} style={{position:'relative'}}>
        <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'var(--c-neutral-400)'}}>🔍</span>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Cari kantin..."
          style={{width:'100%',paddingLeft:32,paddingRight:12,paddingTop:9,paddingBottom:9,borderRadius:'var(--r-lg)',border:'1.5px solid var(--c-neutral-200)',fontSize:'var(--text-sm)',outline:'none',fontFamily:'var(--font-sans)',background:'white'}}
        />
      </form>

      {/* Filter */}
      <div style={{display:'flex',gap:6}}>
        {[['','Semua'],['1','Buka'],['0','Tutup']].map(([v,l]) => (
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:'5px 14px',borderRadius:'var(--r-full)',border:'1.5px solid',borderColor:filter===v?'transparent':'var(--c-neutral-200)',fontSize:'var(--text-xs)',fontWeight:700,background:filter===v?'var(--c-primary-700)':'white',color:filter===v?'white':'var(--c-neutral-500)',cursor:'pointer',fontFamily:'var(--font-sans)'}}>
            {l}
          </button>
        ))}
      </div>

      {/* Tenant Grid */}
      <p style={{fontSize:'var(--text-xs)',fontWeight:700,color:'var(--c-neutral-500)',textTransform:'uppercase',letterSpacing:1}}>KANTIN TERSEDIA</p>
      {isLoading ? (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[1,2,3,4].map(i=>(
            <div key={i} style={{height:140,background:'var(--c-neutral-100)',borderRadius:'var(--r-lg)',animation:'pulse 1.5s ease infinite'}} />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div style={{textAlign:'center',padding:32,color:'var(--c-neutral-400)'}}>
          <p style={{fontSize:32,marginBottom:8}}>🍽️</p>
          <p style={{fontSize:'var(--text-sm)',fontWeight:600}}>Kantin tidak ditemukan</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {tenants.map(t => (
            <div key={t.id} onClick={()=>onSelectTenant(t)}
              style={{background:'white',border:'1.5px solid var(--c-neutral-100)',borderRadius:'var(--r-lg)',padding:12,cursor:'pointer',boxShadow:'var(--shadow-xs)'}}>
              <div style={{width:44,height:44,background:'var(--c-primary-50)',borderRadius:'var(--r-md)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:8}}>
                {t.logo_url ? <img src={t.logo_url} alt="" style={{width:40,height:40,objectFit:'cover',borderRadius:'var(--r-sm)'}} onError={e=>e.target.style.display='none'} /> : '🍽️'}
              </div>
              <p style={{fontSize:'var(--text-sm)',fontWeight:700,color:'var(--c-neutral-900)',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</p>
              <p style={{fontSize:10,color:'var(--c-neutral-500)',marginBottom:6}}>{t.category ?? 'Kantin'}</p>
              <span style={{padding:'2px 8px',borderRadius:'var(--r-full)',fontSize:10,fontWeight:700,background:t.is_open?'var(--c-emerald-100)':'var(--c-neutral-100)',color:t.is_open?'var(--c-emerald-600)':'var(--c-neutral-500)'}}>
                {t.is_open ? 'Buka' : 'Tutup'}
              </span>
            </div>
          ))}
        </div>
      )}
      <div style={{height:16}}/>
    </div>
  );
}

/* ── CART ─────────────────────────────────────────── */
function CartScreen({ onNavigate }) {
  const items       = useCartStore(s => s.items);
  const addItem     = useCartStore(s => s.addItem);
  const removeItem  = useCartStore(s => s.removeItem);
  const updateQty   = useCartStore(s => s.updateQuantity);
  const clearCart   = useCartStore(s => s.clearCart);
  const totalItems  = useCartStore(s => s.getTotalItems());
  const totalPrice  = useCartStore(s => s.getTotalPrice());

  const [payMethod, setPayMethod] = useState('cash');

  if (!items || items.length === 0) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:24}}>
      <span style={{fontSize:48}}>🛒</span>
      <p style={{fontSize:'var(--text-md)',fontWeight:700,color:'var(--c-neutral-700)'}}>Keranjang Kosong</p>
      <p style={{fontSize:'var(--text-sm)',color:'var(--c-neutral-400)',textAlign:'center'}}>Tambahkan menu dari halaman beranda</p>
      <button onClick={()=>onNavigate('home')} style={{marginTop:8,padding:'8px 20px',background:'var(--c-primary-700)',color:'white',border:'none',borderRadius:'var(--r-full)',fontSize:'var(--text-sm)',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-sans)'}}>Lihat Kantin</button>
    </div>
  );

  return (
    <>
      <div className="app-scroll" style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
        {items.map(item => (
          <div key={item.menuId} style={{background:'white',border:'1px solid var(--c-neutral-100)',borderRadius:'var(--r-lg)',padding:12,display:'flex',alignItems:'center',gap:10,boxShadow:'var(--shadow-xs)'}}>
            <div style={{width:44,height:44,background:'var(--c-primary-50)',borderRadius:'var(--r-md)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
              {item.image ? <img src={item.image} alt="" style={{width:40,height:40,objectFit:'cover',borderRadius:'var(--r-sm)'}} onError={e=>e.target.style.display='none'}/> : '🍽️'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:'var(--text-sm)',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
              <p style={{fontSize:'var(--text-xs)',color:'var(--c-primary-600)',fontWeight:700}}>{fmt(item.price)}</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              <button onClick={()=>updateQty(item.menuId, item.quantity - 1)} style={{width:26,height:26,borderRadius:50,border:'1.5px solid var(--c-neutral-200)',background:'white',fontWeight:700,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
              <span style={{fontSize:'var(--text-sm)',fontWeight:700,minWidth:16,textAlign:'center'}}>{item.quantity}</span>
              <button onClick={()=>addItem({...item,quantity:1})} style={{width:26,height:26,borderRadius:50,border:'none',background:'var(--c-primary-700)',color:'white',fontWeight:700,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{borderTop:'1px solid var(--c-neutral-100)',padding:'12px 14px',background:'white',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
          <span style={{fontSize:'var(--text-sm)',color:'var(--c-neutral-600)'}}>Total ({totalItems} item)</span>
          <span style={{fontSize:'var(--text-lg)',fontWeight:800,color:'var(--c-primary-700)'}}>{fmt(totalPrice)}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}}>
          {[['cash','💵 Tunai'],['qris','📱 QRIS'],['transfer','🏦 Transfer'],['card','💳 Kartu']].map(([v,l]) => (
            <button key={v} onClick={()=>setPayMethod(v)}
              style={{height:34,borderRadius:'var(--r-sm)',border:'1.5px solid',borderColor:payMethod===v?'var(--c-primary-600)':'var(--c-neutral-200)',background:payMethod===v?'var(--c-primary-50)':'white',color:payMethod===v?'var(--c-primary-700)':'var(--c-neutral-600)',fontSize:'var(--text-xs)',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-sans)'}}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={()=>onNavigate('tracking')}
          style={{width:'100%',height:44,background:'var(--c-primary-700)',color:'white',border:'none',borderRadius:'var(--r-md)',fontSize:'var(--text-base)',fontWeight:800,cursor:'pointer',fontFamily:'var(--font-sans)'}}>
          Pesan Sekarang • {fmt(totalPrice)}
        </button>
      </div>
    </>
  );
}

// Safely unwrap Laravel list/paginated response -> always Array
const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

/* ── ORDERS ─────────────────────────────────────────── */
function OrdersScreen() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => orderApi.getOrders().then(unwrapList).catch(()=>[]),
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div className="app-scroll" style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
      {[1,2,3].map(i=><div key={i} style={{height:80,background:'var(--c-neutral-100)',borderRadius:'var(--r-lg)'}}/>)}
    </div>
  );

  if (!orders.length) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:24}}>
      <span style={{fontSize:48}}>📋</span>
      <p style={{fontSize:'var(--text-md)',fontWeight:700,color:'var(--c-neutral-700)'}}>Belum ada pesanan</p>
    </div>
  );

  const STATUS_COLOR = {
    pending:  { bg:'var(--c-blue-100)',  text:'var(--c-blue-600)',  label:'Menunggu' },
    accepted: { bg:'var(--c-amber-100)', text:'var(--c-amber-700)', label:'Diterima' },
    cooking:  { bg:'var(--c-amber-100)', text:'var(--c-amber-700)', label:'Dimasak'  },
    ready:    { bg:'var(--c-primary-100)',text:'var(--c-primary-700)',label:'Siap'   },
    done:     { bg:'var(--c-emerald-100)',text:'var(--c-emerald-600)',label:'Selesai' },
    cancelled:{ bg:'var(--c-red-100)',   text:'var(--c-red-600)',   label:'Dibatal' },
  };

  return (
    <div className="app-scroll" style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
      {orders.map(o => {
        const sc = STATUS_COLOR[o.status] ?? STATUS_COLOR.pending;
        return (
          <div key={o.id} style={{background:'white',border:'1px solid var(--c-neutral-100)',borderRadius:'var(--r-lg)',padding:'12px 16px',boxShadow:'var(--shadow-xs)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--c-neutral-400)'}}>{o.order_code ?? `#${o.id}`}</span>
              <span style={{padding:'2px 8px',borderRadius:'var(--r-full)',fontSize:10,fontWeight:700,background:sc.bg,color:sc.text}}>{sc.label}</span>
            </div>
            <p style={{fontSize:'var(--text-sm)',fontWeight:700,marginBottom:2}}>{o.tenant?.name ?? 'Kantin'}</p>
            <p style={{fontSize:'var(--text-xs)',color:'var(--c-neutral-500)',marginBottom:6}}>
              {o.items?.map(i=>`${i.name} ×${i.quantity}`).join(', ') ?? '—'}
            </p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:'var(--text-sm)',fontWeight:800,color:'var(--c-primary-700)'}}>{fmt(o.total_amount ?? o.total ?? 0)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── TRACKING ─────────────────────────────────────────── */
function TrackingScreen() {
  const { data: rawOrders = [] } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => orderApi.getOrders().then(unwrapList).catch(()=>[]),
  });
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const activeOrder = orders.find(o => !['done','cancelled'].includes(o.status));

  if (!activeOrder) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:24}}>
      <span style={{fontSize:48}}>📍</span>
      <p style={{fontSize:'var(--text-md)',fontWeight:700,color:'var(--c-neutral-700)'}}>Tidak ada pesanan aktif</p>
    </div>
  );

  const step = STATUS_STEP_MAP[activeOrder.status] ?? 0;

  return (
    <div className="app-scroll" style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:16}}>
      <div style={{background:'linear-gradient(135deg,var(--c-primary-800),var(--c-primary-600))',borderRadius:'var(--r-xl)',padding:16,color:'white'}}>
        <p style={{fontSize:'var(--text-xs)',opacity:.7,marginBottom:4}}>Pesanan {activeOrder.order_code ?? `#${activeOrder.id}`}</p>
        <p style={{fontSize:'var(--text-xl)',fontWeight:800}}>{activeOrder.tenant?.name ?? 'Kantin'}</p>
        <p style={{fontSize:'var(--text-sm)',opacity:.8,marginTop:4}}>Estimasi 10–15 menit</p>
      </div>
      <div style={{background:'white',borderRadius:'var(--r-lg)',padding:16,boxShadow:'var(--shadow-xs)'}}>
        <p style={{fontSize:'var(--text-sm)',fontWeight:700,marginBottom:16}}>Status Pesanan</p>
        <div style={{display:'flex',alignItems:'flex-start'}}>
          {STATUS_STEPS.map((s, i) => (
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6,position:'relative'}}>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{position:'absolute',top:15,left:'50%',width:'100%',height:2,background:i<step?'var(--c-primary-500)':'var(--c-neutral-200)',zIndex:0}}/>
              )}
              <div style={{width:32,height:32,borderRadius:'50%',background:i<=step?'var(--c-primary-700)':'var(--c-neutral-100)',color:i<=step?'white':'var(--c-neutral-400)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,position:'relative',zIndex:1,border:i===step?'2px solid var(--c-primary-400)':'none'}}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{fontSize:9,fontWeight:700,textAlign:'center',color:i<=step?'var(--c-primary-700)':'var(--c-neutral-400)'}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── PROFILE ──────────────────────────────────────── */
function ProfileScreen({ onLogout }) {
  const { user } = useAuthStore();

  return (
    <div className="app-scroll">
      <div style={{background:'linear-gradient(160deg,var(--c-primary-800),var(--c-primary-600))',padding:'24px 20px 32px',display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
        <div style={{width:72,height:72,borderRadius:'50%',overflow:'hidden',border:'3px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:'white',fontWeight:800}}>
          {user?.photo_url
            ? <img src={user.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} referrerPolicy="no-referrer"/>
            : (user?.full_name?.charAt(0) ?? '👤')}
        </div>
        <div style={{textAlign:'center',color:'white'}}>
          <p style={{fontSize:'var(--text-lg)',fontWeight:800}}>{user?.full_name ?? 'Pengguna'}</p>
          <p style={{fontSize:'var(--text-sm)',opacity:.75}}>{user?.email}</p>
        </div>
      </div>

      <div style={{margin:'0 14px 20px'}}>
        {[
          {icon:'📋',label:'Riwayat Transaksi'},
          {icon:'❤️',label:'Menu Favorit'},
          {icon:'🔔',label:'Notifikasi'},
          {icon:'🔒',label:'Keamanan'},
          {icon:'❓',label:'Bantuan & FAQ'},
          {icon:'🚪',label:'Keluar',danger:true,action:onLogout},
        ].map((item,i,arr) => (
          <button key={i} onClick={item.action}
            style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',cursor:'pointer',background:'none',border:'none',borderBottom:i<arr.length-1?'1px solid var(--c-neutral-100)':'none',width:'100%',fontFamily:'var(--font-sans)'}}>
            <span style={{fontSize:'var(--text-base)',fontWeight:item.danger?700:500,color:item.danger?'var(--c-red-500)':'var(--c-neutral-800)'}}>{item.icon} {item.label}</span>
            <span style={{color:'var(--c-neutral-300)'}}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN CustomerView ────────────────────────────── */
export default function CustomerView() {
  const [screen, setScreen] = useState('home');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const { logout } = useAuthStore();

  const totalItems = useCartStore(s => s.getTotalItems());

  const TABS = [
    { key:'home',     icon:'🏠', label:'Beranda'  },
    { key:'cart',     icon:'🛒', label: totalItems > 0 ? `Keranjang (${totalItems})` : 'Keranjang' },
    { key:'tracking', icon:'📍', label:'Lacak'    },
    { key:'orders',   icon:'📋', label:'Pesanan'  },
    { key:'profile',  icon:'👤', label:'Profil'   },
  ];

  const SCREEN_TITLE = {
    home: 'KantinKita', cart: 'Keranjang', tracking: 'Lacak Pesanan',
    orders: 'Riwayat', profile: 'Profil',
  };

  return (
    <div className="kk-phone-wrap">
      <div className="kk-phone">
        <div className="kk-phone-notch-bar"><div className="kk-phone-notch"/></div>
        <div className="kk-phone-screen">
          <StatusBar />

          {/* App Header */}
          <div className="app-header">
            <span className="app-header-title">{SCREEN_TITLE[screen]}</span>
            <button className="app-icon-btn">🔔</button>
          </div>

          {/* Screens */}
          <div className={`app-screen ${screen==='home'    ?'active':''}`}><HomeScreen onNavigate={setScreen} onSelectTenant={t=>{setSelectedTenant(t);setScreen('home');}}/></div>
          <div className={`app-screen ${screen==='cart'    ?'active':''}`}><CartScreen onNavigate={setScreen}/></div>
          <div className={`app-screen ${screen==='tracking'?'active':''}`}><TrackingScreen/></div>
          <div className={`app-screen ${screen==='orders'  ?'active':''}`}><OrdersScreen/></div>
          <div className={`app-screen ${screen==='profile' ?'active':''}`}><ProfileScreen onLogout={logout}/></div>

          {/* Bottom Nav */}
          <div className="app-bottom-nav">
            {TABS.map(tab => (
              <button key={tab.key} className={`app-nav-tab ${screen===tab.key?'active':''}`} onClick={()=>setScreen(tab.key)}>
                <span className="app-nav-icon">{tab.icon}</span>
                <span className="app-nav-label">{tab.label}</span>
                {screen===tab.key && <span className="app-nav-pip"/>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
