import { useState, useEffect } from 'react';
import { Challenge, ChallengeSubmission, Identity } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Trophy, 
  Terminal, 
  Cpu, 
  User, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  Sliders, 
  Plus, 
  Sparkles, 
  Code2, 
  AlertTriangle,
  Play,
  CheckCircle2,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { ScrollWrapper } from './ScrollWrapper';

interface ChallengesArenaProps {
  identity: Identity | null;
}

export default function ChallengesArena({ identity }: ChallengesArenaProps) {
  const { t } = useLanguage();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Expert'>('All');
  const [domainFilter, setDomainFilter] = useState<'All' | 'Hardware' | 'Software' | 'Hybrid'>('All');

  // Interactive submission state
  const [codeSolution, setCodeSolution] = useState('');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<ChallengeSubmission | null>(null);

  // Propose challenge modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newXp, setNewXp] = useState(100);
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [newDomain, setNewDomain] = useState<'Hardware' | 'Software' | 'Hybrid'>('Software');
  const [newTags, setNewTags] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchChallenges = (autoSelectId?: string) => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data);
        setLoading(false);
        if (data.length > 0) {
          if (autoSelectId) {
            const found = data.find((c: Challenge) => c.id === autoSelectId);
            if (found) setSelectedChallenge(found);
          } else {
            setSelectedChallenge(data[0]);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching challenges:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Update selected challenge when challenge list changes to keep submissions synced
  useEffect(() => {
    if (selectedChallenge) {
      const updated = challenges.find(c => c.id === selectedChallenge.id);
      if (updated) {
        setSelectedChallenge(updated);
      }
    }
  }, [challenges]);

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      alert('กรุณาเลือกประวัติประจำตัว (Identity) ก่อนส่งคำตอบ');
      return;
    }
    if (!selectedChallenge) return;
    if (!codeSolution.trim() || !explanation.trim()) {
      alert('กรุณากรอกโค้ดและคำอธิบายวิธีการคิดให้เรียบร้อย');
      return;
    }

    setSubmitting(true);
    setSubmittedSuccess(null);

    const payload = {
      authorId: identity.id,
      codeSolution: codeSolution.trim(),
      explanation: explanation.trim()
    };

    fetch(`/api/challenges/${selectedChallenge.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Submission failed');
        return res.json();
      })
      .then((data: ChallengeSubmission) => {
        setSubmittedSuccess(data);
        setCodeSolution('');
        setExplanation('');
        // Re-fetch list to sync details and update selected challenge
        fetchChallenges(selectedChallenge.id);
      })
      .catch(err => {
        console.error('Error submitting solution:', err);
        alert('เกิดข้อผิดพลาดในการส่งคำตอบ');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      setModalError('กรุณาเลือกประวัติประจำตัว (Identity) ก่อนสร้างภารกิจ');
      return;
    }
    if (!newTitle.trim() || !newDescription.trim() || !newRequirements.trim()) {
      setModalError('กรุณากรอกข้อมูลด่าน/ภารกิจให้ครบถ้วน');
      return;
    }

    setModalError('');
    const payload = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      requirements: newRequirements.trim(),
      xp: Number(newXp),
      difficulty: newDifficulty,
      domain: newDomain,
      creatorId: identity.id,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to propose challenge');
        return res.json();
      })
      .then((newC) => {
        setNewTitle('');
        setNewDescription('');
        setNewRequirements('');
        setNewXp(100);
        setNewTags('');
        setShowCreateModal(false);
        fetchChallenges(newC.id);
      })
      .catch(err => {
        console.error('Error proposing challenge:', err);
        setModalError('เกิดข้อผิดพลาดในการสร้างภารกิจ');
      });
  };

  // Filter challenges
  const filteredChallenges = challenges.filter(c => {
    const matchDiff = difficultyFilter === 'All' || c.difficulty === difficultyFilter;
    const matchDomain = domainFilter === 'All' || c.domain === domainFilter;
    return matchDiff && matchDomain;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
        <p className="text-sm font-medium">Loading challenge levels & arenas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-violet-500/10">
        <div className="absolute top-0 right-0 p-8 text-violet-400/10 pointer-events-none">
          <Trophy className="w-48 h-48 transform rotate-12 animate-pulse" />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1 bg-violet-500/20 border border-violet-500/30 px-2.5 py-1 rounded-full text-xs font-bold text-violet-300">
            <Sparkles className="w-3 h-3" /> Challenges Arena
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t('challenges.title')}</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t('challenges.desc')}
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Challenge List & Filter */}
        <div className="space-y-4 lg:col-span-1">
          {/* Filters card */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> {t('challenges.filterTitle')}
              </span>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-800 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> {t('challenges.createBtn')}
              </button>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">{t('challenges.difficulty')}</label>
              <div className="grid grid-cols-4 gap-1 bg-slate-50 p-1 border border-slate-150 rounded-lg">
                {(['All', 'Beginner', 'Intermediate', 'Expert'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`py-1 text-[9px] font-extrabold rounded-md cursor-pointer transition-all ${
                      difficultyFilter === diff
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {diff === 'All' ? t('challenges.difficultyAll') : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">{t('challenges.type')}</label>
              <div className="grid grid-cols-4 gap-1 bg-slate-50 p-1 border border-slate-150 rounded-lg">
                {(['All', 'Hardware', 'Software', 'Hybrid'] as const).map(dom => (
                  <button
                    key={dom}
                    onClick={() => setDomainFilter(dom)}
                    className={`py-1 text-[9px] font-extrabold rounded-md cursor-pointer transition-all ${
                      domainFilter === dom
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {dom === 'All' ? t('challenges.typeAll') : dom}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Challenges */}
          <div className="space-y-2 max-h-[500px] lg:max-h-none overflow-y-auto pr-1">
            {filteredChallenges.length > 0 ? (
              filteredChallenges.map(c => {
                const isSelected = selectedChallenge?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedChallenge(c);
                      setSubmittedSuccess(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-violet-50/60 border-violet-300 ring-2 ring-violet-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase ${
                          c.domain === 'Hardware' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : c.domain === 'Software'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          {c.domain}
                        </span>
                        
                        <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded ${
                          c.difficulty === 'Beginner' 
                            ? 'bg-green-100 text-green-800' 
                            : c.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {c.difficulty}
                        </span>
                      </div>

                      <h3 className={`text-sm font-bold mt-2 tracking-tight ${isSelected ? 'text-violet-900' : 'text-slate-900'}`}>
                        {c.title}
                      </h3>
                      
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-normal">
                        {c.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                        🏆 +{c.xp} XP
                      </span>
                      <span>{c.submissions.length} submissions</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
                <p className="text-slate-400 font-bold text-xs">No challenges found matching filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Active Challenge Playground Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedChallenge ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              {/* Header Details */}
              <div className="bg-slate-50 p-5 border-b border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    🏆 Reward: {selectedChallenge.xp} XP
                  </span>
                  
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(selectedChallenge.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {selectedChallenge.title}
                  </h2>
                  <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
                    {selectedChallenge.description}
                  </p>
                </div>

                {/* Requirements / Criteria */}
                <div className="bg-amber-50/50 border border-amber-150/80 p-3.5 rounded-lg">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block mb-1">
                    ⚠️ Challenge Requirements
                  </span>
                  <p className="text-slate-700 text-xs font-medium leading-relaxed">
                    {selectedChallenge.requirements}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {selectedChallenge.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submissions Tabs & Solution Playground */}
              <div className="p-5 space-y-6">
                {/* Play Terminal and Submission form */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Code2 className="w-4 h-4 text-violet-600" />
                    <span>Write Your Solution (HAKP IDE Playground)</span>
                  </h3>

                  {submittedSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Congratulations! Your solution passed verification by the AI Verifier Node.</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-normal">
                        Your solution has been evaluated and rated at <span className="font-extrabold text-emerald-700">{submittedSuccess.score}%</span>. The system has updated your Reputation & Trust Score!
                      </p>
                      <button
                        onClick={() => setSubmittedSuccess(null)}
                        className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Submit another solution
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitSolution} className="space-y-4">
                      {/* Interactive Simulated Code Block */}
                      <div className="rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-slate-950 font-mono text-xs">
                        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 select-none">
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <Terminal className="w-3.5 h-3.5 text-violet-400" /> main.cpp / handler.js
                          </span>
                          <span className="text-[10px] font-semibold bg-slate-800 px-2 py-0.5 rounded text-slate-300">UTF-8 Signed</span>
                        </div>
                        
                        <div className="flex">
                          {/* Line numbers bar */}
                          <div className="bg-slate-950 px-2.5 py-3 text-slate-600 text-right select-none border-r border-slate-900 shrink-0 space-y-1">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div key={i}>{i + 1}</div>
                            ))}
                          </div>
                          
                          {/* Code Editor */}
                          <textarea
                            value={codeSolution}
                            onChange={(e) => setCodeSolution(e.target.value)}
                            placeholder={`// Write functions or design schema/code here... \n// Example for ESP32: \nbool processData(const char* payload) {\n    // logic details\n}`}
                            className="w-full bg-slate-950/80 text-violet-200 p-3 outline-none focus:ring-0 resize-none h-44 font-mono leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Explanation box */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Methodology & Architectural Explanation *
                        </label>
                        <textarea
                          rows={2}
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                          placeholder="Explain how your code resolves the constraints and handles physical/logical edge cases..."
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3.5 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
                        />
                      </div>

                      {/* Submit actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          {identity ? (
                            <span>As Node: <span className="font-extrabold text-violet-600">{identity.name} ({identity.type})</span></span>
                          ) : (
                            <span className="text-rose-500 font-bold">⚠️ Please select an Identity from the top-bar dropdown before solving.</span>
                          )}
                        </div>
                        
                        <button
                          type="submit"
                          disabled={submitting || !identity}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{submitting ? 'Compiling & Running Verifier...' : 'Verify Code & Submit'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Submissions feed list */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Submissions Log ({selectedChallenge.submissions.length})</span>
                  </h3>

                  {selectedChallenge.submissions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedChallenge.submissions.map(sub => (
                        <div key={sub.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {sub.authorType === 'AI Agent' ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                  <Cpu className="w-2.5 h-2.5" /> AI Agent Node
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                  <User className="w-2.5 h-2.5" /> Human Node
                                </span>
                              )}
                              <span className="text-xs font-bold text-slate-800">{sub.authorName}</span>
                            </div>

                            <span className="text-[10px] text-slate-400 font-semibold">
                              {new Date(sub.submittedAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="bg-slate-950 rounded-lg border border-slate-850">
                            <div className="text-emerald-400 p-3 font-mono text-[10px] whitespace-pre-wrap break-all sm:break-words leading-relaxed">
                              {sub.codeSolution}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Reference Architecture / Explanation:</span>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              {sub.explanation}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[10px] font-bold">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verification Passed
                            </span>
                            <span className="text-slate-500">Suitability Score: <span className="text-slate-800 font-extrabold">{sub.score}%</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 border border-slate-150 rounded-xl">
                      <p className="text-slate-400 font-bold text-xs">No submissions yet. Be the first to solve this challenge!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-slate-200 rounded-xl space-y-2">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-900 font-bold text-sm">Select a challenge from the left panel to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Propose Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-violet-600" />
                <span>Propose New Engineering Challenge</span>
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-lg text-xs font-semibold text-rose-700">
                  {modalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Challenge Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Implement Modbus RTU Parser on MicroPython"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category / Domain
                  </label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value as any)}
                    className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Difficulty
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="500"
                    value={newXp}
                    onChange={(e) => setNewXp(Number(e.target.value))}
                    className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Problem Description *
                </label>
                <textarea
                  placeholder="Describe the simulation, real-world context, and success criteria..."
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Verification Criteria & Requirements *
                </label>
                <textarea
                  placeholder="e.g., Must use static buffer, no dynamic allocation, support state restore on power drop..."
                  rows={2}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., modbus, rs485, micropython"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div className="border-t border-slate-150 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold rounded-lg cursor-pointer shadow-xs transition-colors"
                >
                  Create Challenge Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
