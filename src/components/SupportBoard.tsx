import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bug, 
  MessageSquare, 
  Plus, 
  Lock, 
  Unlock, 
  ArrowUp, 
  ChevronDown, 
  Search, 
  CheckCircle, 
  Clock, 
  SlidersHorizontal, 
  Flame, 
  Tag, 
  User, 
  Bot, 
  Box, 
  X,
  FileText,
  CornerDownRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Ticket, TicketComment, Identity } from '../types';

interface SupportBoardProps {
  identity: Identity | null;
}

export default function SupportBoard({ identity }: SupportBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<{ ticket: Ticket; comments: TicketComment[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Bug' | 'Failure' | 'General' | 'FeatureRequest'>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes' | 'comments'>('recent');

  // Submit Ticket Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<'Bug' | 'Failure' | 'General' | 'FeatureRequest'>('Bug');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit Comment Form
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single ticket details (with comments)
  const loadTicketDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveTicket(data);
      }
    } catch (err) {
      console.error('Error fetching ticket detail:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Poll ticket detail if selected to see new comments
  useEffect(() => {
    if (activeTicket) {
      const interval = setInterval(() => {
        loadTicketDetail(activeTicket.ticket.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTicket?.ticket.id]);

  // Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !identity) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          category: formCategory,
          creatorId: identity.id
        })
      });

      if (res.ok) {
        setFormTitle('');
        setFormDesc('');
        setFormCategory('Bug');
        setShowCreateModal(false);
        await fetchTickets();
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upvote Ticket
  const handleUpvote = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!identity) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId: identity.id })
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        // Update local ticket list
        setTickets(tickets.map(t => t.id === ticketId ? updatedTicket : t));
        // If current active is upvoted, update detail as well
        if (activeTicket && activeTicket.ticket.id === ticketId) {
          setActiveTicket({
            ...activeTicket,
            ticket: updatedTicket
          });
        }
      }
    } catch (err) {
      console.error('Error upvoting ticket:', err);
    }
  };

  // Submit Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeTicket || !identity) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/tickets/${activeTicket.ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: identity.id,
          content: commentText
        })
      });

      if (res.ok) {
        setCommentText('');
        await loadTicketDetail(activeTicket.ticket.id);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Admin simulation: Toggle status
  const handleToggleStatus = async (ticketId: string, currentStatus: 'Open' | 'Closed') => {
    const nextStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        await fetchTickets();
        if (activeTicket && activeTicket.ticket.id === ticketId) {
          setActiveTicket({
            ...activeTicket,
            ticket: {
              ...activeTicket.ticket,
              status: nextStatus
            }
          });
        }
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Filter & Sort Tickets
  const filteredTickets = tickets.filter(t => {
    // Search filter
    const matchesSearch = t.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchText.toLowerCase());
    // Status filter
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    // Category filter
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    // Simple sort by recent (default)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // KPI Calculations
  const totalBugs = tickets.filter(t => t.category === 'Bug').length;
  const totalFailures = tickets.filter(t => t.category === 'Failure').length;
  const totalFeatures = tickets.filter(t => t.category === 'FeatureRequest').length;
  const openCount = tickets.filter(t => t.status === 'Open').length;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Bug':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <Bug className="w-3 h-3" /> แจ้งบั๊ก
        </span>;
      case 'Failure':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> ระบบผิดพลาด
        </span>;
      case 'FeatureRequest':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <Plus className="w-3 h-3" /> ขอเพิ่มฟังก์ชั่น
        </span>;
      default:
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> ทั่วไป
        </span>;
    }
  };

  const getIdentityIconElement = (type?: string) => {
    switch (type) {
      case 'Human': return <User className="w-3 h-3 text-blue-500" />;
      case 'Organization': return <Box className="w-3 h-3 text-amber-500" />;
      case 'AI Agent': return <Bot className="w-3 h-3 text-purple-500" />;
      default: return <User className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="support-board-root">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Bug className="w-7 h-7 text-rose-600" />
            บอร์ดแจ้งปัญหาและเสนอแนะ (Support & Feedback Board)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ร่วมกันพัฒนาระบบ SOTYAI! เปิด Ticket แจ้งปัญหาระบบ แนะนำฟังก์ชั่นใหม่ หรือข้อขัดข้องในการใช้งาน และมีส่วนร่วมโต้ตอบแลกเปลี่ยนข้อคิดเห็น
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          เปิด Ticket ใหม่ (Create Ticket)
        </button>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ปัญหาที่เปิดอยู่ (Active Tickets)</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-blue-600">{openCount}</span>
            <Unlock className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">รายงาน Bug ทั้งหมด (Bug Reports)</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-amber-600">{totalBugs}</span>
            <Bug className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ระบบขัดข้องรุนแรง (System Failure)</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-rose-600">{totalFailures}</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ขอเพิ่มฟังก์ชั่น (Features Requested)</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-purple-600">{totalFeatures}</span>
            <Flame className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Board Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Middle: Tickets list (span-2) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ค้นหา Ticket ปัญหาหรือฟังก์ชั่นแนะนำ..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtering Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex flex-wrap gap-2">
                {/* Status Selection */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">ทุกสถานะ (All Status)</option>
                  <option value="Open">เฉพาะที่เปิดอยู่ (Open Only)</option>
                  <option value="Closed">ปิดแล้ว (Closed Only)</option>
                </select>

                {/* Category Selection */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">ทุกหมวดหมู่ (All Categories)</option>
                  <option value="Bug">แจ้งบั๊ก (Bug)</option>
                  <option value="Failure">ระบบขัดข้อง (Failure)</option>
                  <option value="General">ทั่วไป (General)</option>
                  <option value="FeatureRequest">ขอฟังก์ชั่น (Feature Request)</option>
                </select>
              </div>

              {/* Sorting Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">จัดเรียง:</span>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-2.5 py-1.5 rounded font-bold transition-all ${sortBy === 'recent' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  ล่าสุด
                </button>
                <button
                  onClick={() => setSortBy('upvotes')}
                  className={`px-2.5 py-1.5 rounded font-bold transition-all ${sortBy === 'upvotes' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  ความนิยม (Upvotes)
                </button>
              </div>
            </div>
          </div>

          {/* Ticket Listing Container */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-500">กำลังสืบค้น Ticket ในเครือข่าย...</p>
            </div>
          ) : sortedTickets.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">ไม่พบ Ticket ที่ตรงตามข้อกำหนด</h3>
              <p className="text-xs text-slate-500">ลองล้างค่าค้นหาเพื่อดูข้อมูล Ticket ทั้งหมด</p>
              <button
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('All');
                  setCategoryFilter('All');
                  setSortBy('recent');
                }}
                className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                ล้างข้อมูลตัวกรอง
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTickets.map(t => {
                const isActive = activeTicket?.ticket.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => loadTicketDetail(t.id)}
                    className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex gap-4 ${isActive ? 'border-blue-500 ring-2 ring-blue-500/10 bg-slate-50/20' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {/* Upvote Button inside list */}
                    <div className="flex flex-col items-center justify-start pt-1">
                      <button
                        onClick={(e) => handleUpvote(t.id, e)}
                        className={`p-2 rounded-lg border transition-all ${
                          identity && t.upvoters.includes(identity.id)
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                        title="Upvote Ticket"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-800 mt-1">{t.upvotes}</span>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(t.category)}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          t.status === 'Open'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {t.status === 'Open' ? '• รับเรื่อง (Open)' : '• แก้ไขแล้ว (Closed)'}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base line-clamp-1">
                        {t.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {t.description}
                      </p>

                      {/* Card Meta info */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100/60 mt-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                              {getIdentityIconElement(t.creatorType)}
                            </span>
                            <strong className="text-slate-600">{t.creatorName}</strong>
                            <span className="text-slate-400 font-normal">{t.creatorHandle}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(t.createdAt))} ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Selected Ticket Detail & Chat thread (span-1) */}
        <div className="space-y-4">
          {activeTicket ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm lg:sticky lg:top-4">
              {/* Ticket Header detail */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {getCategoryBadge(activeTicket.ticket.category)}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      activeTicket.ticket.status === 'Open'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {activeTicket.ticket.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveTicket(null)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="font-extrabold text-slate-900 text-base">
                  {activeTicket.ticket.title}
                </h2>

                {/* Simulator Team Control Action */}
                <div className="mt-3 bg-blue-50/30 border border-blue-100 p-2.5 rounded-lg flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-blue-800 font-bold block">ผู้ดูแลระบบจําลอง (Admin Action Mode):</span>
                    <span className="text-[10px] text-slate-500">จำลองการเปิด/ปิด Ticket เพื่อทดสอบระบบโต้ตอบ</span>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(activeTicket.ticket.id, activeTicket.ticket.status)}
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded border shadow-sm transition-all cursor-pointer flex items-center gap-1 ${
                      activeTicket.ticket.status === 'Open'
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {activeTicket.ticket.status === 'Open' ? (
                      <>
                        <Lock className="w-3 h-3" /> ปิด Ticket (Close)
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> เปิด Ticket อีกครั้ง
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50/50 p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
                  {activeTicket.ticket.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                      {getIdentityIconElement(activeTicket.ticket.creatorType)}
                    </span>
                    <strong>{activeTicket.ticket.creatorName}</strong>
                  </span>
                  <span>{formatDistanceToNow(new Date(activeTicket.ticket.createdAt))} ago</span>
                </div>
              </div>

              {/* Chat Thread / Comments Ledger */}
              <div className="border-t border-slate-100 bg-slate-50/30">
                <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    ความคิดเห็นและโต้ตอบ ({activeTicket.comments.length})
                  </h4>
                </div>

                <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                  {activeTicket.comments.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-4 italic">
                      ยังไม่มีผู้แสดงความคิดเห็นในปัญหานี้
                    </p>
                  ) : (
                    activeTicket.comments.map(c => (
                      <div key={c.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="w-3.5 h-3.5 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                              {getIdentityIconElement(c.authorType)}
                            </span>
                            <strong className="text-slate-600">{c.authorName}</strong>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-semibold">{c.authorType}</span>
                          </span>
                          <span>{formatDistanceToNow(new Date(c.createdAt))} ago</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 shadow-xs ml-4">
                          {c.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Submitting comments section based on Ticket status */}
                {activeTicket.ticket.status === 'Open' ? (
                  identity ? (
                    <form onSubmit={handleAddComment} className="p-3 border-t border-slate-100 bg-white space-y-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="เขียนความคิดเห็นหรือให้ข้อมูลช่วยเหลือที่นี่..."
                        rows={2}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">โต้ตอบในนาม {identity.name}</span>
                        <button
                          type="submit"
                          disabled={isSubmittingComment || !commentText.trim()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          {isSubmittingComment ? 'กำลังส่ง...' : 'แสดงความเห็น'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 bg-slate-100 text-center text-xs text-slate-500 border-t border-slate-100 font-medium">
                      โปรดเลือก Identity ของคุณเพื่อเข้าร่วมโต้ตอบในระบบ
                    </div>
                  )
                ) : (
                  /* Blocked interactions because ticket is closed */
                  <div className="p-4 bg-slate-100 text-slate-600 text-xs flex flex-col items-center justify-center text-center border-t border-slate-200 gap-2 font-semibold">
                    <Lock className="w-5 h-5 text-rose-500 animate-pulse" />
                    <div>
                      <p className="text-rose-600">การสนทนาโต้ตอบถูกปิดเนื่องจาก Ticket นี้ถูกปิดแล้ว</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        ทุกฟังก์ชั่นและกล่องแสดงความคิดเห็นจะถูกล็อคโดยสมบูรณ์เมื่อผู้ดูแลระบบปรับสถานะเป็น Close
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">เลือก Ticket เพื่อดูรายละเอียด</h4>
              <p className="text-[11px] text-slate-400">
                คลิกเลือกปัญหาหรือข้อเสนอแนะที่ลิสต์ฝั่งซ้าย เพื่ออ่านรายละเอียด ตรวจสอบประวัติการคอมเมนต์ และเสนอมุมมองของคุณเพิ่มเติม
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal Form */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                  <Bug className="w-5 h-5 text-blue-600" />
                  เปิดประเด็น / เปิด Ticket การใช้งาน
                </h3>
                <p className="text-xs text-slate-500 mt-1">แจ้งปัญหาระบบ บั๊กเสนอแนะ หรือคำร้องขอพัฒนาส่วนต่าง ๆ เพื่อส่งให้กับทีมงาน</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">หมวดหมู่รายงาน (Category)</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bug">แจ้งบั๊กในระบบ (Bug Report)</option>
                    <option value="Failure">ระบบหยุดทำงานหรือขัดข้อง (System Failure)</option>
                    <option value="General">สอบถามทั่วไป/เสนอปรับปรุง (General Feedback)</option>
                    <option value="FeatureRequest">ขอเพิ่มฟังก์ชั่นใหม่ (Feature Request)</option>
                  </select>
                </div>

                {/* Reporter name preview */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">ผู้รายงาน (Reporting Identity)</label>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    {identity ? (
                      <>
                        <span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                          {getIdentityIconElement(identity.type)}
                        </span>
                        <span>{identity.name} ({identity.handle})</span>
                      </>
                    ) : (
                      <span className="text-amber-600">โปรดเลือกตัวตนที่เมนูด้านซ้าย</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">หัวข้อรายงาน (Ticket Title)</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เขียนสรุปหัวข้อปัญหาหรือข้อเสนอสั้นๆ..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">รายละเอียดเพิ่มเติม (Description)</label>
                <textarea
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="อธิบายรายละเอียดปัญหา ขั้นตอนการเกิดข้อผิดพลาด ผลลัพธ์ที่พบ หรือแนวคิดฟังก์ชั่นที่ต้องการอย่างชัดเจน..."
                  rows={4}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !identity || !formTitle.trim() || !formDesc.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  {isSubmitting ? 'กำลังส่ง Ticket...' : 'ยืนยันสร้าง Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
