import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';

import { AppLayout } from './layout';

import { AuthView } from '../features/auth/AuthView';
import { OnboardingView } from '../features/auth/OnboardingView';
import { VerifyEmailView } from '../features/auth/VerifyEmailView';
import { SplashScreen } from '../components/SplashScreen';
import { LandingPage } from '../pages/LandingPage';

// Lazy load feature components
const DiscoveryPage = lazy(() => import('../features/jobs/DiscoveryPage').then(m => ({ default: m.DiscoveryPage })));
const ServicesPage = lazy(() => import('../features/jobs/ServicesPage').then(m => ({ default: m.ServicesPage })));
const WaitlistPage = lazy(() => import('../features/jobs/WaitlistPage').then(m => ({ default: m.WaitlistPage })));
const DashboardPage = lazy(() => import('../features/jobs/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CatalogPage = lazy(() => import('../features/jobs/CatalogPage').then(m => ({ default: m.CatalogPage })));
const JobsPage = lazy(() => import('../features/jobs/JobsPage').then(m => ({ default: m.JobsPage })));
const WalletPage = lazy(() => import('../features/payments/WalletPage').then(m => ({ default: m.WalletPage })));
const ChatPage = lazy(() => import('../features/chat/ChatPage').then(m => ({ default: m.ChatPage })));
const ProfilePage = lazy(() => import('../features/auth/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('../features/auth/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProviderProfilePage = lazy(() => import('../features/jobs/ProviderProfilePage').then(m => ({ default: m.ProviderProfilePage })));

export const AppRoutes: React.FC = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    needsVerification,
    userRole
  } = useAuth();

  const [authMode, setAuthMode] = React.useState<'login' | 'signup' | 'reset'>('login');
  const [showAuth, setShowAuth] = React.useState(false);

  // =========================
  // 🔄 Loading State
  // =========================
  if (isLoading) {
    return <SplashScreen />;
  }

  // =========================
  // 🔐 Not Logged In
  // =========================
  if (!user) {
    if (!showAuth) {
      return <LandingPage onAuthClick={() => setShowAuth(true)} />;
    }

    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
        {/* Background blobs for Auth View */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
        
        <div className="relative z-10 w-full max-w-md">
           <div className="mb-6 flex justify-center">
              <button 
                onClick={() => setShowAuth(false)}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                 ← Return to Network
              </button>
           </div>
           <AuthView
             mode={authMode}
             setMode={setAuthMode}
             onLogin={() => {}}
             onSignup={() => {}}
             onShowTerms={() => {}}
           />
        </div>
      </div>
    );
  }

  // =========================
  // 📧 Email Verification
  // =========================
  if (needsVerification) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-sidebar-light p-4">
        <VerifyEmailView
          email={user.email || ''}
          onResend={() => {}}
          onSignOut={() => {}}
        />
      </div>
    );
  }

  // =========================
  // 🧾 Onboarding
  // =========================
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-sidebar-light overflow-y-auto p-4">
        <OnboardingView
          user={user}
          onComplete={() => window.location.reload()}
          onSave={() => {}}
          role={userRole}
          setToast={() => {}}
        />
      </div>
    );
  }

  // =========================
  // 🚀 MAIN APP ROUTES
  // =========================
  return (
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        <Route element={<AppLayout />}>

        {/* Role-based Home Redirect */}
        <Route
          path="/"
          element={
            userRole === 'client'
              ? <Navigate to="/discover" replace />
              : <Navigate to="/dashboard" replace />
          }
        />

        {/* ================= CLIENT ROUTES ================= */}
        {userRole === 'client' && (
          <>
            <Route path="/discover" element={<DiscoveryPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:tier" element={<ServicesPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/waitlist/:queue" element={<WaitlistPage />} />
          </>
        )}

        {/* ================= PROVIDER ROUTES ================= */}
        {userRole === 'provider' && (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
          </>
        )}

        {/* ================= SHARED ROUTES ================= */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/provider/:id" element={<ProviderProfilePage />} />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Route>
    </Routes>
  </Suspense>
  );
};