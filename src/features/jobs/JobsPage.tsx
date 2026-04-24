import React, { useState, useEffect } from 'react';
import { JobsManagementView } from './JobsManagementView';
import { jobService } from './jobService';
import { auth } from '../../firebase/config';
import { Booking } from '../../shared/types';
import { Toast } from '../../shared/components/Toast';

export const JobsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    return jobService.getBookings(auth.currentUser.uid, 'provider', setBookings);
  }, []);

  return (
    <>
      <JobsManagementView 
        bookings={bookings}
        setToast={setToast}
      />
      <Toast 
        toast={toast} 
        onClose={() => setToast(null)} 
      />
    </>
  );
};
