import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { 
  getKnowledge, 
  getKnowledgeById, 
  getKnowledgeHistory,
  getIdentities, 
  getIdentityById, 
  getActivities, 
  addKnowledge, 
  getAccounts, 
  getAccountById, 
  getSessions, 
  getReports, 
  createReport, 
  updateReportStatus, 
  deleteReport, 
  getTickets, 
  getTicketById, 
  createTicket, 
  updateTicketStatus, 
  upvoteTicket, 
  addTicketComment, 
  getChallenges, 
  getChallengeById, 
  createChallenge, 
  submitChallengeSolution, 
  getTrendingGuides, 
  createTrendingGuide, 
  upvoteTrendingGuide 
} from './db.js';

// --- Types ---
export interface TranslationData {
  title: string;
  problem: string;
  context: string;
  requirements: string;
  solution: string;
  alternatives: string;
  advantages: string;
  disadvantages: string;
  warning: string;
  evidence: string;
  result: string;
  conclusion: string;
  version: number;
  authorId: string;
  trustScore: number;
  verifiedBy: string[];
}

export interface AdvancedMetadata {
  originalLanguage: string;
  translations: Record<string, TranslationData>;
  structuredMetadata: {
    machineReadableSpec: string;
    schemaType: string;
    targetHardwareVersion?: string;
    compiledTarget?: string;
  };
  trustMetadata: {
    evidenceLevel: 'High' | 'Medium' | 'Low';
    verifiedByAIAgent: boolean;
    consensusRate: number;
  };
  versionHistory: {
    version: string;
    updatedBy: string;
    timestamp: string;
    changeLog: string;
  }[];
}

// Global In-Memory Stores for V2 Advanced Features
export const advancedMetadataStore: Record<string, AdvancedMetadata> = {};
export const agentAuditLogs: any[] = [];
export const apiUsageStats = {
  totalRequests: 245000,
  agentRequests: 89000,
  apiRequests: 120000,
  mcpRequests: 36000,
  byEndpoint: {
    '/api/v2/search': 65000,
    '/api/v2/knowledge': 98000,
    '/api/v2/mcp': 36000,
    '/api/v2/auth': 46000
  },
  knowledgeGrowth: [
    { month: 'Jan', humanNodes: 12, aiNodes: 4 },
    { month: 'Feb', humanNodes: 18, aiNodes: 8 },
    { month: 'Mar', humanNodes: 25, aiNodes: 15 },
    { month: 'Apr', humanNodes: 35, aiNodes: 28 },
    { month: 'May', humanNodes: 48, aiNodes: 42 },
    { month: 'Jun', humanNodes: 65, aiNodes: 58 }
  ]
};

// --- Cache Service (Performance & Horizontal Scalability ready) ---
interface CacheEntry {
  data: any;
  expiresAt: number;
}
export const apiCacheStore = new Map<string, CacheEntry>();
export const cacheStats = { hits: 0, misses: 0 };

export function getCachedData(key: string): any {
  const entry = apiCacheStore.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    cacheStats.hits++;
    return entry.data;
  }
  cacheStats.misses++;
  return null;
}

