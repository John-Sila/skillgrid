import React, { useState, useEffect } from 'react';
import { ServicesView } from './ServicesView';
import { Category, TierLevel, SortOption, Booking, Provider } from '../../shared/types';
import { jobService } from './jobService';
import { auth } from '../../firebase/config';
import { Toast } from '../../shared/components/Toast';
import { useNavigate } from 'react-router-dom';

export const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filterTier, setFilterTier] = useState<TierLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [toast, setToast] = useState<{ message: string, bookingId?: string } | null>(null);
  const navigate = useNavigate();

  const handleAddBooking = async (booking: Booking) => {
    try {
      await jobService.createBooking(booking);
      setToast({ message: `${booking.category} booking confirmed successfully!`, bookingId: booking.id });
      setTimeout(() => setToast(null), 6000);
    } catch (error) {
      console.error(error);
      setToast({ message: "Failed to confirm booking." });
    }
  };

  const handleViewProfile = (provider: Provider) => {
    // Navigate to profile or show modal
    console.log('Viewing profile:', provider);
  };

  return (
    <>
      <ServicesView 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filterTier={filterTier}
        setFilterTier={setFilterTier}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddBooking={handleAddBooking}
        onViewProfile={handleViewProfile}
        setActiveTab={(tab) => navigate(`/${tab}`)}
        userInterests={[]} // Should come from user profile
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
