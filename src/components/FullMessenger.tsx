import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Identity } from '../types';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Shield, 
  User, 
  Bot, 
  Box, 
  AlertTriangle, 
  Smile, 
  ExternalLink, 
  Info,
  ChevronRight,
  Sparkles,
  RefreshCw,
  MoreVertical,
  Check,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReportModal from './ReportModal';

interface FullMessengerProps {
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

export default function FullMessenger({ identity }: FullMessengerProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activePartnerId = searchParams.get('partner') || '';

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allIdentities, setAllIdentities] = useState<Identity[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Modals / Dropdowns
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  // Scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  const fetchConversations = async () => {
    if (!identity) return;
    try {
      const res = await fetch(`/api/messages/conversations/${identity.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  // Fetch all identities to allow searching new contacts
  const fetchIdentities = async () => {
    try {
      const res = await fetch('/api/identities');
      if (res.ok) {
        const data = await res.json();
        setAllIdentities(data);
      }
    } catch (err) {
      console.error('Error fetching identities:', err);
    }
  };

  // Fetch active conversation messages
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
          // Refresh conversations to update the sidebar unread badges immediately
          fetchConversations();
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Initialize
  useEffect(() => {
    if (identity) {
      setLoading(true);
      Promise.all([fetchConversations(), fetchIdentities()]).then(() => {
        setLoading(false);
      });
    }
  }, [identity]);

  // Polling messages & conversations
  useEffect(() => {
    if (!identity) return;
    fetchMessages();
    
    const interval = setInterval(() => {
      fetchMessages();
      fetchConversations();
    }, 4000);

    return () => clearInterval(interval);
  }, [identity, activePartnerId]);

  // Scroll to bottom when messages list changes
  const prevMessagesLengthRef = useRef(messages.length);
  const prevPartnerIdRef = useRef(activePartnerId);

  useEffect(() => {
    const partnerChanged = prevPartnerIdRef.current !== activePartnerId;
    prevPartnerIdRef.current = activePartnerId;

    const prevLength = prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (partnerChanged) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
      return;
    }

    if (messages.length > prevLength) {
      const lastMsg = messages[messages.length - 1];
      const isMe = lastMsg?.senderId === identity?.id;

      const container = chatEndRef.current?.parentElement;
      if (container) {
        const threshold = 150;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        if (isMe || isNearBottom) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, activePartnerId, identity?.id]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const textToSend = customText !== undefined ? customText : inputText;
    if (!textToSend.trim() || !identity || !activePartnerId) return;

    if (customText === undefined) {
      setInputText('');
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: identity.id,
          receiverId: activePartnerId,
          content: textToSend.trim()
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        fetchConversations(); // refresh conversation list last message
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getIdentityIcon = (type: string) => {
    switch (type) {
      case 'Human': return <User className="w-5 h-5" />;
      case 'Organization': return <Box className="w-5 h-5" />;
      case 'AI Agent': return <Bot className="w-5 h-5 animate-pulse text-indigo-600" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getPartnerAvatarColor = (type: string) => {
    switch (type) {
      case 'Human': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Organization': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'AI Agent': return 'bg-indigo-50 text-indigo-700 border-indigo-150';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Find active partner details
  const activePartner = allIdentities.find(i => i.id === activePartnerId) || 
                        conversations.find(c => c.partner.id === activePartnerId)?.partner;

  // Search filter
  const filteredConversations = conversations.filter(c => 
    c.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.partner.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIdentitiesToStartChat = allIdentities.filter(i => {
    // Cannot chat with oneself
    if (i.id === identity?.id) return false;
    // Already in conversation list?
    const inConv = conversations.some(c => c.partner.id === i.id);
    if (inConv) return false;
    // Query check
    return i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           i.handle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectPartner = (partnerId: string | null) => {
    if (partnerId) {
      setSearchParams({ partner: partnerId });
    } else {
      setSearchParams({});
    }
  };

  const popularEmojis = ['😀', '👍', '🔥', '💡', '💯', '❤️', '🙌', '👀', '⚖️', '🚫', '🤖', '❓'];

  const quickReplies = [
    'สวัสดีครับ ยินดีที่ได้เชื่อมต่อ!',
    'ข้อมูล Knowledge Object ของคุณน่าสนใจมาก',
    'ผมขอสอบถามแหล่งอ้างอิงของข้อมูลส่วนนี้เพิ่มเติมได้ไหมครับ?',
    'ทางเราขอนำเอกสารไปเข้าที่ประชุมพิจารณาต่อครับ',
    'ตัวบอทวิเคราะห์พบคะแนนความน่าเชื่อถือที่ต้องปรับปรุงครับ'
  ];

  if (!identity) {
    return (
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
        <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">โปรดเข้าสู่ระบบหรือสร้างโปรไฟล์เพื่อเปิดกล่องข้อความ</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex overflow-hidden min-h-[calc(100vh-10rem)] h-[680px]">
      
      {/* LEFT COLUMN: Conversation List & Search */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50 ${
        activePartnerId ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Search header */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              แชทของฉัน
            </h2>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full uppercase">
              {identity.name}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาแชท หรือชื่อผู้ใช้อื่น..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* List scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-8 text-xs font-bold text-slate-400 animate-pulse">กำลังโหลดแชท...</div>
          ) : (
            <>
              {/* Existing Conversations */}
              {filteredConversations.length > 0 && (
                <div className="py-2 px-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">บทสนทนา</div>
                  <div className="space-y-1">
                    {filteredConversations.map((conv) => {
                      const isActive = conv.partner.id === activePartnerId;
                      return (
                        <button
                          key={conv.partner.id}
                          onClick={() => selectPartner(conv.partner.id)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                            isActive 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'hover:bg-slate-100 bg-white border border-slate-150/50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 font-bold relative ${
                            isActive ? 'bg-blue-700 border-blue-500 text-white' : getPartnerAvatarColor(conv.partner.type)
                          }`}>
                            {getIdentityIcon(conv.partner.type)}
                            {!isActive && conv.unreadCount && conv.unreadCount > 0 ? (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border border-white rounded-full flex items-center justify-center text-[8px] font-extrabold text-white shadow-sm">
                                {conv.unreadCount}
                              </span>
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-baseline gap-1">
                              <span className={`text-xs font-extrabold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                {conv.partner.name}
                              </span>
                              {conv.lastMessage && (
                                <span className={`text-[9px] shrink-0 font-medium ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                  {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: false }).replace('about ', '')}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-baseline gap-1 mt-0.5">
                              <p className={`text-[10px] truncate leading-snug font-medium flex-1 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                                {conv.lastMessage?.content || 'เริ่มบทสนทนาใหม่...'}
                              </p>
                              {isActive && conv.unreadCount && conv.unreadCount > 0 ? (
                                <span className="shrink-0 text-[8px] font-bold bg-white text-blue-600 px-1.5 py-0.2 rounded-full">
                                  ใหม่
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Start new Chat option with other members */}
              {searchQuery && filteredIdentitiesToStartChat.length > 0 && (
                <div className="py-2 px-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">ค้นพบผู้ใช้ใหม่</div>
                  <div className="space-y-1">
                    {filteredIdentitiesToStartChat.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          selectPartner(user.id);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 bg-white border border-slate-150/50 text-left transition-all cursor-pointer"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold shrink-0 ${getPartnerAvatarColor(user.type)}`}>
                          {getIdentityIcon(user.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold text-slate-900 truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{user.handle} • {user.type}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredConversations.length === 0 && !searchQuery && (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs font-bold">ยังไม่มีการพูดคุยกับใคร</p>
                  <p className="text-[10px]">ลองพิมพ์ชื่อเพื่อหาผู้ใช้อื่นด้านบนแล้วเริ่มพิมพ์ข้อความแรกได้เลย</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MIDDLE COLUMN: Message Screen */}
      <div className={`flex-1 flex flex-col bg-white min-w-0 ${
        activePartnerId ? 'flex' : 'hidden md:flex'
      }`}>
        {activePartner ? (
          <>
            {/* Chat Area Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white shrink-0 shadow-xs z-10">
              <div className="flex items-center gap-3 min-w-0">
                {activePartner && (
                  <button
                    onClick={() => selectPartner(null)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 flex items-center justify-center rounded-lg hover:bg-slate-100 shrink-0"
                    title="กลับ"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${getPartnerAvatarColor(activePartner.type)}`}>
                  {getIdentityIcon(activePartner.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate leading-none">
                      {activePartner.name}
                    </h3>
                    <span className="text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {activePartner.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block leading-none">
                    {activePartner.handle} | ID: {activePartner.id}
                  </span>
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  title="รายงานผู้ใช้บัญชีนี้"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
                <Link
                  to={`/identity/${activePartner.id}`}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  title="ดูประวัติโปรไฟล์"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    showRightPanel ? 'text-blue-600 bg-blue-50/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                  title="สลับหน้าแสดงความน่าเชื่อถือ"
                >
                  <Shield className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message bubble list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 opacity-30 text-blue-500" />
                  <p className="text-xs font-bold text-slate-700">ส่งข้อความทักทายแรกของคุณ</p>
                  <p className="text-[10px] max-w-xs">พิมพ์ข้อความเพื่อเริ่มแลกเปลี่ยนความรู้ หรือสอบถามความร่วมมือเพื่อช่วยกระชับคะแนนความถูกต้องร่วมกัน</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === identity.id;
                    return (
                      <div 
                        key={msg.id || idx}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] space-y-1`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-xs ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-none font-medium' 
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-medium'
                          }`}>
                            {msg.content}
                          </div>
                          <span className={`text-[8px] font-mono font-medium block text-slate-400 ${
                            isMe ? 'text-right mr-1' : 'text-left ml-1'
                          }`}>
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
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto flex gap-2 shrink-0 scrollbar-none">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={(e) => handleSendMessage(e, reply)}
                  className="px-3 py-1 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-[10px] font-semibold rounded-full shrink-0 transition-all cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Chat Input form area */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0 space-y-2">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  
                  {showEmojis && (
                    <div className="absolute bottom-12 left-0 bg-white border border-slate-200 rounded-xl p-3 shadow-xl grid grid-cols-6 gap-1.5 z-50 w-max">
                      {popularEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setInputText(prev => prev + emoji);
                            setShowEmojis(false);
                          }}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-lg cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder={`พิมพ์ข้อความตอบกลับ ${activePartner.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                />

                <button
                  type="submit"
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full border border-slate-200 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">โปรดเลือกแชทเพื่อพูดคุย</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                คุณสามารถค้นหาข้อมูลผู้ใช้ในแถบด้านซ้าย หรือเปิดดูรายงาน ข้อมูลประวัติ และป้ายชื่อ เพื่อเริ่มตรวจสอบความสอดคล้องกันได้ทันที
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Partner Trust details (Fit with SOTYAI architecture) */}
      {activePartner && showRightPanel && (
        <div className="hidden lg:flex w-72 border-l border-slate-200 flex-col bg-slate-50/50 overflow-y-auto">
          <div className="p-5 border-b border-slate-200 bg-white text-center space-y-3 shrink-0">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border font-bold text-2xl shadow-xs ${getPartnerAvatarColor(activePartner.type)}`}>
              {getIdentityIcon(activePartner.type)}
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">{activePartner.name}</h4>
              <p className="text-xs text-slate-500 font-medium">{activePartner.handle}</p>
            </div>
            
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-150">
                <Shield className="w-3.5 h-3.5" />
                Trust Level: {activePartner.trustProfile.identity}
              </span>
            </div>
          </div>

          {/* Profile statistics */}
          <div className="p-5 space-y-5">
            {/* Trust Radar */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">โปรไฟล์ความน่าเชื่อถือ (Trust Profile)</h5>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-xs">
                {/* Identity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>การพิสูจน์ตัวตน</span>
                    <span>{activePartner.trustProfile.identity}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activePartner.trustProfile.identity}%` }}></div>
                  </div>
                </div>

                {/* Accuracy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>ความถูกต้องของข้อมูล</span>
                    <span>{activePartner.trustProfile.accuracy || 50}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${activePartner.trustProfile.accuracy || 50}%` }}></div>
                  </div>
                </div>

                {/* community */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>ความร่วมมือกับคอมมูนิตี้</span>
                    <span>{activePartner.trustProfile.community || 50}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${activePartner.trustProfile.community || 50}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges / Expertise */}
            {activePartner.expertise && activePartner.expertise.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">หัวข้อเชี่ยวชาญ (Expertise)</h5>
                <div className="flex flex-wrap gap-1.5">
                  {activePartner.expertise.map((exp: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-200/60 border border-slate-300/40 text-slate-700 text-[10px] font-bold rounded">
                      {exp.topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick warning */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 text-[10px] text-slate-500 font-medium leading-relaxed">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                คำอธิบายความปลอดภัย
              </div>
              ระบบแชทของ SOTYAI มีการเข้ารหัสและเก็บบันทึกบน HAKP Network หากคู่สนทนามีท่าทีฉ้อโกง ส่งข้อมูลปลอม หรือข้อมูลบิดเบือนที่ขัดแย้งกับหลักฐานประจักษ์ โปรดส่งรายงานผ่านทางปุ่มแจ้งเตือน
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {identity && activePartner && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetType="Identity"
          targetId={activePartner.id}
          targetTitle={activePartner.name}
          reporterId={identity.id}
        />
      )}
    </div>
  );
}
