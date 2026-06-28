import { useState, useEffect } from 'react';
import { TrendingGuide, Identity } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Award, 
  ExternalLink, 
  ThumbsUp, 
  Search, 
  Plus, 
  Folder, 
  Tag, 
  Cpu, 
  BookOpen, 
  Clock, 
  Eye, 
  Sparkles, 
  User,
  Check,
  AlertCircle
} from 'lucide-react';
import LinkPreviewBox from './LinkPreviewBox';

interface TrendingArenaProps {
  identity: Identity | null;
}

export default function TrendingArena({ identity }: TrendingArenaProps) {
  const { t } = useLanguage();
  const [guides, setGuides] = useState<TrendingGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Hardware' | 'Software' | 'AI' | 'Systems'>('All');
  
  // Create guide modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'Hardware' | 'Software' | 'AI' | 'Systems'>('Software');
  const [newTagsString, setNewTagsString] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchGuides = () => {
    fetch('/api/trending-guides')
      .then(res => res.json())
      .then(data => {
        setGuides(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching trending guides:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleUpvote = (guideId: string) => {
    if (!identity) {
      alert('กรุณาเลือกประวัติประจำตัว (Identity) ก่อนทำการโหวต');
      return;
    }

    fetch(`/api/trending-guides/${guideId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identityId: identity.id })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to upvote');
        return res.json();
      })
      .then(() => {
        // Optimistically update or re-fetch
        fetchGuides();
      })
      .catch(err => console.error('Error upvoting:', err));
  };

  const handleCreateGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      setSubmitError('กรุณาเลือกประวัติประจำตัว (Identity) เพื่อส่งข้อมูล');
      return;
    }
    if (!newTitle.trim() || !newUrl.trim() || !newDescription.trim()) {
      setSubmitError('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      url: newUrl.trim(),
      category: newCategory,
      authorId: identity.id,
      tags: newTagsString.split(',').map(t => t.trim()).filter(Boolean)
    };

    fetch('/api/trending-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Failed to submit') });
        return res.json();
      })
      .then(() => {
        setNewTitle('');
        setNewDescription('');
        setNewUrl('');
        setNewCategory('Software');
        setNewTagsString('');
        setShowCreateModal(false);
        fetchGuides();
      })
      .catch(err => {
        console.error('Error creating resource:', err);
        setSubmitError(err.message || 'เกิดข้อผิดพลาดในการสร้างแหล่งข้อมูล');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Filter guides
  const filteredGuides = guides.filter(guide => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = guide.title.toLowerCase().includes(query) || 
                       guide.description.toLowerCase().includes(query) ||
                       guide.tags.some(t => t.toLowerCase().includes(query));
    
    const matchCategory = selectedCategory === 'All' || guide.category === selectedCategory;

    return matchQuery && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
        <p className="text-sm font-medium">Loading trending guides & resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-500/10">
        <div className="absolute top-0 right-0 p-8 text-indigo-400/10 pointer-events-none">
          <BookOpen className="w-48 h-48 transform rotate-12" />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-bold text-blue-300">
            <Sparkles className="w-3 h-3 animate-pulse" /> Trending Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t('trending.title')}</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t('trending.desc')}
          </p>
        </div>
      </div>

      {/* Control Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('trending.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {(['All', 'Hardware', 'Software', 'AI', 'Systems'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'All' ? 'All' : cat}
            </button>
          ))}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto sm:ml-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('trending.suggestBtn')}</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGuides.map(guide => {
            const hasUpvoted = identity ? guide.upvoters.includes(identity.id) : false;
            return (
              <div 
                key={guide.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-350 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      guide.category === 'Hardware' 
                        ? 'bg-amber-50 text-amber-700 border-amber-150' 
                        : guide.category === 'Software'
                        ? 'bg-blue-50 text-blue-700 border-blue-150'
                        : guide.category === 'AI'
                        ? 'bg-purple-50 text-purple-700 border-purple-150'
                        : 'bg-slate-50 text-slate-700 border-slate-150'
                    }`}>
                      <Folder className="w-2.5 h-2.5" /> {guide.category}
                    </span>
                    
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(guide.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
                      {guide.description}
                    </p>
                  </div>

                  {/* High-Fidelity Interactive Preview Card */}
                  <div className="pt-2">
                    <LinkPreviewBox url={guide.url} />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {guide.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3.5">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-300" />
                    <span>Suggested by: <span className="font-bold text-slate-700">{guide.authorName}</span></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-semibold flex items-center gap-1 mr-1">
                      <Eye className="w-3.5 h-3.5" /> {guide.views.toLocaleString()} Views
                    </span>

                    <button
                      onClick={() => handleUpvote(guide.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border cursor-pointer ${
                        hasUpvoted
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{guide.upvotes} Votes</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-900 font-bold">No trending resources found.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try search terms, or suggest the first useful guide for the community!
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-xs transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Suggest Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>{t('trending.suggestTitle')}</span>
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGuide} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-lg text-xs font-semibold text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ชื่อหัวข้อ (Title) *
                </label>
                <input
                  type="text"
                  placeholder="เช่น ย่อลึกแนวทาง I2C Hardware Debugging ในปี 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    หมวดหมู่ (Category)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Hardware">Hardware (สายฮาร์ดแวร์)</option>
                    <option value="Software">Software (สายซอฟต์แวร์)</option>
                    <option value="AI">AI (สาย AI/โมเดล)</option>
                    <option value="Systems">Systems (สถาปัตยกรรมระบบ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    แท็ก (Tags) - คั่นด้วยจุลภาค
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น logic, esp32, analyzer"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ลิงก์ URL ปลายทาง (Resource Link) *
                </label>
                <input
                  type="url"
                  placeholder="เช่น https://react.dev หรือ https://espressif.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs font-mono text-xs text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  คำอธิบายกระชับ (Description) *
                </label>
                <textarea
                  placeholder="อธิบายว่าบทความหรือไกด์แนะนำนี้เป็นประโยชน์อย่างไร..."
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="border-t border-slate-150 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                >
                  {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งแหล่งเรียนรู้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
