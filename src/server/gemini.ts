/**
 * Server-Side Gemini Intelligence Layer
 *
 * Exclusively executes live Gemini AI calls.
 * Zero mock fallbacks. If API quota is exhausted, surfaces a clear QUOTA_EXCEEDED error
 * so the frontend can prompt the user to input their custom API key.
 */

import {
  AgentCritique,
  GapRecord,
  PitchDeckSlide,
  ProblemNode,
  SolutionCandidate,
  StartupIdea,
} from '../types/index.ts';

// Default user-provided key & environment fallback
export const DEFAULT_GEMINI_KEY =
  process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    ? process.env.GEMINI_API_KEY.trim()
    : '';

// High-availability model cascade verified to have active quota
const MODELS_CASCADE = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
];

export class QuotaExceededError extends Error {
  code = 'QUOTA_EXCEEDED';
  constructor(message: string = 'Gemini AI API quota has been exhausted. Please enter your Gemini API Key to continue.') {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

/**
 * Executes a structured JSON prompt against the Gemini REST API
 */
async function callGeminiRestJson<T>(
  prompt: string,
  systemInstruction: string,
  userApiKey?: string
): Promise<T> {
  const apiKey = (userApiKey && userApiKey.trim() !== '' ? userApiKey.trim() : DEFAULT_GEMINI_KEY);
  if (!apiKey) {
    throw new QuotaExceededError(
      'GEMINI_API_KEY is not configured. Set the GEMINI_API_KEY environment variable on Render or enter your key in the UI.'
    );
  }

  let lastError: any = null;
  let isAnyQuotaExceeded = false;

  for (const model of MODELS_CASCADE) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error?.message || '';
        const errCode = data.error?.code;
        if (errCode === 429 || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          isAnyQuotaExceeded = true;
          // Try next model in cascade
          continue;
        }
        lastError = new Error(`Gemini API Error (${errCode}): ${errMsg}`);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = new Error('Empty response from Gemini');
        continue;
      }

      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        lastError = new Error(`Request timed out on model ${model}`);
        continue;
      }
      const errStr = String(err?.message || err);
      if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('RESOURCE_EXHAUSTED')) {
        isAnyQuotaExceeded = true;
        continue;
      }
      lastError = err;
    }
  }

  if (isAnyQuotaExceeded) {
    throw new QuotaExceededError();
  }

  throw lastError || new Error('Failed to generate response from Gemini AI');
}

/**
 * 1. Problem Decomposition & Assumption Extraction
 */
export async function decomposeIdeaWithGemini(
  title: string,
  rawPitch: string,
  apiKey?: string
): Promise<{
  problems: Omit<ProblemNode, 'isRootCause' | 'isSymptom' | 'uncertaintyScore'>[];
  industry: string;
  tagline: string;
}> {
  const systemInstruction = `You are a Principal Venture Architect and Systems Engineer.
Analyze the provided startup pitch and decompose it into distinct structural problems, bottlenecks, and causal dependencies.
Autonomously discover and classify the exact industry / vertical (e.g. "AgTech / Autonomous Robotics", "CleanTech / Grid Storage", "FinTech / Cross-Border Settlement", "MedTech / Point-of-Care Diagnostics").
Extract both explicit and implicit founder assumptions for each problem.
For each assumption, classify as 'VERIFIED_FACT', 'FOUNDER_ASSUMPTION', or 'AI_HYPOTHESIS' and assign a confidence value between 0.0 and 1.0.

Respond strictly with valid JSON conforming to this schema:
{
  "tagline": "A punchy 8-12 word positioning tagline",
  "industry": "Identified Industry / Vertical",
  "problems": [
    {
      "id": "prob_1",
      "title": "Clear concise problem label specific to this idea",
      "description": "2-3 sentences explaining the mechanism of failure or friction",
      "category": "MARKET" | "TECH" | "FINANCIAL" | "OPERATIONAL" | "REGULATORY" | "COMPETITIVE",
      "severity": 8, // 1 to 10
      "dependsOnProblemIds": ["prob_2"],
      "assumptions": [
        {
          "id": "ass_1_1",
          "statement": "Key assumption being made in the pitch",
          "type": "FOUNDER_ASSUMPTION" | "VERIFIED_FACT" | "AI_HYPOTHESIS",
          "confidence": 0.45,
          "isResolved": false
        }
      ]
    }
  ]
}`;

  const prompt = `Pitch Title: ${title}\nFull Pitch Description:\n${rawPitch}`;
  return callGeminiRestJson(prompt, systemInstruction, apiKey);
}

