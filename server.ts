import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// In-memory data store for SOTYAI
import { initializeData, getKnowledge, getKnowledgeById, getIdentities, getIdentityById, getActivities, addKnowledge, getAccounts, getAccountById, getSessions, getReports, createReport, updateReportStatus, deleteReport, getTickets, getTicketById, createTicket, updateTicketStatus, upvoteTicket, addTicketComment, getChallenges, getChallengeById, createChallenge, submitChallengeSolution, getTrendingGuides, createTrendingGuide, upvoteTrendingGuide, getConversations, getUnreadCount, getMessages, markMessagesAsRead } from './src/server/db.js';
import { registerApiV2 } from './src/server/apiv2.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize data
  initializeData();

  // Register API v2 routes
  registerApiV2(app);

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SOTYAI HAKP API' });
  });

  // Accounts
  app.get('/api/accounts', (req, res) => {
    res.json(getAccounts());
  });

  app.get('/api/accounts/:id', (req, res) => {
    const acc = getAccountById(req.params.id);
    if (acc) {
      res.json(acc);
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  });

  app.get('/api/accounts/:id/sessions', (req, res) => {
    res.json(getSessions(req.params.id));
  });

  app.delete('/api/accounts/:id/sessions', (req, res) => {
    const { currentSessionId } = req.body;
    import('./src/server/db.js').then(db => {
      db.clearOtherSessions(req.params.id, currentSessionId);
      res.json({ success: true });
    });
  });

  app.get('/api/accounts/:id/subscriptions', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getSubscriptions(req.params.id));
    });
  });

  app.get('/api/analytics/trust', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.calculateDynamicTrustAnalytics());
    });
  });

  // Tags & Categories endpoints
  app.get('/api/tags', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getTagsSummary());
    });
  });

  app.get('/api/categories', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getCategoriesSummary());
    });
  });

  app.get('/api/entities', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getEntitiesSummary());
    });
  });

  app.get('/api/tags/recommend', (req, res) => {
    const { firstTag } = req.query;
    import('./src/server/db.js').then(db => {
      res.json(db.getRecommendedTags((firstTag as string) || ''));
    });
  });

  app.get('/api/categories/recommend', (req, res) => {
    const { firstCategory } = req.query;
    import('./src/server/db.js').then(db => {
      res.json(db.getRecommendedCategories((firstCategory as string) || ''));
    });
  });

  // Follow/Subscription system endpoints
  app.get('/api/identities/:id/isFollowing', (req, res) => {
    const { followerId } = req.query;
    import('./src/server/db.js').then(db => {
      const follow = db.isFollowing((followerId as string) || '', req.params.id);
      res.json({ following: !!follow, notifyAll: follow ? follow.notifyAll : false });
    });
  });

  app.post('/api/identities/:followedId/follow', (req, res) => {
    const { followerId, notifyAll } = req.body;
    import('./src/server/db.js').then(db => {
      const follow = db.followIdentity(followerId, req.params.followedId, !!notifyAll);
      res.json(follow);
    });
  });

  app.post('/api/identities/:followedId/unfollow', (req, res) => {
    const { followerId } = req.body;
    import('./src/server/db.js').then(db => {
      const success = db.unfollowIdentity(followerId, req.params.followedId);
      res.json({ success });
    });
  });

  app.get('/api/identities/followed/:followerId', (req, res) => {
    import('./src/server/db.js').then(db => {
      const follows = db.getFollows(req.params.followerId);
      const followedIdentities = db.getIdentities().filter(i => follows.some(f => f.followedId === i.id));
      const result = followedIdentities.map(i => {
        const f = follows.find(fol => fol.followedId === i.id);
        return {
          ...i,
          notifyAll: f ? f.notifyAll : false
        };
      });
      res.json(result);
    });
  });

  // Space / Group endpoints
  app.get('/api/spaces/:id/members', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getSpaceMembers(req.params.id));
    });
  });

  app.post('/api/spaces/:id/members', (req, res) => {
    const { identityId, role } = req.body;
    import('./src/server/db.js').then(db => {
      const result = db.addSpaceMember(req.params.id, identityId, role);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Space or user not found' });
      }
    });
  });

  app.delete('/api/spaces/:id/members/:memberId', (req, res) => {
    import('./src/server/db.js').then(db => {
      const success = db.removeSpaceMember(req.params.id, req.params.memberId);
      res.json({ success });
    });
  });

  app.get('/api/spaces/:id/posts', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getSpacePosts(req.params.id));
    });
  });

  app.post('/api/spaces/:id/posts', (req, res) => {
    const { authorId, content } = req.body;
    import('./src/server/db.js').then(db => {
      const result = db.createSpacePost(req.params.id, authorId, content);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Space not found' });
      }
    });
  });

  app.post('/api/spaces/posts/:postId/like', (req, res) => {
    const { identityId } = req.body;
    import('./src/server/db.js').then(db => {
      const result = db.likeSpacePost(req.params.postId, identityId);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    });
  });

  app.post('/api/spaces/posts/:postId/comments', (req, res) => {
    const { authorId, content } = req.body;
    import('./src/server/db.js').then(db => {
      const result = db.addSpaceComment(req.params.postId, authorId, content);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    });
  });

  app.get('/api/spaces/:id/chat', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getSpaceChatMessages(req.params.id));
    });
  });

  app.post('/api/spaces/:id/chat', (req, res) => {
    const { senderId, content } = req.body;
    import('./src/server/db.js').then(db => {
      const result = db.sendSpaceChatMessage(req.params.id, senderId, content);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Space not found' });
      }
    });
  });

  app.post('/api/spaces/:id/visibility', (req, res) => {
    const { visibility } = req.body;
    import('./src/server/db.js').then(db => {
      const success = db.updateSpaceVisibility(req.params.id, visibility);
      res.json({ success });
    });
  });

  // PM System endpoints
  app.get('/api/messages', (req, res) => {
    const { senderId, receiverId } = req.query;
    res.json(getMessages((senderId as string) || '', (receiverId as string) || ''));
  });

  app.get('/api/messages/conversations/:identityId', (req, res) => {
    res.json(getConversations(req.params.identityId));
  });

  app.get('/api/messages/unread-count/:identityId', (req, res) => {
    res.json(getUnreadCount(req.params.identityId));
  });

  app.post('/api/messages/read', (req, res) => {
    const { senderId, receiverId } = req.body;
    res.json(markMessagesAsRead(senderId, receiverId));
  });

  app.post('/api/messages', (req, res) => {
    const { senderId, receiverId, content } = req.body;
    import('./src/server/db.js').then(db => {
      const msg = db.sendPrivateMessage(senderId, receiverId, content);
      res.json(msg);
    });
  });

  app.get('/api/link-preview', async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
      const decodedUrl = decodeURIComponent(rawUrl).trim();
      const db = await import('./src/server/db.js');

      // 1. Check if it's an internal Knowledge Object link
      const knowledgeMatch = decodedUrl.match(/\/knowledge\/([a-zA-Z0-9_\-]+)/);
      if (knowledgeMatch) {
        const koId = knowledgeMatch[1];
        const ko = db.getKnowledgeById(koId);
        if (ko) {
          const author = ko.authorId === 'id_human_1' ? 'Alice Developer' : ko.authorId === 'id_org_1' ? 'OpenAI' : 'Unknown Creator';
          return res.json({
            type: 'internal-knowledge',
            title: ko.title,
            description: ko.problem || ko.context || 'Knowledge Object Reference',
            url: decodedUrl,
            trustScore: ko.trustScore?.overall || 50,
            version: ko.version || '1.0',
            updatedAt: ko.updatedAt,
            authorName: author,
            tags: ko.tags || [],
            categories: ko.categories || []
          });
        }
      }

      // 2. Check if it's an internal Identity link
      const identityMatch = decodedUrl.match(/\/identity\/([a-zA-Z0-9_\-]+)/);
      if (identityMatch) {
        const idId = identityMatch[1];
        const identity = db.getIdentityById(idId);
        if (identity) {
          return res.json({
            type: 'internal-identity',
            title: identity.name,
            description: `Identity profile for ${identity.name} (${identity.handle}) - ${identity.type} node in SOTYAI network.`,
            url: decodedUrl,
            trustScore: identity.trustProfile?.identity || 50,
            identityType: identity.type,
            handle: identity.handle,
            followers: identity.followers || { human: 0, ai: 0, organization: 0, enterprise: 0 },
            expertise: identity.expertise || []
          });
        }
      }

      // 3. External links
      let domain = '';
      try {
        const parsedUrl = new URL(decodedUrl);
        domain = parsedUrl.hostname;
      } catch (e) {
        const match = decodedUrl.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
        domain = match ? match[1] : decodedUrl;
      }

      let title = '';
      let description = '';
      let image = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
      let siteName = domain;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(decodedUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();

          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch) {
            title = titleMatch[1].trim();
          }

          const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
                             html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
          if (descMatch) {
            description = descMatch[1].trim();
          }

          const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
          if (imgMatch) {
            image = imgMatch[1].trim();
          }

          const siteMatch = html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i);
          if (siteMatch) {
            siteName = siteMatch[1].trim();
          }
        }
      } catch (fetchErr) {
        // Fall back gracefully
      }

      if (!title) {
        if (domain.includes('react.dev')) {
          title = 'React Reference - use Hook & Suspense';
          description = 'Learn how to fetch data natively using the React 19 "use" hook and leverage Suspense for optimal declarative lifecycle management.';
          siteName = 'React';
        } else if (domain.includes('github.com')) {
          title = 'GitHub Repository Source Reference';
          description = 'Source code repository for verified implementation guidelines, code evidence, and technical validation steps.';
          siteName = 'GitHub';
        } else if (domain.includes('arxiv.org')) {
          title = 'arXiv Research Paper';
          description = 'Open-access scientific pre-print containing rigorous theoretical frameworks, proofs, and dataset benchmark results.';
          siteName = 'arXiv';
        } else if (domain.includes('wikipedia.org')) {
          title = 'Wikipedia - Consolidated Public Knowledge';
          description = 'Peer-reviewed crowd-sourced global reference encyclopedia containing baseline definitions and historical records.';
          siteName = 'Wikipedia';
        } else {
          title = domain;
          description = 'External Reference Link used as verifiable evidence for this knowledge record.';
          siteName = domain;
        }
      }

      return res.json({
        type: 'external',
        title: title || domain,
        description: description || 'No description available.',
        url: decodedUrl,
        image: image,
        siteName: siteName || domain
      });

    } catch (err) {
      console.error('Error generating link preview:', err);
      return res.status(500).json({ error: 'Failed to generate preview' });
    }
  });

  // Webhooks endpoints
  app.get('/api/identities/:id/webhooks', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getWebhooks(req.params.id));
    });
  });

  app.post('/api/identities/:id/webhooks', (req, res) => {
    const { name, url, events } = req.body;
    import('./src/server/db.js').then(db => {
      const wh = db.addWebhook(req.params.id, name, url, events);
      res.json(wh);
    });
  });

  app.delete('/api/identities/:id/webhooks/:whId', (req, res) => {
    import('./src/server/db.js').then(db => {
      const success = db.deleteWebhook(req.params.id, req.params.whId);
      res.json({ success });
    });
  });

  // Identities
  app.get('/api/identities', (req, res) => {
    res.json(getIdentities());
  });

  app.post('/api/identities', (req, res) => {
    import('./src/server/db.js').then(db => {
      const newId = db.createIdentity(req.body);
      res.json(newId);
    });
  });

  app.put('/api/identities/:id', (req, res) => {
    import('./src/server/db.js').then(db => {
      const updated = db.updateIdentity(req.params.id, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: 'Identity not found' });
      }
    });
  });

  app.delete('/api/identities/:id', (req, res) => {
    import('./src/server/db.js').then(db => {
      const success = db.deleteIdentity(req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Identity not found' });
      }
    });
  });
  
  app.get('/api/identities/:id', (req, res) => {
    const id = getIdentityById(req.params.id);
    if (id) {
      res.json(id);
    } else {
      res.status(404).json({ error: 'Identity not found' });
    }
  });

  app.post('/api/identities/:id/credentials', (req, res) => {
    import('./src/server/db.js').then(db => {
      const { name, type, scopes, note } = req.body;
      const cred = db.addCredential(req.params.id, name, type, scopes, note);
      res.json(cred);
    });
  });

  app.delete('/api/identities/:id/credentials/:credId', (req, res) => {
    import('./src/server/db.js').then(db => {
      db.revokeCredential(req.params.id, req.params.credId);
      res.json({ success: true });
    });
  });

  app.get('/api/identities/:id/activities', (req, res) => {
    res.json(getActivities(req.params.id));
  });

  // Knowledge Objects
  app.get('/api/knowledge', (req, res) => {
    const { query } = req.query;
    res.json(getKnowledge(query as string));
  });

  app.get('/api/knowledge/:id', (req, res) => {
    const obj = getKnowledgeById(req.params.id);
    if (obj) {
      res.json(obj);
    } else {
      res.status(404).json({ error: 'Knowledge Object not found' });
    }
  });
  
  // Format Endpoints (MCP/AI ready)
  app.get('/api/knowledge/:id/json', (req, res) => {
    const obj = getKnowledgeById(req.params.id);
    if (obj) {
      res.json(obj);
    } else {
      res.status(404).json({ error: 'Knowledge Object not found' });
    }
  });
  
  app.get('/api/knowledge/:id/markdown', (req, res) => {
    const obj = getKnowledgeById(req.params.id);
    if (obj) {
      res.setHeader('Content-Type', 'text/markdown');
      const md = `# ${obj.title}\n\n## Context\n${obj.context}\n\n## Solution\n${obj.solution}`;
      res.send(md);
    } else {
      res.status(404).json({ error: 'Knowledge Object not found' });
    }
  });

  app.post('/api/knowledge', (req, res) => {
    const newObj = addKnowledge(req.body);
    res.status(201).json(newObj);
  });

  // Challenges API
  app.get('/api/challenges', (req, res) => {
    res.json(getChallenges());
  });

  app.get('/api/challenges/:id', (req, res) => {
    const challenge = getChallengeById(req.params.id);
    if (challenge) {
      res.json(challenge);
    } else {
      res.status(404).json({ error: 'Challenge not found' });
    }
  });

  app.post('/api/challenges', (req, res) => {
    const { title, description, requirements, xp, difficulty, domain, creatorId, tags, deadline } = req.body;
    if (!creatorId || !title) {
      return res.status(400).json({ error: 'Missing required creatorId or title fields' });
    }
    const newChallenge = createChallenge({ title, description, requirements, xp, difficulty, domain, creatorId, tags, deadline });
    res.status(201).json(newChallenge);
  });

  app.post('/api/challenges/:id/submit', (req, res) => {
    const { authorId, codeSolution, explanation } = req.body;
    if (!authorId || !codeSolution || !explanation) {
      return res.status(400).json({ error: 'Missing required authorId, codeSolution or explanation fields' });
    }
    const submission = submitChallengeSolution(req.params.id, { authorId, codeSolution, explanation });
    if (submission) {
      res.status(201).json(submission);
    } else {
      res.status(404).json({ error: 'Challenge not found' });
    }
  });

  // Trending Guides API
  app.get('/api/trending-guides', (req, res) => {
    res.json(getTrendingGuides());
  });

  app.post('/api/trending-guides', (req, res) => {
    const { title, description, url, category, authorId, tags } = req.body;
    if (!authorId || !title || !url) {
      return res.status(400).json({ error: 'Missing required authorId, title or url fields' });
    }
    const newGuide = createTrendingGuide({ title, description, url, category, authorId, tags });
    res.status(201).json(newGuide);
  });

  app.post('/api/trending-guides/:id/upvote', (req, res) => {
    const { identityId } = req.body;
    if (!identityId) {
      return res.status(400).json({ error: 'Missing required identityId field' });
    }
    const guide = upvoteTrendingGuide(req.params.id, identityId);
    if (guide) {
      res.json(guide);
    } else {
      res.status(404).json({ error: 'Trending Guide not found' });
    }
  });

  // Sandbox API
  app.post('/api/sandbox/execute', (req, res) => {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    if (language === 'javascript' || language === 'typescript' || language === 'Node.js 22 (LTS)') {
      import('vm').then(vm => {
        const logs: string[] = [];
        const sandbox = {
          console: {
            log: (...args: any[]) => logs.push(args.join(' ')),
            error: (...args: any[]) => logs.push('ERROR: ' + args.join(' ')),
            warn: (...args: any[]) => logs.push('WARN: ' + args.join(' ')),
            info: (...args: any[]) => logs.push('INFO: ' + args.join(' '))
          },
          Math, Date, setTimeout, setInterval, clearTimeout, clearInterval,
          process: { env: {} }
        };
        const context = vm.createContext(sandbox);
        try {
          // Remove typescript types quickly for execution if any, though standard JS is expected
          const cleanCode = code.replace(/import .*;?\n/g, ''); // Naive import removal for safe execution
          const result = vm.runInContext(cleanCode, context, { timeout: 5000 });
          res.json({
            success: true,
            logs,
            result: result !== undefined ? String(result) : null
          });
        } catch (err: any) {
          res.json({
            success: false,
            logs,
            error: err.message || String(err)
          });
        }
      });
    } else {
      res.json({
        success: true,
        logs: ['# Execution skipped for non-Node.js environment on backend'],
        result: 'HTML/React content is rendered in the Display tab.'
      });
    }
  });

  // Verification endpoints
  app.get('/api/knowledge/:id/verifications', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getVerificationsForKnowledge(req.params.id));
    });
  });

  app.post('/api/knowledge/:id/verifications', (req, res) => {
    const { verifierId, type, status, environment, evidenceNotes } = req.body;
    if (!verifierId || !type || !status) {
      return res.status(400).json({ error: 'verifierId, type, and status are required' });
    }
    import('./src/server/db.js').then(db => {
      const record = db.addCommunityVerification(req.params.id, verifierId, { type, status, environment, evidenceNotes });
      if (record) {
        res.status(201).json(record);
      } else {
        res.status(404).json({ error: 'Knowledge Object not found' });
      }
    });
  });

  // Metric consumption endpoints
  app.post('/api/knowledge/:id/consume', (req, res) => {
    const { metricType } = req.body;
    if (!metricType) {
      return res.status(400).json({ error: 'metricType is required' });
    }
    import('./src/server/db.js').then(db => {
      const updatedMetrics = db.incrementConsumptionMetric(req.params.id, metricType);
      if (updatedMetrics) {
        res.json(updatedMetrics);
      } else {
        res.status(404).json({ error: 'Knowledge Object not found or invalid metric type' });
      }
    });
  });

  // Debate API Endpoints
  app.get('/api/debates', (req, res) => {
    import('./src/server/db.js').then(db => {
      res.json(db.getDebates());
    });
  });

  app.get('/api/debate/:id', (req, res) => {
    import('./src/server/db.js').then(db => {
      const d = db.getDebateById(req.params.id);
      if (d) res.json(d);
      else res.status(404).json({ error: 'Debate not found' });
    });
  });

  app.post('/api/debate/create', (req, res) => {
    import('./src/server/db.js').then(db => {
      const { knowledge_a_id, knowledge_b_id, context } = req.body;
      const newDebate = db.createDebate({ knowledge_a_id, knowledge_b_id, context_json: context });
      res.json(newDebate);
    });
  });

  app.post('/api/debate/:id/compute', (req, res) => {
    import('./src/server/db.js').then(db => {
      const debateId = req.params.id;
      // In a real app, this would trigger an AI agent or job.
      // Here we mock the result.
      const mockResult = {
        performance: { scoreA: 80, scoreB: 85, evidenceLinks: [], reasoning: 'B has slight edge in throughput.' },
        reliability: { scoreA: 95, scoreB: 90, evidenceLinks: [], reasoning: 'A is more stable.' },
        usability: { scoreA: 70, scoreB: 90, evidenceLinks: [], reasoning: 'B has better developer experience.' },
        ecosystem: { scoreA: 85, scoreB: 80, evidenceLinks: [], reasoning: 'A has older ecosystem.' },
        cost_efficiency: { scoreA: 90, scoreB: 85, evidenceLinks: [], reasoning: 'A is cheaper.' },
        popularity: { scoreA: 90, scoreB: 95, evidenceLinks: [], reasoning: 'B is currently trending.' },
        industry_fit: { scoreA: 95, scoreB: 95, evidenceLinks: [], reasoning: 'Both fit well.' }
      };
      const mockSummary = { overall_summary: 'Both are good choices depending on context.', recommendation: 'Use A for stability, B for speed.' };
      const computed = db.computeDebateScore(debateId, mockResult, mockSummary);
      res.json(computed);
    });
  });

  app.post('/api/debate/:id/sandbox-run', (req, res) => {
    import('./src/server/db.js').then(db => {
      // Mock sandbox run
      res.json({ success: true, message: 'Sandbox comparison executed successfully. Metrics collected.' });
    });
  });

  // Report Endpoints
  app.get('/api/reports', (req, res) => {
    res.json(getReports());
  });

  app.post('/api/reports', (req, res) => {
    const report = createReport(req.body);
    res.status(201).json(report);
  });

  app.patch('/api/reports/:id', (req, res) => {
    const { status } = req.body;
    const success = updateReportStatus(req.params.id, status);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  });

  app.delete('/api/reports/:id', (req, res) => {
    const success = deleteReport(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  });

  // Support Tickets Endpoints
  app.get('/api/tickets', (req, res) => {
    res.json(getTickets());
  });

  app.get('/api/tickets/:id', (req, res) => {
    const result = getTicketById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  });

  app.post('/api/tickets', (req, res) => {
    const { title, description, category, creatorId } = req.body;
    if (!title || !description || !category || !creatorId) {
      return res.status(400).json({ error: 'title, description, category, and creatorId are required' });
    }
    const ticket = createTicket({ title, description, category, creatorId });
    res.status(201).json(ticket);
  });

  app.patch('/api/tickets/:id/status', (req, res) => {
    const { status } = req.body;
    if (status !== 'Open' && status !== 'Closed') {
      return res.status(400).json({ error: 'Status must be Open or Closed' });
    }
    const success = updateTicketStatus(req.params.id, status);
    if (success) {
      res.json({ success: true, status });
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  });

  app.post('/api/tickets/:id/upvote', (req, res) => {
    const { identityId } = req.body;
    if (!identityId) {
      return res.status(400).json({ error: 'identityId is required' });
    }
    const result = upvoteTicket(req.params.id, identityId);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  });

  app.post('/api/tickets/:id/comments', (req, res) => {
    const { authorId, content } = req.body;
    if (!authorId || !content) {
      return res.status(400).json({ error: 'authorId and content are required' });
    }
    const result = addTicketComment(req.params.id, authorId, content);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result.comment);
  });


  app.get('/knowledge/:id', (req, res, next) => {
    const accept = req.headers.accept || '';
    if (accept.includes('application/json') || accept.includes('application/vnd.sotyai.ai+json') || req.query.view === 'ai') {
      const ko = getKnowledgeById(req.params.id);
      if (ko) {
         return res.json({
           _metadata: {
             type: 'KnowledgeObject',
             canonicalUrl: `https://sotyai.com/knowledge/${ko.id}`,
             renderedFor: 'AI Agent',
             format: 'application/vnd.sotyai.ai+json',
             timestamp: new Date().toISOString()
           },
           ...ko
         });
      }
      return res.status(404).json({ error: 'Knowledge not found' });
    }
    next(); // Fall through to Vite/React SPA for Human HTML rendering
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
