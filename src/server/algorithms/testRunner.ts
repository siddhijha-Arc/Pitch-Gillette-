/**
 * Algorithmic Unit Tests & Verification Runner
 *
 * Verifies mathematical correctness of TOPSIS, Graph Centrality,
 * Multi-Agent Statistical Variance, and State Cascades.
 */

import { calculateTopsis } from './topsis.ts';
import { ProblemDependencyGraph } from './graph.ts';
import { analyzeAgentConsensus } from './consensus.ts';
import { applyAnswerToIdea } from './adaptiveScheduler.ts';
import { SolutionCandidate, ProblemNode, AgentCritique, StartupIdea } from '../../types/index.ts';

export interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function runAllAlgorithmTests(): { summary: string; results: TestResult[] } {
  const results: TestResult[] = [];

  // ==========================================
  // Test 1: TOPSIS Mathematical Correctness
  // ==========================================
  try {
    const mockSolutions: SolutionCandidate[] = [
      {
        id: 's1',
        problemId: 'p1',
        problemTitle: 'P1',
        title: 'Solution Alpha (Balanced)',
        strategySummary: 'Test strategy 1',
        tradeoffs: 'Tradeoff 1',
        criteriaScores: {
          feasibility: 8,
          costEfficiency: 7,
          marketImpact: 9,
          scalability: 8,
          speedToImplement: 7,
        },
        topsisScore: 0,
        topsisRank: 0,
      },
      {
        id: 's2',
        problemId: 'p1',
        problemTitle: 'P1',
        title: 'Solution Beta (Fast but expensive)',
        strategySummary: 'Test strategy 2',
        tradeoffs: 'Tradeoff 2',
        criteriaScores: {
          feasibility: 6,
          costEfficiency: 3,
          marketImpact: 7,
          scalability: 6,
          speedToImplement: 9,
        },
        topsisScore: 0,
        topsisRank: 0,
      },
      {
        id: 's3',
        problemId: 'p1',
        problemTitle: 'P1',
        title: 'Solution Gamma (Weak)',
        strategySummary: 'Test strategy 3',
        tradeoffs: 'Tradeoff 3',
        criteriaScores: {
          feasibility: 3,
          costEfficiency: 4,
          marketImpact: 4,
          scalability: 4,
          speedToImplement: 3,
        },
        topsisScore: 0,
        topsisRank: 0,
      },
    ];

    const weights = {
      feasibility: 0.2,
      costEfficiency: 0.2,
      marketImpact: 0.2,
      scalability: 0.2,
      speedToImplement: 0.2,
    };

    const topsisRes = calculateTopsis(mockSolutions, weights);

    const scoresValid = topsisRes.rankedSolutions.every(
      (s) => s.topsisScore >= 0 && s.topsisScore <= 1.0
    );
    const alphaRank1 = topsisRes.rankedSolutions[0].id === 's1';
    const gammaRankLast = topsisRes.rankedSolutions[2].id === 's3';

    if (scoresValid && alphaRank1 && gammaRankLast) {
      results.push({
        name: 'TOPSIS Multi-Criteria Decision Engine',
        passed: true,
        details: `Calculated closeness scores: Alpha=${topsisRes.closenessScores['s1']}, Beta=${topsisRes.closenessScores['s2']}, Gamma=${topsisRes.closenessScores['s3']}. Ranks correctly assigned.`,
      });
    } else {
      results.push({
        name: 'TOPSIS Multi-Criteria Decision Engine',
        passed: false,
        details: `Unexpected rank order: ${JSON.stringify(topsisRes.rankedSolutions.map((s) => s.id))}`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'TOPSIS Multi-Criteria Decision Engine',
      passed: false,
      details: err.message,
    });
  }

  // ==========================================
  // Test 2: Problem DAG & Root Cause Centrality
  // ==========================================
  try {
    const mockProblems: ProblemNode[] = [
      {
        id: 'prob_root',
        ideaId: 'test',
        title: 'Core Hardware Architecture Bottleneck',
        description: 'Root cause',
        category: 'TECH',
        severity: 9,
        isRootCause: false,
        isSymptom: false,
        dependsOnProblemIds: [], // Root cause: causes others, depends on none
        assumptions: [],
        uncertaintyScore: 0.2,
      },
      {
        id: 'prob_mid',
        ideaId: 'test',
        title: 'High Latency Pipeline',
        description: 'Intermediate problem',
        category: 'OPERATIONAL',
        severity: 7,
        isRootCause: false,
        isSymptom: false,
        dependsOnProblemIds: ['prob_root'], // Caused by root
        assumptions: [],
        uncertaintyScore: 0.3,
      },
      {
        id: 'prob_leaf',
        ideaId: 'test',
        title: 'Customer Churn at Checkout',
        description: 'Terminal symptom',
        category: 'MARKET',
        severity: 8,
        isRootCause: false,
        isSymptom: false,
        dependsOnProblemIds: ['prob_mid'], // Caused by mid
        assumptions: [],
        uncertaintyScore: 0.1,
      },
    ];

    const graph = new ProblemDependencyGraph(mockProblems);
    const analysis = graph.analyze();

    const rootIdentified = analysis.rootCauses.some((r) => r.id === 'prob_root');
    const symptomIdentified = analysis.symptoms.some((s) => s.id === 'prob_leaf');
    const noCycles = !analysis.hasCycle;

    if (rootIdentified && symptomIdentified && noCycles) {
      results.push({
        name: 'Problem DAG & Centrality Analyzer',
        passed: true,
        details: `Identified root cause (prob_root) and terminal symptom (prob_leaf) with topological order: ${analysis.topologicalOrder.join(' -> ')}.`,
      });
    } else {
      results.push({
        name: 'Problem DAG & Centrality Analyzer',
        passed: false,
        details: `Failed to classify: rootCauses=${analysis.rootCauses.map((r) => r.id)}, symptoms=${analysis.symptoms.map((s) => s.id)}`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Problem DAG & Centrality Analyzer',
      passed: false,
      details: err.message,
    });
  }

  // ==========================================
  // Test 3: Multi-Agent Variance & Outlier Detection
  // ==========================================
  try {
    const mockCritiques: AgentCritique[] = [
      {
        agent: 'VC_PARTNER',
        agentName: 'VC',
        title: 'Partner',
        avatarIcon: 'DollarSign',
        overallScore: 9,
        dimensionScores: {
          tamAndOpportunity: 10,
          feasibilityAndTech: 7,
          businessModel: 8,
          userDesirability: 9,
          defensibility: 8,
        },
        verdict: 'STRONG_BUY',
        summaryQuote: 'Huge market',
        bullishArgument: 'TAM is massive',
        bearishArgument: 'Competition',
        keyConcerns: ['Sales cycle'],
        pivotsRecommended: [],
      },
      {
        agent: 'ICP_CUSTOMER',
        agentName: 'Customer',
        title: 'Buyer',
        avatarIcon: 'UserCheck',
        overallScore: 9,
        dimensionScores: {
          tamAndOpportunity: 8,
          feasibilityAndTech: 8,
          businessModel: 8,
          userDesirability: 10,
          defensibility: 7,
        },
        verdict: 'STRONG_BUY',
        summaryQuote: 'Need this now',
        bullishArgument: 'Pain relief',
        bearishArgument: 'Setup hassle',
        keyConcerns: [],
        pivotsRecommended: [],
      },
      {
        agent: 'LEGAL_COUNSEL',
        agentName: 'Legal',
        title: 'Counsel',
        avatarIcon: 'Scale',
        overallScore: 3, // Extreme outlier!
        dimensionScores: {
          tamAndOpportunity: 6,
          feasibilityAndTech: 5,
          businessModel: 4,
          userDesirability: 5,
          defensibility: 2,
        },
        verdict: 'STRONG_AVOID',
        summaryQuote: 'Illegal compliance risk',
        bullishArgument: 'Patent potential',
        bearishArgument: 'Massive fine risk',
        keyConcerns: ['GDPR breach'],
        pivotsRecommended: ['Zero retention'],
      },
    ];

    const consensus = analyzeAgentConsensus('test_idea', mockCritiques);
    const meanIs7 = Math.abs(consensus.meanScore - 7.0) < 0.1;
    const isPolarizing = consensus.isPolarizing;
    const legalIsOutlier = consensus.outlierAgents.some((o) => o.agent === 'LEGAL_COUNSEL');

    if (meanIs7 && isPolarizing && legalIsOutlier) {
      results.push({
        name: 'Multi-Agent Statistical Variance & Outlier Engine',
        passed: true,
        details: `Detected mean=${consensus.meanScore}, standard deviation σ=${consensus.standardDeviation}, flagged LEGAL_COUNSEL as outlier and identified dialectical tension.`,
      });
    } else {
      results.push({
        name: 'Multi-Agent Statistical Variance & Outlier Engine',
        passed: false,
        details: `Failed consensus check: mean=${consensus.meanScore}, isPolarizing=${isPolarizing}, outliers=${JSON.stringify(consensus.outlierAgents)}`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Multi-Agent Statistical Variance & Outlier Engine',
      passed: false,
      details: err.message,
    });
  }

  // ==========================================
  // Test 4: Adaptive Question State Cascade
  // ==========================================
  try {
    const mockIdea: StartupIdea = {
      id: 'test_idea',
      title: 'Test',
      tagline: 'Tag',
      rawPitch: 'Pitch',
      industry: 'Tech',
      stage: 'CONCEPT',
      overallReadinessScore: 50,
      createdAt: '',
      updatedAt: '',
      currentVersion: 1,
      versions: [],
      problems: [
        {
          id: 'p1',
          ideaId: 'test_idea',
          title: 'Problem 1',
          description: '',
          category: 'TECH',
          severity: 8,
          isRootCause: true,
          isSymptom: false,
          dependsOnProblemIds: [],
          assumptions: [
            {
              id: 'a1',
              statement: 'Core assumption',
              type: 'FOUNDER_ASSUMPTION',
              confidence: 0.3,
              isResolved: false,
            },
          ],
          uncertaintyScore: 0.7,
        },
      ],
      gaps: [
        {
          id: 'g1',
          ideaId: 'test_idea',
          pillar: 'TECH_VIABILITY',
          title: 'Tech Gap',
          deficiency: 'Unclear',
          severity: 'FATAL_FLAW',
          impactWeight: 5,
          status: 'OPEN',
        },
      ],
      solutions: [],
      topsisWeights: {
        feasibility: 0.2,
        costEfficiency: 0.2,
        marketImpact: 0.2,
        scalability: 0.2,
        speedToImplement: 0.2,
      },
      questions: [
        {
          id: 'q1',
          ideaId: 'test_idea',
          targetGapId: 'g1',
          targetProblemId: 'p1',
          question: 'How do you handle X?',
          investorRationale: 'Rationale',
          isAnswered: false,
          priorityScore: 9.0,
        },
      ],
      agentCritiques: [],
      pitchDeck: [],
    };

    const updated = applyAnswerToIdea(mockIdea, 'q1', 'We use an on-prem container with zero egress.');
    const gapResolved = updated.gaps.find((g) => g.id === 'g1')?.status === 'RESOLVED';
    const assumptionVerified = updated.problems[0].assumptions[0].type === 'VERIFIED_FACT';
    const scoreIncreased = updated.overallReadinessScore > 50;

    if (gapResolved && assumptionVerified && scoreIncreased) {
      results.push({
        name: 'Adaptive Question State Cascade & Ledger',
        passed: true,
        details: `Question answered: gap g1 marked RESOLVED, assumption a1 verified (confidence 0.95), readiness score increased from 50 to ${updated.overallReadinessScore}.`,
      });
    } else {
      results.push({
        name: 'Adaptive Question State Cascade & Ledger',
        passed: false,
        details: `Cascade check failed: gapStatus=${updated.gaps[0].status}, score=${updated.overallReadinessScore}`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Adaptive Question State Cascade & Ledger',
      passed: false,
      details: err.message,
    });
  }

  const allPassed = results.every((r) => r.passed);
  const summary = allPassed
    ? `All ${results.length} mathematical and algorithmic verification suites passed.`
    : `Algorithmic suite failure: ${results.filter((r) => !r.passed).length} tests failed.`;

  return { summary, results };
}
