import React from 'react';
import { Mail, RefreshCcw, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerifyEmailViewProps {
  email: string;
  onResend: () => void;
  onSignOut: () => void;
}

export const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({ email, onResend, onSignOut }) => {
  return (
    <div className="w-full h-full md:h-auto md:max-w-md p-6 md:p-10 bg-sidebar md:shadow-2xl md:rounded-[40px] md:border border-border-slate flex flex-col font-sans">
      <div className="flex justify-center mb-10">
        <div className="w-20 h-20 bg-primary-blue rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <Mail size={40} className="text-white" />
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase italic leading-none">
          Verify <span className="text-primary-blue">Identity</span>
        </h1>
        <p className="text-[10px] text-text-light font-bold uppercase tracking-[0.4em] mt-3 opacity-60">Authentication Lockup</p>
      </div>

      <div className="space-y-6 text-center">
        <p className="text-xs text-text-main font-medium leading-relaxed">
          A verification protocol has been dispatched to <span className="text-primary-blue font-bold">{email}</span>. Please authorize the link to unlock your matrix access.
        </p>

        <div className="pt-4 space-y-3">
          <button 
            onClick={onResend}
            className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <RefreshCcw size={16} /> Resend Protocol
          </button>
          
          <button 
            onClick={onSignOut}
            className="w-full py-5 bg-sidebar-light border border-border-slate text-text-main rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <LogOut size={16} /> Switch Identity
          </button>
        </div>

        <p className="text-[10px] text-text-light font-medium pt-4">
          Did not receive the dispatch? Check your encrypted (spam) folder or verify routing.
        </p>
      </div>
    </div>
  );
};