/**
 * 2. 6-Pillar Venture Gap Detection
 */
export async function detectGapsWithGemini(
  title: string,
  pitch: string,
  problems: ProblemNode[],
  apiKey?: string
): Promise<GapRecord[]> {
  const systemInstruction = `You are a Venture Capital Due Diligence Director.
Audit this specific startup pitch across the 6 venture pillars:
- TAM_MARKET (Total Addressable Market, bottom-up sizing, market expansion)
- TECH_VIABILITY (Algorithmic moat, infrastructure scaling, hardware/cloud latency, IP)
- UNIT_ECONOMICS (CAC, LTV, gross margin, pricing power, burn multiple)
- DISTRIBUTION (Go-to-market channels, virality, channel partnerships, sales velocity)
- LEGAL (Regulatory compliance, data privacy, liability exposure, certifications)
- MOAT (Defensibility, switching costs, network effects, data flywheels)

Make every single gap deeply tailored to the specific industry and pitch mechanics.
Output JSON:
{
  "gaps": [
    {
      "id": "gap_1",
      "pillar": "TAM_MARKET" | "TECH_VIABILITY" | "UNIT_ECONOMICS" | "DISTRIBUTION" | "LEGAL" | "MOAT",
      "title": "Short title of the missing component or vulnerability",
      "deficiency": "Direct critique of what is missing or unsupported in this idea",
      "severity": "FATAL_FLAW" | "CRITICAL_GAP" | "MODERATE_GAP" | "OPTIMIZATION",
      "impactWeight": 4, // 1 to 5
      "status": "OPEN"
    }
  ]
}`;

  const prompt = `Startup: ${title}\nPitch: ${pitch}\nIdentified Problems: ${JSON.stringify(
    problems.map((p) => ({ title: p.title, category: p.category, description: p.description }))
  )}`;

  const res = await callGeminiRestJson<{ gaps: GapRecord[] }>(prompt, systemInstruction, apiKey);
  return res.gaps || [];
}

/**
 * 3. Solution Generation for Root Causes
 */
export async function generateSolutionsWithGemini(
  rootProblems: ProblemNode[],
  gaps: GapRecord[],
  title: string = '',
  pitch: string = '',
  apiKey?: string
): Promise<SolutionCandidate[]> {
  const systemInstruction = `You are an elite Startup Strategy Consultant and CTO.
For the provided root problems and critical gaps, formulate 3-4 distinct strategic solutions specifically addressing this idea's technology and market.
For each solution, assign raw 1-10 scores across the 5 evaluation criteria:
- feasibility: Technical implementation feasibility (10 = highly feasible with existing tech)
- costEfficiency: Capital efficiency (10 = very cheap to implement; 1 = burns millions)
- marketImpact: Customer value & market differentiation (10 = transformative breakthrough)
- scalability: Ability to scale without linear human/hardware cost (10 = instant software scale)
- speedToImplement: Time to launch MVP (10 = 2 weeks; 1 = 18 months R&D)

Output JSON:
{
  "solutions": [
    {
      "id": "sol_1",
      "problemId": "prob_root",
      "problemTitle": "Problem label",
      "title": "Concise solution strategy name",
      "strategySummary": "2-3 sentences explaining the tactical implementation",
      "tradeoffs": "Key trade-off or risk accepted in this approach",
      "criteriaScores": {
        "feasibility": 8.5,
        "costEfficiency": 7.5,
        "marketImpact": 9.0,
        "scalability": 8.0,
        "speedToImplement": 6.5
      }
    }
  ]
}`;

  const effectiveTitle = title || rootProblems[0]?.title || 'Startup Core';
  const prompt = `Startup Title: ${effectiveTitle}\nPitch Narrative: ${pitch}\nRoot Problems:\n${JSON.stringify(
    rootProblems.map((p) => ({ id: p.id, title: p.title, description: p.description }))
  )}\n\nCritical Gaps:\n${JSON.stringify(gaps.slice(0, 4).map((g) => ({ title: g.title, deficiency: g.deficiency })))}`;

  const res = await callGeminiRestJson<{ solutions: SolutionCandidate[] }>(prompt, systemInstruction, apiKey);
  return res.solutions || [];
}

