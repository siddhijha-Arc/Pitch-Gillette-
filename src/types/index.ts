/**
 * Core Type Definitions for Pitch-Ready
 * AI Startup Idea Evaluator & Problem-Solving Engine
 */

export type ClaimType = 'VERIFIED_FACT' | 'FOUNDER_ASSUMPTION' | 'AI_HYPOTHESIS';

export type ProblemCategory =
  | 'MARKET'
  | 'TECH'
  | 'FINANCIAL'
  | 'OPERATIONAL'
  | 'REGULATORY'
  | 'COMPETITIVE';

export type GapPillar =
  | 'TAM_MARKET'
  | 'TECH_VIABILITY'
  | 'UNIT_ECONOMICS'
  | 'DISTRIBUTION'
  | 'LEGAL'
  | 'MOAT';

export type GapSeverity = 'FATAL_FLAW' | 'CRITICAL_GAP' | 'MODERATE_GAP' | 'OPTIMIZATION';

export type GapStatus = 'OPEN' | 'PARTIALLY_ADDRESSED' | 'RESOLVED';

export interface AssumptionItem {
  id: string;
  statement: string;
  type: ClaimType;
  evidenceSource?: string;
  confidence: number; // 0 - 1
  isResolved: boolean;
}

export type ProblemNodeType = 'ROOT_CAUSE' | 'INTERMEDIATE' | 'SYMPTOM';

export interface ProblemNode {
  id: string;
  ideaId?: string;
  title: string;
  description: string;
  category: ProblemCategory;
  severity: number; // 1 - 10
  nodeType?: ProblemNodeType; // 'ROOT_CAUSE' | 'INTERMEDIATE' | 'SYMPTOM'
  isRootCause: boolean; // Computed by graph in/out-degree centrality
  isSymptom: boolean;
  isIntermediate?: boolean;
  dependsOnProblemIds: string[]; // Directed edge: this problem depends on / is caused by (parent causes)
  whyItOccurs?: string;
  supportingEvidence?: string[];
  founderAssumptions?: string[];
  suggestedAction?: string;
  evidenceType?: 'VERIFIED_FACT' | 'AI_HYPOTHESIS' | 'FOUNDER_ASSUMPTION';
  assumptions: AssumptionItem[];
  uncertaintyScore: number; // 0 (verified) to 1 (purely speculative)
}

export interface GapRecord {
  id: string;
  ideaId?: string;
  problemId?: string;
  pillar: GapPillar;
  title: string;
  deficiency: string;
  severity: GapSeverity;
  impactWeight: number; // 1 - 5
  status: GapStatus;
  resolutionStrategy?: string;
}

export interface TopsisCriteriaWeights {
  feasibility: number;       // 0 - 1 (higher = more weight)
  costEfficiency: number;    // 0 - 1
  marketImpact: number;      // 0 - 1
  scalability: number;       // 0 - 1
  speedToImplement: number;  // 0 - 1
}

export interface SolutionCandidate {
  id: string;
  problemId: string;
  problemTitle: string;
  title: string;
  strategySummary: string;
  tradeoffs: string;
  criteriaScores: {
    feasibility: number;       // 1 - 10 (Benefit)
    costEfficiency: number;    // 1 - 10 (Benefit: 10 = very low capital cost)
    marketImpact: number;      // 1 - 10 (Benefit)
    scalability: number;       // 1 - 10 (Benefit)
    speedToImplement: number;  // 1 - 10 (Benefit: 10 = fastest to market)
  };
  normalizedScores?: Record<string, number>;
  weightedScores?: Record<string, number>;
  distanceToIdealBest?: number;
  distanceToIdealWorst?: number;
  topsisScore: number; // 0.000 to 1.000
  topsisRank: number;  // 1, 2, 3...
}

export interface AdaptiveQuestion {
  id: string;
  ideaId: string;
  targetProblemId?: string;
  targetGapId?: string;
  question: string;
  investorRationale: string;
  suggestedAnswers?: string[];
  answeredText?: string;
  isAnswered: boolean;
  priorityScore: number; // Computed by information entropy & severity
}

export type AgentPersona =
  | 'VC_PARTNER'
  | 'ICP_CUSTOMER'
  | 'TECH_ARCHITECT'
  | 'LEGAL_COUNSEL'
  | 'FINANCIAL_ANALYST'
  | 'HACKATHON_JUDGE';

export interface AgentCritique {
  agent: AgentPersona;
  agentName: string;
  title: string;
  avatarIcon: string;
  overallScore: number; // 1 - 10
  dimensionScores: {
    tamAndOpportunity: number;
    feasibilityAndTech: number;
    businessModel: number;
    userDesirability: number;
    defensibility: number;
  };
  verdict: 'STRONG_BUY' | 'CONDITIONAL_PASS' | 'STRONG_AVOID';
  summaryQuote: string;
  bullishArgument: string;
  bearishArgument: string;
  keyConcerns: string[];
  pivotsRecommended: string[];
}

export interface DialecticalDisagreement {
  dimension: string;
  agentA: { agent: AgentPersona; stance: string; score: number };
  agentB: { agent: AgentPersona; stance: string; score: number };
  tensionDescription: string;
  strategicResolution: string;
}

