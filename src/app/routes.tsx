import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { AppLayout } from './layout';
import { AuthView } from '../features/auth/AuthView';
import { OnboardingView } from '../features/auth/OnboardingView';
import { VerifyEmailView } from '../features/auth/VerifyEmailView';

import { DiscoveryPage } from '../features/jobs/DiscoveryPage';
import { ServicesPage } from '../features/jobs/ServicesPage';
import { WaitlistPage } from '../features/jobs/WaitlistPage';
import { DashboardPage } from '../features/jobs/DashboardPage';
import { CatalogPage } from '../features/jobs/CatalogPage';
import { JobsPage } from '../features/jobs/JobsPage';
import { WalletPage } from '../features/payments/WalletPage';
import { ChatPage } from '../features/chat/ChatPage';
import { ProfilePage } from '../features/auth/ProfilePage';

export const AppRoutes: React.FC = () => {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    needsVerification, 
    userRole 
  } = useAuth();
  
  const [authMode, setAuthMode] = React.useState<'login' | 'signup' | 'reset'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sidebar-light flex items-center justify-center p-4">
        <AuthView 
          mode={authMode} 
          setMode={setAuthMode} 
          onLogin={() => {}} 
          onSignup={() => {}} 
          onShowTerms={() => {}} 
        />
      </div>
    );
  }

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-sidebar-light flex items-center justify-center p-4">
        <VerifyEmailView 
          email={user.email || ''} 
          onResend={() => {}} 
          onSignOut={() => {}} 
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sidebar-light flex items-center justify-center p-4 overflow-y-auto">
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

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {userRole === 'client' ? (
          <>
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={<DiscoveryPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
          </>
        )}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
