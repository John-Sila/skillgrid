import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 bg-primary-blue rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3">
        <Sparkles size={20} className="text-white fill-white/20" />
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <h1 className="text-lg font-black text-text-main uppercase tracking-tighter italic leading-none">SkillGrid</h1>
          <span className="text-[8px] font-black text-primary-blue uppercase tracking-[0.4em] mt-0.5 ml-0.5">Elite Matrix</span>
        </div>
      )}
    </div>
  );
};
