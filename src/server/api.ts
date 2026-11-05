/**
 * Express REST API Router for Pitch-Ready
 *
 * Coordinates deterministic algorithms (TOPSIS, DAG, Variance Engine, Adaptive Scheduler)
 * with the Gemini live reasoning layer and PPTX exporter.
 * Zero mock fallbacks. Signals QUOTA_EXCEEDED so frontend prompts for API key.
 */

import express, { Request, Response } from 'express';
import { calculateTopsis } from './algorithms/topsis.ts';
import { ProblemDependencyGraph } from './algorithms/graph.ts';
import { analyzeAgentConsensus } from './algorithms/consensus.ts';
import { applyAnswerToIdea, rankCandidateQuestions } from './algorithms/adaptiveScheduler.ts';
import { recordImprovedIteration } from './algorithms/diffEngine.ts';
import { runAllAlgorithmTests } from './algorithms/testRunner.ts';
import {
  decomposeIdeaWithGemini,
  detectGapsWithGemini,
  generateAdaptiveQuestionsWithGemini,
  generatePitchDeckSlidesWithGemini,
  generateSolutionsWithGemini,
  runMultiAgentEvaluationWithGemini,
  synthesizeImprovedPitchWithGemini,
  chatWithJudgePersonaGemini,
  DEFAULT_GEMINI_KEY,
} from './gemini.ts';
import { generatePptxBuffer } from './pptxGenerator.ts';
import {
  AdaptiveQuestion,
  StartupIdea,
  TopsisCriteriaWeights,
} from '../types/index.ts';

const router = express.Router();

// Dynamic in-memory idea store
export const ideasDatabase: Map<string, StartupIdea> = new Map();

function getApiKey(req: Request): string | undefined {
  const headerKey = req.headers['x-gemini-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim() !== '') {
    return headerKey.trim();
  }
  return undefined;
}

function handleApiError(res: Response, err: any, fallbackMessage: string) {
  const errMsg = String(err?.message || err);
  if (
    err?.code === 'QUOTA_EXCEEDED' ||
    err?.name === 'QuotaExceededError' ||
    errMsg.includes('quota') ||
    errMsg.includes('429') ||
    errMsg.includes('RESOURCE_EXHAUSTED')
  ) {
    return res.status(429).json({
      success: false,
      error: 'QUOTA_EXCEEDED',
      message: 'Gemini AI API quota has been exhausted. Please enter your Gemini API Key in the prompt to continue.',
    });
  }
  return res.status(500).json({
    success: false,
    error: errMsg || fallbackMessage,
  });
}

/**
 * GET /api/test/algorithms - Run all unit tests for deterministic algorithms
 */
router.get('/test/algorithms', (_req: Request, res: Response) => {
  const testReport = runAllAlgorithmTests();
  res.json({
    success: true,
    ...testReport,
  });
});

/**
 * GET /api/gemini/status - Verify Gemini API connection & active quota
 */
router.get('/gemini/status', async (req: Request, res: Response) => {
  const apiKey = getApiKey(req) || DEFAULT_GEMINI_KEY;
  try {
    const resTest = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] }),
      }
    );
    const data = await resTest.json();
    if (!resTest.ok) {
      const errMsg = data.error?.message || '';
      const isQuota = resTest.status === 429 || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');
      return res.json({
        success: false,
        isQuotaExhausted: isQuota,
        status: resTest.status,
        error: errMsg,
      });
    }
    return res.json({ success: true, isQuotaExhausted: false });
  } catch (err: any) {
    return res.json({ success: false, isQuotaExhausted: false, error: err.message });
  }
});

/**
 * GET /api/ideas - List all ideas
 */
router.get('/ideas', (_req: Request, res: Response) => {
  const list = Array.from(ideasDatabase.values()).map((idea) => ({
    id: idea.id,
    title: idea.title,
    tagline: idea.tagline,
    industry: idea.industry,
    stage: idea.stage,
    overallReadinessScore: idea.overallReadinessScore,
    currentVersion: idea.currentVersion,
    problemCount: idea.problems.length,
    gapCount: idea.gaps.length,
    solutionCount: idea.solutions.length,
    updatedAt: idea.updatedAt,
  }));
  res.json({ success: true, ideas: list });
});

/**
 * GET /api/ideas/:id - Get full idea state
 */
