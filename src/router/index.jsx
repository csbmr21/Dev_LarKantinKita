import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AppShell from '../components/layout/shell/AppShell';

// ── Auth (Public) ─────────────────────────────────────────
const Login           = lazy(() => import('../pages/auth/Login'));
const Register        = lazy(() => import('../pages/auth/Register'));
const GoogleCallback  = lazy(() => import('../pages/auth/GoogleCallback'));
const OtpVerification = lazy(() => import('../pages/auth/OtpVerification'));
const AccountSetup    = lazy(() => import('../pages/auth/AccountSetup'));
const ForgotPassword  = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword   = lazy(() => import('../pages/auth/ResetPassword'));
const Unauthorized    = lazy(() => import('../pages/Unauthorized'));
const NotFound        = lazy(() => import('../pages/NotFound'));

const F = ({ children }) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
    {children}
  </Suspense>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public Auth Pages ──────────────────────── */}
      <Route path="/login"           element={<F><Login /></F>} />
      <Route path="/register"        element={<F><Register /></F>} />
      <Route path="/auth/google/callback" element={<F><GoogleCallback /></F>} />
      <Route path="/auth/otp"        element={<F><OtpVerification /></F>} />
      <Route path="/forgot-password" element={<F><ForgotPassword /></F>} />
      <Route path="/reset-password"  element={<F><ResetPassword /></F>} />

      {/* ── Account Setup (auth required, no shell) ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/account-setup" element={<F><AccountSetup /></F>} />
      </Route>

      {/* ── Main App Shell (all authenticated roles) ─ */}
      {/* AppShell internally decides which view to show based on user role */}
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppShell />} />
      </Route>

      {/* ── Utility ───────────────────────────────── */}
      <Route path="/unauthorized" element={<F><Unauthorized /></F>} />
      <Route path="*"             element={<F><NotFound /></F>} />
    </Routes>
  );
}
