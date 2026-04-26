import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  MoreHorizontal,
  Settings,
  Activity,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Booking, Provider } from '../../shared/types';
import { matchingService } from '../../shared/utils/matchingService';
import { 
  StatCard, 
  AvailabilityCalendar, 
  RequestItem 
} from './components/ProviderDashboardComponents';
import { Toast } from '../../shared/components/Toast';

interface ProviderDashboardViewProps {
  onProfileClick: () => void;
  isDeployed: boolean;
  toggleDeployment: () => void;
  bookings: Booking[];
  blockedDates: string[];
  toggleBlockDate: (date: string) => void;
  setBlockedDatesBatch: (dates: string[]) => void;
  profile: any;
}

export const ProviderDashboardView: React.FC<ProviderDashboardViewProps> = ({ 
  onProfileClick, 
  isDeployed, 
  toggleDeployment,
  bookings,
  blockedDates,
  toggleBlockDate,
  setBlockedDatesBatch,
  profile
}) => {
  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'schedule' | 'analytics' | 'settings'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const handleSync = () => {
    setIsSyncing(true);
    setToast({ message: "Synchronizing node telemetry with grid..." });
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleToggleDeployment = () => {
    toggleDeployment();
    setToast({ 
      message: isDeployed 
        ? "Node termination sequence initiated. Disconnecting from grid..." 
        : "Node initialization successful. Synchronizing with service grid..." 
    });
  };

  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed' || b.status === 'paid');
    const totalRevenue = completed.reduce((acc, b) => acc + b.price, 0);
    const activeGigs = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
    const compRate = bookings.length > 0 ? (completed.length / bookings.length) * 100 : 98.2;
    
    return {
      revenue: `Ksh ${totalRevenue.toLocaleString()}`,
      activeGigs: activeGigs.toString().padStart(2, '0'),
      compRate: `${compRate.toFixed(1)}%`,
      reputation: "4.95",
      compRateValue: compRate,
      reputationValue: 98
    };
  }, [bookings]);

  const navItems = [
    { id: 'overview', label: 'Monitor', icon: LayoutDashboard },
    { id: 'schedule', label: 'Availability', icon: Calendar },
    { id: 'analytics', label: 'Earnings', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const bookedDates = useMemo(() => {
    return bookings.map(b => {
      const d = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
  }, [bookings]);

  const [settings, setSettings] = useState({
    smartMatching: true,
    emergencyAlerts: true,
    autoAccept: false,
    regionBoost: true
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* Sticky Header with Dynamic Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 md:px-12 py-4 flex items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setDashboardSubTab(item.id as any)}
              className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                dashboardSubTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
              }`}
            >
              <item.icon size={20} strokeWidth={dashboardSubTab === item.id ? 2.5 : 2} />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end mr-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Node: SG-NBO-001</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isDeployed ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${isDeployed ? 'text-green-600' : 'text-slate-400'}`}>
                {isDeployed ? 'Live Status' : 'Standby'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleToggleDeployment}
            className={`group relative overflow-hidden px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 ${
              isDeployed 
                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white hover:shadow-xl hover:shadow-red-500/20' 
                : 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1'
            }`}
          >
            <span className="relative z-10 flex items-center gap-3">
              <Zap size={18} fill={isDeployed ? "none" : "currentColor"} className={isDeployed ? 'animate-pulse' : ''} />
              {isDeployed ? 'Terminate Node' : 'Initialize Node'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-8 md:p-12 lg:p-16">
          <header className="mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                isDeployed 
                  ? 'bg-green-50 text-green-600 border-green-100' 
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {isDeployed ? 'Live Telemetry Active' : 'System Standby'}
              </span>
              <div className="h-[2px] w-16 bg-gradient-to-r from-slate-200 to-transparent" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight mb-4">
              Service <span className="text-blue-600 relative">Matrix<div className="absolute -bottom-2 left-0 w-full h-2 bg-blue-600/10 rounded-full" /></span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg font-medium max-w-3xl leading-relaxed">
              {isDeployed 
                ? 'Your professional node is synchronized with the local service grid. Priority matching and real-time telemetry are currently enabled.' 
                : 'Node is currently in standby mode. Initialize your terminal to begin receiving service requests and synchronization with the grid.'}
            </p>
          </header>

          <AnimatePresence mode="wait">
            {dashboardSubTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-10"
              >
                <div className="xl:col-span-8 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="md:col-span-2">
                      <StatCard 
                        icon={Wallet} 
                        label="Projected Revenue Stream" 
                        value={stats.revenue} 
                        color="text-blue-600" 
                        trend="+12.4% vs last period" 
                        type="chart"
                      />
                    </div>
                    <StatCard 
                      icon={Activity} 
                      label="Node Latency" 
                      value="18ms" 
                      color="text-emerald-600" 
                      status="OPTIMIZED" 
                    />
                    <StatCard 
                      icon={Star} 
                      label="Trust Protocol Rating" 
                      value={stats.reputation} 
                      color="text-amber-500" 
                      type="progress"
                      progress={stats.reputationValue}
                    />
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[56px] p-12 md:p-16 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
                    <div className="flex items-center justify-between mb-16">
                      <div>
                        <h4 className="text-base font-black text-slate-900 uppercase tracking-[0.2em] mb-3">Network Infrastructure Status</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Real-time health & connectivity metrics</p>
                      </div>
                      <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="p-6 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-3xl transition-all border border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10"
                      >
                        <Activity size={28} className={isSyncing ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
                      {[
                        { label: 'Uptime', val: '99.98%', status: 'text-green-600', sub: 'Last 90d' },
                        { label: 'System Load', val: '8%', status: 'text-blue-600', sub: 'Highly Optimized' },
                        { label: 'Grid Peers', val: '1,284', status: 'text-slate-400', sub: 'Active Nodes' },
                        { label: 'Operational Region', val: 'NBO-EA', status: 'text-slate-900', sub: 'East Africa' }
                      ].map((m, i) => (
                        <div key={i} className="space-y-6">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.label}</p>
                          <p className={`text-2xl md:text-3xl font-black tracking-tight ${m.status}`}>{m.val}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-4 space-y-12">
                  <div className="bg-white border border-slate-200 rounded-[56px] p-12 md:p-16 shadow-sm flex flex-col h-full hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                    <div className="flex items-center justify-between mb-16">
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-[0.2em]">Deployment Log</h4>
                      <button onClick={handleSync} disabled={isSyncing} className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline disabled:opacity-50">
                        {isSyncing ? 'Synchronizing...' : 'Live Feed'}
                      </button>
                    </div>

                    <div className="space-y-12 flex-1">
                      {[
                        { msg: 'System integrity verification complete', time: 'Just now', type: 'System', color: 'bg-emerald-500' },
                        { msg: 'Revenue synchronization successful', time: '12m ago', type: 'Wallet', color: 'bg-blue-500' },
                        { msg: 'High-priority matching enabled', time: '45m ago', type: 'Protocol', color: 'bg-amber-500' },
                        { msg: 'Node SG-NBO-001 connected', time: '1h ago', type: 'Network', color: 'bg-slate-400' },
                      ].map((log, i) => (
                        <div key={i} className="flex gap-10 group">
                          <div className="relative">
                            <div className={`w-2 h-full rounded-full ${log.color} opacity-10`} />
                            <div className={`absolute top-0 left-0 w-2 h-8 rounded-full ${log.color}`} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-700 leading-tight mb-2 uppercase tracking-tight">{log.msg}</p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{log.time} • {log.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="mt-16 w-full py-8 bg-slate-900 text-white text-sm font-black uppercase tracking-[0.3em] rounded-[32px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 disabled:opacity-50 active:scale-[0.98] border border-slate-800"
                    >
                      {isSyncing ? 'Running Diagnostics...' : 'Full Infrastructure Audit'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {dashboardSubTab === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
              >
                <div className="lg:col-span-8">
                  <AvailabilityCalendar 
                    bookedDates={bookedDates} 
                    blockedDates={blockedDates} 
                    onToggleDate={toggleBlockDate} 
                  />
                </div>
                <div className="lg:col-span-4 space-y-12">
                  <div className="bg-white border border-slate-200 rounded-[56px] p-12 md:p-16 shadow-sm">
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-[0.2em] mb-16">Operational Controls</h4>
                    <div className="space-y-10">
                      <button 
                        onClick={() => {
                          handleSync();
                          setBlockedDatesBatch([]);
                        }}
                        disabled={isSyncing || blockedDates.length === 0}
                        className="w-full p-10 bg-slate-50 border border-slate-100 rounded-[48px] flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all disabled:opacity-50"
                      >
                        <div className="text-left">
                          <p className="text-base font-black text-slate-900 uppercase tracking-widest mb-3">Reset Grid Blocks</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Clear all current restrictions</p>
                        </div>
                        <ChevronRight size={28} className="text-slate-300 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1" />
                      </button>
                      <button 
                        onClick={() => {
                          handleSync();
                          const now = new Date();
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const days = new Date(year, month + 1, 0).getDate();
                          const newBlocked = [...blockedDates];
                          for (let d = 1; d <= days; d++) {
                            const date = new Date(year, month, d);
                            if (date.getDay() === 0 || date.getDay() === 6) {
                              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                              if (!newBlocked.includes(dateStr)) {
                                newBlocked.push(dateStr);
                              }
                            }
                          }
                          setBlockedDatesBatch(newBlocked);
                        }}
                        disabled={isSyncing}
                        className="w-full p-10 bg-slate-50 border border-slate-100 rounded-[48px] flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all disabled:opacity-50"
                      >
                        <div className="text-left">
                          <p className="text-base font-black text-slate-900 uppercase tracking-widest mb-3">Weekend Lockdown</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Apply recurring weekend blocks</p>
                        </div>
                        <ChevronRight size={28} className="text-slate-300 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-600 rounded-[56px] p-12 md:p-16 text-white shadow-2xl shadow-blue-200 relative overflow-hidden border border-blue-500 group">
                    <Zap className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                    <h4 className="text-base font-black uppercase tracking-[0.2em] mb-8 relative z-10">Intelligent Scheduling</h4>
                    <p className="text-lg font-medium opacity-90 leading-relaxed mb-16 relative z-10 uppercase tracking-[0.1em]">
                      Leverage AI-driven availability optimization to maximize your node's matching probability and efficiency.
                    </p>
                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="w-full py-8 bg-white text-blue-600 text-sm font-black uppercase tracking-[0.2em] rounded-[32px] shadow-xl relative z-10 active:scale-95 transition-all hover:bg-slate-50 hover:shadow-2xl"
                    >
                      {isSyncing ? 'Optimizing...' : 'Optimize Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {dashboardSubTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-[56px] p-12 md:p-16 shadow-sm hover:shadow-2xl transition-all">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
                      <div>
                        <h4 className="text-base font-black text-slate-900 uppercase tracking-[0.2em] mb-3">Revenue Analytics</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Net earnings after platform service fees</p>
                      </div>
                      <div className="flex gap-6">
                        <button onClick={handleSync} className="px-10 py-5 bg-slate-50 text-xs font-black text-slate-600 uppercase tracking-[0.2em] rounded-3xl border border-slate-200 hover:bg-white hover:shadow-lg transition-all">Export</button>
                        <button onClick={handleSync} className="px-12 py-5 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">Withdraw</button>
                      </div>
                    </div>
                    <div className="h-80 flex items-end gap-4 px-6">
                      {[40, 65, 45, 90, 55, 75, 85, 40, 60, 95, 70, 80].map((h, i) => (
                        <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="bg-blue-50 group-hover:bg-blue-600 rounded-t-2xl transition-all duration-500 relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-t-2xl" />
                          </motion.div>
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2">
                            <div className="bg-slate-900 text-white text-xs font-black px-4 py-3 rounded-xl whitespace-nowrap shadow-2xl">
                              Ksh {(h * 150).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-10 px-4 border-t border-slate-100 pt-8">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                        <span key={m} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-[56px] p-10 shadow-sm">
                      <div className="flex items-center justify-between mb-10">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Transactions</h4>
                        <History size={20} className="text-slate-400" />
                      </div>
                      <div className="space-y-8">
                        {[
                          { id: 'TX-902', amt: '+ Ksh 4,200', date: 'Oct 24', type: 'Credit' },
                          { id: 'TX-881', amt: '+ Ksh 12,500', date: 'Oct 22', type: 'Credit' },
                          { id: 'TX-850', amt: '- Ksh 15,000', date: 'Oct 20', type: 'Withdraw' }
                        ].map(tx => (
                          <div key={tx.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 ${tx.amt.startsWith('+') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                <Wallet size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{tx.id}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tx.date} • {tx.type}</p>
                              </div>
                            </div>
                            <span className={`text-sm font-black tracking-tight ${tx.amt.startsWith('+') ? 'text-green-600' : 'text-slate-900'}`}>{tx.amt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="w-full py-6 bg-white border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-[0.2em] rounded-[32px] hover:text-blue-600 hover:border-blue-600 transition-all group shadow-sm hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center gap-3">
                        View Full Ledger <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {dashboardSubTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto space-y-10"
              >
                <div className="bg-white border border-slate-200 rounded-[56px] p-12 shadow-sm">
                  <div className="flex items-center gap-6 mb-16">
                    <div className="w-2.5 h-12 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Node Configuration</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">System ID: SG-NBO-001</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {[
                      { key: 'smartMatching', label: 'Smart Matching', desc: 'Prioritize high-yield local opportunities', icon: Zap },
                      { key: 'emergencyAlerts', label: 'Emergency Alerts', desc: 'Push notifications for critical requests', icon: Bell },
                      { key: 'autoAccept', label: 'Auto-Accept', desc: 'Instantly confirm jobs meeting your criteria', icon: CheckCircle2 },
                      { key: 'regionBoost', label: 'Region Boost', desc: 'Increase visibility in Nairobi central node', icon: TrendingUp },
                    ].map(opt => (
                      <div key={opt.key} className="flex items-center justify-between group">
                        <div className="flex items-start gap-6 max-w-[80%]">
                          <div className={`p-4 rounded-2xl border-2 transition-all duration-500 ${settings[opt.key as keyof typeof settings] ? 'bg-blue-50 border-blue-500/20 text-blue-600 shadow-lg shadow-blue-500/10' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                            <opt.icon size={24} />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">{opt.label}</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-widest">{opt.desc}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleSetting(opt.key as any)}
                          className={`w-16 h-8 rounded-full relative transition-all duration-500 shadow-inner p-1 ${settings[opt.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 transform ${settings[opt.key as keyof typeof settings] ? 'translate-x-8' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-20 pt-12 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-slate-300" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] italic">End-to-end encrypted sync</p>
                    </div>
                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="px-12 py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.3em] rounded-[32px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 disabled:opacity-50 active:scale-[0.98] border border-slate-800"
                    >
                      {isSyncing ? 'Synchronizing...' : 'Save Configuration'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {toast && (
          <Toast 
            toast={toast} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
