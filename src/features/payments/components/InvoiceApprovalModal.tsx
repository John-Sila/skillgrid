import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { Invoice } from '../../../shared/types';
import { auth } from '../../../firebase/config';

interface InvoiceApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onApprove: (i: Invoice) => void;
  onDispute: (i: Invoice) => void;
}

export const InvoiceApprovalModal: React.FC<InvoiceApprovalModalProps> = ({ 
  isOpen, 
  onClose, 
  invoice, 
  onApprove, 
  onDispute 
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-black/60">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         className="w-full max-w-lg bg-card-bg border border-border-slate rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
       >
          <div className="p-8 border-b border-border-slate flex items-center justify-between bg-sidebar/20">
             <div className="text-left">
                <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter">Electronic Invoice</h3>
                <p className="text-[10px] font-black text-primary-blue uppercase tracking-widest mt-1">ID: {invoice.id || 'Pending System Sync'}</p>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-2xl border border-border-slate flex items-center justify-center text-text-light hover:text-text-main transition-all">
                <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar text-left">
             {/* Header Info */}
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-3">Service Provider</p>
                   <p className="text-sm font-black text-text-main uppercase">{invoice.providerName}</p>
                   <p className="text-[10px] font-bold text-text-light/60 mt-1 uppercase">Verified Identity Checked</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-3">Client Recipient</p>
                   <p className="text-sm font-black text-text-main uppercase">{invoice.clientName}</p>
                   <p className="text-[10px] font-bold text-text-light/60 mt-1 uppercase tracking-tighter">{auth.currentUser?.email}</p>
                </div>
             </div>

             {/* Description */}
             <div className="p-6 bg-sidebar/30 border border-border-slate rounded-3xl text-left">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-4">Operational Summary</p>
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue">
                      <Zap size={22} />
                   </div>
                   <div>
                      <p className="text-sm font-black text-text-main uppercase leading-tight">{invoice.description}</p>
                      <p className="text-[10px] text-text-light font-bold mt-2 uppercase tracking-widest">
                        Completed: {invoice.timestamp && new Date(invoice.timestamp.seconds * 1000).toLocaleString()}
                      </p>
                   </div>
                </div>
             </div>

             {/* Financial Ledger */}
             <div className="space-y-4">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest mb-6 border-l-2 border-primary-blue pl-4">Financial Ledger</p>
                <div className="space-y-3 px-2">
                   <div className="flex justify-between items-center pb-3 border-b border-border-slate/10">
                      <span className="text-xs font-bold text-text-light uppercase tracking-widest">Base Rate (Specialist)</span>
                      <span className="text-sm font-black text-text-main">Ksh {invoice.amount.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center pb-3 border-b border-border-slate/10">
                      <span className="text-xs font-bold text-text-light uppercase tracking-widest">Infrastructure Fee (10%)</span>
                      <span className="text-sm font-black text-text-main">Ksh {invoice.platformFee.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-black text-text-main uppercase">Grand Total Aggregate</span>
                      <span className="text-2xl font-black text-primary-blue">Ksh {invoice.total.toLocaleString()}</span>
                   </div>
                </div>
             </div>

             {/* Integrity Statement */}
             <div className="p-5 bg-accent-green/5 border border-accent-green/10 rounded-2xl flex items-center gap-4">
                <ShieldCheck size={20} className="text-accent-green" />
                <p className="text-[10px] font-bold text-accent-green/80 uppercase leading-relaxed text-left">This invoice is mathematically verified. Approval will trigger an instant sovereign transfer of funds.</p>
             </div>
          </div>

          <div className="p-8 border-t border-border-slate bg-sidebar/20 flex flex-col gap-3">
             <button 
               onClick={() => onApprove(invoice)}
               className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                <CheckCircle2 size={18} />
                Authorize & Disburse Funds
             </button>
             <button 
               onClick={() => onDispute(invoice)}
               className="w-full py-4 text-red-500 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-red-500/10 rounded-2xl transition-all"
             >
                Flag Incident / Dispute Charges
             </button>
          </div>
       </motion.div>
    </div>
  );
};
