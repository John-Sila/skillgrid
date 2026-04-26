import React, { useState, useEffect } from 'react';
import { ProfileView } from './ProfileView';
import { useAuth } from './AuthProvider';
import { jobService } from '../jobs/jobService';
import { Booking } from '../../shared/types';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Navigate } from 'react-router-dom';
import { Toast } from '../../shared/components/Toast';
import { AnimatePresence } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { user, userRole, isLoading, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState<{ message: string, bookingId?: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    try {
      const unsubscribe = jobService.getBookings(user.uid, userRole === 'client' ? 'client' : 'provider', setBookings);
      return () => unsubscribe();
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  }, [user, userRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleAction = (action: { type: string, status?: string, bookingId?: string }) => {
    if (!action || !action.type) return;

    switch (action.type) {
      case 'invoice_sent':
        setToast({ 
          message: "Retrieving e-invoice from secure archive...",
          bookingId: action.bookingId 
        });
        break;
      case 'task_completed':
        setToast({ message: "Task completion certificate generated." });
        break;
      case 'payment_received':
        setToast({ message: "Verifying incoming funds on the ledger..." });
        break;
      case 'download_id':
        setToast({ message: "Generating secure identification certificate..." });
        break;
      case 'security_refresh':
        setToast({ message: "Network trust score is optimal. Security token refreshed." });
        break;
      case 'booking_status':
        setToast({ message: `Status update: ${action.status || 'Processed'}` });
        break;
      default:
        setToast({ message: "Processing network request..." });
    }
  };

  const handleToastAction = () => {
    if (toast?.bookingId) {
      // In a real app, this would navigate to the invoice or open a modal
      setToast({ message: "Opening secure document viewer..." });
    }
  };

  return (
    <>
      <ProfileView 
        user={user}
        role={userRole}
        bookings={bookings}
        onSignOut={handleSignOut}
        onAction={handleAction}
      />
      <AnimatePresence mode="wait">
        {toast && (
          <Toast 
            key={toast.message}
            toast={toast} 
            onClose={() => setToast(null)} 
            onAction={toast.bookingId ? handleToastAction : undefined}
            actionLabel={toast.bookingId ? "VIEW" : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
};
