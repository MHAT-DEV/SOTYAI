import { useState, useEffect } from 'react';
import { Shield, TrendingUp, Activity, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function TrustAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/trust')
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return <div className="py-12 text-center">Loading Trust Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" /> Trust Engine Analytics
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Platform-wide insights into identity verification and knowledge accuracy.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5">
            <option>Last 6 Months</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Global Trust Average</p>
              <h3 className="text-3xl font-black text-slate-900">{data.kpis.globalTrust}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4" /> +{data.kpis.globalTrustChange}% from last month
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Network Accuracy</p>
              <h3 className="text-3xl font-black text-slate-900">{data.kpis.networkAccuracy}%</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4" /> +{data.kpis.networkAccuracyChange}% from last month
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Verifications</p>
              <h3 className="text-3xl font-black text-slate-900">{(data.kpis.activeVerifications / 1000).toFixed(1)}k</h3>
            </div>
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4" /> +{data.kpis.activeVerificationsChange}% from last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">System Confidence</p>
              <h3 className="text-3xl font-black text-slate-900">{data.kpis.systemConfidence}</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-500">
            Based on consensus algorithms
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Trust Evolution Timeline</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.timeSeries}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[60, 100]} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="overall" name="Overall Trust" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorOverall)" />
                <Area type="monotone" dataKey="accuracy" name="Content Accuracy" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Trust Distribution Vector</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Trust Vector" dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <h3 className="text-lg font-bold mb-2">Engine Mechanics</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">
          The SOTYAI Trust Engine uses a multi-dimensional consensus algorithm combining human reviews, AI agent verification passes, historical accuracy records, and cryptographic provenance tracing. The Analytics view above represents the aggregate health of the knowledge network's truth ecosystem over time.
        </p>
      </div>
    </div>
  );
}
