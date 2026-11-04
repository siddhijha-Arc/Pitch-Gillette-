import {
  BusinessProfile,
  CandidateQuestion,
  ExpertPersona,
  ExpertVerdict,
  CouncilConsensus,
  ProfileField,
  SmartQuestion,
  CategoryScores,
} from '../types/intakeModule.ts';

/**
 * EXPERT PERSONAS DEFINITION
 * Each persona has a unique weight profile for different business dimensions.
 */
export const EXPERT_PERSONAS: ExpertPersona[] = [
  {
    id: 'vc_pro',
    name: 'Sarah Chen',
    role: 'VC',
    bio: 'Venture Capitalist specializing in high-growth SaaS and AI infrastructure. Focuses on TAM, scalability, and defensibility.',
    weights: {
      marketFit: 0.2,
      scalability: 0.35,
      economicHealth: 0.15,
      defensibility: 0.25,
      executionRisk: 0.05,
    },
  },
  {
    id: 'customer_advocate',
    name: 'Marcus Bell',
    role: 'CUSTOMER',
    bio: 'Former product lead turned user advocate. Judges ideas based on pain urgency, pricing value, and ease of adoption.',
    weights: {
      marketFit: 0.45,
      scalability: 0.05,
      economicHealth: 0.3,
      defensibility: 0.1,
      executionRisk: 0.1,
    },
  },
  {
    id: 'domain_expert',
    name: 'Dr. Aris Varma',
    role: 'DOMAIN_EXPERT',
    bio: 'Seasoned CTO and domain specialist. Prioritizes technical feasibility and operational efficiency.',
    weights: {
      marketFit: 0.15,
      scalability: 0.2,
      economicHealth: 0.15,
      defensibility: 0.2,
      executionRisk: 0.3,
    },
  },
  {
    id: 'skeptic_risk',
    name: 'Elena Rossi',
    role: 'SKEPTIC',
    bio: 'Risk analyst and turnaround consultant. Looks for hidden costs, churn factors, and regulatory obstacles.',
    weights: {
      marketFit: 0.1,
      scalability: 0.15,
      economicHealth: 0.25,
      defensibility: 0.1,
      executionRisk: 0.4,
    },
  },
];

/**
 * Map ProfileField keys to CategoryScores keys
 */
function mapFieldToCategory(key: string): keyof CategoryScores {
  const k = key.toLowerCase();
  if (k.includes('customer') || k.includes('problem') || k.includes('solution') || k.includes('market')) return 'marketFit';
  if (k.includes('distribution') || k.includes('scalability') || k.includes('growth')) return 'scalability';
  if (k.includes('price') || k.includes('cost') || k.includes('economic') || k.includes('margin')) return 'economicHealth';
  if (k.includes('competition') || k.includes('advantage') || k.includes('defens') || k.includes('moat')) return 'defensibility';
  return 'executionRisk';
}

/**
 * Calculate individual expert verdicts based on mathematical weights
 */
