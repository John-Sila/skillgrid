import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`
      w-full px-4 py-3 rounded-xl
      bg-white/5 border border-white/10
      text-white placeholder:text-white/20
      focus:outline-none focus:border-blue-500/50
      transition-all
      ${className}
    `}
  />
);
