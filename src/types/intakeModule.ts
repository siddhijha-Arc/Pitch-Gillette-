/**
 * Types for Idea Intake & Smart Questions Module
 */

export type CustomerType = 'B2C' | 'B2B' | 'B2B2C' | 'UNKNOWN';

export type ConfidenceLevel = 0.0 | 0.5 | 1.0; // 0 = missing, 0.5 = vague, 1.0 = known

export interface ProfileField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0.0, 0.5, or 1.0
  impact: number;     // 1 to 5 (weight in readiness score)
  isCustomGap?: boolean; // true if identified in Step B as business-specific
  notes?: string;
  source?: 'USER_PITCH' | 'MCQ_ANSWER' | 'FREE_TEXT' | 'UNSURE_RISK';
}

export interface ExpertPersona {
  id: string;
  name: string;
  role: 'VC' | 'CUSTOMER' | 'DOMAIN_EXPERT' | 'SKEPTIC';
  avatar?: string;
  bio: string;
  weights: Record<string, number>; // Weights for different evaluation categories
}

export interface CategoryScores {
  marketFit: number;
  scalability: number;
  economicHealth: number;
  defensibility: number;
  executionRisk: number;
}

export interface ExpertVerdict {
  personaId: string;
  personaName: string;
  personaRole: string;
  overallScore: number;
  categoryScores: CategoryScores;
  sentiment: 'BULLISH' | 'NEUTRAL' | 'SKEPTICAL';
  keyReason: string;
}

export interface CouncilConsensus {
  meanScore: number;
  variance: number;
  standardDeviation: number;
  isPolarizing: boolean;
  verdict: string;
  synthesis: string;
  tensionPoints: Array<{
    dimension: string;
    description: string;
    agents: [string, string]; // [Bullish Agent Name, Skeptical Agent Name]
  }>;
}

export interface BusinessProfile {
  ideaName: string;
  rawText: string;
  businessType: string;
  customerType: CustomerType;
  fields: ProfileField[];
}

export interface QuestionOption {
  id: string;
  label: string;
  fieldValue: number; // 0.0 to 1.0: business health score for this option
  explanation?: string;
}

export interface CandidateQuestion {
  id: string;
  fieldKey: string;
  questionText: string;
  businessTermQuoted: string; // Must quote user's words / context
  options: QuestionOption[];
}

export interface SmartQuestion extends CandidateQuestion {
  questionValue: number; // max(simulatedScore) - min(simulatedScore)
  simulatedMinScore: number;
  simulatedMaxScore: number;
  priorityScore: number;
  targetedExpertId?: string; // If this question specifically addresses an expert's doubt
}

export interface AnswerRecord {
  questionId: string;
  fieldKey: string;
  questionText: string;
  chosenOptionId?: string;
  chosenOptionLabel?: string;
  fieldValueAssigned: number;
  isNotSure: boolean;
  freeText?: string;
  timestamp: string;
}

export interface IntakeSessionState {
  sessionId: string;
  currentScreen: 'CHAT' | 'QUESTIONS' | 'SUMMARY';
  userRawInput: string;
  profile: BusinessProfile;
  initialScore: number;
  currentScore: number;
  expertVerdicts: ExpertVerdict[];
  consensus: CouncilConsensus;
  questions: SmartQuestion[];
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  isFollowUpRound: boolean;
  openRisks: string[];
  createdAt: string;
  updatedAt: string;
}
