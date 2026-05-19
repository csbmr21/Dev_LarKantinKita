import React, { useState, useEffect } from 'react';

export default function AdminLive() {
  const [metrics, setMetrics] = useState({
    sessions: 1847,
    orders: 342,
    gmv: 3200000,
    uptime: 99.97,
    latency: 42,
    latencyP99: 187,
    rpm: 1240,
    dbPool: 78,
    errorRate: 0.03,
  });

  useEffect(() => {
    const intv = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        latency: Math.floor(38 + Math.random() * 15),
        dbPool: Math.floor(65 + Math.random() * 20),
        sessions: Math.floor(1700 + Math.random() * 300),
        rpm: Math.floor(1100 + Math.random() * 300),
      }));
    }, 3000);
    return () => clearInterval(intv);
  }, []);

  const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const nFmt = (n) => Number(n || 0).toLocaleString('id-ID');

  return (
    <div className="scroll-area">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{fontSize:16,fontWeight:800,color:'var(--text-100)'}}>Live Platform Monitor</div>
        <div style={{display:'flex',gap:6}}>
          <span className="badge badge-ok"><span className="badge-dot"></span>Live</span>
          <button className="btn btn-ghost btn-sm">🔄 Refresh</button>
        </div>
      </div>
      
      <div className="stat-grid sg4">
        <div className="stat-card">
          <div className="stat-val up">{nFmt(metrics.sessions)}</div>
          <div className="stat-label">Active Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{color:'#FCD34D'}}>{nFmt(metrics.orders)}</div>
          <div className="stat-label">Orders Hari Ini</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{color:'var(--c-primary-400)'}}>{fmt(metrics.gmv)}</div>
          <div className="stat-label">GMV Hari Ini</div>
        </div>
        <div className="stat-card">
          <div className="stat-val up">{metrics.uptime}%</div>
          <div className="stat-label">Uptime</div>
        </div>
      </div>
      
      <div className="g2">
        <div className="panel" style={{marginBottom:0}}>
          <div className="panel-header">
            <div className="panel-title">📡 Realtime API Health</div>
            <span className="badge badge-ok"><span className="badge-dot"></span>Healthy</span>
          </div>
          <div>
            <div className="metric-row"><span className="metric-name">API Latency (avg)</span><span className="metric-val up">{metrics.latency}ms</span></div>
            <div className="metric-row"><span className="metric-name">API Latency (p99)</span><span className="metric-val" style={{color:'#FCD34D'}}>{metrics.latencyP99}ms</span></div>
            <div className="metric-row"><span className="metric-name">Request per Menit</span><span className="metric-val up">{nFmt(metrics.rpm)}</span></div>
            <div className="metric-row"><span className="metric-name">Error Rate</span><span className="metric-val up">{metrics.errorRate}%</span></div>
            <div className="metric-row"><span className="metric-name">DB Pool Usage</span><span className="metric-val" style={{color:'#FCD34D'}}>{metrics.dbPool}%</span></div>
            <div className="metric-row"><span className="metric-name">Cache Hit Rate</span><span className="metric-val up">94%</span></div>
            <div className="metric-row"><span className="metric-name">Storage Used</span><span className="metric-val up">234 / 1024 GB</span></div>
          </div>
        </div>
        <div className="panel" style={{marginBottom:0}}>
          <div className="panel-header"><div className="panel-title">🌐 Service Status</div></div>
          <div>
            <div className="metric-row"><span className="metric-name">🟢 API Gateway</span><span className="metric-val up">Operational</span></div>
            <div className="metric-row"><span className="metric-name">🟢 Database (PostgreSQL)</span><span className="metric-val up">Operational</span></div>
            <div className="metric-row"><span className="metric-name">🟢 Redis Cache</span><span className="metric-val up">Operational</span></div>
            <div className="metric-row"><span className="metric-name">🟡 Payment Gateway</span><span className="metric-val" style={{color:'#FCD34D'}}>Degraded</span></div>
            <div className="metric-row"><span className="metric-name">🟢 Push Notification</span><span className="metric-val up">Operational</span></div>
            <div className="metric-row"><span className="metric-name">🟢 Object Storage (S3)</span><span className="metric-val up">Operational</span></div>
            <div className="metric-row"><span className="metric-name">🟢 CDN</span><span className="metric-val up">Operational</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
