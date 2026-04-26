import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Logo } from '../shared/components/Logo';
import { H1, H2, Text } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Sparkles, BarChart2, ShieldCheck, Mail, Lock, ChevronRight, Menu, X, Globe } from 'lucide-react';

export const LandingPage = ({ onAuthClick }: { onAuthClick?: () => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Network", href: "#" },
    { label: "Resources", href: "#" },
    { label: "Enterprise", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600/10 overflow-x-hidden font-sans">

      {/* NAV */}
      <nav className="flex justify-between items-center p-4 md:px-12 fixed top-0 w-full z-50 backdrop-blur-xl bg-white/90 border-b border-slate-100 shadow-sm">
        <Logo className="text-blue-600" />
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <button key={link.label} className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">
              {link.label}
            </button>
          ))}
          <div className="h-4 w-[1px] bg-slate-200 mx-2" />
          <button onClick={onAuthClick} className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors">
            Log In
          </button>
          <Button onClick={onAuthClick} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all">
            Join Matrix
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 md:hidden shadow-xl animate-in fade-in slide-in-from-top-4">
            {navLinks.map((link) => (
              <button key={link.label} className="text-sm font-bold uppercase tracking-widest text-slate-600 text-left">
                {link.label}
              </button>
            ))}
            <hr className="border-slate-100" />
            <button onClick={onAuthClick} className="text-sm font-bold uppercase tracking-widest text-slate-600 text-left">
              Log In
            </button>
            <Button onClick={onAuthClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest">
              Join Matrix
            </Button>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <main className="pt-32 pb-20 px-6 bg-gradient-to-br from-white via-blue-50/30 to-white relative">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          <div className="flex-1 text-left space-y-8 lg:pr-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm shadow-blue-500/5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              SkillGrid Elite Matrix Operational
            </div>

            <H1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-slate-900">
              Elite Talent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Perfectly Matched</span>
            </H1>

            <Text className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
              Deploy specialized talent across the digital matrix. From high‑stakes engineering to creative mastery, we connect the world's best professionals.
            </Text>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-4">
              <Button onClick={onAuthClick} className="px-10 py-8 text-sm font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 group">
                Get Started Now
                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-lg" title="United States">🇺🇸</span>
                  <span className="text-lg" title="United Kingdom">🇬🇧</span>
                  <span className="text-lg" title="Australia">🇦🇺</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">10K+ Verified</span>
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter mt-1">Professional Nodes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-lg">
            <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-2xl border-white shadow-[0_40px_80px_-15px_rgba(37,99,235,0.12)] rounded-[48px] relative overflow-hidden border">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 blur-[100px] pointer-events-none rounded-full" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none rounded-full" />
               
               <div className="relative z-10 space-y-10">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-6">
                      <Lock size={24} />
                    </div>
                    <H2 className="text-3xl text-slate-900 font-black tracking-tight">Identity Portal</H2>
                    <div className="flex items-center gap-2">
                      <div className="h-[1px] w-8 bg-blue-500/30" />
                      <Text className="!text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Encryption Required</Text>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                     <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <Input 
                          type="email" 
                          placeholder="Operational Email" 
                          className="pl-16 bg-slate-50/50 border-slate-100 text-slate-900 h-18 rounded-3xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 font-medium border-2"
                        />
                     </div>
                     <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <Input 
                          type="password" 
                          placeholder="Access Token" 
                          className="pl-16 bg-slate-50/50 border-slate-100 text-slate-900 h-18 rounded-3xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 font-medium border-2"
                        />
                     </div>
                     <Button className="w-full py-8 text-sm font-black uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-700 text-white rounded-3xl shadow-xl shadow-blue-500/20 mt-6 group transition-all" onClick={onAuthClick}>
                        Initialize Access
                        <Sparkles size={18} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </Button>
                     <div className="flex items-center justify-center gap-3 pt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Secured by SkillGrid Protocol</p>
                     </div>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </main>

      {/* TRUSTED BY INDUSTRY LEADERS */}
      <section className="py-24 bg-white border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="h-[1px] w-24 bg-blue-600/20 mx-auto" />
            <H2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Trusted by Industry Leaders</H2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['IBM', 'Google', 'Microsoft', 'Amazon', 'Apple'].map((company) => (
              <div key={company} className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white text-xs">SG</div>
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES MATRIX */}
      <section className="py-32 px-6 bg-slate-50/50 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/20 blur-[160px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-24 text-center space-y-6">
             <H2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Advanced Matrix Capabilities</H2>
             <div className="flex items-center justify-center gap-4">
                <div className="h-[2px] w-12 bg-blue-600" />
                <Text className="uppercase tracking-[0.4em] !text-[11px] font-black text-blue-600">Professional Grade Service Execution</Text>
                <div className="h-[2px] w-12 bg-blue-600" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
             {[
               { icon: <Sparkles size={32} />, title: "Skill Mastery", desc: "Advanced training modules and real-time feedback loops for elite professional growth." },
               { icon: <BarChart2 size={32} />, title: "Neural Analytics", desc: "Microscopic performance insights and predictive growth models for your career matrix." },
               { icon: <ShieldCheck size={32} />, title: "Secure Protocol", desc: "Enterprise-grade encryption protecting your professional identity and financial assets." }
             ].map((svc, i) => (
               <Card key={i} className="p-10 md:p-14 flex flex-col items-start gap-10 group hover:bg-white hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.08)] transition-all duration-700 bg-white/40 backdrop-blur-sm border-transparent hover:border-blue-100 border-2 rounded-[40px]">
                  <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl shadow-blue-500/5 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
                     {svc.icon}
                  </div>
                  <div className="space-y-5">
                    <H2 className="text-3xl font-black text-slate-900 tracking-tight">{svc.title}</H2>
                    <Text className="text-base md:text-lg leading-relaxed text-slate-600 font-medium">{svc.desc}</Text>
                  </div>
                  <Button variant="ghost" className="p-0 h-auto flex items-center gap-3 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] hover:gap-5 transition-all group-hover:text-blue-700">
                     Initialize <ChevronRight size={16} />
                  </Button>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-16 pb-20 border-b border-slate-50">
            <div className="space-y-8">
              <Logo className="text-blue-600 scale-125 origin-left" />
              <Text className="text-sm text-slate-500 max-w-sm leading-relaxed font-medium">
                Redefining professional connection through advanced digital protocols and neural talent matching.
              </Text>
              <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all cursor-pointer">
                    <Globe size={18} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 lg:gap-24">
                {[
                  { title: 'Network', links: ['Protocol', 'Governance', 'Nodes', 'Matrix'] },
                  { title: 'Resources', links: ['Documentation', 'Security', 'API', 'Status'] },
                  { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance'] }
                ].map(cat => (
                  <div key={cat.title} className="space-y-8">
                    <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 border-b border-blue-600 w-fit pb-2">{cat.title}</div>
                    <div className="flex flex-col gap-5">
                      {cat.links.map(link => (
                        <button key={link} className="text-[12px] font-bold text-slate-500 hover:text-blue-600 transition-colors text-left uppercase tracking-widest">
                          {link}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
               <Text className="!text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">© 2026 SkillGrid Elite Matrix.</Text>
             </div>
             <div className="flex gap-10">
                {['Twitter', 'Discord', 'Github'].map(soc => (
                  <button key={soc} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-blue-600 transition-colors">
                    {soc}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