/**
 * 4. Multi-Agent Evaluation Deliberation
 */
export async function runMultiAgentEvaluationWithGemini(
  idea: StartupIdea,
  apiKey?: string
): Promise<AgentCritique[]> {
  const systemInstruction = `You are an orchestrated Investment & Diligence Committee comprising 6 distinct personas:
1. VC_PARTNER: Focuses on return potential, market TAM ($10B+), fundability, defensibility, and exit routes in this specific vertical.
2. ICP_CUSTOMER: The exact Target Buyer for this specific idea. Focuses on acute pain, willingness to pay, onboarding hassle, and replacement friction.
3. TECH_ARCHITECT: Veteran CTO. Focuses on tech stack reality, latency, API/hardware costs, failure modes, scalability bottlenecks, and reliability.
4. LEGAL_COUNSEL: Regulatory & Compliance Specialist. Focuses on industry regulations, liability lawsuits, licensing, and compliance mandates.
5. FINANCIAL_ANALYST: CFO/Unit Economics Specialist. Focuses on CAC/LTV, burn rate, margins, payback period, and pricing power for this business model.
6. HACKATHON_JUDGE: Pragmatic Product Builder. Focuses on MVP execution speed, demo punch, elegance, and immediate traction.

Do NOT give uniform or polite scores. Each agent MUST judge fiercely through their specific lens!
Scores must range realistically between 2 and 9. All arguments and quotes MUST reference the actual startup pitch.

Output JSON:
{
  "critiques": [
    {
      "agent": "VC_PARTNER" | "ICP_CUSTOMER" | "TECH_ARCHITECT" | "LEGAL_COUNSEL" | "FINANCIAL_ANALYST" | "HACKATHON_JUDGE",
      "agentName": "Name / Role",
      "title": "Persona Title",
      "avatarIcon": "DollarSign" | "UserCheck" | "Cpu" | "Scale" | "TrendingUp" | "Award",
      "overallScore": 7, // 1 to 10
      "dimensionScores": {
        "tamAndOpportunity": 8,
        "feasibilityAndTech": 7,
        "businessModel": 6,
        "userDesirability": 8,
        "defensibility": 5
      },
      "verdict": "STRONG_BUY" | "CONDITIONAL_PASS" | "STRONG_AVOID",
      "summaryQuote": "A 1-sentence memorable quote capturing their true verdict for this startup",
      "bullishArgument": "2-3 sentences on what could make this specific company a massive winner",
      "bearishArgument": "2-3 sentences on what will kill this specific company if not fixed",
      "keyConcerns": ["Concern 1", "Concern 2"],
      "pivotsRecommended": ["Pivot recommendation 1"]
    }
  ]
}`;

  const prompt = `Pitch Title: ${idea.title}\nTagline: ${idea.tagline}\nIndustry: ${idea.industry}\nPitch:\n${idea.rawPitch}\n\nTop Solutions:\n${JSON.stringify(
    idea.solutions.slice(0, 3).map((s) => ({ title: s.title, strategy: s.strategySummary }))
  )}`;

  const res = await callGeminiRestJson<{ critiques: AgentCritique[] }>(prompt, systemInstruction, apiKey);
  return res.critiques || [];
}

/**
 * 5. Adaptive Probing Question Generation
 */
export async function generateAdaptiveQuestionsWithGemini(
  gaps: GapRecord[],
  problems: ProblemNode[],
  title: string = '',
  pitch: string = '',
  apiKey?: string
): Promise<Array<{ targetGapId: string; targetProblemId: string; question: string; investorRationale: string; suggestedAnswers: string[] }>> {
  const systemInstruction = `You are a ruthless Lead Investor in a partner meeting.
Generate 3 precise, high-leverage probing questions targeting the most critical unverified assumptions and gaps in this specific startup.
Explain in 1 sentence why answering this is vital for fundability.
Provide 3 realistic multiple-choice quick responses tailored to this domain.

Output JSON:
{
  "questions": [
    {
      "targetGapId": "gap_1",
      "targetProblemId": "prob_1",
      "question": "Crisp, direct question specific to this pitch",
      "investorRationale": "Why this specific answer changes the valuation or risk profile",
      "suggestedAnswers": ["Choice A", "Choice B", "Choice C"]
    }
  ]
}`;

  const prompt = `Startup: ${title}\nPitch: ${pitch}\nGaps:\n${JSON.stringify(gaps.slice(0, 3))}\nProblems:\n${JSON.stringify(
    problems.slice(0, 3).map((p) => ({ id: p.id, title: p.title, assumptions: p.assumptions }))
  )}`;

  const res = await callGeminiRestJson<{ questions: any[] }>(prompt, systemInstruction, apiKey);
  return res.questions || [];
}

