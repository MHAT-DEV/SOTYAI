import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Identity } from '../types';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Bot, 
  Box, 
  X, 
  Minimize2, 
  Maximize2, 
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatWidgetProps {
  identity: Identity | null;
}

interface Conversation {
  partner: Identity;
  lastMessage?: {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    read?: boolean;
  };
  unreadCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export default function ChatWidget({ identity }: ChatWidgetProps) {
  const navigate = useNavigate();

  // Widget States
  const [isOpen, setIsOpen] = useState(false);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  
  // Data States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allIdentities, setAllIdentities] = useState<Identity[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const totalUnreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!identity) return;
    try {
      const res = await fetch(`/api/messages/conversations/${identity.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all identities
  const fetchIdentities = async () => {
    try {
      const res = await fetch('/api/identities');
      if (res.ok) {
        const data = await res.json();
        setAllIdentities(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages with active partner
  const fetchMessages = async () => {
    if (!identity || !activePartnerId) return;
    try {
      const res = await fetch(`/api/messages?senderId=${identity.id}&receiverId=${activePartnerId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);

        // Mark messages as read if there are unread incoming messages in the thread
        const hasUnread = data.some((m: any) => m.senderId === activePartnerId && m.receiverId === identity.id && !m.read);
        if (hasUnread) {
          await fetch('/api/messages/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId: activePartnerId, receiverId: identity.id })
          });
          // Refresh conversations to update unread badge on the floating button immediately
          fetchConversations();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    if (identity) {
      fetchConversations();
      fetchIdentities();
    }
  }, [identity]);

  // Global periodic polling for conversations to keep unread badges updated dynamically
  useEffect(() => {
    if (!identity) return;
    const interval = setInterval(() => {
      fetchConversations();
    }, 5050); // poll every ~5 seconds

    return () => clearInterval(interval);
  }, [identity]);

  // Messages Polling
  useEffect(() => {
    if (!identity || !activePartnerId || !isOpen) return;
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
      fetchConversations();
    }, 4000);

    return () => clearInterval(interval);
  }, [identity, activePartnerId, isOpen]);

  // Scroll to bottom
  const prevMessagesLengthRef = useRef(messages.length);
  const prevPartnerIdRef = useRef(activePartnerId);
  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    const partnerChanged = prevPartnerIdRef.current !== activePartnerId;
    prevPartnerIdRef.current = activePartnerId;

    const openChanged = prevIsOpenRef.current !== isOpen;
    prevIsOpenRef.current = isOpen;

    const prevLength = prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (!isOpen || !activePartnerId) return;

    if (partnerChanged || openChanged) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
      return;
    }

    if (messages.length > prevLength) {
      const lastMsg = messages[messages.length - 1];
      const isMe = lastMsg?.senderId === identity?.id;

      const container = messagesEndRef.current?.parentElement;
      if (container) {
        const threshold = 150;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        if (isMe || isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isOpen, activePartnerId, identity?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !identity || !activePartnerId) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: identity.id,
          receiverId: activePartnerId,
          content: text
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIdentityIcon = (type: string) => {
    switch (type) {
      case 'Human': return <User className="w-4 h-4" />;
      case 'Organization': return <Box className="w-4 h-4" />;
      case 'AI Agent': return <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getAvatarColor = (type: string) => {
    switch (type) {
      case 'Human': return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Organization': return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'AI Agent': return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const activePartner = allIdentities.find(i => i.id === activePartnerId) || 
                        conversations.find(c => c.partner.id === activePartnerId)?.partner;

  // Filter conversations
  const filteredConversations = conversations.filter(c => 
    c.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.partner.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter members to start a new chat with
  const filteredNewIdentities = allIdentities.filter(i => {
    if (i.id === identity?.id) return false;
    const isAlreadyInChat = conversations.some(c => c.partner.id === i.id);
    if (isAlreadyInChat) return false;
    return i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           i.handle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleMaximize = () => {
    setIsOpen(false);
    if (activePartnerId) {
      navigate(`/messenger?partner=${activePartnerId}`);
    } else {
      navigate('/messenger');
    }
  };

  if (!identity) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      
      {/* CHAT BOX CONTAINER */}
      {isOpen && (
        <div className="w-[340px] h-[450px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* HEADER */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-sm">
            {activePartnerId ? (
              <div className="flex items-center gap-2 min-w-0">
                <button 
                  onClick={() => {
                    setActivePartnerId(null);
                    setMessages([]);
                  }}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border font-bold text-xs ${getAvatarColor(activePartner?.type || '')}`}>
                  {getIdentityIcon(activePartner?.type || '')}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate text-white flex items-center gap-1.5">
                    {activePartner?.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5 text-green-500" /> Trust: {activePartner?.trustProfile.identity}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-blue-600 text-white rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">SOTYAI Instant Inbox</h4>
                  <p className="text-[9px] text-slate-400">คุยด่วนกับพาร์ตเนอร์และบอท</p>
                </div>
              </div>
            )}

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleMaximize}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="ขยายเต็มจอ (Open Full screen)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="ย่อหน้าจอ"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CHAT SCREEN BODY */}
          {activePartnerId ? (
            /* CONVERSATION VIEW */
            <div className="flex-1 flex flex-col bg-slate-50/50 min-h-0">
              {/* Message loop */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-1.5">
                    <HelpCircle className="w-8 h-8 opacity-40 text-blue-500" />
                    <p className="text-[11px] font-bold text-slate-700">ส่งข้อความทักทายแรก</p>
                    <p className="text-[10px] max-w-[200px]">เริ่มแชทสด แลกเปลี่ยนข้อมูลเชิงประจักษ์และการแก้ไขโครงสร้าง</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === identity.id;
                      return (
                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[80%]">
                            <div className={`px-3.5 py-2 rounded-2xl text-[11px] leading-relaxed break-words shadow-xs ${
                              isMe 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}>
                              {msg.content}
                            </div>
                            <span className={`text-[8px] text-slate-400 block font-mono mt-0.5 ${isMe ? 'text-right mr-1' : 'text-left ml-1'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && (
                                <span className={`ml-1 font-bold ${msg.read ? 'text-blue-500' : 'text-slate-400'}`}>
                                  • {msg.read ? 'อ่านแล้ว' : 'ส่งแล้ว'}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-150 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความที่นี่..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-medium"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            /* CONVERSATION LIST VIEW */
            <div className="flex-1 flex flex-col bg-slate-50/50 min-h-0">
              {/* Search bar */}
              <div className="p-2.5 border-b border-slate-200 bg-white">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="พิมพ์หาเพื่อน หรือบอทเริ่มแชท..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-250 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Scrollable conversation list */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-150/40">
                
                {/* Conversations Loop */}
                {filteredConversations.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">กล่องแชทของฉัน</div>
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.partner.id}
                        onClick={() => setActivePartnerId(conv.partner.id)}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-100 bg-white border border-slate-150/50 text-left transition-all cursor-pointer relative"
                      >
                        <div className="relative shrink-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold text-xs ${getAvatarColor(conv.partner.type)}`}>
                            {getIdentityIcon(conv.partner.type)}
                          </div>
                          {conv.unreadCount && conv.unreadCount > 0 ? (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border border-white rounded-full flex items-center justify-center text-[7px] font-extrabold text-white shadow-xs">
                              {conv.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-baseline gap-1">
                            <span className="text-[11px] font-bold text-slate-900 truncate">
                              {conv.partner.name}
                            </span>
                            {conv.lastMessage && (
                              <span className="text-[8px] font-medium text-slate-400 shrink-0 font-mono">
                                {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: false }).replace('about ', '')}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center gap-1">
                            <p className="text-[9px] text-slate-500 truncate font-medium mt-0.5 flex-1">
                              {conv.lastMessage?.content || 'คลิกเพื่อเริ่มพูดคุย...'}
                            </p>
                            {conv.unreadCount && conv.unreadCount > 0 ? (
                              <span className="px-1 py-0.5 text-[7px] font-extrabold bg-rose-50 text-rose-600 rounded">
                                ใหม่
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Direct discovery list when searching */}
                {searchQuery && filteredNewIdentities.length > 0 && (
                  <div className="p-2 space-y-1 bg-white border-t border-slate-200">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">เริ่มสนทนากับสมาชิกใหม่</div>
                    {filteredNewIdentities.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setActivePartnerId(user.id);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 bg-white border border-slate-150/50 text-left transition-all cursor-pointer"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border font-bold shrink-0 text-xs ${getAvatarColor(user.type)}`}>
                          {getIdentityIcon(user.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-slate-900 truncate">{user.name}</div>
                          <div className="text-[9px] text-slate-400 truncate">{user.handle}</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredConversations.length === 0 && !searchQuery && (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-7 h-7 mx-auto opacity-35 text-slate-400" />
                    <p className="text-[11px] font-bold text-slate-800">ยังไม่มีประวัติการแชท</p>
                    <p className="text-[9px] max-w-[200px] mx-auto leading-relaxed">พิมพ์คำค้นหาด้านบนเพื่อสร้างแชทแรกกับผู้ใช้อื่นหรือ AI Agent แพลตฟอร์ม</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FLOATING ACTION TRIGGER BUBBLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer relative border border-blue-500/30"
        title="เปิดด่วนกล่องแชทพอร์ทัล"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-in spin-in-90 duration-200" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 animate-in zoom-in-50 duration-200" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shadow-md animate-bounce px-1">
                {totalUnreadCount}
              </span>
            )}
          </>
        )}
      </button>

    </div>
  );
}
