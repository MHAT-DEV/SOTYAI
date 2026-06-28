import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Shield, Clock, Users, Bell, BellOff, Trash2, User, Box, Bot } from 'lucide-react';
import { KnowledgeObject, Identity } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState<'authors' | 'knowledge'>('authors');
  const [bookmarkedKnowledge, setBookmarkedKnowledge] = useState<KnowledgeObject[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<(Identity & { notifyAll: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  const followerId = 'id_human_1'; // Active mock user Alice

  const loadData = async () => {
    try {
      const [knowRes, authRes] = await Promise.all([
        fetch('/api/accounts/acc_1/subscriptions'),
        fetch(`/api/identities/followed/${followerId}`)
      ]);
      const knowData = await knowRes.json();
      const authData = await authRes.json();

      setBookmarkedKnowledge(knowData);
      setFollowedAuthors(authData);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnfollowAuthor = async (authorId: string) => {
    try {
      await fetch(`/api/identities/${authorId}/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId })
      });
      // Refresh list
      setFollowedAuthors(prev => prev.filter(a => a.id !== authorId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotification = async (authorId: string, currentVal: boolean) => {
    try {
      await fetch(`/api/identities/${authorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId, notifyAll: !currentVal })
      });
      setFollowedAuthors(prev => prev.map(a => a.id === authorId ? { ...a, notifyAll: !currentVal } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const getIdentityIcon = (type: string) => {
    switch (type) {
      case 'Human': return <User className="w-5 h-5 text-blue-600" />;
      case 'Organization': return <Box className="w-5 h-5 text-purple-600" />;
      case 'AI Agent': return <Bot className="w-5 h-5 text-emerald-600" />;
      default: return <User className="w-5 h-5 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 animate-pulse">
        <Bookmark className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" />
        Loading your subscriptions...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300" id="subscriptions-page">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Subscriptions</h1>
          <p className="text-sm text-slate-500">Manage followed creators, agents, and bookmarked knowledge nodes.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('authors')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'authors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="sub-tab-authors"
        >
          <Users className="w-4 h-4" /> Followed Authors ({followedAuthors.length})
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'knowledge'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="sub-tab-knowledge"
        >
          <Bookmark className="w-4 h-4" /> Bookmarked Knowledge ({bookmarkedKnowledge.length})
        </button>
      </div>

      {activeTab === 'authors' ? (
        /* Followed Authors Panel */
        followedAuthors.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Followed Creators</h3>
            <p className="text-sm text-slate-500 mb-4">Start following developers, agents, or organizations to build your feed.</p>
            <Link to="/" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm">
              Discover Creators
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {followedAuthors.map(author => (
              <div key={author.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-xs">
                    {getIdentityIcon(author.type)}
                  </div>
                  <div>
                    <Link to={`/identity/${author.id}`} className="font-extrabold text-slate-900 hover:text-blue-600 text-base flex items-center gap-1.5 leading-tight">
                      {author.name}
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                        {author.type}
                      </span>
                    </Link>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{author.handle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Notification config button */}
                  <button
                    onClick={() => handleToggleNotification(author.id, author.notifyAll)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      author.notifyAll
                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title={author.notifyAll ? 'Mute all post notifications' : 'Enable all post notifications'}
                  >
                    {author.notifyAll ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5 text-slate-400" />}
                    {author.notifyAll ? 'Notify Active' : 'Notify Silenced'}
                  </button>

                  {/* Unfollow button */}
                  <button
                    onClick={() => handleUnfollowAuthor(author.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Unfollow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Bookmarked Knowledge Panel */
        bookmarkedKnowledge.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Bookmarks Yet</h3>
            <p className="text-sm text-slate-500 mb-4">Start bookmarking verified nodes from the knowledge graph feed.</p>
            <Link to="/" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm">
              Browse Knowledge Feed
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedKnowledge.map(ko => (
              <Link key={ko.id} to={`/knowledge/${ko.id}`} className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">{ko.title}</h2>
                  <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">
                    Bookmarked Node
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{ko.problem || ko.context}</p>
                
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                    <Shield className="w-3 h-3" /> Trust: {ko.trustScore.overall}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> Updated {formatDistanceToNow(new Date(ko.updatedAt), { addSuffix: true })}
                  </span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">
                    v{ko.version}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
