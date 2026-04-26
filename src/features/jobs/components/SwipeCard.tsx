import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Clock,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Provider } from '../../../shared/types';

interface SwipeCardProps {
  provider: Provider;
  isTop: boolean;
  onSwipe: (dir: 'right' | 'left' | 'up') => void;
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
  const scale = useTransform(x, [-300, 0, 300], [0.9, 1, 0.9]);
  const bookOpacity = useTransform(x, [20, 100], [0, 1]);
  const prevOpacity = useTransform(x, [-20, -100], [0, 1]);

  const [lastTap, setLastTap] = useState(0);
  const [showWaitlistOverlay, setShowWaitlistOverlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 150) {
      onSwipe('right');
      x.set(0);
    } else if (info.offset.x < -150) {
      onSwipe('left');
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const handleDoubleInteraction = () => {
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
      onPointerDown={handleDoubleInteraction}
      onDoubleClick={handleDoubleInteraction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={isTop 
        ? { 
            scale: isHovered ? 1.02 : 1, 
            zIndex: 10,
            y: isHovered ? -10 : 0
          } 
        : { scale: 0.95, opacity: 0.5, zIndex: 0 }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-full max-w-[95vw] md:max-w-4xl min-h-[500px] md:min-h-[550px] bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden cursor-grab active:cursor-grabbing flex flex-col md:flex-row relative transition-colors"
    >
      {/* Swipe Hint Animation (Subtle) */}
      {isTop && (
        <motion.div 
          animate={{ x: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-20"
        >
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
            <ChevronLeft size={10} />
            Swipe to Navigate
            <ChevronRight size={10} />
          </div>
        </motion.div>
      )}

      {/* Visual Feedback Overlays */}
      <motion.div style={{ opacity: bookOpacity }} className="absolute inset-0 bg-blue-500/10 z-30 flex items-center justify-center pointer-events-none">
        <div className="bg-blue-600 text-white px-8 py-4 rounded-3xl shadow-xl">
          <span className="font-black text-2xl uppercase tracking-[0.2em]">Book Now</span>
        </div>
      </motion.div>
      
      <motion.div style={{ opacity: prevOpacity }} className="absolute inset-0 bg-slate-500/10 z-30 flex items-center justify-center pointer-events-none">
        <div className="bg-slate-800 text-white px-8 py-4 rounded-3xl shadow-xl">
          <span className="font-black text-2xl uppercase tracking-[0.2em]">Previous</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showWaitlistOverlay && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1.1, opacity: 1 }} 
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-blue-600/30 z-[40] backdrop-blur-md pointer-events-none"
          >
             <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
                   <Clock size={48} className="text-blue-600 animate-pulse" />
                </div>
                <span className="text-white font-black text-3xl uppercase tracking-[0.3em] drop-shadow-lg text-center px-6">Priority Waitlist</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content */}
      <div className="w-full md:w-1/2 h-64 md:h-auto relative shrink-0 overflow-hidden">
        <img src={provider.image} alt={provider.name} className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
           <div className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Available
           </div>
           <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
              Ksh {provider.pricePerHour.toLocaleString()} / hr
           </div>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight">{provider.name}</h2>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{provider.distance || '6.4 KM'} Away</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{provider.rating}★ Elite Tier</span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                <ShieldCheck size={32} />
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md font-medium">
            {provider.bio}
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            {provider.services?.slice(0, 3).map(service => (
              <span key={service} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                {service}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 pt-8 border-t border-slate-50">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Elite Rate</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">Ksh {provider.pricePerHour.toLocaleString()}</span>
           </div>
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onBook?.();
             }}
             className="px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
           >
             Book Now
             <Sparkles size={14} />
           </button>
        </div>
      </div>
    </motion.div>
  );
};
