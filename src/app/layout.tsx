import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  RefreshCw
} from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from '../features/auth/AuthProvider';
import { Logo } from '../shared/components/Logo';
import { NotificationBell } from '../shared/components/NotificationBell';
import { storage, ref, uploadBytes, getDownloadURL } from '../firebase/config';

export const AppLayout: React.FC = () => {
  const { user, userRole, setUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // ================= STATE =================
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // ================= NAV ITEMS =================
  const navItems =
    userRole === 'client'
      ? [
          { path: '/discover', icon: Search, label: 'Discover' },
          { path: '/services', icon: Briefcase, label: 'Services' },
          { path: '/waitlist', icon: History, label: 'Waitlist' },
          { path: '/chat', icon: MessageSquare, label: 'Chat' },
          { path: '/profile', icon: User, label: 'Profile' }
        ]
      : [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/catalog', icon: BookOpen, label: 'Catalogue' },
          { path: '/jobs', icon: Calendar, label: 'Jobs' },
          { path: '/wallet', icon: Wallet, label: 'Wallet' },
          { path: '/profile', icon: User, label: 'Profile' }
        ];

  // ================= COMPONENT =================
  return (
    <div className={`h-screen w-screen flex flex-col md:flex-row overflow-hidden ${
      isDarkMode ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>

      {/* ================= PC SIDEBAR (lg+) ================= */}
      <motion.aside
        animate={{ width: isCollapsed ? 100 : 280 }}
        className="hidden lg:flex flex-col bg-white border-r border-slate-200/60 p-6 shadow-xl relative z-50"
      >
        {/* Logo */}
        <div className="mb-12 px-2">
          <Logo showText={!isCollapsed} />
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-3 flex-1">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all font-bold text-xs uppercase tracking-widest
                ${active 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <Icon size={20} className={active ? 'text-white' : 'group-hover:text-blue-600'} />
                {!isCollapsed && <span>{item.label}</span>}
                
                {active && !isCollapsed && (
                  <motion.div
                    layoutId="active-nav-pc"
                    className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Switch Mode & Theme at Bottom */}
        <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-widest"
          >
            {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            {!isCollapsed && <span>{isDarkMode ? 'Light' : 'Dark'} Mode</span>}
          </button>
          <button
            onClick={() => setUserRole(userRole === 'client' ? 'provider' : 'client')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <RefreshCw size={20}/>
            {!isCollapsed && <span>Switch Role</span>}
          </button>
        </div>
      </motion.aside>

      {/* ================= TABLET NAV (md only) ================= */}
      <div className="hidden md:flex lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-100 items-center justify-between px-8 z-50">
        <Logo showText={true} />
        
        <div className="flex items-center gap-4">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-blue-50'}`}
              >
                <Icon size={20} />
              </button>
            );
          })}
          <div className="w-px h-8 bg-slate-100 mx-2" />
          <button
            onClick={() => setUserRole(userRole === 'client' ? 'provider' : 'client')}
            className="p-3 rounded-xl text-slate-400 hover:bg-blue-50"
          >
            <RefreshCw size={20}/>
          </button>
        </div>
      </div>

      {/* ================= MOBILE NAV (< md) ================= */}
      <div className="md:hidden flex flex-col w-full">
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-50 shadow-sm">
          <Logo showText={false} />
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-40 bg-white pt-20 px-6"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = currentPath === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-4 p-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all
                      ${active ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-blue-50'}`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
                <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
                    <span>{isDarkMode ? 'Light' : 'Dark'} Mode</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserRole(userRole === 'client' ? 'provider' : 'client');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    <RefreshCw size="20" />
                    <span>Switch Role</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto pt-20 md:pt-20 lg:pt-0">
        <div className="w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};
