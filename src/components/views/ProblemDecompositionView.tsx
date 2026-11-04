/**
 * Problem Decomposition & Causal Graph View
 * Card header and title typography exactly matching user uploaded screenshot.
 */

import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  TrendingDown,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ProblemNode, StartupIdea } from '../../types/index.ts';

interface ProblemDecompositionViewProps {
  idea: StartupIdea;
  onDecompose: () => void;
  isLoading: boolean;
}

export const ProblemDecompositionView: React.FC<ProblemDecompositionViewProps> = ({
  idea,
  onDecompose,
  isLoading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const problems = idea.problems || [];
  const rootCauses = problems.filter((p) => p.isRootCause);
  const symptoms = problems.filter((p) => p.isSymptom);

  const filteredProblems =
    selectedCategory === 'ALL'
      ? problems
      : problems.filter((p) => p.category === selectedCategory);

  const activeProblem = problems.find((p) => p.id === selectedProblemId) || filteredProblems[0] || null;

  const getClaimBadge = (type: string) => {
    switch (type) {
      case 'VERIFIED_FACT':
        return {
          label: 'Verified Fact',
          color: 'bg-[#c1f6e0] text-[#1f1f47]',
          icon: CheckCircle2,
        };
      case 'FOUNDER_ASSUMPTION':
        return {
          label: 'Assumption',
          color: 'bg-[#f7d4d4] text-[#f25a5a]',
          icon: HelpCircle,
        };
      default:
        return {
          label: 'AI Hypothesis',
          color: 'bg-[#d6dbf5] text-[#576cdb]',
          icon: Sparkles,
        };
    }
  };

  const handleCardClick = (prob: ProblemNode) => {
    setSelectedProblemId(prob.id);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="relative space-y-6 max-w-[1200px] mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-4">
        <div>
          <h1 className="text-3xl font-light text-[#1f1f47] tracking-tight font-sans">
            Problem Decomposition & Causal DAG
          </h1>
          <p className="text-xs text-[#6c7693] mt-1 font-normal leading-relaxed">
            Directed Acyclic Graph separating foundational root causes from observable downstream symptoms.
          </p>
        </div>

        <button
          onClick={onDecompose}
          disabled={isLoading}
          className="px-4 py-2 rounded-full bg-white hover:bg-[#f9f9fb] border border-[#eaedf6] text-xs font-semibold text-[#1f1f47] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 shrink-0 font-sans"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#576cdb]" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-[#576cdb]" />
              <span>Re-analyze Graph</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.06)_0px_2px_8px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1f1f47] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Layers className="h-4 w-4 text-[#576cdb]" />
              Root Bottlenecks ({rootCauses.length})
            </span>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#d6dbf5] text-[#1f1f47]">
              Origin Causes
            </span>
          </div>
          <div className="pt-2 flex flex-wrap gap-1.5">
            {rootCauses.map((r) => (
              <span key={r.id} className="text-xs px-3 py-1 rounded-full bg-[#f9f9fb] border border-[#eaedf6] text-[#1f1f47] font-medium font-sans">
                {r.title}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.06)_0px_2px_8px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1f1f47] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <TrendingDown className="h-4 w-4 text-[#f25a5a]" />
              Observable Symptoms ({symptoms.length})
            </span>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#f7d4d4] text-[#f25a5a]">
              Downstream Effects
            </span>
          </div>
          <div className="pt-2 flex flex-wrap gap-1.5">
            {symptoms.map((s) => (
              <span key={s.id} className="text-xs px-3 py-1 rounded-full bg-[#f9f9fb] border border-[#eaedf6] text-[#3d3d5c] font-medium font-sans">
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-[#6c7693] font-medium mr-1 font-mono">Category:</span>
        {['ALL', 'TECH', 'MARKET', 'FINANCIAL', 'OPERATIONAL', 'REGULATORY', 'COMPETITIVE'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors font-sans ${
              selectedCategory === cat
                ? 'bg-[#1f1f47] text-white'
                : 'bg-white hover:bg-[#f9f9fb] border border-[#eaedf6] text-[#6c7693]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Problem Cards Grid (Matching exact screenshot header & title layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProblems.map((problem) => {
          const isRoot = problem.isRootCause;
          const isSelected = isDrawerOpen && activeProblem?.id === problem.id;

          return (
            <div
              key={problem.id}
              onClick={() => handleCardClick(problem)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 space-y-3 relative ${
                isSelected
                  ? 'bg-[#d6dbf5]/20 border-2 border-[#576cdb] shadow-[0_4px_16px_rgba(87,108,219,0.15)] ring-2 ring-[#576cdb]/20'
                  : 'bg-white border border-[#eaedf6] hover:border-[#d1d6e1] hover:shadow-sm'
              }`}
            >
              {/* Screenshot Header Row: Pill Badge on Left + Severity & Category on Right */}
              <div className="flex items-center justify-between gap-2 border-b border-[#f1f3f9] pb-3">
                <span
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full font-mono ${
                    isRoot
                      ? 'bg-[#d6dbf5] text-[#1f1f47]'
                      : 'bg-[#f7d4d4] text-[#f25a5a]'
                  }`}
                >
                  {isRoot ? 'Root Cause' : 'Symptom'}
                </span>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[#84849a]">
                    Severity: <strong className="text-[#1f1f47] font-bold">{problem.severity}/10</strong>
                  </span>
                  <span className="text-[#84849a]">
                    Category: <strong className="text-[#1f1f47] font-semibold uppercase">{problem.category}</strong>
                  </span>
                </div>
              </div>

              {/* Exact Screenshot Title Typography: Medium weight, deep indigo, -0.02em tracking */}
              <h3 className="text-[17px] sm:text-lg font-medium text-[#1f1f47] leading-snug tracking-[-0.02em] font-sans pt-1">
                {problem.title}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Slide-over Side Drawer Overlay */}
      {isDrawerOpen && activeProblem && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#171a1c]/30 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
            onClick={closeDrawer}
          />

          {/* Slide-in Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-[#eaedf6] shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
              <div className="space-y-6">
                {/* Header Close Button */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={closeDrawer}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#6c7693] hover:text-[#1f1f47] transition-colors font-sans"
                  >
                    <span>Close</span>
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full font-mono ${
                      activeProblem.isRootCause
                        ? 'bg-[#d6dbf5] text-[#1f1f47]'
                        : 'bg-[#f7d4d4] text-[#f25a5a]'
                    }`}
                  >
                    {activeProblem.isRootCause ? 'Root Cause' : 'Downstream Symptom'}
                  </span>

                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-md bg-[#e3e6e8] text-[#3d3d5c] uppercase">
                    {activeProblem.category}
                  </span>

                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#f9f9fb] border border-[#eaedf6] text-[#1f1f47]">
                    Severity: {activeProblem.severity}/10
                  </span>
                </div>

                {/* Problem Title */}
                <h2 className="text-xl sm:text-2xl font-medium text-[#1f1f47] leading-tight tracking-[-0.025em] font-sans">
                  {activeProblem.title}
                </h2>

                {/* Description Box */}
                <div className="p-4 bg-[#f9f9fb] rounded-2xl border border-[#eaedf6] space-y-2">
                  <span className="text-xs font-bold text-[#1f1f47] uppercase tracking-wider font-mono block">
                    Problem Mechanics
                  </span>
                  <p className="text-xs sm:text-sm text-[#3d3d5c] leading-relaxed font-normal font-sans">
                    {activeProblem.description}
                  </p>
                </div>

                {/* Assumptions List */}
                {activeProblem.assumptions && activeProblem.assumptions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-[#1f1f47] uppercase tracking-wider font-mono block">
                      Underlying Assumptions ({activeProblem.assumptions.length})
                    </span>
                    <div className="space-y-2">
                      {activeProblem.assumptions.map((ass) => {
                        const badge = getClaimBadge(ass.type);
                        const BadgeIcon = badge.icon;

                        return (
                          <div
                            key={ass.id}
                            className="p-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className="text-[10px] font-mono text-[#6c7693]">
                                Conf: {Math.round(ass.confidence * 100)}%
                              </span>
                            </div>
                            <p className="text-[#1f1f47] font-sans font-medium">{ass.statement}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer ID */}
              <div className="pt-4 border-t border-[#eaedf6] flex items-center justify-between text-xs text-[#84849a] font-mono">
                <span>Category: {activeProblem.category}</span>
                <span>ID: {activeProblem.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
