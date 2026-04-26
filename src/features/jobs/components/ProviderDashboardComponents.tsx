import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  MapPin, 
  Zap,
  TrendingUp,
  Clock,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { Booking } from '../../../shared/types';

export const StatCard: React.FC<{ 
  icon: any, 
  label: string, 
  value: string, 
  color: string, 
  trend?: string, 
  status?: string,
  type?: 'chart' | 'progress' | 'default',
  progress?: number
}> = ({ 
  icon: Icon, label, value, color, trend, status, type = 'default', progress = 0
}) => {
  const baseColor = color.replace('text-', '');
  const accentColor = baseColor.includes('blue') ? 'blue-600' : baseColor.includes('emerald') ? 'emerald-600' : 'amber-500';
  const bgColor = `bg-${accentColor.split('-')[0]}-50`;
  const iconColor = `text-${accentColor}`;

  return (
    <div className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-500/30 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 group relative overflow-hidden h-full">
      {/* Background Pattern */}
      <div className="absolute -right-8 -top-8 w-64 h-64 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className={`p-6 rounded-[28px] ${bgColor} dark:bg-blue-900/20 ${iconColor} dark:text-blue-400 group-hover:scale-110 transition-transform duration-500 border border-transparent group-hover:border-${accentColor}/10 shadow-sm`}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
        
        <div className="flex flex-col items-end gap-4">
          {trend && (
            <div className="flex items-center gap-2.5 px-5 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
              <TrendingUp size={14} />
              <span className="text-[11px] font-black uppercase tracking-wider">{trend}</span>
            </div>
          )}
          {status && (
            <div className="flex items-center gap-2.5 px-5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider">{status}</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4">{label}</p>
            <div className="flex items-baseline gap-4">
              <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">{value}</p>
              {type === 'chart' && <ArrowUpRight size={28} className="text-blue-600 dark:text-blue-400 mb-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            </div>
          </div>

          {type === 'progress' && (
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="16"
                  className="text-slate-100 dark:text-slate-800"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <motion.circle
                  cx="18" cy="18" r="16"
                  className="text-blue-600 dark:text-blue-400"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - progress }}
                  strokeLinecap="round"
                  fill="none"
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute text-base font-black text-slate-900 dark:text-slate-100">{Math.round(progress)}%</span>
            </div>
          )}

          {type === 'chart' && (
            <div className="w-32 h-16 hidden lg:block">
              <svg className="w-full h-full text-blue-600" viewBox="0 0 64 32" preserveAspectRatio="none">
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M0 28C8 24 12 20 20 22C28 24 36 12 44 14C52 16 56 4 64 6" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AvailabilityCalendar: React.FC<{ 
  onToggleDate: (date: string) => void;
  blockedDates: string[];
  bookedDates: string[];
}> = ({ onToggleDate, blockedDates, bookedDates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  
  const calendarDays = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  for (let i = 0; i < startDay; i++) calendarDays.push({ day: '', current: false });
  for (let i = 1; i <= totalDays; i++) calendarDays.push({ day: i, current: true });

  return (
    <div className="bg-white dark:bg-slate-900 p-12 md:p-16 rounded-[64px] border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] mb-3">Availability Window</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Configure active service periods</p>
        </div>
        <div className="flex gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-3xl border border-slate-200 dark:border-slate-700">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-4 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-2xl transition-all"><ChevronLeft size={24} className="text-slate-400 dark:text-slate-500" /></button>
          <div className="px-8 py-4 text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-w-[160px] text-center flex items-center justify-center">
            {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(currentDate)}
          </div>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-4 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-2xl transition-all"><ChevronRight size={24} className="text-slate-400 dark:text-slate-500" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-8">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase py-2 tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4 flex-1">
        {calendarDays.map((date, i) => {
          if (!date.current) return <div key={`empty-${i}`} className="aspect-square" />;
          
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
          const isToday = date.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isBlocked = blockedDates.includes(dateStr);
          const isBooked = bookedDates.includes(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onToggleDate(dateStr)}
              className={`aspect-square rounded-[32px] flex flex-col items-center justify-center relative transition-all duration-300 group border-2 ${
                isBlocked ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40 shadow-sm' :
                isBooked ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40 shadow-sm' :
                'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-lg'
              } ${isToday ? 'ring-4 ring-blue-500/10 border-blue-600/50 dark:border-blue-400/50' : ''}`}
            >
              <span className={`text-base font-black ${isBlocked ? 'text-red-600 dark:text-red-400' : isBooked ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {date.day}
              </span>
              <div className="mt-3 flex gap-1.5">
                {isBlocked && <div className="w-2 h-2 rounded-full bg-red-500" />}
                {isBooked && <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
                {!isBlocked && !isBooked && <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-500" />}
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-4 py-2 rounded-xl shadow-xl uppercase tracking-widest whitespace-nowrap">
                  {isBlocked ? 'Unavailable' : isBooked ? 'Confirmed Job' : 'Available'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-12 flex items-center justify-center gap-12 pt-12 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Available</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/20" />
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Blocked</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-400 shadow-lg shadow-blue-500/20" />
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Booked</span>
        </div>
      </div>
    </div>
  );
};

export const RequestItem: React.FC<{ 
  id: string, 
  title: string, 
  time: string, 
  location: string, 
  type: 'emergency' | 'scheduled' | 'priority',
  price: string
}> = ({ title, time, location, type, price }) => {
  const typeStyles = {
    emergency: 'bg-red-50 text-red-600 border-red-100',
    scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
    priority: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className="group bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${typeStyles[type]} dark:bg-opacity-20`}>
            {type}
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Clock size={14} className="text-blue-500 dark:text-blue-400" /> {time}
          </span>
        </div>
        <div className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">{price}</div>
      </div>
      
      <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mb-8 uppercase tracking-widest">
        <MapPin size={14} className="text-slate-400 dark:text-slate-500" /> {location}
      </p>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex -space-x-3">
          {[1, 2].map(i => (
            <div key={i} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm" />
          ))}
        </div>
        <button className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:underline decoration-2 underline-offset-4">
          Deploy Now
        </button>
      </div>
    </div>
  );};
