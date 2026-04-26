import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  showText = true
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>

      {/* ICON */}
      <div className="
        relative w-10 h-10 rounded-2xl 
        bg-gradient-to-br from-blue-500 to-purple-600 
        flex items-center justify-center
        shadow-lg shadow-blue-500/20
        transition-all duration-300
        hover:scale-105
      ">
        {/* subtle glow */}
        <div className="absolute inset-0 rounded-2xl bg-white/10 blur-[6px]" />

        <Sparkles size={18} className="relative text-white" />
      </div>

      {/* TEXT */}
      {showText && (
        <div className="flex flex-col leading-none">

          {/* Main Brand */}
          <span className="
            text-base font-semibold tracking-tight
            bg-gradient-to-r from-blue-500 via-purple-600 to-white
            bg-clip-text text-transparent
          ">
            SkillGrid
          </span>

          {/* Sub Label */}
          <span className="
            text-[9px] font-medium tracking-[0.25em]
            text-blue-400/80 uppercase mt-[2px]
          ">
            Elite Matrix
          </span>

        </div>
      )}

    </div>
  );
};
