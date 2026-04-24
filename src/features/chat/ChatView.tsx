import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  Phone, 
  MoreVertical, 
  MessageSquare, 
  Send,
  Briefcase
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  or, 
  getDoc, 
  doc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export const ChatView: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync chat users (people one has interacted with)
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
      
      const involvedIds = docs.reduce((acc: string[], curr: any) => {
        const otherId = curr.senderId === auth.currentUser?.uid ? curr.receiverId : curr.senderId;
        if (!acc.includes(otherId)) acc.push(otherId);
        return acc;
      }, []);

      // Fetch user details for these IDs
      involvedIds.forEach(async (id: string) => {
        if (!usersMap.has(id)) {
          const userSnap = await getDoc(doc(db, 'users', id));
          if (userSnap.exists()) {
            usersMap.set(id, { id, ...userSnap.data() });
            setChatUsers(Array.from(usersMap.values()));
          }
        }
      });
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Sync messages for active chat
  useEffect(() => {
    if (!auth.currentUser || !activeChatId) return;

    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [auth.currentUser.uid, activeChatId]),
      where('receiverId', 'in', [auth.currentUser.uid, activeChatId])
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
      
      setMessages(filtered);
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
        read: false
      });
      setMessageInput('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const currentChatUser = chatUsers.find(u => u.id === activeChatId);

  return (
    <div className="h-full flex divide-x divide-border-slate transition-all duration-500 overflow-hidden">
       {/* Chat List */}
       <div className={`w-full md:w-80 flex flex-col bg-sidebar/10 ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 border-b border-border-slate">
             <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-4 text-left">Conversations</h3>
             <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                <input 
                  type="text"
                  placeholder="Filter channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-sidebar/20 border border-border-slate rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-main focus:outline-none focus:border-primary-blue transition-all"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
             {loading && <div className="p-8 text-center text-[10px] font-black uppercase text-text-light opacity-50">Syncing Secure Comms...</div>}
             {!loading && chatUsers.length === 0 && (
               <div className="p-8 text-center">
                  <p className="text-[10px] font-black uppercase text-text-light/40 tracking-widest">No active secure channels</p>
               </div>
             )}
             {chatUsers.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
               <button 
                key={u.id} 
                onClick={() => { setActiveChatId(u.id); setShowMobileDetail(true); }}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${activeChatId === u.id ? 'bg-primary-blue text-white shadow-xl' : 'text-text-light hover:bg-sidebar/40'}`}
               >
                  <img src={u.image || `https://picsum.photos/seed/${u.id}/200`} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="text-left flex-1 min-w-0 text-left">
                     <p className={`font-bold text-sm truncate ${activeChatId === u.id ? 'text-white' : 'text-text-main'}`}>{u.name}</p>
                     <p className={`text-[9px] uppercase font-bold tracking-widest ${activeChatId === u.id ? 'text-white/60' : 'text-text-light/40'}`}>
                        {u.role || 'User'}
                     </p>
                  </div>
               </button>
             ))}
          </div>
       </div>

       {/* Chat Window */}
       <div className={`flex-1 flex flex-col ${showMobileDetail ? 'flex' : 'hidden md:flex'}`}>
          {activeChatId && currentChatUser ? (
            <>
              <header className="px-6 md:px-8 py-6 border-b border-border-slate flex items-center justify-between bg-sidebar/20">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setShowMobileDetail(false)}
                      className="md:hidden w-10 h-10 rounded-xl border border-border-slate flex items-center justify-center text-text-light"
                    >
                       <ChevronLeft size={20} />
                    </button>
                    <img src={currentChatUser.image || `https://picsum.photos/seed/${currentChatUser.id}/200`} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0 text-left">
                       <h4 className="text-sm md:text-lg font-bold text-text-main truncate">{currentChatUser.name}</h4>
                       <p className="text-[10px] font-black text-accent-green uppercase tracking-widest">Secure Connection Active</p>
                    </div>
                 </div>
                 <div className="flex gap-3 md:gap-4 text-text-light/40 shrink-0">
                    <Phone size={18} className="cursor-pointer hover:text-text-main" />
                    <MoreVertical size={18} className="cursor-pointer hover:text-text-main" />
                 </div>
              </header>

              <div className="flex-1 p-6 md:p-8 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sidebar/5 via-transparent to-transparent flex flex-col">
                 {messages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full opacity-30">
                      <MessageSquare size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Encryption Established</p>
                   </div>
                 )}
                 {messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] p-4 rounded-[22px] text-xs leading-relaxed ${m.senderId === auth.currentUser?.uid ? 'bg-primary-blue text-white rounded-br-none shadow-lg' : 'bg-sidebar/30 text-text-main rounded-bl-none border border-border-slate'}`}>
                          {m.text}
                       </div>
                    </div>
                  ))}
              </div>

              <div className="p-6 md:p-8 border-t border-border-slate bg-sidebar/5 backdrop-blur-sm">
                 <form 
                   onSubmit={handleSendMessage}
                   className="relative"
                 >
                    <input 
                      type="text" 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a secure message..." 
                      className="w-full bg-sidebar/20 border border-border-slate rounded-[24px] py-4 px-6 md:px-8 text-text-main text-sm focus:outline-none focus:border-primary-blue transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="absolute right-2 top-2 w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/10 transition-transform active:scale-90 disabled:opacity-50"
                    >
                       <Send size={16} />
                    </button>
                 </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-20">
               <div className="w-32 h-32 bg-border-slate rounded-full flex items-center justify-center mb-6">
                  <Briefcase size={48} className="text-text-main" />
               </div>
               <h4 className="text-2xl font-black text-text-main uppercase">Select Transmission</h4>
               <p className="text-xs font-bold text-text-light mt-2 uppercase tracking-widest">Operational channels only</p>
            </div>
          )}
       </div>
    </div>
  );
};
