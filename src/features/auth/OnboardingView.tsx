import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Users, 
  Briefcase 
} from 'lucide-react';
import { db } from '../../firebase/config';
import { CATEGORIES, TIER_SERVICES_MATRIX } from '../../shared/constants';
import { Category, TierLevel, UserRole } from '../../shared/types';

interface OnboardingViewProps {
  user: FirebaseUser;
  onComplete: () => void;
  onSave: (data: any) => void;
  role: UserRole;
  setToast: (t: { message: string }) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ user, onComplete, onSave, role, setToast }) => {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    phone: '',
    address: '',
    gender: 'Male',
    bio: '',
    image: '',
    interests: [] as string[],
    locationCoords: null as { latitude: number, longitude: number } | null
  });

  const [specialistData, setSpecialistData] = useState({
    category: 'Household' as Category,
    tier: 'Basic' as TierLevel,
    yearsOfExperience: '3-5',
    pricePerHour: 1500,
    portfolioUrl: '',
    answers: {} as Record<string, boolean>,
    services: [] as string[]
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFormData(prev => ({
          ...prev,
          name: data.name || user.displayName || '',
          phone: data.phone || '',
        }));
      }
    };
    fetchUserData();
  }, [user]);

  const interestOptions = [
    "Luxury Living", "Tech & Gadgets", "Wellness & Fitness", 
    "Sustainable Living", "Family & Parenting", "Pet Care", 
    "Home Improvement", "Art & Design", "Gourmet Dining"
  ];

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    const finalData = {
      ...formData,
      ...(role === 'provider' ? specialistData : {})
    };
    onSave(finalData);
    onComplete();
  };

  return (
    <div className="w-full h-full md:h-auto max-w-2xl bg-sidebar md:shadow-2xl md:rounded-[40px] border border-border-slate flex flex-col overflow-hidden relative group font-sans">
      <div className="relative z-10 flex flex-col h-full">
        <header className="p-8 md:p-12 pb-4 md:pb-6 shrink-0 border-b md:border-none border-slate-100 dark:border-slate-800 bg-sidebar/50 backdrop-blur-md">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase italic tracking-tight">
                {role === 'provider' ? 'Specialist Induction' : 'Identity Protocol'}
              </h2>
              <div className="flex gap-1">
                 {[...Array(totalSteps)].map((_, i) => (
                   <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-primary-blue' : 'w-4 bg-slate-200 dark:bg-slate-700'}`} />
                 ))}
              </div>
           </div>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-60">
             {step === 0 ? 'Initialization' : `Phase 0${step}: ${
               step === 1 ? 'Bio-Metric Data' : step === 2 ? 'Domain Calibration' : 'Verification Sequence'
             }`}
           </p>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-4 md:pt-6 min-h-[400px]">
          <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="text-center py-10 space-y-8"
            >
               <div className="w-24 h-24 bg-primary-blue/10 rounded-[32px] flex items-center justify-center mx-auto text-primary-blue animate-pulse">
                  <Shield size={48} />
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Elite Onboarding Protocol</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                    Welcome to the infrastructure. We require detailed telemetry to establish your clearance level.
                  </p>
               </div>
               <button 
                 onClick={handleNext}
                 className="mt-8 px-12 py-5 bg-primary-blue text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
               >
                 Execute Protocol
               </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <div className="w-28 h-28 rounded-[36px] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-blue">
                       {formData.image ? (
                         <img src={formData.image} className="w-full h-full object-cover" alt="Profile" />
                       ) : (
                         <Camera size={40} className="text-slate-400 group-hover:text-primary-blue" />
                       )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-blue rounded-2xl flex items-center justify-center text-white border-4 border-sidebar shadow-lg">
                       <Upload size={18} />
                    </div>
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                    }} />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-4">Optical Data Acquisition</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Identity Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:border-primary-blue outline-none text-slate-900 dark:text-slate-100" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Temporal Origin (DOB)</label>
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:border-primary-blue outline-none text-slate-900 dark:text-slate-100" 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Gender Class</label>
                  <div className="flex gap-2">
                     {['Male', 'Female', 'Non-Binary'].map(g => (
                       <button 
                         key={g} 
                         onClick={() => setFormData({...formData, gender: g})}
                         className={`flex-1 py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-primary-blue text-white border-primary-blue' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-blue'}`}
                       >
                         {g}
                       </button>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               {role === 'provider' ? (
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Primary Deployment Node</label>
                          <select 
                             value={specialistData.category}
                             onChange={(e) => setSpecialistData({...specialistData, category: e.target.value as Category, services: []})}
                             className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:border-primary-blue outline-none font-bold text-slate-900 dark:text-slate-100"
                          >
                             {CATEGORIES.map(cat => (
                               <option key={cat.id} value={cat.id}>{cat.label}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Clearance Tier</label>
                          <div className="flex gap-2">
                             {(['Basic', 'Premium', 'Luxury'] as TierLevel[]).map(t => (
                               <button 
                                  key={t}
                                  onClick={() => setSpecialistData({...specialistData, tier: t})}
                                  className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                    specialistData.tier === t ? 'bg-primary-blue text-white border-primary-blue' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-900 dark:hover:border-slate-100'
                                  }`}
                               >
                                  {t}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Specialized Unit Capability (Max 3)</label>
                       <div className="grid grid-cols-2 gap-2">
                          {TIER_SERVICES_MATRIX[specialistData.category][specialistData.tier].map(service => {
                            const isSelected = specialistData.services.includes(service);
                            return (
                             <button 
                                key={service}
                                onClick={() => {
                                   if (!isSelected && specialistData.services.length >= 3) {
                                     setToast({ message: "Capacity Reached: System limit is 3 core capabilities." });
                                     return;
                                   }
                                   setSpecialistData({
                                      ...specialistData,
                                      services: isSelected ? specialistData.services.filter(s => s !== service) : [...specialistData.services, service]
                                   });
                                }}
                                className={`p-4 rounded-2xl border text-[9px] font-bold text-left transition-all ${
                                  isSelected ? 'bg-primary-blue/10 border-primary-blue text-primary-blue' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-900 dark:hover:border-slate-100'
                                }`}
                             >
                                {service}
                             </button>
                            );
                          })}
                       </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Target Rate (KSH / Hour)</label>
                      <input 
                        type="number" 
                        value={specialistData.pricePerHour}
                        onChange={(e) => setSpecialistData({...specialistData, pricePerHour: parseInt(e.target.value) || 0})}
                        className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:border-primary-blue outline-none text-slate-900 dark:text-slate-100" 
                      />
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Core Interest Mapping</label>
                    <div className="grid grid-cols-2 gap-3">
                       {interestOptions.map(opt => {
                         const isSelected = formData.interests.includes(opt);
                         return (
                           <button 
                             key={opt}
                             onClick={() => setFormData({
                               ...formData,
                               interests: isSelected ? formData.interests.filter(i => i !== opt) : [...formData.interests, opt]
                             })}
                             className={`p-5 rounded-2xl border text-[10px] font-black uppercase text-left transition-all ${isSelected ? 'bg-primary-blue/10 border-primary-blue text-primary-blue' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-900 dark:hover:border-slate-100'}`}
                           >
                             {opt}
                           </button>
                         );
                       })}
                    </div>
                 </div>
               )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Deployment Bio</label>
                    <textarea 
                      rows={5}
                      placeholder="Define your mission profile..."
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-6 py-6 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-3xl text-sm focus:border-primary-blue outline-none resize-none text-slate-900 dark:text-slate-100" 
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">Secure Routing Address</label>
                  <input 
                    type="text" 
                    placeholder="Physical deployment coordinates (Area, Street)..."
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:border-primary-blue outline-none text-slate-900 dark:text-slate-100" 
                  />
               </div>

               <div className="p-6 bg-accent-green/5 border border-accent-green/20 rounded-3xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-green text-white rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-accent-green uppercase tracking-widest">Protocol Check</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic mt-0.5">Profile integrity verified for initialization.</p>
                  </div>
               </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <footer className="p-8 md:p-12 pt-0 md:pt-0 pb-12 mt-auto shrink-0 flex items-center justify-between">
           {step > 0 ? (
             <button 
               onClick={handleBack}
               className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
             >
               Recede
             </button>
           ) : <div />}

           {step > 0 && (
             <button 
               onClick={step === totalSteps - 1 ? handleFinish : handleNext}
               className="px-10 py-4 bg-primary-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
             >
               {step === totalSteps - 1 ? 'Establish Presence' : 'Proceed Phase'}
             </button>
           )}
        </footer>
      </div>
    </div>
  );
};
