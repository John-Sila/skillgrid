import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-sidebar/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-sidebar border border-border-slate rounded-[40px] shadow-2xl overflow-hidden font-sans"
          >
            <div className="p-8 pb-4 flex justify-between items-center border-b border-border-slate/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-xl font-black text-text-main uppercase tracking-tight italic">Operational <span className="text-primary-blue">Protocols</span></h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-text-light transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6 text-sm text-text-light leading-relaxed">
              <section>
                <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest mb-3">1. Network Integrity</h3>
                <p>SkillGrid operates as an elite coordination matrix. All users (Clients & Specialists) must maintain professional integrity and authenticity in all platform interactions.</p>
              </section>
              
              <section>
                <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest mb-3">2. Financial Settlements</h3>
                <p>Settlements are handled via automated smart-invoicing. Payments from Clients are held in secure suspension until Specialist deployment is verified and the invoice is approved.</p>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest mb-3">3. Deployment Verification</h3>
                <p>Specialists are required to provide verifiable updates during active deployment. Failure to meet the SkillGrid Quality Invariant may result in partial settlement or network exclusion.</p>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest mb-3">4. Encrypted Correspondence</h3>
                <p>All operational data and correspondence on SkillGrid are protected. Users agree to maintain the privacy of the network and not share deployment specifics outside unauthorized channels.</p>
              </section>
            </div>

            <div className="p-8 bg-sidebar-light border-t border-border-slate/10">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-transform"
              >
                Protocol Acknowledged
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
