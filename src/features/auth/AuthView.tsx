import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Lock, 
  Mail, 
  UserCheck, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Briefcase,
  Check,
  RefreshCcw 
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail
} from 'firebase/auth';

import { auth, db, signInWithGoogle } from '../../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Logo } from '../../shared/components/Logo';
import { UserRole } from '../../shared/types';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
  onSignup: (role: UserRole) => void;
  mode: 'login' | 'signup' | 'reset';
  setMode: (m: 'login' | 'signup' | 'reset') => void;
  onShowTerms: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSignup, mode, setMode, onShowTerms }) => {
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async () => {
    setAuthError(null);
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setAuthError("Email address is required.");
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6 && mode !== 'reset') {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
        // Note: The onAuthStateChanged in AuthProvider will handle the navigation
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
           setAuthError("Full name is required for identification.");
           setLoading(false);
           return;
        }
        if (password !== confirmPassword) {
          setAuthError("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (!agreedToTerms) {
          setAuthError("Protocol agreement required to proceed.");
          setLoading(false);
          return;
        }
        
        const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await sendEmailVerification(result.user);
        
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          name: fullName.trim(),
          phone: phone.trim(),
          role: isSpecialist ? 'provider' : 'client',
          createdAt: { seconds: Math.floor(Date.now()/1000), nanoseconds: 0 }, // fallback for serverTimestamp in setDoc if needed, but setDoc allows it
          isAwaitingVerification: true,
          onboardingStep: 0,
          isCatalogComplete: false
        });

        onSignup(isSpecialist ? 'provider' : 'client');
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, trimmedEmail);
        setIsResetSent(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') setAuthError("Identity not found in matrix.");
      else if (err.code === 'auth/wrong-password') setAuthError("Invalid access key encryption.");
      else if (err.code === 'auth/email-already-in-use') setAuthError("Channel already occupied by another entity.");
      else if (err.code === 'auth/weak-password') setAuthError("Encryption key is too weak.");
      else if (err.code === 'auth/invalid-email') setAuthError("Invalid email address format.");
      else setAuthError("Synchronization error: " + (err.message || "Unknown failure"));
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'reset') {
    return (
      <div className="w-full h-full md:h-auto md:max-w-md p-6 md:p-10 bg-sidebar md:shadow-2xl md:rounded-[40px] md:border border-border-slate overflow-y-auto md:overflow-hidden relative group font-sans">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-blue/5 rounded-full blur-3xl group-hover:bg-primary-blue/10 transition-colors duration-700" />
        <div className="relative z-10">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-primary-blue rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <RefreshCcw size={40} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase italic leading-none">
              Reset <span className="text-primary-blue">Matrix</span>
            </h1>
            <p className="text-[10px] text-text-light font-bold uppercase tracking-[0.4em] mt-3 opacity-60">Identity Recovery Protocol</p>
          </div>

          {isResetSent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
              <div className="p-6 bg-accent-green/10 border border-accent-green/20 rounded-3xl">
                <p className="text-xs font-bold text-accent-green uppercase leading-relaxed">
                  Recovery link dispatched to your secure terminal. Check your inbox to initiate OTP sequence.
                </p>
              </div>
              <button 
                onClick={() => { setMode('login'); setIsResetSent(false); }}
                className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-transform"
              >
                Return to Sign In
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                    <User size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Recovery Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
                />
              </div>
              <button 
                disabled={loading || !email}
                onClick={handleSubmit}
                className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] disabled:opacity-50 active:scale-95 transition-transform"
              >
                {loading ? <RefreshCcw className="animate-spin mx-auto" size={20} /> : "Send Recovery Protocol"}
              </button>
              <button 
                onClick={() => setMode('login')}
                className="w-full text-center text-[10px] font-black text-text-light/40 uppercase tracking-widest hover:text-text-main transition-colors"
              >
                I remember my identity keys
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full md:h-auto md:max-w-md bg-sidebar md:shadow-2xl md:rounded-[40px] md:border border-border-slate overflow-y-auto relative group flex flex-col font-sans">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-blue/5 rounded-full blur-3xl group-hover:bg-primary-blue/10 transition-colors duration-700" />
      
      <div className="p-6 md:p-10 flex-1 flex flex-col">
        <div className="relative z-10 flex-1">
          <div className="flex justify-center mb-10">
            <Logo className="scale-125" />
          </div>

          <div className="text-center mb-12">
            <p className="text-[10px] text-text-light font-black uppercase tracking-[0.4em] mt-3 opacity-60">
              {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </p>
          </div>

          <div className="flex gap-2 p-1.5 bg-sidebar/50 rounded-2xl border border-border-slate mb-8">
            <button 
              onClick={() => { setMode('login'); setAuthError(null); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode('signup'); setAuthError(null); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-primary-blue text-white shadow-lg shadow-blue-500/20' : 'text-text-light hover:text-text-main'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {authError && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-[10px] font-bold text-red-500 uppercase text-center flex items-center justify-center gap-2">
                  <ShieldAlert size={14} /> {authError}
                </p>
              </motion.div>
            )}

            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                      <UserCheck size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Full Identification Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                      <Phone size={18} />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Secure Routing (e.g. +254 700...)" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
                  />
                </div>
              </motion.div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                  <Mail size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Secure Email Access" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                  <Lock size={18} />
              </div>
              <input 
                type="password" 
                placeholder="Access Encryption Key" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
              />
            </div>

            {mode === 'signup' && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40">
                    <ShieldCheck size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Verify Encryption Key" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-sidebar/30 border border-border-slate rounded-2xl text-text-main text-xs focus:outline-none focus:border-primary-blue transition-all" 
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end px-2">
                <button 
                  onClick={() => setMode('reset')}
                  className="text-[9px] font-black text-primary-blue uppercase tracking-widest hover:underline"
                >
                    Forgot identity keys?
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                <p className="text-[9px] font-black text-text-light uppercase tracking-widest ml-1">Select Identity Role</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsSpecialist(false)}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 group transition-all ${!isSpecialist ? 'border-primary-blue/30 bg-primary-blue/5' : 'border-border-slate bg-transparent hover:border-text-light'}`}
                  >
                    <Users size={20} className={!isSpecialist ? 'text-primary-blue' : 'text-text-light'} />
                    <span className={`text-[9px] font-black uppercase ${!isSpecialist ? 'text-text-main' : 'text-text-light'}`}>Client</span>
                  </button>
                  <button 
                    onClick={() => setIsSpecialist(true)}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 group transition-all ${isSpecialist ? 'border-primary-blue/30 bg-primary-blue/5' : 'border-border-slate bg-transparent hover:border-text-light'}`}
                  >
                    <Briefcase size={20} className={isSpecialist ? 'text-primary-blue' : 'text-text-light'} />
                    <span className={`text-[9px] font-black uppercase ${isSpecialist ? 'text-text-main' : 'text-text-light'}`}>Specialist</span>
                  </button>
                </div>

                <button 
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className="flex items-center gap-3 px-2 group cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${agreedToTerms ? 'bg-accent-green border-accent-green text-white' : 'border-border-slate group-hover:border-text-light'}`}>
                    {agreedToTerms && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-[10px] text-text-light font-medium">I agree to the <button onClick={(e) => { e.stopPropagation(); onShowTerms(); }} className="text-primary-blue font-bold">Elite Operational Protocols</button>.</span>
                </button>
              </motion.div>
            )}

            <div className="pt-4">
              <button 
                disabled={loading}
                onClick={handleSubmit}
                className="w-full py-5 bg-primary-blue text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><RefreshCcw size={20} className="mx-auto" /></motion.div> : (mode === 'login' ? "Sign In" : "Sign Up")}
              </button>

              <div className="flex items-center gap-4 py-6">
                <div className="flex-1 h-px bg-border-slate/10" />
                <span className="text-[9px] font-black text-text-light/30 uppercase tracking-[0.3em]">Identity Sync</span>
                <div className="flex-1 h-px bg-border-slate/10" />
              </div>

              <button 
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setAuthError(null);
                  try {
                    const resUser = await signInWithGoogle();
                    const userRef = doc(db, 'users', resUser.uid);
                    const snap = await getDoc(userRef);
                    if (!snap.exists()) {
                      await setDoc(userRef, {
                        uid: resUser.uid,
                        email: resUser.email,
                        name: resUser.displayName || '',
                        role: isSpecialist ? 'provider' : 'client',
                        createdAt: { seconds: Math.floor(Date.now()/1000), nanoseconds: 0 },
                        isAwaitingVerification: false,
                        onboardingStep: 0,
                        isCatalogComplete: !isSpecialist
                      });
                      onSignup(isSpecialist ? 'provider' : 'client');
                    } else {
                      onLogin(snap.data().role as UserRole);
                    }
                  } catch (err: any) {
                    console.error(err);
                    setAuthError("Google synchronization failed.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-5 bg-white border border-border-slate rounded-3xl font-black text-[11px] text-sidebar uppercase tracking-[0.4em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" className="w-5 h-5" alt="Google" />
                <span>Sign in with Google</span>
              </button>
            </div>
            
            <div className="text-center mt-6">
               <p className="text-[10px] text-text-light font-bold">
                 {mode === 'login' ? "Not authenticated yet?" : "Already part of the network?"}
                 <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-primary-blue ml-2 font-black uppercase tracking-widest hover:underline"
                 >
                   {mode === 'login' ? "Create Profile" : "Access Identity"}
                 </button>
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
