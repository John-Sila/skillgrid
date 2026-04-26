import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Wallet,
  Check,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  Building2,
  Smartphone
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Provider, Booking, Milestone } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
  onConfirm: (b: Booking) => void;
  onNavigateToWaitlist: () => void;
}

const calculatePricing = (provider: Provider) => {
  const feePercent = provider.tier === 'Luxury' ? 9 : provider.tier === 'Premium' ? 7 : 4.5;
  const commission = (provider.pricePerHour * feePercent) / 100;
  const total = provider.pricePerHour + commission;
  return { feePercent, commission, total };
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  provider,
  onConfirm,
  onNavigateToWaitlist
}) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const times = ["08:00 AM", "10:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];
  const paymentMethods = [
    { id: 'mpesa', label: 'M-PESA', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'card', label: 'Credit Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'bank', label: 'Bank Transfer', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setPaymentMethod('');
    onClose();
  };

  const handleFinalConfirm = () => {
    setIsProcessing(true);
    const { total } = calculatePricing(provider);
    
    setTimeout(() => {
      const booking: Booking = {
        id: uuidv4(),
        providerId: provider.id,
        clientId: 'current-user-id',
        date: new Date(selectedDate),
        time: selectedTime,
        category: provider.category,
        status: 'pending',
        price: total,
        paymentScheduled: true,
        milestones: [
          { id: 'm1', label: 'Escrow Deposit', status: 'locked', amount: total * 0.3 },
          { id: 'm2', label: 'Service Start', status: 'pending', amount: total * 0.2 },
          { id: 'm3', label: 'Final Completion', status: 'pending', amount: total * 0.5 }
        ]
      };
      
      // Step 5: Provider Notification Simulation
      setStep(5);
      setIsProcessing(false);

      // Simulate Provider Response after 3 seconds
      setTimeout(() => {
        onConfirm(booking);
      }, 3000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {step > 1 && step < 5 && (
                  <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-slate-400" />
                  </button>
                )}
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {step === 5 ? 'Success' : 'Booking Protocol'}
                </h2>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Progress Bar */}
            {step < 5 && (
              <div className="px-8 flex gap-2 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-100'}`} />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 pt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Step 1: Select Day */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <CalendarIcon size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Select Date</span>
                      </div>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                      <button
                        disabled={!selectedDate}
                        onClick={() => setStep(2)}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
                      >
                        Next: Select Time
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Select Time */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <Clock size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Available Slots</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {times.map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`p-5 rounded-2xl font-bold text-left transition-all border ${
                              selectedTime === t 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-200'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={!selectedTime}
                        onClick={() => setStep(3)}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
                      >
                        Next: Payment
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 3: Payment Method */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <Wallet size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Payment Node</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {paymentMethods.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id)}
                            className={`p-5 rounded-2xl font-bold text-left transition-all border flex items-center justify-between ${
                              paymentMethod === m.id 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-200'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${paymentMethod === m.id ? 'bg-white/20' : m.bg}`}>
                                <m.icon size={20} className={paymentMethod === m.id ? 'text-white' : m.color} />
                              </div>
                              {m.label}
                            </div>
                            {paymentMethod === m.id && <Check size={20} />}
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={!paymentMethod}
                        onClick={() => setStep(4)}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
                      >
                        Review Booking
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 4: Confirmation */}
                  {step === 4 && (
                    <div className="space-y-8">
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                          <img src={provider.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                          <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{provider.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{provider.category} Specialist</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                            <p className="font-bold text-slate-900">{new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                            <p className="font-bold text-slate-900">{selectedTime}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Method</p>
                            <p className="font-bold text-slate-900 uppercase">{paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Rate</p>
                            <p className="font-bold text-blue-600">Ksh {calculatePricing(provider).total.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={isProcessing}
                        onClick={handleFinalConfirm}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                      >
                        {isProcessing ? 'Establishing Link...' : 'Confirm Elite Booking'}
                        {!isProcessing && <Sparkles size={16} />}
                      </button>
                    </div>
                  )}

                  {/* Step 5: Success & Provider Response */}
                  {step === 5 && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-8">
                      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center relative">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-blue-500/10 rounded-full"
                        />
                        <Sparkles size={48} className="text-blue-500 relative" />
                      </div>
                      
                      <div className="text-center space-y-3">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Syncing Request</h3>
                        <p className="text-slate-500 text-sm font-medium px-6">
                          Your interest has been broadcast to <span className="text-blue-600 font-bold">{provider.name}</span>. 
                          Waiting for secure confirmation...
                        </p>
                      </div>

                      <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notification dispatched to provider</span>
                      </div>

                      <button
                        onClick={handleClose}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800"
                      >
                        Wait in Dashboard
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};