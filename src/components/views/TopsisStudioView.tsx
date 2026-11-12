/**
 * GILLET CHECK - Find Your Best Solution
 * Redesigned for Non-Technical Startup Founders
 *
 * Preserves the deterministic TOPSIS algorithm under the hood while providing
 * an intuitive, founder-friendly decision assistant interface.
 */

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Coins,
  Zap,
  TrendingUp,
  Wrench,
  Target,
  X,
  Info,
  Scale,
  Table2,
  Calculator,
  Lightbulb,
} from 'lucide-react';
import { SolutionCandidate, StartupIdea, TopsisCriteriaWeights } from '../../types/index.ts';
import { calculateTopsis, CRITERIA_DEFINITIONS } from '../../server/algorithms/topsis.ts';

interface TopsisStudioViewProps {
  idea: StartupIdea;
  onGenerateSolutions: () => void;
  onUpdateWeights: (weights: TopsisCriteriaWeights) => void;
  isLoading: boolean;
}

// Friendly questions mapping directly to the 5 TOPSIS criteria
interface PriorityQuestion {
  key: keyof TopsisCriteriaWeights;
  question: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  lowLabel: string;
  highLabel: string;
}

const PRIORITY_QUESTIONS: PriorityQuestion[] = [
  {
    key: 'costEfficiency',
    question: 'How important is low cost?',
    subtext: 'Preserve cash and avoid expensive infrastructure or high burn',
    icon: Coins,
    lowLabel: 'Can spend more',
    highLabel: 'Must be low cost',
  },
  {
    key: 'speedToImplement',
    question: 'How quickly do you need to launch?',
    subtext: 'Get an MVP in front of real users in days rather than months',
    icon: Zap,
    lowLabel: 'Can take time',
    highLabel: 'Needs to be fast',
  },
  {
    key: 'scalability',
    question: 'How important is scalability?',
    subtext: 'Handle user growth smoothly without proportional costs',
    icon: TrendingUp,
    lowLabel: 'Manual at first is ok',
    highLabel: 'Must scale automatically',
  },
  {
    key: 'feasibility',
    question: 'How important is technical simplicity?',
    subtext: 'Build with proven off-the-shelf tools instead of risky novel tech',
    icon: Wrench,
    lowLabel: 'Can build complex tech',
    highLabel: 'Must be simple to build',
  },
  {
    key: 'marketImpact',
    question: 'How important is market impact?',
    subtext: 'Create a 10x breakthrough product that changes customer behavior',
    icon: Target,
    lowLabel: 'Incremental improvement ok',
    highLabel: 'Must be a 10x breakthrough',
  },
];

// Founder-friendly presets that map to valid criteria weights
const PRESETS = [
  {
    id: 'LEAN',
    label: 'Bootstrapped / Low Cost',
    description: 'Prioritizes low capital cost and technical simplicity',
    weights: {
      feasibility: 0.25,
      costEfficiency: 0.4,
      marketImpact: 0.15,
      scalability: 0.1,
      speedToImplement: 0.1,
    },
  },
  {
    id: 'SPEED',
    label: 'Fast MVP Launch',
    description: 'Prioritizes launching in days to validate customer demand',
    weights: {
      feasibility: 0.25,
      costEfficiency: 0.15,
      marketImpact: 0.15,
      scalability: 0.1,
      speedToImplement: 0.35,
    },
  },
  {
    id: 'GROWTH',
    label: 'VC Hypergrowth',
    description: 'Prioritizes maximum market differentiation and scalability',
    weights: {
      feasibility: 0.15,
      costEfficiency: 0.1,
      marketImpact: 0.4,
      scalability: 0.25,
      speedToImplement: 0.1,
    },
  },
  {
    id: 'EQUAL',
    label: 'Balanced Strategy',
    description: 'Weighs all 5 dimensions equally (20% each)',
    weights: {
      feasibility: 0.2,
      costEfficiency: 0.2,
      marketImpact: 0.2,
      scalability: 0.2,
      speedToImplement: 0.2,
    },
  },
];