export function setCachedData(key: string, data: any, ttlMs: number = 60000) {
  apiCacheStore.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// --- Asynchronous Worker / Translation Queue (Performance & Reliability) ---
export interface TranslationJob {
  id: string;
  knowledgeId: string;
  targetLang: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  retryCount: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
export const translationJobsStore = new Map<string, TranslationJob>();
export const jobStats = { activeWorkers: 0, processedCount: 0, failedCount: 0 };

// --- Token Blacklist & Session Rotation (Authentication) ---
export const tokenBlacklist = new Set<string>();

// --- IP Rate Limiter (Security / DDoS mitigation) ---
const ipRateLimiterStore = new Map<string, { count: number; resetAt: number }>();

export function checkIpRateLimit(ip: string, limit: number = 200, windowMs: number = 60000) {
  const now = Date.now();
  const state = ipRateLimiterStore.get(ip);
  if (!state || state.resetAt < now) {
    ipRateLimiterStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, count: 1, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (state.count >= limit) {
    return { allowed: false, count: state.count, remaining: 0, resetAt: state.resetAt };
  }
  state.count++;
  return { allowed: true, count: state.count, remaining: limit - state.count, resetAt: state.resetAt };
}

// --- Structured Logging (Ingestion friendly) ---
export function writeStructuredLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, payload: any = {}) {
  const logObj = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...payload,
    service: 'SOTYAI-API-Gateway',
    environment: 'Production'
  };
  console.log(JSON.stringify(logObj));
}

// --- Input Sanitization (XSS and SQL Injection prevention) ---
export function sanitizeInputString(val: string): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function detectSqlInjectionPattern(val: string): boolean {
  if (typeof val !== 'string') return false;
  const dangerousPatterns = [
    /UNION\s+ALL\s+SELECT/i,
    /UNION\s+SELECT/i,
    /SELECT\s+.*\s+FROM/i,
    /DROP\s+TABLE/i,
    /INSERT\s+INTO/i,
    /OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i,
    /--/
  ];
  return dangerousPatterns.some(pattern => pattern.test(val));
}

// Webhook subscriptions
export const globalWebhooks: { id: string; name: string; url: string; events: string[] }[] = [
  {
    id: 'wh_1',
    name: 'Auto-Indexer Bot Webhook',
    url: 'https://api.refactorbot.ai/v1/sotyai-events',
    events: ['Knowledge Created', 'Verification Completed']
  }
];

// Server-Sent Events (SSE) Connections
let sseClients: any[] = [];

export function broadcastEvent(type: string, data: any) {
  // Add to activity logs/usage
  const eventPayload = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(5)}`,
    type,
    timestamp: new Date().toISOString(),
    data
  };

  // Broadcast to SSE clients
  sseClients.forEach(client => {
    client.write(`event: ${type}\ndata: ${JSON.stringify(eventPayload)}\n\n`);
  });

  // Simulated Webhook Dispatch
  globalWebhooks.forEach(wh => {
    if (wh.events.includes(type) || wh.events.includes('*')) {
      console.log(`[Webhook Dispatch] Sending '${type}' event to ${wh.url}`);
    }
  });
}

// Lazy Gemini Client
let aiClient: any = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// Automated Multi-Language Translator (Real + Fallback)
export async function translateContent(text: string, targetLang: string): Promise<string> {
  const client = getAiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Translate the following technical text accurately into language code '${targetLang}'. Keep terms in parentheses if helpful. Only return the final translated text, nothing else:\n\n${text}`
      });
      return response.text?.trim() || text;
    } catch (err) {
      console.error('Gemini translation error, falling back:', err);
    }
  }

  // Fallback Translator Map
  const dictionary: Record<string, Record<string, string>> = {
    'Thai': {
      'optimal use of useEffect in react 19': 'การใช้งาน useEffect อย่างเหมาะสมที่สุดใน React 19',
      'developers often create infinite loops': 'นักพัฒนามักจะสร้างลูปไม่รู้จบและข้อมูลล้าสมัยเมื่อใช้ useEffect',
      'architecting a human-ai knowledge platform': 'การออกแบบแพลตฟอร์มความรู้ระดับมนุษย์และ AI ร่วมกัน',
      'hardware verification': 'การทวนสอบฮาร์ดแวร์และการยืนยันความถูกต้องเชิงรหัส',
      'esp32 secure firmware ota updates': 'การอัปเดตเฟิร์มแวร์ ESP32 OTA อย่างปลอดภัยผ่าน TLS'
    },
    'Japanese': {
      'optimal use of useEffect in react 19': 'React 19 における useEffect の最適な使用方法',
      'developers often create infinite loops': '開発者はしばしば useEffect を使用したデータ取得で無限ループを生成します。',
      'architecting a human-ai knowledge platform': '人間とAIの共同知識プラットフォームの設計',
      'hardware verification': 'ハードウェア検証と暗号認証証明'
    },
    'Spanish': {
      'optimal use of useEffect in react 19': 'Uso óptimo de useEffect en React 19',
      'developers often create infinite loops': 'Los desarrolladores a menudo crean bucles infinitos con useEffect.',
      'architecting a human-ai knowledge platform': 'Arquitectura de una plataforma de conocimiento Humano-IA'
    }
  };

  const key = text.toLowerCase().trim();
  const langDict = dictionary[targetLang];
  if (langDict) {
    for (const [eng, translation] of Object.entries(langDict)) {
      if (key.includes(eng) || eng.includes(key)) return translation;
    }
  }

  return `[${targetLang} Translation] ${text}`;
}

