import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [step, setStep] = useState<'category' | 'setup' | 'questions' | 'legal'>('category');
  const [profile, setProfile] = useState<{ tier: TierLevel, category: Category, services: string[] }>({
    tier: 'Basic',
    category: 'Household',
    services: []
  });
  const [answers, setAnswers] = useState<boolean[]>(new Array(5).fill(false));
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const steps = [
    { id: 'category', label: 'Domain' },
    { id: 'setup', label: 'Services' },
    { id: 'questions', label: 'Verification' },
    { id: 'legal', label: 'Legal' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center relative">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                i <= currentStepIndex 
                  ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-sidebar border-border-slate text-text-light'
              }`}
            >
              {i < currentStepIndex ? <Check size={18} strokeWidth={3} /> : <span className="text-xs font-black">{i + 1}</span>}
            </div>
            <span className={`absolute -bottom-7 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-500 ${
              i <= currentStepIndex ? 'text-text-main' : 'text-text-light'
            }`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 md:w-24 h-[2px] mx-2 mb-0 transition-colors duration-500 ${
              i < currentStepIndex ? 'bg-primary-blue' : 'bg-border-slate/30'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

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
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to finalize catalog." });
    } finally {
      setIsFinalizing(false);
    }
  };

  if (step === 'category') {
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-50/50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 lg:p-16 max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">
            Professional Domain
          </h2>
          <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Select your primary area of expertise. This will determine the service matrix and specialized verification requirements for your catalog.
          </p>
        </header>

        <StepIndicator />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = profile.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setProfile({ ...profile, category: cat.id, services: [] });
                  setStep('setup');
                }}
                className={`group relative p-10 rounded-[48px] border-2 text-left transition-all duration-300 overflow-hidden ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-500/20' 
                    : 'bg-white border-slate-200 hover:border-blue-500/50 hover:shadow-xl hover:shadow-slate-200/50'
                }`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 transition-all group-hover:opacity-20 ${cat.color}`} />
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all ${
                  isSelected ? 'bg-white text-blue-600 shadow-lg' : 'bg-slate-50 border border-slate-100 text-slate-400 group-hover:scale-110'
                }`}>
                  <Icon size={32} />
                </div>

                <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {cat.label}
                </h3>
                <p className={`text-sm font-medium leading-relaxed mb-8 ${isSelected ? 'text-blue-50' : 'text-slate-500'}`}>
                  {cat.subServices.slice(0, 3).join(', ')} & more specialized services.
                </p>

                <div className={`flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                  Configure Services <ArrowRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
      <AnimatePresence>
        {toast && (
          <Toast toast={toast} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-50/50">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 md:p-10 lg:p-16 max-w-6xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <button 
            onClick={() => setStep('category')}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="text-right">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
              Service Roster
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configure your {profile.category} catalog</p>
          </div>
        </header>

        <StepIndicator />

        {/* Tier Grid */}
        <div className="space-y-16">
          {(['Luxury', 'Premium', 'Basic'] as TierLevel[]).map((tier) => {
            const services = TIER_SERVICES_MATRIX[profile.category][tier];
            const pkg = CATALOG_PACKAGES.find(p => p.tier === tier);
            const tierSelections = profile.services.filter(s => services.includes(s));
            
            return (
              <section key={tier}>
                <div className="flex items-center gap-6 mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    tier === 'Luxury' ? 'bg-amber-400' : tier === 'Premium' ? 'bg-blue-600' : 'bg-slate-400'
                  }`}>
                    {tier === 'Luxury' ? <Gem size={24} /> : tier === 'Premium' ? <Zap size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{tier} Tier</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Fee: {pkg?.fee}% • {3 - tierSelections.length} Slots Available</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map(service => {
                    const isSelected = profile.services.includes(service);
                    return (
                      <button
                        key={service}
                        onClick={() => toggleService(service, tier)}
                        className={`p-8 rounded-[32px] border-2 text-left transition-all duration-300 flex items-center justify-between group ${
                          isSelected 
                            ? 'bg-white border-blue-600 shadow-xl shadow-blue-500/10' 
                            : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>{service}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SPECIALIZED SERVICE</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 group-hover:border-slate-300'
                        }`}>
                          {isSelected && <Check size={16} strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-20 flex justify-center">
          <button
            onClick={handleFinalize}
            disabled={profile.services.length === 0}
            className={`px-16 py-6 rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${
              profile.services.length > 0 
                ? 'bg-blue-600 text-white shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Deploy Roster
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {toast && (
          <Toast toast={toast} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
    );
  }

  if (step === 'questions') {
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-50/50">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 md:p-10 lg:p-16 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">
            Verification Protocol
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
            Tier-based activation requires professional attestation. Please verify your compliance with {profile.tier} specialized standards.
          </p>
        </header>

        <StepIndicator />

        <div className="space-y-6">
          {QUALIFICATION_QUESTIONS[profile.category].map((q, i) => (
            <button
              key={i}
              onClick={() => {
                const newAnswers = [...answers];
                newAnswers[i] = !newAnswers[i];
                setAnswers(newAnswers);
              }}
              className={`w-full p-8 rounded-[32px] border-2 text-left transition-all duration-300 flex items-center justify-between group ${
                answers[i] 
                  ? 'bg-white border-blue-600 shadow-xl shadow-blue-500/10' 
                  : 'bg-white border-slate-100 hover:border-slate-300'
              }`}
            >
              <p className={`text-sm md:text-base font-black uppercase tracking-tight leading-relaxed pr-8 ${answers[i] ? 'text-blue-600' : 'text-slate-900'}`}>
                {q}
              </p>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                answers[i] ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 group-hover:border-slate-300'
              }`}>
                {answers[i] && <Check size={16} strokeWidth={4} />}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <button
            onClick={submitAnswers}
            className="px-16 py-6 bg-blue-600 text-white rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Authorize Tier Activation
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {toast && (
          <Toast toast={toast} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50/50">
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 md:p-10 lg:p-16 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">
          Legal Activation
        </h2>
        <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
          Finalize your specialized terminal deployment by accepting the SkillGrid Service Protocol and specialized tier requirements.
        </p>
      </header>

      <StepIndicator />

      <div className="bg-white border border-slate-100 rounded-[40px] p-10 md:p-14 shadow-xl shadow-slate-200/40">
        <div className="space-y-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-6 mb-12">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">1. Operational Protocol</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Specialists must maintain optimal synchronization with the service grid. Failure to respond to prioritized requests within the specified window may result in node degradation.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">2. Financial Settlement</h4>
            <p className="text-xs text-slate-500 leading-relaxed">SkillGrid facilitates secure transactions between nodes. Service fees are automatically calculated based on tier level and credited upon verified task completion.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">3. Specialized Standards</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{profile.tier} tier specialists are bound by advanced professional requirements and must maintain their verified credentials to access priority matching.</p>
          </div>
        </div>

        <button
          onClick={() => setHasAcceptedLegal(!hasAcceptedLegal)}
          className="flex items-center gap-6 group mb-12"
        >
          <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${
            hasAcceptedLegal ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 group-hover:border-slate-300'
          }`}>
            {hasAcceptedLegal && <Check size={18} strokeWidth={4} />}
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">
            I accept the SkillGrid specialized service protocol
          </p>
        </button>

        <button
          onClick={completeSigning}
          disabled={!hasAcceptedLegal || isFinalizing}
          className={`w-full py-6 rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${
            hasAcceptedLegal && !isFinalizing
              ? 'bg-blue-600 text-white shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isFinalizing ? (
            <>
              <RefreshCcw size={18} className="animate-spin" />
              Initializing Node...
            </>
          ) : (
            <>
              <Zap size={18} fill="currentColor" />
              Activate Specialized Terminal
            </>
          )}
        </button>
      </div>
    </motion.div>
    <AnimatePresence>
      {toast && (
        <Toast toast={toast} onClose={() => setToast(null)} />
      )}
    </AnimatePresence>
  </div>
  );
};