export interface ConsensusReport {
  ideaId: string;
  meanScore: number;
  variance: number;
  standardDeviation: number;
  isPolarizing: boolean;
  outlierAgents: { agent: AgentPersona; deviationFromMean: number; reason: string }[];
  dialecticalDisagreements: DialecticalDisagreement[];
  consensusVerdict: string;
  synthesisSummary: string;
}

export interface PitchDeckSlide {
  slideNumber: number;
  slideType:
    | 'TITLE'
    | 'PROBLEM'
    | 'ROOT_CAUSE'
    | 'SOLUTION'
    | 'WHY_NOW'
    | 'MARKET_SIZE'
    | 'PRODUCT'
    | 'BUSINESS_MODEL'
    | 'GO_TO_MARKET'
    | 'COMPETITIVE_MOAT'
    | 'FINANCIALS'
    | 'THE_ASK';
  title: string;
  subtitle: string;
  bullets: string[];
  metricCallout?: { label: string; value: string };
  citation?: string;
}

export interface IdeaVersion {
  version: number;
  timestamp: string;
  pitchSummary: string;
  valueProposition: string;
  targetAudience: string;
  monetization: string;
  resolvedGaps: string[];
  remainingRisks: string[];
  readinessScore: number;
}

export interface StartupIdea {
  id: string;
  title: string;
  tagline: string;
  rawPitch: string;
  industry: string;
  stage: 'CONCEPT' | 'EARLY_MVP' | 'GROWTH';
  overallReadinessScore: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  versions: IdeaVersion[];
  causalSummary?: string;
  problems: ProblemNode[];
  gaps: GapRecord[];
  solutions: SolutionCandidate[];
  topsisWeights: TopsisCriteriaWeights;
  questions: AdaptiveQuestion[];
  agentCritiques: AgentCritique[];
  consensusReport?: ConsensusReport;
  pitchDeck: PitchDeckSlide[];
  marketReport?: MarketIntelligenceReport;
}

export type IdeaValidationCategory =
  | 'VALID'
  | 'GIBBERISH'
  | 'PHYSICALLY_IMPOSSIBLE'
  | 'NON_STARTUP'
  | 'INSUFFICIENT_DETAIL';

export interface IdeaValidationResult {
  isValid: boolean;
  category: IdeaValidationCategory;
  reason: string;
  suggestion: string;
}

export type MarketSourceType =
  | 'GOOGLE_SEARCH'
  | 'BRAVE_SEARCH'
  | 'REDDIT_DISCUSSION'
  | 'YOUTUBE_DISCUSSION'
  | 'QUORA_DISCUSSION'
  | 'HACKER_NEWS_DISCUSSION'
  | 'PRODUCT_HUNT_DISCUSSION'
  | 'STACK_EXCHANGE_QA'
  | 'WORLD_BANK_DATA'
  | 'INDUSTRY_REPORT'
  | 'EXPERT_ANALYSIS';

export type VerificationStatus =
  | 'VERIFIED_FACT'
  | 'THIRD_PARTY_ESTIMATE'
  | 'AI_INTERPRETATION'
  | 'UNAVAILABLE';

export interface MarketSourceItem {
  id: string;
  title: string;
  url: string;
  sourceType: MarketSourceType;
  platformName?: string;
  publicationDate?: string;
  retrievalDate: string;
  evidenceExcerpt: string;
  verificationStatus: VerificationStatus;
  credibilityScore?: number;
}

export interface MarketOverviewSection {
  industryOverview: string;
  marketDemand: string;
  targetAudience: string;
  geography: string;
  marketSizeEvidence?: {
    totalAddressableMarket?: string;
    cagr?: string;
    sourceCitation?: string;
  };
}

export interface MarketTrendItem {
  id: string;
  trendTitle: string;
  description: string;
  growthIndicator?: string;
  evidenceSourceId?: string;
}

export interface CustomerProblemItem {
  id: string;
  problemTitle: string;
  customerComplaintSummary: string;
  discussionVolume?: string;
  sentiment?: 'HIGH_NEGATIVE' | 'MODERATE' | 'MIXED';
  sourcePlatform?:
    | 'Reddit'
    | 'YouTube'
    | 'Quora'
    | 'Hacker News'
    | 'Product Hunt'
    | 'Web Search'
    | 'Brave Web'
    | 'Industry Reports'
    | string;
  sourceId?: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface MarketOpportunityItem {
  id: string;
  opportunityTitle: string;
  description: string;
  underservedSegment: string;
  potentialDifferentiation: string;
}

export interface MarketRiskItem {
  id: string;
  riskTitle: string;
  riskDescription: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigationSuggestion: string;
}

export interface MarketStrategicRecommendations {
  recommendedTargetAudience: string;
  suggestedPositioning: string;
  initialValidationStrategy: string[];
  nextSteps: string[];
}

export interface MarketIntelligenceReport {
  id: string;
  ideaId: string;
  generatedAt: string;
  industryCategory: string;
  searchQueriesUsed: string[];
  sources: MarketSourceItem[];
  overview: MarketOverviewSection;
  trends: MarketTrendItem[];
  customerProblems: CustomerProblemItem[];
  opportunities: MarketOpportunityItem[];
  risks: MarketRiskItem[];
  recommendations: MarketStrategicRecommendations;
  isLiveResearch: boolean;
  apiStatus: {
    googleWebSearch?: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
    youtubeSearch?: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
    quoraSearch?: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
    braveSearch: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
    redditApi: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
    hackerNewsApi?: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
    stackExchangeApi?: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
    worldBank: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
  };
}
