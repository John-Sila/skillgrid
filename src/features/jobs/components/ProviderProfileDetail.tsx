import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Star, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Users, 
  Heart 
} from 'lucide-react';
import { Provider, Booking } from '../../../shared/types';
import { ReputationBar } from '../../../shared/components/ReputationBar';
import { BookingModal } from '../../../shared/components/BookingModal';

interface ProviderProfileDetailProps {
  provider: Provider;
  onClose: () => void;
  onBook?: () => void;
  onAddBooking: (b: Booking) => void;
  onRecommend: () => void;
  setActiveTab: (t: string) => void;
}

export const ProviderProfileDetail: React.FC<ProviderProfileDetailProps> = ({ 
  provider, 
  onClose, 
  onAddBooking, 
  onRecommend, 
  setActiveTab 
}) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [recommended, setRecommended] = useState(false);

  const handleRecommend = () => {
    if (!recommended) {
      setRecommended(true);
      onRecommend();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col md:flex-row bg-sidebar overflow-y-auto md:overflow-hidden"
    >
      {/* Sidebar: Media & Quick Actions */}
      <div className="w-full md:w-1/2 lg:w-[45%] h-[45vh] md:h-full relative overflow-hidden bg-text-main shrink-0">
         <motion.img 
            initial={{ scale: 1.1 }} animate={{ scale: 1 }}
            src={provider.image} 
            className="absolute inset-0 w-full h-full object-cover opacity-80" 
            referrerPolicy="no-referrer" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-transparent to-transparent md:bg-gradient-to-r"></div>
         
         <button 
          onClick={onClose}
          className="absolute top-6 left-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-sidebar transition-all z-40"
         >
            <ChevronLeft size={24} />
         </button>

         <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 right-6 md:right-12 z-20 text-left">
            <div className="flex items-center gap-2 md:gap-3 mb-4">
               <span className="px-3 py-1 bg-primary-blue text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg">Verified Expert</span>
               {provider.isAvailable && <span className="px-3 py-1 bg-accent-green text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg">Available</span>}
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-6 drop-shadow-2xl text-left">{provider.name}</h2>
            
            <div className="flex flex-wrap gap-4 md:gap-6">
               <div className="flex flex-col text-left">
                  <span className="text-[8px] md:text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">Rating</span>
                  <div className="flex items-center gap-2 text-xl md:text-2xl font-black text-white">
                     <Star size={18} className="text-yellow-500" fill="currentColor" /> {provider.rating}
                  </div>
               </div>
               <div className="h-8 md:h-10 w-px bg-white/10"></div>
               <div className="flex flex-col text-left">
                  <span className="text-[8px] md:text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">Base Rate</span>
                  <div className="text-xl md:text-2xl font-black text-white">Ksh {provider.pricePerHour.toLocaleString()}</div>
               </div>
               <div className="h-8 md:h-10 w-px bg-white/10 hidden md:block"></div>
               <div className="flex items-center gap-4 hidden md:flex">
                  <div className="flex flex-col text-left">
                     <span className="text-[8px] md:text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">Exp</span>
                     <div className="text-xl md:text-2xl font-black text-white">4+ Yrs</div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Content: Detailed Info */}
      <div className="flex-1 md:h-full overflow-y-auto p-6 md:p-12 lg:p-20 space-y-12 md:space-y-16">
         <section className="text-left">
            <h3 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-6 pl-1 border-l-2 border-primary-blue">Specialist Profile</h3>
            <div className="mb-8 max-w-md p-5 md:p-6 bg-sidebar/20 border border-border-slate rounded-3xl">
                <ReputationBar 
                  rating={provider.rating} 
                  reliability={provider.reliability} 
                  flaggedCount={provider.flaggedCount} 
                  label="Verified Specialist Reliability"
                />
            </div>
            <p className="text-lg md:text-xl font-medium text-text-main leading-relaxed text-left">
               {provider.bio}. Certified specialist in {provider.category} services across Nairobi. Committed to high-quality craftsmanship and professional reliability.
            </p>
         </section>

         <section>
            <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 text-left">Expertise & Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                  { title: `Full ${provider.category} Setup`, price: `Ksh ${provider.pricePerHour * 2}` },
                  { title: 'Emergency Repair', price: 'Ksh 1,500' },
                  { title: 'System Maintenance', price: `Ksh ${provider.pricePerHour}` },
                  { title: 'Home Consultation', price: 'Ksh 500' },
               ].map((svc, i) => (
                  <div key={i} className="p-6 bg-sidebar/20 border border-border-slate rounded-3xl flex items-center justify-between group hover:bg-sidebar transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                           <Sparkles size={18} />
                        </div>
                        <span className="text-sm font-bold text-text-main">{svc.title}</span>
                     </div>
                     <span className="text-xs font-black text-text-light">{svc.price}</span>
                  </div>
               ))}
            </div>
         </section>

         <section>
            <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 text-left">Client Testimonials</h4>
            <div className="space-y-6">
               {(provider.testimonials && provider.testimonials.length > 0) ? provider.testimonials.map((review, i) => (
                  <div key={i} className="pb-6 border-b border-border-slate/10 text-left">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black text-text-main uppercase tracking-tight">{review.writer}</span>
                        <div className="flex gap-0.5">
                           {Array.from({ length: review.rating }).map((_, r) => (
                              <Star key={r} size={10} className="text-yellow-500" fill="currentColor" />
                           ))}
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <p className="text-sm text-text-light leading-relaxed italic pr-4">"{review.text}"</p>
                        <span className="text-[8px] font-black text-text-light/40 uppercase whitespace-nowrap">{review.date}</span>
                     </div>
                  </div>
               )) : (
                  <div className="p-8 border border-dashed border-border-slate rounded-3xl text-center">
                     <p className="text-xs text-text-light font-bold uppercase tracking-widest">No verified testimonials yet.</p>
                  </div>
               )}
            </div>
         </section>

         {provider.reports && provider.reports.length > 0 && (
           <section>
              <div className="flex items-center gap-3 mb-8">
                 <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Transparency Report</h4>
                 <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded uppercase">Incident Log</div>
              </div>
              <div className="space-y-4">
                 {provider.reports.map((report) => (
                    <div key={report.id} className="p-5 bg-red-500/[0.03] border border-red-500/10 rounded-2xl flex items-start gap-4 text-left">
                       <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] font-black text-text-main uppercase tracking-tight">Verified Incident</span>
                             <span className="text-[8px] font-black text-text-light/40 uppercase">{report.date}</span>
                          </div>
                          <p className="text-xs text-text-light font-medium leading-relaxed">{report.reason}</p>
                          <div className="mt-2 flex items-center gap-2">
                             <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${report.status === 'reviewed' ? 'bg-accent-green/10 text-accent-green' : 'bg-amber-500/10 text-amber-500'}`}>
                                {report.status}
                             </span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </section>
         )}

         <div className="pt-10 flex gap-4">
            <button 
               onClick={() => setIsBookingModalOpen(true)}
               disabled={!provider.isAvailable}
               className={`flex-1 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl ${
                  provider.isAvailable 
                     ? 'bg-primary-blue text-white shadow-blue-500/30 hover:scale-[1.02] active:scale-95' 
                     : 'bg-text-light/10 text-text-light/40 cursor-not-allowed'
               }`}
            >
               {provider.isAvailable ? 'Reserve Specialist Now' : 'Currently Fully Booked'}
            </button>
            <button 
              onClick={handleRecommend}
              className={`px-8 py-6 border rounded-[32px] flex flex-col items-center justify-center transition-all ${recommended ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'border-border-slate text-text-light hover:text-primary-blue hover:border-primary-blue'}`}
            >
               <Users size={24} />
               <span className="text-[7px] font-black uppercase tracking-widest mt-1">{recommended ? 'Referred' : 'Refer'}</span>
            </button>
            <button className="w-20 py-6 border border-border-slate rounded-[32px] flex items-center justify-center text-text-light hover:text-text-main transition-all">
               <Heart size={24} />
            </button>
         </div>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        provider={provider} 
        onConfirm={(booking) => {
           onAddBooking(booking);
        }}
        onNavigateToWaitlist={() => setActiveTab('waitlist')}
      />
    </motion.div>
  );
};
