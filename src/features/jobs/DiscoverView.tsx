import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal,
  Bell,
  Star,
  ShieldCheck,
  Zap,
  LineChart,
  Lock,
  MapPin,
  ChevronDown,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Provider, SortOption, Booking } from '../../shared/types';
import { MOCK_PROVIDERS } from '../../shared/mocks';
import { auth } from '../../firebase/config';
import { SwipeCard } from './components/SwipeCard';
import { BookingModal } from '../../shared/components/BookingModal';
import { jobService } from './jobService';

interface DiscoverViewProps {
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  setToast: (t: { message: string, bookingId?: string }) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ 
  sortBy, 
  setSortBy,
  setToast
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [providerToBook, setProviderToBook] = useState<Provider | null>(null);
  const navigate = useNavigate();

  const user = auth.currentUser;
  const providers = MOCK_PROVIDERS;

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % providers.length);
  }, [providers.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + providers.length) % providers.length);
  }, [providers.length]);

  const handleWaitlist = useCallback((provider: Provider) => {
    setToast({ message: `Access protocol initiated: ${provider.name} added to elite waitlist.` });
  }, [setToast]);

  const handleBook = useCallback((provider: Provider) => {
    setProviderToBook(provider);
    setIsBookingModalOpen(true);
  }, []);

  const handleSwipe = useCallback((dir: 'left' | 'right' | 'up', provider: Provider) => {
    if (dir === 'left') {
      handlePrev();
    } else if (dir === 'right') {
      handleBook(provider);
    } else if (dir === 'up') {
      handleWaitlist(provider);
    }
  }, [handlePrev, handleBook, handleWaitlist]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBookingModalOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleBook(providers[currentIndex]);
          break;
        case 'ArrowUp':
          handleWaitlist(providers[currentIndex]);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, providers, handlePrev, handleBook, handleWaitlist, isBookingModalOpen]);

  return (
    <div className="h-full w-full flex flex-col bg-[#F8FAFC] overflow-x-hidden">
      {/* Top Header Section - Filter & Profile */}
      <div className="px-6 md:px-10 py-6 md:py-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">
            <SlidersHorizontal size={14} strokeWidth={3} />
            Filter
          </button>
          
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 px-6 py-3 pr-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer shadow-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="none">Recommended</option>
              <option value="distance">Distance</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="age">Newest</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setToast({ message: "Network notifications synchronized. No new alerts." })}
            className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            <Bell size={20} />
          </button>
          
          <Link to="/profile" className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform">
            <img 
              src={user?.photoURL || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100"} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </Link>
        </div>
      </div>

      <div className="px-6 md:px-10 flex-1 flex flex-col">
        <div className="mb-8 flex items-end justify-between">
           <div>
             <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Discover</h1>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Elite Talent Matrix</p>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Stack Status</span>
             <div className="flex gap-1">
               {providers.map((_, i) => (
                 <div 
                   key={i} 
                   className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`} 
                 />
               ))}
             </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Swipeable Cards Container */}
          <div className="relative flex-1 min-h-[500px] md:min-h-[600px] flex items-center justify-center">
            {/* Background decoration for futuristic feel */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
               <div className="w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px] animate-pulse" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/5 rounded-full" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/10 rounded-full" />
            </div>

            <AnimatePresence mode="popLayout">
              {providers.slice(currentIndex, currentIndex + 2).map((provider, idx) => (
                <SwipeCard
                  key={provider.id}
                  provider={provider}
                  isTop={idx === 0}
                  onSwipe={(dir) => handleSwipe(dir, provider)}
                  onBook={() => handleBook(provider)}
                  onViewProfile={() => navigate(`/profile/${provider.id}`)}
                  onWaitlist={() => handleWaitlist(provider)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Sub Cards Section - PC Only */}
          <section className="hidden lg:grid grid-cols-3 gap-8 mb-12 mt-12">
             <div 
               onClick={() => setToast({ message: "Skill Matrix Expansion module initializing..." })}
               className="p-8 rounded-[32px] bg-white border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer shadow-sm"
             >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <Zap size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">Skill<br/>Advancement</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">3,000+ Courses</p>
             </div>

             <div 
               onClick={() => setToast({ message: "Advanced Analytics node synchronization in progress..." })}
               className="p-8 rounded-[32px] bg-white border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer shadow-sm"
             >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <LineChart size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">Advanced<br/>Insights</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Track Trends</p>
             </div>

             <div 
               onClick={() => setToast({ message: "Security protocol verification successful. System nominal." })}
               className="p-8 rounded-[32px] bg-white border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer shadow-sm"
             >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <Lock size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">Security<br/>& Trust</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Data Safety</p>
             </div>
          </section>

          {/* Footer Banner - PC Only */}
          <section className="hidden lg:block mb-14">
             <div className="bg-white rounded-[32px] p-10 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-10 shadow-sm">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                      <ShieldCheck size={36} />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">RSA Elite Guarantee</h4>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Securing every transaction</p>
                   </div>
                </div>

                <div className="flex flex-wrap gap-10 md:gap-20">
                   <div>
                      <div className="text-3xl font-black text-slate-900 leading-none mb-2">2.4k+</div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Pros</p>
                   </div>
                   <div>
                      <div className="text-3xl font-black text-slate-900 leading-none mb-2">99.8%</div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SLA Success</p>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {providerToBook && isBookingModalOpen && (
          <BookingModal 
            isOpen={isBookingModalOpen} 
            onClose={() => {
              setIsBookingModalOpen(false);
              setProviderToBook(null);
            }} 
            provider={providerToBook} 
            onConfirm={async (booking) => {
               try {
                 await jobService.createBooking(booking);
                 setToast({ 
                   message: "Quantum booking established. Specialised personnel dispatched.",
                   bookingId: booking.id 
                 });
                 setIsBookingModalOpen(false);
                 setProviderToBook(null);
               } catch (error) {
                 console.error("Booking failed:", error);
                 setToast({ message: "Quantum transmission failed. Please retry." });
               }
            }}
            onNavigateToWaitlist={() => navigate('/waitlist')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

