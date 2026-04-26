import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const H1: React.FC<TypographyProps> = ({ children, className = "" }) => (
  <h1 className={`text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 ${className}`}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ children, className = "" }) => (
  <h2 className={`text-xl md:text-2xl font-semibold text-slate-900 ${className}`}>
    {children}
  </h2>
);

export const Text: React.FC<TypographyProps> = ({ children, className = "" }) => (
  <p className={`text-sm text-slate-600 ${className}`}>
    {children}
  </p>
);
