import React, { useState } from 'react';
import { DiscoverView } from './DiscoverView';
import { useAuth } from '../auth/AuthProvider';
import { SortOption, Booking, Provider, Category } from '../../shared/types';
import { jobService } from './jobService';
import { Toast } from '../../shared/components/Toast';
import { useNavigate } from 'react-router-dom';

export const DiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [toast, setToast] = useState<{ message: string, bookingId?: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const navigate = useNavigate();

  const handleAddBooking = async (booking: Booking) => {
    try {
      await jobService.createBooking(booking);
      setToast({ message: `${booking.category} booking confirmed successfully!`, bookingId: booking.id });
      setTimeout(() => setToast(null), 6000);
    } catch (err) {
      console.error(err);
      setToast({ message: "Booking failed." });
    }
  };

  const handleViewProfile = (p: Provider) => {
    console.log('Viewing profile:', p);
    // Modal or navigation
  };

  const handleWaitlist = async (p: Provider) => {
    try {
      await jobService.addToWaitlist(p.id, p.tier);
      setToast({ message: `Added to ${p.name}'s ${p.tier} Waitlist.` });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <DiscoverView 
        sortBy={sortBy}
        onAddBooking={handleAddBooking}
        onViewProfile={handleViewProfile}
        setActiveTab={(t) => navigate(`/${t}`)}
        onWaitlist={handleWaitlist}
        userInterests={[]} // Should come from user data
        selectedCategory={selectedCategory}
      />
      <Toast 
        toast={toast} 
        onClose={() => setToast(null)} 
        onAction={() => navigate('/waitlist')}
        actionLabel="Track in Waitlist"
      />
    </>
  );
};
