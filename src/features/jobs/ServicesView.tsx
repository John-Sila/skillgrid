import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronLeft, 
  Star, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { Provider, Category, Booking, SortOption, TierLevel } from '../../shared/types';
import { CATEGORIES } from '../../shared/constants';
import { MOCK_PROVIDERS } from '../../shared/mocks';
import { matchingService } from '../../shared/utils/matchingService';
import { SearchProviderCard } from './components/SearchProviderCard';
import { BookingModal } from '../../shared/components/BookingModal';
import { TierSelector, SortSelector } from '../../shared/components/Selectors';

interface ServicesViewProps {
  selectedCategory: Category | null;
  setSelectedCategory: (c: Category | null) => void;
  filterTier: TierLevel | 'All';
  setFilterTier: (t: TierLevel | 'All') => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  sortBy: SortOption;
  setSortBy: (o: SortOption) => void;
  onAddBooking: (b: Booking) => void;
  onViewProfile: (p: Provider) => void;
  setActiveTab: (t: string) => void;
  userInterests: string[];
}

export const ServicesView: React.FC<ServicesViewProps> = ({ 
  selectedCategory, 
  setSelectedCategory, 
  filterTier, 
  setFilterTier, 
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onAddBooking, 
  onViewProfile,
  setActiveTab,
  userInterests
}) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [providerToBook, setProviderToBook] = useState<Provider | null>(null);

  const trendingProviders = useMemo(() => {
    return [...MOCK_PROVIDERS].sort((a, b) => b.reviews - a.reviews).slice(0, 2);
  }, []);

  const filteredProviders = useMemo(() => {
    let list = [...MOCK_PROVIDERS].map(p => {
        const score = matchingService.calculateMatchScore(userInterests, p, { 
            query: searchQuery, 
            category: selectedCategory || undefined 
        });
        return { ...p, matchScore: score };
    });

    // Mandatory Category Filter
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Tier Filter
    if (filterTier !== 'All') {
      list = list.filter(p => p.tier === filterTier);
    }

    // Keyword Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.bio.toLowerCase().includes(q) ||
        p.services.some(s => s.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'none') {
      list.sort((a, b) => (b as any).matchScore - (a as any).matchScore);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      list.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'distance') {
      list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
    
    return list;
  }, [selectedCategory, sortBy, filterTier, searchQuery, userInterests]);

  const SelectedCategoryIcon = useMemo(() => {
    return CATEGORIES.find(c => c.id === selectedCategory)?.icon || LayoutDashboard;
  }, [selectedCategory]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full p-5 md:p-8 lg:p-12 overflow-y-auto">
      <header className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight uppercase whitespace-nowrap">
              Professional Directory
            </h2>
            <div className="w-full md:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary-blue transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Search Skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-sidebar/40 border border-border-slate rounded-xl text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {selectedCategory && (
             <div className="flex items-center gap-4">
               <button onClick={() => { setSelectedCategory(null); setFilterTier('All'); }} className="px-6 py-2.5 bg-sidebar rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary-blue transition-all border border-border-slate flex items-center gap-2 group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  All Categories
               </button>
               <span className="text-[10px] font-black text-text-light uppercase tracking-[0.2em]">
                 Filter: <span className="text-primary-blue">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
               </span>
             </div>
           )}
        </div>
      </header>

      {!selectedCategory ? (
        <div className="space-y-12">
          <section className="animate-in fade-in slide-in-from-bottom-5 duration-700">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-1 bg-primary-blue rounded-full"></div>
                <h3 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em]">Browse Ecosystem</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
               {CATEGORIES.map((cat) => (
                 <button
                   key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                   className="p-5 md:p-6 border bg-text-main/[0.04] dark:bg-white/[0.04] border-border-slate hover:bg-primary-blue/5 rounded-[28px] md:rounded-[32px] flex flex-col items-center text-center group transition-all duration-300"
                 >
                   <div className={`w-12 h-12 md:w-14 md:h-14 ${cat.color} text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-lg transition-transform group-hover:scale-110`}>
                     <cat.icon size={20} />
                   </div>
                   <span className="font-extrabold text-[10px] md:text-[12px] uppercase tracking-widest text-text-main mb-1 text-center">{cat.label}</span>
                   <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter text-text-light opacity-60">
                     {MOCK_PROVIDERS.filter(p => p.category === cat.id).length} Active
                   </span>
                 </button>
               ))}
             </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8 space-y-6">
                <h4 className="text-[10px] font-black text-primary-blue uppercase tracking-[0.3em]">Trending Now</h4>
                <div className="space-y-4">
                   {trendingProviders.map((p, i) => (
                      <button 
                        key={i} 
                        onClick={() => onViewProfile(p)}
                        className="w-full flex items-center justify-between p-4 bg-sidebar/50 rounded-2xl border border-border-slate/10 hover:border-primary-blue/30 hover:bg-sidebar transition-all group"
                      >
                         <div className="flex items-center gap-3">
                            <div className="relative">
                               <img src={p.image} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                               {p.joined === '2026' && (
                                 <div className="absolute -top-1 -right-1 bg-accent-green text-[6px] font-black text-white px-1 rounded-sm border border-sidebar">NEW</div>
                               )}
                            </div>
                            <div className="text-left">
                               <p className="text-xs font-black text-text-main uppercase group-hover:text-primary-blue transition-colors">{p.name}</p>
                               <div className="flex items-center gap-2">
                                  <p className="text-[9px] text-text-light font-bold uppercase">{p.category}</p>
                                  {p.reviews > 100 && (
                                    <span className="text-[7px] font-black text-primary-blue bg-primary-blue/10 px-1.5 rounded uppercase">Popular</span>
                                  )}
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-primary-blue">Ksh {p.pricePerHour}/hr</p>
                            <span className="text-[7px] font-black text-accent-green uppercase flex items-center justify-end gap-1">
                               <Star size={8} fill="currentColor" /> {p.rating}
                            </span>
                         </div>
                      </button>
                   ))}
                </div>
             </div>

             <div className="bg-primary-blue/5 border border-primary-blue/10 rounded-[40px] p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-primary-blue rounded-2xl flex items-center justify-center text-white">
                      <ShieldCheck size={24} />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-text-main uppercase tracking-tight">The RSA Elite Guarantee</h4>
                      <p className="text-[10px] text-text-light uppercase font-bold tracking-widest">Securing every transaction</p>
                   </div>
                </div>
                <p className="text-xs text-text-main font-medium leading-relaxed italic opacity-80 mb-6">
                   "We've implemented deep cryptographic verification for all service providers. Your payments remain in zero-knowledge escrow until you confirm the milestone completion."
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-sidebar rounded-2xl text-center">
                      <p className="text-lg font-black text-text-main leading-none">2.4k+</p>
                      <p className="text-[8px] font-black text-text-light uppercase tracking-widest mt-1">Verified Pros</p>
                   </div>
                   <div className="p-4 bg-sidebar rounded-2xl text-center">
                      <p className="text-lg font-black text-text-main leading-none">99.8%</p>
                      <p className="text-[8px] font-black text-text-light uppercase tracking-widest mt-1">SLA Success</p>
                   </div>
                </div>
             </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 p-4 bg-primary-blue/5 rounded-2xl border border-primary-blue/10">
             <div className="w-10 h-10 bg-primary-blue text-white rounded-xl flex items-center justify-center">
                <SelectedCategoryIcon size={20} />
             </div>
             <div>
                <h3 className="text-sm font-black text-text-main uppercase leading-none mb-1">{selectedCategory} Force</h3>
                <p className="text-[9px] text-text-light uppercase font-bold tracking-widest">{filteredProviders.length} Active specialists found</p>
             </div>
             <div className="ml-auto">
                <TierSelector current={filterTier as TierLevel} onChange={setFilterTier as any} />
             </div>
          </div>

          <div className="flex items-center justify-between px-2">
             <div className="flex gap-4">
               <SortSelector current={sortBy} onChange={setSortBy} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProviders.map(p => (
              <SearchProviderCard 
                key={p.id} 
                provider={p} 
                onViewProfile={() => onViewProfile(p)}
                onBook={() => {
                  setProviderToBook(p);
                  setIsBookingModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {providerToBook && isBookingModalOpen && (
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          provider={providerToBook} 
          onConfirm={onAddBooking}
          onNavigateToWaitlist={() => setActiveTab('waitlist')}
        />
      )}
    </motion.div>
  );
};
