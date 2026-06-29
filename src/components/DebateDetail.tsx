import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Debate, KnowledgeObject } from '../types';
import { Activity, ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, BarChart3, Database, Shield, Zap, DollarSign, Users, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function DebateDetail() {
  const { id } = useParams<{ id: string }>();
  const [debate, setDebate] = useState<Debate | null>(null);
  const [koA, setKoA] = useState<KnowledgeObject | null>(null);
  const [koB, setKoB] = useState<KnowledgeObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    fetch(`/api/debate/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
           setDebate(data);
           Promise.all([
             fetch(`/api/knowledge/${data.knowledge_a_id}`).then(r => r.json()),
             fetch(`/api/knowledge/${data.knowledge_b_id}`).then(r => r.json())
           ]).then(([a, b]) => {
             if (!a.error) setKoA(a);
             if (!b.error) setKoB(b);
             setLoading(false);
           });
        } else {
           setLoading(false);
        }
      });
  }, [id]);

  const runCompute = async () => {
    setComputing(true);
    try {
      const res = await fetch(`/api/debate/${id}/compute`, { method: 'POST' });
      const computed = await res.json();
      setDebate(computed);
    } catch (e) {
      console.error(e);
    }
    setComputing(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading debate engine...</div>;
  if (!debate) return <div className="p-8 text-center text-slate-500">Debate not found.</div>;

  const result = debate.comparison_json;
  
  const DIMENSION_CONFIG = {
    performance: { icon: Zap, label: 'Performance', color: 'text-amber-500' },
    reliability: { icon: Shield, label: 'Reliability', color: 'text-emerald-500' },
    usability: { icon: Users, label: 'Usability', color: 'text-blue-500' },
    ecosystem: { icon: Database, label: 'Ecosystem', color: 'text-purple-500' },
    cost_efficiency: { icon: DollarSign, label: 'Cost Efficiency', color: 'text-green-600' },
    popularity: { icon: BarChart3, label: 'Popularity (Adoption)', color: 'text-pink-500' },
    industry_fit: { icon: Target, label: 'Industry Fit', color: 'text-indigo-500' },
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 pt-8">
          <Link to={`/knowledge/${koA?.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
             <ArrowLeft className="w-4 h-4" /> Back to Knowledge Node
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border bg-indigo-100 text-indigo-700 border-indigo-200">
                  DEBATE ENGINE
                </span>
                <span className="text-xs font-semibold text-slate-500">ID: {debate.id}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Multi-Dimensional Comparison</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Structured evidence-based comparison between two knowledge nodes across technical and real-world dimensions. 
                <strong className="text-slate-900 ml-1">No single winner is declared; results are context-dependent.</strong>
              </p>
            </div>
            {!result && (
              <button 
                onClick={runCompute} 
                disabled={computing}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {computing ? 'Computing...' : 'Run Analysis Engine'}
              </button>
            )}
          </div>
        </div>

        {/* Context Display */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Evaluation Context</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">Use Case</div>
              <div className="text-sm font-medium text-slate-800">{debate.context_json?.use_case || 'General Production'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">Environment</div>
              <div className="text-sm font-medium text-slate-800">{debate.context_json?.environment || 'Cloud-Native / Edge'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">Constraints</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(debate.context_json?.constraints || []).map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Node Comparison Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border-t-4 border-slate-200 shadow-sm border-t-blue-500">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Knowledge A</div>
            <h2 className="text-lg font-bold text-slate-900">{koA?.title || 'Unknown Node'}</h2>
            <div className="text-xs text-slate-500 mt-2 truncate">ID: {koA?.id}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border-t-4 border-slate-200 shadow-sm border-t-purple-500">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Knowledge B</div>
            <h2 className="text-lg font-bold text-slate-900">{koB?.title || 'Unknown Node'}</h2>
            <div className="text-xs text-slate-500 mt-2 truncate">ID: {koB?.id}</div>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="space-y-8">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-indigo-400" /> Executive Summary
              </h3>
              <p className="text-slate-300 mb-4">{debate.summary_json?.overall_summary}</p>
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Recommendation for Context</div>
                <div className="text-sm font-medium">{debate.summary_json?.recommendation}</div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Multi-Dimensional Scoring</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(result).map(([dimKey, dimData]: [string, any]) => {
                const config = DIMENSION_CONFIG[dimKey as keyof typeof DIMENSION_CONFIG] || DIMENSION_CONFIG.performance;
                const Icon = config.icon;
                const total = dimData.scoreA + dimData.scoreB;
                const pctA = total > 0 ? (dimData.scoreA / total) * 100 : 50;
                const pctB = total > 0 ? (dimData.scoreB / total) * 100 : 50;
                
                return (
                  <div key={dimKey} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-50 ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{config.label}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Evidence-linked scoring</p>
                        </div>
                      </div>
                      <div className="flex-1 max-w-md w-full ml-auto">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-blue-600">A: {dimData.scoreA}</span>
                          <span className="text-purple-600">B: {dimData.scoreB}</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="bg-blue-500 h-full" style={{ width: `${pctA}%` }}></div>
                          <div className="bg-purple-500 h-full" style={{ width: `${pctB}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 sm:px-6 py-4 bg-slate-50/50">
                      <div className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-900 mr-2">Reasoning:</span>
                        {dimData.reasoning}
                      </div>
                      {dimData.evidenceLinks && dimData.evidenceLinks.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">Evidence Links:</span>
                          <div className="flex gap-2">
                            {dimData.evidenceLinks.map((link: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50 cursor-pointer">
                                {link}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Awaiting Computation</h3>
            <p className="text-slate-500 mt-1">Run the analysis engine to evaluate these nodes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
