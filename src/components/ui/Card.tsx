import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`
    bg-white/5 backdrop-blur-xl
    border border-white/10
    rounded-2xl p-4
    ${className}
  `}>
    {children}
  </div>
);
