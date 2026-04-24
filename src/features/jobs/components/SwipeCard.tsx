import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  User, 
  MessageSquare, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { Provider } from '../../../shared/types';

interface SwipeCardProps {
  provider: Provider;
  isTop: boolean;
  onSwipe: (dir: 'right' | 'left') => void;
  onBook?: () => void;
  onViewProfile?: () => void;
  onWaitlist?: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ 
  provider, 
  isTop, 
  onSwipe, 
  onBook, 
  onViewProfile, 
  onWaitlist 
}) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const scale = useTransform(x, [-300, 0, 300], [0.8, 1, 0.8]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  const [lastTap, setLastTap] = useState(0);
  const [showWaitlistOverlay, setShowWaitlistOverlay] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 150) onSwipe('right');
    else if (info.offset.x < -150) onSwipe('left');
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      setShowWaitlistOverlay(true);
      onWaitlist?.();
      setTimeout(() => setShowWaitlistOverlay(false), 800);
    }
    setLastTap(now);
  };

  return (
    <motion.div
      style={{ x, opacity, rotate, scale, position: 'absolute' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onPointerDown={handleDoubleTap}
      animate={isTop ? { scale: 1 } : { scale: 0.9, opacity: 0.3 }}
      className="w-full h-[650px] md:h-auto md:max-w-4xl md:aspect-[18/9] bg-sidebar border border-border-slate rounded-[40px] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing flex flex-col md:flex-row relative"
    >
      <motion.div style={{ opacity: likeOpacity }} className="absolute inset-0 bg-accent-green/10 z-30 flex items-center justify-center pointer-events-none transition-colors">
        <div className="border-4 border-accent-green px-6 py-2 rounded-2xl">
          <span className="text-accent-green font-black text-3xl uppercase tracking-tighter">YES</span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute inset-0 bg-red-500/10 z-30 flex items-center justify-center pointer-events-none transition-colors">
        <div className="border-4 border-red-500 px-6 py-2 rounded-2xl">
          <span className="text-red-500 font-black text-3xl uppercase tracking-tighter">NO</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showWaitlistOverlay && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1.2, opacity: 1 }} 
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-primary-blue/20 z-[40] backdrop-blur-sm pointer-events-none"
          >
             <div className="flex flex-col items-center gap-4">
                <Clock size={80} className="text-white fill-white/20 animate-bounce" />
                <span className="text-white font-black text-4xl uppercase tracking-[0.2em] shadow-lg">Waitlist Access</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full md:w-[65%] h-[65%] md:h-full relative group shrink-0 overflow-hidden">
        <img src={provider.image} alt={provider.name} className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <button 
                onPointerDown={e => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.();
                }}
                className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl group/btn"
            >
                <User size={20} className="group-hover/btn:scale-110 transition-transform" />
            </button>

            <button 
                onPointerDown={e => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('init-chat', { detail: { providerId: provider.id } }));
                }}
                className="w-12 h-12 bg-primary-blue/20 backdrop-blur-xl border border-primary-blue/30 rounded-2xl flex items-center justify-center text-primary-blue hover:bg-primary-blue/30 transition-all shadow-xl group/msg ml-2"
            >
                <MessageSquare size={20} className="group-hover/msg:scale-110 transition-transform" />
            </button>

            <div className={`px-4 py-2 rounded-2xl backdrop-blur-xl flex items-center gap-2 border ${
               provider.isAvailable ? 'bg-accent-green/40 border-accent-green/50 text-white' : 'bg-red-500/40 border-red-500/50 text-white'
            }`}>
               <div className={`w-2 h-2 rounded-full ${provider.isAvailable ? 'bg-accent-green animate-pulse' : 'bg-red-400'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-widest">{provider.isAvailable ? 'Available' : 'Off'}</span>
            </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="flex flex-col gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-4 shadow-2xl">
                   <div className="text-[6px] md:text-[8px] font-bold text-white/60 uppercase tracking-[0.2em] mb-0.5">Starting Rate</div>
                   <div className="text-lg md:text-xl font-black text-white leading-none">Ksh {provider.pricePerHour.toLocaleString()}</div>
                </div>
                <div className="bg-primary-blue/30 backdrop-blur-md border border-primary-blue/20 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 self-start">
                   <MapPin size={12} className="text-white" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">{provider.distance}</span>
                </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-4 shadow-2xl flex flex-col items-end">
               <div className="flex items-center gap-1.5 text-base md:text-xl font-black text-amber-400">
                  <Star size={16} className="fill-amber-400" /> {provider.rating}
               </div>
               <div className="text-[6px] md:text-[8px] font-bold text-white/60 uppercase tracking-[0.2em] mt-0.5">{provider.reviews} Elite Stats</div>
            </div>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 flex flex-col justify-between bg-card-bg overflow-hidden">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-xl md:text-3xl font-black text-text-main leading-none tracking-tight">{provider.name}</h2>
            {provider.verified && <CheckCircle2 size={16} className="text-primary-blue fill-primary-blue/20" />}
            
            <button 
               onPointerDown={e => e.stopPropagation()}
               onClick={(e) => {
                 e.stopPropagation();
                 onBook?.();
               }}
               className={`ml-auto px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-black text-[9px] md:text-[10px] tracking-widest transition-all uppercase shadow-lg active:scale-95 flex items-center gap-2 ${
               provider.isAvailable ? 'bg-primary-blue text-white shadow-blue-500/20 hover:bg-blue-600' : 'bg-text-light/10 text-text-light/40 border border-border-slate cursor-not-allowed'
            }`}>
               {provider.isAvailable ? 'Book Now' : 'Waitlist'}
               <ArrowRight size={12} className={provider.isAvailable ? 'animate-pulse' : ''} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <span className={`px-3 py-1 bg-primary-blue/10 text-primary-blue text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary-blue/10`}>
              {provider.category}
            </span>
            <span className="text-text-light text-[9px] font-bold uppercase tracking-widest opacity-60">
              Joined {provider.joined}
            </span>
          </div>

          <p className="text-text-main text-[11px] md:text-sm leading-relaxed font-medium opacity-80 text-left line-clamp-2 md:line-clamp-none italic border-l-2 border-primary-blue/20 pl-4 py-1">
            "{provider.bio}"
          </p>
        </div>
      </div>
    </motion.div>
  );
};
