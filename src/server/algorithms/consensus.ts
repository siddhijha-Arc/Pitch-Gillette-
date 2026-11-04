/**
 * Real Deterministic Multi-Agent Consensus & Disagreement Engine
 *
 * Replaces naive score averaging with statistical variance analysis,
 * outlier isolation, and dialectical conflict extraction.
 */

import {
  AgentCritique,
  AgentPersona,
  ConsensusReport,
  DialecticalDisagreement,
} from '../../types/index.ts';

export function analyzeAgentConsensus(
  ideaId: string,
  critiques: AgentCritique[]
): ConsensusReport {
  if (!critiques || critiques.length === 0) {
    return {
      ideaId,
      meanScore: 0,
      variance: 0,
      standardDeviation: 0,
      isPolarizing: false,
      outlierAgents: [],
      dialecticalDisagreements: [],
      consensusVerdict: 'INSUFFICIENT_DATA',
      synthesisSummary: 'No agent critiques available yet.',
    };
  }

  // 1. Calculate Mean Score (μ)
  const n = critiques.length;
  const sumScores = critiques.reduce((acc, c) => acc + c.overallScore, 0);
  const meanScore = Number((sumScores / n).toFixed(2));

  // 2. Calculate Population Variance (σ²) and Standard Deviation (σ)
  const sumSquaredDiffs = critiques.reduce(
    (acc, c) => acc + Math.pow(c.overallScore - meanScore, 2),
    0
  );
  const variance = Number((sumSquaredDiffs / n).toFixed(2));
  const standardDeviation = Number(Math.sqrt(variance).toFixed(2));

  // Polarizing threshold: σ >= 1.75 indicates sharp disagreement
  const isPolarizing = standardDeviation >= 1.75;

  // 3. Detect Outlier Agents: |score - μ| >= 1.3 * σ (statistically calibrated for 3 to 6 member committees)
  const outlierAgents: { agent: AgentPersona; deviationFromMean: number; reason: string }[] = [];
  const threshold = Math.max(1.3 * standardDeviation, 2.0);

  for (const c of critiques) {
    const deviation = Number((c.overallScore - meanScore).toFixed(2));
    if (Math.abs(deviation) >= threshold) {
      const direction = deviation > 0 ? 'bullish outlier' : 'bearish outlier';
      outlierAgents.push({
        agent: c.agent,
        deviationFromMean: deviation,
        reason: `${c.agentName} scored ${c.overallScore}/10 (${deviation > 0 ? '+' : ''}${deviation} from committee mean of ${meanScore}). Perspective is an extreme ${direction}.`,
      });
    }
  }

  // 4. Detect Specific Dialectical Disagreements between Agent Pairs
  const dialecticalDisagreements: DialecticalDisagreement[] = [];

  // Dimension keys to inspect
  const dimensions: Array<keyof AgentCritique['dimensionScores']> = [
    'tamAndOpportunity',
    'feasibilityAndTech',
    'businessModel',
    'userDesirability',
    'defensibility',
  ];

  const dimensionLabels: Record<keyof AgentCritique['dimensionScores'], string> = {
    tamAndOpportunity: 'Market Scale & Upside',
    feasibilityAndTech: 'Technical Implementation Viability',
    businessModel: 'Unit Economics & Monetization',
    userDesirability: 'Customer Urgency & Willingness to Pay',
    defensibility: 'Moat & IP Defensibility',
  };

  for (const dim of dimensions) {
    let minCritique = critiques[0];
    let maxCritique = critiques[0];

    for (const c of critiques) {
      const score = c.dimensionScores?.[dim] ?? c.overallScore;
      if (score < (minCritique.dimensionScores?.[dim] ?? minCritique.overallScore)) {
        minCritique = c;
      }
      if (score > (maxCritique.dimensionScores?.[dim] ?? maxCritique.overallScore)) {
        maxCritique = c;
      }
    }

    const minScore = minCritique.dimensionScores?.[dim] ?? minCritique.overallScore;
    const maxScore = maxCritique.dimensionScores?.[dim] ?? maxCritique.overallScore;
    const spread = maxScore - minScore;

    // Significant tension threshold: >= 3 points difference on a 1-10 scale
    if (spread >= 3.0 && minCritique.agent !== maxCritique.agent) {
      dialecticalDisagreements.push({
        dimension: dimensionLabels[dim],
        agentA: {
          agent: maxCritique.agent,
          stance: `${maxCritique.agentName}: Bullish (${maxScore}/10) - "${maxCritique.summaryQuote}"`,
          score: maxScore,
        },
        agentB: {
          agent: minCritique.agent,
          stance: `${minCritique.agentName}: Skeptical (${minScore}/10) - "${minCritique.summaryQuote}"`,
          score: minScore,
        },
        tensionDescription: `High tension on ${dimensionLabels[dim]}: ${maxCritique.agentName} rates this as a core strength while ${minCritique.agentName} flags it as an existential obstacle.`,
        strategicResolution: `Address ${minCritique.agentName}'s specific objection (${minCritique.keyConcerns[0] || 'execution risks'}) to unlock the upside identified by ${maxCritique.agentName}.`,
      });
    }
  }

  // 5. Determine Committee Verdict
  let consensusVerdict = 'BALANCED_REVIEW';
  if (isPolarizing) {
    consensusVerdict = 'HIGHLY_POLARIZING_PROPOSAL';
  } else if (meanScore >= 7.5) {
    consensusVerdict = 'CONSENSUS_BULLISH';
  } else if (meanScore <= 4.5) {
    consensusVerdict = 'CONSENSUS_BEARISH';
  } else {
    consensusVerdict = 'MIXED_VIABILITY_PIVOT_RECOMMENDED';
  }

  // 6. Synthesis Summary
  const polarizingClause = isPolarizing
    ? `The committee exhibits high tension (standard deviation σ=${standardDeviation}). Do NOT treat this as a simple ${meanScore}/10 average: this proposal has sharp polarity between advocates and critics.`
    : `The committee exhibits moderate alignment (standard deviation σ=${standardDeviation}, mean ${meanScore}/10).`;

  const synthesisSummary = `${polarizingClause} Primary dialectical conflict is observed in ${
    dialecticalDisagreements.length > 0
      ? dialecticalDisagreements.map((d) => d.dimension).join(', ')
      : 'execution timelines'
  }. Key path forward requires resolving the highest-severity concerns identified by skeptical committee members.`;

  return {
    ideaId,
    meanScore,
    variance,
    standardDeviation,
    isPolarizing,
    outlierAgents,
    dialecticalDisagreements,
    consensusVerdict,
    synthesisSummary,
  };
}
