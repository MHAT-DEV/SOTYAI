export interface Account {
  id: string;
  email: string;
  authMethods: string[];
  createdAt: string;
  lastLogin: string;
}

export interface APICredential {
  id: string;
  name: string;
  type: 'API Key' | 'OAuth Client' | 'MCP Token' | 'Service Token';
  tokenPreview: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface Session {
  id: string;
  accountId: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Identity {
  id: string;
  accountId?: string;
  type: 'Human' | 'Organization' | 'AI Agent' | 'Project' | 'Service Account';
  name: string;
  handle: string;
  ownerId?: string; // For AI Agents
  trustProfile: TrustProfile;
  reputation: ReputationProfile;
  expertise: Expertise[];
  badges: string[];
  roles: string[];
  verifications: string[];
  followers: {
    human: number;
    ai: number;
    organization: number;
    enterprise: number;
  };
  followingCount: number;
  visibility: 'Public' | 'Followers' | 'Organization Only' | 'Private' | 'Anonymous';
  apiCredentials?: APICredential[];
}

export interface TrustProfile {
  identity: number;
  knowledge: number;
  verification: number;
  accuracy: number;
  community: number;
  collaboration: number;
  freshness: number;
  historical: number;
}

export interface ReputationProfile {
  knowledge: number;
  contribution: number;
  verification: number;
  citation: number;
  review: number;
  expertise: number;
  community: number;
  transparency: number;
}

export interface Expertise {
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Researcher';
}

export interface ActivityEvent {
  id: string;
  identityId: string;
  type: 'Knowledge Published' | 'Knowledge Updated' | 'Verification' | 'Review' | 'Translation' | 'Citation' | 'Trust Change' | 'Badge Award';
  description: string;
  timestamp: string;
}

export interface TrustScoreDetails {
  evidence: number;
  reference: number;
  community: number;
  expert: number;
  freshness: number;
  consistency: number;
  usage: number;
  citation: number;
  revision: number;
  transparency: number;
  overall: number;
}

export type KnowledgeType = 'CODE' | 'CONFIG' | 'DISCOURSE';

export interface KnowledgeObject {
  id: string;
  title: string;
  knowledgeType?: KnowledgeType;
  code?: string;
  sandboxEnv?: string;
  
  // AI Native Structure
  problem: string;
  context: string;
  requirements: string;
  solution: string;
  alternatives: string;
  advantages: string;
  disadvantages: string;
  warning: string;
  evidence: string;
  references: string[];
  result: string;
  conclusion: string;
  
  authorId: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  language: string;
  
  trustScore: TrustScoreDetails;
  verifications: Verification[];
  expertVerifications: string[];
  
  tags: string[];
  entities: string[];
  categories: string[];
  comparisons?: string[];
  
  consumptionMetrics: {
    humanReads: number;
    humanSaves: number;
    humanShares: number;
    humanCitations: number;
    aiReads: number;
    aiApiRequests: number;
    aiSyncs: number;
    aiCitations: number;
    mcpRequests: number;
  };
}

export interface Verification {
  type: string; // e.g., 'Works Successfully', 'Reference Valid'
  count: number;
}

export interface CommunityVerificationRecord {
  id: string;
  knowledgeId: string;
  verifierId: string;
  verifierName: string;
  verifierType: string;
  type: string;
  status: 'Passed' | 'Failed';
  environment: string;
  evidenceNotes: string;
  timestamp: string;
}

export interface SpaceMember {
  id: string;
  spaceId: string;
  identityId: string;
  role: 'Admin' | 'Moderator' | 'Member';
  joinedAt: string;
}

export interface SpacePost {
  id: string;
  spaceId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: string[]; // identity IDs
  comments: SpaceComment[];
}

export interface SpaceComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface SpaceChatMessage {
  id: string;
  spaceId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface KnowledgeHistoryEvent {
  id: string;
  knowledgeId: string;
  version: string;
  parentVersion?: string;
  eventType: string;
  timestamp: string;
  authorId: string;
  authorName: string;
  identityType: 'Human' | 'AI' | 'Organization';
  aiModel?: string;
  commitMessage: string;
  detailedDescription?: string;
  trustScoreBefore?: number;
  trustScoreAfter?: number;
  verificationStatus?: string;
  changes?: {
    added?: string[];
    removed?: string[];
    modified?: string[];
  };
}

export interface Report {
  id: string;
  targetType: 'KnowledgeObject' | 'SpacePost' | 'SpaceComment' | 'Identity';
  targetId: string;
  targetTitle?: string; // Cache the title/preview for easier listing
  reporterId: string;
  reporterName?: string;
  category: 'Spam' | 'Misleading' | 'Illegal' | 'Harassment' | 'Other';
  details: string;
  status: 'Pending' | 'Reviewed' | 'Resolved' | 'Dismissed';
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'Bug' | 'Failure' | 'General' | 'FeatureRequest';
  status: 'Open' | 'Closed';
  creatorId: string;
  creatorName: string;
  creatorHandle?: string;
  creatorType?: string;
  upvotes: number;
  upvoters: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorHandle?: string;
  authorType?: string;
  content: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  requirements: string;
  xp: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  domain: 'Hardware' | 'Software' | 'Hybrid';
  status: 'Active' | 'Completed' | 'Archived';
  creatorId: string;
  creatorName: string;
  deadline: string;
  tags: string[];
  participantsCount: number;
  submissions: ChallengeSubmission[];
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  authorId: string;
  authorName: string;
  authorType: 'Human' | 'AI Agent';
  codeSolution: string;
  explanation: string;
  verdict: 'Passed' | 'Failed' | 'Pending';
  score: number;
  submittedAt: string;
}

export interface TrendingGuide {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'Hardware' | 'Software' | 'AI' | 'Systems';
  upvotes: number;
  upvoters: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  views: number;
  tags: string[];
}

export interface DebateContext {
  use_case: string;
  environment: string;
  constraints: string[];
}

export interface DebateDimensionScore {
  scoreA: number;
  scoreB: number;
  evidenceLinks: string[];
  reasoning: string;
  sandboxMetrics?: any;
}

export interface DebateResult {
  performance: DebateDimensionScore;
  reliability: DebateDimensionScore;
  usability: DebateDimensionScore;
  ecosystem: DebateDimensionScore;
  cost_efficiency: DebateDimensionScore;
  popularity: DebateDimensionScore;
  industry_fit: DebateDimensionScore;
}

export interface Debate {
  id: string;
  knowledge_a_id: string;
  knowledge_b_id: string;
  context_json: DebateContext;
  comparison_json: DebateResult | null;
  summary_json?: { overall_summary: string; recommendation: string };
  created_at: string;
  updated_at: string;
}
