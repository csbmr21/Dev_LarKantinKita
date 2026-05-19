import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { orderApi }    from '../../../api/order';
import { tenantApi }  from '../../../api/tenant';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const STATUS_COLS = [
  { key: 'pending',  label: 'Menunggu', color: '#2563EB', bg: 'rgba(59,130,246,0.1)' },
  { key: 'accepted', label: 'Diterima', color: '#D97706', bg: 'rgba(245,158,11,0.1)' },
  { key: 'cooking',  label: 'Dimasak',  color: '#D97706', bg: 'rgba(245,158,11,0.1)' },
  { key: 'ready',    label: 'Siap',     color: '#059669', bg: 'rgba(16,185,129,0.1)' },
];

/* ── POS SUBPAGE ─────────────────────────────────── */
function PosPage() {
  const [cartItems, setCartItems] = useState([]);
  const [payMethod, setPayMethod] = useState('cash');
  const [success, setSuccess]     = useState(false);

  const { data: menusData } = useQuery({
    queryKey: ['staff-menus'],
    queryFn: () => tenantApi.getMenus().then(r => {
      const d = r?.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.data)) return d.data;
      if (Array.isArray(d?.data?.data)) return d.data.data;
      return [];
    }).catch(()=>[]),
  });
  const menus = Array.isArray(menusData) ? menusData : [];

  const addToCart = (menu) => {
    setCartItems(c => {
      const ex = c.find(x => x.id === menu.id);
      return ex ? c.map(x => x.id === menu.id ? {...x, qty: x.qty + 1} : x)
                : [...c, { ...menu, qty: 1 }];
    });
  };

  const totalPrice = cartItems.reduce((s, x) => s + x.price * x.qty, 0);
  const orderNo    = `#${String(Math.floor(Math.random() * 900) + 100).padStart(3,'0')}`;

  const handleCharge = () => {
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setCartItems([]); }, 2500);
  };

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 340px',flex:1,overflow:'hidden',position:'relative'}}>
      {/* Left: Menu Grid */}
      <div style={{display:'flex',flexDirection:'column',overflow:'hidden',borderRight:'1px solid var(--color-border)'}}>
        {/* Toolbar */}
        <div style={{padding:'10px 12px',background:'white',borderBottom:'1px solid var(--color-border)',display:'flex',gap:8}}>
          <input placeholder="🔍  Cari menu..." style={{flex:1,padding:'6px 10px',border:'1.5px solid var(--c-neutral-200)',borderRadius:'var(--r-md)',fontSize:'var(--text-sm)',outline:'none',fontFamily:'var(--font-sans)'}}/>
          <select style={{padding:'6px 10px',border:'1.5px solid var(--c-neutral-200)',borderRadius:'var(--r-md)',fontSize:'var(--text-sm)',outline:'none',fontFamily:'var(--font-sans)'}}>
            <option>Semua Kategori</option>
          </select>
        </div>
        {/* Grid */}
        <div style={{flex:1,overflowY:'auto',padding:10,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8,alignContent:'start'}}>
          {menus.length === 0 ? (
            // Placeholder cards when no menus
            [...Array(8)].map((_,i) => (
              <div key={i} style={{background:'var(--c-neutral-50)',border:'1.5px solid var(--c-neutral-100)',borderRadius:'var(--r-lg)',padding:10,textAlign:'center',opacity:.5}}>
                <div style={{fontSize:28,marginBottom:6}}>🍽️</div>
                <p style={{fontSize:'var(--text-xs)',fontWeight:600,color:'var(--c-neutral-400)'}}>Menu</p>
                <p style={{fontSize:10,color:'var(--c-neutral-400)'}}>Rp —</p>
              </div>
            ))
          ) : menus.map(m => {
            const inCart = cartItems.find(x => x.id === m.id);
            const outOfStock = m.stock === 0 || m.is_available === false;
            return (
              <div key={m.id} onClick={() => !outOfStock && addToCart(m)}
                style={{background:'white',border:`1.5px solid ${inCart?'var(--c-primary-400)':'var(--c-neutral-200)'}`,borderRadius:'var(--r-lg)',padding:10,textAlign:'center',cursor:outOfStock?'not-allowed':'pointer',position:'relative',opacity:outOfStock?.35:1,transition:'all .15s',boxShadow:inCart?'var(--shadow-sm)':'none'}}>
                {inCart && (
                  <div style={{position:'absolute',top:6,right:6,width:18,height:18,borderRadius:'50%',background:'var(--c-primary-700)',color:'white',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{inCart.qty}</div>
                )}
                <div style={{fontSize:28,marginBottom:4}}>{m.emoji || '🍽️'}</div>
                <p style={{fontSize:'var(--text-xs)',fontWeight:700,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</p>
                <p style={{fontSize:10,color:'var(--c-primary-600)',fontWeight:700}}>{fmt(m.price)}</p>
                {outOfStock && <p style={{fontSize:9,color:'var(--c-red-500)',marginTop:2}}>Habis</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Order Cart */}
      <div style={{display:'flex',flexDirection:'column',overflow:'hidden',background:'white'}}>
        <div style={{padding:'12px 14px',borderBottom:'1px solid var(--color-border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{fontSize:'var(--text-sm)',fontWeight:700}}>Pesanan Baru</p>
            <p style={{fontSize:10,color:'var(--c-neutral-400)',fontFamily:'var(--font-mono)'}}>{orderNo}</p>
          </div>
          {cartItems.length > 0 && (
            <button onClick={() => setCartItems([])} style={{fontSize:10,color:'var(--c-red-500)',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontFamily:'var(--font-sans)'}}>Hapus Semua</button>
          )}
        </div>

        {/* Items */}
        <div style={{flex:1,overflowY:'auto'}}>
          {cartItems.length === 0 ? (
            <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:'var(--c-neutral-400)'}}>
              <span style={{fontSize:32}}>🛒</span>
              <p style={{fontSize:'var(--text-sm)',fontWeight:600}}>Pilih menu di sebelah kiri</p>
            </div>
          ) : cartItems.map(item => (
            <div key={item.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid var(--c-neutral-50)'}}>
              <span style={{fontSize:20}}>{item.emoji || '🍽️'}</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:'var(--text-xs)',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
                <p style={{fontSize:10,color:'var(--c-neutral-500)'}}>{fmt(item.price)} × {item.qty}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <button onClick={()=>setCartItems(c=>c.map(x=>x.id===item.id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0))} style={{width:22,height:22,borderRadius:50,border:'1.5px solid var(--c-neutral-200)',background:'white',cursor:'pointer',fontSize:12,fontWeight:700}}>−</button>
                <span style={{fontSize:'var(--text-xs)',fontWeight:700,minWidth:14,textAlign:'center'}}>{item.qty}</span>
                <button onClick={()=>addToCart(item)} style={{width:22,height:22,borderRadius:50,background:'var(--c-primary-700)',color:'white',border:'none',cursor:'pointer',fontSize:12,fontWeight:700}}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{padding:'12px 14px',borderTop:'1px solid var(--color-border)',background:'var(--c-neutral-50)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontSize:'var(--text-sm)',color:'var(--c-neutral-600)'}}>Total</span>
            <span style={{fontSize:22,fontWeight:800,color:'var(--c-primary-700)',letterSpacing:'-0.5px'}}>{fmt(totalPrice)}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}}>
            {[['cash','💵 Tunai'],['qris','📱 QRIS'],['transfer','🏦 Transfer'],['card','💳 Kartu']].map(([v,l]) => (
              <button key={v} onClick={() => setPayMethod(v)}
                style={{height:34,borderRadius:'var(--r-sm)',border:'1.5px solid',borderColor:payMethod===v?'var(--c-primary-600)':'var(--c-neutral-200)',background:payMethod===v?'var(--c-primary-50)':'white',color:payMethod===v?'var(--c-primary-700)':'var(--c-neutral-600)',fontSize:'var(--text-xs)',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-sans)'}}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={handleCharge} disabled={cartItems.length === 0}
            style={{width:'100%',height:44,background:cartItems.length?'var(--c-primary-700)':'var(--c-neutral-300)',color:'white',border:'none',borderRadius:'var(--r-md)',fontSize:'var(--text-base)',fontWeight:800,cursor:cartItems.length?'pointer':'not-allowed',fontFamily:'var(--font-sans)'}}>
            {cartItems.length ? `Proses • ${fmt(totalPrice)}` : 'Pilih Menu Dulu'}
          </button>
        </div>
      </div>

      {/* Success Overlay */}
      {success && (
        <div style={{position:'absolute',inset:0,background:'white',zIndex:50,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,animation:'fadeIn .3s ease'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'var(--c-emerald-100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>✅</div>
          <p style={{fontSize:'var(--text-xl)',fontWeight:800,color:'var(--c-primary-700)'}}>Pembayaran Berhasil</p>
          <p style={{fontSize:'var(--text-sm)',color:'var(--c-neutral-500)'}}>Pesanan sedang diproses</p>
        </div>
      )}
    </div>
  );
}

/* ── ORDERS KANBAN ───────────────────────────────── */
function OrdersKanban() {
  const qc = useQueryClient();
  const { data: staffOrdersRaw = [] } = useQuery({
    queryKey: ['staff-orders'],
    queryFn: () => orderApi.getStaffOrders().then(r => {
      const d = r?.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.data)) return d.data;
      if (Array.isArray(d?.data?.data)) return d.data.data;
      return [];
    }).catch(()=>[]),
    refetchInterval: 15000,
  });
  const ordersRaw = Array.isArray(staffOrdersRaw) ? staffOrdersRaw : [];

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-orders'] }),
  });

  const NEXT_STATUS = { pending:'accepted', accepted:'cooking', cooking:'ready', ready:'done' };

  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      {/* Status bar */}
      <div style={{display:'flex',gap:4,padding:'10px 20px',background:'white',borderBottom:'1px solid var(--color-border)',flexShrink:0}}>
        {STATUS_COLS.map(s => (
          <span key={s.key} style={{padding:'4px 12px',borderRadius:'var(--r-full)',fontSize:'var(--text-xs)',fontWeight:700,background:s.bg,color:s.color}}>{s.label}</span>
        ))}
        <span style={{marginLeft:'auto',fontSize:'var(--text-xs)',color:'var(--c-neutral-500)',display:'flex',alignItems:'center',gap:6}}>
          <span className="live-dot"/> Live
        </span>
      </div>

      {/* Kanban */}
      <div style={{flex:1,overflowY:'auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,padding:16,alignContent:'start'}}>
        {STATUS_COLS.map(col => {
          const colOrders = ordersRaw.filter(o => o.status === col.key);
          return (
            <div key={col.key} style={{background:'var(--c-neutral-50)',borderRadius:'var(--r-lg)',padding:10,minHeight:200}}>
              {/* Column Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.8px',color:'var(--c-neutral-500)'}}>{col.label}</span>
                <span style={{width:20,height:20,borderRadius:'50%',background:col.bg,color:col.color,fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{colOrders.length}</span>
              </div>
              {/* Cards */}
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {colOrders.length === 0 && (
                  <p style={{fontSize:11,color:'var(--c-neutral-400)',textAlign:'center',padding:'12px 0'}}>—</p>
                )}
                {colOrders.map(order => (
                  <div key={order.id} style={{background:'white',border:'1px solid var(--color-border)',borderRadius:'var(--r-md)',padding:10,boxShadow:'var(--shadow-xs)',cursor:'pointer'}}>
                    <p style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--c-neutral-400)',marginBottom:2}}>{order.order_code ?? `#${order.id}`}</p>
                    <p style={{fontSize:12,fontWeight:700,marginBottom:2}}>{order.customer?.name ?? order.user?.full_name ?? 'Pelanggan'}</p>
                    <p style={{fontSize:11,color:'var(--c-neutral-500)',lineHeight:1.4,marginBottom:6}}>
                      {order.items?.map(i=>`${i.name} ×${i.quantity}`).join(', ') ?? '—'}
                    </p>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:13,fontWeight:800,color:'var(--c-primary-700)'}}>{fmt(order.total_amount)}</span>
                    </div>
                    {NEXT_STATUS[order.status] && (
                      <div style={{display:'flex',gap:4,marginTop:8}}>
                        <button onClick={() => updateStatus({ id: order.id, status: NEXT_STATUS[order.status] })}
                          style={{flex:1,height:28,borderRadius:'var(--r-sm)',border:'none',background:'var(--c-primary-700)',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-sans)'}}>
                          → {STATUS_COLS.find(s=>s.key===NEXT_STATUS[order.status])?.label}
                        </button>
                        <button onClick={() => updateStatus({ id: order.id, status: 'cancelled' })}
                          style={{width:28,height:28,borderRadius:'var(--r-sm)',border:'1px solid var(--c-red-200)',background:'var(--c-red-100)',color:'var(--c-red-500)',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN KasirView ──────────────────────────────── */
const NAV_ITEMS = [
  { id: 'pos',    label: 'Kasir / POS',    icon: '🖥️' },
  { id: 'orders', label: 'Antrian Order',  icon: '📋' },
];

export default function KasirView() {
  const { user } = useAuthStore();
  const [page, setPage] = useState('pos');

  const initials = user?.full_name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() ?? 'KS';
  const tenantName = user?.tenant?.name ?? 'Kantin Saya';

  return (
    <div style={{display:'flex',height:'calc(100vh - 44px)',overflow:'hidden',background:'var(--c-neutral-50)',width:'100%'}}>
      {/* Sidebar */}
      <div className="kk-sidebar" style={{background:'var(--c-primary-900)'}}>
        <div className="kk-sidebar-header">
          <div className="kk-sidebar-logo">🍽️</div>
          <div style={{minWidth:0}}>
            <p className="kk-sidebar-brand" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tenantName}</p>
            <p className="kk-sidebar-tenant">Kasir / Staff</p>
          </div>
        </div>

        <nav className="kk-sidebar-nav">
          <p className="kk-nav-section">OPERASIONAL</p>
          {NAV_ITEMS.map(n => (
            <button key={n.id} className={`kk-nav-item ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}>
              <span style={{fontSize:16}}>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>

        <div className="kk-sidebar-footer">
          <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'white'}}>{initials}</div>
          <div style={{minWidth:0,flex:1}}>
            <p style={{fontSize:'var(--text-xs)',fontWeight:600,color:'rgba(255,255,255,0.8)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.full_name ?? 'Kasir'}</p>
            <p style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>Shift Aktif</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="kk-main">
        <div className="kk-topbar">
          <div>
            <p className="kk-topbar-title">{NAV_ITEMS.find(n=>n.id===page)?.label}</p>
            <p className="kk-topbar-sub">{new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}</p>
          </div>
          <div className="kk-topbar-right">
            <span className="pill pill-success">● Shift Aktif</span>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--text-xs)',color:'var(--c-neutral-500)',padding:'4px 8px',background:'var(--c-neutral-100)',borderRadius:'var(--r-sm)'}}>
              {new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
            </span>
            <button className="btn-danger-outline">Akhiri Shift</button>
          </div>
        </div>

        <div className={`kk-subpage ${page==='pos'?'active':''}`}><PosPage/></div>
        <div className={`kk-subpage ${page==='orders'?'active':''}`}><OrdersKanban/></div>
      </div>
    </div>
  );
}
