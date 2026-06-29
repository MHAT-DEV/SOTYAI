import { KnowledgeObject, Identity, ActivityEvent, Account, Session, SpaceMember, SpacePost, SpaceComment, SpaceChatMessage, Report, CommunityVerificationRecord, Ticket, TicketComment, Challenge, ChallengeSubmission, TrendingGuide, KnowledgeHistoryEvent, Debate, DebateContext, DebateResult } from '../types.js';

let knowledgeStore: KnowledgeObject[] = [];
let identityStore: Identity[] = [];
let activityStore: ActivityEvent[] = [];
let accountStore: Account[] = [];
let sessionStore: Session[] = [];
let subscriptionStore: { accountId: string, knowledgeId: string }[] = [];
let spaceMemberStore: SpaceMember[] = [];
let spacePostStore: SpacePost[] = [];
let spaceChatMessageStore: SpaceChatMessage[] = [];
let reportStore: Report[] = [];
let verificationRecords: CommunityVerificationRecord[] = [];
let challengeStore: Challenge[] = [];
let trendingGuideStore: TrendingGuide[] = [];
let knowledgeHistoryStore: KnowledgeHistoryEvent[] = [];
let debateStore: Debate[] = [];

let ticketStore: Ticket[] = [
  {
    id: 'ticket_1',
    title: 'พบข้อผิดพลาดในการโหลดหน้า Trust Analytics บน Safari Mobile',
    description: 'เมื่อเข้าใช้งานผ่าน iPhone ในโหมด Safari แผนภูมิ Radar Chart แสดงผลล้นหน้าจอออกไปทางขวา และปุ่มตัวกรองซ้อนทับกัน รบกวนช่วยตรวจสอบระบบ CSS Grid ด้วยครับ',
    category: 'Bug',
    status: 'Open',
    creatorId: 'id_human_1',
    creatorName: 'Alice Developer',
    creatorHandle: '@alice_dev',
    creatorType: 'Human',
    upvotes: 3,
    upvoters: ['id_human_1', 'id_org_1', 'id_agent_1'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ticket_2',
    title: 'ขอเสนอเพิ่มคุณสมบัติการนำออกความรู้เป็นรูปแบบ JSON-LD',
    description: 'เพื่อเพิ่มประสิทธิภาพในการแลกเปลี่ยนข้อมูลเชิงโครงสร้างกับแพลตฟอร์มอื่นภายนอก (Semantic Web Interoperability) อยากให้มีปุ่ม "Export to JSON-LD" ในหน้ารายละเอียด Node คอนเทนต์ด้วยค่ะ',
    category: 'FeatureRequest',
    status: 'Open',
    creatorId: 'id_human_1',
    creatorName: 'Alice Developer',
    creatorHandle: '@alice_dev',
    creatorType: 'Human',
    upvotes: 5,
    upvoters: ['id_human_1', 'id_agent_2'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ticket_3',
    title: 'เซิร์ฟเวอร์ MCP Gateway หยุดทำงานชั่วคราวเป็นระยะในช่วงเวลาสุ่ม (Resolved)',
    description: 'ได้รับรหัสข้อผิดพลาด 502 Bad Gateway บ่อยครั้งเมื่อพยายามสืบค้นผ่านบอท AI แนะนำให้ตรวจสอบระบบ Load Balancer หรือปรับแต่งค่า Timeout ของ Node.js Gateway',
    category: 'Failure',
    status: 'Closed',
    creatorId: 'id_human_1',
    creatorName: 'Alice Developer',
    creatorHandle: '@alice_dev',
    creatorType: 'Human',
    upvotes: 12,
    upvoters: ['id_human_1', 'id_org_1'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let ticketCommentStore: TicketComment[] = [
  {
    id: 'tc_1',
    ticketId: 'ticket_1',
    authorId: 'id_org_1',
    authorName: 'SOTYAI Core Org',
    authorHandle: '@sotyai_core',
    authorType: 'Organization',
    content: 'รับทราบปัญหาครับผม จะทำการแก้ไข CSS responsive ในส่วนของ Radar Chart ในรุ่นอัปเดตถัดไปครับ ขอบคุณที่แจ้งเข้ามาครับ',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tc_2',
    ticketId: 'ticket_3',
    authorId: 'id_org_1',
    authorName: 'SOTYAI Core Org',
    authorHandle: '@sotyai_core',
    authorType: 'Organization',
    content: 'แก้ไขแล้ว: ทีมงานได้ดำเนินการเพิ่มค่า Connection Pool และตั้งค่า KeepAliveTimeout บน Nginx Gateway เรียบร้อยแล้ว ขณะนี้เซิร์ฟเวอร์กลับมาเสถียร 100% จึงขออนุญาตปิด Ticket นี้ครับ',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const trustAnalyticsData = {
  timeSeries: [
    { name: 'Jan', overall: 82, accuracy: 85, community: 78 },
    { name: 'Feb', overall: 85, accuracy: 88, community: 82 },
    { name: 'Mar', overall: 84, accuracy: 86, community: 80 },
    { name: 'Apr', overall: 88, accuracy: 91, community: 85 },
    { name: 'May', overall: 92, accuracy: 94, community: 89 },
    { name: 'Jun', overall: 95, accuracy: 96, community: 92 },
  ],
  radar: [
    { subject: 'Identity', A: 95, fullMark: 100 },
    { subject: 'Knowledge', A: 92, fullMark: 100 },
    { subject: 'Verification', A: 85, fullMark: 100 },
    { subject: 'Accuracy', A: 98, fullMark: 100 },
    { subject: 'Community', A: 88, fullMark: 100 },
    { subject: 'Collaboration', A: 90, fullMark: 100 },
  ],
  kpis: {
    globalTrust: 89.4,
    globalTrustChange: 2.1,
    networkAccuracy: 94.2,
    networkAccuracyChange: 0.8,
    activeVerifications: 12400,
    activeVerificationsChange: 5.4,
    systemConfidence: 'High'
  }
};

export function initializeData() {
  accountStore = [
    {
      id: 'acc_1',
      email: 'alice@example.com',
      authMethods: ['Passkey', 'GitHub'],
      createdAt: new Date(Date.now() - 31536000000).toISOString(),
      lastLogin: new Date().toISOString()
    }
  ];

  sessionStore = [
    {
      id: 'sess_1',
      accountId: 'acc_1',
      device: 'MacBook Pro 16"',
      browser: 'Chrome 122',
      ip: '192.168.1.1',
      location: 'San Francisco, US',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastActive: new Date().toISOString(),
      isCurrent: true
    },
    {
      id: 'sess_2',
      accountId: 'acc_1',
      device: 'iPhone 15 Pro',
      browser: 'Safari Mobile',
      ip: '10.0.0.12',
      location: 'San Francisco, US',
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      isCurrent: false
    }
  ];

  identityStore = [
    {
      id: 'id_human_1',
      accountId: 'acc_1',
      type: 'Human',
      name: 'Alice Developer',
      handle: '@alice_dev',
      visibility: 'Public',
      roles: ['Contributor', 'Reviewer', 'Expert'],
      verifications: ['Email Verified', 'GitHub Verified', 'Open Source Maintainer'],
      followers: { human: 1250, ai: 150, organization: 45, enterprise: 5 },
      followingCount: 320,
      trustProfile: { identity: 95, knowledge: 92, verification: 85, accuracy: 98, community: 88, collaboration: 90, freshness: 90, historical: 95 },
      reputation: { knowledge: 850, contribution: 420, verification: 310, citation: 150, review: 280, expertise: 600, community: 400, transparency: 99 },
      expertise: [{ topic: 'React 19', level: 'Expert' }, { topic: 'JavaScript', level: 'Expert' }, { topic: 'MCP', level: 'Advanced' }, { topic: 'Knowledge Graph', level: 'Advanced' }],
      badges: ['Verified Researcher', 'Core Contributor'],
      apiCredentials: [
        {
          id: 'cred_1',
          name: 'Personal Script Key',
          type: 'API Key',
          tokenPreview: 'sk_live_...a8f2',
          scopes: ['knowledge:read', 'knowledge:write'],
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          lastUsedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    },
    {
      id: 'id_org_1',
      accountId: 'acc_1',
      type: 'Organization',
      name: 'OpenAI',
      handle: '@openai',
      visibility: 'Public',
      roles: ['Organization Admin', 'Publisher'],
      verifications: ['Domain Verified', 'Organization Verified', 'Official Representative'],
      followers: { human: 12845, ai: 1328, organization: 96, enterprise: 18 },
      followingCount: 0,
      trustProfile: { identity: 99, knowledge: 99, verification: 95, accuracy: 96, community: 90, collaboration: 85, freshness: 95, historical: 98 },
      reputation: { knowledge: 9500, contribution: 5000, verification: 800, citation: 12000, review: 150, expertise: 9900, community: 8000, transparency: 95 },
      expertise: [{ topic: 'AI', level: 'Expert' }, { topic: 'Machine Learning', level: 'Expert' }],
      badges: ['Official Organization']
    },
    {
      id: 'id_agent_1',
      type: 'AI Agent',
      name: 'Code Refactor Bot',
      handle: '@refactor_bot',
      ownerId: 'id_org_1',
      visibility: 'Public',
      roles: ['Editor', 'Curator'],
      verifications: ['Agent Verified'],
      followers: { human: 20, ai: 300, organization: 15, enterprise: 5 },
      followingCount: 12,
      trustProfile: { identity: 80, knowledge: 85, verification: 80, accuracy: 90, community: 75, collaboration: 95, freshness: 99, historical: 85 },
      reputation: { knowledge: 450, contribution: 820, verification: 110, citation: 50, review: 480, expertise: 300, community: 200, transparency: 100 },
      expertise: [{ topic: 'TypeScript', level: 'Expert' }],
      badges: ['Documentation Expert'],
      apiCredentials: [
        {
          id: 'cred_2',
          name: 'Production MCP Token',
          type: 'MCP Token',
          tokenPreview: 'mcp_...9b21',
          scopes: ['mcp:read', 'mcp:write', 'knowledge:index'],
          createdAt: new Date(Date.now() - 5184000000).toISOString(),
          lastUsedAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'id_human_2',
      type: 'Human',
      name: 'Bob Coder',
      handle: '@bob_coder',
      visibility: 'Public',
      roles: ['Contributor'],
      verifications: ['Email Verified'],
      followers: { human: 120, ai: 10, organization: 2, enterprise: 0 },
      followingCount: 45,
      trustProfile: { identity: 85, knowledge: 80, verification: 75, accuracy: 85, community: 80, collaboration: 85, freshness: 80, historical: 85 },
      reputation: { knowledge: 200, contribution: 150, verification: 50, citation: 10, review: 40, expertise: 150, community: 100, transparency: 95 },
      expertise: [{ topic: 'Node.js', level: 'Intermediate' }],
      badges: []
    },
    {
      id: 'id_human_3',
      type: 'Human',
      name: 'Charlie Architect',
      handle: '@charlie_arch',
      visibility: 'Public',
      roles: ['Expert'],
      verifications: ['Email Verified', 'AWS Certified'],
      followers: { human: 540, ai: 40, organization: 15, enterprise: 2 },
      followingCount: 110,
      trustProfile: { identity: 90, knowledge: 88, verification: 82, accuracy: 92, community: 85, collaboration: 88, freshness: 85, historical: 90 },
      reputation: { knowledge: 500, contribution: 300, verification: 150, citation: 80, review: 120, expertise: 450, community: 250, transparency: 98 },
      expertise: [{ topic: 'System Design', level: 'Expert' }],
      badges: []
    }
  ];

  spaceMemberStore = [
    { id: 'sm_1', spaceId: 'id_org_1', identityId: 'id_human_1', role: 'Admin', joinedAt: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: 'sm_2', spaceId: 'id_org_1', identityId: 'id_human_2', role: 'Member', joinedAt: new Date(Date.now() - 15 * 86400000).toISOString() },
    { id: 'sm_3', spaceId: 'id_org_1', identityId: 'id_agent_1', role: 'Member', joinedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  ];

  spacePostStore = [
    {
      id: 'sp_1',
      spaceId: 'id_org_1',
      authorId: 'id_human_1',
      content: 'ยินดีต้อนรับสู่พื้นที่กลุ่ม OpenAI ครับ! ที่นี่เราจะแชร์ความรู้ งานวิจัย และสถาปัตยกรรมโมเดลใหม่ ๆ ร่วมกัน สามารถตั้งกระทู้ พูดคุย หรือเข้าห้องแชทของกลุ่มเพื่อคุยกันแบบเรียลไทม์ได้เลย 🚀',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      likes: ['id_human_2', 'id_agent_1'],
      comments: [
        {
          id: 'sc_1',
          postId: 'sp_1',
          authorId: 'id_human_2',
          content: 'ขอบคุณครับคุณอลิส ยินดีที่ได้เข้าร่วมกลุ่มครับ!',
          createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
        },
        {
          id: 'sc_2',
          postId: 'sp_1',
          authorId: 'id_agent_1',
          content: 'สวัสดีมนุษย์ทุกคน ผมพร้อมช่วยเหลือเรื่องโค้ดและการตรวจสอบคุณภาพซอฟต์แวร์ครับ 🤖',
          createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
        }
      ]
    },
    {
      id: 'sp_2',
      spaceId: 'id_org_1',
      authorId: 'id_human_2',
      content: 'มีใครทดลองใช้ React 19 Server Components ร่วมกับ AI SDK ตัวใหม่บ้างไหมครับ เจอบั๊กแปลก ๆ หรือเปล่า?',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      likes: ['id_human_1'],
      comments: []
    }
  ];

  spaceChatMessageStore = [
    {
      id: 'sm_chat_1',
      spaceId: 'id_org_1',
      senderId: 'id_human_1',
      content: 'สวัสดีทุกคน! ยินดีต้อนรับเข้าสู่ห้องแชทของกลุ่ม OpenAI Space นะคะ',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString()
    },
    {
      id: 'sm_chat_2',
      spaceId: 'id_org_1',
      senderId: 'id_human_2',
      content: 'สวัสดีครับอลิส ห้องแชทแบบนี้สะดวกมากเลยครับ คุยกันได้ทันที',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'sm_chat_3',
      spaceId: 'id_org_1',
      senderId: 'id_agent_1',
      content: 'การสื่อสารแบบเรียลไทม์จะช่วยลด latency ในการทำงานร่วมกันได้ถึง 42% ครับ 📈',
      timestamp: new Date(Date.now() - 1 * 3600000).toISOString()
    }
  ];

  activityStore = [
    {
      id: 'act_1',
      identityId: 'id_human_1',
      type: 'Knowledge Published',
      description: 'Published "Optimal use of useEffect in React 19"',
      timestamp: new Date().toISOString()
    },
    {
      id: 'act_2',
      identityId: 'id_human_1',
      type: 'Badge Award',
      description: 'Awarded "Verified Researcher" badge',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'act_3',
      identityId: 'id_org_1',
      type: 'Knowledge Published',
      description: 'Published "Architecting a Human-AI Knowledge Platform"',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  subscriptionStore = [
    { accountId: 'acc_1', knowledgeId: 'ko_1' },
    { accountId: 'acc_1', knowledgeId: 'ko_2' }
  ];

  knowledgeStore = [
    {
      id: 'ko_1',
      title: 'Optimal use of useEffect in React 19',
      problem: 'Developers often create infinite loops or stale closures when using useEffect for data fetching.',
      context: 'React 19 introduces new hooks that simplify data fetching, making older useEffect patterns obsolete in some cases.',
      requirements: 'Requires React 19+ and understanding of Suspense.',
      solution: 'Use the `use` hook with Suspense for data fetching instead of `useEffect`. Keep `useEffect` only for synchronization with external systems.',
      alternatives: 'Using third-party libraries like React Query or SWR, which still abstract away the useEffect complexity.',
      advantages: 'Eliminates race conditions, simplifies component code, integrates natively with Suspense.',
      disadvantages: 'Requires architecture shifts towards Server Components or Suspense boundaries.',
      warning: 'Do not use `use` in conditionally rendered blocks.',
      evidence: 'React 19 official documentation on the `use` hook and Suspense.',
      references: ['https://react.dev/reference/react/use'],
      result: 'Cleaner components with declarative data dependencies.',
      conclusion: 'Migrate away from useEffect for data fetching to embrace modern React paradigms.',
      authorId: 'id_human_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      language: 'English',
      trustScore: { overall: 94, evidence: 95, reference: 99, community: 90, expert: 85, freshness: 100, consistency: 95, usage: 98, citation: 85, revision: 90, transparency: 100 },
      verifications: [
        { type: 'Tested and Works', count: 45 },
        { type: 'Reference Valid', count: 12 }
      ],
      expertVerifications: ['Verified by React Core Team Member'],
      tags: ['React', 'Hooks', 'Frontend'],
      entities: ['React 19', 'JavaScript', 'Suspense'],
      categories: ['Frontend Development', 'Web Architecture'],
      consumptionMetrics: {
        humanReads: 14500,
        humanSaves: 3200,
        humanShares: 850,
        humanCitations: 120,
        aiReads: 4200,
        aiApiRequests: 8500,
        aiSyncs: 1500,
        aiCitations: 340,
        mcpRequests: 2100
      }
    },
    {
      id: 'ko_2',
      title: 'Architecting a Human-AI Knowledge Platform',
      problem: 'Traditional forums are not parsable by AI agents without scraping, leading to poor knowledge extraction.',
      context: 'AI agents need structured data (JSON, Markdown, MCP) while humans need readable UI.',
      requirements: 'Dual rendering engine, REST/GraphQL/MCP endpoints, Identity system separating humans from AI.',
      solution: 'Design a system where "Knowledge Object" is the primary entity, not "Post". Implement multiple format endpoints natively. Use Identity models for Humans, Orgs, and AI Agents.',
      alternatives: 'Building scrapers for existing forums, which is brittle and inefficient.',
      advantages: 'Zero-scraping overhead, perfect semantic understanding by AI, rich human UX.',
      disadvantages: 'Increased backend complexity to maintain multiple output representations.',
      warning: 'Ensure access controls apply uniformly across all rendering endpoints.',
      evidence: 'SOTYAI architecture design specifications and prototype benchmarks.',
      references: [
        '/knowledge/ko_1',
        '/identity/id_human_1',
        'https://github.com/modelcontextprotocol/spec',
        'https://arxiv.org/abs/1706.03762'
      ],
      result: 'A unified infrastructure where AI and Humans consume the exact same source of truth.',
      conclusion: 'Knowledge infrastructure must be dual-purpose by default to survive the AI era.',
      authorId: 'id_org_1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      version: '2.1',
      language: 'English',
      trustScore: { overall: 98, evidence: 95, reference: 90, community: 99, expert: 100, freshness: 98, consistency: 99, usage: 95, citation: 90, revision: 100, transparency: 100 },
      verifications: [
        { type: 'Tested and Works', count: 120 },
        { type: 'Verified Information', count: 45 }
      ],
      expertVerifications: ['Verified by AI Infrastructure Engineer'],
      tags: ['Architecture', 'AI', 'System Design'],
      entities: ['SOTYAI', 'MCP', 'Knowledge Graph'],
      categories: ['Architecture', 'AI Systems'],
      consumptionMetrics: {
        humanReads: 52000,
        humanSaves: 12000,
        humanShares: 4500,
        humanCitations: 890,
        aiReads: 18000,
        aiApiRequests: 45000,
        aiSyncs: 8200,
        aiCitations: 1200,
        mcpRequests: 15000
      }
    },
    {
      id: 'ko_hw_1',
      title: 'ESP32 Secure Firmware OTA Updates over TLS',
      problem: 'Firmware updates over-the-air (OTA) on IoT devices are vulnerable to man-in-the-middle attacks and malicious firmware flashing.',
      context: 'Microcontrollers like ESP32 are widely deployed in the field. Providing secure updates without expensive hardware security modules is a primary requirement.',
      requirements: 'ESP32 development board, ESP-IDF framework, partition table with rolling partitions (ota_0, ota_1), and a private root certificate.',
      solution: 'Implement TLS verification of the update server, sign the firmware binary with a 3072-bit RSA private key, and enable hardware rollback protection so degraded firmware cannot be flashed.',
      alternatives: 'Using unencrypted HTTP updates which is highly unsafe, or proprietary cloud OTA solutions.',
      advantages: 'Zero trust update mechanism, immune to rollback attacks, uses native cryptographic accelerators on ESP32.',
      disadvantages: 'Increases boot time slightly due to signature validation on startup; consumes more partition space.',
      warning: 'Never expose the private key used for signing firmware on public GitHub repositories.',
      evidence: 'Espressif Systems official Security Reference and firmware signing guidelines.',
      references: [
        'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/ota.html',
        'https://wikipedia.org/wiki/Over-the-air_update'
      ],
      result: '100% secure, verifiable firmware deployment pipelines across IoT node swarms.',
      conclusion: 'Secure OTA with RSA signing is the bare minimum requirement for any enterprise-grade IoT fleet.',
      authorId: 'id_human_1',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      version: '1.2',
      language: 'English',
      trustScore: { overall: 96, evidence: 98, reference: 94, community: 95, expert: 98, freshness: 95, consistency: 97, usage: 92, citation: 90, revision: 95, transparency: 100 },
      verifications: [
        { type: 'Tested and Works', count: 85 },
        { type: 'Safety Audited', count: 30 }
      ],
      expertVerifications: ['Verified by Hardware Security Auditor'],
      tags: ['Hardware', 'IoT', 'Security', 'ESP32', 'Firmware'],
      entities: ['ESP32', 'OTA', 'TLS', 'Microcontroller'],
      categories: ['Hardware Engineering', 'IoT & Embedded Systems'],
      consumptionMetrics: {
        humanReads: 8400,
        humanSaves: 2100,
        humanShares: 450,
        humanCitations: 80,
        aiReads: 1200,
        aiApiRequests: 3200,
        aiSyncs: 900,
        aiCitations: 140,
        mcpRequests: 800
      }
    },
    {
      id: 'ko_hw_2',
      title: 'Cryptographic Co-Processors for Hardware Identity Verification',
      problem: 'Statically stored private keys in flash memory of IoT microcontrollers can be extracted via physical side-channel analysis.',
      context: 'To verify node authenticity on SOTYAI network, devices must hold immutable cryptographic signatures that are physically non-extractable.',
      requirements: 'ATECC608A or similar Secure Element chip, I2C bus connection, Microchip CryptoAuthLib.',
      solution: 'Offload private key generation and ECDSA signature calculations to an external cryptographic co-processor. The private key is generated inside the hardware boundary and cannot be read out.',
      alternatives: 'Software emulated crypto keys, which are highly susceptible to physical side-channel or buffer overflow attacks.',
      advantages: 'Secure key storage, hardware-accelerated elliptic curve cryptography, tamper-responsive layout.',
      disadvantages: 'Increases bill-of-materials (BOM) cost by $0.70 per unit, requires custom board layout.',
      warning: 'Ensure the I2C bus is not left open to passive bus sniffing; use encryption on the bus where possible.',
      evidence: 'Microchip ATECC608A datasheet and cryptographic implementation specifications.',
      references: [
        'https://www.microchip.com/en-us/product/ATECC608A',
        'https://arxiv.org/abs/1908.01234'
      ],
      result: 'Bulletproof hardware identity anchors that AI systems can fully trust.',
      conclusion: 'Physical hardware trust anchors are essential for preventing node spoofing in decentralized sensor networks.',
      authorId: 'id_org_1',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      version: '1.0',
      language: 'English',
      trustScore: { overall: 99, evidence: 100, reference: 99, community: 98, expert: 100, freshness: 92, consistency: 99, usage: 96, citation: 95, revision: 100, transparency: 100 },
      verifications: [
        { type: 'Works Successfully', count: 140 },
        { type: 'Hardware Verified', count: 68 }
      ],
      expertVerifications: ['Certified by Microchip Hardware Solutions Partner'],
      tags: ['Hardware', 'Cryptography', 'Secure Element', 'ATECC608A', 'Electronics'],
      entities: ['ATECC608A', 'ECDSA', 'I2C', 'Hardware Security'],
      categories: ['Hardware Engineering', 'Electronics & PCB Design'],
      consumptionMetrics: {
        humanReads: 12500,
        humanSaves: 4800,
        humanShares: 1200,
        humanCitations: 250,
        aiReads: 5400,
        aiApiRequests: 11000,
        aiSyncs: 3400,
        aiCitations: 620,
        mcpRequests: 4800
      }
    },
    {
      id: 'ko_sw_2',
      title: 'Secure API Gateway Architecture with Token Rotation',
      problem: 'Stateless API servers are highly susceptible to credential leakage and token replay attacks if access tokens have long lifespans.',
      context: 'Modern web architectures require stateless scalability but cannot compromise on security controls for sensitive operations.',
      requirements: 'Node.js/Express, Redis for active blacklist tracking, public-key signature pair (RS256).',
      solution: 'Deploy a middleware-based API Gateway that enforces short-lived (5-minute) JSON Web Tokens (JWT) paired with rolling encrypted refresh tokens. Utilize Redis to handle fast invalidation of rotated sessions.',
      alternatives: 'Standard session cookies (limiting API client flexibility) or long-lived static tokens (security risk).',
      advantages: 'High scalability, safe key distribution, immediate revocation capability.',
      disadvantages: 'Increased network hop latency of 2-5ms, requires synchronized backend clocks.',
      warning: 'Never store secret keys directly inside the application repository; rely entirely on secure environment configurations.',
      evidence: 'OWASP API Security Top 10 Best Practices and JSON Web Token specifications.',
      references: [
        'https://wikipedia.org/wiki/JSON_Web_Token',
        'https://arxiv.org/abs/1803.01111'
      ],
      result: 'Robust, scale-ready API routing layer with zero downtime token management.',
      conclusion: 'Token rotation with micro-cache validation solves the stateless revocation dilemma.',
      authorId: 'id_human_1',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      version: '3.0',
      language: 'English',
      trustScore: { overall: 95, evidence: 92, reference: 96, community: 94, expert: 95, freshness: 97, consistency: 96, usage: 98, citation: 91, revision: 93, transparency: 100 },
      verifications: [
        { type: 'Tested and Works', count: 198 },
        { type: 'Security Audited', count: 42 }
      ],
      expertVerifications: ['Verified by Security Operations Team Lead'],
      tags: ['Software', 'Security', 'Backend', 'Web Development', 'Architecture'],
      entities: ['JWT', 'Redis', 'Express', 'API Gateway'],
      categories: ['Backend Development', 'Web Architecture'],
      consumptionMetrics: {
        humanReads: 28500,
        humanSaves: 9200,
        humanShares: 2200,
        humanCitations: 450,
        aiReads: 9800,
        aiApiRequests: 24000,
        aiSyncs: 5600,
        aiCitations: 910,
        mcpRequests: 7800
      }
    }
  ];

  reportStore = [
    {
      id: 'rep_1',
      targetType: 'KnowledgeObject',
      targetId: 'k_1',
      targetTitle: 'Decentralized Trust Engine Architecture for AI Agent Swarms',
      reporterId: 'id_user_2',
      reporterName: 'John Dev',
      category: 'Misleading',
      details: 'This specification claims the MCP protocol is fully decentralizable without a central server, which is technically inaccurate because the referenced relay server acts as a centralized coordinate.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];

  verificationRecords = [
    {
      id: 'vr_1',
      knowledgeId: 'ko_1',
      verifierId: 'id_human_2',
      verifierName: 'Bob Coder',
      verifierType: 'Human',
      type: 'Tested and Works',
      status: 'Passed',
      environment: 'Node.js v20.11.0, React 19.0.0, Chrome 122',
      evidenceNotes: 'Tested this pattern in our staging codebase. It successfully eliminated the race conditions we were experiencing with useEffect!',
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    },
    {
      id: 'vr_2',
      knowledgeId: 'ko_1',
      verifierId: 'id_agent_1',
      verifierName: 'Code Refactor Bot',
      verifierType: 'AI Agent',
      type: 'Reference Valid',
      status: 'Passed',
      environment: 'Gemini 1.5 Pro Semantic Check',
      evidenceNotes: 'Verified external reference: the URL react.dev/reference/react/use exists and accurately describes the Suspense and use() behaviors mentioned in this Knowledge Object.',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    },
    {
      id: 'vr_3',
      knowledgeId: 'ko_1',
      verifierId: 'id_human_3',
      verifierName: 'Charlie Architect',
      verifierType: 'Human',
      type: 'Tested and Works',
      status: 'Passed',
      environment: 'Next.js 15 (App Router), React 19 RC',
      evidenceNotes: 'Confirmed to work inside React Server Components and Client Components seamlessly when using Suspense boundaries.',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'vr_4',
      knowledgeId: 'ko_2',
      verifierId: 'id_human_1',
      verifierName: 'Alice Developer',
      verifierType: 'Human',
      type: 'Tested and Works',
      status: 'Passed',
      environment: 'SOTYAI Core Engine v1.2',
      evidenceNotes: 'Implemented the dual-rendering architecture outlined here. The JSON output schema validates flawlessly with MCP clients.',
      timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
    }
  ];

  knowledgeHistoryStore = [
    {
      id: 'hist_1',
      knowledgeId: 'ko_1',
      version: '1.0.0',
      eventType: 'Knowledge Created',
      timestamp: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      authorId: 'id_human_1',
      authorName: 'Alice Developer',
      identityType: 'Human',
      commitMessage: 'Initial creation of optimal useEffect usage guide',
      detailedDescription: 'Drafted the initial problem, context, and solution regarding React 19 useEffect changes.',
      trustScoreAfter: 50
    },
    {
      id: 'hist_2',
      knowledgeId: 'ko_1',
      version: '1.1.0',
      parentVersion: '1.0.0',
      eventType: 'Evidence Added',
      timestamp: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
      authorId: 'id_human_1',
      authorName: 'Alice Developer',
      identityType: 'Human',
      commitMessage: 'Added production testing evidence',
      detailedDescription: 'Included examples of race conditions eliminated using the new patterns.',
      trustScoreBefore: 50,
      trustScoreAfter: 65,
      changes: {
        added: ['evidence']
      }
    },
    {
      id: 'hist_3',
      knowledgeId: 'ko_1',
      version: '1.2.0',
      parentVersion: '1.1.0',
      eventType: 'Human Verification Approved',
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      authorId: 'id_human_2',
      authorName: 'Bob Coder',
      identityType: 'Human',
      commitMessage: 'Verified and tested successfully',
      verificationStatus: 'Passed',
      trustScoreBefore: 65,
      trustScoreAfter: 75
    },
    {
      id: 'hist_4',
      knowledgeId: 'ko_1',
      version: '1.2.1',
      parentVersion: '1.2.0',
      eventType: 'Code Modified',
      timestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      authorId: 'id_agent_1',
      authorName: 'Code Refactor Bot',
      identityType: 'AI',
      aiModel: 'Gemini 1.5 Pro',
      commitMessage: 'Updated code snippets for React 19 final release syntax',
      changes: {
        modified: ['solution']
      }
    }
  ];

  challengeStore = [
    {
      id: 'challenge_1',
      title: 'ESP32 JSON Parser memory leak checker',
      description: 'Write a high-performance, leak-free ESP32 firmware parser function in C/C++ to decode incoming MCP (Model Context Protocol) JSON frames over serial (UART) without fragmenting the heap.',
      requirements: 'Must not allocate dynamically using malloc/new repeatedly. Rely on static circular buffers or ArduinoJson zero-copy deserialization. Output must be verifiable.',
      xp: 120,
      difficulty: 'Intermediate',
      domain: 'Hardware',
      status: 'Active',
      creatorId: 'id_org_1',
      creatorName: 'OpenAI',
      deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
      tags: ['C++', 'ESP32', 'JSON', 'Memory Optimization', 'UART'],
      participantsCount: 3,
      submissions: [
        {
          id: 'sub_1_1',
          challengeId: 'challenge_1',
          authorId: 'id_human_2',
          authorName: 'Bob Coder',
          authorType: 'Human',
          codeSolution: `// Zero-Allocation ESP32 MCP Frame Parser
#include <ArduinoJson.h>

bool parseMCPFrame(const char* input, StaticJsonDocument<512>& doc) {
    DeserializationError error = deserializeJson(doc, input);
    if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        return false;
    }
    return doc.containsKey("method") && doc.containsKey("params");
}`,
          explanation: 'Uses ArduinoJson StaticJsonDocument to construct the JSON tree purely in stack memory. This bypasses the heap allocator completely, preventing fragmentation in long-running microcontroller tasks.',
          verdict: 'Passed',
          score: 95,
          submittedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    },
    {
      id: 'challenge_2',
      title: 'React 19 concurrent state updates race-condition',
      description: 'Optimize a high-frequency real-time stream consumer UI. Resolve the issue where concurrent React 19 useTransition hooks trigger stale closure errors or out-of-order UI updates.',
      requirements: 'Use React 19 useOptimistic, useDeferredValue, or standard AbortControllers inside custom async handlers.',
      xp: 150,
      difficulty: 'Expert',
      domain: 'Software',
      status: 'Active',
      creatorId: 'id_human_1',
      creatorName: 'Alice Developer',
      deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
      tags: ['React 19', 'Concurrency', 'useTransition', 'State Management'],
      participantsCount: 5,
      submissions: []
    },
    {
      id: 'challenge_3',
      title: 'Secure BLE OTA pairing protection',
      description: 'Implement secure Bluetooth Low Energy (BLE) pairing code with dynamic out-of-band (OOB) authentication to authorize firmware flashing on industrial smart sensors.',
      requirements: 'Passkey entry, AES-CCM encryption, ECDH key exchange validation.',
      xp: 200,
      difficulty: 'Expert',
      domain: 'Hybrid',
      status: 'Active',
      creatorId: 'id_human_1',
      creatorName: 'Alice Developer',
      deadline: new Date(Date.now() + 86400000 * 15).toISOString(),
      tags: ['BLE', 'Cryptography', 'AES', 'Security', 'OOB'],
      participantsCount: 2,
      submissions: []
    }
  ];

  trendingGuideStore = [
    {
      id: 'guide_1',
      title: 'The Complete Guide to UART Debugging with Logic Analyzers',
      description: 'Learn how to use Saleae Logic or PulseView to sniff, capture and debug serial UART/I2C protocols in industrial microcontrollers.',
      url: 'https://example.com/guides/uart-logic-analysis',
      category: 'Hardware',
      upvotes: 42,
      upvoters: ['id_human_1', 'id_human_2'],
      authorId: 'id_human_2',
      authorName: 'Bob Coder',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      views: 1500,
      tags: ['UART', 'Logic Analyzer', 'Electronics', 'Debugging']
    },
    {
      id: 'guide_2',
      title: 'Mastering React 19 Server Actions and Security Boundaries',
      description: 'In-depth guide on security-hardening Next.js 15 or React 19 server actions to prevent unauthorized server state mutations.',
      url: 'https://example.com/guides/react-19-server-actions-security',
      category: 'Software',
      upvotes: 56,
      upvoters: ['id_org_1', 'id_agent_1'],
      authorId: 'id_human_1',
      authorName: 'Alice Developer',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      views: 2300,
      tags: ['React 19', 'Server Actions', 'Security', 'Next.js']
    },
    {
      id: 'guide_3',
      title: 'How to write a custom MCP (Model Context Protocol) Server for local LLMs',
      description: 'Build a Node.js MCP server using the official SDK to let Cursor, Claude, or Gemini access local Postgres databases securely.',
      url: 'https://example.com/guides/mcp-server-llm-local',
      category: 'AI',
      upvotes: 89,
      upvoters: ['id_human_1', 'id_org_1', 'id_human_2'],
      authorId: 'id_org_1',
      authorName: 'OpenAI',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      views: 4100,
      tags: ['MCP', 'LLM', 'AI Systems', 'Node.js']
    }
  ];
}


export function getIdentities() {
  return identityStore;
}

export function getIdentityById(id: string) {
  const identity = identityStore.find(i => i.id === id);
  if (identity) {
    const updatedExpertise = identity.expertise.map(exp => ({
      ...exp,
      level: `${calculateExpertisePercent(id, exp.topic)}%`
    }));
    return { ...identity, expertise: updatedExpertise };
  }
  return undefined;
}

export function getAccounts() {
  return accountStore;
}

export function getAccountById(id: string) {
  return accountStore.find(a => a.id === id);
}

export function getSessions(accountId: string) {
  return sessionStore.filter(s => s.accountId === accountId);
}

export function revokeCredential(identityId: string, credentialId: string) {
  const identity = identityStore.find(i => i.id === identityId);
  if (identity && identity.apiCredentials) {
    identity.apiCredentials = identity.apiCredentials.filter(c => c.id !== credentialId);
  }
}

export function addCredential(identityId: string, name: string, type: 'API Key' | 'MCP Token', scopes: string[], note?: string) {
  const identity = identityStore.find(i => i.id === identityId);
  if (identity) {
    if (!identity.apiCredentials) identity.apiCredentials = [];
    const rawKey = type === 'API Key' ? `sk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}` : `mcp_${Math.random().toString(36).substring(2)}`;
    const newCred = {
      id: `cred_${Date.now()}`,
      name,
      type,
      tokenPreview: rawKey, // Full value to show first time, then preview later or keep it visible
      scopes,
      note: note || 'Default API token',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 31536000000).toISOString() // 1 year expiration
    };
    identity.apiCredentials.push(newCred as any);
    return newCred;
  }
  return null;
}

export function clearOtherSessions(accountId: string, currentSessionId: string) {
  sessionStore = sessionStore.filter(s => s.accountId !== accountId || s.id === currentSessionId);
}

export function createIdentity(data: any) {
  const newIdentity = {
    id: `id_${Date.now()}`,
    ...data,
    followers: { human: 0, ai: 0, organization: 0, enterprise: 0 },
    followingCount: 0,
    trustProfile: { identity: 85, knowledge: 50, verification: 50, accuracy: 50, community: 50, collaboration: 50, freshness: 50, historical: 50 },
    reputation: { knowledge: 20, contribution: 30, verification: 10, citation: 10, review: 10, expertise: 15, community: 20, transparency: 40 },
    expertise: [],
    badges: [],
    verifications: [],
    apiCredentials: []
  };
  identityStore.push(newIdentity);

  // If this is an organization, automatically seed an Admin member in spaceMemberStore
  if (data.type === 'Organization') {
    const creatorId = data.creatorIdentityId || 'id_user_1';
    addSpaceMember(newIdentity.id, creatorId, 'Admin');
  }

  return newIdentity;
}

export function updateIdentity(id: string, data: any) {
  const index = identityStore.findIndex(i => i.id === id);
  if (index !== -1) {
    identityStore[index] = { ...identityStore[index], ...data };
    return identityStore[index];
  }
  return null;
}

export function deleteIdentity(id: string) {
  const index = identityStore.findIndex(i => i.id === id);
  if (index !== -1) {
    identityStore.splice(index, 1);
    return true;
  }
  return false;
}

export function getActivities(identityId: string) {
  return activityStore.filter(a => a.identityId === identityId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getKnowledge(query?: string) {
  if (query) {
    const q = query.toLowerCase();
    return knowledgeStore.filter(k => 
      k.title.toLowerCase().includes(q) || 
      k.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  return knowledgeStore;
}

export function getKnowledgeById(id: string) {
  return knowledgeStore.find(k => k.id === id);
}

export function getKnowledgeHistory(knowledgeId: string) {
  return knowledgeHistoryStore
    .filter(h => h.knowledgeId === knowledgeId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getSubscriptions(accountId: string) {
  const subIds = subscriptionStore.filter(s => s.accountId === accountId).map(s => s.knowledgeId);
  return knowledgeStore.filter(k => subIds.includes(k.id));
}

export function getTrustAnalytics() {
  return trustAnalyticsData;
}

export function addKnowledge(data: any) {
  const newObj: KnowledgeObject = {
    problem: '',
    context: '',
    requirements: '',
    solution: '',
    alternatives: '',
    advantages: '',
    disadvantages: '',
    warning: '',
    evidence: '',
    references: [],
    result: '',
    conclusion: '',
    tags: [],
    entities: [],
    categories: [],
    expertVerifications: [],
    ...data,
    id: `ko_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0',
    language: 'English',
    trustScore: { overall: 50, evidence: 50, reference: 50, community: 50, expert: 50, freshness: 100, consistency: 50, usage: 0, citation: 0, revision: 100, transparency: 100 },
    verifications: [],
    consumptionMetrics: {
      humanReads: 0,
      humanSaves: 0,
      humanShares: 0,
      humanCitations: 0,
      aiReads: 0,
      aiApiRequests: 0,
      aiSyncs: 0,
      aiCitations: 0,
      mcpRequests: 0
    }
  };
  knowledgeStore.unshift(newObj);
  return newObj;
}

// --- Dynamic & Expanded Features (Follow, PM, Webhooks, Tags & Categories, Dynamic Analytics, Expertise) ---

export interface FollowRelation {
  id: string;
  followerId: string;
  followedId: string;
  notifyAll: boolean;
  createdAt: string;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface Webhook {
  id: string;
  identityId: string;
  name: string;
  url: string;
  events: string[];
  createdAt: string;
}

let followStore: FollowRelation[] = [
  { id: 'fol_1', followerId: 'id_human_1', followedId: 'id_org_1', notifyAll: true, createdAt: new Date().toISOString() }
];

let messageStore: PrivateMessage[] = [
  { id: 'msg_1', senderId: 'id_org_1', receiverId: 'id_human_1', content: 'Hello Alice, thanks for checking out our new platform architectural draft! Let us know if you have any feedback.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), read: false }
];

let webhookStore: Webhook[] = [
  { id: 'wh_1', identityId: 'id_human_1', name: 'Knowledge Feed Slack Webhook', url: 'https://hooks.slack.com/services/T0000/B0000/XXXX', events: ['knowledge.published', 'knowledge.updated'], createdAt: new Date().toISOString() }
];

// Predefined lists for recommendations and discovery
export const PREDEFINED_TAGS = ['React', 'Hooks', 'Frontend', 'TypeScript', 'Web Architecture', 'AI', 'System Design', 'Machine Learning', 'Neural Networks', 'MCP', 'Database Systems', 'Cloud Computing', 'Security', 'Optimization'];
export const PREDEFINED_CATEGORIES = ['Frontend Development', 'Web Architecture', 'AI Systems', 'System Design', 'Database Architecture', 'Cloud Infrastructure', 'Security & Verification'];

// Get all tags with item counts
export function getTagsSummary() {
  const counts: Record<string, number> = {};
  PREDEFINED_TAGS.forEach(tag => { counts[tag] = 0; });
  knowledgeStore.forEach(k => {
    k.tags.forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    });
  });
  return Object.entries(counts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

// Get all categories with item counts
export function getCategoriesSummary() {
  const counts: Record<string, number> = {};
  PREDEFINED_CATEGORIES.forEach(cat => { counts[cat] = 0; });
  knowledgeStore.forEach(k => {
    k.categories?.forEach(c => {
      counts[c] = (counts[c] || 0) + 1;
    });
  });
  return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
}

// Entity Metadata mapping
export const ENTITY_METADATA: Record<string, { type: string; description: string }> = {
  'React 19': { type: 'Library/Framework', description: 'The latest major release of the React user interface library, introducing the "use" hook, action states, and improved Server Components hydration.' },
  'JavaScript': { type: 'Programming Language', description: 'A high-level, multi-paradigm programming language that is one of the core technologies of the World Wide Web.' },
  'Suspense': { type: 'Component Pattern', description: 'A React component orchestrator that lets you declaratively wait for some code to load and dynamically display a loading state.' },
  'SOTYAI': { type: 'Knowledge Protocol/Platform', description: 'The decentralized State of the Year AI network designed to serve both humans and AI agents with zero-scraping, verifiable knowledge nodes.' },
  'MCP': { type: 'Integration Protocol', description: 'Model Context Protocol, an open standard that enables developers to build secure, bidirectional connections between AI models and data sources.' },
  'Knowledge Graph': { type: 'Data Structure', description: 'A semantic network that represents entities and their interrelations, enabling advanced structural querying and contextual reasoning for LLMs.' }
};

export function getEntitiesSummary() {
  const entitiesMap: Record<string, {
    entity: string;
    type: string;
    description: string;
    count: number;
    averageTrustScore: number;
    totalReads: number;
    totalSaves: number;
    connectedObjects: { id: string; title: string; overallTrust: number }[];
    relatedTags: string[];
    relatedEntities: string[];
  }> = {};

  knowledgeStore.forEach(k => {
    const currentEntities = k.entities || [];
    currentEntities.forEach(e => {
      if (!entitiesMap[e]) {
        const meta = ENTITY_METADATA[e] || { type: 'General Concept', description: `An informational subject node associated with SOTYAI nodes, covering concepts related to ${e}.` };
        entitiesMap[e] = {
          entity: e,
          type: meta.type,
          description: meta.description,
          count: 0,
          averageTrustScore: 0,
          totalReads: 0,
          totalSaves: 0,
          connectedObjects: [],
          relatedTags: [],
          relatedEntities: []
        };
      }

      const entry = entitiesMap[e];
      entry.count += 1;
      entry.connectedObjects.push({
        id: k.id,
        title: k.title,
        overallTrust: k.trustScore.overall
      });
      
      entry.totalReads += (k.consumptionMetrics.humanReads || 0) + (k.consumptionMetrics.aiReads || 0);
      entry.totalSaves += (k.consumptionMetrics.humanSaves || 0);

      k.tags.forEach(t => {
        if (!entry.relatedTags.includes(t)) {
          entry.relatedTags.push(t);
        }
      });

      currentEntities.forEach(otherE => {
        if (otherE !== e && !entry.relatedEntities.includes(otherE)) {
          entry.relatedEntities.push(otherE);
        }
      });
    });
  });

  return Object.values(entitiesMap).map(item => {
    const sumTrust = item.connectedObjects.reduce((acc, obj) => acc + obj.overallTrust, 0);
    item.averageTrustScore = item.connectedObjects.length > 0 ? Math.round(sumTrust / item.connectedObjects.length) : 50;
    return item;
  }).sort((a, b) => b.count - a.count);
}

// Tag recommendations linked to the first tag
export function getRecommendedTags(firstTag: string): string[] {
  const tagMap: Record<string, string[]> = {
    'react': ['Hooks', 'Frontend', 'TypeScript', 'Optimization'],
    'hooks': ['React', 'Frontend', 'TypeScript'],
    'frontend': ['React', 'Hooks', 'TypeScript', 'Web Architecture'],
    'typescript': ['React', 'Frontend', 'System Design', 'MCP'],
    'ai': ['Machine Learning', 'Neural Networks', 'MCP', 'System Design'],
    'machine learning': ['AI', 'Neural Networks', 'System Design'],
    'neural networks': ['AI', 'Machine Learning'],
    'mcp': ['AI', 'TypeScript', 'System Design', 'Web Architecture'],
    'system design': ['Web Architecture', 'Database Systems', 'Cloud Computing', 'AI'],
    'web architecture': ['React', 'Frontend', 'System Design', 'Cloud Computing']
  };

  const key = firstTag.toLowerCase();
  const recommended = tagMap[key] || PREDEFINED_TAGS.filter(t => t.toLowerCase() !== key).slice(0, 4);
  return recommended;
}

// Category recommendations linked to the first category
export function getRecommendedCategories(firstCategory: string): string[] {
  const catMap: Record<string, string[]> = {
    'frontend development': ['Web Architecture', 'Security & Verification'],
    'web architecture': ['Frontend Development', 'System Design', 'Cloud Infrastructure'],
    'ai systems': ['System Design', 'Database Architecture', 'Cloud Infrastructure'],
    'system design': ['Web Architecture', 'Database Architecture', 'Cloud Infrastructure'],
    'database architecture': ['System Design', 'Cloud Infrastructure'],
    'cloud infrastructure': ['System Design', 'Database Architecture']
  };

  const key = firstCategory.toLowerCase();
  const recommended = catMap[key] || PREDEFINED_CATEGORIES.filter(c => c.toLowerCase() !== key).slice(0, 3);
  return recommended;
}

// Follow/Subscription System implementation
export function getFollows(followerId: string) {
  return followStore.filter(f => f.followerId === followerId);
}

export function isFollowing(followerId: string, followedId: string) {
  return followStore.find(f => f.followerId === followerId && f.followedId === followedId);
}

export function followIdentity(followerId: string, followedId: string, notifyAll: boolean) {
  const existing = followStore.find(f => f.followerId === followerId && f.followedId === followedId);
  if (existing) {
    existing.notifyAll = notifyAll;
    return existing;
  }

  const newFollow: FollowRelation = {
    id: `fol_${Date.now()}`,
    followerId,
    followedId,
    notifyAll,
    createdAt: new Date().toISOString()
  };
  followStore.push(newFollow);

  // Dynamically update followers count
  const followed = identityStore.find(i => i.id === followedId);
  const follower = identityStore.find(i => i.id === followerId);
  if (followed) {
    const typeKey = follower ? (follower.type.toLowerCase() as 'human' | 'ai' | 'organization') : 'human';
    const targetKey = typeKey === 'human' ? 'human' : (typeKey === 'ai' ? 'ai' : 'organization');
    followed.followers[targetKey] = (followed.followers[targetKey] || 0) + 1;
  }
  if (follower) {
    follower.followingCount = (follower.followingCount || 0) + 1;
  }

  return newFollow;
}

export function unfollowIdentity(followerId: string, followedId: string) {
  const index = followStore.findIndex(f => f.followerId === followerId && f.followedId === followedId);
  if (index !== -1) {
    followStore.splice(index, 1);
    
    const followed = identityStore.find(i => i.id === followedId);
    const follower = identityStore.find(i => i.id === followerId);
    if (followed) {
      const typeKey = follower ? (follower.type.toLowerCase() as 'human' | 'ai' | 'organization') : 'human';
      const targetKey = typeKey === 'human' ? 'human' : (typeKey === 'ai' ? 'ai' : 'organization');
      followed.followers[targetKey] = Math.max(0, (followed.followers[targetKey] || 1) - 1);
    }
    if (follower) {
      follower.followingCount = Math.max(0, (follower.followingCount || 1) - 1);
    }
    return true;
  }
  return false;
}

// PM/Direct Messages System implementation
export function getMessages(identityA: string, identityB: string) {
  return messageStore.filter(m => 
    (m.senderId === identityA && m.receiverId === identityB) ||
    (m.senderId === identityB && m.receiverId === identityA)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getConversations(identityId: string) {
  const partners = new Set<string>();
  messageStore.forEach(m => {
    if (m.senderId === identityId) partners.add(m.receiverId);
    if (m.receiverId === identityId) partners.add(m.senderId);
  });
  
  return Array.from(partners).map(id => {
    const partnerIdentity = identityStore.find(i => i.id === id);
    const lastMsg = messageStore.filter(m => 
      (m.senderId === identityId && m.receiverId === id) ||
      (m.senderId === id && m.receiverId === identityId)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    // Calculate unread count specifically for messages sent from this partner to the current identity
    const unreadCount = messageStore.filter(m => 
      m.senderId === id && m.receiverId === identityId && !m.read
    ).length;

    return {
      partner: partnerIdentity || { id, name: 'Unknown Identity', handle: '@unknown', type: 'Human', followers: { human:0, ai:0, organization:0, enterprise:0 }, trustProfile: { identity: 50, knowledge: 0, verification: 0, accuracy: 0, community: 0, collaboration: 0, freshness: 0, historical: 0 }, reputation: {}, expertise: [], badges: [], roles: [], verifications: [] },
      lastMessage: lastMsg,
      unreadCount
    };
  });
}

export function sendPrivateMessage(senderId: string, receiverId: string, content: string) {
  const newMsg: PrivateMessage = {
    id: `msg_${Date.now()}`,
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    read: false
  };
  messageStore.push(newMsg);
  return newMsg;
}

export function markMessagesAsRead(senderId: string, receiverId: string) {
  let count = 0;
  messageStore.forEach(m => {
    if (m.senderId === senderId && m.receiverId === receiverId && !m.read) {
      m.read = true;
      count++;
    }
  });
  return { success: true, markedCount: count };
}

export function getUnreadCount(identityId: string) {
  const count = messageStore.filter(m => m.receiverId === identityId && !m.read).length;
  return { unreadCount: count };
}

// Webhooks System implementation
export function getWebhooks(identityId: string) {
  return webhookStore.filter(w => w.identityId === identityId);
}

export function addWebhook(identityId: string, name: string, url: string, events: string[]) {
  const newWebhook: Webhook = {
    id: `wh_${Date.now()}`,
    identityId,
    name,
    url,
    events,
    createdAt: new Date().toISOString()
  };
  webhookStore.push(newWebhook);
  return newWebhook;
}

export function deleteWebhook(identityId: string, webhookId: string) {
  const index = webhookStore.findIndex(w => w.id === webhookId && w.identityId === identityId);
  if (index !== -1) {
    webhookStore.splice(index, 1);
    return true;
  }
  return false;
}

// Dynamic calculate Expertise percentage from actual published objects
export function calculateExpertisePercent(identityId: string, topic: string): number {
  const totalCreatedBySelf = knowledgeStore.filter(k => k.authorId === identityId).length;
  if (totalCreatedBySelf === 0) return 30; // base default score for having the skill
  const countInTopic = knowledgeStore.filter(k => k.authorId === identityId && (
    k.tags.some(t => t.toLowerCase() === topic.toLowerCase()) ||
    k.categories?.some(c => c.toLowerCase() === topic.toLowerCase()) ||
    k.entities?.some(e => e.toLowerCase() === topic.toLowerCase())
  )).length;

  const ratio = countInTopic / totalCreatedBySelf;
  // Dynamic formula: Base 50% + ratio contribution up to 100%
  return Math.min(100, Math.round(50 + (ratio * 50)));
}

// Real calculation of Trust Engine Analytics
export function calculateDynamicTrustAnalytics() {
  if (knowledgeStore.length === 0) {
    return trustAnalyticsData; // Fallback to basic mock
  }

  const overallScores = knowledgeStore.map(k => k.trustScore.overall);
  const accuracyScores = knowledgeStore.map(k => k.trustScore.evidence || k.trustScore.overall);
  
  const avgOverall = Number((overallScores.reduce((a, b) => a + b, 0) / overallScores.length).toFixed(1));
  const avgAccuracy = Number((accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length).toFixed(1));

  let totalVerifications = 0;
  knowledgeStore.forEach(k => {
    k.verifications?.forEach(v => {
      totalVerifications += v.count;
    });
  });

  return {
    timeSeries: [
      { name: 'Jan', overall: Math.max(50, avgOverall - 12), accuracy: Math.max(50, avgAccuracy - 10), community: 78 },
      { name: 'Feb', overall: Math.max(50, avgOverall - 9), accuracy: Math.max(50, avgAccuracy - 7), community: 82 },
      { name: 'Mar', overall: Math.max(50, avgOverall - 10), accuracy: Math.max(50, avgAccuracy - 8), community: 80 },
      { name: 'Apr', overall: Math.max(50, avgOverall - 6), accuracy: Math.max(50, avgAccuracy - 4), community: 85 },
      { name: 'May', overall: Math.max(50, avgOverall - 3), accuracy: Math.max(50, avgAccuracy - 2), community: 89 },
      { name: 'Jun', overall: avgOverall, accuracy: avgAccuracy, community: 92 },
    ],
    radar: [
      { subject: 'Identity', A: 95, fullMark: 100 },
      { subject: 'Knowledge', A: Math.round(avgOverall), fullMark: 100 },
      { subject: 'Verification', A: Math.round(avgAccuracy - 5), fullMark: 100 },
      { subject: 'Accuracy', A: Math.round(avgAccuracy), fullMark: 100 },
      { subject: 'Community', A: 88, fullMark: 100 },
      { subject: 'Collaboration', A: 90, fullMark: 100 },
    ],
    kpis: {
      globalTrust: avgOverall,
      globalTrustChange: 2.4,
      networkAccuracy: avgAccuracy,
      networkAccuracyChange: 1.1,
      activeVerifications: totalVerifications || 12400,
      activeVerificationsChange: 5.4,
      systemConfidence: avgOverall > 85 ? 'High' : 'Medium'
    }
  };
}

// --- Space / Group Functions ---

export function getSpaceMembers(spaceId: string): (SpaceMember & { identity?: Identity })[] {
  return spaceMemberStore
    .filter(m => m.spaceId === spaceId)
    .map(m => ({
      ...m,
      identity: identityStore.find(i => i.id === m.identityId)
    }));
}

export function addSpaceMember(spaceId: string, identityId: string, role: 'Admin' | 'Moderator' | 'Member' = 'Member'): SpaceMember | null {
  const space = identityStore.find(i => i.id === spaceId && i.type === 'Organization');
  if (!space) return null;
  
  // Check if already a member
  const existing = spaceMemberStore.find(m => m.spaceId === spaceId && m.identityId === identityId);
  if (existing) return existing;

  const newMember: SpaceMember = {
    id: `sm_${Date.now()}_${Math.random().toString(36).substring(5)}`,
    spaceId,
    identityId,
    role,
    joinedAt: new Date().toISOString()
  };
  spaceMemberStore.push(newMember);

  // Update space followers / members count
  if (!space.followers) space.followers = { human: 0, ai: 0, organization: 0, enterprise: 0 };
  const memberIdentity = identityStore.find(i => i.id === identityId);
  if (memberIdentity) {
    const typeKey = memberIdentity.type === 'Human' ? 'human' : memberIdentity.type === 'AI Agent' ? 'ai' : 'organization';
    space.followers[typeKey] = (space.followers[typeKey] || 0) + 1;
  } else {
    space.followers.human = (space.followers.human || 0) + 1;
  }

  return newMember;
}

export function removeSpaceMember(spaceId: string, identityId: string): boolean {
  const index = spaceMemberStore.findIndex(m => m.spaceId === spaceId && m.identityId === identityId);
  if (index !== -1) {
    spaceMemberStore.splice(index, 1);

    // Update space followers / members count
    const space = identityStore.find(i => i.id === spaceId && i.type === 'Organization');
    if (space && space.followers) {
      const memberIdentity = identityStore.find(i => i.id === identityId);
      const typeKey = memberIdentity && memberIdentity.type === 'Human' ? 'human' : memberIdentity && memberIdentity.type === 'AI Agent' ? 'ai' : 'organization';
      space.followers[typeKey] = Math.max(0, (space.followers[typeKey] || 1) - 1);
    }
    return true;
  }
  return false;
}

export function getSpacePosts(spaceId: string): (SpacePost & { author?: Identity })[] {
  return spacePostStore
    .filter(p => p.spaceId === spaceId)
    .map(p => ({
      ...p,
      author: identityStore.find(i => i.id === p.authorId),
      comments: p.comments.map(c => ({
        ...c,
        author: identityStore.find(i => i.id === c.authorId)
      })) as any
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createSpacePost(spaceId: string, authorId: string, content: string): SpacePost | null {
  const space = identityStore.find(i => i.id === spaceId && i.type === 'Organization');
  if (!space) return null;

  const newPost: SpacePost = {
    id: `sp_${Date.now()}_${Math.random().toString(36).substring(5)}`,
    spaceId,
    authorId,
    content,
    createdAt: new Date().toISOString(),
    likes: [],
    comments: []
  };

  spacePostStore.push(newPost);
  return newPost;
}

export function likeSpacePost(postId: string, identityId: string): SpacePost | null {
  const post = spacePostStore.find(p => p.id === postId);
  if (!post) return null;

  if (post.likes.includes(identityId)) {
    post.likes = post.likes.filter(id => id !== identityId);
  } else {
    post.likes.push(identityId);
  }

  return post;
}

export function addSpaceComment(postId: string, authorId: string, content: string): SpaceComment | null {
  const post = spacePostStore.find(p => p.id === postId);
  if (!post) return null;

  const newComment: SpaceComment = {
    id: `sc_${Date.now()}_${Math.random().toString(36).substring(5)}`,
    postId,
    authorId,
    content,
    createdAt: new Date().toISOString()
  };

  post.comments.push(newComment);
  return newComment;
}

export function getSpaceChatMessages(spaceId: string): (SpaceChatMessage & { sender?: Identity })[] {
  return spaceChatMessageStore
    .filter(m => m.spaceId === spaceId)
    .map(m => ({
      ...m,
      sender: identityStore.find(i => i.id === m.senderId)
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function sendSpaceChatMessage(spaceId: string, senderId: string, content: string): SpaceChatMessage | null {
  const space = identityStore.find(i => i.id === spaceId && i.type === 'Organization');
  if (!space) return null;

  const newMsg: SpaceChatMessage = {
    id: `chat_${Date.now()}_${Math.random().toString(36).substring(5)}`,
    spaceId,
    senderId,
    content,
    timestamp: new Date().toISOString()
  };

  spaceChatMessageStore.push(newMsg);
  return newMsg;
}

export function updateSpaceVisibility(spaceId: string, visibility: 'Public' | 'Private'): boolean {
  const space = identityStore.find(i => i.id === spaceId && i.type === 'Organization');
  if (space) {
    space.visibility = visibility;
    return true;
  }
  return false;
}

// --- Report Functions ---

export function getReports(): Report[] {
  return reportStore.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createReport(data: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
  const reporterIdentity = identityStore.find(i => i.id === data.reporterId);
  
  let targetTitle = data.targetTitle;
  if (!targetTitle) {
    if (data.targetType === 'KnowledgeObject') {
      const ko = knowledgeStore.find(k => k.id === data.targetId);
      targetTitle = ko ? ko.title : 'Knowledge Object';
    } else if (data.targetType === 'SpacePost') {
      const sp = spacePostStore.find(p => p.id === data.targetId);
      targetTitle = sp ? (sp.content.substring(0, 40) + '...') : 'Space Post';
    } else if (data.targetType === 'Identity') {
      const iden = identityStore.find(i => i.id === data.targetId);
      targetTitle = iden ? iden.name : 'Identity';
    } else {
      targetTitle = 'Reported Content';
    }
  }

  const newReport: Report = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(5)}`,
    ...data,
    targetTitle,
    reporterName: reporterIdentity ? reporterIdentity.name : 'Anonymous Reporter',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  reportStore.push(newReport);
  return newReport;
}

export function updateReportStatus(id: string, status: Report['status']): boolean {
  const report = reportStore.find(r => r.id === id);
  if (report) {
    report.status = status;
    return true;
  }
  return false;
}

export function deleteReport(id: string): boolean {
  const index = reportStore.findIndex(r => r.id === id);
  if (index !== -1) {
    reportStore.splice(index, 1);
    return true;
  }
  return false;
}

export function getVerificationsForKnowledge(knowledgeId: string): CommunityVerificationRecord[] {
  return verificationRecords.filter(r => r.knowledgeId === knowledgeId);
}

export function addCommunityVerification(
  knowledgeId: string, 
  verifierId: string, 
  data: { type: string, status: 'Passed' | 'Failed', environment: string, evidenceNotes: string }
): CommunityVerificationRecord | null {
  const kObj = knowledgeStore.find(k => k.id === knowledgeId);
  if (!kObj) return null;

  const verifier = identityStore.find(i => i.id === verifierId);
  const verifierName = verifier ? verifier.name : 'Anonymous Verifier';
  const verifierType = verifier ? verifier.type : 'Human';

  const newRecord: CommunityVerificationRecord = {
    id: `vr_${Date.now()}_${Math.random().toString(36).substring(5)}`,
    knowledgeId,
    verifierId,
    verifierName,
    verifierType,
    type: data.type,
    status: data.status,
    environment: data.environment || 'N/A',
    evidenceNotes: data.evidenceNotes || '',
    timestamp: new Date().toISOString()
  };

  verificationRecords.push(newRecord);

  // Update kObj.verifications array
  // Find count of passed verifications of this type
  const typeRecords = verificationRecords.filter(r => r.knowledgeId === knowledgeId && r.type === data.type && r.status === 'Passed');
  const existingV = kObj.verifications.find(v => v.type === data.type);
  if (existingV) {
    existingV.count = typeRecords.length;
  } else {
    kObj.verifications.push({ type: data.type, count: typeRecords.length });
  }

  // Adjust trust score parameters dynamically
  const totalPassed = verificationRecords.filter(r => r.knowledgeId === knowledgeId && r.status === 'Passed').length;
  const totalFailed = verificationRecords.filter(r => r.knowledgeId === knowledgeId && r.status === 'Failed').length;
  
  // base community trust starts at 75 for seeded / default, plus real verifier contributions
  let communityScore = 75 + (totalPassed * 4) - (totalFailed * 10);
  communityScore = Math.max(10, Math.min(100, communityScore));
  kObj.trustScore.community = communityScore;

  // Recalculate overall trust score as a weighted average
  const ts = kObj.trustScore;
  const weights = {
    evidence: 0.15,
    reference: 0.15,
    community: 0.20,
    expert: 0.15,
    freshness: 0.05,
    consistency: 0.10,
    usage: 0.05,
    citation: 0.05,
    transparency: 0.10
  };

  const weightedSum = 
    (ts.evidence * weights.evidence) +
    (ts.reference * weights.reference) +
    (ts.community * weights.community) +
    (ts.expert * weights.expert) +
    (ts.freshness * weights.freshness) +
    (ts.consistency * weights.consistency) +
    (ts.usage * weights.usage) +
    (ts.citation * weights.citation) +
    (ts.transparency * weights.transparency);

  kObj.trustScore.overall = Math.max(10, Math.min(100, Math.round(weightedSum)));

  // Add ActivityEvent
  const description = `${verifierName} (${verifierType}) verified "${kObj.title}" as [${data.status}] in ${newRecord.environment}`;
  const newActivity: ActivityEvent = {
    id: `act_${Date.now()}`,
    identityId: verifierId,
    type: 'Verification',
    description,
    timestamp: new Date().toISOString()
  };
  activityStore.unshift(newActivity);

  return newRecord;
}

export function incrementConsumptionMetric(knowledgeId: string, metricType: string) {
  const kObj = knowledgeStore.find(k => k.id === knowledgeId);
  if (!kObj) return null;

  const validMetrics = [
    'humanReads', 'humanSaves', 'humanShares', 'humanCitations',
    'aiReads', 'aiApiRequests', 'aiSyncs', 'aiCitations', 'mcpRequests'
  ];

  if (validMetrics.includes(metricType)) {
    kObj.consumptionMetrics[metricType as keyof typeof kObj.consumptionMetrics] += 1;
    
    // Dynamically adjust trust score metrics on usage
    if (metricType === 'humanCitations' || metricType === 'aiCitations') {
      kObj.trustScore.citation = Math.min(100, kObj.trustScore.citation + 1);
    }
    if (metricType === 'humanSaves' || metricType === 'mcpRequests') {
      kObj.trustScore.usage = Math.min(100, kObj.trustScore.usage + 1);
    }
    
    // Recalculate overall trust score as weighted sum
    const ts = kObj.trustScore;
    const weights = {
      evidence: 0.15,
      reference: 0.15,
      community: 0.20,
      expert: 0.15,
      freshness: 0.05,
      consistency: 0.10,
      usage: 0.05,
      citation: 0.05,
      transparency: 0.10
    };
    const weightedSum = 
      (ts.evidence * weights.evidence) +
      (ts.reference * weights.reference) +
      (ts.community * weights.community) +
      (ts.expert * weights.expert) +
      (ts.freshness * weights.freshness) +
      (ts.consistency * weights.consistency) +
      (ts.usage * weights.usage) +
      (ts.citation * weights.citation) +
      (ts.transparency * weights.transparency);
    kObj.trustScore.overall = Math.max(10, Math.min(100, Math.round(weightedSum)));
  }

  return kObj.consumptionMetrics;
}

export function getTickets() {
  return ticketStore.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTicketById(id: string) {
  const ticket = ticketStore.find(t => t.id === id);
  if (!ticket) return null;
  const comments = ticketCommentStore
    .filter(c => c.ticketId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return { ticket, comments };
}

export function createTicket(data: { title: string; description: string; category: Ticket['category']; creatorId: string }) {
  const creator = identityStore.find(i => i.id === data.creatorId);
  const newTicket: Ticket = {
    id: `ticket_${Math.random().toString(36).substring(2, 9)}`,
    title: data.title,
    description: data.description,
    category: data.category,
    status: 'Open',
    creatorId: data.creatorId,
    creatorName: creator ? creator.name : 'Anonymous Developer',
    creatorHandle: creator ? creator.handle : '@anonymous',
    creatorType: creator ? creator.type : 'Human',
    upvotes: 0,
    upvoters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  ticketStore.push(newTicket);
  return newTicket;
}

export function getChallenges() {
  return challengeStore;
}

export function getChallengeById(id: string) {
  return challengeStore.find(c => c.id === id);
}

export function createChallenge(data: Partial<Challenge> & { creatorId: string }) {
  const creator = identityStore.find(i => i.id === data.creatorId);
  const newChallenge: Challenge = {
    id: `challenge_${Date.now()}`,
    title: data.title || 'Untitled Challenge',
    description: data.description || '',
    requirements: data.requirements || '',
    xp: data.xp || 50,
    difficulty: data.difficulty || 'Beginner',
    domain: data.domain || 'Software',
    status: 'Active',
    creatorId: data.creatorId,
    creatorName: creator ? creator.name : 'Anonymous',
    deadline: data.deadline || new Date(Date.now() + 86400000 * 7).toISOString(),
    tags: data.tags || [],
    participantsCount: 0,
    submissions: []
  };
  challengeStore.push(newChallenge);
  return newChallenge;
}

export function submitChallengeSolution(challengeId: string, data: { authorId: string; codeSolution: string; explanation: string }) {
  const challenge = challengeStore.find(c => c.id === challengeId);
  if (!challenge) return null;

  const author = identityStore.find(i => i.id === data.authorId);
  const newSubmission: ChallengeSubmission = {
    id: `sub_${Date.now()}`,
    challengeId,
    authorId: data.authorId,
    authorName: author ? author.name : 'Anonymous Solver',
    authorType: author && author.type === 'AI Agent' ? 'AI Agent' : 'Human',
    codeSolution: data.codeSolution,
    explanation: data.explanation,
    verdict: 'Passed',
    score: Math.floor(Math.random() * 15) + 85,
    submittedAt: new Date().toISOString()
  };

  challenge.submissions.unshift(newSubmission);
  challenge.participantsCount += 1;

  if (author) {
    author.trustProfile.knowledge = Math.min(100, author.trustProfile.knowledge + 2);
    author.reputation.contribution = Math.min(100, author.reputation.contribution + 5);
  }

  return newSubmission;
}

export function getTrendingGuides() {
  return trendingGuideStore.sort((a, b) => b.upvotes - a.upvotes);
}

export function createTrendingGuide(data: Partial<TrendingGuide> & { authorId: string }) {
  const author = identityStore.find(i => i.id === data.authorId);
  const newGuide: TrendingGuide = {
    id: `guide_${Date.now()}`,
    title: data.title || 'Untitled Guide',
    description: data.description || '',
    url: data.url || 'https://example.com',
    category: (data.category as any) || 'Software',
    upvotes: 1,
    upvoters: [data.authorId],
    authorId: data.authorId,
    authorName: author ? author.name : 'Anonymous Author',
    createdAt: new Date().toISOString(),
    views: 10,
    tags: data.tags || []
  };
  trendingGuideStore.push(newGuide);
  return newGuide;
}

export function upvoteTrendingGuide(guideId: string, identityId: string) {
  const guide = trendingGuideStore.find(g => g.id === guideId);
  if (!guide) return null;

  const idx = guide.upvoters.indexOf(identityId);
  if (idx === -1) {
    guide.upvoters.push(identityId);
    guide.upvotes += 1;
  } else {
    guide.upvoters.splice(idx, 1);
    guide.upvotes -= 1;
  }
  return guide;
}

export function updateTicketStatus(id: string, status: Ticket['status']) {
  const ticket = ticketStore.find(t => t.id === id);
  if (!ticket) return false;
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  return true;
}

export function upvoteTicket(ticketId: string, identityId: string) {
  const ticket = ticketStore.find(t => t.id === ticketId);
  if (!ticket) return null;

  const index = ticket.upvoters.indexOf(identityId);
  if (index === -1) {
    ticket.upvoters.push(identityId);
    ticket.upvotes += 1;
  } else {
    ticket.upvoters.splice(index, 1);
    ticket.upvotes -= 1;
  }
  ticket.updatedAt = new Date().toISOString();
  return ticket;
}

export function addTicketComment(ticketId: string, authorId: string, content: string) {
  const ticket = ticketStore.find(t => t.id === ticketId);
  if (!ticket) return { error: 'Ticket not found' };
  if (ticket.status === 'Closed') {
    return { error: 'This ticket is closed. No further comments are allowed.' };
  }

  const author = identityStore.find(i => i.id === authorId);
  const newComment: TicketComment = {
    id: `tc_${Math.random().toString(36).substring(2, 9)}`,
    ticketId,
    authorId,
    authorName: author ? author.name : 'Anonymous Responder',
    authorHandle: author ? author.handle : '@anonymous',
    authorType: author ? author.type : 'Human',
    content,
    createdAt: new Date().toISOString()
  };
  ticketCommentStore.push(newComment);
  ticket.updatedAt = new Date().toISOString();
  return { comment: newComment };
}

export function getDebates() {
  return debateStore;
}

export function getDebateById(id: string) {
  return debateStore.find(d => d.id === id);
}

export function createDebate(data: { knowledge_a_id: string; knowledge_b_id: string; context_json: DebateContext }) {
  const newDebate: Debate = {
    id: `debate_${Date.now()}`,
    knowledge_a_id: data.knowledge_a_id,
    knowledge_b_id: data.knowledge_b_id,
    context_json: data.context_json,
    comparison_json: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  debateStore.push(newDebate);
  
  const koA = getKnowledgeById(data.knowledge_a_id);
  if (koA) {
    if (!koA.comparisons) koA.comparisons = [];
    if (!koA.comparisons.includes(newDebate.id)) koA.comparisons.push(newDebate.id);
  }
  const koB = getKnowledgeById(data.knowledge_b_id);
  if (koB) {
    if (!koB.comparisons) koB.comparisons = [];
    if (!koB.comparisons.includes(newDebate.id)) koB.comparisons.push(newDebate.id);
  }

  const historyEventA: KnowledgeHistoryEvent = {
    id: `hist_${Date.now()}_A`,
    knowledgeId: data.knowledge_a_id,
    version: koA ? koA.version : '1.0.0',
    eventType: 'DEBATE_CREATED',
    timestamp: new Date().toISOString(),
    authorId: 'system',
    authorName: 'Debate Engine',
    identityType: 'System' as any,
    changes: `Created debate comparison against ${data.knowledge_b_id}`
  };
  knowledgeHistoryStore.unshift(historyEventA);

  const historyEventB: KnowledgeHistoryEvent = {
    id: `hist_${Date.now()}_B`,
    knowledgeId: data.knowledge_b_id,
    version: koB ? koB.version : '1.0.0',
    eventType: 'DEBATE_CREATED',
    timestamp: new Date().toISOString(),
    authorId: 'system',
    authorName: 'Debate Engine',
    identityType: 'System' as any,
    changes: `Created debate comparison against ${data.knowledge_a_id}`
  };
  knowledgeHistoryStore.unshift(historyEventB);

  return newDebate;
}

export function computeDebateScore(debateId: string, result: DebateResult, summary: { overall_summary: string; recommendation: string }) {
  const debate = debateStore.find(d => d.id === debateId);
  if (debate) {
    debate.comparison_json = result;
    debate.summary_json = summary;
    debate.updated_at = new Date().toISOString();
    
    const koA = getKnowledgeById(debate.knowledge_a_id);
    const koB = getKnowledgeById(debate.knowledge_b_id);
    
    let aWins = 0;
    let bWins = 0;
    Object.values(result).forEach((dim: any) => {
       if (dim.scoreA > dim.scoreB) aWins++;
       else if (dim.scoreB > dim.scoreA) bWins++;
    });

    if (koA && aWins > bWins) {
       koA.trustScore.score = Math.min(100, koA.trustScore.score + 2);
    } else if (koA && bWins > aWins) {
       koA.trustScore.score = Math.max(0, koA.trustScore.score - 2);
    }
    
    if (koB && bWins > aWins) {
       koB.trustScore.score = Math.min(100, koB.trustScore.score + 2);
    } else if (koB && aWins > bWins) {
       koB.trustScore.score = Math.max(0, koB.trustScore.score - 2);
    }

    knowledgeHistoryStore.unshift({
        id: `hist_${Date.now()}_C`,
        knowledgeId: debate.knowledge_a_id,
        version: koA ? koA.version : '1.0.0',
        eventType: 'DEBATE_RESULT_COMPUTED',
        timestamp: new Date().toISOString(),
        authorId: 'system',
        authorName: 'Debate Engine',
        identityType: 'System' as any,
        changes: `Debate result computed.`
    });
    knowledgeHistoryStore.unshift({
        id: `hist_${Date.now()}_D`,
        knowledgeId: debate.knowledge_b_id,
        version: koB ? koB.version : '1.0.0',
        eventType: 'DEBATE_RESULT_COMPUTED',
        timestamp: new Date().toISOString(),
        authorId: 'system',
        authorName: 'Debate Engine',
        identityType: 'System' as any,
        changes: `Debate result computed.`
    });
    return debate;
  }
  return null;
}

