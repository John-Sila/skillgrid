import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Activity, 
  Clock 
} from 'lucide-react';
import { UserRole, Booking } from '../../shared/types';
import { MOCK_PROVIDERS } from '../../shared/mocks';
import { auth } from '../../firebase/config';
import { ReputationBar } from '../../shared/components/ReputationBar';

interface ProfileViewProps {
  role: UserRole;
  bookings: Booking[];
  referralPoints?: number;
  onSignOut: () => void;
  onAction?: (n: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  role, 
  bookings, 
  referralPoints, 
  onSignOut,
  onAction
}) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const getBookingProvider = (providerId: string) => {
    return MOCK_PROVIDERS.find(p => p.id === providerId) || MOCK_PROVIDERS[0];
  };

  const pendingPaymentsCount = bookings.filter(b => b.status === 'completed').length;
  const activeGigsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col md:flex-row md:divide-x divide-border-slate overflow-y-auto relative bg-card-bg/50">
       {/* Sidebar / Stats */}
       <div className="w-full md:w-1/3 p-6 md:p-8 lg:p-12 flex flex-col items-center text-center bg-sidebar/5 shrink-0 overflow-y-auto">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-[32px] md:rounded-[36px] p-1 border-2 border-primary-blue/30 mb-6 bg-gradient-to-br from-primary-blue/10 to-transparent">
             <img src={`https://picsum.photos/seed/${role}/200/200`} className="w-full h-full rounded-[28px] md:rounded-[32px] object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex items-center gap-2 mb-1">
             <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase">{auth.currentUser?.displayName || 'User Node'}</h3>
             {role === 'provider' && <ShieldCheck size={18} className="text-accent-green" />}
          </div>
          <p className="text-[9px] text-text-light font-black uppercase tracking-[0.3em] mb-8">{role} Account</p>
          
          <div className="w-full grid grid-cols-2 gap-3 mb-6">
             <div className="p-4 md:p-5 bg-card-bg border border-border-slate rounded-3xl shadow-sm text-center">
                <span className="block text-xl md:text-2xl font-black text-text-main">{activeGigsCount}</span>
                <span className="text-[8px] font-bold text-text-light uppercase tracking-widest leading-none">Active Gigs</span>
             </div>
             <div className="p-4 md:p-5 bg-card-bg border border-border-slate rounded-3xl shadow-sm text-center">
                <span className="block text-xl md:text-2xl font-black text-primary-blue">{pendingPaymentsCount}</span>
                <span className="text-[8px] font-bold text-text-light uppercase tracking-widest leading-none">Payments Due</span>
             </div>
          </div>

          <div className="w-full text-left bg-sidebar/40 p-6 border border-border-slate rounded-3xl mb-8">
              <ReputationBar 
                rating={4.95} 
                reliability={role === 'client' ? 100 : 98} 
                flaggedCount={0} 
                label="Identity Reputation Matrix"
              />
          </div>

          <div className="w-full space-y-2">
             <button className="w-full py-4 bg-primary-blue/10 text-primary-blue border border-primary-blue/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-blue hover:text-white transition-all">
                Download Trust Certificate
             </button>
             <button 
              onClick={onSignOut}
              className="w-full py-4 text-red-500 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/5 rounded-2xl border border-red-500/10"
             >
                Terminate Session
             </button>
          </div>
       </div>

       {/* Content Area */}
       <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.3em] pl-2">Deployment Status</h4>
               <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-3 py-1 rounded-full uppercase">100% Operational</span>
            </div>
            
            <div className="space-y-4">
               {bookings.length === 0 ? (
                 <div className="p-12 border-2 border-dashed border-border-slate rounded-[40px] text-center bg-sidebar/5">
                    <div className="w-16 h-16 bg-sidebar/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-border-slate">
                       <Zap size={24} className="text-text-light opacity-20" />
                    </div>
                    <p className="text-xs text-text-light font-bold uppercase tracking-widest opacity-40">Zero Active Deployments</p>
                    <p className="text-[9px] text-text-light/30 uppercase font-medium mt-1">Initiate discovery to find professional specialists</p>
                 </div>
               ) : (
                 bookings.slice().reverse().map(b => (
                   <div key={b.id} className="p-6 bg-card-bg border border-border-slate rounded-[32px] shadow-xl hover:border-primary-blue/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                      <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                            b.status === 'completed' ? 'bg-accent-green shadow-accent-green/20' : 
                            b.status === 'in_progress' ? 'bg-amber-500 shadow-amber-500/20' : 
                            'bg-primary-blue shadow-blue-500/20'
                         }`}>
                            {b.status === 'completed' ? <CheckCircle2 size={24} /> : b.status === 'in_progress' ? <Activity size={24} className="animate-pulse" /> : <Clock size={24} />}
                         </div>
                         <div className="text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                               <h5 className="text-sm font-black text-text-main uppercase tracking-tight">{b.category} Node Deployment</h5>
                               <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${
                                 b.status === 'completed' ? 'bg-accent-green/20 text-accent-green' : 
                                 b.status === 'in_progress' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary-blue/20 text-primary-blue'
                               }`}>{b.status}</span>
                            </div>
                            <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">
                                {b.date instanceof Date ? b.date.toDateString() : 'Active'} | {b.time}
                            </p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                         <div className="text-right">
                            <p className="text-xs font-black text-text-main uppercase">Ksh {b.price.toLocaleString()}</p>
                            <p className="text-[8px] font-bold text-text-light/50 uppercase tracking-widest mt-0.5">Escrow Secured</p>
                         </div>
                         {b.status === 'completed' && onAction && (
                            <button 
                              onClick={() => onAction({ type: 'invoice_sent', bookingId: b.id })}
                              className="px-5 py-2.5 bg-primary-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Review Invoice
                            </button>
                         )}
                         {b.status === 'paid' && (
                            <div className="px-5 py-2.5 bg-accent-green/10 text-accent-green rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                               <CheckCircle2 size={12} /> Disbursed
                            </div>
                         )}
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
       </div>
    </motion.div>
  );
};
