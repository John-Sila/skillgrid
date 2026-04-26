import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  ShieldCheck, 
  History, 
  Zap, 
  Search, 
  Briefcase, 
  MessageSquare, 
  User, 
  Bell,
  X,
  AlertTriangle,
  Filter,
  ChevronDown,
  Phone,
  Calendar,
  MoreVertical,
  Copy,
  Check,
  Star
} from 'lucide-react';
import { Booking, Provider, TierLevel, SortOption } from '../../shared/types';
import { useNavigate } from 'react-router-dom';
import { BookingModal } from '../../shared/components/BookingModal';

interface WaitlistViewProps {
  bookings: Booking[];
  waitlistEntries: any[];
  providers: Record<string, Provider>;
  onCancelWaitlist?: (id: string) => void;
  onCancelBooking?: (id: string) => void;
  onAddBooking: (booking: Booking) => void;
  setToast: (t: { message: string } | null) => void;
  initialQueue?: string;
}

export const WaitlistView: React.FC<WaitlistViewProps> = ({ 
  bookings, 
  waitlistEntries, 
  providers, 
  onCancelWaitlist, 
  onCancelBooking, 
  onAddBooking,
  setToast,
  initialQueue
}) => {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [cancelType, setCancelType] = useState<'waitlist' | 'booking'>('waitlist');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTier, setActiveTier] = useState<TierLevel | 'All'>(
    initialQueue ? (initialQueue.charAt(0).toUpperCase() + initialQueue.slice(1).toLowerCase().replace(/-/g, ' ')) as any : 'All'
  );
  const [sortBy, setSortBy] = useState<SortOption>('Recommended');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Feature States
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{sender: 'me' | 'provider', text: string, status?: 'sent' | 'delivered' | 'read'}[]>([]);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  
  const tiers: (TierLevel | 'All')[] = ['All', 'Basic', 'Premium', 'Luxury', 'Other Services'];
  const sortOptions: SortOption[] = ['Top Rated', 'Newest', 'Lowest Price'];

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);

  useEffect(() => {
    if (activeTier) {
      setIsLoadingTiers(true);
      const timer = setTimeout(() => setIsLoadingTiers(false), 800);
      return () => clearTimeout(timer);
    }
  }, [activeTier]);

  // 36-hour cancellation logic
  const canCancel = (date: string, time: string) => {
    const appointmentDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diffInHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours > 36;
  };

  const getTimeUntilLock = (date: string, time: string) => {
    const appointmentDate = new Date(`${date}T${time}`);
    const lockDate = new Date(appointmentDate.getTime() - (36 * 60 * 60 * 1000));
    const now = new Date();
    const diff = lockDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'LOCKED';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    if (isJobModalOpen && selectedJob?.date && selectedJob?.time) {
      const timer = setInterval(() => {
        setTimeLeft(getTimeUntilLock(selectedJob.date, selectedJob.time));
      }, 60000);
      setTimeLeft(getTimeUntilLock(selectedJob.date, selectedJob.time));
      return () => clearInterval(timer);
    }
  }, [isJobModalOpen, selectedJob]);

  const mockWaitlist = useMemo(() => {
    const mockProviders = [
      { id: 'm1', name: 'Dr. Sarah Chen', rate: 15000, rating: 4.9, tier: 'Luxury', category: 'Medical' },
      { id: 'm2', name: 'Alex Rivera', rate: 8000, rating: 4.7, tier: 'Premium', category: 'IT Support' },
      { id: 'm3', name: 'James Wilson', rate: 12000, rating: 4.8, tier: 'Luxury', category: 'Consulting' },
      { id: 'm4', name: 'Maria Garcia', rate: 5000, rating: 4.5, tier: 'Basic', category: 'Education' },
      { id: 'm5', name: 'David Kim', rate: 18000, rating: 5.0, tier: 'Luxury', category: 'Legal' },
      { id: 'm6', name: 'Elena Petrova', rate: 7500, rating: 4.6, tier: 'Premium', category: 'Design' },
      { id: 'm7', name: 'Marcus Thorne', rate: 25000, rating: 4.9, tier: 'Luxury', category: 'Executive' },
      { id: 'm8', name: 'Aisha Juma', rate: 4500, rating: 4.4, tier: 'Basic', category: 'Household' },
      { id: 'm9', name: 'Kenji Sato', rate: 10000, rating: 4.8, tier: 'Premium', category: 'Development' },
      { id: 'm10', name: 'Olivia White', rate: 13500, rating: 4.7, tier: 'Luxury', category: 'Architecture' },
      { id: 'm11', name: 'Lucas Meyer', rate: 14000, rating: 4.8, tier: 'Premium', category: 'Engineering' },
      { id: 'm12', name: 'Sophia Loren', rate: 16000, rating: 4.9, tier: 'Luxury', category: 'Marketing' },
      { id: 'm13', name: 'Ivan Drago', rate: 6000, rating: 4.6, tier: 'Basic', category: 'Security' },
      { id: 'm14', name: 'Chloe Moretz', rate: 9000, rating: 4.7, tier: 'Premium', category: 'PR' },
      { id: 'm15', name: 'Hans Zimmer', rate: 22000, rating: 5.0, tier: 'Luxury', category: 'Music' },
      { id: 'm16', name: 'Nina Simone', rate: 11000, rating: 4.8, tier: 'Premium', category: 'Vocals' },
      { id: 'm17', name: 'Bruce Wayne', rate: 50000, rating: 5.0, tier: 'Luxury', category: 'Philanthropy' },
      { id: 'm18', name: 'Clark Kent', rate: 4000, rating: 4.5, tier: 'Basic', category: 'Journalism' },
      { id: 'm19', name: 'Diana Prince', rate: 19000, rating: 4.9, tier: 'Luxury', category: 'History' },
      { id: 'm20', name: 'Peter Parker', rate: 3000, rating: 4.4, tier: 'Basic', category: 'Photography' },
      { id: 'm21', name: 'Tony Stark', rate: 45000, rating: 5.0, tier: 'Luxury', category: 'Innovation' },
      { id: 'm22', name: 'Natasha Romanoff', rate: 15000, rating: 4.9, tier: 'Premium', category: 'Security' },
      { id: 'm23', name: 'Steve Rogers', rate: 12000, rating: 4.8, tier: 'Premium', category: 'Leadership' },
      { id: 'm24', name: 'Wanda Maximoff', rate: 20000, rating: 4.9, tier: 'Luxury', category: 'Strategy' },
      { id: 'm25', name: 'Stephen Strange', rate: 35000, rating: 5.0, tier: 'Luxury', category: 'Medicine' },
      { id: 'm26', name: 'Thor Odinson', rate: 28000, rating: 4.8, tier: 'Luxury', category: 'Energy' },
      { id: 'm27', name: 'Carol Danvers', rate: 30000, rating: 4.9, tier: 'Luxury', category: 'Aviation' },
      { id: 'm28', name: 'Sam Wilson', rate: 9500, rating: 4.7, tier: 'Premium', category: 'Logistics' },
      { id: 'm29', name: 'Bucky Barnes', rate: 8500, rating: 4.6, tier: 'Premium', category: 'Operations' },
      { id: 'm30', name: 'T\'Challa', rate: 55000, rating: 5.0, tier: 'Luxury', category: 'Technology' },
      { id: 'm31', name: 'Peter Quill', rate: 7000, rating: 4.3, tier: 'Premium', category: 'Navigation' },
      { id: 'm32', name: 'Gamora', rate: 14000, rating: 4.9, tier: 'Premium', category: 'Tactics' }
    ];

    return mockProviders.map((p, idx) => ({
      id: (idx + 1).toString(),
      providerId: p.id,
      tier: p.tier,
      status: idx % 3 === 0 ? 'Confirmed' : idx % 3 === 1 ? 'Pending' : 'In Queue',
      rate: p.rate,
      name: p.name,
      rating: p.rating,
      category: p.category,
      date: '2026-04-30',
      time: '14:00',
      location: 'Nairobi, Kenya',
      bio: 'Expert professional with over 10 years of experience in ' + p.category,
      tags: idx === 0 ? ['Top Rated'] : idx === 1 ? ['Recommended'] : idx === 2 ? ['New'] : []
    }));
  }, []);

  const combinedWaitlist = useMemo(() => {
    const combined = [...waitlistEntries.map(e => ({
      ...e,
      name: providers[e.providerId]?.name || 'Specialist',
      rating: providers[e.providerId]?.rating || 0,
      category: providers[e.providerId]?.category || 'Service',
      rate: providers[e.providerId]?.rate || 0
    })), ...mockWaitlist];
    
    // Filtering
    let filtered = combined.filter(entry => {
      const entryName = entry.name || '';
      const entryTier = entry.tier || '';
      
      const matchesTier = activeTier === 'All' || 
                         (activeTier === 'Other Services' ? entryTier === 'Other' : entryTier === activeTier);
      const matchesSearch = entryName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           entryTier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });

    // Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Top Rated':
          return (b.rating || 0) - (a.rating || 0);
        case 'Lowest Price':
          return (a.rate || 0) - (b.rate || 0);
        case 'Newest':
          return (String(b.id) > String(a.id) ? 1 : -1);
        default: // Top Rated
          return (b.rating || 0) - (a.rating || 0);
      }
    }).slice(0, 40);
  }, [waitlistEntries, mockWaitlist, activeTier, searchQuery, sortBy, providers]);

  const filteredWaitlist = combinedWaitlist;

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMsg = { sender: 'me' as const, text: chatMessage, status: 'sent' as const };
    setChatHistory(prev => [...prev, newMsg]);
    setChatMessage('');
    
    // Simulate status updates
    setTimeout(() => {
      setChatHistory(prev => prev.map((msg, i) => 
        i === prev.length - 1 ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setChatHistory(prev => prev.map((msg, i) => 
        i === prev.length - 1 ? { ...msg, status: 'read' } : msg
      ));
    }, 2000);

    // Simulate typing and response
    setTimeout(() => setIsTyping(true), 2500);
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [...prev, { 
        sender: 'provider', 
        text: "Thanks for reaching out! I've received your request from the queue. How can I assist you today?" 
      }]);
    }, 4500);
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setToast({ message: "Phone number copied to clipboard." });
  };

  const handleCancelAction = () => {
    if (selectedEntry) {
      if (cancelType === 'waitlist' && onCancelWaitlist) {
        onCancelWaitlist(selectedEntry.id);
      } else if (cancelType === 'booking' && onCancelBooking) {
        onCancelBooking(selectedEntry.id);
      }
      setShowCancelModal(false);
      setSelectedEntry(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F0F7FF] selection:bg-blue-100 selection:text-blue-600">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>
      </div>

      <main className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto w-full space-y-10 relative">
        <AnimatePresence>
          {isLoadingTiers && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-[#F0F7FF]/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Reconfiguring Matrix...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Search */}
        <div className="lg:hidden">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search queues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Title Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-blue-600/20">OPERATIONAL HUB</span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-none mb-4">
              OPERATIONAL <span className="text-blue-600">QUEUES</span>
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-12 h-[2px] bg-blue-600" />
              PENDING RESERVATIONS & WAITLIST STATUS
            </p>
          </div>

          {/* Tier Tabs */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
            {tiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  activeTier === tier 
                  ? 'text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {activeTier === tier && (
                  <motion.div 
                    layoutId="active-tier-tab"
                    className="absolute inset-0 bg-blue-600 rounded-xl"
                  />
                )}
                <span className="relative z-10">{tier}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Priority Waitlist Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
              PRIORITY WAITLIST
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] rounded-full">{combinedWaitlist.length} ACTIVE</span>
            </h3>

            {/* Sorting Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border transition-all group shadow-sm ${
                  isFilterOpen ? 'border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'border-slate-100 hover:border-blue-600'
                }`}
              >
                <Filter size={16} className={`${isFilterOpen ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{sortBy}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 p-2 overflow-hidden"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          sortBy === option ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Job Detail Modal */}
      <AnimatePresence>
        {isJobModalOpen && selectedJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJobModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Briefcase size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Job Details</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedJob.category || 'Professional Service'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsJobModalOpen(false)}
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Service Details */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                          <p className="text-sm font-black text-slate-900">{selectedJob.date || 'To be scheduled'} at {selectedJob.time || 'TBD'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate</p>
                          <p className="text-sm font-black text-slate-900">Ksh {selectedJob.rate?.toLocaleString() || 'Negotiable'} / hr</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <Zap size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                          <p className="text-sm font-black text-slate-900">{selectedJob.location || 'Remote / On-site'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Provider Preview */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Specialist Profile</h3>
                    <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={`https://i.pravatar.cc/150?u=${selectedJob.providerId}`} 
                          alt={selectedJob.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedJob.name}</h4>
                          <div className="flex items-center gap-2">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black text-slate-700">{selectedJob.rating}</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{selectedJob.tier}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                        {selectedJob.bio || 'Expert professional dedicated to delivering high-quality results for all SkillGrid clients.'}
                      </p>
                      <button 
                        onClick={() => navigate(`/provider/${selectedJob.providerId}`)}
                        className="w-full py-2.5 bg-white border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                      >
                        View Full Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cancellation Logic UI */}
                <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    {selectedJob.date && selectedJob.time ? (
                      <div className="space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${canCancel(selectedJob.date, selectedJob.time) ? 'text-blue-600' : 'text-red-500'}`}>
                          {canCancel(selectedJob.date, selectedJob.time) ? 'Cancellation Available' : 'Cancellation Unavailable — Appointment Locked'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          {timeLeft === 'LOCKED' ? (
                            'Locked due to 36-hour policy'
                          ) : (
                            <>
                              <Clock size={10} />
                              Locking in: <span className="text-slate-600 font-black">{timeLeft}</span>
                            </>
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Scheduling in progress...</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => {
                        setActiveProvider(selectedJob);
                        setIsCallModalOpen(true);
                      }}
                      className="flex-1 md:flex-none px-6 py-3 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Call
                    </button>
                    <button 
                      onClick={() => {
                        setActiveProvider(selectedJob);
                        setIsChatModalOpen(true);
                      }}
                      className="flex-1 md:flex-none px-6 py-3 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Message
                    </button>
                    {selectedJob.date && selectedJob.time && (
                      <button 
                        disabled={!canCancel(selectedJob.date, selectedJob.time)}
                        onClick={() => {
                          setSelectedEntry(selectedJob);
                          setCancelType(selectedJob.status === 'Pending' ? 'booking' : 'waitlist');
                          setShowCancelModal(true);
                          setIsJobModalOpen(false);
                        }}
                        className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          canCancel(selectedJob.date, selectedJob.time)
                            ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
           
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {filteredWaitlist.map((entry, idx) => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  setSelectedJob(entry);
                  setIsJobModalOpen(true);
                }}
                className="bg-white/80 backdrop-blur-sm border border-white rounded-[28px] p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-600/10 hover:-translate-y-1 transition-all group relative overflow-hidden cursor-pointer"
              >
                {/* Futuristic Accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic ${
                    entry.status === 'Confirmed' ? 'bg-green-50 text-green-600' : 
                    entry.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {entry.status}
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 group-hover:border-blue-600 transition-all shadow-sm">
                      <img 
                        src={`https://i.pravatar.cc/150?u=${entry.providerId}`} 
                        alt={entry.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{entry.name || 'Specialist Name'}</h4>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-lg">
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-black text-slate-700">{entry.rating}</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        TIER <span className="text-blue-600">{entry.tier}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        ID: {entry.providerId.slice(0, 8)}
                      </p>
                      
                      {entry.tags?.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {entry.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-slate-50" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</p>
                      <p className="text-lg font-black text-slate-900">Ksh {entry.rate.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                          setCancelType('waitlist');
                          setShowCancelModal(true);
                        }}
                        className="p-3 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all rounded-xl"
                        title="Leave Queue"
                      >
                        <X size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProvider(entry);
                          setIsCallModalOpen(true);
                        }}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-xl"
                      >
                        <Phone size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProvider(entry);
                          setIsChatModalOpen(true);
                        }}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all rounded-xl"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProvider(entry);
                          setIsBookingModalOpen(true);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pending Confirmations Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
              PENDING CONFIRMATIONS
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] rounded-full shadow-lg shadow-amber-500/20">{pendingBookings.length} AWAITING</span>
            </h3>
          </div>
          
          {pendingBookings.length === 0 ? (
            <div className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 rounded-[40px]" />
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-[40px] p-16 text-center relative z-10 shadow-sm border-dashed">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-[32px] flex items-center justify-center text-blue-300 mx-auto mb-8 shadow-inner relative group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={48} className="relative z-10" />
                  <div className="absolute inset-0 bg-blue-400/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-3">Operational Integrity: 100%</h4>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                  All synchronization requests have been validated. Your service pipeline is currently optimal.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {pendingBookings.map((item, idx) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setSelectedJob(item);
                    setIsJobModalOpen(true);
                  }}
                  className="bg-white/80 backdrop-blur-sm border border-white rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-white rounded-2xl flex items-center justify-center text-amber-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                      <Clock size={32} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl italic border border-amber-100/50 shadow-sm">
                        Synchronizing
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {item.category} Deployment
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        Ref: {item.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Initiation</span>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                          {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Active Session'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEntry(item);
                            setCancelType('booking');
                            setShowCancelModal(true);
                          }}
                          className="w-12 h-12 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all rounded-2xl shadow-sm flex items-center justify-center group/btn"
                          title="Terminate Protocol"
                        >
                          <X size={20} className="group-hover/btn:rotate-90 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {/* Call Modal */}
        {isCallModalOpen && activeProvider && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCallModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[24px] overflow-hidden mb-6 border-4 border-slate-50">
                  <img src={`https://i.pravatar.cc/150?u=${activeProvider.id}`} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{activeProvider.name}</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-8">{activeProvider.category} Specialist</p>
                
                <div className="w-full bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-8 border border-slate-100">
                  <div className="text-left">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Direct Line</p>
                    <p className="text-sm font-black text-slate-900">+254 700 000 000</p>
                  </div>
                  <button 
                    onClick={() => handleCopyNumber('+254 700 000 000')}
                    className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-sm transition-all active:scale-90"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full">
                  <a 
                    href="tel:+254700000000"
                    className="flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                  >
                    <Phone size={16} />
                    Direct Mobile Call
                  </a>
                  <button 
                    onClick={() => {
                      setIsCallModalOpen(false);
                      setToast({ message: "Initializing secure VoIP connection..." });
                    }}
                    className="flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-black transition-all"
                  >
                    <Zap size={16} className="text-blue-400" fill="currentColor" />
                    Call via App (VoIP)
                  </button>
                  <button 
                    onClick={() => setIsCallModalOpen(false)}
                    className="py-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Chat Modal */}
        {isChatModalOpen && activeProvider && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsChatModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-lg h-[600px] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${activeProvider.id}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{activeProvider.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Specialist</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsChatModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                      <MessageSquare size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start a conversation with the specialist</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: msg.sender === 'me' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                      msg.sender === 'me' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                    }`}>
                      {msg.text}
                      {msg.sender === 'me' && msg.status && (
                        <div className="flex justify-end mt-1 gap-1">
                          {msg.status === 'sent' && <Check size={10} className="text-blue-200" />}
                          {msg.status === 'delivered' && <div className="flex"><Check size={10} className="text-blue-200" /><Check size={10} className="-ml-1 text-blue-200" /></div>}
                          {msg.status === 'read' && <div className="flex"><Check size={10} className="text-blue-300" /><Check size={10} className="-ml-1 text-blue-300" /></div>}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-white border-t border-slate-100">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    <Zap size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Booking Modal */}
        {isBookingModalOpen && activeProvider && (
          <BookingModal 
            provider={activeProvider}
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onConfirm={(booking) => {
              onAddBooking(booking);
              setIsBookingModalOpen(false);
            }}
          />
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Cancel Reservation?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                  Are you sure you want to terminate this operational queue? This action cannot be reversed.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={() => setShowCancelModal(false)}
                    className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Hold
                  </button>
                  <button 
                    onClick={handleCancelAction}
                    className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                  >
                    Terminate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
