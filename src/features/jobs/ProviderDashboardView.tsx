import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Zap, 
  Bell, 
  Wallet, 
  History, 
  Star, 
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Booking, Provider } from '../../shared/types';
import { matchingService } from '../../shared/utils/matchingService';
import { 
  StatCard, 
  AvailabilityCalendar, 
  RequestItem 
} from './components/ProviderDashboardComponents';

interface ProviderDashboardViewProps {
  onProfileClick: () => void;
  isDeployed: boolean;
  toggleDeployment: () => void;
  bookings: Booking[];
  blockedDates: string[];
  toggleBlockDate: (date: string) => void;
  profile: any;
}

export const ProviderDashboardView: React.FC<ProviderDashboardViewProps> = ({ 
  onProfileClick, 
  isDeployed, 
  toggleDeployment,
  bookings,
  blockedDates,
  toggleBlockDate,
  profile
}) => {
  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'schedule' | 'analytics' | 'requests'>('overview');

  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed' || b.status === 'paid');
    const totalRevenue = completed.reduce((acc, b) => acc + b.price, 0);
    const activeGigs = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
    const compRate = bookings.length > 0 ? (completed.length / bookings.length) * 100 : 100;
    
    return {
      revenue: `Ksh ${totalRevenue.toLocaleString()}`,
      activeGigs: activeGigs.toString().padStart(2, '0'),
      compRate: `${compRate.toFixed(1)}%`,
      reputation: "4.95"
    };
  }, [bookings]);

  const matches = useMemo(() => {
    const virtualProvider: any = {
      ...profile,
      id: 'provider-id', // Placeholder
    };
    return matchingService.getMatchesForProvider(virtualProvider, bookings);
  }, [profile, bookings]);

  const navItems = [
    { id: 'overview', label: 'Monitor', icon: LayoutDashboard },
    { id: 'schedule', label: 'Availability', icon: Calendar },
    { id: 'analytics', label: 'Earnings', icon: BarChart3 },
    { id: 'requests', label: 'Deployments', icon: Zap },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full p-5 md:p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
       <header className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="text-left">
             <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 ${isDeployed ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} text-[9px] font-black uppercase tracking-widest rounded-md border`}>
                   {isDeployed ? 'Active Session' : 'Offline'}
                </span>
                {isDeployed && <span className="text-[10px] text-text-light font-bold uppercase tracking-widest">Since 08:30 AM</span>}
             </div>
             <h2 className="text-3xl md:text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Service Hub</h2>
             <p className="text-text-light text-xs md:text-sm font-medium">{isDeployed ? 'Monitoring your Nairobi service reach and active deployments.' : 'Ready to start your next session? Launch deployment to become visible.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-sidebar/30 p-1.5 rounded-2xl border border-border-slate">
             {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setDashboardSubTab(item.id as any)}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${dashboardSubTab === item.id ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main'}`}
                >
                   <item.icon size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
             ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
             <button className="w-10 h-10 md:w-12 md:h-12 bg-sidebar/20 border border-border-slate rounded-xl md:rounded-2xl flex items-center justify-center text-text-light hover:text-text-main hover:bg-sidebar transition-all relative">
                <Bell size={18} />
                {isDeployed && <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-1.5 h-1.5 md:w-2 md:h-2 bg-primary-blue rounded-full border-2 border-sidebar"></div>}
             </button>
             <button 
               onClick={onProfileClick}
               className="px-4 md:px-6 py-2.5 md:py-3.5 bg-sidebar border border-border-slate rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black text-text-main uppercase tracking-widest hover:bg-white hover:text-sidebar transition-all"
             >
                Settings
             </button>
             <button 
               onClick={toggleDeployment}
               className={`px-4 md:px-6 py-2.5 md:py-3.5 ${isDeployed ? 'bg-primary-blue text-white shadow-blue-500/20' : 'bg-sidebar border border-border-slate text-text-light hover:border-text-light'} rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all w-full lg:w-auto`}
             >
                {isDeployed ? 'Go Offline' : 'Launch Session'}
             </button>
          </div>
       </header>

       <div className="min-h-[60vh]">
          <AnimatePresence mode="wait">
             {dashboardSubTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard icon={Wallet} label="Net Revenue" value={stats.revenue} color="text-primary-blue" trend="+12.4%" />
                      <StatCard icon={Calendar} label="Active Gigs" value={stats.activeGigs} color="text-accent-purple" trend="Live" />
                      <StatCard icon={History} label="Comp. Rate" value={stats.compRate} color="text-accent-green" trend="Stable" />
                      <StatCard icon={Star} label="Reputation" value={stats.reputation} color="text-yellow-500" trend="Top 1%" />
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <section className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8">
                         <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 px-2 border-l-2 border-primary-blue">Recent Activity</h4>
                         <div className="space-y-6 text-left">
                            {[
                               { type: 'Payment', msg: 'Payout of Ksh 15,200 initiated', time: '1h ago', icon: Wallet },
                               { type: 'Job', msg: 'Cleaning at Westlands completed', time: '3h ago', icon: CheckCircle2 },
                               { type: 'Review', msg: 'Received 5-star rating from Jane', time: '5h ago', icon: Star },
                            ].map((item, i) => (
                               <div key={i} className="flex gap-4">
                                  <div className="w-8 h-8 rounded-xl bg-sidebar border border-border-slate flex items-center justify-center text-text-light shrink-0">
                                     <item.icon size={14} />
                                  </div>
                                  <div>
                                     <p className="text-xs font-bold text-text-main leading-tight mb-1">{item.msg}</p>
                                     <span className="text-[9px] font-bold text-text-light uppercase tracking-widest">{item.time} • {item.type}</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </section>

                      <section className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8">
                         <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 px-2 border-l-2 border-accent-green">System Health</h4>
                         <div className="space-y-8">
                            <div className="flex items-center justify-between">
                               <span className="text-[11px] font-bold text-text-main uppercase tracking-tight">Visibility Rank</span>
                               <span className="text-[10px] font-black text-accent-green uppercase">Top 5% in Nairobi</span>
                            </div>
                            <div className="w-full h-1.5 bg-sidebar-dark/20 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: '95%' }} className="h-full bg-accent-green" />
                            </div>
                            
                            <div className="p-4 bg-primary-blue/5 border border-primary-blue/20 rounded-2xl flex items-center gap-4 text-left">
                               <Zap size={20} className="text-primary-blue" />
                               <div>
                                  <p className="text-[10px] font-black text-text-main uppercase tracking-tight leading-none mb-1">Smart Engine Active</p>
                                  <p className="text-[9px] text-text-light font-bold">Algorithmic Match: {matches.length} target leads identified</p>
                               </div>
                            </div>
                         </div>
                      </section>
                   </div>
                </motion.div>
             )}

             {dashboardSubTab === 'schedule' && (
                <motion.div 
                  key="schedule"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                >
                   <div className="lg:col-span-2">
                      <AvailabilityCalendar 
                        bookings={bookings} 
                        blockedDates={blockedDates} 
                        onToggleDate={toggleBlockDate} 
                      />
                   </div>
                   <aside className="space-y-8 text-left">
                       <div className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8">
                          <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-6 underline decoration-primary-blue decoration-2 underline-offset-8">Quick Rules</h4>
                          <ul className="space-y-4">
                             {[
                                'Must confirm bookings 4h prior',
                                'Min 8h gap between shifts',
                                'Instant block on cancellation',
                             ].map((rule, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                   <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-1.5" />
                                   <span className="text-[10px] font-bold text-text-main/70 uppercase leading-snug">{rule}</span>
                                </li>
                             ))}
                          </ul>
                       </div>
                   </aside>
                </motion.div>
             )}

             {/* Add other dashboard sub-tabs as needed */}
          </AnimatePresence>
       </div>
    </motion.div>
  );
};
