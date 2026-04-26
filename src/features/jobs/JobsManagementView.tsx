import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Calendar, 
  Clock, 
  Activity, 
  FileText,
  User,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Booking } from '../../shared/types';
import { jobService } from './jobService';
import { db, auth } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

interface JobsManagementViewProps {
  bookings: Booking[];
  setToast: (t: { message: string }) => void;
}

export const JobsManagementView: React.FC<JobsManagementViewProps> = ({ bookings, setToast }) => { 
  const activeJobs = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'closed' && b.status !== 'paid');
  const pastJobs = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'closed' || b.status === 'paid');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const handleStartTask = async (bookingId: string) => {
    try {
      await jobService.updateBookingStatus(bookingId, 'in_progress');
      setToast({ message: "Operational lock engaged. Deployment is now 'In Progress'." });
    } catch (err) {
      console.error(err);
      setToast({ message: "Action failed: Unauthorized state transition." });
    }
  };

  const handleCompleteTask = async (booking: Booking) => {
    try {
      const providerName = auth.currentUser?.displayName || "SkillGrid Specialist";
      
      const clientSnap = await getDoc(doc(db, 'users', booking.clientId));
      const clientName = clientSnap.exists() ? clientSnap.data().name : "Client Node";

      await jobService.markTaskCompleted(booking, providerName, clientName);
      setToast({ message: "Task Finalized. E-Invoice generated and delivered for client approval." });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to finalize task." });
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 lg:p-14"
    >
      <div className="max-w-[1600px] mx-auto space-y-24">
       <motion.header variants={itemVariants} className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="text-left space-y-6">
            <div className="inline-flex items-center gap-4 px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-blue-100">
              <Activity size={14} />
              Live Network Status
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight mb-4">
              Operational<br />
              <span className="text-blue-600">Grid</span>
            </h2>
            <p className="text-slate-400 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
              Manage your active service tracks and deployment history with real-time grid synchronization.
            </p>
          </div>
          <div className="flex gap-4 p-3 bg-white border border-slate-200 rounded-[32px] shadow-xl shadow-slate-200/40">
             <button 
               onClick={() => setToast({ message: "Network analytics module currently in read-only mode." })}
               className="px-12 py-5 bg-blue-600 text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
             >
               Deployments
             </button>
             <button 
               onClick={() => setToast({ message: "Analytics synchronization pending. Check back later." })}
               className="px-12 py-5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-[24px] text-sm font-black uppercase tracking-widest transition-all"
             >
               Analytics
             </button>
          </div>
       </motion.header>

       <div className="space-y-40">
          <motion.section variants={itemVariants}>
             <div className="flex items-center gap-6 mb-12">
                 <div className="w-10 h-10 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200" />
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Active Deployments</h3>
               </div>

               <div className="grid grid-cols-1 gap-6">
                 {activeJobs.length === 0 ? (
                    <motion.div 
                      variants={itemVariants}
                      className="bg-white border border-slate-100 rounded-[32px] p-12 text-center shadow-sm"
                    >
                      <div className="w-24 h-24 bg-white border border-slate-50 rounded-[32px] shadow-lg flex items-center justify-center mx-auto mb-8 text-slate-200">
                        <Activity size={40} className="text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em] mb-3">No active operational sessions</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your node is currently in standby mode.</p>
                   </motion.div>
                 ) : (
                   <AnimatePresence mode="popLayout">
                    {activeJobs.map((job) => (
                      <motion.div 
                        key={job.id} 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                          <div className="flex flex-col md:flex-row items-center gap-8">
                             <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center border transition-all duration-500 ${job.status === 'in_progress' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                {job.status === 'in_progress' ? <Activity size={32} className="animate-pulse" /> : <Zap size={32} />}
                             </div>
                             <div className="text-left space-y-3">
                                <div className="flex items-center gap-4">
                                  <h4 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">{job.category} Specialist</h4>
                                  <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${job.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {job.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-300" /> On-Site Operation</p>
                                  <p className="flex items-center gap-2"><Clock size={14} className="text-slate-300" /> {job.time}</p>
                                  <p className="flex items-center gap-2"><Calendar size={14} className="text-slate-300" /> {job.date?.toDate ? job.date.toDate().toDateString() : job.date instanceof Date ? job.date.toDateString() : 'Active'}</p>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-center gap-10 self-end lg:self-auto w-full lg:w-auto">
                             <div className="text-right flex-1 lg:flex-none">
                                <p className="text-2xl font-black text-slate-800 tracking-tight">Ksh {job.price.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 flex items-center justify-end gap-2">
                                  <CheckCircle2 size={14} />
                                  Funds Secured
                                </p>
                             </div>

                             <div className="flex gap-4 w-full sm:w-auto">
                                {job.status === 'confirmed' && (
                                  <button 
                                    onClick={() => handleStartTask(job.id)}
                                    className="flex-1 sm:flex-none px-10 py-4 bg-blue-600 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                  >
                                    Engage Task
                                  </button>
                                )}

                                {job.status === 'in_progress' && (
                                  <button 
                                    onClick={() => handleCompleteTask(job)}
                                    className="flex-1 sm:flex-none px-10 py-4 bg-emerald-600 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                  >
                                    Finalize Operation
                                  </button>
                                )}

                                {job.status === 'completed' && (
                                  <div className="px-8 py-4 bg-slate-50 text-slate-400 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-slate-200">
                                     <Clock size={16} className="animate-spin-slow" /> Verification Pending
                                  </div>
                                )}
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                 )}
               </div>
          </motion.section>

          <motion.section variants={itemVariants}>
              <div className="flex items-center gap-6 mb-12">
                 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                   <Zap size={20} />
                 </div>
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Deployment History</h3>
              </div>

              <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="border-b border-slate-50">
                             <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Specialization</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Compensation</th>
                             <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {pastJobs.length === 0 ? (
                            <tr>
                               <td colSpan={4} className="px-10 py-20 text-center">
                                  <p className="text-sm text-slate-300 font-black uppercase tracking-[0.3em]">No historical data archives</p>
                               </td>
                            </tr>
                          ) : (
                            pastJobs.map((job) => (
                             <tr key={job.id} className="group/row hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-6">
                                   <div className="text-left space-y-1.5">
                                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover/row:text-blue-600 transition-colors">{job.category}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Calendar size={12} />
                                        {job.date?.toDate ? job.date.toDate().toLocaleDateString() : job.date instanceof Date ? job.date.toLocaleDateString() : 'Archive Record'}
                                      </p>
                                   </div>
                                </td>
                                <td className="px-10 py-6">
                                   <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                     job.status === 'completed' || job.status === 'paid' 
                                       ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                       : 'bg-red-50 text-red-600 border-red-100'
                                   }`}>
                                      {job.status}
                                   </span>
                                </td>
                                <td className="px-10 py-6">
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-black text-slate-800 uppercase">Ksh {job.price.toLocaleString()}</p>
                                    <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Disbursed</p>
                                  </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                   <button 
                                     onClick={() => setToast({ message: "Retrieving archived operational report..." })}
                                     className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-sm transition-all"
                                   >
                                      <FileText size={18} />
                                   </button>
                                </td>
                             </tr>
                            ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </motion.section>
       </div>
      </div>
    </motion.div>
  );
};
