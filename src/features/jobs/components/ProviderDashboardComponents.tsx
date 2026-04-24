import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  MapPin, 
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Booking } from '../../../shared/types';

export const StatCard: React.FC<{ icon: any, label: string, value: string, color: string, trend: string }> = ({ 
  icon: Icon, label, value, color, trend 
}) => (
  <div className="bg-sidebar/40 border border-border-slate rounded-[32px] p-6 hover:border-primary-blue/30 transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color.replace('text-', 'bg-')} opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity`}></div>
    <div className="flex items-start justify-between mb-8">
      <div className={`w-12 h-12 rounded-2xl bg-sidebar border border-border-slate flex items-center justify-center ${color} shadow-lg transition-transform group-hover:scale-110`}>
        <Icon size={22} />
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{trend}</span>
        <div className="w-8 h-0.5 bg-sidebar-dark/20 rounded-full mt-1"></div>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-text-light uppercase tracking-[0.2em]">{label}</p>
      <p className="text-2xl font-black text-text-main tracking-tighter">{value}</p>
    </div>
  </div>
);

export const AvailabilityCalendar: React.FC<{ 
  bookings: Booking[], 
  blockedDates: string[], 
  onToggleDate: (date: string) => void 
}> = ({ bookings, blockedDates, onToggleDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const prevMonthDays = daysInMonth(year, month - 1);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarDays = [];
  
  for (let i = startDay - 1; i >= 0; i--) calendarDays.push({ day: prevMonthDays - i, current: false });
  for (let i = 1; i <= numDays; i++) calendarDays.push({ day: i, current: true });
  const remainingSlots = 42 - calendarDays.length;
  for (let i = 1; i <= remainingSlots; i++) calendarDays.push({ day: i, current: false });

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isBlocked = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blockedDates.includes(dateStr);
  };

  const hasBooking = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.some(b => {
      const bDate = new Date(b.date);
      const bStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
      return bStr === dateStr;
    });
  };

  return (
    <div className="bg-sidebar/40 border border-border-slate rounded-[40px] p-8">
       <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black text-text-light uppercase tracking-[0.4em]">Availability</h4>
          <div className="flex items-center gap-2">
             <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-sidebar rounded-lg transition-colors text-text-light"><ChevronLeft size={16} /></button>
             <span className="text-[10px] font-black text-text-main uppercase tracking-widest min-w-[100px] text-center">{monthName}</span>
             <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-sidebar rounded-lg transition-colors text-text-light"><ChevronRight size={16} /></button>
          </div>
       </div>

       <div className="grid grid-cols-7 gap-2 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-[8px] font-black text-text-light/40 text-center uppercase">{d}</div>
          ))}
       </div>

       <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            const blocked = date.current && isBlocked(date.day);
            const booked = date.current && hasBooking(date.day);
            const today = date.current && isToday(date.day);
            
            return (
              <button
                key={i}
                disabled={!date.current}
                onClick={() => date.current && onToggleDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group ${
                  !date.current ? 'opacity-10 cursor-default shadow-none border-transparent bg-transparent' : 
                  blocked ? 'bg-red-500/20 border border-red-500/30 text-red-500' :
                  booked ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/5' :
                  'hover:bg-sidebar border border-transparent text-text-light'
                } ${today ? 'ring-1 ring-primary-blue ring-offset-2 ring-offset-sidebar' : ''}`}
              >
                <span className={`text-[10px] font-black ${date.current ? (blocked ? 'text-red-500' : booked ? 'text-amber-500' : 'text-text-main') : 'text-text-light/20'}`}>
                  {date.day}
                </span>
                {booked && !blocked && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500"></div>}
                {date.current && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity bg-sidebar/90 rounded-xl pointer-events-none border border-primary-blue/30 overflow-hidden">
                    <span className="text-[6px] font-black uppercase tracking-widest text-primary-blue animate-pulse">
                      {blocked ? 'Open' : 'Block'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
       </div>
    </div>
  );
};

export const RequestItem: React.FC<{ 
  name: string, 
  clientId?: string, 
  time: string, 
  location: string, 
  price: number, 
  urgency: string, 
  matchScore?: number 
}> = ({ name, clientId, time, location, price, urgency, matchScore }) => (
  <div className="p-6 bg-sidebar/20 border border-border-slate rounded-[32px] flex items-center justify-between group hover:border-primary-blue/30 transition-all">
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 bg-sidebar border border-border-slate rounded-2xl flex items-center justify-center text-text-light relative shrink-0">
        <User size={24} />
        {matchScore && matchScore > 90 && (
           <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center border-2 border-sidebar shadow-lg">
              <Zap size={10} fill="currentColor" />
           </div>
        )}
      </div>
      <div className="text-left">
        <div className="flex items-center gap-2 mb-1">
           <h5 className="text-sm font-black text-text-main uppercase tracking-tight">{name}</h5>
           <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${
             urgency === 'Critical' ? 'bg-red-500 text-white' : 'bg-primary-blue/10 text-primary-blue'
           }`}>{urgency}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-light font-bold uppercase tracking-widest">
           <div className="flex items-center gap-1"><Clock size={12} /> {time}</div>
           <div className="flex items-center gap-1"><MapPin size={12} /> {location}</div>
        </div>
      </div>
    </div>
    <div className="text-right hidden sm:block">
       <p className="text-lg font-black text-text-main tracking-tighter">Ksh {price.toLocaleString()}</p>
       <button className="text-[9px] font-black text-primary-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Deploy Now</button>
    </div>
  </div>
);
