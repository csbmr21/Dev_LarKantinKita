import React, { Suspense, useEffect } from 'react';
import AppRouter from './router';

export default function App() {
  useEffect(() => {
    const snapUrl = import.meta.env.VITE_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    
    // Check if script is already loaded
    if (document.querySelector(`script[src="${snapUrl}"]`)) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = snapUrl;
    if (clientKey) {
      script.setAttribute('data-client-key', clientKey);
    }
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <Suspense fallback={null}>
      <AppRouter />
    </Suspense>
  );
}