/**
 * 6. Dynamic Improvement Synthesis
 */
export async function synthesizeImprovedPitchWithGemini(
  idea: StartupIdea,
  apiKey?: string
): Promise<{
  pitchSummary: string;
  valueProposition: string;
  targetAudience: string;
  monetization: string;
  resolvedGaps: string[];
  remainingRisks: string[];
}> {
  const topSolution = idea.solutions[0];
  const systemInstruction = `You are a legendary Startup Incubator Master and Pitch Doctor.
Synthesize an improved, de-risked version of this specific startup idea (Pitch V2).
Incorporate the highest-ranked TOPSIS solution, address the key investor objections, and state clearly which gaps are now resolved vs. which operational risks remain.

Output JSON:
{
  "pitchSummary": "Refined 3-sentence executive pitch incorporating the winning strategic architecture",
  "valueProposition": "Crisp single-sentence core UVP",
  "targetAudience": "Sharpened beachhead customer profile (ICP)",
  "monetization": "Robust unit economics and pricing model",
  "resolvedGaps": ["List of gap titles resolved in this version"],
  "remainingRisks": ["List of operational challenges that still need execution tracking"]
}`;

  const prompt = `Startup: ${idea.title}\nIndustry: ${idea.industry}\nOriginal Pitch: ${idea.rawPitch}\nWinning Solution: ${topSolution?.title || ''}\nSolution Details: ${
    topSolution?.strategySummary || ''
  }\nResolved Assumptions: ${JSON.stringify(
    idea.problems.flatMap((p) => p.assumptions.filter((a) => a.isResolved).map((a) => a.statement))
  )}`;

  return callGeminiRestJson(prompt, systemInstruction, apiKey);
}

/**
 * 7. Pitch Deck Slide Structure Generation
 */
export async function generatePitchDeckSlidesWithGemini(
  idea: StartupIdea,
  apiKey?: string
): Promise<PitchDeckSlide[]> {
  const topSolution = idea.solutions[0];

  const systemInstruction = `You are a Venture Partner and Master Pitch Deck Designer.
Create a structured 10-slide investor pitch deck for this refined startup idea.
Ensure the narrative directly highlights the problem decomposition, root-cause breakthroughs, and defensible economics.

Slides must follow this sequence:
1. TITLE: Company name, punchy tagline, presenter info
2. PROBLEM: The painful status quo and why existing solutions fail
3. ROOT_CAUSE: The hidden systemic cause that competitors overlook
4. SOLUTION: Our proprietary, de-risked solution and unfair advantage
5. WHY_NOW: Regulatory, technological, or market macro catalysts
6. MARKET_SIZE: TAM, SAM, and realistic SOM bottom-up breakdown
7. PRODUCT: Architecture, workflow diagram summary, and user experience
8. BUSINESS_MODEL: Monetization, pricing tiers, gross margins, and LTV/CAC
9. COMPETITIVE_MOAT: Defensibility, switching barriers, network effects
10. THE_ASK: Capital needed, use of funds, and 18-month key milestones

Output JSON:
{
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "TITLE",
      "title": "Slide Title",
      "subtitle": "Slide Subtitle / Framing",
      "bullets": ["Bullet 1", "Bullet 2", "Bullet 3"],
      "metricCallout": { "label": "Key Stat", "value": "e.g. $12.4B or 84%" },
      "citation": "Grounded source or industry benchmark"
    }
  ]
}`;

  const prompt = `Startup: ${idea.title}\nTagline: ${idea.tagline}\nIndustry: ${idea.industry}\nPitch:\n${idea.rawPitch}\nReadiness Score: ${idea.overallReadinessScore}/100\nTop Solution: ${
    topSolution?.title || ''
  } - ${topSolution?.strategySummary || ''}\nProblems Addressed:\n${JSON.stringify(
    idea.problems.map((p) => p.title)
  )}`;

  const res = await callGeminiRestJson<{ slides: PitchDeckSlide[] }>(prompt, systemInstruction, apiKey);
  return res.slides || [];
}

