import React, { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../api/admin';
import { 
  ChartBarIcon, 
  BoltIcon, 
  BuildingStorefrontIcon, 
  UsersIcon, 
  LockClosedIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  Cog6ToothIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon, 
  CircleStackIcon, 
  MegaphoneIcon 
} from '@heroicons/react/24/outline';

const AdminAnalytics = React.lazy(() => import('./admin/AdminAnalytics'));
const AdminLive = React.lazy(() => import('./admin/AdminLive'));
const AdminTenants = React.lazy(() => import('./admin/AdminTenants'));
const AdminUsers = React.lazy(() => import('./admin/AdminUsers'));
const AdminRoles = React.lazy(() => import('./admin/AdminRoles'));
const AdminFinance = React.lazy(() => import('./admin/AdminFinance'));
const AdminSubscriptions = React.lazy(() => import('./admin/AdminSubscriptions'));
const AdminConfig = React.lazy(() => import('./admin/AdminConfig'));
const AdminAudit = React.lazy(() => import('./admin/AdminAudit'));
const AdminMonitor = React.lazy(() => import('./admin/AdminMonitor'));
const AdminBackup = React.lazy(() => import('./admin/AdminBackup'));
const AdminNotifications = React.lazy(() => import('./admin/AdminNotifications'));

const NAV_ITEMS = [
  { id:'analytics',     label:'Global Analytics',   icon: <ChartBarIcon className="w-4 h-4" />, section:'Overview' },
  { id:'realtime',      label:'Live Dashboard',     icon: <BoltIcon className="w-4 h-4" />, section:'Overview' },
  
  { id:'tenants',       label:'Tenant Management',  icon: <BuildingStorefrontIcon className="w-4 h-4" />, section:'Tenant & User' },
  { id:'users',         label:'User Management',    icon: <UsersIcon className="w-4 h-4" />, section:'Tenant & User' },
  { id:'roles',         label:'Roles & Permissions',icon: <LockClosedIcon className="w-4 h-4" />, section:'Tenant & User' },
  
  { id:'finance',       label:'Platform Finance',   icon: <BanknotesIcon className="w-4 h-4" />, section:'Finance' },
  { id:'subscriptions', label:'Subscriptions',      icon: <CreditCardIcon className="w-4 h-4" />, section:'Finance' },
  
  { id:'config',        label:'Configuration',      icon: <Cog6ToothIcon className="w-4 h-4" />, section:'System' },
  { id:'audit',         label:'Audit Log',          icon: <DocumentTextIcon className="w-4 h-4" />, section:'System' },
  { id:'monitor',       label:'Error Monitor',      icon: <ExclamationTriangleIcon className="w-4 h-4" />, section:'System', badge: 2 },
  { id:'backup',        label:'Backup & Restore',   icon: <CircleStackIcon className="w-4 h-4" />, section:'System' },
  { id:'notifications', label:'Broadcast Notif',    icon: <MegaphoneIcon className="w-4 h-4" />, section:'System' },
];

export default function AdminView() {
  const { user } = useAuthStore();
  const [page, setPage] = useState('analytics');
  const [clock, setClock] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch subscription stats dynamically to show pending badges in the sidebar
  const { data: statsRaw } = useQuery({
    queryKey: ['admin-sub-stats'],
    queryFn: () => adminApi.getSubscriptionStats().catch(() => ({})),
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const pendingCount = statsRaw?.data?.data?.pending ?? statsRaw?.data?.pending ?? statsRaw?.pending ?? 0;

  useEffect(() => {
    const updateTime = () => setClock(new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const initials = user?.full_name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || 'SA';
  
  // Inject subscription badge dynamically
  const menuItems = NAV_ITEMS.map(item => {
    if (item.id === 'subscriptions') {
      return { ...item, badge: pendingCount > 0 ? pendingCount : null };
    }
    return item;
  });

  const sections = [...new Set(menuItems.map(n=>n.section))];

  return (
    <div style={{display:'flex',height:'calc(100vh - 44px)',overflow:'hidden',width:'100%',background:'var(--bg-main)',color:'var(--text-200)',fontFamily:'var(--font-sans)'}}>
      {/* Mobile hamburger */}
      <button className="kk-mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
        <span style={{fontSize:18}}>{sidebarOpen ? '\u2715' : '\u2630'}</span>
      </button>
      <div className={`kk-sidebar-overlay ${sidebarOpen ? 'kk-sidebar-open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <div className={`kk-sidebar kk-shell-sidebar ${sidebarOpen ? 'kk-sidebar-open' : ''}`} style={{width:210,background:'var(--bg-deep)',borderRight:'1px solid var(--border-main)',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{height:56,display:'flex',alignItems:'center',gap:10,padding:'0 14px',borderBottom:'1px solid var(--border-main)',flexShrink:0}}>
          <div style={{width:28,height:28,background:'var(--c-primary-700)',borderRadius:'var(--r-sm)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff'}}>KK</div>
          <div><div style={{fontSize:14,fontWeight:800,color:'#fff'}}>Admin</div></div>
          <div style={{background:'rgba(82,183,136,0.12)',color:'var(--c-primary-400)',fontSize:9,fontWeight:700,padding:'2px 5px',borderRadius:3}}>SYSTEM</div>
        </div>

        <nav style={{flex:1,padding:6,overflowY:'auto'}}>
          {sections.map(sec => (
            <React.Fragment key={sec}>
              <div style={{padding:'10px 8px 3px',fontSize:9,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--text-400)'}}>{sec}</div>
              {menuItems.filter(n=>n.section===sec).map(n => (
                <div 
                  key={n.id} 
                  className={`sb-item ${page===n.id?'active':''}`} 
                  onClick={()=>{setPage(n.id); setSidebarOpen(false);}}
                  style={{
                    display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:'var(--r-sm)',
                    fontSize:12,fontWeight:600,cursor:'pointer',marginBottom:1,
                    background: page===n.id ? 'rgba(45,106,79,0.15)' : 'transparent',
                    color: page===n.id ? 'var(--c-primary-400)' : 'var(--text-300)',
                  }}
                >
                  <span style={{flexShrink:0,width:16,display:'flex',alignItems:'center',justifyContent:'center'}}>{n.icon}</span>
                  {n.label}
                  {n.badge && <span style={{marginLeft:'auto',background:'var(--c-red-500)',color:'#fff',fontSize:9,fontWeight:800,padding:'2px 5px',borderRadius:'var(--r-full)'}}>{n.badge}</span>}
                </div>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div style={{padding:'10px 14px',borderTop:'1px solid var(--border-main)',display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{initials}</div>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:'var(--text-100)'}}>{user?.full_name || 'Super Admin'}</div>
            <div style={{fontSize:10,color:'var(--text-400)'}}>System Administrator</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div className="kk-topbar-dark">
          <div>
            <div className="kk-topbar-title">{NAV_ITEMS.find(n=>n.id===page)?.label}</div>
            <div className="kk-topbar-sub">Semua tenant · Platform overview · {new Date().toLocaleDateString('id-ID',{month:'long',year:'numeric'})}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span className="badge badge-ok"><span className="badge-dot"></span>All Systems Operational</span>
            <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-400)',minWidth:60}}>{clock}</span>
          </div>
        </div>

        <div className="kk-subpage-container" style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <Suspense fallback={<div style={{display:'flex',flex:1,alignItems:'center',justifyContent:'center',color:'var(--text-400)',fontSize:13}}>Memuat modul...</div>}>
            {page === 'analytics' && <AdminAnalytics />}
            {page === 'realtime' && <AdminLive />}
            {page === 'tenants' && <AdminTenants />}
            {page === 'users' && <AdminUsers />}
            {page === 'roles' && <AdminRoles />}
            {page === 'finance' && <AdminFinance />}
            {page === 'subscriptions' && <AdminSubscriptions />}
            {page === 'config' && <AdminConfig />}
            {page === 'audit' && <AdminAudit />}
            {page === 'monitor' && <AdminMonitor />}
            {page === 'backup' && <AdminBackup />}
            {page === 'notifications' && <AdminNotifications />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
