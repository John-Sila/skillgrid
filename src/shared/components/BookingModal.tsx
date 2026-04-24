import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Clock, 
  Sparkles, 
  Wallet, 
  Check, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Provider, Booking, Milestone } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
  onConfirm: (b: Booking) => void;
  onNavigateToWaitlist: () => void;
}

const SimpleDatePicker: React.FC<{ onSelect: (d: Date) => void, selected: Date | null }> = ({ onSelect, selected }) => {
  const [currentDate] = useState(new Date());
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(currentDate.getDate() + i);
    return d;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
       {days.map(d => {
         const isSelected = selected?.toDateString() === d.toDateString();
         return (
           <button 
            key={d.toDateString()} 
            onClick={() => onSelect(d)}
            className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl border transition-all ${
              isSelected 
                ? 'bg-primary-blue border-primary-blue text-white shadow-xl shadow-blue-500/20' 
                : 'bg-sidebar/50 border-border-slate text-text-light hover:border-text-light'
            }`}
           >
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="text-lg font-black">{d.getDate()}</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
           </button>
         );
       })}
    </div>
  );
};

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  provider, 
  onConfirm, 
  onNavigateToWaitlist 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentScheduled, setPaymentScheduled] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const times = ["08:00 AM", "10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const feePercent = provider.tier === 'Luxury' ? 9 : provider.tier === 'Premium' ? 7 : 4.5;
      const commission = (provider.pricePerHour * feePercent) / 100;
      const totalPrice = provider.pricePerHour + commission;

      const milestones: Milestone[] = [
        { id: 'm1', label: 'Security Deposit (Escrow)', status: 'locked', amount: totalPrice * 0.3 },
        { id: 'm2', label: 'Service Commencement', status: 'pending', amount: totalPrice * 0.2 },
        { id: 'm3', label: 'Final Quality Release', status: 'pending', amount: totalPrice * 0.5 }
      ];
      
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        providerId: provider.id,
        clientId: 'current-user-id',
        date: selectedDate,
        time: selectedTime,
        category: provider.category,
        status: 'pending',
        price: totalPrice,
        paymentScheduled: paymentScheduled,
        milestones: milestones
      };
      setConfirmedBooking(newBooking);
      onConfirm(newBooking);
      setStep(3);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
       />
       <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-sidebar rounded-[32px] md:rounded-[40px] border border-border-slate overflow-hidden flex flex-col max-h-[90vh]"
       >
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
             <header className="flex items-center justify-between mb-8 text-left">
                <div>
                   <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tight uppercase">
                      {step === 3 ? 'Confirmation' : 'Booking'}
                   </h2>
                   <p className="text-text-light text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Nairobi SkillGrid Network</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 border border-border-slate rounded-full flex items-center justify-center text-text-light hover:text-text-main transition-colors">
                   <X size={20} />
                </button>
             </header>

             {step === 1 && (
               <div className="space-y-8 text-left">
                  <section>
                     <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-4">1. Select Date</h3>
                     <SimpleDatePicker onSelect={setSelectedDate} selected={selectedDate} />
                  </section>
                  <section>
                     <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-4">2. Select Time</h3>
                     <div className="flex flex-wrap gap-2">
                        {times.map(t => (
                          <button 
                            key={t} onClick={() => setSelectedTime(t)}
                            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-2xl border text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                              selectedTime === t 
                                ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-sidebar/50 border-border-slate text-text-light hover:border-text-light'
                            }`}
                          >
                             {t}
                          </button>
                        ))}
                     </div>
                  </section>
                  <button 
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(2)}
                    className="w-full py-4 md:py-5 bg-primary-blue text-white rounded-2xl md:rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 disabled:opacity-30 transition-all active:scale-95"
                  >
                     Review & Confirm
                  </button>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-6 md:space-y-8 text-left">
                  <section className="bg-primary-blue/5 border border-primary-blue/20 rounded-2xl md:rounded-3xl p-5 md:p-6">
                     <h4 className="text-[10px] font-black text-primary-blue uppercase tracking-widest mb-4">Review Appointment</h4>
                     <div className="space-y-4">
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                              <Sparkles size={18} />
                           </div>
                           <div>
                              <p className="text-[8px] md:text-[10px] text-text-light font-black uppercase tracking-widest leading-none mb-1">Service Type</p>
                              <p className="text-base font-black text-text-main uppercase">{provider.category} Specialist</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <div className="flex items-start gap-3">
                              <Calendar size={16} className="text-primary-blue mt-0.5" />
                              <div>
                                 <p className="text-[8px] md:text-[9px] text-text-light font-black uppercase tracking-widest leading-none mb-1">Date</p>
                                 <p className="text-[12px] md:text-sm font-bold text-text-main">{selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-3">
                              <Clock size={16} className="text-primary-blue mt-0.5" />
                              <div>
                                 <p className="text-[8px] md:text-[9px] text-text-light font-black uppercase tracking-widest leading-none mb-1">Arrival</p>
                                 <p className="text-[12px] md:text-sm font-bold text-text-main">{selectedTime}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </section>

                  <section className="bg-sidebar/30 border border-border-slate rounded-2xl md:rounded-3xl p-5 md:p-6">
                     <h4 className="text-[10px] font-black text-text-light uppercase tracking-widest mb-4">Service Invoice</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between">
                           <span className="text-[12px] md:text-sm text-text-light">Base Rate</span>
                           <span className="text-[12px] md:text-sm font-bold text-text-main">Ksh {provider.pricePerHour.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pb-3 border-b border-border-slate/10">
                           <span className="text-[11px] md:text-sm text-text-light">Platform {provider.tier} Fee</span>
                           <span className="text-[12px] md:text-sm font-bold text-text-main">Ksh {((provider.pricePerHour * (provider.tier === 'Luxury' ? 9 : provider.tier === 'Premium' ? 7 : 4.5)) / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-3">
                           <span className="text-sm md:text-base font-black text-text-main uppercase">Grand Total</span>
                           <span className="text-lg md:text-xl font-black text-primary-blue">
                              Ksh {(provider.pricePerHour + (provider.pricePerHour * (provider.tier === 'Luxury' ? 9 : provider.tier === 'Premium' ? 7 : 4.5)) / 100).toLocaleString()}
                            </span>
                        </div>
                     </div>
                  </section>

                  <section>
                      <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-4 pr-2">3. Payment Schedule</h3>
                      <button 
                        onClick={() => setPaymentScheduled(!paymentScheduled)}
                        className={`w-full p-6 border rounded-3xl flex items-center justify-between group transition-all ${
                          paymentScheduled ? 'bg-accent-green/10 border-accent-green/50' : 'bg-sidebar/50 border-border-slate hover:border-accent-green/30'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${paymentScheduled ? 'bg-accent-green text-white shadow-lg' : 'bg-sidebar border border-border-slate text-text-light group-hover:text-accent-green'}`}>
                               <Wallet size={24} />
                            </div>
                            <div className="text-left">
                               <p className="text-sm font-black text-text-main uppercase tracking-tight">Schedule M-Pesa Payment</p>
                               <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-0.5">Payment will be triggered automatically</p>
                            </div>
                         </div>
                         <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${paymentScheduled ? 'bg-accent-green border-accent-green text-white' : 'border-border-slate'}`}>
                            {paymentScheduled && <Check size={14} />}
                         </div>
                      </button>
                  </section>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="px-8 py-5 border border-border-slate text-text-light rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:text-text-main transition-colors">
                       Back
                    </button>
                    <button 
                      onClick={handleConfirm}
                      className="flex-1 py-5 bg-primary-blue text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                       Confirm Booking
                    </button>
                  </div>
               </div>
             )}

             {step === 3 && confirmedBooking && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center pb-6">
                  <div className="flex justify-center">
                     <div className="w-24 h-24 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center shadow-lg shadow-accent-green/20">
                        <CheckCircle2 size={48} />
                     </div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-text-main uppercase italic">Booking Secured</h3>
                     <p className="text-text-light text-[10px] font-bold uppercase tracking-widest mt-2 px-4 py-1.5 bg-sidebar-light/5 border border-border-slate/10 rounded-lg inline-block">
                        ID: <span className="text-primary-blue font-black tracking-widest">{confirmedBooking.id}</span>
                     </p>
                  </div>
                  
                  <div className="bg-sidebar-dark/5 border border-border-slate rounded-3xl p-6 space-y-4 text-left">
                     <div className="flex justify-between items-center pb-3 border-b border-border-slate/5">
                        <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Expert Specialist</span>
                        <span className="text-xs font-black text-text-main uppercase">{provider.name}</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-border-slate/5">
                        <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Service Domain</span>
                        <span className="text-xs font-black text-text-main uppercase">{provider.category}</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-border-slate/5">
                        <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Confirmed Slot</span>
                        <span className="text-xs font-black text-text-main uppercase">{confirmedBooking.time} | {confirmedBooking.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-text-light uppercase tracking-widest">Total Committed</span>
                        <span className="text-xs font-black text-primary-blue uppercase italic">Ksh {confirmedBooking.price.toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <button 
                        onClick={() => {
                           onNavigateToWaitlist();
                           onClose();
                        }}
                        className="w-full py-5 bg-primary-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                        Track Status in Waitlist
                        <ArrowRight size={16} />
                     </button>
                     <button 
                        onClick={onClose}
                        className="w-full text-text-light font-black text-[10px] uppercase tracking-[0.2em] hover:text-text-main transition-colors opacity-60 hover:opacity-100"
                     >
                        Finalize & Close
                     </button>
                  </div>
               </motion.div>
             )}
          </div>
       </motion.div>
    </div>
  );
};
