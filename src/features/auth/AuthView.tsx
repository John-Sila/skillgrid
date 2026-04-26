import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCcw,
  Chrome,
  Apple,
  Facebook,
  Twitter,
  MessageSquare,
  Send
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
import { Button } from '../../components/ui/Button';
import { H1, Text } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';

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
      <Card className="w-full h-full md:h-auto md:max-w-md p-6 md:p-10 !bg-sidebar md:shadow-2xl md:rounded-[40px] border-border-slate overflow-y-auto md:overflow-hidden relative group font-sans">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700" />
        <div className="relative z-10">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <RefreshCcw size={40} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <H1 className="!text-3xl text-slate-900">
              Reset <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Matrix</span>
            </H1>
            <Text className="!text-[10px] font-black uppercase tracking-[0.4em] mt-3 text-slate-500">Identity Recovery Protocol</Text>
          </div>

          {isResetSent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
              <div className="p-6 bg-green-50 border border-green-100 rounded-3xl">
                <Text className="!text-xs font-bold !text-green-600 uppercase leading-relaxed">
                  Recovery link dispatched to your secure terminal. Check your inbox to initiate OTP sequence.
                </Text>
              </div>
              <Button 
                onClick={() => { setMode('login'); setIsResetSent(false); }}
                className="w-full py-5 !rounded-3xl !text-[11px] uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100"
              >
                Return to Sign In
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <User size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Recovery Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" 
                />
              </div>
              <Button 
                disabled={loading || !email}
                onClick={handleSubmit}
                className="w-full py-5 !rounded-3xl !text-[11px] uppercase tracking-[0.4em] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100"
              >
                {loading ? <RefreshCcw className="animate-spin mx-auto" size={20} /> : "Send Recovery Protocol"}
              </Button>
              <button 
                onClick={() => setMode('login')}
                className="w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                I remember my identity keys
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full md:h-auto md:max-w-md !bg-white md:shadow-2xl md:rounded-[40px] border-slate-200 overflow-y-auto relative group flex flex-col font-sans">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700" />
      
      <div className="p-6 md:p-10 flex-1 flex flex-col">
        <div className="relative z-10 flex-1">
          <div className="flex justify-center mb-8">
            <Logo className="scale-125 text-blue-900" />
          </div>

          <div className="text-center mb-8">
            <H1 className="text-2xl font-bold text-blue-900">
               <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Matrix</span> Authentication
            </H1>
            <Text className="!text-[10px] font-black uppercase tracking-[0.4em] mt-3 text-slate-500">
              {mode === 'login' ? 'Identity Verification' : 'Protocol Registration'}
            </Text>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-6">
            <button 
              onClick={() => { setMode('login'); setAuthError(null); }}
              className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-blue-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode('signup'); setAuthError(null); }}
              className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-blue-600'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {authError && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <Text className="!text-[10px] font-bold text-red-600 uppercase text-center flex items-center justify-center gap-2">
                  <ShieldAlert size={14} /> {authError}
                </Text>
              </motion.div>
            )}

            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <UserCheck size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" 
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <Phone size={18} />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Operational Phone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" 
                  />
                </div>
              </motion.div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="Operational Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" 
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={18} />
              </div>
              <input 
                type="password" 
                placeholder="Access Token" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400" 
              />
            </div>
            
            {mode === 'signup' && (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <ShieldCheck size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Confirm Access Key" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 transition-all font-medium" 
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end px-2">
                <button 
                  onClick={() => setMode('reset')}
                  className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                >
                    Forgot identity keys?
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                <Text className="!text-[9px] font-black uppercase tracking-widest ml-1">Select Identity Role</Text>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsSpecialist(false)}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 group transition-all ${!isSpecialist ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10 bg-transparent hover:border-white/30'}`}
                  >
                    <Users size={20} className={!isSpecialist ? 'text-blue-500' : 'text-white/40'} />
                    <span className={`text-[9px] font-black uppercase ${!isSpecialist ? 'text-white' : 'text-white/40'}`}>Client</span>
                  </button>
                  <button 
                    onClick={() => setIsSpecialist(true)}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 group transition-all ${isSpecialist ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10 bg-transparent hover:border-white/30'}`}
                  >
                    <Briefcase size={20} className={isSpecialist ? 'text-blue-500' : 'text-white/40'} />
                    <span className={`text-[9px] font-black uppercase ${isSpecialist ? 'text-white' : 'text-white/40'}`}>Specialist</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 px-2 group cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${agreedToTerms ? 'bg-green-600 border-green-600 text-white' : 'border-slate-200 group-hover:border-blue-300'}`}>
                    {agreedToTerms && <Check size={12} strokeWidth={4} />}
                  </div>
                  <Text className="!text-[10px] font-bold text-slate-500">I agree to the <button type="button" onClick={(e) => { e.stopPropagation(); onShowTerms(); }} className="text-blue-600">Operational Protocols</button>.</Text>
                </div>
              </motion.div>
            )}

            <div className="pt-2">
              <Button 
                disabled={loading}
                onClick={handleSubmit}
                className="w-full py-5 !rounded-3xl !text-[11px] uppercase tracking-[0.4em] bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><RefreshCcw size={20} className="mx-auto" /></motion.div> : (mode === 'login' ? "Access Matrix" : "Register Profile")}
              </Button>

              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-slate-100" />
                <Text className="!text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300">Identity Sync</Text>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <Button 
                disabled={loading}
                variant="outline"
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
                className="w-full py-6 !rounded-3xl !text-[11px] uppercase tracking-[0.4em] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-sm flex items-center justify-center gap-3 mb-4"
              >
                <Chrome size={20} className="text-blue-600" />
                <span>Google</span>
              </Button>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button 
                  disabled={loading}
                  variant="outline"
                  onClick={() => setAuthError("Apple identity sync pending configuration.")}
                  className="py-5 !rounded-2xl !text-[10px] uppercase tracking-widest bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm flex items-center justify-center gap-2"
                >
                  <Apple size={18} className="text-slate-900" />
                  <span>Apple</span>
                </Button>

                <Button 
                  disabled={loading}
                  variant="outline"
                  onClick={() => setAuthError("Facebook identity sync pending configuration.")}
                  className="py-5 !rounded-2xl !text-[10px] uppercase tracking-widest bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-sm flex items-center justify-center gap-2"
                >
                  <Facebook size={18} className="text-blue-600" />
                  <span>Facebook</span>
                </Button>

                <Button 
                  disabled={loading}
                  variant="outline"
                  onClick={() => setAuthError("X (Twitter) identity sync pending configuration.")}
                  className="py-5 !rounded-2xl !text-[10px] uppercase tracking-widest bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm flex items-center justify-center gap-2"
                >
                  <Twitter size={18} className="text-slate-900" />
                  <span>X</span>
                </Button>

                <Button 
                  disabled={loading}
                  variant="outline"
                  onClick={() => setAuthError("Discord identity sync pending configuration.")}
                  className="py-5 !rounded-2xl !text-[10px] uppercase tracking-widest bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} className="text-indigo-600" />
                  <span>Discord</span>
                </Button>

                <Button 
                  disabled={loading}
                  variant="outline"
                  onClick={() => setAuthError("Telegram identity sync pending configuration.")}
                  className="py-5 !rounded-2xl !text-[10px] uppercase tracking-widest bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200 shadow-sm flex items-center justify-center gap-2"
                >
                  <Send size={18} className="text-sky-600" />
                  <span>Telegram</span>
                </Button>
              </div>
            </div>
            
            <div className="text-center mt-6">
               <Text className="!text-[10px] font-bold">
                 {mode === 'login' ? "Not authenticated yet?" : "Already part of the network?"}
                 <button 
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-blue-500 ml-2 font-black uppercase tracking-widest hover:underline"
                 >
                   {mode === 'login' ? "Create Profile" : "Access Identity"}
                 </button>
               </Text>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
