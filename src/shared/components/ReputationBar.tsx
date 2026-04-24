import React from 'react';
import { motion } from 'motion/react';

interface ReputationBarProps {
  rating: number;
  reliability: number;
  flaggedCount: number;
  label?: string;
}

export const ReputationBar: React.FC<ReputationBarProps> = ({ 
  rating, 
  reliability, 
  flaggedCount, 
  label = "Trust Score" 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em]">
        <span className="text-text-light">{label}</span>
        <span className={`${reliability >= 90 ? 'text-accent-green' : reliability >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
          {reliability}% Reliable
        </span>
      </div>
      <div className="h-1.5 w-full bg-border-slate/10 rounded-full overflow-hidden flex relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${reliability}%` }}
          className={`h-full rounded-full transition-colors ${
            reliability >= 90 ? 'bg-accent-green' : reliability >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        />
      </div>
    </div>
  );
};
