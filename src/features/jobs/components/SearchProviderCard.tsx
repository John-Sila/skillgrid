import React from 'react';
import { Star, CheckCircle2, ChevronRight } from 'lucide-react';
import { Provider } from '../../../shared/types';
import { ReputationBar } from '../../../shared/components/ReputationBar';

interface SearchProviderCardProps {
  provider: Provider & { matchScore?: number };
  onViewProfile?: () => void;
  onBook?: () => void;
}

export const SearchProviderCard: React.FC<SearchProviderCardProps> = ({ 
  provider, 
  onViewProfile, 
  onBook 
}) => {
  return (
    <div 
      onClick={onViewProfile}
      className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[32px] flex items-center gap-6 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer relative overflow-hidden"
    >
      {provider.matchScore && provider.matchScore > 85 && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-primary-blue text-[8px] font-black text-white uppercase tracking-[0.2em] rounded-bl-xl border-b border-l border-primary-blue/30 shadow-lg z-10">
          Smart Match: {provider.matchScore}%
        </div>
      )}
      <div className="relative shrink-0">
        <img src={provider.image} className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-sidebar ${provider.isAvailable ? 'bg-accent-green' : 'bg-red-400'}`}></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
           <h4 className="text-lg font-black text-text-main leading-tight">{provider.name}</h4>
           <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${
             provider.tier === 'Luxury' ? 'bg-amber-500 text-white' : 
             provider.tier === 'Premium' ? 'bg-emerald-500 text-white' : 
             'bg-blue-500 text-white'
           }`}>
             {provider.tier}
           </span>
           {provider.verified && <CheckCircle2 size={14} className="text-primary-blue" fill="currentColor" />}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-light font-bold uppercase tracking-widest">
           <div className="flex items-center gap-1 text-yellow-500">
              <Star size={12} fill="currentColor" /> {provider.rating}
           </div>
           <span className="text-text-main font-black">Ksh {provider.pricePerHour}/hr</span>
        </div>
        <div className="mt-3 max-w-[200px]">
           <ReputationBar 
             rating={provider.rating} 
             reliability={provider.reliability} 
             flaggedCount={provider.flaggedCount} 
             label="Pro Reliability"
           />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onBook?.(); }}
          className="px-4 py-2 bg-primary-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-blue-500/10"
        >
          Book Now
        </button>
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:hidden transition-all border border-slate-200 dark:border-slate-700">
           <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};