/**
 * Executes a freeform text generation prompt against Gemini for live chats
 */
async function callGeminiRestText(
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  systemInstruction: string,
  userApiKey?: string
): Promise<string> {
  const apiKey = userApiKey && userApiKey.trim() !== '' ? userApiKey.trim() : DEFAULT_GEMINI_KEY;
  if (!apiKey) {
    throw new QuotaExceededError(
      'GEMINI_API_KEY is not configured. Set the GEMINI_API_KEY environment variable on Render or enter your key in the UI.'
    );
  }

  let lastError: any = null;

  for (const model of MODELS_CASCADE) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error?.message || '';
        const errCode = data.error?.code;
        if (errCode === 429 || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          continue;
        }
        lastError = new Error(`Gemini API Error (${errCode}): ${errMsg}`);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new QuotaExceededError('Gemini text generation failed.');
}

/**
 * 8. Real-time persona chat with individual council judges
 */
export async function chatWithJudgePersonaGemini(
  idea: StartupIdea,
  agentRole: string,
  userMessage: string,
  chatHistory: Array<{ sender: 'user' | 'judge'; text: string }> = [],
  apiKey?: string
): Promise<string> {
  const critique = idea.agentCritiques?.find(
    (c) => c.agent === agentRole
  );

  const personaPrompts: Record<string, string> = {
    VC_PARTNER: `You are Marcus Thorne, General Partner at a top Tier-1 Venture Capital firm. You are direct, sharp, and focused on TAM, multi-billion dollar scalability, high gross margins, defensible moats, and exit multiples. You speak concise, professional VC terminology with sharp analytical questions.`,
    ICP_CUSTOMER: `You are Dr. Sarah Jenkins, Chief Medical Officer at a major regional hospital system. You are pragmatic, patient-outcome-focused, and deeply concerned with clinical workflows, emergency department throughput, integration with EHRs (Epic/Cerner), and operational safety. Speak like an experienced executive physician.`,
    TECH_ARCHITECT: `You are Alex Chen, a Veteran CTO and Cloud-Native Systems Architect. You are technical, precise, and obsessed with real-time data synchronization, microservices, latency, IoT hardware reliability, and distributed systems failovers. Speak like a senior tech lead.`,
    LEGAL_COUNSEL: `You are Elena Rodriguez, a Healthcare Regulatory & Compliance Attorney. You are meticulous, risk-averse, and highly focused on HIPAA, MSO corporate structures, state medical boards, anti-kickback statutes, and legal liability moats. Speak like a sharp legal expert.`,
    FINANCIAL_ANALYST: `You are David Wu, CFO & Unit Economics Specialist. You focus on cash flow, gross margins, CAC payback periods, COGS, pricing models, and capital efficiency. Speak like a sharp financial analyst.`,
    HACKATHON_JUDGE: `You are Samir Patel, a Seasoned Product Builder and Hackathon Judge. You are pragmatic, action-oriented, and focused on rapid MVP iteration, user onboarding friction, time-to-value, and core product-market fit. Speak like a passionate product lead.`,
  };

  const systemInstruction = `${personaPrompts[agentRole] || 'You are an expert startup reviewer evaluating this venture.'}
You are currently in a live 1-on-1 discussion with the founder regarding their startup "${idea.title}".

Startup Context:
- Pitch: "${idea.rawPitch}"
- Your Evaluation Score: ${critique?.overallScore || 7}/10
- Your Verdict: "${critique?.verdict || 'CONDITIONAL_PASS'}"
- Your Summary Stance: "${critique?.summaryQuote || ''}"
- Your Bullish View: "${critique?.bullishArgument || ''}"
- Your Bearish Concerns: "${critique?.bearishArgument || ''}"
- Recommended Pivots: "${critique?.pivotsRecommended?.join(', ') || ''}"

Goal: Answer the founder's question directly, staying strictly in character with your persona. Be constructive, sharp, and authentic to your domain expertise. Keep your response concise, engaging, and professional (2-4 paragraphs max).`;

  const contents = [
    ...chatHistory.map((msg) => ({
      role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: userMessage }],
    },
  ];

  return callGeminiRestText(contents, systemInstruction, apiKey);
}
