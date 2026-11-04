/**
 * Real Deterministic Implementation of TOPSIS
 * (Technique for Order of Preference by Similarity to Ideal Solution)
 *
 * Used for multi-criteria decision making when evaluating startup solutions.
 * Pure mathematical computation with no LLM dependency.
 */

import { SolutionCandidate, TopsisCriteriaWeights } from '../../types/index.ts';

export interface CriteriaConfig {
  key: keyof SolutionCandidate['criteriaScores'];
  name: string;
  isBenefit: boolean; // true = higher is better; false = lower is better (cost)
}

export const CRITERIA_DEFINITIONS: CriteriaConfig[] = [
  { key: 'feasibility', name: 'Technical Feasibility', isBenefit: true },
  { key: 'costEfficiency', name: 'Capital Efficiency', isBenefit: true },
  { key: 'marketImpact', name: 'Market Impact', isBenefit: true },
  { key: 'scalability', name: 'Scalability', isBenefit: true },
  { key: 'speedToImplement', name: 'Speed to Market', isBenefit: true },
];

export interface TopsisCalculationResult {
  rankedSolutions: SolutionCandidate[];
  normalizedMatrix: Record<string, Record<string, number>>; // [solutionId][criterionKey]
  weightedMatrix: Record<string, Record<string, number>>;
  idealBest: Record<string, number>;
  idealWorst: Record<string, number>;
  separationBest: Record<string, number>;
  separationWorst: Record<string, number>;
  closenessScores: Record<string, number>;
}

/**
 * Executes the complete TOPSIS algorithm across candidate solutions.
 */
export function calculateTopsis(
  solutions: SolutionCandidate[],
  weights: TopsisCriteriaWeights
): TopsisCalculationResult {
  if (!solutions || solutions.length === 0) {
    return {
      rankedSolutions: [],
      normalizedMatrix: {},
      weightedMatrix: {},
      idealBest: {},
      idealWorst: {},
      separationBest: {},
      separationWorst: {},
      closenessScores: {},
    };
  }

  // If only 1 solution, trivial ranking
  if (solutions.length === 1) {
    const single = { ...solutions[0], topsisScore: 1.0, topsisRank: 1 };
    return {
      rankedSolutions: [single],
      normalizedMatrix: { [single.id]: { feasibility: 1 } },
      weightedMatrix: { [single.id]: { feasibility: 1 } },
      idealBest: { feasibility: 1 },
      idealWorst: { feasibility: 0 },
      separationBest: { [single.id]: 0 },
      separationWorst: { [single.id]: 1 },
      closenessScores: { [single.id]: 1.0 },
    };
  }

  // 1. Normalize Criteria Weights (Sum = 1.0)
  const rawWeightSum =
    (weights.feasibility || 0.2) +
    (weights.costEfficiency || 0.2) +
    (weights.marketImpact || 0.2) +
    (weights.scalability || 0.2) +
    (weights.speedToImplement || 0.2);

  const safeSum = rawWeightSum > 0 ? rawWeightSum : 1.0;
  const normalizedWeights: Record<keyof SolutionCandidate['criteriaScores'], number> = {
    feasibility: (weights.feasibility || 0.2) / safeSum,
    costEfficiency: (weights.costEfficiency || 0.2) / safeSum,
    marketImpact: (weights.marketImpact || 0.2) / safeSum,
    scalability: (weights.scalability || 0.2) / safeSum,
    speedToImplement: (weights.speedToImplement || 0.2) / safeSum,
  };

  // 2. Calculate column Euclidean norms: sqrt(sum(x_ij^2))
  const columnNorms: Record<string, number> = {};
  for (const crit of CRITERIA_DEFINITIONS) {
    let sumOfSquares = 0;
    for (const sol of solutions) {
      const val = Number(sol.criteriaScores[crit.key]) || 1;
      sumOfSquares += val * val;
    }
    columnNorms[crit.key] = Math.sqrt(sumOfSquares) || 1e-6; // avoid division by zero
  }

  // 3. Vector Normalization: r_ij = x_ij / norm_j
  const normalizedMatrix: Record<string, Record<string, number>> = {};
  for (const sol of solutions) {
    normalizedMatrix[sol.id] = {};
    for (const crit of CRITERIA_DEFINITIONS) {
      const val = Number(sol.criteriaScores[crit.key]) || 1;
      normalizedMatrix[sol.id][crit.key] = Number((val / columnNorms[crit.key]).toFixed(5));
    }
  }

  // 4. Weighted Normalized Matrix: v_ij = w_j * r_ij
  const weightedMatrix: Record<string, Record<string, number>> = {};
  for (const sol of solutions) {
    weightedMatrix[sol.id] = {};
    for (const crit of CRITERIA_DEFINITIONS) {
      const r_ij = normalizedMatrix[sol.id][crit.key];
      const w_j = normalizedWeights[crit.key];
      weightedMatrix[sol.id][crit.key] = Number((r_ij * w_j).toFixed(5));
    }
  }

  // 5. Determine Ideal Best (A+) and Ideal Worst (A-)
  const idealBest: Record<string, number> = {};
  const idealWorst: Record<string, number> = {};

  for (const crit of CRITERIA_DEFINITIONS) {
    const values = solutions.map((sol) => weightedMatrix[sol.id][crit.key]);
    if (crit.isBenefit) {
      idealBest[crit.key] = Math.max(...values);
      idealWorst[crit.key] = Math.min(...values);
    } else {
      idealBest[crit.key] = Math.min(...values);
      idealWorst[crit.key] = Math.max(...values);
    }
  }

  // 6. Calculate Euclidean Distance from Ideal Best (S_i+) and Worst (S_i-)
  const separationBest: Record<string, number> = {};
  const separationWorst: Record<string, number> = {};
  const closenessScores: Record<string, number> = {};

  for (const sol of solutions) {
    let sumDiffBestSq = 0;
    let sumDiffWorstSq = 0;

    for (const crit of CRITERIA_DEFINITIONS) {
      const v_ij = weightedMatrix[sol.id][crit.key];
      const best = idealBest[crit.key];
      const worst = idealWorst[crit.key];

      sumDiffBestSq += Math.pow(v_ij - best, 2);
      sumDiffWorstSq += Math.pow(v_ij - worst, 2);
    }

    const dPlus = Math.sqrt(sumDiffBestSq);
    const dMinus = Math.sqrt(sumDiffWorstSq);

    separationBest[sol.id] = Number(dPlus.toFixed(5));
    separationWorst[sol.id] = Number(dMinus.toFixed(5));

    // Closeness Coefficient C_i* = dMinus / (dPlus + dMinus)
    const denominator = dPlus + dMinus;
    const cScore = denominator > 0 ? dMinus / denominator : 0.5;
    closenessScores[sol.id] = Number(cScore.toFixed(4));
  }

  // 7. Sort by Closeness Score descending to assign ranks
  const rankedSolutions: SolutionCandidate[] = solutions
    .map((sol) => ({
      ...sol,
      normalizedScores: normalizedMatrix[sol.id],
      weightedScores: weightedMatrix[sol.id],
      distanceToIdealBest: separationBest[sol.id],
      distanceToIdealWorst: separationWorst[sol.id],
      topsisScore: closenessScores[sol.id],
      topsisRank: 1, // temporary, assigned below
    }))
    .sort((a, b) => b.topsisScore - a.topsisScore)
    .map((sol, index) => ({
      ...sol,
      topsisRank: index + 1,
    }));

  return {
    rankedSolutions,
    normalizedMatrix,
    weightedMatrix,
    idealBest,
    idealWorst,
    separationBest,
    separationWorst,
    closenessScores,
  };
}
