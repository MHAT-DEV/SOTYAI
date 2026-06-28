import { useState, useEffect } from 'react';
import { KnowledgeObject, Identity } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Cpu, 
  Code, 
  Search, 
  Plus, 
  Layers, 
  TrendingUp, 
  Settings, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  HardDrive, 
  Terminal, 
  ChevronRight,
  BookOpen,
  ArrowRight,
  Eye,
  Bookmark,
  Share2,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TechDomainsProps {
  identity: Identity | null;
  onSelectKnowledgeObject?: (id: string) => void;
}

export default function TechDomains({ identity, onSelectKnowledgeObject }: TechDomainsProps) {
  const { t } = useLanguage();
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'both' | 'hardware' | 'software'>('both');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalDomain, setModalDomain] = useState<'Hardware' | 'Software'>('Hardware');
  const [newTitle, setNewTitle] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newTagsString, setNewTagsString] = useState('');
  const [newCategoryString, setNewCategoryString] = useState('');

  const fetchKnowledge = () => {
    fetch('/api/knowledge')
      .then(res => res.json())
      .then(data => {
        setKnowledgeList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching domain knowledge:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleCreateKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      alert('กรุณาเลือกประวัติประจำตัว (Identity) ก่อนสร้างบทความความรู้');
      return;
    }
    if (!newTitle.trim() || !newSolution.trim()) {
      alert('กรุณากรอกชื่อเรื่องและวิธีแก้ไขปัญหาให้เรียบร้อย');
      return;
    }

    const tags = newTagsString.split(',').map(t => t.trim()).filter(Boolean);
    if (!tags.includes(modalDomain)) {
      tags.unshift(modalDomain);
    }

    const payload = {
      title: newTitle.trim(),
      problem: newProblem.trim(),
      context: newContext.trim(),
      requirements: newRequirements.trim(),
      solution: newSolution.trim(),
      evidence: newEvidence.trim(),
      authorId: identity.id,
      version: '1.0',
      language: 'English',
      tags,
      categories: newCategoryString.split(',').map(c => c.trim()).filter(Boolean),
      entities: [modalDomain],
      references: ['https://wikipedia.org']
    };

    fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create knowledge');
        return res.json();
      })
      .then(() => {
        setNewTitle('');
        setNewProblem('');
        setNewContext('');
        setNewRequirements('');
        setNewSolution('');
        setNewEvidence('');
        setNewTagsString('');
        setNewCategoryString('');
        setShowAddModal(false);
        fetchKnowledge();
      })
      .catch(err => {
        console.error('Error creating knowledge object:', err);
        alert('เกิดข้อผิดพลาดในการลงทะเบียนวัตถุความรู้');
      });
  };

  // Helper helper to categorize objects based on tags or properties
  const hwObjects = knowledgeList.filter(k => 
    k.tags.some(tag => tag.toLowerCase() === 'hardware') || 
    k.categories.some(cat => cat.toLowerCase().includes('hardware') || cat.toLowerCase().includes('electronic'))
  );

  const swObjects = knowledgeList.filter(k => 
    k.tags.some(tag => tag.toLowerCase() === 'software') || 
    k.categories.some(cat => cat.toLowerCase().includes('software') || cat.toLowerCase().includes('backend') || cat.toLowerCase().includes('web') || cat.toLowerCase().includes('development'))
  );

  // Filter with query
  const matchesQuery = (k: KnowledgeObject) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return k.title.toLowerCase().includes(q) || 
           k.problem.toLowerCase().includes(q) || 
           k.tags.some(t => t.toLowerCase().includes(q)) ||
           k.categories.some(c => c.toLowerCase().includes(q));
  };

  const filteredHw = hwObjects.filter(matchesQuery);
  const filteredSw = swObjects.filter(matchesQuery);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-amber-600 animate-spin"></div>
        <p className="text-sm font-medium">Sorting Hardware and Software streams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/25 to-blue-950/25 rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-500">
            <Layers className="w-3.5 h-3.5" /> Domain Segregation Engine
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
            {t('domains.title')}
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {t('domains.desc')}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setModalDomain('Hardware');
              setNewTagsString('Hardware, Electronics');
              setNewCategoryString('Hardware Engineering');
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> {t('domains.btnHwAdd')}
          </button>
          
          <button
            onClick={() => {
              setModalDomain('Software');
              setNewTagsString('Software, Backend');
              setNewCategoryString('Software Architecture');
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> {t('domains.btnSwAdd')}
          </button>
        </div>
      </div>

      {/* Domain Navigation & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        {/* Toggle tabs */}
        <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('both')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-extrabold rounded-md cursor-pointer transition-all ${
              activeTab === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('domains.btnBoth')}
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-extrabold rounded-md cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'hardware' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> {t('domains.btnHw')}
          </button>
          <button
            onClick={() => setActiveTab('software')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-extrabold rounded-md cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'software' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> {t('domains.btnSw')}
          </button>
        </div>

        {/* Global Search inside Segregated domain */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('domains.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Bento Grid layout representing segregated labs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Hardware Lab Panel */}
        {(activeTab === 'both' || activeTab === 'hardware') && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 rounded-xl text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                  <Cpu className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider">{t('domains.hwTitle')}</h2>
                  <p className="text-[10px] text-amber-100/80">{t('domains.hwDesc')} ({hwObjects.length} Nodes)</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-amber-800/40 border border-white/20 px-2 py-0.5 rounded">
                HW-LAB
              </span>
            </div>

            {/* Hardware list */}
            <div className="space-y-4">
              {filteredHw.length > 0 ? (
                filteredHw.map(k => (
                  <div 
                    key={k.id}
                    className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-r-xl p-5 hover:border-slate-350 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {k.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5">ID: {k.id}</p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        🛡️ Trust Score: {k.trustScore.overall}%
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50/80 p-3 rounded-lg border border-slate-150 text-xs">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Physical Problem Statement:</p>
                      <p className="text-slate-800 font-medium leading-relaxed">{k.problem}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Constraints / Requirements:</span>
                        <p className="text-slate-600 font-medium truncate mt-0.5">{k.requirements}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Circuit/Firmware Solution:</span>
                        <p className="text-slate-600 font-medium truncate mt-0.5">{k.solution}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                      {k.tags.map(t => (
                        <span key={t} className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Direct Navigate to detail link */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Reads: {k.consumptionMetrics.humanReads}</span>
                        <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Pinouts: {k.consumptionMetrics.aiApiRequests}</span>
                      </div>
                      
                      {onSelectKnowledgeObject ? (
                        <button
                          onClick={() => onSelectKnowledgeObject(k.id)}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Open Lab Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Link
                          to={`/knowledge/${k.id}`}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5"
                        >
                          <span>Open Lab Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-slate-150 rounded-xl">
                  <p className="text-slate-400 font-bold text-xs">No hardware laboratory entries found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Software Lab Panel */}
        {(activeTab === 'both' || activeTab === 'software') && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                  <Code className="w-5 h-5 text-blue-100" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider">{t('domains.swTitle')}</h2>
                  <p className="text-[10px] text-blue-100/80">{t('domains.swDesc')} ({swObjects.length} Nodes)</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-blue-800/40 border border-white/20 px-2 py-0.5 rounded">
                SW-LAB
              </span>
            </div>

            {/* Software list */}
            <div className="space-y-4">
              {filteredSw.length > 0 ? (
                filteredSw.map(k => (
                  <div 
                    key={k.id}
                    className="bg-white border-l-4 border-l-blue-500 border border-slate-200 rounded-r-xl p-5 hover:border-slate-350 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {k.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5">ID: {k.id}</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        🛡️ Trust Score: {k.trustScore.overall}%
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50/80 p-3 rounded-lg border border-slate-150 text-xs">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Architectural Goal / Problem:</p>
                      <p className="text-slate-800 font-medium leading-relaxed">{k.problem}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Reference Tools:</span>
                        <p className="text-slate-600 font-medium truncate mt-0.5">{k.requirements}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Code Solution:</span>
                        <p className="text-slate-600 font-medium truncate mt-0.5">{k.solution}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                      {k.tags.map(t => (
                        <span key={t} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Direct Navigate to detail link */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Reads: {k.consumptionMetrics.humanReads}</span>
                        <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> API Syncs: {k.consumptionMetrics.aiReads}</span>
                      </div>
                      
                      {onSelectKnowledgeObject ? (
                        <button
                          onClick={() => onSelectKnowledgeObject(k.id)}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Inspect Architecture</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Link
                          to={`/knowledge/${k.id}`}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
                        >
                          <span>Inspect Architecture</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white border border-slate-150 rounded-xl">
                  <p className="text-slate-400 font-bold text-xs">No software engineering laboratory entries found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add node modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
            <div className={`px-6 py-4 border-b border-slate-150 flex items-center justify-between text-white ${
              modalDomain === 'Hardware' ? 'bg-amber-700' : 'bg-blue-700'
            }`}>
              <h2 className="text-sm font-bold flex items-center gap-2">
                {modalDomain === 'Hardware' ? <Cpu className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                <span>ลงทะเบียนวัตถุความรู้ใหม่ในระบบแยกส่วน: {modalDomain} Node</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-slate-200 font-extrabold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKnowledge} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ชื่อหัวข้อความรู้ (Title) *
                </label>
                <input
                  type="text"
                  placeholder={modalDomain === 'Hardware' ? 'เช่น ออกแบบ Low-Power Sleep on ESP32-S3' : 'เช่น ปรับปรุง Middleware JWT Verification ใน REST API'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ปัญหาที่เกิดขึ้น (Problem Statement) *
                </label>
                <textarea
                  placeholder="อธิบายปัญหาที่ต้องการแก้ไข..."
                  rows={2}
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    แท็ก (Tags) - คั่นด้วยจุลภาค
                  </label>
                  <input
                    type="text"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    placeholder="เช่น ESP32, Sleep, LowPower"
                    className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    หมวดหมู่ (Categories)
                  </label>
                  <input
                    type="text"
                    value={newCategoryString}
                    onChange={(e) => setNewCategoryString(e.target.value)}
                    placeholder="เช่น Hardware Engineering"
                    className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  บริบทและข้อจำกัด (Context & Requirements) *
                </label>
                <textarea
                  placeholder={modalDomain === 'Hardware' ? 'เช่น แรงดันไฟ 3.3V, แหล่งจ่ายจากแบต LiPo 1200mAh...' : 'เช่น Node.js v18, สภาพแวดล้อม Docker container, Redis cache...'}
                  rows={2}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  วิธีการแก้ไขที่สมบูรณ์แบบ (Solution Description) *
                </label>
                <textarea
                  placeholder="เขียนอธิบายขั้นตอนการต่อวงจร หรือโครงสร้างโค้ดที่ถูกต้องและปลอดภัย..."
                  rows={3}
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  หลักฐานเชิงประจักษ์และการยืนยัน (Evidence & Verification)
                </label>
                <textarea
                  placeholder="เช่น ผลลัพธ์จากการทดสอบผ่านเครื่องออสซิลโลสโคป หรือผล benchmark การประมวลผล..."
                  rows={2}
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="border-t border-slate-150 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                    modalDomain === 'Hardware' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  บันทึกองค์ความรู้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
