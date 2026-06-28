import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight, Shield, Clock, BookOpen, User, Bot, Box, CheckCircle2, Star, Tag, RotateCcw, Save, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';
import { KnowledgeObject, Identity } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    searchFields: string;
    minTrustScore: number;
    authorType: string;
    environment: string;
    minVerifications: number;
    timeRange: string;
    nodeStatus: string;
    sortBy: string;
  };
}

export default function AdvancedSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';

  // Core Search & Filter States
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [filterMode, setFilterMode] = useState<'basic' | 'advanced'>('basic');
  const [searchFields, setSearchFields] = useState<'all' | 'title' | 'problem' | 'solution'>('all');
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [authorType, setAuthorType] = useState<string>('All');
  const [environment, setEnvironment] = useState<string>('All');
  const [minVerifications, setMinVerifications] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<'all' | '24h' | 'week' | 'month'>('all');
  const [nodeStatus, setNodeStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [sortBy, setSortBy] = useState<'trustScore' | 'updatedAt' | 'saves' | 'reads'>('trustScore');

  // Master Data States
  const [knowledge, setKnowledge] = useState<KnowledgeObject[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Saved Searches State
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [newSaveName, setNewSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Load knowledge and identities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [knowRes, idenRes] = await Promise.all([
          fetch('/api/knowledge'),
          fetch('/api/identities')
        ]);
        const knowData = await knowRes.json();
        const idenData = await idenRes.json();
        setKnowledge(knowData);
        setIdentities(idenData);
      } catch (err) {
        console.error('Error fetching search indices:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Load saved searches
    const stored = localStorage.getItem('sotyai_saved_searches');
    if (stored) {
      try {
        setSavedSearches(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update query state if search parameter updates
  useEffect(() => {
    setSearchTerm(qParam);
  }, [qParam]);

  // Handle URL sync
  const updateURLSearch = (term: string) => {
    if (term.trim()) {
      setSearchParams({ q: term });
    } else {
      setSearchParams({});
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchFields('all');
    setMinTrustScore(0);
    setAuthorType('All');
    setEnvironment('All');
    setMinVerifications(0);
    setTimeRange('all');
    setNodeStatus('all');
    setSortBy('trustScore');
    setSearchParams({});
  };

  // Match objects based on filters
  const filteredResults = knowledge.filter(k => {
    // 1. Text Search matching with requirement: active immediately when query length is >= 3 characters
    const query = searchTerm.trim().toLowerCase();
    if (query.length > 0 && query.length < 3) {
      // If user typed 1 or 2 characters, don't execute search matching (unless empty, which lists all with filter)
      return false;
    }

    if (query.length >= 3) {
      let matchesText = false;
      const titleMatch = k.title.toLowerCase().includes(query);
      const problemMatch = (k.problem || '').toLowerCase().includes(query) || (k.context || '').toLowerCase().includes(query);
      const solutionMatch = (k.solution || '').toLowerCase().includes(query);

      if (searchFields === 'title') {
        matchesText = titleMatch;
      } else if (searchFields === 'problem') {
        matchesText = problemMatch;
      } else if (searchFields === 'solution') {
        matchesText = solutionMatch;
      } else {
        matchesText = 
          titleMatch || 
          problemMatch || 
          solutionMatch ||
          k.tags.some(t => t.toLowerCase().includes(query)) ||
          (k.entities || []).some(e => e.toLowerCase().includes(query)) ||
          (k.categories || []).some(c => c.toLowerCase().includes(query));
      }

      if (!matchesText) return false;
    }

    // 2. Minimum Trust Score
    if (k.trustScore.overall < minTrustScore) return false;

    // 3. Author Type Filter
    if (authorType !== 'All') {
      const creator = identities.find(i => i.id === k.authorId);
      const type = creator ? creator.type : 'Human';
      if (type !== authorType) return false;
    }

    // 4. Environment Filter
    if (environment !== 'All') {
      const targetEnv = environment.toLowerCase();
      const matchEnv = 
        (k.evidence || '').toLowerCase().includes(targetEnv) ||
        (k.context || '').toLowerCase().includes(targetEnv) ||
        k.tags.some(t => t.toLowerCase() === targetEnv) ||
        (k.entities || []).some(e => e.toLowerCase() === targetEnv);
      if (!matchEnv) return false;
    }

    // 5. Min Verifications
    const verifyCount = k.verifications?.reduce((sum, v) => sum + v.count, 0) || 0;
    if (verifyCount < minVerifications) return false;

    // 6. Node Status
    if (nodeStatus === 'verified' && k.trustScore.overall < 80) return false;
    if (nodeStatus === 'unverified' && k.trustScore.overall >= 80) return false;

    // 7. Time Range
    if (timeRange !== 'all') {
      const nodeDate = new Date(k.updatedAt).getTime();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (timeRange === '24h' && now - nodeDate > oneDay) return false;
      if (timeRange === 'week' && now - nodeDate > oneDay * 7) return false;
      if (timeRange === 'month' && now - nodeDate > oneDay * 30) return false;
    }

    return true;
  });

  // Sorting
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'trustScore') {
      return b.trustScore.overall - a.trustScore.overall;
    } else if (sortBy === 'updatedAt') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === 'saves') {
      const aSaves = a.consumptionMetrics?.humanSaves || 0;
      const bSaves = b.consumptionMetrics?.humanSaves || 0;
      return bSaves - aSaves;
    } else if (sortBy === 'reads') {
      const aReads = (a.consumptionMetrics?.humanReads || 0) + (a.consumptionMetrics?.aiReads || 0);
      const bReads = (b.consumptionMetrics?.humanReads || 0) + (b.consumptionMetrics?.aiReads || 0);
      return bReads - aReads;
    }
    return 0;
  });

  // Save current search configuration
  const handleSaveSearch = () => {
    if (!newSaveName.trim()) return;
    const newSave: SavedSearch = {
      id: Math.random().toString(36).substring(2, 9),
      name: newSaveName.trim(),
      query: searchTerm,
      filters: {
        searchFields,
        minTrustScore,
        authorType,
        environment,
        minVerifications,
        timeRange,
        nodeStatus,
        sortBy
      }
    };
    const updated = [newSave, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('sotyai_saved_searches', JSON.stringify(updated));
    setNewSaveName('');
    setShowSaveModal(false);
  };

  // Run a saved search configuration
  const handleLoadSavedSearch = (saved: SavedSearch) => {
    setSearchTerm(saved.query);
    setSearchFields(saved.filters.searchFields as any);
    setMinTrustScore(saved.filters.minTrustScore);
    setAuthorType(saved.filters.authorType);
    setEnvironment(saved.filters.environment);
    setMinVerifications(saved.filters.minVerifications);
    setTimeRange(saved.filters.timeRange as any);
    setNodeStatus(saved.filters.nodeStatus as any);
    setSortBy(saved.filters.sortBy as any);
    updateURLSearch(saved.query);
  };

  // Delete saved search configuration
  const handleDeleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('sotyai_saved_searches', JSON.stringify(updated));
  };

  const getIdentityDetails = (authorId: string) => {
    const defaultAuthor = { name: 'Unknown Author', handle: '@unknown', type: 'Human' };
    const creator = identities.find(i => i.id === authorId);
    return creator || defaultAuthor;
  };

  const getIdentityIconElement = (type: string) => {
    switch (type) {
      case 'Human': return <User className="w-3.5 h-3.5 text-blue-500" />;
      case 'Organization': return <Box className="w-3.5 h-3.5 text-amber-500" />;
      case 'AI Agent': return <Bot className="w-3.5 h-3.5 text-purple-500" />;
      default: return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="advanced-search-root">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Search className="w-7 h-7 text-blue-600" />
            ระบบค้นหาขั้นสูง (Advanced Search Dashboard)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ค้นหา ตรวจสอบ และวิเคราะห์ข้อมูลใน SOTYAI Verifiable Knowledge Graph ด้วยระบบตัวกรองคุณภาพสูง
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ล้างตัวกรอง (Reset)
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!searchTerm.trim() && minTrustScore === 0 && environment === 'All'}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all cursor-pointer border border-blue-100 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            บันทึกการค้นหา (Save Search)
          </button>
        </div>
      </div>

      {/* Main Search Controls Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Basic Search Input Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                updateURLSearch(e.target.value);
              }}
              placeholder="พิมพ์คำค้นหาของคุณ เช่น React, Node.js, MCP, machine learning (พิมพ์ 3 ตัวอักษรขึ้นไป)..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-inner"
            />
          </div>
          {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
            <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1 animate-pulse">
              ⚠️ พิมพ์อีกอย่างน้อย {3 - searchTerm.trim().length} ตัวอักษร เพื่อให้ผลการค้นหาทำงานเรียลไทม์
            </p>
          )}
          {searchTerm.trim().length >= 3 && (
            <p className="text-xs text-green-700 mt-2 font-semibold">
              ✓ ค้นหาเรียลไทม์ทำงานแล้ว: พบ {sortedResults.length} ผลลัพธ์ที่ตรงเงื่อนไข
            </p>
          )}
        </div>

        {/* Filters Panel Switcher */}
        <div className="flex border-b border-slate-100 px-5">
          <button
            onClick={() => setFilterMode('basic')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${filterMode === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            ตัวกรองทั่วไป (Basic Filters)
          </button>
          <button
            onClick={() => setFilterMode('advanced')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${filterMode === 'advanced' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
            ตัวกรองระดับสูง (Advanced Filters)
          </button>
        </div>

        {/* Basic Filters Body */}
        {filterMode === 'basic' && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Scope */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">ขอบเขตคำค้นหา (Search Scope)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'ค้นหาทุกฟิลด์' },
                  { value: 'title', label: 'หัวข้อเท่านั้น' },
                  { value: 'problem', label: 'ปัญหา/บริบท' },
                  { value: 'solution', label: 'วิธีการแก้ไข' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSearchFields(opt.value as any)}
                    className={`p-2 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer ${searchFields === opt.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Trust Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">คะแนนความน่าเชื่อถือขั้นต่ำ</label>
                <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{minTrustScore}%</span>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0% (ทั้งหมด)</span>
                  <span>50% (ปานกลาง)</span>
                  <span>80%+ (ยืนยันแล้ว)</span>
                </div>
              </div>
            </div>

            {/* Quick Environment Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">สภาพแวดล้อมด่วน (Quick Environment)</label>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'React 19', 'Node', 'TypeScript', 'MCP'].map(env => (
                  <button
                    key={env}
                    onClick={() => setEnvironment(env)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${environment === env ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters Body */}
        {filterMode === 'advanced' && (
          <div className="p-5 space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Environment Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">เทคโนโลยี / สภาพแวดล้อม</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  <option value="All">ทั้งหมด (All Environments)</option>
                  <option value="React 19">React 19</option>
                  <option value="Node">Node.js</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="MCP">MCP (Model Context Protocol)</option>
                  <option value="Knowledge Graph">Knowledge Graph</option>
                  <option value="AI">AI / Machine Learning</option>
                  <option value="System Design">System Design</option>
                </select>
              </div>

              {/* Creator Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">ประเภทผู้บันทึก (Creator Type)</label>
                <select
                  value={authorType}
                  onChange={(e) => setAuthorType(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  <option value="All">ทั้งหมด (All Identity Types)</option>
                  <option value="Human">มนุษย์ (Human Developer)</option>
                  <option value="AI Agent">บอท AI (Autonomous AI)</option>
                  <option value="Organization">องค์กร (Verified Organization)</option>
                </select>
              </div>

              {/* Verification Threshold */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">การตรวจสอบขั้นต่ำ</label>
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{minVerifications} ครั้ง</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={minVerifications}
                  onChange={(e) => setMinVerifications(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600 pt-1"
                />
              </div>

              {/* Node Verification Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">สถานะการยืนยันโหนด</label>
                <select
                  value={nodeStatus}
                  onChange={(e) => setNodeStatus(e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  <option value="all">ทั้งหมด (All Nodes)</option>
                  <option value="verified">โหนดยืนยันแล้วระดับสูง (Trust Score ≥ 80)</option>
                  <option value="unverified">โหมดร่าง / ยังไม่ได้ยืนยัน (Trust Score &lt; 80)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              {/* Date Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  ช่วงเวลาอัปเดตข้อมูล (Time Range)
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: '24h', label: '24 ชั่วโมง' },
                    { value: 'week', label: '7 วันที่ผ่านมา' },
                    { value: 'month', label: '30 วันล่าสุด' }
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTimeRange(t.value as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${timeRange === t.value ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">จัดเรียงผลลัพธ์การค้นหา (Sort By)</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 text-slate-800"
                >
                  <option value="trustScore">ความเชื่อถือรวมสูงสุด (Highest Trust Score)</option>
                  <option value="updatedAt">อัปเดตล่าสุด (Recently Updated)</option>
                  <option value="saves">บันทึกสะสมสูงสุด (Highest Saves)</option>
                  <option value="reads">ยอดการเปิดอ่านสูงสุด (Most Read Nodes)</option>
                </select>
              </div>

              {/* Min Trust Score in advanced */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">คะแนนความน่าเชื่อถือขั้นต่ำ</label>
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{minTrustScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600 pt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Saved Searches Box */}
      {savedSearches.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <Save className="w-3.5 h-3.5 text-blue-500" />
            การค้นหาที่บันทึกไว้ของคุณ (Your Saved Searches - {savedSearches.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(saved => (
              <div
                key={saved.id}
                onClick={() => handleLoadSavedSearch(saved)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-blue-800 transition-all cursor-pointer shadow-sm"
              >
                <span>{saved.name}</span>
                {saved.query && (
                  <span className="text-[10px] text-slate-400 italic font-normal">"{saved.query}"</span>
                )}
                <button
                  onClick={(e) => handleDeleteSavedSearch(saved.id, e)}
                  className="p-0.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200/50 transition-colors"
                  title="Delete saved search"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-400" />
          ผลลัพธ์การค้นหาโหนด SOTYAI ({sortedResults.length})
        </h2>
        {searchTerm.trim().length > 0 && sortedResults.length !== knowledge.length && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
            แสดงผลกรองจากข้อมูลทั้งหมด {knowledge.length} Nodes
          </span>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">กำลังสืบค้นสารสนเทศของเครือข่าย...</p>
        </div>
      ) : sortedResults.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-16 text-center space-y-4">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">ไม่พบข้อมูลโหนดที่ต้องการค้นหา</h3>
            <p className="text-sm text-slate-500">
              {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 
                ? 'โปรดป้อนคำค้นหาอย่างน้อย 3 ตัวอักษร เพื่อเริ่มการค้นหาทันที' 
                : 'ไม่มีข้อมูลโหนดความรู้ใดที่สอดคล้องกับคำค้นหาหรือตัวกรองปัจจุบันของคุณในระบบ'}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
          >
            ล้างตัวกรองและดูทั้งหมด
          </button>
        </div>
      ) : (
        /* SOTYAI Knowledge Node Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedResults.map((ko) => {
            const author = getIdentityDetails(ko.authorId);
            const totalVerifications = ko.verifications?.reduce((sum, v) => sum + v.count, 0) || 0;
            return (
              <Link
                key={ko.id}
                to={`/knowledge/${ko.id}`}
                className="group flex flex-col justify-between bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    {/* Authorship Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        {getIdentityIconElement(author.type)}
                      </div>
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]">{author.name}</span>
                      <span className="text-[10px] text-slate-400">{author.handle}</span>
                    </div>

                    {/* Trust Gauge Badge */}
                    <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                      ko.trustScore.overall >= 80 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : ko.trustScore.overall >= 50 
                          ? 'bg-amber-50 border-amber-200 text-amber-700' 
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      <Shield className="w-3.5 h-3.5" />
                      <span>Trust: {ko.trustScore.overall}%</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm md:text-base">
                    {ko.title}
                  </h3>

                  {/* Context Problem Extract */}
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-600 block mb-0.5">CONTEXT / PROBLEM:</span>
                    {ko.problem || ko.context}
                  </p>

                  {/* Tags and entities array */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ko.categories?.map(cat => (
                      <span key={cat} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                    {ko.entities?.map(ent => (
                      <span key={ent} className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5 text-purple-500" />
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Statistics */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Verifications count">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <strong>{totalVerifications}</strong> ตรวจสอบ
                    </span>
                    <span className="flex items-center gap-1" title="Human saves">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <strong>{ko.consumptionMetrics?.humanSaves || 0}</strong> บันทึก
                    </span>
                    <span className="flex items-center gap-1" title="Total reads">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{(ko.consumptionMetrics?.humanReads || 0) + (ko.consumptionMetrics?.aiReads || 0)}</strong> อ่าน
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDistanceToNow(new Date(ko.updatedAt))} ago
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-base">บันทึกตัวกรองการสืบค้นข้อมูล</h3>
              <p className="text-xs text-slate-500 mt-1">ตั้งชื่อตัวกรองการสืบค้นนี้ เพื่อเรียกใช้งานอย่างรวดเร็วได้ในอนาคต</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ชื่อการค้นหาความชอบ (Search Query Name)</label>
                <input
                  type="text"
                  value={newSaveName}
                  onChange={(e) => setNewSaveName(e.target.value)}
                  placeholder="เช่น โหนด React 19 ความน่าเชื่อถือสูง..."
                  className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100">
                <div><strong>คำสืบค้น:</strong> {searchTerm || '(ไม่มีคำสืบค้น)'}</div>
                <div><strong>คะแนนขั้นต่ำ:</strong> {minTrustScore}%</div>
                <div><strong>สภาพแวดล้อม:</strong> {environment}</div>
                <div><strong>ประเภทผู้เขียน:</strong> {authorType}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => {
                  setNewSaveName('');
                  setShowSaveModal(false);
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!newSaveName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                ยืนยันการบันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
