import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';

// Security Warning for Self-XSS (Standard Pro Practice)
if (import.meta.env.PROD) {
  console.log(
    '%cBERHENTI!%c\n\n' +
    'Menggunakan konsol ini dapat memungkinkan penyerang untuk meniru identitas ' +
    'dan mencuri informasi Anda melalui serangan yang disebut Self-XSS.\n' +
    'Jangan masukkan atau tempelkan kode yang tidak Anda pahami.',
    'color: #2D6A4F; font-size: 40px; font-weight: bold; -webkit-text-stroke: 1px black;',
    'color: #666; font-size: 16px; font-weight: bold;'
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,            // 30 detik (Synchronized Lite)
      gcTime: 10 * 60 * 1000,          // 10 menit
      retry: 2,
      refetchOnWindowFocus: true,      // Refresh data saat balik ke tab
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' },
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' },
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
