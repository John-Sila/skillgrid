import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  History,
  Download,
  ShieldCheck,
  ChevronRight,
  Plus
} from 'lucide-react';

import { Toast } from '../../shared/components/Toast';

export const WalletView: React.FC = () => { 
  const [toast, setToast] = React.useState<{ message: string } | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-full w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Elite Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Financial Overview</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">
              Wallet <span className="text-blue-600/50">/</span> Ledger
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <button 
              onClick={() => setToast({ message: "Preparing financial report for export..." })}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest transition-all"
            >
              <Download size={14} className="text-slate-400" />
              Export
            </button>
            <button 
              onClick={() => setToast({ message: "M-Pesa STK Push initialization sequence started..." })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-md shadow-blue-100 dark:shadow-none"
            >
              <Plus size={14} />
              Top Up
            </button>
          </div>
        </header>

        {/* Main Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Platinum Balance Card */}
          <div className="lg:col-span-8 group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative h-full bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm overflow-hidden">
              {/* Abstract Background Decoration */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-blue-50/50 dark:bg-blue-900/20 rounded-full blur-2xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-8">
                <div className="flex flex-col justify-between space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Master Account</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">**** 4412</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Available Balance</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">
                          <span className="text-2xl text-slate-400 dark:text-slate-500 mr-2 font-medium italic">Ksh</span>12,450
                        </span>
                        <span className="text-2xl font-black text-blue-600/60 dark:text-blue-400/60">.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800" />
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-600 dark:text-blue-400">
                        +4
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Linked Entities</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between md:items-end gap-6">
                  <div className="text-right hidden md:block">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <TrendingUp size={12} />
                      <span className="text-[10px] font-black">+12.4%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-48">
                    <button 
                      onClick={() => setToast({ message: "Withdrawal gateway currently in synchronization mode." })}
                      className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-200 dark:shadow-none active:scale-[0.98]"
                    >
                      Withdraw Funds
                    </button>
                    <button 
                      onClick={() => setToast({ message: "Loading advanced account analytics..." })}
                      className="w-full py-3.5 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-[0.98]"
                    >
                      Account Stats
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="lg:col-span-4 grid grid-rows-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm group hover:border-blue-100 dark:hover:border-blue-900 transition-colors">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Earnings Cycle</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Ksh 84,200</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Total Lifetime</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-[32px] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Elite Tier</p>
                  <ShieldCheck size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xl font-black text-white tracking-tight uppercase italic">Top 2% Provider</p>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                    <div className="w-3/4 h-full bg-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Transactions */}
        <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <History size={16} />
              </div>
              <h2 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Transaction Ledger</h2>
            </div>
            <button 
              onClick={() => setToast({ message: "Synchronizing full transaction archive..." })}
              className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View History
            </button>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {[
              { label: 'Deployment Release #4412', amount: 3500, type: 'credit', status: 'Cleared', date: '24 Apr' },
              { label: 'System Service Fee', amount: -350, type: 'debit', status: 'Cleared', date: '24 Apr' },
              { label: 'Payout to M-PESA', amount: -5000, type: 'debit', status: 'Processing', date: '22 Apr' },
              { label: 'Referral Bonus Reward', amount: 1200, type: 'credit', status: 'Cleared', date: '20 Apr' },
            ].map((tx, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setToast({ message: `Accessing secure record for transaction #${Math.floor(Math.random() * 9000) + 1000}...` })}
                className="group flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    tx.type === 'credit' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'
                  }`}>
                    {tx.type === 'credit' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tx.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{tx.date}</p>
                      <span className="w-0.5 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        tx.status === 'Cleared' ? 'text-emerald-500 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm font-black tracking-tighter ${
                    tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'} <span className="text-[10px] font-medium mr-0.5">Ksh</span>{Math.abs(tx.amount).toLocaleString()}
                  </p>
                  <ChevronRight size={12} className="ml-auto mt-1 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast 
            toast={toast} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

