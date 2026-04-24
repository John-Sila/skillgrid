import React, { useState, useEffect } from 'react';
import { WaitlistView } from './WaitlistView';
import { jobService } from './jobService';
import { auth } from '../../firebase/config';
import { Booking } from '../../shared/types';

export const WaitlistPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubBookings = jobService.getBookings(auth.currentUser.uid, 'client', setBookings);
    const unsubWaitlist = jobService.getWaitlist(setWaitlistEntries);

    return () => {
      unsubBookings();
      unsubWaitlist();
    };
  }, []);

  return (
    <WaitlistView 
      bookings={bookings}
      waitlistEntries={waitlistEntries}
    />
  );
};