export function calculateExpertVerdicts(fields: ProfileField[]): ExpertVerdict[] {
  // 1. Group fields by category and calculate category scores (0.0 to 1.0)
  const categoryValues: Record<keyof CategoryScores, { sum: number; count: number }> = {
    marketFit: { sum: 0, count: 0 },
    scalability: { sum: 0, count: 0 },
    economicHealth: { sum: 0, count: 0 },
    defensibility: { sum: 0, count: 0 },
    executionRisk: { sum: 0, count: 0 },
  };

  for (const f of fields) {
    const category = mapFieldToCategory(f.key);
    const confidence = Math.max(0, Math.min(1, f.confidence ?? 0));
    const fieldValue = (f as any).fieldValue ?? (confidence === 1.0 ? 0.8 : confidence === 0.5 ? 0.4 : 0.1);
    
    // Impact of the field affects how much it moves the category
    const weight = Math.max(1, f.impact || 1);
    categoryValues[category].sum += (fieldValue * weight);
    categoryValues[category].count += weight;
  }

  const scores: CategoryScores = {
    marketFit: categoryValues.marketFit.count > 0 ? categoryValues.marketFit.sum / categoryValues.marketFit.count : 0.4,
    scalability: categoryValues.scalability.count > 0 ? categoryValues.scalability.sum / categoryValues.scalability.count : 0.4,
    economicHealth: categoryValues.economicHealth.count > 0 ? categoryValues.economicHealth.sum / categoryValues.economicHealth.count : 0.4,
    defensibility: categoryValues.defensibility.count > 0 ? categoryValues.defensibility.sum / categoryValues.defensibility.count : 0.4,
    executionRisk: categoryValues.executionRisk.count > 0 ? categoryValues.executionRisk.sum / categoryValues.executionRisk.count : 0.4,
  };

  // 2. Calculate Verdict for each Persona
  return EXPERT_PERSONAS.map(persona => {
    let overall = 0;
    for (const [cat, weight] of Object.entries(persona.weights)) {
      overall += (scores[cat as keyof CategoryScores] * weight);
    }

    const scaledScore = Math.round(overall * 10);
    let sentiment: ExpertVerdict['sentiment'] = 'NEUTRAL';
    if (scaledScore >= 7) sentiment = 'BULLISH';
    else if (scaledScore <= 4) sentiment = 'SKEPTICAL';

    // Heuristic reason generation
    const bestCat = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as keyof CategoryScores;
    const worstCat = Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0] as keyof CategoryScores;

    const reasons = {
      marketFit: 'strong market demand and solution alignment',
      scalability: 'high growth potential and efficient distribution',
      economicHealth: 'healthy unit economics and pricing power',
      defensibility: 'strong competitive moat',
      executionRisk: 'low technical or operational risk',
    };

    const keyReason = sentiment === 'BULLISH' 
      ? `Impressive ${reasons[bestCat]}.`
      : sentiment === 'SKEPTICAL'
      ? `Concerned about ${reasons[worstCat].replace('strong', 'weak').replace('high', 'low').replace('healthy', 'fragile').replace('low', 'high')}.`
      : 'Balanced outlook with some open questions.';

    return {
      personaId: persona.id,
      personaName: persona.name,
      personaRole: persona.role,
      overallScore: scaledScore,
      categoryScores: { ...scores },
      sentiment,
      keyReason,
    };
  });
}

/**
 * Calculate overall Council Consensus using statistical engine
 */
export function calculateCouncilConsensus(verdicts: ExpertVerdict[]): CouncilConsensus {
  if (!verdicts.length) return { meanScore: 0, variance: 0, standardDeviation: 0, isPolarizing: false, verdict: '', synthesis: '', tensionPoints: [] };

  const scores = verdicts.map(v => v.overallScore);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  const isPolarizing = stdDev >= 1.8;

  let verdict = 'BALANCED_REVIEW';
  if (isPolarizing) verdict = 'HIGHLY_POLARIZING';
  else if (mean >= 7.5) verdict = 'CONSENSUS_BULLISH';
  else if (mean <= 4.5) verdict = 'CONSENSUS_BEARISH';

  // Identify tension points
  const tensionPoints: CouncilConsensus['tensionPoints'] = [];
  const categories: Array<keyof CategoryScores> = ['marketFit', 'scalability', 'economicHealth', 'defensibility', 'executionRisk'];
  
  for (const cat of categories) {
    const catScores = verdicts.map(v => ({ name: v.personaName, score: v.categoryScores[cat] }));
    const sorted = [...catScores].sort((a, b) => b.score - a.score);
    const spread = sorted[0].score - sorted[sorted.length - 1].score;

    if (spread >= 0.4) {
      tensionPoints.push({
        dimension: cat.replace(/([A-Z])/g, ' $1').trim(),
        description: `${sorted[0].name} sees this as a strength while ${sorted[sorted.length - 1].name} is skeptical.`,
        agents: [sorted[0].name, sorted[sorted.length - 1].name],
      });
    }
  }

  const synthesis = isPolarizing 
    ? 'The council is sharply divided. While some experts see massive upside, others flag existential risks.'
    : mean >= 7 
    ? 'The council is generally optimistic about this idea\'s potential.'
    : mean <= 4
    ? 'The council has significant reservations about the viability of this model.'
    : 'A mixed review with several areas needing further validation.';

  return {
    meanScore: Math.round(mean * 10) / 10,
    variance: Math.round(variance * 100) / 100,
    standardDeviation: Math.round(stdDev * 100) / 100,
    isPolarizing,
    verdict,
    synthesis,
    tensionPoints: tensionPoints.slice(0, 3),
  };
}

