/**
 * Idea Plausibility & Reality Validation Engine (Gate 0)
 *
 * Prevents execution of analysis, decomposition, gaps, TOPSIS, and judge council
 * on gibberish, spam, or physically impossible concepts.
 */

import { IdeaValidationResult } from '../types/index.ts';
import { callGeminiRestJson } from './gemini.ts';

/**
 * Fast deterministic heuristics to immediately detect gibberish, spam,
 * or overt physics violations without waiting for an LLM round-trip.
 */
export function performFastHeuristicValidation(
  title: string,
  rawPitch: string
): IdeaValidationResult | null {
  const t = title.trim();
  const p = rawPitch.trim();
  const combined = `${t} ${p}`.toLowerCase();

  // 1. Length & character count check
  if (t.length < 2 || p.length < 5) {
    return {
      isValid: false,
      category: 'INSUFFICIENT_DETAIL',
      reason: 'The submitted pitch is too short. A valid venture idea requires a coherent problem and solution description.',
      suggestion: 'Provide at least 2-3 sentences explaining what problem you solve, who your customers are, and how your product works.',
    };
  }

  // 2. Gibberish / Keyboard Smash / Non-word Heuristic (e.g., "jgdtuxig", "sdfghjkl", "asdfasdf")
  // Check for common QWERTY row smash sequences
  const keyboardSmashPatterns = [
    /asdf/i, /sdfg/i, /dfgh/i, /fghj/i, /ghjk/i, /hjkl/i,
    /qwer/i, /wert/i, /erty/i, /rtyu/i, /tyui/i, /yuio/i, /uiop/i,
    /zxcv/i, /xcvb/i, /cvbn/i, /vbnm/i,
    /lkjh/i, /kjhg/i, /jhgf/i, /hgfd/i, /gfds/i, /fdsa/i,
    /poiuy/i, /oiuyt/i, /iuytr/i, /uytre/i, /ytrew/i, /trewq/i,
  ];

  for (const pattern of keyboardSmashPatterns) {
    if (pattern.test(combined)) {
      return {
        isValid: false,
        category: 'GIBBERISH',
        reason: 'Keyboard pattern smashing detected. GILLET CHECK requires a meaningful startup description.',
        suggestion: 'Please describe an actual product or service that addresses a real customer need.',
      };
    }
  }

  // Check individual words for unnatural initial consonant clusters (e.g., "jgdtuxig", "zkmp", "qwrx")
  const tokens = combined.split(/[^a-z0-9]+/i).filter((tok) => tok.length >= 4);
  const validThreeConsonantStarts = new Set([
    'str', 'spr', 'spl', 'scr', 'squ', 'chr', 'phr', 'thr', 'shr', 'sch', 'skr'
  ]);

  for (const token of tokens) {
    // Starts with 3+ consonants: check if valid English cluster
    const startConsonants = token.match(/^([bcdfghjklmnpqrstvwxyz]{3,})/i);
    if (startConsonants) {
      const cluster = startConsonants[1].toLowerCase();
      const threePrefix = cluster.slice(0, 3);
      if (!validThreeConsonantStarts.has(threePrefix)) {
        return {
          isValid: false,
          category: 'GIBBERISH',
          reason: `Unnatural word pattern or random character string detected ("${token}"). Real-world venture words required.`,
          suggestion: 'Please enter coherent words describing what your startup builds and who it serves.',
        };
      }
    }

    // Check for impossible consonant bigrams (e.g., 'jg', 'dt' at word start, 'xg', 'zx', 'qj', 'jx')
    if (/^(jg|gdt|zx|qw|qj|dx|tx|xg|zk|qg|pk|tk|fp)/i.test(token)) {
      return {
        isValid: false,
        category: 'GIBBERISH',
        reason: `Meaningless character sequence detected ("${token}"). GILLET CHECK only accepts legitimate venture concepts.`,
        suggestion: 'Describe your startup in plain language (e.g., "AI-powered scheduling platform for hospitals").',
      };
    }

    // Check for 5+ consecutive consonants anywhere in the token
    const longConsonants = token.match(/[bcdfghjklmnpqrstvwxyz]{5,}/i);
    if (longConsonants) {
      const allowedWords = new Set(['strengths', 'rhythms', 'twelfths', 'catchphrases']);
      if (!allowedWords.has(token.toLowerCase())) {
        return {
          isValid: false,
          category: 'GIBBERISH',
          reason: `Unnatural consonant cluster detected ("${token}"). Please enter real startup terminology.`,
          suggestion: 'Write clear sentences explaining your startup solution and market.',
        };
      }
    }
  }

  // Check for repeated character sequences (e.g. "aaaaaa", "hahahaha", "asdfasdf")
  if (/(.)\1{4,}/.test(combined) || /([a-z]{2,4})\1{3,}/.test(combined)) {
    return {
      isValid: false,
      category: 'GIBBERISH',
      reason: 'Repeated character spam or keyboard pattern detected. Please enter a genuine startup concept.',
      suggestion: 'Explain a specific business challenge you want to address with technology or services.',
    };
  }

  // Check for single word pitches with no substance
  const words = p.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 1 && words[0].length < 15) {
    return {
      isValid: false,
      category: 'INSUFFICIENT_DETAIL',
      reason: `"${words[0]}" is just a single word, not a startup pitch.`,
      suggestion: 'Try writing: "A [type of product] that helps [target customer] to [solve a specific problem]."',
    };
  }

  // 3. Known Physical Impossibility & Sci-Fi Fantasy Heuristic (English & Hinglish)
  const impossiblePatterns = [
    {
      // Earth rocket milky way / moving earth / dharti rocket milky way bahar
      regex: /(earth|planet|dharti|prithvi)\b.*(rocket|thrust|engine|push|fly|move|uda|bahar|nikal).*(\bmilky\s*way\b|\bgalaxy\b|\bsolar\s*system\b|\borbit\b|\bspace\b|\bbahar\b)/i,
      reason: 'Moving planet Earth using rockets violates fundamental astrophysics, gravitational binding energy, and orbital mechanics. This is an impossible science-fiction fantasy.',
      suggestion: 'Focus on viable commercial space tech, satellite data, or launch logistics (e.g., "CubeSat constellation for agricultural imaging").',
    },
    {
      // Rocket to push/move Earth out of Milky Way
      regex: /(rocket|thrust|engine|propulsion)\b.*(earth|planet|dharti|prithvi)\b.*(milky\s*way|galaxy|bahar|universe|solar\s*system|orbit)/i,
      reason: 'Attaching rockets to Earth to push it out of the Milky Way is physically impossible and violates cosmic energy conservation.',
      suggestion: 'Focus on viable aerospace engineering (e.g., "Reusable orbital upper-stage propellant depots").',
    },
    {
      regex: /(perpetual\s+motion|free\s+energy\s+machine|infinite\s+energy\s+generator|violat(e|ing)\s+thermodynamics)/i,
      reason: 'Perpetual motion and free energy devices violate the First and Second Laws of Thermodynamics and cannot exist in the physical universe.',
      suggestion: 'Focus on real-world energy technology (e.g., "Next-gen battery management systems" or "Industrial solar microgrid optimization").',
    },
    {
      regex: /(time\s+travel\s+machine|travel\s+back\s+in\s+time\s+to|visit\s+dinosaurs\s+machine)/i,
      reason: 'Macroscopic backward time travel violates the fundamental causality of physics.',
      suggestion: 'Focus on predictive machine learning, digital twins, or historical data simulation.',
    },
    {
      regex: /(human\s+teleportation\s+(app|phone)|teleport\s+humans\s+instantly\s+with\s+an\s+app)/i,
      reason: 'Human physical teleportation via consumer software violates fundamental quantum mechanics and biological preservation.',
      suggestion: 'Focus on remote collaboration, virtual reality presence, or rapid logistics routing.',
    },
  ];

  for (const imp of impossiblePatterns) {
    if (imp.regex.test(combined)) {
      return {
        isValid: false,
        category: 'PHYSICALLY_IMPOSSIBLE',
        reason: imp.reason,
        suggestion: imp.suggestion,
      };
    }
  }

  return null;
}

