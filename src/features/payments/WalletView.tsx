import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const WalletView: React.FC = () => { 
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-full w-full p-8 md:p-12 lg:p-20 overflow-y-auto bg-card-bg/50"
    >
      <header className="mb-12 text-left">
        <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Wallet & Financials</h2>
        <p className="text-text-light text-sm font-medium">Manage your earnings, payouts, and service commissions.</p>
      </header>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-8 bg-sidebar border border-border-slate rounded-[40px] shadow-xl text-left">
           <p className="text-[10px] font-black text-primary-blue uppercase tracking-[0.4em] mb-4">Available Balance</p>
           <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-black text-text-main leading-none">Ksh 12,450</span>
              <span className="text-xs font-bold text-accent-green uppercase mb-1">.00</span>
           </div>
           <button className="w-full py-4 bg-primary-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              Initiate Payout
           </button>
        </div>

        <div className="p-8 bg-sidebar/40 border border-border-slate rounded-[40px] text-left">
           <p className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-4">Account Analytics</p>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-left">
                 <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Total Earnings</span>
                 <span className="text-sm font-black text-text-main uppercase">Ksh 84,200</span>
              </div>
              <div className="flex justify-between items-center text-left">
                 <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Platform Fees Paid</span>
                 <span className="text-sm font-black text-text-main uppercase">Ksh 4,050</span>
              </div>
              <div className="flex justify-between items-center text-left">
                 <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Completed Jobs</span>
                 <span className="text-sm font-black text-text-main uppercase">32 Jobs</span>
              </div>
           </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Recent Activity Ledger</h3>
           <button className="text-[9px] font-black text-primary-blue uppercase tracking-widest hover:underline">Download Statements</button>
        </div>
        <div className="space-y-4">
           {[
             { label: 'Booking Release #4412', amount: 3500, type: 'credit', status: 'Completed', date: 'Jul 12, 2024' },
             { label: 'Platform Commission (10%)', amount: -350, type: 'debit', status: 'Completed', date: 'Jul 12, 2024' },
             { label: 'Withdrawal to M-PESA', amount: -5000, type: 'debit', status: 'Processing', date: 'Jul 10, 2024' },
             { label: 'Booking Multi-tier Bonus', amount: 500, type: 'credit', status: 'Completed', date: 'Jul 08, 2024' },
           ].map((tx, i) => (
             <div key={i} className="p-6 bg-sidebar/30 border border-border-slate rounded-3xl flex items-center justify-between group hover:bg-sidebar transition-all">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-accent-green/10 text-accent-green' : 'bg-red-500/10 text-red-500'}`}>
                      {tx.type === 'credit' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-black text-text-main uppercase">{tx.label}</p>
                      <p className="text-[9px] text-text-light font-bold uppercase tracking-widest mt-0.5">{tx.date}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className={`text-sm font-black ${tx.type === 'credit' ? 'text-accent-green' : 'text-text-main'}`}>
                      {tx.type === 'credit' ? '+' : '-'} Ksh {Math.abs(tx.amount).toLocaleString()}
                   </p>
                   <p className="text-[8px] font-bold text-text-light/40 uppercase tracking-widest mt-1">{tx.status}</p>
                </div>
             </div>
           ))}
        </div>
      </section>
    </motion.div>
  );
};