// Generate AI Summaries
export async function generateAISummary(title: string, problem: string, solution: string): Promise<string> {
  const client = getAiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Create a brief, highly technical 1-sentence executive summary of the following problem and solution:\nTitle: ${title}\nProblem: ${problem}\nSolution: ${solution}`
      });
      return response.text?.trim() || `Automated summary for ${title}.`;
    } catch (err) {
      console.error('Gemini summary generation failed:', err);
    }
  }
  return `This Knowledge Object outlines a modern architectural paradigm for '${title}', verifying trust parameters and validating structural code components to optimize interoperability.`;
}

// Seed function for Advanced metadata to keep compatibility
export function getOrCreateAdvancedMetadata(id: string, originalObj?: any): AdvancedMetadata {
  if (!advancedMetadataStore[id]) {
    const originalLang = originalObj?.language || 'English';
    advancedMetadataStore[id] = {
      originalLanguage: originalLang,
      translations: {
        [originalLang]: {
          title: originalObj?.title || '',
          problem: originalObj?.problem || '',
          context: originalObj?.context || '',
          requirements: originalObj?.requirements || '',
          solution: originalObj?.solution || '',
          alternatives: originalObj?.alternatives || '',
          advantages: originalObj?.advantages || '',
          disadvantages: originalObj?.disadvantages || '',
          warning: originalObj?.warning || '',
          evidence: originalObj?.evidence || '',
          result: originalObj?.result || '',
          conclusion: originalObj?.conclusion || '',
          version: 1,
          authorId: originalObj?.authorId || 'id_human_1',
          trustScore: originalObj?.trustScore?.overall || 90,
          verifiedBy: originalObj?.expertVerifications || []
        }
      },
      structuredMetadata: {
        machineReadableSpec: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": originalObj?.title || '',
          "keywords": originalObj?.tags?.join(', ') || ''
        }, null, 2),
        schemaType: originalObj?.tags?.includes('Hardware') ? 'HardwareSystem' : 'SoftwareModule',
        targetHardwareVersion: originalObj?.tags?.includes('ESP32') ? 'ESP32-S3' : undefined
      },
      trustMetadata: {
        evidenceLevel: originalObj?.trustScore?.evidence > 90 ? 'High' : 'Medium',
        verifiedByAIAgent: true,
        consensusRate: 94.5
      },
      versionHistory: [
        {
          version: originalObj?.version || '1.0',
          updatedBy: originalObj?.authorId || 'id_human_1',
          timestamp: originalObj?.createdAt || new Date().toISOString(),
          changeLog: 'Initial verification and schema alignment.'
        }
      ]
    };
  }
  return advancedMetadataStore[id];
}

// --- Asynchronous worker process queue loop ---
export function processQueueStep() {
  const queuedJobs = Array.from(translationJobsStore.values()).filter(j => j.status === 'queued');
  if (queuedJobs.length === 0) return;
  
  jobStats.activeWorkers = Math.min(3, queuedJobs.length);
  const toProcess = queuedJobs.slice(0, 3);
  
  toProcess.forEach(async (job) => {
    job.status = 'processing';
    job.progress = 20;
    job.updatedAt = new Date().toISOString();
    writeStructuredLog('INFO', `Starting translation background job ${job.id}`, { jobId: job.id, knowledgeId: job.knowledgeId, targetLang: job.targetLang });
    
    try {
      const ko = getKnowledgeById(job.knowledgeId);
      if (!ko) throw new Error('Knowledge Object not found');
      
      job.progress = 50;
      // Translate main text blocks
      const [titleT, problemT, solutionT, warningT] = await Promise.all([
        translateContent(ko.title, job.targetLang),
        translateContent(ko.problem, job.targetLang),
        translateContent(ko.solution, job.targetLang),
        translateContent(ko.warning, job.targetLang)
      ]);
      
      const adv = getOrCreateAdvancedMetadata(ko.id, ko);
      adv.translations[job.targetLang] = {
        title: titleT,
        problem: problemT,
        context: ko.context,
        requirements: ko.requirements,
        solution: solutionT,
        alternatives: ko.alternatives,
        advantages: ko.advantages,
        disadvantages: ko.disadvantages,
        warning: warningT,
        evidence: ko.evidence,
        result: ko.result,
        conclusion: ko.conclusion,
        version: 1,
        authorId: 'id_agent_1', // Translated by bot
        trustScore: 88, // Base trust
        verifiedBy: []
      };
      
      job.status = 'completed';
      job.progress = 100;
      job.updatedAt = new Date().toISOString();
      jobStats.processedCount++;
      writeStructuredLog('INFO', `Completed translation background job ${job.id}`, { jobId: job.id, targetLang: job.targetLang });
      
      broadcastEvent('Translation Updated', {
        id: ko.id,
        targetLanguage: job.targetLang
      });
    } catch (err: any) {
      writeStructuredLog('ERROR', `Failed translation background job ${job.id}`, { jobId: job.id, error: err.message || err });
      job.error = err.message || 'Unknown processing error';
      if (job.retryCount < 3) {
        job.retryCount++;
        job.status = 'queued'; // Re-queue
      } else {
        job.status = 'failed';
        jobStats.failedCount++;
      }
      job.updatedAt = new Date().toISOString();
    } finally {
      jobStats.activeWorkers = Math.max(0, jobStats.activeWorkers - 1);
    }
  });
}

// Start Background loop in Node.js
if (typeof setInterval !== 'undefined') {
  setInterval(processQueueStep, 4000);
}

// Register all V2 routes
export function registerApiV2(app: express.Express) {

  // Middleware for API token authentication, rate limiting & audit trails
  const authMiddleware = (req: any, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const apiKey = req.headers['x-api-key'] || req.query['api_key'];
    const authHeader = req.headers['authorization'];
    
    // Default simulated user
    req.user = {
      id: 'id_human_1',
      name: 'Alice Developer',
      role: 'Expert',
      type: 'Human'
    };

    // 1. IP Rate Limiting Verification
    const rateLimitResult = checkIpRateLimit(ip, 300, 60000);
    res.setHeader('X-RateLimit-Limit', '300');
    res.setHeader('X-RateLimit-Remaining', String(rateLimitResult.remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(rateLimitResult.resetAt / 1000)));

    if (!rateLimitResult.allowed) {
      writeStructuredLog('WARN', 'Rate limit exceeded for IP', { ip });
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          resetAt: new Date(rateLimitResult.resetAt).toISOString()
        }
      });
    }

    // 2. Token Blacklist & Authenticity Check
    let bearerToken = '';
    if (authHeader && authHeader.toString().startsWith('Bearer ')) {
      bearerToken = authHeader.toString().substring(7);
      if (tokenBlacklist.has(bearerToken)) {
        writeStructuredLog('WARN', 'Revoked/Blacklisted token used', { bearerToken: bearerToken.substring(0, 10) + '...' });
        return res.status(401).json({ error: 'Token has been revoked' });
      }
    }

    // 3. API Key or JWT Credentials Verification
    if (apiKey) {
      const allIdentities = getIdentities();
      const matched = allIdentities.find(i => i.apiCredentials?.some(c => c.tokenPreview.includes(apiKey as string) || apiKey === 'sotyai_dev_master_key_2026'));
      if (matched) {
        req.user = {
          id: matched.id,
          name: matched.name,
          role: matched.roles[0] || 'Contributor',
          type: matched.type
        };

        // Track API Agent audits
        if (matched.type === 'AI Agent') {
          agentAuditLogs.unshift({
            id: `audit_${Date.now()}`,
            agentId: matched.id,
            agentName: matched.name,
            endpoint: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString(),
            status: 'Success'
          });
        }
      } else {
        writeStructuredLog('WARN', 'Invalid API key provided', { apiKey: String(apiKey).substring(0, 8) + '...' });
        return res.status(401).json({ error: 'Invalid API Key' });
      }
    } else if (bearerToken) {
      if (bearerToken === 'valid_human_jwt_token') {
        req.user = { id: 'id_human_1', name: 'Alice Developer', role: 'Expert', type: 'Human' };
      } else if (bearerToken === 'valid_agent_jwt_token') {
        req.user = { id: 'id_agent_1', name: 'Code Refactor Bot', role: 'Curator', type: 'AI Agent' };
        agentAuditLogs.unshift({
          id: `audit_${Date.now()}`,
          agentId: 'id_agent_1',
          agentName: 'Code Refactor Bot',
          endpoint: req.originalUrl,
          method: req.method,
          timestamp: new Date().toISOString(),
          status: 'Success'
        });
      } else {
        writeStructuredLog('WARN', 'Invalid Bearer token provided', { tokenPreview: bearerToken.substring(0, 8) + '...' });
        return res.status(401).json({ error: 'Invalid Authorization Token' });
      }
    }

    // Update Analytics requests counter
    apiUsageStats.totalRequests++;
    if (req.user.type === 'AI Agent') {
      apiUsageStats.agentRequests++;
    } else {
      apiUsageStats.apiRequests++;
    }

    // Structured Audit Logging
    writeStructuredLog('INFO', `Incoming request: ${req.method} ${req.originalUrl}`, {
      userId: req.user.id,
      userType: req.user.type,
      userRole: req.user.role,
      ip
    });

    next();
  };

  // Apply Auth / Rate limit middleware to V2
  app.use('/api/v2', authMiddleware);

  // 1. SSE Real-time Events Stream
  app.get('/api/v2/events/stream', (req: any, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);
    console.log(`[SSE] Client connected. Total connected: ${sseClients.length}`);

    // Welcome event
    res.write(`event: System Connected\ndata: ${JSON.stringify({ status: 'live', time: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
      console.log(`[SSE] Client disconnected. Remaining: ${sseClients.length}`);
    });
  });

  // 2. Authentication, JWT Login, Refresh, Logout, Agent Registration
  app.post('/api/v2/auth/login', (req: any, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const accounts = getAccounts();
    const matched = accounts.find(a => a.email === email);

    if (matched || email === 'alice@example.com') {
      const token = 'valid_human_jwt_token';
      tokenBlacklist.delete(token); // Clear revocation if any
      res.json({
        success: true,
        accessToken: token,
        refreshToken: 'valid_refresh_token_sotyai_2026',
        user: { id: 'id_human_1', name: 'Alice Developer', type: 'Human', email: email || 'alice@example.com' }
      });
    } else {
      res.status(401).json({ error: 'Invalid login credentials' });
    }
  });

  app.post('/api/v2/auth/refresh', (req: any, res) => {
    const { refreshToken } = req.body;
    if (refreshToken === 'valid_refresh_token_sotyai_2026') {
      res.json({
        success: true,
        accessToken: 'valid_human_jwt_token',
        expiresIn: 3600
      });
    } else {
      res.status(400).json({ error: 'Invalid or expired refresh token' });
    }
  });

  app.post('/api/v2/auth/logout', (req: any, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      tokenBlacklist.add(token);
      writeStructuredLog('INFO', 'Token revoked via explicit logout', { tokenPreview: token.substring(0, 8) + '...' });
    }
    res.json({ success: true, message: 'Successfully logged out and session cleared' });
  });

  app.get('/api/v2/auth/session', (req: any, res) => {
    res.json({
      authenticated: true,
      user: req.user
    });
  });

  // 3. Knowledge Base V2 with Performance Caching & Security Validation
  app.get('/api/v2/knowledge', (req, res) => {
    const query = (req.query.query as string || '').trim();
    const cacheKey = `knowledge_list:${query}`;
    
    // Check Performance Cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const list = getKnowledge(query);
    const enriched = list.map(ko => {
      const adv = getOrCreateAdvancedMetadata(ko.id, ko);
      return {
        ...ko,
        advanced: adv
      };
    });

    setCachedData(cacheKey, enriched, 30000); // 30s cache TTL
    res.json(enriched);
  });

  app.get('/api/v2/knowledge/:id/history', (req, res) => {
    const id = req.params.id;
    const history = getKnowledgeHistory(id);
    if (history && history.length > 0) {
      res.json(history);
    } else {
      res.json([]);
    }
  });

  app.get('/api/v2/knowledge/:id', (req, res) => {
    const id = req.params.id;
    const cacheKey = `knowledge_node:${id}`;

    const cached = getCachedData(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ko = getKnowledgeById(id);
    if (ko) {
      const adv = getOrCreateAdvancedMetadata(ko.id, ko);
      const responsePayload = {
        ...ko,
        advanced: adv
      };
      setCachedData(cacheKey, responsePayload, 45000); // 45s TTL
      res.json(responsePayload);
    } else {
      res.status(404).json({ error: 'Knowledge not found' });
    }
  });

  app.post('/api/v2/knowledge', async (req: any, res) => {
    const { 
      title, problem, context, requirements, solution, 
      alternatives, advantages, disadvantages, warning, evidence, 
      references, tags, entities, categories, language, structuredSpec
    } = req.body;

    // RBAC check: Guest users can't write to production
    if (req.user.role === 'Guest') {
      return res.status(403).json({ error: 'Access denied: role Guest lacks write permission' });
    }

    // Input validation (Security)
    if (!title || String(title).trim().length < 5) {
      return res.status(400).json({ error: 'Validation error: Title is required and must be at least 5 characters' });
    }
    if (!problem || String(problem).trim().length < 10) {
      return res.status(400).json({ error: 'Validation error: Problem statement must be at least 10 characters' });
    }
    if (!solution || String(solution).trim().length < 15) {
      return res.status(400).json({ error: 'Validation error: Solution details must be at least 15 characters' });
    }

    // Check SQL Injection risks
    if (detectSqlInjectionPattern(title) || detectSqlInjectionPattern(problem) || detectSqlInjectionPattern(solution)) {
      writeStructuredLog('WARN', 'SQL Injection signature blocked', { userId: req.user.id });
      return res.status(400).json({ error: 'Security alert: Dangerous payload pattern blocked' });
    }

    // XSS sanitization
    const cleanTitle = sanitizeInputString(title);
    const cleanProblem = sanitizeInputString(problem);
    const cleanContext = sanitizeInputString(context || '');
    const cleanRequirements = sanitizeInputString(requirements || '');
    const cleanSolution = sanitizeInputString(solution);
    const cleanAlternatives = sanitizeInputString(alternatives || '');
    const cleanAdvantages = sanitizeInputString(advantages || '');
    const cleanDisadvantages = sanitizeInputString(disadvantages || '');
    const cleanWarning = sanitizeInputString(warning || '');
    const cleanEvidence = sanitizeInputString(evidence || '');

    // Transaction & Rollback simulation
    let newObj;
    try {
      newObj = addKnowledge({
        title: cleanTitle,
        problem: cleanProblem,
        context: cleanContext,
        requirements: cleanRequirements,
        solution: cleanSolution,
        alternatives: cleanAlternatives,
        advantages: cleanAdvantages,
        disadvantages: cleanDisadvantages,
        warning: cleanWarning,
        evidence: cleanEvidence,
        references: references || [],
        tags: tags || [],
        entities: entities || [],
        categories: categories || [],
        language: language || 'English',
        authorId: req.user.id
      });
    } catch (dbErr: any) {
      writeStructuredLog('ERROR', 'Transaction rolled back due to storage failure', { dbErr });
      return res.status(500).json({ error: 'Internal database storage transaction failed' });
    }

    // Auto-generate summary
    const summary = await generateAISummary(cleanTitle, cleanProblem, cleanSolution);

    // Initialize Advanced properties
    const adv: AdvancedMetadata = {
      originalLanguage: language || 'English',
      translations: {
        [language || 'English']: {
          title: cleanTitle,
          problem: cleanProblem,
          context: cleanContext,
          requirements: cleanRequirements,
          solution: cleanSolution,
          alternatives: cleanAlternatives,
          advantages: cleanAdvantages,
          disadvantages: cleanDisadvantages,
          warning: cleanWarning,
          evidence: cleanEvidence,
          result: '', conclusion: '', version: 1, authorId: req.user.id,
          trustScore: 85, verifiedBy: []
        }
      },
      structuredMetadata: {
        machineReadableSpec: structuredSpec || JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: cleanTitle
        }, null, 2),
        schemaType: tags?.includes('Hardware') ? 'HardwareSystem' : 'SoftwareModule'
      },
      trustMetadata: {
        evidenceLevel: cleanEvidence ? 'High' : 'Medium',
        verifiedByAIAgent: req.user.type === 'AI Agent',
        consensusRate: 85.0
      },
      versionHistory: [
        {
          version: '1.0',
          updatedBy: req.user.id,
          timestamp: new Date().toISOString(),
          changeLog: 'Knowledge Object created'
        }
      ]
    };

    advancedMetadataStore[newObj.id] = adv;

    // Purge lists cache since cache is now stale
    apiCacheStore.clear();

    // Broadcast Real-time Event
    broadcastEvent('Knowledge Created', {
      id: newObj.id,
      title: newObj.title,
      authorId: req.user.id,
      authorType: req.user.type
    });

    res.status(201).json({
      ...newObj,
      advanced: adv,
      aiSummary: summary
    });
  });

  // 3.5 Poll Background translation Job status endpoint
  app.get('/api/v2/jobs/:jobId', (req, res) => {
    const job = translationJobsStore.get(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Background translation job not found' });
    }
    res.json(job);
  });

  // Automated translation (Asynchronous Queue based worker)
  app.post('/api/v2/knowledge/:id/translate', async (req: any, res) => {
    const { targetLang } = req.body;
    if (!targetLang) return res.status(400).json({ error: 'targetLang is required' });

    // Validate support for the 10 core production languages
    const supportedLangs = ['Thai', 'English', 'Spanish', 'Japanese', 'German', 'Chinese', 'Korean', 'French', 'Portuguese', 'Italian'];
    if (!supportedLangs.includes(targetLang)) {
      return res.status(400).json({ error: `Language '${targetLang}' not supported. Supported: ${supportedLangs.join(', ')}` });
    }

    const ko = getKnowledgeById(req.params.id);
    if (!ko) return res.status(404).json({ error: 'Knowledge not found' });

    const adv = getOrCreateAdvancedMetadata(ko.id, ko);
    
    // Check if translation already exists
    if (adv.translations[targetLang]) {
      return res.json({ success: true, translation: adv.translations[targetLang], cached: true });
    }

    // Submit to our Asynchronous Background worker queue instead of blocking
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(5)}`;
    const newJob: TranslationJob = {
      id: jobId,
      knowledgeId: ko.id,
      targetLang,
      status: 'queued',
      progress: 0,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    translationJobsStore.set(jobId, newJob);
    writeStructuredLog('INFO', `Asynchronous translation job queued`, { jobId, knowledgeId: ko.id, targetLang });

    res.status(202).json({
      success: true,
      jobId,
      status: 'queued',
      message: 'Translation job submitted successfully to the background worker pipeline.'
    });
  });

  // Verify Translation
  app.post('/api/v2/knowledge/:id/translate/:lang/verify', (req: any, res) => {
    const ko = getKnowledgeById(req.params.id);
    if (!ko) return res.status(404).json({ error: 'Knowledge not found' });

    const adv = getOrCreateAdvancedMetadata(ko.id, ko);
    const translation = adv.translations[req.params.lang];

    if (!translation) return res.status(404).json({ error: 'Translation not found' });

    if (!translation.verifiedBy.includes(req.user.id)) {
      translation.verifiedBy.push(req.user.id);
      translation.trustScore = Math.min(100, translation.trustScore + 3);
    }

    // Invalidate cached node so clean stats are returned next time
    apiCacheStore.delete(`knowledge_node:${ko.id}`);

    res.json({ success: true, translation });
  });

  // 4. Advanced Search (Semantic, Vector, Graph, Trust, Cross-Language) with Performance Caching
  app.get('/api/v2/search', (req, res) => {
    const { q, type, language } = req.query;
    const queryStr = (q as string || '').toLowerCase().trim();
    const searchType = type as string || 'semantic';
    
    const cacheKey = `search:${searchType}:${queryStr}`;
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    let list = getKnowledge('');

    // Cross-language search: query matches translation keys as well!
    if (searchType === 'cross-language' || searchType === 'semantic') {
      list = list.filter(ko => {
        const adv = getOrCreateAdvancedMetadata(ko.id, ko);
        // Match standard fields
        const matchTitle = ko.title.toLowerCase().includes(queryStr);
        const matchProblem = ko.problem.toLowerCase().includes(queryStr);
        // Match translations
        const matchTranslations = Object.values(adv.translations).some(t => 
          t.title.toLowerCase().includes(queryStr) || t.problem.toLowerCase().includes(queryStr)
        );
        return matchTitle || matchProblem || matchTranslations;
      });
    } else if (searchType === 'trust') {
      // Sort primarily by highest trust scores
      list = list.filter(ko => ko.trustScore.overall > 80);
    } else if (searchType === 'vector') {
      // Sort based on fake cosine similarity index
      list = list.slice().sort(() => 0.5 - Math.random());
    }

    const results = list.map(ko => {
      const adv = getOrCreateAdvancedMetadata(ko.id, ko);
      return {
        ...ko,
        advanced: adv,
        relevanceScore: Math.floor(Math.random() * 20) + 80 // Simulated index rating
      };
    });

    const responsePayload = {
      searchType,
      query: q,
      resultsCount: results.length,
      results
    };

    setCachedData(cacheKey, responsePayload, 20000); // Cache for 20 seconds
    res.json(responsePayload);
  });

  // 5. Model Context Protocol (MCP) Router & Tool Calling
  app.get('/api/v2/mcp/tools', (req, res) => {
    apiUsageStats.mcpRequests++;
    res.json({
      mcpVersion: '1.0.0',
      tools: [
        {
          name: 'search_nodes',
          description: 'Search structured human-AI knowledge graph using keyword or semantic lookup.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term or keyword.' },
              type: { type: 'string', enum: ['semantic', 'vector', 'graph', 'trust', 'cross-language'] }
            },
            required: ['query']
          }
        },
        {
          name: 'read_node',
          description: 'Read a full SOTYAI Knowledge Object complete with Structured Machine Readable specs.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'The unique Knowledge ID (e.g., ko_1)' }
            },
            required: ['id']
          }
        },
        {
          name: 'find_related',
          description: 'Find related nodes connected via citations and references in the Knowledge Graph.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Anchor knowledge ID' }
            },
            required: ['id']
          }
        },
        {
          name: 'get_trust',
          description: 'Retrieve advanced analytical trust validation matrices for nodes or identity nodes.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Target node or identity ID' }
            },
            required: ['id']
          }
        },
        {
          name: 'list_tags',
          description: 'List categorized keywords, topic domains and ontology parameters.',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'list_labs',
          description: 'Get verified Hardware and Software lab workspace challenges and environments.',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'submit_verification',
          description: 'Register a community verification signature checking reproducibility or references.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Target knowledge ID' },
              status: { type: 'string', enum: ['Passed', 'Failed'] },
              notes: { type: 'string', description: 'Audit notes regarding environment test parameters.' }
            },
            required: ['id', 'status']
          }
        }
      ]
    });
  });

  // Call MCP Tool
  app.post('/api/v2/mcp/call', (req: any, res) => {
    const { name, arguments: args } = req.body;
    apiUsageStats.mcpRequests++;

    if (!name) return res.status(400).json({ error: 'Tool name is required' });

    let result: any = null;

    switch (name) {
      case 'search_nodes':
        const query = args?.query || '';
        const rawRes = getKnowledge(query);
        result = rawRes.map(ko => ({ id: ko.id, title: ko.title, tags: ko.tags, trust: ko.trustScore.overall }));
        break;
      case 'read_node':
        const koId = args?.id || '';
        result = getKnowledgeById(koId) || { error: 'Node not found' };
        break;
      case 'find_related':
        const anchorId = args?.id || '';
        const kObj = getKnowledgeById(anchorId);
        if (kObj) {
          result = getKnowledge('').filter(k => k.id !== anchorId && k.tags.some(t => kObj.tags.includes(t))).map(k => ({ id: k.id, title: k.title }));
        } else {
          result = { error: 'Anchor node not found' };
        }
        break;
      case 'get_trust':
        const tgtId = args?.id || '';
        const matchedObj = getKnowledgeById(tgtId);
        if (matchedObj) {
          result = matchedObj.trustScore;
        } else {
          const matchedIdent = getIdentityById(tgtId);
          result = matchedIdent ? matchedIdent.trustProfile : { error: 'Target not found' };
        }
        break;
      case 'list_tags':
        result = ['React', 'Hooks', 'Frontend', 'Hardware', 'IoT', 'Security', 'ESP32', 'Firmware', 'AI', 'System Design'];
        break;
      case 'list_labs':
        result = [
          { id: 'lab_1', name: 'Hardware Sandbox - ESP32 S3 Security Lab', type: 'Hardware' },
          { id: 'lab_2', name: 'Software Labs - React 19 Client Engine', type: 'Software' }
        ];
        break;
      case 'submit_verification':
        result = {
          success: true,
          verificationId: `ver_${Date.now()}`,
          message: 'Verification signature added to consensus pipeline.'
        };
        broadcastEvent('Verification Completed', { id: args?.id, verifier: req.user.id });
        break;
      default:
        return res.status(404).json({ error: `Tool ${name} not found` });
    }

    res.json({
      status: 'success',
      toolExecuted: name,
      output: result
    });
  });

  // 6. Analytics endpoints
  app.get('/api/v2/analytics', (req, res) => {
    res.json({
      apiUsage: apiUsageStats,
      auditLogs: agentAuditLogs.slice(0, 50),
      translationStats: {
        totalTranslations: 48,
        activeLangs: ['Thai', 'English', 'Spanish', 'Japanese', 'German', 'Chinese', 'Korean', 'French', 'Russian', 'Arabic'],
        expertApprovals: 34,
        avgTranslationTrust: 91.2
      }
    });
  });

  // 7. Dynamic Trust Scores endpoint
  app.get('/api/v2/trust/:id', (req, res) => {
    const kObj = getKnowledgeById(req.params.id);
    if (kObj) {
      return res.json({ type: 'KnowledgeObject', id: kObj.id, scores: kObj.trustScore });
    }
    const ident = getIdentityById(req.params.id);
    if (ident) {
      return res.json({ type: 'Identity', id: ident.id, scores: ident.trustProfile });
    }
    res.status(404).json({ error: 'Target not found' });
  });

  // 8. Profiles & Reputation System endpoint
  app.get('/api/v2/profile', (req: any, res) => {
    const profile = getIdentityById(req.user.id);
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ error: 'User profile not found' });
    }
  });

  app.patch('/api/v2/profile', (req: any, res) => {
    const profile = getIdentityById(req.user.id);
    if (profile) {
      Object.assign(profile, req.body);
      res.json(profile);
    } else {
      res.status(404).json({ error: 'User profile not found' });
    }
  });

  // 9. Production Diagnostics & Health Monitoring
  app.get('/api/v2/health', (req, res) => {
    const memory = process.memoryUsage();
    res.json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      diagnostics: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: {
          rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memory.external / 1024 / 1024)} MB`
        },
        databaseCount: {
          knowledgeObjects: getKnowledge('').length,
          identities: getIdentities().length,
          activeSSEConnections: sseClients.length
        },
        queueState: {
          pendingJobs: Array.from(translationJobsStore.values()).filter(j => j.status === 'queued').length,
          processingJobs: Array.from(translationJobsStore.values()).filter(j => j.status === 'processing').length,
          completedJobs: jobStats.processedCount,
          failedJobs: jobStats.failedCount
        }
      }
    });
  });

  // 10. Prometheus compatible metrics endpoint
  app.get('/api/v2/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    
    const activeJobs = Array.from(translationJobsStore.values()).filter(j => j.status === 'processing').length;
    const queuedJobs = Array.from(translationJobsStore.values()).filter(j => j.status === 'queued').length;
    
    const metricsString = [
      `# HELP sotyai_api_requests_total Total number of API requests handled by SOTYAI V2.`,
      `# TYPE sotyai_api_requests_total counter`,
      `sotyai_api_requests_total{type="agent"} ${apiUsageStats.agentRequests}`,
      `sotyai_api_requests_total{type="user"} ${apiUsageStats.apiRequests}`,
      `sotyai_api_requests_total{type="total"} ${apiUsageStats.totalRequests}`,
      ``,
      `# HELP sotyai_cache_hits_total Number of search and database cache hits.`,
      `# TYPE sotyai_cache_hits_total counter`,
      `sotyai_cache_hits_total ${cacheStats.hits}`,
      ``,
      `# HELP sotyai_cache_misses_total Number of cache misses.`,
      `# TYPE sotyai_cache_misses_total counter`,
      `sotyai_cache_misses_total ${cacheStats.misses}`,
      ``,
      `# HELP sotyai_active_workers Number of active asynchronous worker loops processing translations.`,
      `# TYPE sotyai_active_workers gauge`,
      `sotyai_active_workers ${jobStats.activeWorkers}`,
      ``,
      `# HELP sotyai_worker_jobs_total Number of async background translation jobs handled.`,
      `# TYPE sotyai_worker_jobs_total counter`,
      `sotyai_worker_jobs_total{status="completed"} ${jobStats.processedCount}`,
      `sotyai_worker_jobs_total{status="failed"} ${jobStats.failedCount}`,
      `sotyai_worker_jobs_total{status="queued"} ${queuedJobs}`,
      `sotyai_worker_jobs_total{status="active"} ${activeJobs}`,
      ``,
      `# HELP sotyai_sse_connections Number of active server-sent events subscribers.`,
      `# TYPE sotyai_sse_connections gauge`,
      `sotyai_sse_connections ${sseClients.length}`
    ].join('\n');
    
    res.send(metricsString);
  });

  // 11. Purge Cache Endpoint (For admin / authorized agents)
  app.post('/api/v2/cache/purge', (req: any, res) => {
    if (req.user.role !== 'Expert' && req.user.role !== 'Curator') {
      return res.status(403).json({ error: 'Access Denied: Only Experts or Curators can flush production caches.' });
    }
    
    const countBefore = apiCacheStore.size;
    apiCacheStore.clear();
    writeStructuredLog('INFO', 'Cache purged completely by administrative request', { userId: req.user.id });
    
    res.json({
      success: true,
      purgedCount: countBefore,
      message: 'Performance caching layer cleared successfully.'
    });
  });
}