export const TopsisStudioView: React.FC<TopsisStudioViewProps> = ({
  idea,
  onGenerateSolutions,
  onUpdateWeights,
  isLoading,
}) => {
  const [showAdvancedMath, setShowAdvancedMath] = useState<boolean>(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Manage criteria weights locally for instant interactive recalculation
  const [localWeights, setLocalWeights] = useState<TopsisCriteriaWeights>(
    idea.topsisWeights || {
      feasibility: 0.25,
      costEfficiency: 0.2,
      marketImpact: 0.25,
      scalability: 0.15,
      speedToImplement: 0.15,
    }
  );

  // Execute pure deterministic TOPSIS calculation locally for real-time slider feedback
  const liveTopsis = useMemo(() => {
    return calculateTopsis(idea.solutions || [], localWeights);
  }, [idea.solutions, localWeights]);

  const solutions = liveTopsis.rankedSolutions;
  const bestSolution = solutions.length > 0 ? solutions[0] : null;
  const alternativeSolutions = solutions.length > 1 ? solutions.slice(1) : [];

  const activeSolution = useMemo(() => {
    return solutions.find((s) => s.id === selectedSolutionId) || bestSolution;
  }, [solutions, selectedSolutionId, bestSolution]);

  // Total raw weight for percentage normalization
  const totalRawWeight = useMemo(() => {
    return (
      (Number(localWeights.feasibility) || 0.2) +
      (Number(localWeights.costEfficiency) || 0.2) +
      (Number(localWeights.marketImpact) || 0.2) +
      (Number(localWeights.scalability) || 0.2) +
      (Number(localWeights.speedToImplement) || 0.2)
    ) || 1;
  }, [localWeights]);

  const handleWeightSliderChange = (key: keyof TopsisCriteriaWeights, value: number) => {
    const updated = { ...localWeights, [key]: value };
    setLocalWeights(updated);
    onUpdateWeights(updated);
  };

  const handleApplyPreset = (weights: TopsisCriteriaWeights) => {
    setLocalWeights(weights);
    onUpdateWeights(weights);
  };

  const handleOpenDetail = (sol: SolutionCandidate) => {
    setSelectedSolutionId(sol.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDrawerOpen(false);
  };

  // Helper to extract top advantages based on criteria scores
  const getSolutionAdvantages = (sol: SolutionCandidate): string[] => {
    const list: Array<{ label: string; score: number }> = [
      { label: 'Low Capital Cost', score: sol.criteriaScores?.costEfficiency ?? 5 },
      { label: 'Rapid Time-to-Market', score: sol.criteriaScores?.speedToImplement ?? 5 },
      { label: 'High Scalability', score: sol.criteriaScores?.scalability ?? 5 },
      { label: 'Technical Simplicity', score: sol.criteriaScores?.feasibility ?? 5 },
      { label: 'High Market Impact', score: sol.criteriaScores?.marketImpact ?? 5 },
    ];
    return list
      .filter((c) => c.score >= 6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((c) => `${c.label} (${c.score}/10)`);
  };

  // Helper to explain why this solution was recommended
  const getWhyRecommended = (sol: SolutionCandidate, isTop: boolean): string => {
    if (isTop) {
      // Find the founder's top-weighted priority
      const entries = Object.entries(localWeights) as Array<[keyof TopsisCriteriaWeights, number]>;
      const topPriority = entries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'marketImpact';

      const priorityMap: Record<keyof TopsisCriteriaWeights, string> = {
        costEfficiency: 'low capital cost and efficient budget allocation',
        speedToImplement: 'launching quickly to test early user demand',
        scalability: 'expanding capacity smoothly without ballooning headcount',
        feasibility: 'using battle-tested tools to minimize technical risk',
        marketImpact: 'delivering a clear, 10x breakthrough customer experience',
      };

      return `Ranked #1 because it best matches your priority on ${priorityMap[topPriority]}. It achieves an optimal balance between low execution friction and real customer impact.`;
    }

    if (sol.strategySummary) {
      return sol.strategySummary.length > 150
        ? `${sol.strategySummary.slice(0, 150)}...`
        : sol.strategySummary;
    }

    return `Provides an alternative approach targeting ${sol.problemTitle} with a distinct set of operational trade-offs.`;
  };

  // Helper for practical next action
  const getSuggestedAction = (sol: SolutionCandidate, isTop: boolean): string => {
    if (isTop) {
      if ((sol.criteriaScores?.speedToImplement ?? 5) >= 8) {
        return 'Build a 3-day prototype focusing on the core user flow, and test it with 5 target customers before writing backend code.';
      }
      if ((sol.criteriaScores?.costEfficiency ?? 5) >= 8) {
        return 'Validate core assumptions using free-tier tools or existing APIs to keep initial expenses near zero.';
      }
      if ((sol.criteriaScores?.marketImpact ?? 5) >= 8) {
        return 'Interview 5 target customers specifically about willingness to pay for this approach.';
      }
      return 'Draft a 1-page spec of the MVP feature set and run a customer validation pilot this week.';
    }

    if ((sol.criteriaScores?.feasibility ?? 5) >= 8) {
      return 'Assemble a proof-of-concept using off-the-shelf APIs before committing custom development.';
    }
    return 'Review whether the trade-offs align with your current runway and team strengths.';
  };

  return (
    <div className="relative space-y-8 w-full mx-auto py-2 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1f1f47] tracking-tight">
            Find Your Best Solution
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1.5 leading-relaxed">
            Compare different ways to solve your startup's biggest challenges.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAdvancedMath(!showAdvancedMath)}
            className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
              showAdvancedMath
                ? 'bg-[#1f1f47] text-white border-[#1f1f47] shadow-xs'
                : 'bg-white text-[#1f1f47] border-[#eaedf6] hover:bg-[#f8f9fd]'
            }`}
          >
            <Calculator className="h-4 w-4 text-[#576cdb]" />
            <span>{showAdvancedMath ? 'Hide Advanced Analysis' : 'Advanced Analysis'}</span>
          </button>

          <button
            onClick={onGenerateSolutions}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white text-xs sm:text-sm font-semibold shadow-[0_2px_12px_rgba(87,108,219,0.25)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Evaluating Options...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Re-evaluate Solutions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Priority Selection Console (Founder-Friendly Questions) */}
      <div className="bg-white rounded-3xl border border-[#eaedf6] p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#eaedf6] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#576cdb]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1f1f47]">
                What Matters Most to Your Startup Right Now?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748b]">
              Adjust your priorities below. Solutions re-rank automatically based on how well they fit your specific goals.
            </p>
          </div>

          {/* Quick Strategy Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[#8a94a6] mr-1">Presets:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.weights)}
                className="px-3.5 py-1.5 rounded-full bg-[#f8f9fd] hover:bg-[#e0e7ff] text-[#1f1f47] hover:text-[#4338ca] text-xs font-semibold border border-[#eaedf6] transition-all cursor-pointer"
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Priority Question Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRIORITY_QUESTIONS.map((q) => {
            const rawVal = Number(localWeights[q.key]) || 0.2;
            const normalizedPercent = Math.round((rawVal / totalRawWeight) * 100);
            const Icon = q.icon;

            // Descriptive priority label
            const priorityLevel =
              normalizedPercent >= 30
                ? 'Critical'
                : normalizedPercent >= 22
                ? 'High'
                : normalizedPercent >= 15
                ? 'Moderate'
                : 'Low';

            return (
              <div
                key={q.key}
                className="p-4 sm:p-5 rounded-2xl bg-[#f8f9fd] border border-[#eaedf6] hover:border-[#cbd5e1] transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white border border-[#eaedf6] text-[#576cdb] shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[#1f1f47] leading-snug">
                        {q.question}
                      </h3>
                      <p className="text-[11px] text-[#64748b] leading-tight line-clamp-1 mt-0.5">
                        {q.subtext}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      priorityLevel === 'Critical'
                        ? 'bg-[#ffe4e6] text-[#e11d48]'
                        : priorityLevel === 'High'
                        ? 'bg-[#e0e7ff] text-[#4338ca]'
                        : 'bg-white text-[#64748b] border border-[#eaedf6]'
                    }`}
                  >
                    {priorityLevel} ({normalizedPercent}%)
                  </span>
                </div>

                {/* Slider Input */}
                <div className="space-y-1.5 pt-1">
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.02"
                    value={rawVal}
                    onChange={(e) =>
                      handleWeightSliderChange(q.key, parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-[#eaedf6] rounded-lg appearance-none cursor-pointer accent-[#576cdb]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8a94a6] font-medium">
                    <span>{q.lowLabel}</span>
                    <span>{q.highLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {(!solutions || solutions.length === 0) && (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-[#eaedf6] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#f1f4fb] flex items-center justify-center mx-auto text-[#576cdb]">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#1f1f47]">No Strategic Solutions Yet</h3>
            <p className="text-sm text-[#64748b] max-w-md mx-auto">
              Click below to let GILLET CHECK evaluate your root causes and formulate distinct, ranked ways to solve them.
            </p>
          </div>
          <button
            onClick={onGenerateSolutions}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Solutions</span>
          </button>
        </div>
      )}

      {/* 3. Prominent "Recommended for Your Startup" Hero Card (#1 Option) */}
      {bestSolution && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#d97706]" />
            <h2 className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider">
              Top Recommendation for Your Startup
            </h2>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-[#fcfdff] to-[#f6f8ff] border-2 border-[#576cdb] shadow-[0_8px_30px_rgba(87,108,219,0.12)] space-y-6 relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#576cdb] via-[#818cf8] to-[#38bdf8]" />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3.5 py-1 rounded-full bg-[#576cdb] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Trophy className="h-3.5 w-3.5 text-[#fbbf24]" />
                    <span>Rank #1 • Best Match</span>
                  </span>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                    Solves: {bestSolution.problemTitle || 'Primary Root Cause'}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#1f1f47] tracking-tight leading-snug">
                  {bestSolution.title}
                </h3>

                <p className="text-sm sm:text-base text-[#475569] leading-relaxed pt-1">
                  {getWhyRecommended(bestSolution, true)}
                </p>
              </div>

              {/* Match Score Display */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#d6dbf5] shadow-xs text-center shrink-0 min-w-[200px] space-y-1.5">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
                  Priority Match Score
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#576cdb] tracking-tight">
                  {Math.round(bestSolution.topsisScore * 100)}%
                </div>
                <div className="w-full bg-[#eaedf6] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#576cdb] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(bestSolution.topsisScore * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#8a94a6] block leading-tight pt-0.5">
                  Alignment with your 5 custom priorities
                </span>
              </div>
            </div>

            {/* Grid of Key Advantages & Trade-Offs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Advantages */}
              <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-[#eaedf6] space-y-2">
                <span className="text-xs font-bold text-[#1f1f47] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                  <span>Main Advantages</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {getSolutionAdvantages(bestSolution).map((adv, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#eaedf6] text-xs font-semibold text-[#1f1f47]"
                    >
                      {adv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trade-off Warning */}
              <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] space-y-1.5">
                <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-[#d97706]" />
                  <span>Trade-off to Keep in Mind</span>
                </span>
                <p className="text-xs sm:text-sm text-[#78350f] leading-relaxed">
                  {bestSolution.tradeoffs ||
                    'Requires focused execution and discipline to prevent feature creep during initial rollout.'}
                </p>
              </div>
            </div>

            {/* Practical Next Action Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Suggested Next Action for You</span>
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1e40af] leading-relaxed">
                  {getSuggestedAction(bestSolution, true)}
                </p>
              </div>

              <button
                onClick={() => handleOpenDetail(bestSolution)}
                className="px-5 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Inspect Solution</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Alternative Ranked Solutions Cards */}
      {alternativeSolutions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider">
              Alternative Solutions Ranked by Match ({alternativeSolutions.length})
            </h2>
            <span className="text-xs text-[#64748b]">
              Ranked from closest to furthest match against your goals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {alternativeSolutions.map((sol) => {
              const matchPct = Math.round(sol.topsisScore * 100);
              const advantages = getSolutionAdvantages(sol);

              return (
                <div
                  key={sol.id}
                  onClick={() => handleOpenDetail(sol)}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#eaedf6] hover:border-[#cbd5e1] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header: Rank & Match Score */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#f1f3f9] pb-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f8f9fd] text-[#1f1f47] border border-[#eaedf6] font-mono">
                        Rank #{sol.topsisRank}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#576cdb]">
                        <span>{matchPct}% Match</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#8a94a6] block truncate">
                        Solves: {sol.problemTitle || 'Target Problem'}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-[#1f1f47] group-hover:text-[#576cdb] transition-colors leading-snug">
                        {sol.title}
                      </h4>
                    </div>

                    {/* Why recommended */}
                    <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
                      {getWhyRecommended(sol, false)}
                    </p>

                    {/* Key Advantages */}
                    {advantages.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {advantages.slice(0, 2).map((adv, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f1f4fb] text-[#475569]"
                          >
                            {adv}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Trade-off Note */}
                    {sol.tradeoffs && (
                      <div className="p-2.5 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-[11px] text-[#92400e] leading-snug">
                        <span className="font-bold">Trade-off: </span>
                        <span className="line-clamp-2">{sol.tradeoffs}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Action */}
                  <div className="pt-3 border-t border-[#f1f3f9] flex items-center justify-between text-xs text-[#576cdb] font-bold">
                    <span>Inspect Details</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Collapsible Advanced Analysis (TOPSIS Decision Matrix) */}
      {showAdvancedMath && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#eaedf6] space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedf6] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Table2 className="h-5 w-5 text-[#576cdb]" />
                <h3 className="text-base font-bold text-[#1f1f47]">
                  Advanced Decision Analysis (TOPSIS Engine)
                </h3>
              </div>
              <p className="text-xs text-[#64748b]">
                Underlying mathematical calculations: Euclidean distance to Ideal Best (A+) and Ideal Worst (A-).
              </p>
            </div>

            <div className="text-xs font-mono text-[#576cdb] bg-[#f8f9fd] px-3 py-1.5 rounded-xl border border-[#eaedf6]">
              C_i* = S_i- / (S_i+ + S_i-)
            </div>
          </div>

          {/* Criteria Normalized Weights Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider font-mono">
              Normalized Criteria Weights (Sum = 1.0)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {CRITERIA_DEFINITIONS.map((crit) => {
                const raw = Number(localWeights[crit.key as keyof TopsisCriteriaWeights]) || 0.2;
                const normWeight = (raw / totalRawWeight).toFixed(3);
                return (
                  <div
                    key={crit.key}
                    className="p-3 rounded-xl bg-[#f8f9fd] border border-[#eaedf6] text-center"
                  >
                    <span className="text-[11px] text-[#64748b] block truncate font-medium">
                      {crit.name}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#1f1f47]">
                      {normWeight}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Normalized Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#eaedf6] text-[#64748b] font-mono text-[11px]">
                  <th className="py-2.5 px-3">Solution</th>
                  <th className="py-2.5 px-2 text-right">Feasibility (r1)</th>
                  <th className="py-2.5 px-2 text-right">Cost Eff (r2)</th>
                  <th className="py-2.5 px-2 text-right">Impact (r3)</th>
                  <th className="py-2.5 px-2 text-right">Scalability (r4)</th>
                  <th className="py-2.5 px-2 text-right">Speed (r5)</th>
                  <th className="py-2.5 px-2 text-right text-[#e11d48]">Dist Best (S+)</th>
                  <th className="py-2.5 px-2 text-right text-[#059669]">Dist Worst (S-)</th>
                  <th className="py-2.5 px-3 text-right text-[#1f1f47] font-bold">Relative Closeness (C*)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f3f9] font-mono">
                {solutions.map((sol) => (
                  <tr key={sol.id} className="hover:bg-[#f8f9fd]">
                    <td className="py-3 px-3 font-sans font-semibold text-[#1f1f47] max-w-[200px] truncate">
                      #{sol.topsisRank} {sol.title}
                    </td>
                    <td className="py-3 px-2 text-right">{sol.criteriaScores?.feasibility ?? '-'}/10</td>
                    <td className="py-3 px-2 text-right">{sol.criteriaScores?.costEfficiency ?? '-'}/10</td>
                    <td className="py-3 px-2 text-right">{sol.criteriaScores?.marketImpact ?? '-'}/10</td>
                    <td className="py-3 px-2 text-right">{sol.criteriaScores?.scalability ?? '-'}/10</td>
                    <td className="py-3 px-2 text-right">{sol.criteriaScores?.speedToImplement ?? '-'}/10</td>
                    <td className="py-3 px-2 text-right text-[#e11d48]">
                      {sol.distanceToIdealBest !== undefined ? sol.distanceToIdealBest.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-2 text-right text-[#059669]">
                      {sol.distanceToIdealWorst !== undefined ? sol.distanceToIdealWorst.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#1f1f47]">
                      {sol.topsisScore.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Slide-Over Detail Modal / Drawer */}
      {isDrawerOpen && activeSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={handleCloseDetail} />

          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#eaedf6] shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header: Rank & Close */}
            <div className="flex items-center justify-between border-b border-[#eaedf6] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#576cdb] text-white">
                  Rank #{activeSolution.topsisRank} Option
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                  {Math.round(activeSolution.topsisScore * 100)}% Priority Match
                </span>
              </div>

              <button
                onClick={handleCloseDetail}
                className="w-8 h-8 rounded-full border border-[#eaedf6] hover:bg-[#f8f9fd] flex items-center justify-center text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title & Target Problem */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#8a94a6] block">
                Target Problem: {activeSolution.problemTitle || 'Identified Friction'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1f1f47] leading-tight tracking-tight">
                {activeSolution.title}
              </h2>
            </div>

            {/* Why This Matches Your Priorities */}
            <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-[#eaedf6] space-y-1.5">
              <span className="text-xs font-bold text-[#576cdb] uppercase tracking-wider block">
                Why This Matches Your Priorities
              </span>
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                {getWhyRecommended(activeSolution, activeSolution.topsisRank === 1)}
              </p>
            </div>

            {/* Strategic Implementation Details */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block">
                How It Works in Practice
              </span>
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                {activeSolution.strategySummary ||
                  'Combines proven architecture patterns with minimal operational dependencies to test demand.'}
              </p>
            </div>

            {/* Criteria Breakdown Grid */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block">
                Evaluation Across 5 Dimensions
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CRITERIA_DEFINITIONS.map((crit) => {
                  const score = activeSolution.criteriaScores?.[crit.key] ?? 5;
                  return (
                    <div
                      key={crit.key}
                      className="p-3 rounded-xl bg-[#f8f9fd] border border-[#eaedf6] space-y-1"
                    >
                      <span className="text-[11px] text-[#64748b] font-medium block truncate">
                        {crit.name}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-[#1f1f47]">{score}/10</span>
                        <div className="w-12 h-1.5 bg-[#eaedf6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#576cdb] rounded-full"
                            style={{ width: `${score * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade-offs */}
            {activeSolution.tradeoffs && (
              <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] space-y-1">
                <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider block">
                  Accepted Trade-off / Risk
                </span>
                <p className="text-xs sm:text-sm text-[#78350f] leading-relaxed">
                  {activeSolution.tradeoffs}
                </p>
              </div>
            )}

            {/* Next Action */}
            <div className="p-4 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] space-y-1">
              <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider block">
                Recommended Next Step
              </span>
              <p className="text-xs sm:text-sm text-[#1e40af] font-semibold leading-relaxed">
                {getSuggestedAction(activeSolution, activeSolution.topsisRank === 1)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
