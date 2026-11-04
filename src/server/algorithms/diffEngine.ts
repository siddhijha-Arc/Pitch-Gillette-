/**
 * Real Deterministic Idea Versioning & Diffing Engine
 *
 * Tracks version history, computes delta scores, and generates problem resolution ledgers.
 */

import { IdeaVersion, StartupIdea } from '../../types/index.ts';

export interface VersionDiffResult {
  previousVersion: number;
  newVersion: number;
  deltaReadinessScore: number;
  resolvedGapsList: string[];
  remainingRiskCount: number;
  deltaSummary: string;
}

export function computeVersionDiff(
  oldVersion: IdeaVersion | undefined,
  newVersion: IdeaVersion
): VersionDiffResult {
  const prevScore = oldVersion ? oldVersion.readinessScore : 45;
  const deltaScore = newVersion.readinessScore - prevScore;

  const resolvedGapsList = newVersion.resolvedGaps || [];
  const remainingRiskCount = (newVersion.remainingRisks || []).length;

  const deltaSummary = oldVersion
    ? `Version ${newVersion.version} upgraded readiness from ${prevScore}/100 to ${newVersion.readinessScore}/100 (+${deltaScore} pts). Addressed ${resolvedGapsList.length} key structural gaps with ${remainingRiskCount} operational risks remaining under monitoring.`
    : `Initial baseline Version ${newVersion.version} established with initial readiness ${newVersion.readinessScore}/100.`;

  return {
    previousVersion: oldVersion ? oldVersion.version : 0,
    newVersion: newVersion.version,
    deltaReadinessScore: deltaScore,
    resolvedGapsList,
    remainingRiskCount,
    deltaSummary,
  };
}

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
