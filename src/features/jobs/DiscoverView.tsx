import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCcw,
  Sparkles,
  Search
} from 'lucide-react';
import { Provider, Category, Booking, SortOption } from '../../shared/types';
import { MOCK_PROVIDERS } from '../../shared/mocks';
import { matchingService } from '../../shared/utils/matchingService';
import { SwipeCard } from './components/SwipeCard';
import { BookingModal } from '../../shared/components/BookingModal';

interface DiscoverViewProps {
  sortBy: SortOption;
  onAddBooking: (b: Booking) => void;
  onViewProfile: (p: Provider) => void;
  setActiveTab: (t: string) => void;
  onWaitlist: (p: Provider) => void;
  userInterests: string[];
  selectedCategory: Category | null;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ 
  sortBy, 
  onAddBooking, 
  onViewProfile, 
  setActiveTab, 
  onWaitlist, 
  userInterests, 
  selectedCategory 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [providerToBook, setProviderToBook] = useState<Provider | null>(null);

  const providers = useMemo(() => {
    const matches = matchingService.getMatchesForClient(userInterests, MOCK_PROVIDERS, { category: selectedCategory || undefined });
    
    let list = matches.map(m => {
      const p = MOCK_PROVIDERS.find(p => p.id === m.targetId)!;
      return { ...p, matchScore: m.score };
    });

    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'price') list.sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortBy === 'distance') {
      list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
    return list as (Provider & { matchScore?: number })[];
  }, [sortBy, userInterests, selectedCategory]);

  useEffect(() => {
    if (providers.length === 0) {
      setCurrentIndex(-1);
    } else {
      setCurrentIndex(0);
    }
  }, [sortBy, selectedCategory, providers.length]);

  const handleSwipe = (direction: 'right' | 'left') => {
    if (direction === 'right' && providers[currentIndex]) {
      setProviderToBook(providers[currentIndex]);
      setIsBookingModalOpen(true);
    }

    if (currentIndex < providers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(-1); 
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8 lg:p-10 relative overflow-hidden">
      <div className="flex-1 relative w-full h-full flex items-center justify-center min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {currentIndex === -1 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center max-w-xs"
            >
              <div className="w-24 h-24 bg-primary-blue/10 rounded-full flex items-center justify-center mb-6 border border-primary-blue/20">
                <RefreshCcw size={40} className="text-primary-blue" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2 leading-tight">
                {providers.length === 0 ? "Expanding Search..." : "All caught up!"}
              </h3>
              <p className="text-sm text-text-light mb-8 leading-relaxed">
                {providers.length === 0 
                  ? "No exact matches found for these filters. Try broadening your criteria or categories." 
                  : "We've shown you all the top pros in your area. Want to see them again?"}
              </p>
              <button 
                onClick={() => setCurrentIndex(0)}
                className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-transform"
              >
                REFRESH DISCOVERY
              </button>
            </motion.div>
          ) : (
            providers.slice(currentIndex, currentIndex + 2).reverse().map((provider, i) => (
              <SwipeCard 
                key={provider.id} 
                provider={provider} 
                isTop={i === (providers.slice(currentIndex, currentIndex + 2).length - 1)}
                onSwipe={handleSwipe}
                onBook={() => {
                   setProviderToBook(provider);
                   setIsBookingModalOpen(true);
                }}
                onViewProfile={() => onViewProfile(provider)}
                onWaitlist={() => onWaitlist(provider)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {currentIndex !== -1 && (
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-text-light/20 pointer-events-none hidden lg:flex">
          <div className="flex flex-col items-center gap-1 group">
            <span className="text-[9px] uppercase font-black rotate-90 mb-10 tracking-widest text-text-light/40">Swipe Right to Like</span>
            <div className="w-1 h-32 bg-text-light/10 rounded-full relative overflow-hidden">
               <motion.div 
                animate={{ y: [-100, 100] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-blue to-transparent" 
               />
            </div>
          </div>
        </div>
      )}

      {currentIndex !== -1 && (
        <div className="mt-8 md:mt-12 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-forwards">
           <div className="flex items-center gap-2 mb-4 group cursor-help">
              <Sparkles size={14} className="text-primary-blue animate-pulse" />
              <span className="text-[10px] font-black text-text-light uppercase tracking-[0.3em]">Discovery Insights</span>
           </div>
           <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-left border-l border-border-slate/10 pl-4">
                 <div className="text-xs font-black text-text-main uppercase tracking-tighter">Verified Only</div>
                 <p className="text-[9px] text-text-light font-medium uppercase mt-1">100% Background Checked</p>
              </div>
              <div className="text-left border-l border-border-slate/10 pl-4">
                 <div className="text-xs font-black text-text-main uppercase tracking-tighter">Price Protection</div>
                 <p className="text-[9px] text-text-light font-medium uppercase mt-1">Escrow Milestone Payments</p>
              </div>
              <div className="text-left border-l border-border-slate/10 pl-4">
                 <div className="text-xs font-black text-text-main uppercase tracking-tighter">Elite Tiering</div>
                 <p className="text-[9px] text-text-light font-medium uppercase mt-1">Top 5% Talent Globally</p>
              </div>
           </div>
        </div>
      )}

      <AnimatePresence>
        {providerToBook && isBookingModalOpen && (
          <BookingModal 
            isOpen={isBookingModalOpen} 
            onClose={() => setIsBookingModalOpen(false)} 
            provider={providerToBook} 
            onConfirm={(booking) => {
               onAddBooking(booking);
            }}
            onNavigateToWaitlist={() => setActiveTab('waitlist')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
