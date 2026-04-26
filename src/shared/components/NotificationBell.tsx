import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ count, onClick }) => (
  <button 
    onClick={onClick}
    className="w-10 h-10 bg-sidebar border border-border-slate rounded-xl flex items-center justify-center text-text-light hover:text-text-main relative transition-all active:scale-95 group shadow-sm"
  >
    <Bell size={18} className="group-hover:animate-pulse" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-blue text-slate-50 text-[8px] font-black flex items-center justify-center rounded-full border-2 border-surface animate-bounce shadow-md">
        {count}
      </span>
    )}
  </button>
);
