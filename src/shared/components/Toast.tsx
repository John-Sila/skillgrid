import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';

interface ToastProps {
  toast: { message: string, bookingId?: string } | null;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose, onAction, actionLabel }) => {
  if (!toast) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[90%] md:w-96 bg-sidebar border border-accent-green/30 rounded-[32px] p-6 shadow-3xl flex items-center gap-6 backdrop-blur-xl"
    >
      <div className="w-12 h-12 bg-accent-green text-slate-50 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-accent-green/20">
         <Check size={24} />
      </div>
      <div className="flex-1 text-left">
         <p className="text-[10px] font-black text-accent-green uppercase tracking-widest mb-0.5">Notification</p>
         <p className="text-xs font-bold text-text-main leading-tight">{toast.message}</p>
         {onAction && actionLabel && (
           <button 
             onClick={onAction}
             className="text-[9px] font-black text-primary-blue uppercase tracking-widest hover:underline mt-2 flex items-center gap-1"
           >
             {actionLabel} <ArrowRight size={10} />
           </button>
         )}
      </div>
      <button onClick={onClose} className="text-text-light hover:text-text-main p-1">
         <X size={16} />
      </button>
    </motion.div>
  );
};
