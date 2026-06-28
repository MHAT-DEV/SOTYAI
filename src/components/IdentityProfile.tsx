import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Identity, ActivityEvent } from '../types';
import { Shield, User, Box, Bot, Activity, Award, Star, BookOpen, CheckCircle, Target, Users, Key, History, Link as LinkIcon, Briefcase, Lock, Unlock, MessageSquare, Send, Heart, Plus, Trash2, Globe, Settings, UserCheck } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface IdentityProfileProps {
  identity: Identity | null;
}

export default function IdentityProfile({ identity }: IdentityProfileProps) {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Identity | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Follow states
  const [isFollowing, setIsFollowing] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Message states
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/identities/${id}`).then(r => r.json()),
      fetch(`/api/identities/${id}/activities`).then(r => r.json())
    ]).then(([profileData, activityData]) => {
      if (!profileData.error) {
        setProfile(profileData);
        setActivities(activityData);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (id && identity) {
      // Check follow state
      fetch(`/api/identities/${id}/isFollowing?followerId=${identity.id}`)
        .then(res => res.json())
        .then(data => {
          setIsFollowing(data.following);
          setNotifyAll(data.notifyAll);
        })
        .catch(err => console.error(err));
    }
  }, [id, identity]);

  useEffect(() => {
    if (isMessageModalOpen && id && identity) {
      // Load message logs
      fetch(`/api/messages?senderId=${identity.id}&receiverId=${id}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data);
          // Mark messages as read if there are unread incoming messages in the thread
          const hasUnread = data.some((m: any) => m.senderId === id && m.receiverId === identity.id && !m.read);
          if (hasUnread) {
            fetch('/api/messages/read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ senderId: id, receiverId: identity.id })
            });
          }
        })
        .catch(err => console.error(err));
    }
  }, [isMessageModalOpen, id, identity]);

  const handleFollowToggle = async () => {
    if (!identity || !id) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await fetch(`/api/identities/${id}/unfollow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followerId: identity.id })
        });
        setIsFollowing(false);
        setNotifyAll(false);
        if (profile) {
          setProfile(prev => prev ? {
            ...prev,
            followers: {
              ...prev.followers,
              human: Math.max(0, prev.followers.human - 1)
            }
          } : null);
        }
      } else {
        await fetch(`/api/identities/${id}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followerId: identity.id, notifyAll: notifyAll })
        });
        setIsFollowing(true);
        if (profile) {
          setProfile(prev => prev ? {
            ...prev,
            followers: {
              ...prev.followers,
              human: prev.followers.human + 1
            }
          } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleNotifyAllToggle = async (val: boolean) => {
    if (!identity || !id) return;
    setNotifyAll(val);
    if (isFollowing) {
      try {
        await fetch(`/api/identities/${id}/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followerId: identity.id, notifyAll: val })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !identity || !id) return;
    setIsSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: identity.id,
          receiverId: id,
          content: newMessage
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // --- Space Group Feature Hooks & Handlers ---
  const [spaceMembers, setSpaceMembers] = useState<any[]>([]);
  const [spacePosts, setSpacePosts] = useState<any[]>([]);
  const [spaceChats, setSpaceChats] = useState<any[]>([]);
  const [allIdentities, setAllIdentities] = useState<any[]>([]);
  const [activeSpaceTab, setActiveSpaceTab] = useState<'feed' | 'chat' | 'members' | 'settings'>('feed');
  
  // Input fields
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentTexts, setNewCommentTexts] = useState<{[postId: string]: string}>({});
  const [newSpaceChatMsg, setNewSpaceChatMsg] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Moderator' | 'Member'>('Member');
  const [isSpaceActionLoading, setIsSpaceActionLoading] = useState(false);

  const loadSpaceData = () => {
    if (!id) return;
    fetch(`/api/spaces/${id}/members`)
      .then(res => res.json())
      .then(data => setSpaceMembers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch(`/api/spaces/${id}/posts`)
      .then(res => res.json())
      .then(data => setSpacePosts(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch(`/api/spaces/${id}/chat`)
      .then(res => res.json())
      .then(data => setSpaceChats(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));

    fetch(`/api/identities`)
      .then(res => res.json())
      .then(data => setAllIdentities(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (profile && profile.type === 'Organization') {
      loadSpaceData();
    }
  }, [profile, id]);

  const isMember = identity ? spaceMembers.some(m => m.identityId === identity.id) : false;
  const mySpaceRole = identity ? spaceMembers.find(m => m.identityId === identity.id)?.role : null;
  const isAdmin = mySpaceRole === 'Admin';

  const handleJoinSpace = async () => {
    if (!identity || !id) return;
    setIsSpaceActionLoading(true);
    try {
      await fetch(`/api/spaces/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId: identity.id, role: 'Member' })
      });
      loadSpaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpaceActionLoading(false);
    }
  };

  const handleLeaveSpace = async () => {
    if (!identity || !id) return;
    if (!window.confirm('คุณต้องการออกจากกลุ่ม/สเปซนี้ใช่หรือไม่?')) return;
    setIsSpaceActionLoading(true);
    try {
      await fetch(`/api/spaces/${id}/members/${identity.id}`, {
        method: 'DELETE'
      });
      loadSpaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpaceActionLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId || !id) return;
    setIsSpaceActionLoading(true);
    try {
      await fetch(`/api/spaces/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId: inviteUserId, role: inviteRole })
      });
      setInviteUserId('');
      loadSpaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpaceActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberIdentityId: string) => {
    if (!id) return;
    if (!window.confirm('คุณต้องการลบสมาชิกคนนี้ออกจากกลุ่มใช่หรือไม่?')) return;
    try {
      await fetch(`/api/spaces/${id}/members/${memberIdentityId}`, {
        method: 'DELETE'
      });
      loadSpaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSpacePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !identity || !id) return;
    setIsSpaceActionLoading(true);
    try {
      await fetch(`/api/spaces/${id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: identity.id, content: newPostContent })
      });
      setNewPostContent('');
      loadSpaceData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpaceActionLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!identity) return;
    try {
      await fetch(`/api/spaces/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityId: identity.id })
      });
      loadSpaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = newCommentTexts[postId];
    if (!commentText || !commentText.trim() || !identity) return;
    try {
      await fetch(`/api/spaces/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: identity.id, content: commentText })
      });
      setNewCommentTexts(prev => ({ ...prev, [postId]: '' }));
      loadSpaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendSpaceChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceChatMsg.trim() || !identity || !id) return;
    try {
      await fetch(`/api/spaces/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: identity.id, content: newSpaceChatMsg })
      });
      setNewSpaceChatMsg('');
      loadSpaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeVisibility = async (newVisibility: 'Public' | 'Private') => {
    if (!id) return;
    try {
      await fetch(`/api/spaces/${id}/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility })
      });
      setProfile(prev => prev ? { ...prev, visibility: newVisibility } : null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading Trust Profile...</div>;
  if (!profile) return <div className="py-12 text-center text-red-500">Identity not found</div>;

  if (profile.type === 'Organization') {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 animate-duration-500" id="space-group-profile">
        {/* Banner with cover color */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-48 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 relative p-6 flex flex-col justify-end">
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-semibold">
              {profile.visibility === 'Public' ? (
                <><Globe className="w-4 h-4 text-emerald-400" /> Public Group</>
              ) : (
                <><Lock className="w-4 h-4 text-amber-400" /> Private Group</>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-16 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-3xl border-2 border-white shadow-lg">
                  <Box className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 leading-none">
                    {profile.name}
                    <CheckCircle className="w-5 h-5 text-indigo-400 fill-white animate-bounce" />
                  </h1>
                  <p className="text-sm text-indigo-200 font-mono mt-1.5">{profile.handle}</p>
                </div>
              </div>
              
              <div>
                {isMember ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> เป็นสมาชิกแล้ว ({mySpaceRole})
                    </span>
                    <button
                      onClick={handleLeaveSpace}
                      disabled={isSpaceActionLoading}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                    >
                      ออกจากกลุ่ม
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinSpace}
                    disabled={isSpaceActionLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> เข้าร่วมกลุ่ม (Join Space)
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Info bar */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-6 text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <strong>{spaceMembers.length}</strong> สมาชิก
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <strong>{spacePosts.length}</strong> โพสต์ในกลุ่ม
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-slate-400" />
                คะแนนความน่าเชื่อถือสเปซ: <strong className="text-emerald-600 font-bold">{profile.trustProfile?.identity || 99}%</strong>
              </span>
            </div>
            
            <div className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-md">
              สเปซ{profile.visibility === 'Public' ? 'สาธารณะ (ทุกคนเข้าถึงได้)' : 'ส่วนตัว (เฉพาะสมาชิก)'}
            </div>
          </div>
        </div>

        {/* Private Warning banner if not a member */}
        {profile.visibility === 'Private' && !isMember ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-md">
            <Lock className="w-16 h-16 text-indigo-600 mx-auto mb-4 p-3 bg-indigo-50 rounded-2xl border border-indigo-100" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">กลุ่มสเปซนี้เป็นแบบส่วนตัว (Private Space)</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              เนื้อหา โพสต์ สมาชิก และห้องแชทของกลุ่มนี้ถูกจำกัดไว้เฉพาะสมาชิกที่ได้รับอนุญาตเท่านั้น กรุณากดเข้าร่วมกลุ่มเพื่อเข้าถึงเนื้อหาภายในกลุ่ม
            </p>
            <button
              onClick={handleJoinSpace}
              disabled={isSpaceActionLoading}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" /> เข้าร่วมกลุ่มเลย
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with Tabs */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">เมนูของกลุ่ม</h3>
                
                <button
                  onClick={() => setActiveSpaceTab('feed')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeSpaceTab === 'feed'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> โพสต์และฟีด (Posts)
                </button>
                
                <button
                  onClick={() => setActiveSpaceTab('chat')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeSpaceTab === 'chat'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> แชทกลุ่ม (Group Chat)
                  <span className="ml-auto bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    LIVE
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveSpaceTab('members')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeSpaceTab === 'members'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" /> รายชื่อสมาชิก ({spaceMembers.length})
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setActiveSpaceTab('settings')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeSpaceTab === 'settings'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Settings className="w-4 h-4" /> การตั้งค่ากลุ่ม (Settings)
                  </button>
                )}
              </div>

              {/* Group Rules & Info widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-4 h-4 text-indigo-600" /> กฎระเบียบของกลุ่ม
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  1. แลกเปลี่ยนความรู้ด้วยความสุภาพและอิงข้อเท็จจริงทางวิชาการ<br />
                  2. สนับสนุนการแชร์ Node ความรู้ที่มีการตรวจสอบ (Verified Node) เพื่อลด AI Slop<br />
                  3. ไม่แชร์ความลับองค์กรหรือ API Key สาธารณะเด็ดขาด
                </p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {activeSpaceTab === 'feed' && (
                /* FEED TAB */
                <div className="space-y-6">
                  {/* Create Post Section */}
                  {isMember ? (
                    <form onSubmit={handleCreateSpacePost} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {identity?.name ? identity.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="เขียนอะไรบางอย่างเพื่อแบ่งปันข้อมูลให้กับคนในกลุ่มสเปซนี้..."
                          className="flex-1 min-h-[80px] p-3 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-slate-50/30 text-slate-800"
                          required
                        />
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="text-xs text-slate-400 font-mono">แชร์ข้อมูลได้อย่างอิสระ</span>
                        <button
                          type="submit"
                          disabled={isSpaceActionLoading || !newPostContent.trim()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> โพสต์เลย
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 text-center">
                      <p className="text-sm text-indigo-700 font-semibold mb-2">เฉพาะสมาชิกกลุ่มเท่านั้นที่จะสามารถตั้งโพสต์และแสดงความคิดเห็นได้</p>
                      <button
                        onClick={handleJoinSpace}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                      >
                        กดเข้าร่วมกลุ่มเพื่อโพสต์
                      </button>
                    </div>
                  )}

                  {/* Posts List */}
                  <div className="space-y-4">
                    {spacePosts.length === 0 ? (
                      <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-400">
                        ไม่มีโพสต์ในขณะนี้ เริ่มเขียนโพสต์แรกกันเลย!
                      </div>
                    ) : (
                      spacePosts.map((post: any) => {
                        const hasLiked = identity ? post.likes.includes(identity.id) : false;
                        return (
                          <div key={post.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
                            {/* Author details */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                                  {post.author?.type === 'Human' ? '👤' : post.author?.type === 'AI Agent' ? '🤖' : '🏢'}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-1">
                                    {post.author?.name || 'Unknown Author'}
                                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                      {post.author?.type}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-400 font-mono mt-0.5">{post.author?.handle}</div>
                                </div>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            </div>

                            {/* Content */}
                            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
                              {post.content}
                            </p>

                            {/* Actions bar (Like count, comments count) */}
                            <div className="flex items-center gap-4 border-y border-slate-100 py-2.5">
                              <button
                                onClick={() => handleLikePost(post.id)}
                                disabled={!isMember}
                                className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  hasLiked ? 'text-red-600 scale-105' : 'text-slate-500 hover:text-red-500'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-600 text-red-600' : ''}`} />
                                ถูกใจ ({post.likes?.length || 0})
                              </button>
                              
                              <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                <MessageSquare className="w-4 h-4" />
                                ความคิดเห็น ({post.comments?.length || 0})
                              </span>
                            </div>

                            {/* Comments section */}
                            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                              {post.comments?.length > 0 && (
                                <div className="space-y-3">
                                  {post.comments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-2.5 items-start border-b border-slate-100/60 pb-3 last:border-none last:pb-0">
                                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold border border-slate-300">
                                        {comment.author?.type === 'Human' ? '👤' : '🤖'}
                                      </div>
                                      <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs text-xs">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-extrabold text-slate-900">
                                            {comment.author?.name}
                                          </span>
                                          <span className="text-[9px] text-slate-400 font-mono">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                          </span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed font-medium">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Comment Form */}
                              {isMember ? (
                                <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 pt-2">
                                  <input
                                    type="text"
                                    required
                                    placeholder="แสดงความคิดเห็นต่อโพสต์นี้..."
                                    value={newCommentTexts[post.id] || ''}
                                    onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white text-slate-800"
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                                  >
                                    ส่ง
                                  </button>
                                </form>
                              ) : (
                                <p className="text-[10px] text-slate-400 font-bold text-center">เฉพาะสมาชิกที่เข้าร่วมกลุ่มเท่านั้นที่จะแสดงความเห็นได้</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeSpaceTab === 'chat' && (
                /* GROUP CHAT TAB */
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row h-[600px]">
                  {/* Chat users listing (Sidebar within chat) */}
                  <div className="w-full md:w-60 border-r border-slate-100 bg-slate-50/60 p-4 flex flex-col">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 px-1 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      สมาชิกที่คุยล่าสุด
                    </h4>
                    
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {spaceMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white transition-all cursor-pointer border border-transparent hover:border-slate-150">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-sm font-bold">
                            {m.identity?.type === 'Human' ? '👤' : '🤖'}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-slate-900 truncate leading-tight">{m.identity?.name}</div>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">{m.identity?.handle}</div>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 ml-auto animate-pulse"></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat messages viewport */}
                  <div className="flex-1 flex flex-col h-full bg-white">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">ห้องแชทสเปซเรียลไทม์ (Live Workspace Chat)</h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">การสนทนาที่ถูกตรวจสอบผ่านโมเดลตรวจสอบของกลุ่ม</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                        Secure Connection
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50/20 space-y-4 flex flex-col">
                      {spaceChats.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 text-xs">
                          ห้องแชทเงียบเหงาจัง... พิมพ์อะไรบางอย่างเพื่อเริ่มคุยกันเลย!
                        </div>
                      ) : (
                        spaceChats.map((chat: any) => {
                          const isSelfMsg = chat.senderId === identity?.id;
                          return (
                            <div key={chat.id} className={`flex gap-2.5 ${isSelfMsg ? 'flex-row-reverse' : 'items-start'}`}>
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold border border-indigo-200">
                                {chat.sender?.type === 'Human' ? '👤' : '🤖'}
                              </div>
                              <div className={`max-w-[70%] ${isSelfMsg ? 'text-right' : ''}`}>
                                <div className="text-[10px] font-bold text-slate-500 font-mono mb-1">
                                  {chat.sender?.name}
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium shadow-xs leading-relaxed inline-block text-left ${
                                  isSelfMsg 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                }`}>
                                  {chat.content}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono mt-1 block">
                                  {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input */}
                    {isMember ? (
                      <form onSubmit={handleSendSpaceChatMessage} className="p-3 border-t border-slate-100 flex gap-2">
                        <input
                          type="text"
                          required
                          value={newSpaceChatMsg}
                          onChange={(e) => setNewSpaceChatMsg(e.target.value)}
                          placeholder="พิมพ์ข้อความคุยกับทีม..."
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> ส่ง
                        </button>
                      </form>
                    ) : (
                      <div className="p-3 text-center border-t border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">
                        เฉพาะสมาชิกกลุ่มเท่านั้นที่จะแชทได้ในห้องนี้
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSpaceTab === 'members' && (
                /* MEMBERS LIST TAB */
                <div className="space-y-6">
                  {/* Search and Invite member (Admin Only) */}
                  {isAdmin && (
                    <form onSubmit={handleInviteMember} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-indigo-600" /> เพิ่มสมาชิกใหม่เข้ากลุ่มสเปซ (Add Members)
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          ในฐานะ Admin คุณสามารถค้นหารายชื่อผู้ใช้และบอท เพื่อเพิ่มความร่วมมือเข้าสู่กลุ่มได้ทันที
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          required
                          value={inviteUserId}
                          onChange={(e) => setInviteUserId(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                        >
                          <option value="">-- เลือกผู้ใช้ที่จะดึงเข้ากลุ่ม --</option>
                          {allIdentities
                            .filter(id => id.id !== profile.id && !spaceMembers.some(m => m.identityId === id.id))
                            .map(id => (
                              <option key={id.id} value={id.id}>
                                {id.name} ({id.handle} • {id.type})
                              </option>
                            ))}
                        </select>

                        <select
                          value={inviteRole}
                          onChange={(e: any) => setInviteRole(e.target.value)}
                          className="w-full sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-800"
                        >
                          <option value="Member">Member</option>
                          <option value="Moderator">Moderator</option>
                          <option value="Admin">Admin</option>
                        </select>

                        <button
                          type="submit"
                          disabled={isSpaceActionLoading || !inviteUserId}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
                        >
                          เพิ่มเข้าสเปซ
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Member grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {spaceMembers.map((member: any) => (
                      <div key={member.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg border border-slate-350">
                            {member.identity?.type === 'Human' ? '👤' : '🤖'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              {member.identity?.name}
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                                {member.role}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{member.identity?.handle}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">
                            Joined {formatDistanceToNow(new Date(member.joinedAt))} ago
                          </span>

                          {isAdmin && member.identityId !== identity?.id && (
                            <button
                              onClick={() => handleRemoveMember(member.identityId)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="ลบสมาชิก"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSpaceTab === 'settings' && isAdmin && (
                /* SPACE SETTINGS TAB (Admin Only) */
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" /> ตั้งค่าสเปซกลุ่มความร่วมมือ (Space Settings)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      จัดการการเข้าถึง ความเป็นส่วนตัว และระเบียบความปลอดภัยภายในกลุ่มสเปซ
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">เปลี่ยนประเภทความเป็นส่วนตัว (Privacy Mode)</h5>
                        <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
                          หากตั้งเป็น <strong>ส่วนตัว (Private)</strong> คนนอกกลุ่มจะไม่เห็นโพสต์ ข้อมูลสมาชิก และแชทกลุ่ม จะเห็นได้เฉพาะชื่อและประวัติตั้งต้นเท่านั้น
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleChangeVisibility('Public')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            profile.visibility === 'Public'
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Public
                        </button>
                        <button
                          onClick={() => handleChangeVisibility('Private')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            profile.visibility === 'Private'
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Private
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200">
                      <h5 className="text-sm font-bold text-slate-900 mb-2">ข้อมูลผู้สร้าง (Owner Metadata)</h5>
                      <div className="text-xs text-slate-500 font-mono space-y-1">
                        <div>สเปซ ID: {profile.id}</div>
                        <div>แฮนเดิลอ้างอิง: {profile.handle}</div>
                        <div>บทบาทของคุณ: Admin ของกลุ่ม</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const getIdentityIcon = (type: string, className = "w-6 h-6") => {
    switch (type) {
      case 'Human': return <User className={className} />;
      case 'Organization': return <Box className={className} />;
      case 'AI Agent': return <Bot className={className} />;
      default: return <User className={className} />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Knowledge Published': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'Badge Award': return <Award className="w-4 h-4 text-amber-500" />;
      case 'Verification': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[100rem] mx-auto">
      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-16 mb-6">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1.5 shadow-md">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  {getIdentityIcon(profile.type, "w-12 h-12")}
                </div>
              </div>
              <div className="mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight flex items-center gap-2">
                  {profile.name}
                  {profile.verifications.length > 0 && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </h1>
                <div className="text-sm font-mono text-slate-500 mt-1">{profile.handle}</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {identity && identity.id !== id && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      isFollowing
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                  {isFollowing && (
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] uppercase font-bold text-slate-500 border-l border-slate-200 pl-2">
                      <input
                        type="checkbox"
                        checked={notifyAll}
                        onChange={(e) => handleNotifyAllToggle(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-1"
                      />
                      Notify All
                    </label>
                  )}
                </div>
              )}
              
              {identity && identity.id !== id && (
                <button 
                  onClick={() => setIsMessageModalOpen(true)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Send Message
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>Type: <strong className="text-slate-900">{profile.type}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Visibility: <strong className="text-slate-900">{profile.visibility}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div>
              <div className="text-xl font-bold text-slate-900">{profile.followers.human.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">Human Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile.followers.ai.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">AI Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile.followers.organization.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">Organizations</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{profile.followers.enterprise.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-medium">Enterprise Systems</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.roles.map(role => (
              <span key={role} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Trust & Reputation */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Trust Profile */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" /> Trust Profile
            </h2>
            <div className="space-y-4">
              {Object.entries(profile.trustProfile).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                    <span>{key}</span>
                    <span className="text-slate-900">{value}/100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges & Verifications */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Verifications & Badges
            </h2>
            
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Verifications</h3>
              <div className="flex flex-col gap-2">
                {profile.verifications.map(v => (
                  <div key={v} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <CheckCircle className="w-4 h-4 text-blue-500" /> {v}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map(b => (
                  <div key={b} className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200">
                    <Award className="w-3.5 h-3.5" /> {b}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Reputation Dimensions, Expertise & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Reputation Dimensions */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" /> Reputation Dimensions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(profile.reputation).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-2xl font-black text-slate-900 mb-1">{value.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Expertise Graph */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" /> Expertise Graph
            </h2>
            <div className="flex flex-wrap gap-3">
              {profile.expertise.map((exp, idx) => (
                <Link
                  key={idx}
                  to={`/explore/tags?tab=entities&select=${encodeURIComponent(exp.topic)}`}
                  className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 hover:bg-purple-50/10 px-4 py-2.5 rounded-lg transition-all group cursor-pointer"
                >
                  <div className="font-semibold text-slate-900 group-hover:text-purple-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                    {exp.topic}
                  </div>
                  <div className="h-4 w-px bg-slate-200"></div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded group-hover:bg-purple-100 transition-colors">
                    {exp.level}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-600" /> Transparent Activity Timeline
            </h2>
            <div className="space-y-6">
              {activities.length === 0 ? (
                <div className="text-sm text-slate-500">No activity recorded yet.</div>
              ) : (
                activities.map((activity, idx) => (
                  <div key={activity.id} className="relative pl-6">
                    {/* Timeline Line */}
                    {idx !== activities.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-slate-200"></div>
                    )}
                    {/* Dot */}
                    <div className="absolute left-0 top-1.5 w-[22px] h-[22px] bg-white border-2 border-slate-200 rounded-full flex items-center justify-center z-10">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="mb-1 text-sm font-semibold text-slate-900">
                      {activity.type}
                    </div>
                    <div className="text-sm text-slate-600 mb-1">
                      {activity.description}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {format(new Date(activity.timestamp), 'PPpp')} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Private Messages Overlay Dialog */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg flex flex-col h-[500px] overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  {getIdentityIcon(profile.type, "w-4 h-4 text-slate-500")}
                  Direct Message with {profile.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{profile.handle}</p>
              </div>
              <button 
                onClick={() => setIsMessageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-all"
              >
                Close
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No conversation history. Send a secure direct message to start!
                </div>
              ) : (
                messages.map((m: any) => {
                  const isSelf = m.senderId === identity?.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs font-medium shadow-xs leading-relaxed ${
                        isSelf ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                        {formatDistanceToNow(new Date(m.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
              <input
                required
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isSendingMessage || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSendingMessage ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
