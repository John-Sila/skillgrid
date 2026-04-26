import React, { useState, useEffect } from 'react';
import { WaitlistView } from './WaitlistView';
import { jobService } from './jobService';
import { auth } from '../../firebase/config';
import { Booking, Provider } from '../../shared/types';
import { Toast } from '../../shared/components/Toast';
import { AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';

export const WaitlistPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const { queue } = useParams<{ queue?: string }>();

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubBookings = jobService.getBookings(auth.currentUser.uid, 'client', setBookings);
    const unsubWaitlist = jobService.getWaitlist(auth.currentUser.uid, 'client', async (entries) => {
      setWaitlistEntries(entries);
      
      // Fetch provider data for each entry
      const providerIds = [...new Set(entries.map(e => e.providerId))];
      
      // Use functional state update to avoid stale closures and unnecessary re-renders
      setProviders(prevProviders => {
        const missingIds = providerIds.filter(id => !prevProviders[id]);
        
        if (missingIds.length > 0) {
          missingIds.forEach(async (id) => {
            const provider = await jobService.getProvider(id);
            if (provider) {
              setProviders(current => ({ ...current, [id]: provider }));
            }
          });
        }
        return prevProviders;
      });
    });

    return () => {
      unsubBookings();
      unsubWaitlist();
    };
  }, []);

  const handleCancelWaitlist = async (id: string) => {
    // Check if it's a mock ID
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(id)) {
      setWaitlistEntries(prev => prev.filter(e => e.id !== id));
      return;
    }

    try {
      await jobService.cancelWaitlistEntry(id);
      setToast({ message: "Waitlist reservation terminated successfully." });
    } catch (err) {
      console.error("Failed to cancel waitlist entry:", err);
      setToast({ message: "Failed to terminate reservation." });
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await jobService.cancelBooking(id);
      setToast({ message: "Service reservation cancelled successfully." });
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setToast({ message: "Failed to cancel reservation." });
    }
  };

  const handleAddBooking = async (booking: Booking) => {
    try {
      await jobService.createBooking(booking);
      setToast({ message: `EXCELLENT: ${providers[booking.providerId]?.name || 'Specialist'} has RECEIVED your booking request!` });
      
      // Simulate provider response
      setTimeout(() => {
        setToast({ message: `EXCELLENT: ${providers[booking.providerId]?.name || 'Specialist'} has ACCEPTED your booking request!` });
      }, 4000);
    } catch (error) {
      console.error(error);
      setToast({ message: "Failed to confirm booking." });
    }
  };

  return (
    <>
      <WaitlistView 
        bookings={bookings}
        waitlistEntries={waitlistEntries}
        providers={providers}
        onCancelWaitlist={handleCancelWaitlist}
        onCancelBooking={handleCancelBooking}
        onAddBooking={handleAddBooking}
        setToast={setToast}
        initialQueue={queue}
      />
      <AnimatePresence>
        {toast && (
          <Toast 
            toast={toast} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};
