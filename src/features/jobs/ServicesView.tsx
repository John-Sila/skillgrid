import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  Star,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Check,
  Phone,
  MessageSquare,
  ArrowLeft,
  Filter,
  MoreVertical,
  MapPin,
  ExternalLink,
  Copy,
  PhoneCall,
  Send,
  User,
  MoreHorizontal,
  Paperclip,
  Smile,
  Shield
} from 'lucide-react';
import { SERVICES_DATA, ServiceItem } from './servicesData';
import { BookingModal } from '../../shared/components/BookingModal';
import { Provider, Category, Booking } from '../../shared/types';
import { generateMockProviders } from './providerMocks';

interface ServicesViewProps {
  onAddBooking: (b: Booking) => void;
  onViewProfile: (p: Provider) => void;
  setToast: (t: { message: string } | null) => void;
  initialTier?: 'Basic' | 'Premium' | 'Luxury' | 'Other';
}

type SortFilter = 'Recommended' | 'Distance' | 'Top Rated' | 'Newest' | 'Lowest Price';

export const ServicesView: React.FC<ServicesViewProps> = ({ 
  onAddBooking, 
  onViewProfile,
  setToast,
  initialTier
}) => {
  const [activeTier, setActiveTier] = useState<'Basic' | 'Premium' | 'Luxury' | 'Other'>(
    initialTier ? (initialTier.charAt(0).toUpperCase() + initialTier.slice(1).toLowerCase()) as any : 'Basic'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [providerToBook, setProviderToBook] = useState<Provider | null>(null);
  const [sortBy, setSortBy] = useState<SortFilter>('Recommended');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, provider: Provider } | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: 'call' | 'chat', provider: Provider } | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{sender: 'me' | 'provider', text: string, status?: 'sent' | 'delivered' | 'read'}[]>([]);
  
  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setToast({ message: "Phone number copied to clipboard!" });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const messageId = Date.now();
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
        text: "Thanks for reaching out! I'm available to discuss your requirements. When would you like to start?" 
      }]);
    }, 4500);
  };
  
  // Handle double tap for mobile
  const [lastTap, setLastTap] = useState(0);
  const handleDoubleTap = (provider: Provider) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      handleWaitlist(provider);
    }
    setLastTap(now);
  };

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Generate at least 10 providers per service when selected
  const currentProviders = useMemo(() => {
    if (!selectedService) return [];
    return generateMockProviders(15, selectedService.name);
  }, [selectedService]);

  const filteredServices = useMemo(() => {
    return SERVICES_DATA.filter(service => {
      const matchesTier = service.tier === activeTier;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAvailability = showOnlyAvailable ? service.status === 'ACTIVE' : true;
      return matchesTier && matchesSearch && matchesAvailability;
    });
  }, [activeTier, searchQuery, showOnlyAvailable]);

  const sortedProviders = useMemo(() => {
    let list = [...currentProviders];
    
    // Apply sort
    switch (sortBy) {
      case 'Distance':
        list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'Top Rated':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'Lowest Price':
        list.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'Newest':
        // Mocking newest by ID for now
        list.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Recommended (rating + reliability)
        list.sort((a, b) => (b.rating + b.reliability/20) - (a.rating + a.reliability/20));
    }

    // Apply search within providers if query exists and service is selected
    if (searchQuery && selectedService) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  }, [currentProviders, sortBy, searchQuery, selectedService]);

  const handleWaitlist = (provider: Provider) => {
    setToast({ message: `${provider.name} added to your priority waitlist!` });
  };

  const handleCall = (provider: Provider) => {
    setActiveModal({ type: 'call', provider });
    setToast({ message: `Initiating secure VoIP call with ${provider.name}...` });
  };

  const handleMessage = (provider: Provider) => {
    setActiveModal({ type: 'chat', provider });
    setToast({ message: `Opening encrypted chat with ${provider.name}...` });
  };

  const tiers: ('Basic' | 'Premium' | 'Luxury' | 'Other')[] = ['Basic', 'Premium', 'Luxury', 'Other'];

  return (
    <div className="min-h-full bg-slate-50/50 p-4 md:p-8 lg:p-12 transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              {selectedService && (
                <button 
                  onClick={() => setSelectedService(null)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-blue-600"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-3"
              >
                {selectedService ? selectedService.name.toUpperCase() : 'SERVICES'}
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              </motion.h1>
            </div>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]"
            >
              Professional Directory
            </motion.p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {!selectedService && (
              <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available Only</span>
                <button 
                  onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                  className={`w-10 h-5 rounded-full transition-all relative ${showOnlyAvailable ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    animate={{ x: showOnlyAvailable ? 22 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            )}

            {/* Search Bar with High Contrast */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full md:w-80 group"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 group-focus-within:text-blue-600 transition-colors z-10" size={18} />
              <input 
                type="text"
                placeholder="Search professionals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
              />
            </motion.div>
          </div>
        </div>

        {/* Filters and Tabs */}
        {!selectedService ? (
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
            {tiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${
                  activeTier === tier 
                  ? 'text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
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
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
             <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border transition-all group shadow-sm ${
                    isFilterOpen ? 'border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'border-slate-200 hover:border-blue-600'
                  }`}
                >
                  <Filter size={18} className={`${isFilterOpen ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <div className="h-4 w-px bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{sortBy}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      {(['Recommended', 'Distance', 'Top Rated', 'Newest', 'Lowest Price'] as SortFilter[]).map(f => (
                        <button
                          key={f}
                          onClick={() => {
                            setSortBy(f);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all border-b border-slate-50 last:border-0 ${
                            sortBy === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {sortedProviders.length} Professionals
             </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className={`grid grid-cols-1 ${selectedService ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
          <AnimatePresence mode="popLayout">
            {!selectedService ? (
              // Service Grid View
              filteredServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedService(service)}
                    className="group relative bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden cursor-pointer h-full flex flex-col"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-500 rounded-full" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <Icon size={28} />
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        service.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {service.status}
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-200" />
                        {service.category}
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting at</span>
                      <span className="text-lg font-black text-slate-900">{service.rate}</span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Personnel Listing View
              sortedProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onDoubleClick={() => handleWaitlist(provider)}
                  onClick={() => handleDoubleTap(provider)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, provider });
                  }}
                  className="group bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col relative"
                >
                  {/* Availability Badge */}
                  <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                    provider.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${provider.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    {provider.isAvailable ? 'Available Now' : 'Busy'}
                  </div>

                  {/* Profile Info */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-500">
                        <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
                      </div>
                      {provider.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-lg shadow-lg">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-black text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">{provider.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs font-black text-slate-900">{provider.rating}</span>
                            <span className="text-slate-400 text-[10px] font-bold">({provider.reviews})</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {provider.rating >= 4.8 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-blue-100">Top Rated</span>
                        )}
                        {provider.reliability >= 95 && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-indigo-100">Recommended</span>
                        )}
                        {provider.joined === '2026' && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100">New</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-300" />
                          <span>{provider.distance}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-300" />
                          <span>{provider.joined} Joined</span>
                       </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 italic">"{provider.bio}"</p>
                  </div>

                  {/* Rates */}
                  <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-2xl">
                     <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</p>
                        <p className="text-lg font-black text-slate-900">${(provider.pricePerHour/100).toFixed(2)}<span className="text-[10px] text-slate-400 ml-1">/hr</span></p>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleCall(provider)}
                          className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 shadow-sm active:scale-95"
                        >
                          <Phone size={18} />
                        </button>
                        <button 
                          onClick={() => handleMessage(provider)}
                          className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 shadow-sm active:scale-95"
                        >
                          <MessageSquare size={18} />
                        </button>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setProviderToBook(provider);
                        setIsBookingModalOpen(true);
                      }}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      Book Now
                    </button>
                    <button 
                      onClick={() => onViewProfile(provider)}
                      className="px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    >
                      View Profile
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Empty States */}
        {((!selectedService && filteredServices.length === 0) || (selectedService && sortedProviders.length === 0)) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Search size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">No matches found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed z-[100] w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-1.5"
          >
            <button 
               onClick={() => onViewProfile(contextMenu.provider)}
               className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
             >
               <User size={14} /> View Profile
             </button>
            <button 
              onClick={() => handleWaitlist(contextMenu.provider)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
            >
              <Clock size={14} /> Add to Waitlist
            </button>
            <button 
              onClick={() => handleCall(contextMenu.provider)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
            >
              <Phone size={14} /> Call Provider
            </button>
            <button 
              onClick={() => handleMessage(contextMenu.provider)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
            >
              <MessageSquare size={14} /> Send Message
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VoIP / Chat Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full ${activeModal.type === 'call' ? 'max-w-sm' : 'max-w-md'} bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col`}
            >
              {activeModal.type === 'call' ? (
                /* Enhanced Call Modal */
                <div className="p-8 text-center space-y-6">
                  <div className="relative mx-auto w-24 h-24">
                    <img src={activeModal.provider.image} className="w-full h-full object-cover rounded-[2rem] border-4 border-white shadow-xl" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <PhoneCall size={20} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{activeModal.provider.name}</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                      Professional Directory Link
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                        <p className="text-sm font-black text-slate-900">+254 700 000 000</p>
                      </div>
                      <button 
                        onClick={() => handleCopyNumber("+254 700 000 000")}
                        className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all hover:shadow-sm"
                      >
                        <Copy size={18} />
                      </button>
                    </div>

                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 group">
                      <PhoneCall size={18} className="group-hover:animate-bounce" />
                      Call via App (VoIP)
                    </button>
                    
                    <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3">
                      <Phone size={18} />
                      Direct Mobile Call
                    </button>
                  </div>

                  <button 
                    onClick={() => setActiveModal(null)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel Connection
                  </button>
                </div>
              ) : (
                /* Enhanced Chat Interface */
                <div className="flex flex-col h-[600px]">
                  {/* Chat Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={activeModal.provider.image} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">{activeModal.provider.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Online Now</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                        <Phone size={18} />
                      </button>
                      <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    <div className="flex justify-center mb-6">
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">Today</span>
                    </div>

                    {chatHistory.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                          msg.sender === 'me' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                          {msg.text}
                          <div className={`text-[8px] mt-1.5 font-black uppercase flex items-center gap-1 ${msg.sender === 'me' ? 'justify-end text-blue-100' : 'justify-start text-slate-400'}`}>
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.sender === 'me' && (
                              <span className="flex items-center">
                                {msg.status === 'read' ? (
                                  <CheckCircle2 size={10} className="text-white" />
                                ) : msg.status === 'delivered' ? (
                                  <Check size={10} />
                                ) : (
                                  <Clock size={10} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-6 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Paperclip size={20} />
                      </button>
                      <input 
                        type="text" 
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
                        <Smile size={20} />
                      </button>
                      <button 
                        onClick={handleSendMessage}
                        className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      {providerToBook && (
        <BookingModal 
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          provider={providerToBook}
          onConfirm={(booking) => {
            onAddBooking(booking);
            // Simulate provider response toast after the modal would have been closed or while it's in "Wait" state
            setTimeout(() => {
              setToast({ message: `EXCELLENT: ${providerToBook.name} has ACCEPTED your booking request!` });
            }, 4000);
          }}
          onNavigateToWaitlist={() => {}}
        />
      )}
    </div>
  );
};
