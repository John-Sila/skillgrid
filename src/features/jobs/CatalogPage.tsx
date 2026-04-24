import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  RefreshCcw,
  Zap,
  Gem,
  ShieldCheck,
  Home
} from 'lucide-react';
import { Category, TierLevel } from '../../shared/types';
import { 
  TIER_SERVICES_MATRIX, 
  CATALOG_PACKAGES, 
  QUALIFICATION_QUESTIONS, 
  CATEGORIES 
} from '../../shared/constants';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { Toast } from '../../shared/components/Toast';

export const CatalogPage: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'questions' | 'legal'>('setup');
  const [profile, setProfile] = useState<{ tier: TierLevel, category: Category, services: string[] }>({
    tier: 'Basic',
    category: 'Household',
    services: []
  });
  const [answers, setAnswers] = useState<boolean[]>(new Array(5).fill(false));
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const toggleService = (service: string, tier: TierLevel) => {
    const isSelected = profile.services.includes(service);
    
    if (!isSelected) {
      const tierServicesList = TIER_SERVICES_MATRIX[profile.category][tier];
      const currentSelectionsInTier = profile.services.filter(s => tierServicesList.includes(s));
      if (currentSelectionsInTier.length >= 3) {
        setToast({ message: `Selection Limit: Operational protocol allows a maximum of 3 items per ${tier} tier. Deselect an existing ${tier} service to adjust your roster.` });
        return;
      }
    }

    let newServices = isSelected
      ? profile.services.filter(s => s !== service)
      : [...profile.services, service];
    
    // Determine highest tier among selected services
    let highestTier: TierLevel = 'Basic';
    const tiers: TierLevel[] = ['Luxury', 'Premium', 'Basic'];
    for (const t of tiers) {
      const tierServices = TIER_SERVICES_MATRIX[profile.category][t];
      if (newServices.some(s => tierServices.includes(s))) {
        highestTier = t;
        break;
      }
    }

    setProfile({ ...profile, services: newServices, tier: highestTier });
  };

  const handleFinalize = () => {
    if (profile.services.length === 0) return;
    if (profile.tier === 'Basic') {
      setStep('legal');
    } else {
      setStep('questions');
    }
  };

  const submitAnswers = () => {
    if (answers.every(a => a)) {
      setStep('legal');
    } else {
      setToast({ message: "Verification Protocol Failed: You must attest to all professional requirements to activate your specialized terminal." });
    }
  };

  const completeSigning = async () => {
    if (!auth.currentUser) return;
    setIsFinalizing(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...profile,
        catalogFinalized: true
      });
      setToast({ message: "Professional catalog finalized and deployed!" });
      // Maybe navigate back to dashboard
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to finalize catalog." });
    } finally {
      setIsFinalizing(false);
    }
  };

  if (step === 'questions') {
    return (
      <div className="h-full w-full overflow-y-auto bg-card-bg/50">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-5 md:p-8 lg:p-12 max-w-4xl mx-auto">
          <header className="mb-12 text-left">
            <div className="flex items-center gap-4 mb-4">
               <button onClick={() => setStep('setup')} className="text-text-light hover:text-text-main transition-colors">
                  <ChevronLeft size={24} />
               </button>
               <span className="px-3 py-1 bg-primary-blue/10 text-primary-blue text-[10px] font-black uppercase tracking-widest rounded-full">Part 2 of 3</span>
            </div>
            <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">Qualification Assessment</h2>
            <p className="text-text-light text-sm font-medium">Verified providers must maintain 100% compliance with industry standards for {profile.category} services.</p>
          </header>

          <div className="bg-sidebar/40 border border-border-slate rounded-[48px] p-10 space-y-8 shadow-2xl">
             <div className="grid gap-4">
                {QUALIFICATION_QUESTIONS[profile.category].map((q, i) => (
                  <div key={i} className={`p-6 rounded-3xl border transition-all flex items-center justify-between gap-4 ${answers[i] ? 'bg-primary-blue/5 border-primary-blue/30' : 'bg-sidebar border-border-slate'}`}>
                     <p className="text-xs font-bold text-text-main leading-relaxed max-w-xl text-left">{q}</p>
                     <button 
                      onClick={() => {
                        const newAnswers = [...answers];
                        newAnswers[i] = !newAnswers[i];
                        setAnswers(newAnswers);
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-all flex items-center shrink-0 ${answers[i] ? 'bg-primary-blue justify-end' : 'bg-border-slate/30 justify-start'}`}
                     >
                       <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                     </button>
                  </div>
                ))}
             </div>

             <div className="p-8 bg-text-main text-sidebar rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <AlertCircle size={24} />
                   <p className="text-[11px] font-bold uppercase tracking-tight text-left">By toggling these, you attest to their accuracy under our Professional Charter.</p>
                </div>
                <button 
                  onClick={submitAnswers}
                  className="w-full md:w-auto px-10 py-4 bg-primary-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  Validate Answers
                </button>
             </div>
          </div>
        </motion.div>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  if (step === 'legal') {
    return (
      <div className="h-full w-full overflow-y-auto bg-card-bg/50">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 lg:p-12 max-w-4xl mx-auto">
          <header className="mb-12 text-left">
             <div className="flex items-center gap-4 mb-4">
               <button 
                onClick={() => setStep(profile.tier === 'Basic' ? 'setup' : 'questions')} 
                className="text-text-light hover:text-text-main transition-colors"
               >
                  <ChevronLeft size={24} />
               </button>
               <span className="px-3 py-1 bg-primary-blue/10 text-primary-blue text-[10px] font-black uppercase tracking-widest rounded-full">
                  {profile.tier === 'Basic' ? 'Part 2 of 2' : 'Part 3 of 3'}
               </span>
            </div>
            <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2 text-left">Liability & Service Agreement</h2>
            <p className="text-text-light text-sm font-medium text-left">Please review our professional indemnity terms and operational liabilities.</p>
          </header>

          <div className="bg-sidebar border border-border-slate rounded-[48px] p-10 space-y-10 shadow-2xl">
             <div className="bg-card-bg p-8 rounded-[32px] border border-border-slate/10 overflow-y-auto max-h-[300px] text-xs text-text-light leading-loose space-y-6 font-medium scrollbar-hide text-left">
                <h5 className="text-sm font-black text-text-main uppercase tracking-widest">Section 1: Professional Liability</h5>
                <p>1.1 The Service Provider acknowledgment...</p>
                {/* ... legal text truncated for brevity in this mock ... */}
             </div>

             <div className="flex flex-col gap-8">
                <div className="flex items-start gap-4 p-6 bg-primary-blue/5 rounded-3xl border border-primary-blue/20">
                   <button 
                    onClick={() => setHasAcceptedLegal(!hasAcceptedLegal)}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all ${hasAcceptedLegal ? 'bg-primary-blue border-primary-blue text-white' : 'bg-sidebar border-border-slate'}`}
                   >
                     {hasAcceptedLegal && <Check size={18} />}
                   </button>
                   <div className="text-left">
                      <p className="text-[11px] font-black text-text-main uppercase tracking-tight mb-1">Acceptance of Terms</p>
                      <p className="text-[10px] text-text-light leading-relaxed">I have read, understood, and accept the liability coverage terms and the Professional Service Charter.</p>
                   </div>
                </div>

                <button 
                  disabled={!hasAcceptedLegal || isFinalizing}
                  onClick={completeSigning}
                  className="w-full py-6 bg-text-main text-sidebar disabled:opacity-30 disabled:grayscale rounded-[32px] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  {isFinalizing ? (
                    <RefreshCcw className="animate-spin" size={20} />
                  ) : (
                    <>Finalize Enrollment & Sign <ArrowRight size={20}/></>
                  )}
                </button>
             </div>
          </div>
        </motion.div>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-card-bg/50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 md:p-8 lg:p-12">
        <header className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-left">
            <h2 className="text-4xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">
              Catalog Configuration
            </h2>
            <p className="text-text-light text-sm font-medium">
              Tick the specific services you are professionally qualified to offer.
            </p>
          </div>
          {profile.services.length > 0 && (
             <button 
              onClick={handleFinalize}
              className="w-full md:w-auto px-8 py-4 bg-primary-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
             >
                Continue to Assessment <ArrowRight size={16} />
             </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {(['Basic', 'Premium', 'Luxury'] as TierLevel[]).map(tier => (
              <div key={tier} className="p-8 bg-sidebar/30 border border-border-slate rounded-[40px] text-left">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-card-bg border border-border-slate rounded-2xl text-text-light shrink-0">
                       {tier === 'Basic' ? <Home size={20} /> : tier === 'Premium' ? <ShieldCheck size={20} /> : <Gem size={20} />}
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-text-main uppercase tracking-tight">{tier} Tier</h3>
                       <p className="text-[10px] font-black text-primary-blue uppercase tracking-widest">Max 3 selections</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {TIER_SERVICES_MATRIX[profile.category][tier].map(service => (
                       <button
                        key={service}
                        onClick={() => toggleService(service, tier)}
                        className={`w-full p-5 rounded-[24px] border text-left transition-all ${
                          profile.services.includes(service) 
                            ? 'bg-primary-blue/5 border-primary-blue text-text-main' 
                            : 'bg-sidebar border-border-slate/10 text-text-light hover:border-border-slate'
                        }`}
                       >
                          <div className="flex items-center justify-between gap-3">
                             <span className="text-[11px] font-bold uppercase tracking-tight">{service}</span>
                             {profile.services.includes(service) && <Check size={14} className="text-primary-blue" />}
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      </motion.div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
