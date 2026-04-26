import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronLeft, 
  Phone, 
  MoreVertical, 
  MessageSquare, 
  Send,
  ShieldCheck,
  X,
  Smile,
  Paperclip,
  Clock,
  CheckCheck,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  or, 
  where,
  getDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  and
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { Toast } from '../../shared/components/Toast';

interface ChatViewProps {
  initialChatId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ initialChatId }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && !showMobileDetail && activeChatId) {
      setShowMobileDetail(true);
    }
    if (isRightSwipe && showMobileDetail) {
      setShowMobileDetail(false);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync chat users
  useEffect(() => {
    if (!auth.currentUser) return;

    const usersMap = new Map<string, any>();

    const q = query(
      collection(db, 'messages'),
      or(
        where('senderId', '==', auth.currentUser.uid),
        where('receiverId', '==', auth.currentUser.uid)
      )
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      
      const involvedIds: string[] = Array.from(new Set(docs.map((curr: any) => 
        curr.senderId === auth.currentUser?.uid ? curr.receiverId : curr.senderId
      )));

      const fetchUsers = async () => {
        const newUsers = [];
        for (const id of involvedIds) {
          if (!usersMap.has(id)) {
            const userSnap = await getDoc(doc(db, 'users', id));
            if (userSnap.exists()) {
              const userData = { id, ...userSnap.data() };
              usersMap.set(id, userData);
              newUsers.push(userData);
            }
          } else {
            newUsers.push(usersMap.get(id));
          }
        }
        setChatUsers(newUsers);
        setLoading(false);
      };

      fetchUsers();
    }, (error) => {
      console.error("Chat users sync error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Sync messages
  useEffect(() => {
    if (!auth.currentUser || !activeChatId) return;

    const q = query(
      collection(db, 'messages'),
      or(
        and(where('senderId', '==', auth.currentUser.uid), where('receiverId', '==', activeChatId)),
        and(where('senderId', '==', activeChatId), where('receiverId', '==', auth.currentUser.uid))
      )
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
      
      setMessages(filtered);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }, (error) => {
      console.error("Messages sync error:", error);
    });

    return () => unsub();
  }, [activeChatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: auth.currentUser.uid,
        receiverId: activeChatId,
        text: messageInput,
        timestamp: serverTimestamp(),
        read: false,
        secure: true
      });
      setMessageInput('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const currentChatUser = chatUsers.find(u => u.id === activeChatId);
  const currentUser = auth.currentUser;

  const filteredUsers = useMemo(() => {
    return chatUsers.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [chatUsers, searchTerm]);

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="h-full w-full flex flex-col bg-[#F0F7FF] relative overflow-hidden selection:bg-blue-100 selection:text-blue-600"
    >
      {/* Background Geometric Patterns */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.05]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F6_1px,transparent_1px),linear-gradient(to_bottom,#3B82F6_1px,transparent_1px)] [background-size:80px_80px] opacity-[0.02]"></div>
        
        {/* Floating Geometric Shapes */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 border-[1px] border-blue-500/10 rounded-[80px]"
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-48 -right-48 w-[500px] h-[500px] border-[1px] border-blue-500/5 rounded-full"
        />
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Conversation List (Sidebar) */}
        <aside 
          className={`
            relative flex flex-col border-r border-blue-100/50 bg-white/80 backdrop-blur-xl transition-all duration-500 ease-in-out
            ${isSidebarCollapsed ? 'w-24' : 'w-full md:w-[380px] lg:w-[420px]'}
            ${showMobileDetail ? 'translate-x-[-100%] md:translate-x-0 hidden md:flex' : 'translate-x-0 flex'}
          `}
        >
          {/* Collapse Toggle Button (Tablet/PC) */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex absolute -right-4 top-10 w-8 h-8 bg-white border border-blue-100 rounded-full items-center justify-center text-blue-600 shadow-sm z-30 hover:bg-blue-50 transition-colors"
          >
            <motion.div
              animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            >
              <ChevronLeft size={16} />
            </motion.div>
          </button>

          <div className={`p-8 pb-6 transition-all duration-500 ${isSidebarCollapsed ? 'px-4 items-center' : ''}`}>
            <div className={`flex items-center justify-between mb-8 ${isSidebarCollapsed ? 'flex-col gap-4' : ''}`}>
              {!isSidebarCollapsed ? (
                <div>
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">CONVERSATIONS</h1>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Secure Channels</p>
                </div>
              ) : (
                <div className="w-10 h-1 bg-blue-600 rounded-full mb-2 opacity-20" />
              )}
              <div className="w-12 h-12 bg-blue-50 rounded-2xl shrink-0 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="relative group">
              {isSidebarCollapsed ? (
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Search size={18} />
                </div>
              ) : (
                <>
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Filter Channels..."
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all uppercase tracking-widest"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto pb-8 space-y-3 custom-scrollbar ${isSidebarCollapsed ? 'px-4' : 'px-4'}`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                {!isSidebarCollapsed && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Syncing Channels...</p>}
              </div>
            ) : filteredUsers.length === 0 ? (
              !isSidebarCollapsed && (
                <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-200 mb-6">
                    <MessageSquare size={32} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">No Active Secure Channels</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8">Establish a new link to begin secure transmission.</p>
                  <button 
                    onClick={() => setToast({ message: "Initiating secure handshake protocol..." })}
                    className="px-8 py-5 bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] active:scale-95 flex items-center gap-3 group relative overflow-hidden"
                  >
                    <span className="relative z-10">Start New Conversation</span>
                    <Zap size={14} className="relative z-10 group-hover:animate-pulse" />
                    <motion.div 
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                  </button>
                </div>
              )
            ) : (
              filteredUsers.map(u => (
                <button 
                  key={u.id}
                  onClick={() => { setActiveChatId(u.id); setShowMobileDetail(true); }}
                  className={`
                    w-full p-4 rounded-3xl flex items-center gap-5 transition-all group relative overflow-hidden
                    ${isSidebarCollapsed ? 'justify-center p-3' : ''}
                    ${activeChatId === u.id 
                      ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20' 
                      : 'hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 bg-transparent border border-transparent hover:border-blue-100'}
                  `}
                >
                  <div className="relative shrink-0">
                     <img 
                       src={u.image || `https://picsum.photos/seed/${u.id}/200`} 
                       className={`w-12 h-12 rounded-2xl object-cover border-2 ${activeChatId === u.id ? 'border-white/20' : 'border-slate-100'}`} 
                       referrerPolicy="no-referrer" 
                     />
                     <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 ${activeChatId === u.id ? 'border-blue-500' : 'border-white'} rounded-full`} />
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-black uppercase tracking-tight truncate ${activeChatId === u.id ? 'text-white' : 'text-slate-900'}`}>
                          {u.name}
                        </p>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${activeChatId === u.id ? 'text-white/60' : 'text-slate-400'}`}>
                          12:45 PM
                        </span>
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${activeChatId === u.id ? 'text-white/60' : 'text-blue-500'}`}>
                        {u.role || 'Strategic Partner'}
                      </p>
                      <p className={`text-xs font-medium truncate ${activeChatId === u.id ? 'text-white/80' : 'text-slate-500'}`}>
                        Secure handshake completed. Ready for data exchange...
                      </p>
                    </div>
                  )}

                  {activeChatId === u.id && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <main 
          className={`
            flex-1 flex flex-col bg-[#F8FAFC] relative
            ${showMobileDetail ? 'fixed inset-0 z-50 md:relative md:z-auto flex' : 'hidden md:flex'}
          `}
        >
          {activeChatId && currentChatUser ? (
            <>
              {/* Chat Header */}
              <header className="h-24 px-6 md:px-12 bg-white/80 backdrop-blur-xl border-b border-blue-100/50 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => setShowMobileDetail(false)}
                    className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="relative">
                    <img 
                      src={currentChatUser.image || `https://picsum.photos/seed/${currentChatUser.id}/200`} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-50" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                         {currentChatUser.name}
                      </h2>
                      <div className="px-2 py-0.5 bg-blue-50 rounded-md flex items-center gap-1">
                        <ShieldCheck size={10} className="text-blue-600" />
                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-[9px] font-bold text-green-600 uppercase tracking-[0.2em]">Active Secure Link</p>
                    </div>
                  </div>
                </div>
                
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/50`} alt="participant" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Secure Group</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowCallModal(true)}
                    className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100 active:scale-95"
                  >
                    <Phone size={20} />
                  </button>
                  <button 
                    onClick={() => setToast({ message: "Accessing channel settings..." })}
                    className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all shadow-sm border border-slate-100 active:scale-95"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </header>

              {/* Message Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 flex flex-col custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
              >
                <div className="flex justify-center mb-4">
                  <div className="px-4 py-2 bg-blue-50/50 backdrop-blur-sm border border-blue-100/50 rounded-full flex items-center gap-2">
                    <Lock size={10} className="text-blue-600" />
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">End-to-End Encryption Enabled</span>
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-4">
                      <Zap size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">System ready for transmission</p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isOwn = m.senderId === currentUser?.uid;
                    return (
                      <motion.div 
                        key={m.id}
                        initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] md:max-w-[70%] group`}>
                          <div className={`
                            px-6 py-4 rounded-[28px] text-sm font-medium leading-relaxed shadow-sm relative overflow-hidden
                            ${isOwn 
                              ? 'bg-blue-500 text-white rounded-br-none' 
                              : 'bg-white text-slate-900 rounded-bl-none border border-blue-50'}
                          `}>
                             {m.text}
                             
                             {/* Subtle Geometric Detail in Bubble */}
                             <div className={`absolute top-0 right-0 w-12 h-12 opacity-[0.05] pointer-events-none ${isOwn ? 'text-white' : 'text-blue-500'}`}>
                               <svg viewBox="0 0 100 100" fill="currentColor">
                                 <path d="M0 0 L100 0 L100 100 Z" />
                               </svg>
                             </div>
                          </div>
                          <div className={`flex items-center gap-2 mt-2 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                               {m.timestamp ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Now'}
                            </span>
                            {isOwn && <CheckCheck size={12} className="text-blue-500" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                
                {/* Typing Indicator */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-2 bg-white/50 backdrop-blur-sm border border-blue-50 w-fit rounded-2xl"
                >
                  <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 bg-blue-600 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 bg-blue-600 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 bg-blue-600 rounded-full" />
                  </div>
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Partner is encrypting...</span>
                </motion.div>
              </div>

              {/* Input Bar */}
              <div className="p-6 md:p-12 bg-white/80 backdrop-blur-xl border-t border-blue-100/50">
                <form 
                  onSubmit={handleSendMessage}
                  className="max-w-5xl mx-auto flex items-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                    >
                      <Smile size={22} />
                    </button>
                    <button 
                      type="button"
                      className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                    >
                      <Paperclip size={22} />
                    </button>
                  </div>
                  
                  <div className="flex-1 relative group">
                    <input 
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Enter secure message..."
                      className="w-full h-16 px-8 bg-slate-50 border-2 border-slate-100 rounded-[24px] text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Secure Channel Active</span>
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="w-16 h-16 bg-blue-500 text-white rounded-[24px] flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 disabled:grayscale shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] group"
                  >
                    <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State Chat Window */
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-white/40">
              <div className="relative mb-12">
                <div className="w-32 h-32 bg-blue-50 rounded-[48px] flex items-center justify-center text-blue-200 border-2 border-blue-100">
                   <MessageSquare size={48} />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"
                >
                  <ShieldCheck size={24} />
                </motion.div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Secure Conversations</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] max-w-md leading-relaxed mb-12">
                Select a strategic partner from the directory to initiate an encrypted communication channel.
              </p>
              
              <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
                <div className="p-8 bg-white rounded-[32px] border border-blue-100 shadow-sm flex flex-col items-center gap-4 group hover:border-blue-600 transition-colors">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Lock size={20} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Encrypted</h4>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">End-to-End Security</p>
                </div>
                <div className="p-8 bg-white rounded-[32px] border border-blue-100 shadow-sm flex flex-col items-center gap-4 group hover:border-blue-600 transition-colors">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Clock size={20} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Real-Time</h4>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Zero Latency Sync</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Call Modal */}
      <AnimatePresence>
        {showCallModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCallModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className="w-24 h-24 mx-auto mb-8 relative">
                  <img 
                    src={currentChatUser?.image || `https://picsum.photos/seed/${currentChatUser?.id}/200`} 
                    className="w-full h-full rounded-[32px] object-cover border-4 border-blue-50" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-2xl flex items-center justify-center text-white">
                    <Phone size={18} fill="currentColor" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                  {currentChatUser?.name}
                </h3>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-8">Secure Voice Link</p>
                
                <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verified Endpoint</p>
                  <p className="text-xl font-black text-slate-900 tracking-wider">+254 712 345 678</p>
                </div>

                <div className="flex flex-col gap-3">
                  <a 
                    href="tel:+254712345678"
                    className="w-full py-5 bg-blue-500 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3 group"
                  >
                    Initiate Call <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <button 
                    onClick={() => setShowCallModal(false)}
                    className="w-full py-5 bg-slate-50 text-slate-500 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Cancel Transmission
                  </button>
                </div>
              </div>
              
              <div className="h-2 bg-blue-600 w-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            toast={toast} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(37, 99, 235, 0.2);
        }
      `}</style>
    </div>
  );
};
