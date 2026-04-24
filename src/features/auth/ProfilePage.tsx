import React, { useState, useEffect } from 'react';
import { ProfileView } from './ProfileView';
import { useAuth } from './AuthProvider';
import { jobService } from '../jobs/jobService';
import { Booking } from '../../shared/types';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

export const ProfilePage: React.FC = () => {
  const { user, userRole } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    return jobService.getBookings(user.uid, userRole === 'client' ? 'client' : 'provider', setBookings);
  }, [user, userRole]);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <ProfileView 
      role={userRole}
      bookings={bookings}
      onSignOut={handleSignOut}
    />
  );
};
