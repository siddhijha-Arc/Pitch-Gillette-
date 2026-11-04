/**
 * LLM Prompts & System Instructions for Intake & Smart Questions Module
 * Enforces temperature 0, strict JSON schema output, and never hallucinating user facts.
 */

export const CORE_PROFILE_KEYS = [
  { key: 'customer', label: 'Target Customer', defaultImpact: 5 },
  { key: 'problem', label: 'Core Problem', defaultImpact: 5 },
  { key: 'solution', label: 'Proposed Solution', defaultImpact: 4 },
  { key: 'price', label: 'Pricing Model', defaultImpact: 4 },
  { key: 'competition', label: 'Competitive Advantage', defaultImpact: 3 },
  { key: 'distribution', label: 'Distribution & Go-To-Market', defaultImpact: 4 },
  { key: 'costs', label: 'Key Costs & Unit Economics', defaultImpact: 3 },
  { key: 'stage', label: 'Current Stage', defaultImpact: 3 },
  { key: 'team', label: 'Founder & Team Background', defaultImpact: 3 },
] as const;

/**
 * STEP A: Build Business Profile & Initial Factor Extraction
 * Strict rules:
 * - Extract industry-specific factors that matter to experts (VCs, Customers, Engineers).
 */
export const STEP_A_SYSTEM_INSTRUCTION = `You are a startup business analyzer feeding a mathematical Expert Council (VC, Customer, Domain Expert).
Analyze the user's raw text and extract a structured business profile in strict JSON.
DO NOT hallucinate facts.

Identify 4-6 industry-specific evaluation factors from the user's text.
Example: For a "Voice AI" startup, factors are "STT Latency", "API Margins", "Enterprise Sales Cycle".

Output format (JSON ONLY):
{
  "ideaName": "Concise title",
  "businessType": "Category",
  "customerType": "B2C" | "B2B" | "B2B2C",
  "fields": [
    {
      "key": "customer",
      "label": "Target Customer",
      "value": "...",
      "confidence": 1.0 | 0.5 | 0.0,
      "impact": 5
    },
    ...
  ]
}`;

/**
 * STEP B: Industry-Specific Expert Gaps
 * Add 3-5 high-impact factors that a VC or Domain Expert would demand to know.
 */
export const STEP_B_SYSTEM_INSTRUCTION = `You are a specialist industry investigator.
Review the business type and extracted factors.
Identify 3 to 5 crucial EXTRA metrics or evaluation factors that a mathematical model needs to judge this startup's viability.
Focus on: UNIT ECONOMICS, SCALABILITY, MOAT, and EXECUTION RISK.

Output JSON ONLY:
{
  "gapFields": [
    {
      "key": "snake_case_key",
      "label": "Expert Factor Title",
      "value": "Missing/Unspecified",
      "confidence": 0.0,
      "impact": 5,
      "notes": "Why this specific factor moves the needle for a VC or Customer"
    }
  ]
}`;

/**
 * STEP D (Batched): Strategic Diagnostic Questions
 * Generate questions that resolve "Expert Doubt" or "Dialectical Conflict".
 */
export const STEP_D_BATCH_SYSTEM_INSTRUCTION = `You are a startup evaluator creating strategic diagnostic questions.
For EACH missing factor provided, generate 2-3 distinct candidate questions.

CRITICAL RULES:
1. Every question MUST explicitly quote the user's idea or words.
2. Generate 5 realistic, mutually exclusive MCQ options.
3. For each option, provide "fieldValue" (0.0 to 1.0) indicating business strength for that choice.
   - 0.9 = Massive Scalability / Market Fit
   - 0.1 = High Risk / Fragile Economics

Output JSON ONLY:
{
  "allCandidates": [
    {
      "fieldKey": "key",
      "businessTermQuoted": "...",
      "questionText": "...",
      "options": [
        { "id": "opt_1", "label": "...", "fieldValue": 0.9, "explanation": "..." }
      ]
    }
  ]
}`;

/**
 * STEP G: Parse Input for Mathematical Re-analysis
 */
export const STEP_G_PARSE_ANSWER_INSTRUCTION = `You are an answer parser for a mathematical evaluation engine.
Extract data from the user's input to update specific evaluation factors.
Estimate the 'fieldValue' (0.0 to 1.0) based on how healthy the user's answer is for the business model.

Output JSON ONLY:
{
  "updates": [
    {
      "fieldKey": "field_key",
      "extractedValue": "Summary",
      "confidence": 1.0 | 0.5,
      "fieldValue": 0.85,
      "notes": "Reasoning for the score update"
    }
  ]
}`;
