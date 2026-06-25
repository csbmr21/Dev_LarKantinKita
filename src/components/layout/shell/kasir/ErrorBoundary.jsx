import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-fadeIn">
      <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mb-6 shadow-sm">
        <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Ups, Ada Masalah!</h2>
      <p className="text-gray-500 mb-8 max-w-sm font-medium leading-relaxed">
        {error?.message || "Terjadi kesalahan sistem yang tidak terduga."}
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 h-12 bg-white border border-gray-200 text-gray-700 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
        >
          Muat Ulang
        </button>
        <button 
          onClick={resetErrorBoundary} 
          className="px-8 h-12 bg-[#2D6A4F] text-white rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-[#1B4332] transition-all active:scale-95 shadow-xl shadow-emerald-900/20"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetErrorBoundary={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
