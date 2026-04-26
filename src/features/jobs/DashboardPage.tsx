import React, { useState, useEffect } from 'react';
import { ProviderDashboardView } from './ProviderDashboardView';
import { jobService } from './jobService';
import { auth, db } from '../../firebase/config';
import { Booking } from '../../shared/types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isDeployed, setIsDeployed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubBookings = jobService.getBookings(auth.currentUser.uid, 'provider', setBookings);

    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setIsDeployed(data.isAvailable || false);
        setBlockedDates(data.blockedDates || []);
      }
    };

    fetchProfile();
    return () => unsubBookings();
  }, []);

  const toggleDeployment = async () => {
    if (!auth.currentUser) return;
    const newStatus = !isDeployed;
    await jobService.updateProviderAvailability(auth.currentUser.uid, newStatus);
    setIsDeployed(newStatus);
  };

  const toggleBlockDate = async (date: string) => {
    if (!auth.currentUser) return;
    const newBlocked = blockedDates.includes(date) 
      ? blockedDates.filter(d => d !== date)
      : [...blockedDates, date];
    
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { blockedDates: newBlocked });
    setBlockedDates(newBlocked);
  };

  const setBlockedDatesBatch = async (dates: string[]) => {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { blockedDates: dates });
    setBlockedDates(dates);
  };

  return (
    <ProviderDashboardView 
      onProfileClick={() => navigate('/profile')}
      isDeployed={isDeployed}
      toggleDeployment={toggleDeployment}
      bookings={bookings}
      blockedDates={blockedDates}
      toggleBlockDate={toggleBlockDate}
      setBlockedDatesBatch={setBlockedDatesBatch}
      profile={profile}
    />
  );
};