/**
 * Legacy Readiness Score (still used for some UI elements)
 */
export function calculateReadinessScore(fields: ProfileField[]): number {
  const verdicts = calculateExpertVerdicts(fields);
  const consensus = calculateCouncilConsensus(verdicts);
  return Math.round(consensus.meanScore * 10);
}

/**
 * Step C: Deterministic Priority calculation
 */
export function calculateFieldPriorities(fields: ProfileField[], maxFields: number = 7): ProfileField[] {
  const scored = fields
    .filter(f => (f.confidence ?? 0) < 1.0)
    .map(f => {
      const priority = (f.impact || 1) * (1 - (f.confidence ?? 0));
      return { field: f, priority };
    });

  scored.sort((a, b) => b.priority - a.priority);
  return scored.slice(0, maxFields).map(s => s.field);
}

/**
 * Question Simulation with Expert Influence
 */
export function simulateCandidateQuestion(
  candidate: CandidateQuestion,
  targetField: ProfileField,
  allFields: ProfileField[]
) {
  const otherFields = allFields.filter(f => f.key !== targetField.key);
  const simulatedResults = candidate.options.map(opt => {
    const mockFields = [...otherFields, { ...targetField, confidence: 1.0, fieldValue: opt.fieldValue } as ProfileField];
    const verdicts = calculateExpertVerdicts(mockFields);
    const consensus = calculateCouncilConsensus(verdicts);
    return consensus.meanScore;
  });

  const min = Math.min(...simulatedResults);
  const max = Math.max(...simulatedResults);
  
  return {
    questionValue: Math.round((max - min) * 10),
    minScore: Math.round(min * 10),
    maxScore: Math.round(max * 10),
  };
}

export function selectBestQuestions(
  candidatesByField: Record<string, CandidateQuestion[]>,
  fields: ProfileField[]
): SmartQuestion[] {
  const selected: SmartQuestion[] = [];

  for (const [fieldKey, candidates] of Object.entries(candidatesByField)) {
    const targetField = fields.find(f => f.key === fieldKey);
    if (!targetField) continue;

    const results = candidates.map(c => {
      const sim = simulateCandidateQuestion(c, targetField, fields);
      return { candidate: c, ...sim };
    });

    results.sort((a, b) => b.questionValue - a.questionValue);
    const best = results[0];

    const priorityScore = (targetField.impact || 1) * (1 - (targetField.confidence ?? 0));

    selected.push({
      ...best.candidate,
      questionValue: best.questionValue,
      simulatedMinScore: best.minScore,
      simulatedMaxScore: best.maxScore,
      priorityScore,
    });
  }

  selected.sort((a, b) => b.questionValue - a.questionValue);
  return selected;
}

export function validateCandidateCodeRules(
  candidate: CandidateQuestion,
  profile: BusinessProfile,
  existingQuestionTexts: string[]
): { valid: boolean; reason?: string } {
  const targetField = profile.fields.find(f => f.key === candidate.fieldKey);
  if (targetField && targetField.confidence >= 1.0) return { valid: false, reason: 'Field known' };
  if (existingQuestionTexts.includes(candidate.questionText)) return { valid: false, reason: 'Duplicate' };
  if (!candidate.options || candidate.options.length < 4) return { valid: false, reason: 'Few options' };
  return { valid: true };
}

export function categorizeUnderstanding(fields: ProfileField[]) {
  return {
    understood: fields.filter(f => f.confidence >= 0.5),
    unknown: fields.filter(f => f.confidence < 0.5),
  };
}
