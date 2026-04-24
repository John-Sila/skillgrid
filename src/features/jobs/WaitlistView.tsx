import React from 'react';
import { motion } from 'motion/react';
import { Clock, ShieldCheck, History, Zap } from 'lucide-react';
import { Booking } from '../../shared/types';

interface WaitlistViewProps {
  bookings: Booking[];
  waitlistEntries: any[];
}

export const WaitlistView: React.FC<WaitlistViewProps> = ({ bookings, waitlistEntries }) => {
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="h-full w-full flex flex-col p-6 md:p-10 lg:p-12 overflow-y-auto"
    >
      <header className="mb-10 text-left">
        <h2 className="text-3xl font-black text-text-main tracking-tight uppercase">Operational Queues</h2>
        <p className="text-text-light text-[10px] font-bold uppercase tracking-[0.4em] mt-1">Pending Reservations & Waitlist Status</p>
      </header>

      <div className="flex-1 space-y-10 text-left">
        {/* Waitlist Entries Section */}
        {waitlistEntries.length > 0 && (
          <section className="space-y-4">
             <h3 className="text-xs font-black text-primary-blue uppercase tracking-[0.3em] mb-4">Priority Waitlists</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waitlistEntries.map(entry => (
                  <div key={entry.id} className="p-6 bg-primary-blue/[0.03] border border-primary-blue/20 rounded-[32px] flex items-center justify-between group hover:bg-primary-blue/[0.05] transition-all">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue border border-primary-blue/20">
                           <Clock size={24} />
                        </div>
                        <div>
                           <h4 className="text-base font-black text-text-main uppercase tracking-tight">Tier: {entry.tier}</h4>
                           <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-0.5 text-left">Specialist ID: {entry.providerId?.slice(0, 8)}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-primary-blue bg-primary-blue/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary-blue/10 italic">In Queue</span>
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Pending Bookings Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Pending Confirmations</h3>
          {pendingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border-slate rounded-[40px] text-center bg-sidebar/5">
                <div className="w-20 h-20 bg-sidebar border border-border-slate rounded-3xl flex items-center justify-center text-text-light/20 mb-6 mx-auto">
                   <History size={32} />
                </div>
                <h3 className="text-xl font-black text-text-main uppercase mb-2">No active reservations</h3>
                <p className="text-xs text-text-light max-w-[240px] mx-auto">Reserved service slots will appear here awaiting specialist confirmation.</p>
            </div>
          ) : (
            pendingBookings.map(item => (
              <div key={item.id} className="p-6 bg-sidebar border border-border-slate rounded-[32px] flex items-center justify-between group hover:bg-white/[0.02] transition-all shadow-sm">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                       <ShieldCheck size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="text-base font-black text-text-main uppercase tracking-tight">{item.category} Slot</h4>
                       <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-0.5">
                            {item.date instanceof Date ? item.date.toDateString() : 'Active'} @ {item.time}
                        </p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/10">Waitlisted</span>
                    <p className="mt-2 text-xs font-black text-text-main uppercase tracking-tighter">Ksh {item.price.toLocaleString()}</p>
                 </div>
              </div>
            ))
          )}
        </section>
      </div>

      <div className="mt-10 p-6 bg-primary-blue/5 border border-primary-blue/20 rounded-[32px] flex items-center gap-5 text-left">
         <div className="w-12 h-12 bg-primary-blue rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
            <Zap size={20} />
         </div>
         <div className="text-left">
            <h5 className="text-xs font-black text-text-main uppercase tracking-tight">Priority Escalation</h5>
            <p className="text-[9px] text-text-light leading-relaxed">Upgrade to SkillGrid Gold to jump waitlists and get instant priority matching for urgent tasks.</p>
         </div>
      </div>
    </motion.div>
  );
};
