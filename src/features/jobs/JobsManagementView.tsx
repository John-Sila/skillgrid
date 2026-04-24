import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const activeJobs = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'closed');
  const pastJobs = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'closed');

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
    <div className="h-full w-full p-5 md:p-10 lg:p-16 overflow-y-auto">
       <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Operational Grid</h2>
            <p className="text-text-light text-sm font-medium">Manage your active service tracks and deployment history.</p>
          </div>
          <div className="flex gap-2 p-1 bg-sidebar/30 border border-border-slate rounded-2xl">
             <div className="px-5 py-2.5 bg-primary-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Deployment List</div>
             <div className="px-5 py-2.5 text-text-light hover:text-text-main rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Calendar Matrix</div>
          </div>
       </header>

       <div className="space-y-16">
          <section>
             <h3 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 flex items-center gap-2 border-l-2 border-primary-blue pl-4">
                Active Deployments
             </h3>
             <div className="grid grid-cols-1 gap-4">
                {activeJobs.length === 0 ? (
                   <div className="p-12 border-2 border-dashed border-border-slate rounded-[40px] text-center bg-sidebar/5">
                      <p className="text-xs text-text-light font-bold uppercase tracking-widest opacity-40">No active operational sessions</p>
                   </div>
                ) : (
                  activeJobs.map(job => (
                    <div key={job.id} className="p-8 bg-sidebar border border-border-slate rounded-[40px] shadow-xl hover:border-primary-blue/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                       <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-lg transition-all ${job.status === 'in_progress' ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'bg-primary-blue/10 border-primary-blue/20 text-primary-blue group-hover:bg-primary-blue group-hover:text-white'}`}>
                             {job.status === 'in_progress' ? <Activity size={28} className="animate-pulse" /> : <Zap size={28} />}
                          </div>
                          <div className="text-left">
                             <h4 className="text-xl font-black text-text-main uppercase tracking-tight">{job.category} Specialist Node</h4>
                             <div className="flex items-center gap-4 mt-1 opacity-60">
                                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> {job.date instanceof Date ? job.date.toDateString() : 'Active'}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> {job.time}</span>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${job.status === 'in_progress' ? 'bg-accent-green/20 text-accent-green' : 'bg-border-slate/40 text-text-light'}`}>{job.status}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-6 self-end md:self-auto">
                          <div className="text-right">
                             <p className="text-sm font-black text-text-main">Ksh {job.price.toLocaleString()}</p>
                             <p className="text-[8px] font-bold text-accent-green uppercase tracking-widest mt-1">Funds Secured</p>
                          </div>
                          
                          {job.status === 'confirmed' && (
                            <button 
                              onClick={() => handleStartTask(job.id)}
                              className="px-6 py-3 bg-primary-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                              Start Task
                            </button>
                          )}

                          {job.status === 'in_progress' && (
                            <button 
                              onClick={() => handleCompleteTask(job)}
                              className="px-6 py-3 bg-accent-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              Task Completed
                            </button>
                          )}

                          {job.status === 'completed' && (
                            <div className="px-6 py-3 bg-border-slate/10 text-text-light rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                               <Clock size={14} /> Approval Pending
                            </div>
                          )}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </section>

          <section>
             <h3 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em] mb-8 border-l-2 border-border-slate pl-4">Deployment History</h3>
             <div className="bg-sidebar/20 rounded-[40px] border border-border-slate overflow-hidden">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-sidebar/40 border-b border-border-slate text-left">
                         <th className="px-8 py-6 text-[9px] font-black text-text-light uppercase tracking-widest">Operation Entity</th>
                         <th className="px-8 py-6 text-[9px] font-black text-text-light uppercase tracking-widest">Status</th>
                         <th className="px-8 py-6 text-[9px] font-black text-text-light uppercase tracking-widest">Revenue</th>
                         <th className="px-8 py-6 text-[9px] font-black text-text-light uppercase tracking-widest text-right">Certificate</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-slate/50">
                      {pastJobs.map(job => (
                        <tr key={job.id} className="hover:bg-sidebar/30 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="text-left">
                                 <p className="text-sm font-black text-text-main uppercase">{job.category}</p>
                                 <p className="text-[9px] font-bold text-text-light/40 uppercase tracking-widest mt-0.5">{job.date instanceof Date ? job.date.toLocaleDateString() : 'Historical'}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${job.status === 'completed' ? 'bg-accent-green/10 text-accent-green' : 'bg-red-500/10 text-red-500'}`}>
                                 {job.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-sm font-black text-text-main">Ksh {job.price.toLocaleString()}</td>
                           <td className="px-8 py-6 text-right">
                              <button className="w-10 h-10 rounded-xl bg-sidebar/50 border border-border-slate flex items-center justify-center text-text-light/40 hover:text-primary-blue hover:border-primary-blue transition-all ml-auto"><FileText size={16} /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>
       </div>
    </div>
  );
};
