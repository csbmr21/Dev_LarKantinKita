import React, { Suspense } from 'react';
import AppRouter from './router';
import LoadingSpinner from './components/ui/LoadingSpinner';

export default function App() {
  return (
    <Suspense fallback={null}>
      <AppRouter />
    </Suspense>
  );
}
