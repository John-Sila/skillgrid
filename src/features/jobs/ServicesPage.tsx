import React, { useState, useEffect } from 'react';
import { ServicesView } from './ServicesView';
import { Category, TierLevel, SortOption, Booking, Provider } from '../../shared/types';
import { jobService } from './jobService';
import { auth } from '../../firebase/config';
import { Toast } from '../../shared/components/Toast';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export const ServicesPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, bookingId?: string } | null>(null);
  const navigate = useNavigate();
  const { tier } = useParams<{ tier?: string }>();

  const handleAddBooking = async (booking: Booking) => {
    try {
      await jobService.createBooking(booking);
      setToast({ message: `Booking confirmed successfully!`, bookingId: booking.id });
      setTimeout(() => setToast(null), 6000);
    } catch (error) {
      console.error(error);
      setToast({ message: "Failed to confirm booking." });
    }
  };

  const handleViewProfile = (provider: Provider) => {
    navigate(`/provider/${provider.id}`);
  };

  return (
    <>
      <ServicesView 
        onAddBooking={handleAddBooking}
        onViewProfile={handleViewProfile}
        setToast={setToast}
        initialTier={tier as any}
      />
      <AnimatePresence>
        {toast && (
          <Toast 
            toast={toast} 
            onClose={() => setToast(null)} 
            onAction={() => navigate('/waitlist')}
            actionLabel="Track in Waitlist"
          />
        )}
      </AnimatePresence>
    </>
  );
};
