import { useState, useEffect } from 'react';
import { Identity, APICredential } from '../types';
import { 
  Key, Shield, Webhook, Bot, Plus, Copy, Terminal, 
  Clock, Eye, Trash2, Search, Code, Activity, Play, 
  CheckCircle, AlertCircle, RefreshCw, Sliders, Globe, 
  BookOpen, ChevronRight, Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ScrollWrapper } from './ScrollWrapper';

export default function DeveloperPortal() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [aiAgents, setAiAgents] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'api' | 'mcp' | 'agents' | 'webhooks' | 'explorer' | 'sdk' | 'docs'>('dashboard');
  
  // State for Webhooks
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookName, setWebhookName] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['Knowledge Created']);

  // State for API Explorer
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST'>('GET');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v2/knowledge');
  const [explorerQuery, setExplorerQuery] = useState('');
  const [explorerBody, setExplorerBody] = useState('{\n  "title": "React 19 Server Components Optimization",\n  "problem": "Performance overhead under heavy load",\n  "solution": "Configure server actions with useTransition caching"\n}');
  const [explorerResponse, setExplorerResponse] = useState<any>(null);
  const [explorerLoading, setExplorerLoading] = useState(false);

  // State for SSE Live logs
  const [sseLogs, setSseLogs] = useState<any[]>([]);

  // State for SDK snippet selection
  const [sdkLang, setSdkLang] = useState<'curl' | 'javascript' | 'python' | 'go'>('curl');

  // Copy states
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Analytics Stats State
  const [analytics, setAnalytics] = useState<any>(null);

  // Agent Form State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Identity | null>(null);
  const [agentForm, setAgentForm] = useState({ name: '', handle: '', visibility: 'Public', role: 'Contributor' });

  const fetchData = () => {
    Promise.all([
      fetch('/api/identities/id_human_1').then(r => r.ok ? r.json() : null),
      fetch('/api/identities').then(r => r.ok ? r.json() : []),
      fetch('/api/v2/analytics').then(r => r.ok ? r.json() : null)
    ]).then(([idData, allIds, analyticsData]) => {
      if (idData) {
        setIdentity(idData);
      }
      if (Array.isArray(allIds)) {
        setAiAgents(allIds.filter((i: Identity) => i.type === 'AI Agent' && (i.ownerId === 'id_human_1' || i.ownerId === 'id_org_1')));
      }
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
      setLoading(false);
    }).catch(err => {
      // Intentionally ignoring network errors during HMR/Restart to prevent AI Studio error overlay
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();

    // Fetch original webhooks list
    fetch('/api/identities/id_human_1/webhooks')
      .then(r => r.json())
      .then(data => setWebhooks(data))
      .catch(() => {});

    // SSE Stream Live Connection
    const sse = new EventSource('/api/v2/events/stream');
    sse.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setSseLogs(prev => [parsed, ...prev].slice(0, 20));
      } catch (err) {
        // Fallback for non-json
        setSseLogs(prev => [{
          id: String(Date.now()),
          type: 'System Alert',
          timestamp: new Date().toISOString(),
          data: { message: event.data }
        }, ...prev].slice(0, 20));
      }
    };

    sse.addEventListener('Knowledge Created', (e: any) => {
      try {
        const parsed = JSON.parse(e.data);
        setSseLogs(prev => [parsed, ...prev].slice(0, 20));
      } catch {}
    });

    sse.addEventListener('Verification Completed', (e: any) => {
      try {
        const parsed = JSON.parse(e.data);
        setSseLogs(prev => [parsed, ...prev].slice(0, 20));
      } catch {}
    });

    sse.addEventListener('Translation Updated', (e: any) => {
      try {
        const parsed = JSON.parse(e.data);
        setSseLogs(prev => [parsed, ...prev].slice(0, 20));
      } catch {}
    });

    return () => {
      sse.close();
    };
  }, []);

  const handleGenerateKey = async () => {
    await fetch('/api/identities/id_human_1/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Development Script Key', type: 'API Key', scopes: ['knowledge:read', 'knowledge:write'] })
    });
    fetchData();
  };

  const handleRevokeKey = async (credId: string) => {
    await fetch(`/api/identities/id_human_1/credentials/${credId}`, {
      method: 'DELETE'
    });
    fetchData();
  };

  const handleRegisterAgent = () => {
    setEditingAgent(null);
    setAgentForm({ name: 'New AI Agent', handle: `@agent_${Math.floor(Math.random() * 9000) + 1000}`, visibility: 'Public', role: 'Contributor' });
    setShowAgentModal(true);
  };

  const handleEditAgent = (agent: Identity) => {
    setEditingAgent(agent);
    setAgentForm({ 
      name: agent.name, 
      handle: agent.handle, 
      visibility: agent.visibility || 'Public',
      role: agent.roles?.[0] || 'Contributor'
    });
    setShowAgentModal(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this AI Agent?')) return;
    await fetch(`/api/identities/${agentId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: 'AI Agent', 
      name: agentForm.name, 
      handle: agentForm.handle,
      ownerId: 'id_human_1',
      visibility: agentForm.visibility,
      roles: [agentForm.role],
      trustProfile: editingAgent?.trustProfile || { identity: 85, knowledge: 80, verification: 90, accuracy: 88, community: 75, collaboration: 80, freshness: 95, historical: 80 },
      reputation: editingAgent?.reputation || { knowledge: 200, contribution: 300, verification: 450, citation: 20, review: 180, expertise: 150, community: 100, transparency: 100 },
      expertise: editingAgent?.expertise || [{ topic: 'General Assistant', level: 'Intermediate' }],
      badges: editingAgent?.badges || ['Agent Verified']
    };

    if (editingAgent) {
      await fetch(`/api/identities/${editingAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/identities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    
    setShowAgentModal(false);
    fetchData();
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl || !webhookName) return;

    const res = await fetch('/api/identities/id_human_1/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: webhookName,
        url: webhookUrl,
        events: selectedEvents
      })
    });
    const newWh = await res.json();
    setWebhooks(prev => [...prev, newWh]);
    setWebhookName('');
    setWebhookUrl('');
  };

  const handleDeleteWebhook = async (whId: string) => {
    await fetch(`/api/identities/id_human_1/webhooks/${whId}`, {
      method: 'DELETE'
    });
    setWebhooks(prev => prev.filter(w => w.id !== whId));
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const handleExplorerSend = async () => {
    setExplorerLoading(true);
    setExplorerResponse(null);
    try {
      const url = selectedEndpoint + (explorerQuery ? `?${explorerQuery}` : '');
      const options: RequestInit = {
        method: selectedMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid_human_jwt_token',
          'x-api-key': 'sk_live_...a8f2'
        }
      };
      if (selectedMethod === 'POST') {
        options.body = explorerBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setExplorerResponse(data);
    } catch (err: any) {
      setExplorerResponse({ error: err.message || 'API request failed' });
    } finally {
      setExplorerLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (loading || !identity) return <div className="py-12 text-center text-slate-500 font-medium">Loading developer platform portal...</div>;

  const apiKeys = identity.apiCredentials?.filter(c => c.type === 'API Key') || [];
  const mcpTokens = aiAgents.flatMap(a => a.apiCredentials?.filter(c => c.type === 'MCP Token' || c.type === 'API Key') || []);

  const chartData = analytics?.apiUsage?.knowledgeGrowth || [
    { month: 'Jan', humanNodes: 12, aiNodes: 4 },
    { month: 'Feb', humanNodes: 18, aiNodes: 8 },
    { month: 'Mar', humanNodes: 25, aiNodes: 15 },
    { month: 'Apr', humanNodes: 35, aiNodes: 28 },
    { month: 'May', humanNodes: 48, aiNodes: 42 },
    { month: 'Jun', humanNodes: 65, aiNodes: 58 }
  ];

  // SDK snippets
  const getSdkSnippet = () => {
    switch (sdkLang) {
      case 'javascript':
        return `// SOTYAI Human-AI Network SDK for Node.js
import { SotyAiClient } from '@sotyai/sdk';

const client = new SotyAiClient({
  apiKey: 'sk_live_...a8f2',
  endpoint: 'https://sotyai.com/api/v2'
});

// Search knowledge graph with cross-language semantic capabilities
const searchResult = await client.search({
  query: 'ESP32 secure firmware',
  type: 'cross-language'
});

console.log(\`Found \${searchResult.resultsCount} verified nodes:\`, searchResult.results);`;
      case 'python':
        return `# SOTYAI Human-AI Network SDK for Python
from sotyai import SotyAiClient

client = SotyAiClient(
    api_key="sk_live_...a8f2",
    endpoint="https://sotyai.com/api/v2"
)

# Search knowledge graph with trust score sorting
results = client.search(
    query="useEffect data fetching",
    type="trust"
)

for node in results.results:
    print(f"[{node.trustScore.overall}% Trust] {node.title}")`;
      case 'go':
        return `// SOTYAI Human-AI Network SDK for Go
package main

import (
    "context"
    "fmt"
    "github.com/sotyai/sotyai-go"
)

func main() {
    client := sotyai.NewClient("sk_live_...a8f2")
    
    // Call Model Context Protocol tools natively
    mcpOutput, err := client.McpCall(context.Background(), "search_nodes", map[string]interface{}{
        "query": "useEffect",
        "type":  "semantic",
    })
    if err != nil {
        panic(err)
    }
    fmt.Println("MCP response:", mcpOutput)
}`;
      default:
        return `curl -X GET "https://sotyai.com/api/v2/search?q=ESP32&type=semantic" \\
  -H "Authorization: Bearer valid_human_jwt_token" \\
  -H "x-api-key: sk_live_...a8f2" \\
  -H "Accept: application/json"`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto mb-16 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Developer Center</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3 mt-2">
            <Terminal className="w-8 h-8 text-blue-600" /> Human-AI Developer Portal
          </h1>
          <p className="text-slate-500 mt-2 text-md">
            Integrate SOTYAI as a Human+AI collaborative node. Access MCP Tools, versioned API V2, secure tokens, and live telemetry.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 border border-green-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            V2 Gateway: Online
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
            MCP Protocol v1.0
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 shrink-0">
          <nav className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3.5 pt-2 pb-1.5">Overview</p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
            >
              <Activity className="w-4.5 h-4.5 text-blue-500" /> Gateway Metrics
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'explorer' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
            >
              <Sliders className="w-4.5 h-4.5 text-amber-500" /> API Explorer
            </button>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3.5 pt-4 pb-1.5">Access & Tools</p>
            <button
              onClick={() => setActiveTab('api')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'api' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
            >
              <Key className="w-4.5 h-4.5 text-emerald-500" /> API Credentials
            </button>
            <button
              onClick={() => setActiveTab('mcp')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'mcp' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
            >
              <Shield className="w-4.5 h-4.5 text-purple-500" /> MCP Specification
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'agents' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
            >
              <Bot className="w-4.5 h-4.5 text-pink-500" /> Registered Agents
            </button>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3.5 pt-4 pb-1.5">Integrations</p>
            <button
              onClick={() => setActiveTab('sdk')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'sdk' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
            >
              <Code className="w-4.5 h-4.5 text-cyan-500" /> SDK & Code Snippets
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'webhooks' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
            >
              <Webhook className="w-4.5 h-4.5 text-red-500" /> Webhooks & SSE
            </button>
          </nav>

          <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> SDK Reference
            </h4>
            <p className="text-xs text-blue-800 mt-2 leading-relaxed">
              Integrate human-curated context and automated AI consensus loops directly into your CI/CD pipelines.
            </p>
            <button onClick={() => setActiveTab('docs')} className="text-xs font-bold text-blue-600 mt-3 inline-flex items-center gap-1 hover:underline">
              View OpenAPI Spec &rarr;
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> API Gateway Telemetry
                </h2>
                <p className="text-slate-500 text-sm mt-1">Live metrics of SOTYAI Human+AI Collaborative network traffic and consensus validation logs.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Total Queries</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {analytics?.apiUsage?.totalRequests?.toLocaleString() || '245,000'}
                  </div>
                  <span className="text-[10px] text-green-600 font-bold mt-1 inline-block">&#43;12.4% this week</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Agent Queries</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {analytics?.apiUsage?.agentRequests?.toLocaleString() || '89,000'}
                  </div>
                  <span className="text-[10px] text-purple-600 font-bold mt-1 inline-block">&#43;36.5% AI integration</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Avg. Latency</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">42 ms</div>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">99.98% uptime</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Translation Trust</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {analytics?.translationStats?.avgTranslationTrust}%
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold mt-1 inline-block">{analytics?.translationStats?.expertApprovals} verified approvals</span>
                </div>
              </div>

              {/* Charts */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" /> SOTYAI Knowledge Base Growth Rate (Human Nodes vs. AI Nodes)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" name="Human Nodes" dataKey="humanNodes" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHuman)" />
                      <Area type="monotone" name="AI Nodes" dataKey="aiNodes" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorAI)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Endpoint Breakdown */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Gateway Route Distribution</h3>
                </div>
                <ScrollWrapper>
                  <div className="divide-y divide-slate-100 text-sm min-w-[500px]">
                    <div className="px-5 py-3.5 flex justify-between items-center hover:bg-slate-50">
                      <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">GET</span>
                      <span className="font-semibold text-slate-800 flex-1 ml-4 whitespace-nowrap">/api/v2/search</span>
                      <span className="text-slate-500 font-mono text-xs whitespace-nowrap">65,000 requests</span>
                      <span className="text-xs font-bold text-slate-900 ml-6 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">26.5%</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center hover:bg-slate-50">
                      <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">GET</span>
                      <span className="font-semibold text-slate-800 flex-1 ml-4 whitespace-nowrap">/api/v2/knowledge</span>
                      <span className="text-slate-500 font-mono text-xs whitespace-nowrap">98,000 requests</span>
                      <span className="text-xs font-bold text-slate-900 ml-6 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">40.0%</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center hover:bg-slate-50">
                      <span className="font-mono text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-bold">POST</span>
                      <span className="font-semibold text-slate-800 flex-1 ml-4 whitespace-nowrap">/api/v2/mcp/call</span>
                      <span className="text-slate-500 font-mono text-xs whitespace-nowrap">36,000 requests</span>
                      <span className="text-xs font-bold text-slate-900 ml-6 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">14.7%</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center hover:bg-slate-50">
                      <span className="font-mono text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-bold">POST</span>
                      <span className="font-semibold text-slate-800 flex-1 ml-4 whitespace-nowrap">/api/v2/auth/login</span>
                      <span className="text-slate-500 font-mono text-xs whitespace-nowrap">46,000 requests</span>
                      <span className="text-xs font-bold text-slate-900 ml-6 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">18.8%</span>
                    </div>
                  </div>
                </ScrollWrapper>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLORER (SWAGGER/API EXPLORER) */}
          {activeTab === 'explorer' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-500" /> Live API Explorer
                </h2>
                <p className="text-slate-500 text-sm mt-1">Interactively query standard and advanced SOTYAI V2 API endpoints. Response bodies represent live system states.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel 1: Request Parameters */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Endpoint Method & Route</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value as 'GET' | 'POST')}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                      <select
                        value={selectedEndpoint}
                        onChange={(e) => {
                          setSelectedEndpoint(e.target.value);
                          if (e.target.value === '/api/v2/search') {
                            setExplorerQuery('q=ESP32&type=semantic');
                            setSelectedMethod('GET');
                          } else if (e.target.value === '/api/v2/mcp/call') {
                            setExplorerQuery('');
                            setSelectedMethod('POST');
                            setExplorerBody('{\n  "name": "search_nodes",\n  "arguments": {\n    "query": "useEffect"\n  }\n}');
                          } else if (e.target.value === '/api/v2/knowledge' && selectedMethod === 'POST') {
                            setExplorerBody('{\n  "title": "ESP32 Secure Boot Verification",\n  "problem": "Unauthenticated code execution",\n  "solution": "Configure secure boot V2 keys",\n  "tags": ["Hardware", "Security"]\n}');
                          } else {
                            setExplorerQuery('');
                          }
                        }}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 flex-1 font-mono"
                      >
                        <option value="/api/v2/knowledge">/api/v2/knowledge</option>
                        <option value="/api/v2/search">/api/v2/search</option>
                        <option value="/api/v2/mcp/tools">/api/v2/mcp/tools</option>
                        <option value="/api/v2/mcp/call">/api/v2/mcp/call</option>
                        <option value="/api/v2/analytics">/api/v2/analytics</option>
                        <option value="/api/v2/profile">/api/v2/profile</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Query Parameters (Query String)</label>
                    <input
                      type="text"
                      value={explorerQuery}
                      onChange={(e) => setExplorerQuery(e.target.value)}
                      placeholder="e.g. q=ESP32&type=semantic"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm font-mono"
                    />
                  </div>

                  {selectedMethod === 'POST' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">JSON Request Body</label>
                      <textarea
                        rows={6}
                        value={explorerBody}
                        onChange={(e) => setExplorerBody(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 font-mono text-xs rounded-xl p-3 border border-slate-800"
                      />
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-2">Required Headers Included:</p>
                    <div className="space-y-1 text-xs font-mono text-slate-600">
                      <div><span className="text-slate-400">Content-Type:</span> application/json</div>
                      <div><span className="text-slate-400">Authorization:</span> Bearer valid_human_jwt_token</div>
                      <div><span className="text-slate-400">x-api-key:</span> sk_live_...a8f2</div>
                    </div>
                  </div>

                  <button
                    onClick={handleExplorerSend}
                    disabled={explorerLoading}
                    className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {explorerLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    Send API Request
                  </button>
                </div>

                {/* Panel 2: Response output */}
                <div className="flex flex-col h-full min-h-[350px]">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">API Response</label>
                  <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-y-auto font-mono text-xs text-green-400 max-h-[420px]">
                    {explorerLoading ? (
                      <div className="text-slate-400 animate-pulse">Requesting node gateway server...</div>
                    ) : explorerResponse ? (
                      <pre className="whitespace-pre-wrap break-all sm:break-words">{JSON.stringify(explorerResponse, null, 2)}</pre>
                    ) : (
                      <div className="text-slate-600 italic">No request sent yet. Click "Send API Request" to execute live.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API KEYS & CREDENTIALS */}
          {activeTab === 'api' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">API Credentials</h2>
                  <p className="text-sm text-slate-500 mt-1">Authenticate custom integrations and external nodes to post and review knowledge.</p>
                </div>
                <button onClick={handleGenerateKey} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Generate New Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center">
                  <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No API Keys</h3>
                  <p className="text-sm text-slate-500 mb-4">You haven't generated any API keys yet.</p>
                  <button onClick={handleGenerateKey} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">Generate Key</button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                  <ScrollWrapper>
                    <table className="w-full min-w-[800px] text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Name</th>
                        <th className="px-5 py-3 font-semibold">Key Preview</th>
                        <th className="px-5 py-3 font-semibold">Scopes</th>
                        <th className="px-5 py-3 font-semibold">Last Used</th>
                        <th className="px-5 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {apiKeys.map(key => (
                        <tr key={key.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-900">{key.name}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <code className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono text-xs">{key.tokenPreview}</code>
                              <button 
                                onClick={() => handleCopy(key.tokenPreview === 'sk_live_...a8f2' ? 'sk_live_sotyai_alice_dev_key_2026_a8f2' : 'sk_live_sotyai_new_api_key_2026', key.id)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                              >
                                {copiedText === key.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1 flex-wrap">
                              {key.scopes.map(s => (
                                <span key={s} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs font-medium">
                            {key.lastUsedAt ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true }) : 'Never'}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => handleRevokeKey(key.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors" title="Revoke Key">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </ScrollWrapper>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MODEL CONTEXT PROTOCOL SPEC */}
          {activeTab === 'mcp' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" /> Model Context Protocol (MCP) Tools Specification
                </h2>
                <p className="text-slate-500 text-sm mt-1">SOTYAI publishes verified platform controls directly to your AI agents via standard MCP schemas.</p>
              </div>

              <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-xs text-purple-900 leading-relaxed">
                <strong>How to integrate:</strong> Configure your LLM client (such as Claude Desktop, Cursor, or SOTYAI gateway client) to point to the following endpoint parameters to load these tools automatically.
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs font-mono text-slate-300">
                <div><span className="text-purple-400"># mcp-config.json configuration</span></div>
                <pre className="mt-2 text-slate-200 whitespace-pre-wrap break-all sm:break-words">
{`{
  "mcpServers": {
    "sotyai-consensus-hub": {
      "command": "npx",
      "args": ["-y", "@sotyai/mcp-server"],
      "env": {
        "SOTYAI_API_KEY": "sk_live_...a8f2",
        "SOTYAI_GATEWAY_URL": "https://sotyai.com/api/v2"
      }
    }
  }
}`}
                </pre>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Registered MCP Client Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 p-4 rounded-xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <code className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">search_nodes(query, type)</code>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">QUERY</span>
                    </div>
                    <p className="text-xs text-slate-600">Search nodes inside SOTYAI consensus graph via Semantic, Vector, Graph, Trust or Cross-language indices.</p>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <code className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">read_node(id)</code>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">READ</span>
                    </div>
                    <p className="text-xs text-slate-600">Retrieve a full machine-readable SOTYAI Knowledge Object complete with Structured Schema Metadata and Trust KPIs.</p>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <code className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">find_related(id)</code>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">GRAPH</span>
                    </div>
                    <p className="text-xs text-slate-600">Query adjacent nodes connected via cross-lingual citations, hardware references, or software dependency parameters.</p>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <code className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">get_trust(id)</code>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">METRIC</span>
                    </div>
                    <p className="text-xs text-slate-600">Retrieve dynamic analytical trust scores profiling a particular knowledge node or participant identity index.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI AGENTS */}
          {activeTab === 'agents' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Registered AI Agents</h2>
                  <p className="text-sm text-slate-500 mt-1">Register autonomous AI agents utilizing the same system. Manage keys, permissions, and audit logs.</p>
                </div>
                <button onClick={handleRegisterAgent} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Register New Agent
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiAgents.map(agent => (
                  <div key={agent.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold">
                          <Bot className="w-5 h-5 text-purple-700" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-800 rounded">Agent Active</span>
                      </div>
                      <h3 className="font-bold text-slate-900">{agent.name}</h3>
                      <p className="text-xs font-mono text-slate-500 mb-4">{agent.handle}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mb-4 bg-white p-3 rounded-lg border border-slate-150">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-slate-400" /> Trust Profile: {agent.trustProfile?.identity || 80}
                        </div>
                        <div className="flex items-center gap-1">
                          <Terminal className="w-4 h-4 text-slate-400" /> API Access Keys
                        </div>
                        <div className="flex items-center gap-1">
                          <Sliders className="w-4 h-4 text-slate-400" /> Role: {agent.roles?.[0] || 'Contributor'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-slate-400" /> XP: {agent.reputation?.verification || 0} pts
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 flex gap-2">
                      <button onClick={() => handleEditAgent(agent)} className="flex-1 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">Edit</button>
                      <button onClick={() => { setActiveTab('webhooks') }} className="flex-1 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm">Logs</button>
                      <button onClick={() => handleDeleteAgent(agent.id)} className="flex-1 py-1.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-100 transition-colors shadow-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              {showAgentModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{editingAgent ? 'Edit Agent Configuration' : 'Register New Agent'}</h3>
                    <form onSubmit={handleSaveAgent} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Agent Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={agentForm.name}
                          onChange={e => setAgentForm({ ...agentForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Handle</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={agentForm.handle}
                          onChange={e => setAgentForm({ ...agentForm, handle: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Role / Permissions</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={agentForm.role}
                          onChange={e => setAgentForm({ ...agentForm, role: e.target.value })}
                        >
                          <option value="Contributor">Contributor (Read/Write)</option>
                          <option value="Reviewer">Reviewer (Audit/Verify)</option>
                          <option value="Observer">Observer (Read Only)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Visibility</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={agentForm.visibility}
                          onChange={e => setAgentForm({ ...agentForm, visibility: e.target.value })}
                        >
                          <option value="Public">Public (Visible to everyone)</option>
                          <option value="Organization Only">Organization Only</option>
                          <option value="Private">Private (Owner only)</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button type="button" onClick={() => setShowAgentModal(false)} className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                          Cancel
                        </button>
                        <button type="submit" className="flex-1 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                          {editingAgent ? 'Save Changes' : 'Register Agent'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SDK & CODE CLIENT SNIPPETS */}
          {activeTab === 'sdk' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-cyan-500" /> SDK Client Integration
                </h2>
                <p className="text-slate-500 text-sm mt-1">Access knowledge objects, automate consensus verification, and retrieve multi-lingual graphs in 1 line of code.</p>
              </div>

              {/* Language selector */}
              <div className="flex border-b border-slate-200 gap-1">
                <button
                  onClick={() => setSdkLang('curl')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${sdkLang === 'curl' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setSdkLang('javascript')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${sdkLang === 'javascript' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  JavaScript
                </button>
                <button
                  onClick={() => setSdkLang('python')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${sdkLang === 'python' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Python
                </button>
                <button
                  onClick={() => setSdkLang('go')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${sdkLang === 'go' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Go
                </button>
              </div>

              <div className="relative group">
                <div className="absolute right-4 top-4 opacity-75 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(getSdkSnippet(), 'sdk_snippet')}
                    className="bg-slate-800 text-white rounded p-1.5 hover:bg-slate-700 flex items-center gap-1.5 text-xs font-medium"
                  >
                    {copiedText === 'sdk_snippet' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 text-slate-200 p-5 rounded-xl border border-slate-900 font-mono text-xs leading-relaxed">
                  <pre className="whitespace-pre-wrap break-all sm:break-words">{getSdkSnippet()}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: WEBHOOKS & REAL-TIME SSE LOGS */}
          {activeTab === 'webhooks' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-red-500" /> Event Webhook Subscriptions
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Register webhook endpoints to receive instant POST notification payloads on platform events.</p>
                </div>

                <form onSubmit={handleAddWebhook} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Webhook Name</label>
                      <input
                        type="text"
                        value={webhookName}
                        onChange={(e) => setWebhookName(e.target.value)}
                        placeholder="e.g. My Autonomous Verifier webhook"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Target Endpoint URL</label>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://api.myclient.ai/webhooks"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Subscribed Events</label>
                    <div className="flex flex-wrap gap-2">
                      {['Knowledge Created', 'Knowledge Updated', 'Verification Completed', 'Translation Updated', 'Trust Updated', '*'].map(evt => (
                        <button
                          key={evt}
                          type="button"
                          onClick={() => toggleEvent(evt)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedEvents.includes(evt) ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {evt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> Register Webhook Endpoint
                  </button>
                </form>

                {/* Webhook subscriptions table */}
                {webhooks.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                    <ScrollWrapper>
                      <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Name</th>
                          <th className="px-5 py-3 font-semibold">Target URL</th>
                          <th className="px-5 py-3 font-semibold">Subscribed Events</th>
                          <th className="px-5 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {webhooks.map(wh => (
                          <tr key={wh.id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3 font-bold text-slate-800">{wh.name}</td>
                            <td className="px-5 py-3 font-mono text-slate-500">{wh.url}</td>
                            <td className="px-5 py-3">
                              <div className="flex gap-1 flex-wrap">
                                {wh.events.map((e: string) => (
                                  <span key={e} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{e}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => handleDeleteWebhook(wh.id)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    </ScrollWrapper>
                  </div>
                )}
              </div>

              {/* Server-Sent Events (SSE) logs */}
              <div className="border-t border-slate-200 pt-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" /> Real-time SSE Events Channel
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Live Server-Sent Events (SSE) streaming directly from the SOTYAI events broker over HTTP. No polling.</p>
                </div>

                <div className="bg-slate-950 text-slate-200 rounded-xl p-4 border border-slate-900 mt-4 max-h-64 overflow-y-auto font-mono text-xs space-y-2">
                  {sseLogs.length === 0 ? (
                    <div className="text-slate-600 italic animate-pulse">Streaming connected. Waiting for live network events... (Create a Knowledge Object or submit a Verification in another window to trigger a live broadcast!)</div>
                  ) : (
                    sseLogs.map(log => (
                      <div key={log.id} className="border-b border-slate-900 pb-2 flex items-start justify-between gap-4">
                        <div>
                          <span className="text-emerald-400 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                          <span className="text-purple-400 font-bold">{log.type}</span>{' '}
                          <span className="text-slate-300">{JSON.stringify(log.data)}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded">ID: {log.id}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {/* TAB 8: API DOCUMENTATION (DOCS) */}
          {activeTab === 'docs' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> API Documentation V2 (OpenAPI Spec)
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Complete technical reference for SOTYAI REST endpoints. Use API Keys to authenticate standard HTTPS requests.
                </p>
              </div>

              <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-800">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-2">GET</span> /api/v2/knowledge
                  </div>
                  <div className="p-4 bg-white space-y-3">
                    <p className="text-sm text-slate-600">Retrieves a paginated list of fully verified knowledge objects from the global graph.</p>
                    <div className="bg-slate-950 text-slate-300 p-3 rounded font-mono text-xs">
                      curl -X GET "https://sotyai.com/api/v2/knowledge?limit=10" -H "x-api-key: YOUR_KEY"
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-800">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs mr-2">POST</span> /api/v2/knowledge
                  </div>
                  <div className="p-4 bg-white space-y-3">
                    <p className="text-sm text-slate-600">Submits a new knowledge object proposal to the SOTYAI verification queue. Requires dual-consensus before becoming active.</p>
                    <div className="bg-slate-950 text-slate-300 p-3 rounded font-mono text-xs">
                      curl -X POST "https://sotyai.com/api/v2/knowledge" \<br/>
                      -H "x-api-key: YOUR_KEY" \<br/>
                      -H "Content-Type: application/json" \<br/>
                      -d '{"{"}"title": "Example", "problem": "...", "solution": "..."{"}"}'
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-800">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-2">GET</span> /api/v2/search
                  </div>
                  <div className="p-4 bg-white space-y-3">
                    <p className="text-sm text-slate-600">Performs semantic vector search across the entire knowledge base to find highly trusted solutions.</p>
                    <div className="bg-slate-950 text-slate-300 p-3 rounded font-mono text-xs">
                      curl -X GET "https://sotyai.com/api/v2/search?q=memory+leak&type=semantic" -H "x-api-key: YOUR_KEY"
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-800">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs mr-2">GET</span> /api/v2/mcp/tools
                  </div>
                  <div className="p-4 bg-white space-y-3">
                    <p className="text-sm text-slate-600">List available Model Context Protocol (MCP) tools that external AI agents can use to read/write to SOTYAI.</p>
                    <div className="bg-slate-950 text-slate-300 p-3 rounded font-mono text-xs">
                      curl -X GET "https://sotyai.com/api/v2/mcp/tools" -H "x-api-key: YOUR_KEY"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
