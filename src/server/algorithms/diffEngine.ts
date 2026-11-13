/**
 * Real Deterministic Idea Versioning & Diffing Engine
 *
 * Tracks version history, computes delta scores, and generates problem resolution ledgers.
 */

import { IdeaVersion, StartupIdea } from '../../types/index.ts';

/**
 * Creates a new improved version snapshot and adds it to the idea's version ledger.
 */
export function recordImprovedIteration(
  idea: StartupIdea,
  refinedPitch: {
    pitchSummary: string;
    valueProposition: string;
    targetAudience: string;
    monetization: string;
    resolvedGaps: string[];
    remainingRisks: string[];
  }
): StartupIdea {
  const nextVerNum = (idea.currentVersion || 1) + 1;

  // Compute upgraded readiness score
  const resolvedCount = refinedPitch.resolvedGaps.length;
  const baseScore = idea.overallReadinessScore || 50;
  const newScore = Math.min(96, Math.max(baseScore + 12, 60 + resolvedCount * 6));

  const newVersionSnapshot: IdeaVersion = {
    version: nextVerNum,
    timestamp: new Date().toISOString(),
    pitchSummary: refinedPitch.pitchSummary,
    valueProposition: refinedPitch.valueProposition,
    targetAudience: refinedPitch.targetAudience,
    monetization: refinedPitch.monetization,
    resolvedGaps: refinedPitch.resolvedGaps,
    remainingRisks: refinedPitch.remainingRisks,
    readinessScore: newScore,
  };

  // Mark resolved gaps in main gap list
  const updatedGaps = idea.gaps.map((g) => {
    const isNowResolved = refinedPitch.resolvedGaps.some(
      (rg) => rg.toLowerCase().includes(g.title.toLowerCase()) || g.title.toLowerCase().includes(rg.toLowerCase())
    );
    if (isNowResolved && g.status !== 'RESOLVED') {
      return {
        ...g,
        status: 'RESOLVED' as const,
        resolutionStrategy: `Solved in Pitch V${nextVerNum}: Strategic repositioning & mitigation plan.`,
      };
    }
    return g;
  });

  return {
    ...idea,
    currentVersion: nextVerNum,
    overallReadinessScore: newScore,
    versions: [...(idea.versions || []), newVersionSnapshot],
    gaps: updatedGaps,
    updatedAt: new Date().toISOString(),
  };
}
