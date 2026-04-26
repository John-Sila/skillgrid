import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  MapPin, 
  Star, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { TierLevel, SortOption } from '../types';

interface TierSelectorProps {
  current: TierLevel;
  onChange: (t: TierLevel) => void;
  isMobile?: boolean;
  isSidebar?: boolean;
}

export const TierSelector: React.FC<TierSelectorProps> = ({ current, onChange, isMobile, isSidebar }) => {
  const tiers: TierLevel[] = ['Basic', 'Premium', 'Luxury'];

  if (isSidebar) {
    return (
      <div className="flex flex-col gap-2 p-2 bg-sidebar-dark/20 border border-border-slate/50 rounded-2xl">
        {tiers.map(t => (
          <button 
            key={t} onClick={() => onChange(t)}
            title={`${t} Services`}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-black uppercase tracking-tighter transition-all ${
              current === t ? 'bg-primary-blue text-slate-50 shadow-lg' : 'text-text-light hover:bg-white/5'
            }`}
          >
            {t[0]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center bg-sidebar/50 p-1.5 rounded-2xl border border-border-slate ${isMobile ? 'scale-90 origin-right' : ''}`}>
      {tiers.map(t => (
        <button 
          key={t} onClick={() => onChange(t)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            current === t ? 'bg-primary-blue text-slate-50 shadow-xl shadow-blue-500/10' : 'text-text-light hover:text-text-main'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

interface SortSelectorProps {
  current: SortOption;
  onChange: (s: SortOption) => void;
  isMobile?: boolean;
}

export const SortSelector: React.FC<SortSelectorProps> = ({ current, onChange, isMobile }) => {
  const options: { id: SortOption, icon: any, label: string }[] = [
    { id: 'rating', icon: Star, label: 'Rating' },
    { id: 'price', icon: BarChart3, label: 'Price' },
    { id: 'distance', icon: MapPin, label: 'Distance' },
  ];

  return (
    <div className={`flex items-center gap-1 bg-sidebar/30 p-1 rounded-xl border border-border-slate ${isMobile ? 'scale-90 origin-right' : ''}`}>
      {options.map(opt => (
        <button 
          key={opt.id} onClick={() => onChange(opt.id)}
          title={`Sort by ${opt.label}`}
          className={`p-2 rounded-lg transition-all ${
            current === opt.id ? 'bg-primary-blue text-slate-50 shadow-md' : 'text-text-light hover:text-text-main hover:bg-white/10'
          }`}
        >
          <opt.icon size={14} />
        </button>
      ))}
    </div>
  );
};