/**
 * Validates whether an idea is plausible, coherent, and physically possible
 * using Gemini AI Gatekeeper.
 */
export async function validateIdeaPlausibilityWithGemini(
  title: string,
  rawPitch: string,
  apiKey?: string
): Promise<IdeaValidationResult> {
  // 1. Run instant fast heuristic first
  const fastCheck = performFastHeuristicValidation(title, rawPitch);
  if (fastCheck) {
    return fastCheck;
  }

  // 2. Run Gemini Reality Gatekeeper
  const systemInstruction = `You are the Chief Reality & Feasibility Gatekeeper at GILLET CHECK (an elite venture validation platform).
Your sole job is to strictly protect the pipeline from:
1. GIBBERISH / MEANINGLESS TEXT: Keyboard smashing, nonsense character strings, word salad without logical syntax (e.g., 'jgdtuxig', 'kjsdklfjsd', 'test1234', 'qwertyuiop').
2. PHYSICALLY / SCIENTIFICALLY IMPOSSIBLE CONCEPTS: Ideas that explicitly violate known laws of physics, orbital mechanics, thermodynamics, human biology, or real-world reality (e.g., 'attach rockets to Earth to push it out of the Milky Way', 'perpetual motion free energy generator', 'app that teleports physical humans across continents', 'turn tap water into gold at home with a smartphone').
3. NON-STARTUP / INCOHERENT INPUTS: Random personal greetings ("hi", "hello how are you"), spam, diary ramblings, or random phrases that describe NO commercial product, service, software, hardware, biotech, or business venture.

IMPORTANT:
- Ambitious or high-risk technology IS ALLOWED (e.g. quantum computing, fusion reactors, reusable orbital rockets like SpaceX, humanoid robotics, CRISPR gene therapy, autonomous driving, flying eVTOL taxis).
- But pure sci-fi fantasies that violate physics (moving planets, time travel machines, magic), gibberish words, or non-business spam MUST BE REJECTED.

Return strictly JSON:
{
  "isValid": true | false,
  "category": "VALID" | "GIBBERISH" | "PHYSICALLY_IMPOSSIBLE" | "NON_STARTUP" | "INSUFFICIENT_DETAIL",
  "reason": "1-2 concise sentences in plain, polite language explaining why this concept was rejected (or why it was approved). Be specific to what the user wrote.",
  "suggestion": "1 constructive sentence explaining what a valid real-world startup pitch should look like"
}`;

  const prompt = `Validate whether this startup idea is coherent, physically possible, and represents a real-world venture:
Title: "${title}"
Pitch: "${rawPitch}"`;

  try {
    const result = await callGeminiRestJson<IdeaValidationResult>(
      prompt,
      systemInstruction,
      apiKey
    );

    if (typeof result.isValid === 'boolean') {
      return {
        isValid: result.isValid,
        category: result.category || (result.isValid ? 'VALID' : 'GIBBERISH'),
        reason: result.reason || (result.isValid ? 'Idea is coherent and feasible.' : 'Input does not describe a valid venture.'),
        suggestion: result.suggestion || 'Please provide a clear description of the product, target customer, and problem solved.',
      };
    }

    return {
      isValid: true,
      category: 'VALID',
      reason: 'Passed pre-flight validation.',
      suggestion: '',
    };
  } catch (err: any) {
    // If Gemini quota is exceeded, rethrow so user can supply their API key
    if (
      err?.code === 'QUOTA_EXCEEDED' ||
      err?.name === 'QuotaExceededError' ||
      String(err?.message || '').includes('quota') ||
      String(err?.message || '').includes('429') ||
      String(err?.message || '').includes('RESOURCE_EXHAUSTED')
    ) {
      throw err;
    }

    // On unexpected parse error, fall back to fast check
    console.error('Validation gate error:', err);
    return {
      isValid: true,
      category: 'VALID',
      reason: 'Fast heuristic passed.',
      suggestion: '',
    };
  }
}
