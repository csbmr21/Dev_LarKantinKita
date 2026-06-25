import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../../../api/admin';
import { 
  Cog6ToothIcon, 
  EnvelopeIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

const unwrapList = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

// Convert settings array [{key,value}] → object {key: value}
const toObj = (arr) => {
  if (!Array.isArray(arr)) return arr ?? {};
  return Object.fromEntries(arr.map(s => [s.key, s.value]));
};

export default function AdminConfig() {
  const { data: raw } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().catch(() => []),
  });

  const settingsArr = unwrapList(raw);
  const settings = toObj(settingsArr);

  // Local state seeded from API
  const [form, setForm] = useState({ platform_fee: 10, max_tenants: 10, max_upload_mb: 5, smtp_host: 'smtp.sendgrid.net', from_email: 'noreply@kantinkita.id', merchant_id: 'G11111111111111', session_timeout: 30 });
  const [toggles, setToggles] = useState({ maintenance: false, registration: true, email_confirm: true, email_report: false, two_fa: true, rate_limit: true, ddos: true });

  // Seed from API when loaded
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setForm(prev => ({
        ...prev,
        platform_fee: settings.platform_fee ?? prev.platform_fee,
        smtp_host: settings.smtp_host ?? prev.smtp_host,
        from_email: settings.from_email ?? prev.from_email,
        merchant_id: settings.midtrans_merchant_id ?? prev.merchant_id,
        session_timeout: settings.session_timeout ?? prev.session_timeout,
      }));
      setToggles(prev => ({
        ...prev,
        maintenance: settings.maintenance_mode === '1' || settings.maintenance_mode === true,
        registration: settings.allow_registration !== '0',
        email_confirm: settings.email_confirmation !== '0',
        email_report: settings.email_daily_report === '1',
        two_fa: settings.admin_2fa !== '0',
        rate_limit: settings.rate_limiting !== '0',
        ddos: settings.ddos_protection !== '0',
      }));
    }
  }, [JSON.stringify(settings)]);

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = {
        settings: [
          { key: 'platform_fee', value: form.platform_fee },
          { key: 'smtp_host', value: form.smtp_host },
          { key: 'from_email', value: form.from_email },
          { key: 'maintenance_mode', value: toggles.maintenance ? '1' : '0' },
          { key: 'allow_registration', value: toggles.registration ? '1' : '0' },
          { key: 'email_confirmation', value: toggles.email_confirm ? '1' : '0' },
          { key: 'session_timeout', value: form.session_timeout },
          { key: 'midtrans_merchant_id', value: form.merchant_id },
          { key: 'email_daily_report', value: toggles.email_report ? '1' : '0' },
          { key: 'admin_2fa', value: toggles.two_fa ? '1' : '0' },
          { key: 'rate_limiting', value: toggles.rate_limit ? '1' : '0' },
          { key: 'ddos_protection', value: toggles.ddos ? '1' : '0' },
        ]
      };
      return adminApi.updateSettings(payload);
    },
  });

  const tog = (k) => setToggles(t => ({ ...t, [k]: !t[k] }));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="scroll-area">
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-100)', marginBottom: 12 }}>System Configuration</div>
      <div className="g2">
        <div>
          <div className="panel">
            <div className="panel-header"><div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Cog6ToothIcon className="w-4 h-4" /> Platform Settings</div></div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">Platform Fee (%)</label>
                <input className="input" type="number" value={form.platform_fee} onChange={e => set('platform_fee', e.target.value)} />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">Maks. Tenant Per Instansi</label>
                <input className="input" type="number" value={form.max_tenants} onChange={e => set('max_tenants', e.target.value)} />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">Max File Upload (MB)</label>
                <input className="input" type="number" value={form.max_upload_mb} onChange={e => set('max_upload_mb', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>Maintenance Mode</div>
                  <div style={{ fontSize: 11, color: 'var(--text-400)' }}>Semua endpoint dinonaktifkan sementara</div>
                </div>
                <button className={`toggle ${toggles.maintenance ? 'on' : 'off'}`} onClick={() => tog('maintenance')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>New Tenant Registration</div>
                  <div style={{ fontSize: 11, color: 'var(--text-400)' }}>Izinkan pendaftaran tenant baru</div>
                </div>
                <button className={`toggle ${toggles.registration ? 'on' : 'off'}`} onClick={() => tog('registration')} />
              </div>
              <button className="btn btn-primary" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                {saveMut.isPending ? '⏳ Menyimpan...' : saveMut.isSuccess ? <><CheckCircleIcon className="w-4 h-4 inline mr-1" /> Tersimpan</> : <><CircleStackIcon className="w-4 h-4 inline mr-1" /> Simpan</>}
              </button>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 0 }}>
            <div className="panel-header"><div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><EnvelopeIcon className="w-4 h-4" /> Email & Notifikasi</div></div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">SMTP Host</label>
                <input className="input" value={form.smtp_host} onChange={e => set('smtp_host', e.target.value)} />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">From Email</label>
                <input className="input" value={form.from_email} onChange={e => set('from_email', e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>Order Confirmation Email</div></div>
                <button className={`toggle ${toggles.email_confirm ? 'on' : 'off'}`} onClick={() => tog('email_confirm')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>Daily Report Email</div></div>
                <button className={`toggle ${toggles.email_report ? 'on' : 'off'}`} onClick={() => tog('email_report')} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="panel">
            <div className="panel-header"><div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CreditCardIcon className="w-4 h-4" /> Payment Gateway Config</div></div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">Provider</label>
                <select className="input"><option>Midtrans</option><option>Xendit</option></select>
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">Merchant ID</label>
                <input className="input" value={form.merchant_id} onChange={e => set('merchant_id', e.target.value)} />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">Mode</label>
                <select className="input"><option>Sandbox</option><option>Production</option></select>
              </div>
              <div className="metric-row" style={{ padding: 0, marginTop: 4 }}>
                <span className="metric-name">Status Payment Gateway</span>
                <span className="metric-val" style={{ color: '#FCD34D', display: 'flex', alignItems: 'center', gap: 4 }}>Degraded <ExclamationTriangleIcon className="w-3 h-3" /></span>
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 0 }}>
            <div className="panel-header"><div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheckIcon className="w-4 h-4" /> Security Settings</div></div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>Two-Factor Auth (Admin)</div></div>
                <button className={`toggle ${toggles.two_fa ? 'on' : 'off'}`} onClick={() => tog('two_fa')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>Rate Limiting</div>
                  <div style={{ fontSize: 11, color: 'var(--text-400)' }}>100 req/menit per IP</div>
                </div>
                <button className={`toggle ${toggles.rate_limit ? 'on' : 'off'}`} onClick={() => tog('rate_limit')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)' }}>DDoS Protection</div></div>
                <button className={`toggle ${toggles.ddos ? 'on' : 'off'}`} onClick={() => tog('ddos')} />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="lbl">Session Timeout (Menit)</label>
                <input className="input" type="number" value={form.session_timeout} onChange={e => set('session_timeout', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