router.get('/ideas/:id', (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Startup idea not found' });
    return;
  }
  res.json({ success: true, idea });
});

/**
 * POST /api/ideas - Create and automatically analyze new idea
 */
router.post('/ideas', async (req: Request, res: Response) => {
  const { title, rawPitch, stage } = req.body;
  if (!title || !rawPitch) {
    res.status(400).json({ success: false, error: 'Title and pitch description are required' });
    return;
  }

  const id = `idea_${Date.now()}`;
  const apiKey = getApiKey(req);

  try {
    const trimmedTitle = String(title).trim();
    const trimmedPitch = String(rawPitch).trim();

    // 1. Problem Decomposition via Gemini + Causal DAG Analysis
    const decomposition = await decomposeIdeaWithGemini(trimmedTitle, trimmedPitch, apiKey);
    const graphBuilder = new ProblemDependencyGraph(decomposition.problems as any);
    const graphAnalysis = graphBuilder.analyze();

    const enrichedProblems = decomposition.problems.map((prob) => {
      const nodeAnalysis = graphAnalysis.nodeAnalyses[prob.id];
      return {
        ...prob,
        ideaId: id,
        isRootCause: nodeAnalysis?.isRootCause ?? true,
        isSymptom: nodeAnalysis?.isSymptom ?? false,
        uncertaintyScore: nodeAnalysis?.uncertaintyRating ?? 0.5,
      };
    });

    // 2. 6-Pillar Gap Audit
    const gaps = await detectGapsWithGemini(trimmedTitle, trimmedPitch, enrichedProblems, apiKey);
    const mappedGaps = gaps.map((g) => ({ ...g, ideaId: id }));

    // 3. Solution Generation & Deterministic TOPSIS Ranking
    const rootProblems = enrichedProblems.filter((p) => p.isRootCause);
    const candidatePool = rootProblems.length > 0 ? rootProblems : enrichedProblems;
    const rawSolutions = await generateSolutionsWithGemini(candidatePool, mappedGaps, trimmedTitle, trimmedPitch, apiKey);
    const defaultWeights: TopsisCriteriaWeights = {
      feasibility: 0.25,
      costEfficiency: 0.2,
      marketImpact: 0.25,
      scalability: 0.15,
      speedToImplement: 0.15,
    };
    const topsisResult = calculateTopsis(rawSolutions, defaultWeights);

    const inferredIndustry = decomposition.industry || 'Technology';
    const computedReadinessScore = Math.min(
      88,
      Math.max(
        42,
        Math.round(
          (topsisResult.rankedSolutions[0]?.topsisScore || 0.6) * 60 +
            (10 - enrichedProblems.length) * 2 +
            (10 - mappedGaps.length) * 2
        )
      )
    );

    const newIdea: StartupIdea = {
      id,
      title: trimmedTitle,
      tagline: decomposition.tagline || `Intelligent solution for ${trimmedTitle}`,
      rawPitch: trimmedPitch,
      industry: inferredIndustry,
      stage: stage || 'CONCEPT',
      overallReadinessScore: computedReadinessScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVersion: 1,
      topsisWeights: defaultWeights,
      problems: enrichedProblems,
      gaps: mappedGaps,
      solutions: topsisResult.rankedSolutions,
      questions: [],
      agentCritiques: [],
      pitchDeck: [],
      versions: [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          pitchSummary: trimmedPitch.slice(0, 240),
          valueProposition: decomposition.tagline || trimmedTitle,
          targetAudience: 'Target market beachhead segment',
          monetization: 'Under assessment',
          resolvedGaps: [],
          remainingRisks: ['Initial problem-solution validation in progress'],
          readinessScore: computedReadinessScore,
        },
      ],
    };

    ideasDatabase.set(id, newIdea);
    res.status(201).json({ success: true, idea: newIdea });
  } catch (err: any) {
    handleApiError(res, err, 'Failed to analyze idea');
  }
});

/**
 * POST /api/ideas/:id/decompose - Run Problem Decomposition Engine
 */
