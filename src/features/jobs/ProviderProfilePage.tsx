import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProviderProfileDetail } from './components/ProviderProfileDetail';
import { MOCK_PROVIDERS } from '../../shared/mocks';
import { Provider, Booking } from '../../shared/types';
import { jobService } from './jobService';
import { Toast } from '../../shared/components/Toast';
import { AnimatePresence } from 'framer-motion';

export const ProviderProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        // Try mocks first
        const mockProvider = MOCK_PROVIDERS.find(p => p.id === id);
        if (mockProvider) {
          setProvider(mockProvider);
          setLoading(false);
          return;
        }

        // If not in mocks, fetch from Firestore
        const realProvider = await jobService.getProvider(id);
        if (realProvider) {
          setProvider(realProvider);
        } else {
          navigate('/discover');
        }
      } catch (err) {
        console.error("Error fetching provider:", err);
        navigate('/discover');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id, navigate]);

  const handleAddBooking = async (booking: Booking) => {
    try {
      await jobService.createBooking(booking);
      setToast({ message: `${booking.category} booking confirmed successfully!` });
      setTimeout(() => navigate('/waitlist'), 2000);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to confirm booking." });
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#07090E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Profile...</p>
        </div>
      </div>
    );
  }

  if (!provider) return null;

  return (
    <>
      <ProviderProfileDetail 
        provider={provider}
        onClose={() => navigate(-1)}
        onAddBooking={handleAddBooking}
        onRecommend={() => console.log('Recommended')}
        setActiveTab={(t) => navigate(`/${t}`)}
        setToast={setToast}
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
