import React, { useState } from 'react';
import { DiscoverView } from './DiscoverView';
import { useAuth } from '../auth/AuthProvider';
import { SortOption } from '../../shared/types';
import { Toast } from '../../shared/components/Toast';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export const DiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [toast, setToast] = useState<{ message: string, bookingId?: string } | null>(null);
  const navigate = useNavigate();

  return (
    <>
      <DiscoverView 
        sortBy={sortBy}
        setSortBy={setSortBy}
        setToast={setToast}
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