router.post('/ideas/:id/decompose', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    const decomposition = await decomposeIdeaWithGemini(idea.title, idea.rawPitch, apiKey);
    const graphBuilder = new ProblemDependencyGraph(decomposition.problems as any);
    const graphAnalysis = graphBuilder.analyze();

    const enrichedProblems = decomposition.problems.map((prob) => {
      const nodeAnalysis = graphAnalysis.nodeAnalyses[prob.id];
      return {
        ...prob,
        isRootCause: nodeAnalysis?.isRootCause ?? true,
        isSymptom: nodeAnalysis?.isSymptom ?? false,
        uncertaintyScore: nodeAnalysis?.uncertaintyRating ?? 0.5,
      };
    });

    idea.tagline = decomposition.tagline || idea.tagline;
    idea.industry = decomposition.industry || idea.industry;
    idea.problems = enrichedProblems;
    idea.updatedAt = new Date().toISOString();
    ideasDatabase.set(idea.id, idea);

    res.json({
      success: true,
      problems: enrichedProblems,
      graphAnalysis: {
        hasCycle: graphAnalysis.hasCycle,
        topologicalOrder: graphAnalysis.topologicalOrder,
        rootCauseIds: graphAnalysis.rootCauses.map((r) => r.id),
        symptomIds: graphAnalysis.symptoms.map((s) => s.id),
      },
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to decompose idea');
  }
});

/**
 * POST /api/ideas/:id/gaps - Run Gap Detection Engine
 */
router.post('/ideas/:id/gaps', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    const gaps = await detectGapsWithGemini(idea.title, idea.rawPitch, idea.problems, apiKey);
    idea.gaps = gaps;
    idea.updatedAt = new Date().toISOString();
    ideasDatabase.set(idea.id, idea);

    res.json({ success: true, gaps });
  } catch (error) {
    handleApiError(res, error, 'Failed to detect gaps');
  }
});

/**
 * POST /api/ideas/:id/solutions - Generate Solutions & Run Initial TOPSIS
 */
router.post('/ideas/:id/solutions', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    const rootProblems = idea.problems.filter((p) => p.isRootCause);
    const candidatePool = rootProblems.length > 0 ? rootProblems : idea.problems;

    const rawSolutions = await generateSolutionsWithGemini(candidatePool, idea.gaps, idea.title, idea.rawPitch, apiKey);
    const topsisResult = calculateTopsis(rawSolutions, idea.topsisWeights);

    idea.solutions = topsisResult.rankedSolutions;
    idea.updatedAt = new Date().toISOString();
    ideasDatabase.set(idea.id, idea);

    res.json({
      success: true,
      solutions: topsisResult.rankedSolutions,
      topsisBreakdown: {
        idealBest: topsisResult.idealBest,
        idealWorst: topsisResult.idealWorst,
        normalizedMatrix: topsisResult.normalizedMatrix,
        weightedMatrix: topsisResult.weightedMatrix,
      },
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to generate solutions');
  }
});

/**
 * POST /api/ideas/:id/topsis/calculate - Recalculate TOPSIS deterministically
 */
router.post('/ideas/:id/topsis/calculate', (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const { weights } = req.body as { weights: TopsisCriteriaWeights };
  if (!weights) {
    res.status(400).json({ success: false, error: 'Weights are required' });
    return;
  }

  const topsisResult = calculateTopsis(idea.solutions, weights);
  idea.solutions = topsisResult.rankedSolutions;
  idea.topsisWeights = weights;
  idea.updatedAt = new Date().toISOString();
  ideasDatabase.set(idea.id, idea);

  res.json({
    success: true,
    rankedSolutions: topsisResult.rankedSolutions,
    topsisBreakdown: {
      idealBest: topsisResult.idealBest,
      idealWorst: topsisResult.idealWorst,
      separationBest: topsisResult.separationBest,
      separationWorst: topsisResult.separationWorst,
      closenessScores: topsisResult.closenessScores,
    },
  });
});

/**
 * GET /api/ideas/:id/questions/next - Get highest-priority adaptive question
 */
router.get('/ideas/:id/questions/next', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    if (!idea.questions || idea.questions.length === 0) {
      const generated = await generateAdaptiveQuestionsWithGemini(idea.gaps, idea.problems, idea.title, idea.rawPitch, apiKey);
      idea.questions = generated.map((q, idx) => ({
        id: `q_${Date.now()}_${idx}`,
        ideaId: idea.id,
        targetGapId: q.targetGapId,
        targetProblemId: q.targetProblemId,
        question: q.question,
        investorRationale: q.investorRationale,
        suggestedAnswers: q.suggestedAnswers,
        isAnswered: false,
        priorityScore: 5.0,
      }));
    }

    const ranked = rankCandidateQuestions(idea.questions, idea.gaps, idea.problems);
    const nextQuestion = ranked[0] || null;

    ideasDatabase.set(idea.id, idea);
    res.json({
      success: true,
      nextQuestion,
      remainingCount: ranked.length,
      allQuestions: idea.questions,
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to retrieve adaptive question');
  }
});

