import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Activity, 
  Clock,
  TrendingUp,
  ArrowUpRight,
  Download,
  Briefcase,
  Settings,
  LogOut
} from 'lucide-react';
import { UserRole, Booking } from '../../shared/types';
import { ReputationBar } from '../../shared/components/ReputationBar';
import { useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileViewProps {
  user: FirebaseUser | null;
  role: UserRole;
  bookings: Booking[];
  referralPoints?: number;
  onSignOut: () => void;
  onAction?: (action: { type: string, status?: string, bookingId?: string }) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  user,
  role, 
  bookings, 
  referralPoints, 
  onSignOut,
  onAction
}) => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const pendingPaymentsCount = bookings.filter(b => b.status === 'completed').length;
  const activeGigsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col md:flex-row md:divide-x divide-border-slate overflow-y-auto relative bg-[#F8FAFC]">
       {/* Sidebar / Stats */}
       <div className="w-full md:w-1/3 p-6 md:p-8 lg:p-12 flex flex-col items-center text-center bg-white border-r border-slate-100 shrink-0 overflow-y-auto">
          {/* ... existing profile header ... */}
          <div className="relative mb-6">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-[35px] border-[8px] border-white overflow-hidden shadow-2xl">
               <img src={user?.photoURL || `https://picsum.photos/seed/${role}/400/400`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute top-2 -right-6 bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
               ★ ELITE MEMBER
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">{user?.displayName || 'MICHAEL OCHIENG'}</h3>
          <p className="text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2 mb-8">{role} ACCOUNT</p>
          
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
             <div className="p-6 bg-white border border-slate-100 rounded-[30px] shadow-sm text-center">
                <span className="block text-3xl md:text-4xl font-black text-slate-800">{activeGigsCount}</span>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-2 block">Active Gigs</span>
             </div>
             <div className="p-6 bg-white border border-slate-100 rounded-[30px] shadow-sm text-center">
                <span className="block text-3xl md:text-4xl font-black text-slate-800">{pendingPaymentsCount}</span>
                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-2 block">Payments Due</span>
             </div>
          </div>

          {/* QR Code and TUUST ID Section */}
          <div className="w-full mb-8">
            <div className="bg-white border border-slate-100 p-6 rounded-[30px] flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                  <div className="text-3xl">📱</div>
                </div>
              </div>
              <div className="text-left flex-1">
                <div className="text-[9px] font-black text-slate-500 tracking-widest mb-1">TUUST ID</div>
                <div className="text-sm font-black text-slate-800">SG-2024-78392</div>
                <button 
                  onClick={() => onAction?.({ type: 'download_id', status: 'Generating identification...' })}
                  className="mt-2 flex items-center gap-2 text-[9px] font-black text-blue-600 hover:text-blue-700"
                >
                  <Download size={10} />
                  <span>DOWNLOAD</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full text-left bg-white p-6 border border-slate-100 rounded-3xl mb-8">
              <ReputationBar 
                rating={4.95} 
                reliability={role === 'client' ? 100 : 98} 
                flaggedCount={0} 
                label="Identity Reputation Matrix"
              />
          </div>

          <div className="w-full space-y-3">
             <button onClick={() => navigate('/settings')} className="w-full py-5 bg-white text-slate-900 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-sm">
                <Settings size={18} className="text-slate-600" />
                <span>Account Settings</span>
             </button>
             <button 
                onClick={() => onAction?.({ type: 'security_refresh', status: 'Network trust score optimal.' })}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em]"
             >
                <ShieldCheck size={18} />
                <span>STAT ENABLED</span>
             </button>
             <button 
              onClick={onSignOut}
              className="w-full py-5 text-red-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center gap-3 transition-all"
             >
                <LogOut size={18} />
                <span>Sign Out</span>
             </button>
          </div>
       </div>

       {/* Content Area */}
       <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8">
          
          {/* Performance Overview Section */}
          <div className="bg-white rounded-[45px] shadow-xl shadow-blue-900/5 border border-slate-50 overflow-hidden p-8">
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-sm font-black text-slate-800">Performance Overview</h4>
               <span className="text-[10px] font-black text-slate-500 tracking-widest">THIS MONTH</span>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[30px] p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-black text-blue-100 tracking-widest mb-1">EARNINGS</div>
                  <div className="text-3xl font-black text-white">$1,250</div>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl">
                  <TrendingUp size={24} className="text-white" />
                </div>
              </div>
              {/* Simple Bar Chart */}
              <div className="flex items-end gap-2 h-16">
                <div className="flex-1 bg-white/30 rounded-t-lg" style={{height: '40%'}}></div>
                <div className="flex-1 bg-white/30 rounded-t-lg" style={{height: '60%'}}></div>
                <div className="flex-1 bg-white/30 rounded-t-lg" style={{height: '45%'}}></div>
                <div className="flex-1 bg-white/30 rounded-t-lg" style={{height: '80%'}}></div>
                <div className="flex-1 bg-white/30 rounded-t-lg" style={{height: '70%'}}></div>
                <div className="flex-1 bg-white rounded-t-lg" style={{height: '100%'}}></div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100">
              <CheckCircle2 size={20} className="text-green-500" />
              <span className="text-xs font-black text-green-600 tracking-wider">IDENTITY VERIFIED</span>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <h4 className="text-sm font-black text-slate-800 mb-6">Recent Activity</h4>
            
            <div className="space-y-4">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <ArrowUpRight size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-slate-800">Payment Received</div>
                  <div className="text-[10px] text-slate-500 mt-1">2 hours ago</div>
                </div>
                <div className="text-sm font-black text-green-600">+$450</div>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-slate-800">Gig Completed</div>
                  <div className="text-[10px] text-slate-500 mt-1">Design Consultation</div>
                </div>
                <div className="text-xs font-black text-slate-500">1 day ago</div>
              </div>
            </div>
          </div>

          {/* Original Bookings Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2">Deployment Status</h4>
               <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full uppercase">100% Operational</span>
            </div>
            
            <div className="space-y-4">
               {bookings.length === 0 ? (
                 <div className="p-12 border-2 border-dashed border-slate-200 rounded-[40px] text-center bg-slate-50">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-300">
                       <Zap size={24} className="text-slate-500 opacity-20" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60">Zero Active Deployments</p>
                    <p className="text-[9px] text-slate-400 uppercase font-medium mt-1">Initiate discovery to find professional specialists</p>
                 </div>
               ) : (
                 bookings.slice().reverse().map(b => (
                   <div key={b.id} className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-xl hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                      <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                            b.status === 'completed' ? 'bg-green-500 shadow-green-500/20' : 
                            b.status === 'in_progress' ? 'bg-amber-500 shadow-amber-500/20' : 
                            'bg-blue-600 shadow-blue-500/20'
                         }`}>
                            {b.status === 'completed' ? <CheckCircle2 size={24} /> : b.status === 'in_progress' ? <Activity size={24} className="animate-pulse" /> : <Clock size={24} />}
                         </div>
                         <div className="text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                               <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">{b.category} Node Deployment</h5>
                               <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${
                                 b.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                                 b.status === 'in_progress' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600/20 text-blue-600'
                               }`}>{b.status}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                {b.date?.toDate ? b.date.toDate().toDateString() : (b.date instanceof Date ? b.date.toDateString() : (typeof b.date === 'string' ? new Date(b.date).toDateString() : 'Active'))} | {b.time || 'TBD'}
                            </p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                         <div className="text-right">
                            <p className="text-xs font-black text-slate-800 uppercase">Ksh {b.price.toLocaleString()}</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Escrow Secured</p>
                         </div>
                         {b.status === 'completed' && onAction && (
                            <button 
                              onClick={() => onAction?.({ type: 'invoice_sent', bookingId: b.id })}
                              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Review Invoice
                            </button>
                         )}
                         {b.status === 'paid' && (
                            <div className="px-5 py-2.5 bg-green-500/10 text-green-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
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
    </>
  );
};
