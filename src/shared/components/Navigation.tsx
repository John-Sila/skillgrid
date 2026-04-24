import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavIconProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

export const NavIcon: React.FC<NavIconProps> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative group ${active ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main hover:bg-primary-blue/10'}`}
    title={label}
  >
    <Icon size={20} />
    {!active && (
      <span className="absolute left-14 bg-sidebar border border-border-slate px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-text-main opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
        {label}
      </span>
    )}
  </button>
);

export const MobileNavItem: React.FC<NavIconProps> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-primary-blue' : 'text-text-light'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-primary-blue/10' : 'bg-transparent'}`}>
      <Icon size={20} />
    </div>
    <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