/**
 * POST /api/ideas/:id/questions/:qId/answer - Submit answer and trigger state cascade
 */
router.post('/ideas/:id/questions/:qId/answer', (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const { answerText } = req.body;
  if (!answerText) {
    res.status(400).json({ success: false, error: 'Answer text is required' });
    return;
  }

  const updatedIdea = applyAnswerToIdea(idea, req.params.qId, answerText);
  ideasDatabase.set(idea.id, updatedIdea);

  res.json({
    success: true,
    idea: updatedIdea,
    readinessScore: updatedIdea.overallReadinessScore,
    gaps: updatedIdea.gaps,
  });
});

/**
 * POST /api/ideas/:id/agents/evaluate - Run 6-Agent Deliberation & Consensus Engine
 */
router.post('/ideas/:id/agents/evaluate', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    const critiques = await runMultiAgentEvaluationWithGemini(idea, apiKey);
    const consensusReport = analyzeAgentConsensus(idea.id, critiques);

    idea.agentCritiques = critiques;
    idea.consensusReport = consensusReport;
    idea.updatedAt = new Date().toISOString();
    ideasDatabase.set(idea.id, idea);

    res.json({
      success: true,
      critiques,
      consensusReport,
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to run agent evaluation');
  }
});

/**
 * POST /api/ideas/:id/agents/:agentRole/chat - 1-on-1 real-time discussion with a judge persona
 */
router.post('/ideas/:id/agents/:agentRole/chat', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const { userMessage, chatHistory } = req.body;
  if (!userMessage || typeof userMessage !== 'string') {
    res.status(400).json({ success: false, error: 'userMessage string is required' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    const judgeResponse = await chatWithJudgePersonaGemini(
      idea,
      req.params.agentRole,
      userMessage,
      chatHistory || [],
      apiKey
    );

    res.json({
      success: true,
      response: judgeResponse,
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to generate judge response');
  }
});

/**
 * POST /api/ideas/:id/improve - Generate improved Pitch V2 & Version Ledger
 */
router.post('/ideas/:id/improve', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    const refined = await synthesizeImprovedPitchWithGemini(idea, apiKey);
    const updatedIdea = recordImprovedIteration(idea, refined);
    ideasDatabase.set(idea.id, updatedIdea);

    res.json({
      success: true,
      idea: updatedIdea,
      newVersion: updatedIdea.currentVersion,
      versions: updatedIdea.versions,
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to synthesize improvement');
  }
});

/**
 * POST /api/ideas/:id/deck/generate - Generate 10-slide pitch deck structure
 */
router.post('/ideas/:id/deck/generate', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    const slides = await generatePitchDeckSlidesWithGemini(idea, apiKey);
    idea.pitchDeck = slides;
    idea.updatedAt = new Date().toISOString();
    ideasDatabase.set(idea.id, idea);

    res.json({ success: true, slides });
  } catch (error) {
    handleApiError(res, error, 'Failed to generate pitch deck');
  }
});

/**
 * POST /api/ideas/:id/deck/export-pptx - Compile and stream native .pptx file
 */
router.post('/ideas/:id/deck/export-pptx', async (req: Request, res: Response) => {
  const idea = ideasDatabase.get(req.params.id);
  if (!idea) {
    res.status(404).json({ success: false, error: 'Idea not found' });
    return;
  }

  const apiKey = getApiKey(req);
  try {
    const { theme = 'EXECUTIVE_DARK' } = req.body;
    const slides = idea.pitchDeck && idea.pitchDeck.length > 0
      ? idea.pitchDeck
      : await generatePitchDeckSlidesWithGemini(idea, apiKey);

    const buffer = await generatePptxBuffer(idea, slides, theme);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(idea.title.replace(/[^a-zA-Z0-9_-]/g, '_'))}_PitchDeck.pptx"`);
    res.send(buffer);
  } catch (error) {
    handleApiError(res, error, 'Failed to compile PPTX file');
  }
});

export default router;
