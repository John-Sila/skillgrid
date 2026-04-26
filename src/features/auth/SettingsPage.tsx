import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  FileText, 
  ChevronRight,
  LogOut,
  Settings as SettingsIcon,
  ChevronLeft,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { id: 'account', icon: User, label: "Edit Account", description: "Personal details and credentials" },
        { id: 'payment', icon: CreditCard, label: "Payment Methods", description: "Manage your cards and escrow" }
      ]
    },
    {
      title: "Security & Legal",
      items: [
        { id: 'tc', icon: FileText, label: "Terms and Conditions", description: "Read our service protocols" },
        { id: 'privacy', icon: Shield, label: "Privacy Policy", description: "Your data and security" }
      ]
    },
    {
      title: "Support",
      items: [
        { id: 'faq', icon: HelpCircle, label: "FAQ", description: "Frequently asked questions" },
        { id: 'docs', icon: FileText, label: "Documentation", description: "How to use SkillGrid" }
      ]
    }
  ];

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  const getModalContent = (id: string) => {
    switch(id) {
      case 'account': return { title: "Edit Account", content: "Account editing interface is being provisioned. Please ensure your biometric data is up to date." };
      case 'payment': return { title: "Payment Methods", content: "Escrow and digital wallet management. SkillGrid supports secure bank transfers and encrypted credit protocols." };
      case 'tc': return { title: "Terms & Conditions", content: "By using SkillGrid, you agree to our automated service protocols and escrow protection mandates." };
      case 'privacy': return { title: "Privacy Policy", content: "Zero-knowledge encryption is applied to all communications. Your operational data remains sovereign." };
      case 'faq': return { title: "FAQ", content: "How does the waitlist work? How do I verify my specialist? Find answers to all operational queries here." };
      case 'docs': return { title: "Documentation", content: "Technical specifications for the SkillGrid Elite Matrix. Learn how to maximize your deployment efficiency." };
      default: return { title: "Notice", content: "Module initializing..." };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full bg-[#F8FAFC] dark:bg-[#07090E] overflow-y-auto p-6 md:p-10 lg:p-16"
    >
      <div className="max-w-2xl mx-auto space-y-10">
        <header className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">Settings</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Management Hub</p>
          </div>
        </header>

        <div className="space-y-8">
          {settingsGroups.map((group, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{group.title}</h3>
              <div className="bg-white dark:bg-[#0E121B] rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                {group.items.map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveModal(item.id)}
                    className={`w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all text-left ${
                      i !== group.items.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{item.label}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="w-full py-6 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] border border-red-100 dark:border-red-500/20 hover:bg-red-100 transition-all flex items-center justify-center gap-3"
        >
          <LogOut size={18} />
          Terminate Session
        </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E121B] rounded-[40px] p-10 shadow-2xl border border-slate-100 dark:border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {getModalContent(activeModal).title}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {getModalContent(activeModal).content}
                </p>
                <div className="pt-6 border-t border-slate-50 dark:border-white/5">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full py-4 bg-[#2563EB] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-600 transition-all"
                  >
                    Acknowledged
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
