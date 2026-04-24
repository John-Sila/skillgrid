import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Briefcase, 
  History, 
  MessageSquare, 
  User, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Wallet,
  Users,
  Sun,
  Moon,
  Bell
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '../features/auth/AuthProvider';
import { Logo } from '../shared/components/Logo';
import { NavIcon, MobileNavItem } from '../shared/components/Navigation';
import { NotificationBell } from '../shared/components/NotificationBell';

export const AppLayout: React.FC = () => {
  const { userRole, setUserRole } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-0 md:p-8 transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg-sidebar-light' : 'bg-slate-100'}`}>
      <div className="w-full h-full md:h-[95vh] md:max-w-[1400px] bg-sidebar md:shadow-3xl md:rounded-[40px] md:border border-border-slate flex flex-col md:flex-row overflow-hidden relative app-container">
        
        {/* Sidebar Nav (Desktop/Tablet) */}
        <nav className="hidden md:flex w-20 lg:w-24 border-r border-border-slate flex-col items-center py-10 gap-8 shrink-0 bg-sidebar/50 backdrop-blur-md">
          <div className="mb-4 cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate('/')}>
            <Logo showText={false} />
          </div>
          
          <div className="flex flex-col gap-4">
            {userRole === 'client' ? (
              <>
                <NavIcon active={currentPath === '/discover'} onClick={() => navigate('/discover')} icon={Search} label="Discover" />
                <NavIcon active={currentPath === '/services'} onClick={() => navigate('/services')} icon={Briefcase} label="Services" />
                <NavIcon active={currentPath === '/waitlist'} onClick={() => navigate('/waitlist')} icon={History} label="Waitlist" />
                <NavIcon active={currentPath === '/chat'} onClick={() => navigate('/chat')} icon={MessageSquare} label="Chat" />
                <NavIcon active={currentPath === '/profile'} onClick={() => navigate('/profile')} icon={User} label="Profile" />
              </>
            ) : (
              <>
                <NavIcon active={currentPath === '/dashboard'} onClick={() => navigate('/dashboard')} icon={LayoutDashboard} label="Dashboard" />
                <NavIcon active={currentPath === '/catalog'} onClick={() => navigate('/catalog')} icon={BookOpen} label="Catalogue" />
                <NavIcon active={currentPath === '/jobs'} onClick={() => navigate('/jobs')} icon={Calendar} label="Jobs" />
                <NavIcon active={currentPath === '/wallet'} onClick={() => navigate('/wallet')} icon={Wallet} label="Wallet" />
                <NavIcon active={currentPath === '/profile'} onClick={() => navigate('/profile')} icon={User} label="Profile" />
              </>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-4 items-center">
            <button 
              onClick={() => setUserRole(userRole === 'client' ? 'provider' : 'client')}
              className="w-12 h-12 rounded-full border border-border-slate flex items-center justify-center text-text-light hover:text-text-main hover:bg-primary-blue/10 transition-all overflow-hidden"
            >
              {userRole === 'client' ? <Briefcase size={20} /> : <Users size={20} />}
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-12 h-12 rounded-full border border-border-slate flex items-center justify-center text-text-light hover:text-text-main hover:bg-primary-blue/10 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <NotificationBell count={0} onClick={() => {}} />
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-card-bg/50 flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border-slate bg-sidebar/80 backdrop-blur-md z-30 shrink-0">
            <Logo />
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setUserRole(userRole === 'client' ? 'provider' : 'client')}
                className="w-10 h-10 rounded-full border border-border-slate flex items-center justify-center text-text-light active:bg-primary-blue/10"
              >
                {userRole === 'client' ? <Briefcase size={16} /> : <Users size={16} />}
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-full border border-border-slate flex items-center justify-center text-text-light active:bg-primary-blue/10"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <NotificationBell count={0} onClick={() => {}} />
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <Outlet />
          </div>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden flex items-center justify-around p-3 border-t border-border-slate bg-sidebar/80 backdrop-blur-md z-30 shrink-0">
            {userRole === 'client' ? (
              <>
                <MobileNavItem active={currentPath === '/discover'} onClick={() => navigate('/discover')} icon={Search} label="Discover" />
                <MobileNavItem active={currentPath === '/services'} onClick={() => navigate('/services')} icon={Briefcase} label="Services" />
                <MobileNavItem active={currentPath === '/waitlist'} onClick={() => navigate('/waitlist')} icon={History} label="Waitlist" />
                <MobileNavItem active={currentPath === '/chat'} onClick={() => navigate('/chat')} icon={MessageSquare} label="Chat" />
                <MobileNavItem active={currentPath === '/profile'} onClick={() => navigate('/profile')} icon={User} label="Profile" />
              </>
            ) : (
              <>
                <MobileNavItem active={currentPath === '/dashboard'} onClick={() => navigate('/dashboard')} icon={LayoutDashboard} label="Dashboard" />
                <MobileNavItem active={currentPath === '/catalog'} onClick={() => navigate('/catalog')} icon={BookOpen} label="Catalogue" />
                <MobileNavItem active={currentPath === '/jobs'} onClick={() => navigate('/jobs')} icon={Calendar} label="Jobs" />
                <MobileNavItem active={currentPath === '/wallet'} onClick={() => navigate('/wallet')} icon={Wallet} label="Wallet" />
                <MobileNavItem active={currentPath === '/profile'} onClick={() => navigate('/profile')} icon={User} label="Profile" />
              </>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
};
