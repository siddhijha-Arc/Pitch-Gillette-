/**
 * TOPSIS Decision Ranking Studio
 * Solution cards header, divider, right-aligned metadata, and title typography matching screenshot.
 */

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Trophy,
  RefreshCw,
  Sparkles,
  Table2,
  Calculator,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SolutionCandidate, StartupIdea, TopsisCriteriaWeights } from '../../types/index.ts';
import { calculateTopsis, CRITERIA_DEFINITIONS } from '../../server/algorithms/topsis.ts';
import { WakeSlider } from '../WakeSlider.tsx';

interface TopsisStudioViewProps {
  idea: StartupIdea;
  onGenerateSolutions: () => void;
  onUpdateWeights: (weights: TopsisCriteriaWeights) => void;
  isLoading: boolean;
}

export const TopsisStudioView: React.FC<TopsisStudioViewProps> = ({
  idea,
  onGenerateSolutions,
  onUpdateWeights,
  isLoading,
}) => {
  const [showMatrixTable, setShowMatrixTable] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [localWeights, setLocalWeights] = useState<TopsisCriteriaWeights>(
    idea.topsisWeights || {
      feasibility: 0.25,
      costEfficiency: 0.2,
      marketImpact: 0.25,
      scalability: 0.15,
      speedToImplement: 0.15,
    }
  );

  // Compute live TOPSIS locally for instantaneous feedback while dragging sliders
  const liveTopsis = calculateTopsis(idea.solutions, localWeights);
  const solutions = liveTopsis.rankedSolutions;

  const activeSolution = solutions.find((s) => s.id === selectedSolutionId) || solutions[0] || null;

  const handleSliderChange = (key: keyof TopsisCriteriaWeights, value: number) => {
    const updated = { ...localWeights, [key]: value };
    setLocalWeights(updated);
    onUpdateWeights(updated);
  };

  const applyPreset = (preset: 'GROWTH' | 'LEAN' | 'SPEED' | 'EQUAL') => {
    let newWeights: TopsisCriteriaWeights;
    switch (preset) {
      case 'GROWTH':
        newWeights = { feasibility: 0.15, costEfficiency: 0.1, marketImpact: 0.4, scalability: 0.25, speedToImplement: 0.1 };
        break;
      case 'LEAN':
        newWeights = { feasibility: 0.25, costEfficiency: 0.4, marketImpact: 0.15, scalability: 0.1, speedToImplement: 0.1 };
        break;
      case 'SPEED':
        newWeights = { feasibility: 0.2, costEfficiency: 0.15, marketImpact: 0.2, scalability: 0.1, speedToImplement: 0.35 };
        break;
      default:
        newWeights = { feasibility: 0.2, costEfficiency: 0.2, marketImpact: 0.2, scalability: 0.2, speedToImplement: 0.2 };
    }
    setLocalWeights(newWeights);
    onUpdateWeights(newWeights);
  };

  const totalRawWeight = Object.values(localWeights).reduce((a, b) => a + b, 0) || 1;

  const handleCardClick = (sol: SolutionCandidate) => {
    setSelectedSolutionId(sol.id);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="relative space-y-6 w-full mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light text-[#1f1f47] tracking-tight font-sans">
            TOPSIS Multi-Criteria Decision Studio
          </h1>
          <p className="text-sm sm:text-base text-[#6c7693] mt-1 font-normal leading-relaxed">
            Deterministic ranking based on Euclidean distance to Ideal Best (A+) and Ideal Worst (A-).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-sans">
          <button
            onClick={() => setShowMatrixTable(!showMatrixTable)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
              showMatrixTable
                ? 'bg-[#1f1f47] text-white border-[#1f1f47]'
                : 'bg-white text-[#1f1f47] border-[#eaedf6] hover:bg-[#f9f9fb]'
            }`}
          >
            <Table2 className="h-4 w-4 text-[#576cdb]" />
            <span>{showMatrixTable ? 'Hide Matrix' : 'View Decision Matrix'}</span>
          </button>

          <button
            onClick={onGenerateSolutions}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-sm font-semibold shadow-[0_2px_12px_rgba(87,108,219,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Solutions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Criteria Weight Tuning Console */}
      <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-8 space-y-5 shadow-[rgba(73,46,107,0.06)_0px_2px_8px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedf6] pb-4">
          <div className="flex items-center gap-2.5">
            <Calculator className="h-5 w-5 text-[#576cdb]" />
            <h2 className="text-base sm:text-lg font-semibold text-[#1f1f47] font-sans">Criteria Weights (w_j)</h2>
          </div>

          {/* Strategy Presets */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-sans flex-wrap">
            <span className="text-[#6c7693] mr-1 font-mono">Presets:</span>
            <button
              onClick={() => applyPreset('GROWTH')}
              className="px-3.5 py-1.5 rounded-full bg-[#f9f9fb] hover:bg-[#d6dbf5]/50 text-[#1f1f47] text-xs sm:text-sm font-medium border border-[#eaedf6]"
            >
              VC Growth
            </button>
            <button
              onClick={() => applyPreset('LEAN')}
              className="px-3.5 py-1.5 rounded-full bg-[#f9f9fb] hover:bg-[#c1f6e0]/50 text-[#1f1f47] text-xs sm:text-sm font-medium border border-[#eaedf6]"
            >
              Lean / Capital
            </button>
            <button
              onClick={() => applyPreset('SPEED')}
              className="px-3.5 py-1.5 rounded-full bg-[#f9f9fb] hover:bg-[#ffedd5]/50 text-[#1f1f47] text-xs sm:text-sm font-medium border border-[#eaedf6]"
            >
              Fast MVP
            </button>
            <button
              onClick={() => applyPreset('EQUAL')}
              className="px-3.5 py-1.5 rounded-full bg-[#f9f9fb] hover:bg-[#d6dbf5]/50 text-[#1f1f47] text-xs sm:text-sm font-medium border border-[#eaedf6]"
            >
              Equal (20%)
            </button>
          </div>
        </div>

        {/* 5 WakeSlider Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {CRITERIA_DEFINITIONS.map((crit) => {
            const raw = localWeights[crit.key as keyof TopsisCriteriaWeights] ?? 0.2;
            const normalizedPercent = Math.round((raw / totalRawWeight) * 100);

            return (
              <div key={crit.key} className="p-4 rounded-2xl bg-[#f9f9fb] border border-[#eaedf6] space-y-2">
                <WakeSlider
                  bars={32}
                  wake={70}
                  value={normalizedPercent}
                  onChange={(newVal) => {
                    const valFraction = Math.max(0.05, newVal / 100);
                    handleSliderChange(crit.key as keyof TopsisCriteriaWeights, valFraction);
                  }}
                  label={crit.name}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Matrix Table */}
      {showMatrixTable && (
        <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 space-y-4 overflow-x-auto shadow-[rgba(73,46,107,0.06)_0px_2px_8px]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1f1f47] uppercase tracking-wider font-mono">
              Normalized Vector Decision Matrix & Euclidean Distances
            </h3>
            <span className="text-xs sm:text-sm text-[#576cdb] font-mono">
              C_i* = S_i- / (S_i+ + S_i-)
            </span>
          </div>

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#eaedf6] text-[#6c7693] font-mono text-xs">
                <th className="py-3 px-3">Solution</th>
                <th className="py-3 px-2 text-right">Feasibility (r_1)</th>
                <th className="py-3 px-2 text-right">Capital Eff (r_2)</th>
                <th className="py-3 px-2 text-right">Impact (r_3)</th>
                <th className="py-3 px-2 text-right">Scalability (r_4)</th>
                <th className="py-3 px-2 text-right">Speed (r_5)</th>
                <th className="py-3 px-2 text-right text-[#f25a5a]">Dist to Best (S+)</th>
                <th className="py-3 px-2 text-right text-[#576cdb]">Dist to Worst (S-)</th>
                <th className="py-3 px-3 text-right text-[#1f1f47] font-bold">TOPSIS Score</th>
              </tr>
            </thead>
            <tbody>
              {solutions.map((sol) => (
                <tr key={sol.id} className="hover:bg-[#f9f9fb] border-b border-[#f1f3f9]">
                  <td className="py-3.5 px-3 font-sans font-medium text-[#1f1f47] max-w-[220px] truncate">
                    #{sol.topsisRank} {sol.title}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono">{sol.criteriaScores.feasibility}/10</td>
                  <td className="py-3.5 px-2 text-right font-mono">{sol.criteriaScores.costEfficiency}/10</td>
                  <td className="py-3.5 px-2 text-right font-mono">{sol.criteriaScores.marketImpact}/10</td>
                  <td className="py-3.5 px-2 text-right font-mono">{sol.criteriaScores.scalability}/10</td>
                  <td className="py-3.5 px-2 text-right font-mono">{sol.criteriaScores.speedToImplement}/10</td>
                  <td className="py-3.5 px-2 text-right text-[#f25a5a] font-mono">{sol.distanceToIdealBest}</td>
                  <td className="py-3.5 px-2 text-right text-[#576cdb] font-mono">{sol.distanceToIdealWorst}</td>
                  <td className="py-3.5 px-3 text-right font-bold text-[#1f1f47] font-mono">
                    {sol.topsisScore.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bar-Shaped Solution Cards (Screenshot Header & Title Typography) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#6c7693] uppercase tracking-wider font-mono">
          Ranked Strategic Solutions ({solutions.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {solutions.map((solution, index) => {
            const isWinner = index === 0;
            const isSelected = isDrawerOpen && activeSolution?.id === solution.id;

            return (
              <div
                key={solution.id}
                onClick={() => handleCardClick(solution)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 space-y-4 relative ${
                  isSelected
                    ? 'bg-[#d6dbf5]/20 border-2 border-[#576cdb] shadow-[0_4px_16px_rgba(87,108,219,0.15)] ring-2 ring-[#576cdb]/20'
                    : isWinner
                    ? 'bg-white border-2 border-[#576cdb] shadow-sm hover:shadow'
                    : 'bg-white border border-[#eaedf6] hover:border-[#d1d6e1] hover:shadow-sm'
                }`}
              >
                {/* Header Row: Rank Badge + Score & Target on Right */}
                <div className="flex items-center justify-between gap-2 border-b border-[#f1f3f9] pb-3.5">
                  <span
                    className={`text-xs font-bold px-3.5 py-1 rounded-full font-mono ${
                      isWinner
                        ? 'bg-[#576cdb] text-white'
                        : 'bg-[#f9f9fb] text-[#1f1f47] border border-[#eaedf6]'
                    }`}
                  >
                    Rank #{solution.topsisRank}
                  </span>

                  <div className="flex items-center gap-3 text-sm font-mono">
                    <span className="text-[#84849a]">
                      Score: <strong className="text-[#576cdb] font-bold">{solution.topsisScore.toFixed(3)}</strong>
                    </span>
                  </div>
                </div>

                {/* Title Typography matching Screenshot: Medium weight, deep indigo, -0.02em tracking */}
                <h3 className="text-lg sm:text-xl font-medium text-[#1f1f47] leading-snug tracking-[-0.02em] font-sans pt-1">
                  {solution.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimal Modal Popup Overlay */}
      {isDrawerOpen && activeSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171a1c]/50 backdrop-blur-[3px] animate-in fade-in duration-200 font-sans">
          {/* Backdrop click */}
          <div className="absolute inset-0" onClick={closeDrawer} />

          {/* Modal Content Box */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#eaedf6] shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header: Badges & Close Button */}
            <div className="flex items-center justify-between border-b border-[#eaedf6] pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono px-3.5 py-1 rounded-full bg-[#576cdb] text-white">
                  Rank #{activeSolution.topsisRank} Candidate
                </span>
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-md bg-[#d6dbf5] text-[#1f1f47]">
                  C* Score: {activeSolution.topsisScore.toFixed(4)}
                </span>
              </div>

              <button
                onClick={closeDrawer}
                className="w-9 h-9 rounded-full border border-[#eaedf6] bg-white hover:bg-[#f9f9fb] flex items-center justify-center text-[#7c8397] hover:text-[#1f1f47] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Solution Title */}
            <h2 className="text-2xl sm:text-3xl font-medium text-[#1f1f47] leading-tight tracking-[-0.025em]">
              {activeSolution.title}
            </h2>

            {/* Target Problem */}
            <div className="text-sm text-[#6c7693] font-mono">
              Target Problem: <strong className="text-[#1f1f47]">{activeSolution.problemTitle}</strong>
            </div>

            {/* Strategy Summary Box */}
            <div className="p-5 bg-[#f9f9fb] rounded-2xl border border-[#eaedf6] space-y-2">
              <span className="text-xs font-bold text-[#1f1f47] uppercase tracking-wider font-mono block">
                Strategic Implementation
              </span>
              <p className="text-sm sm:text-base text-[#3d3d5c] leading-relaxed font-normal">
                {activeSolution.strategySummary}
              </p>
            </div>

            {/* Trade-offs */}
            {activeSolution.tradeoffs && (
              <div className="p-5 bg-[#ffedd5]/50 border border-[#fed7aa] rounded-2xl text-sm space-y-1">
                <span className="font-bold text-[#ea580c] block font-mono">Strategic Trade-off Accepted</span>
                <p className="text-[#3d3d5c] leading-relaxed">{activeSolution.tradeoffs}</p>
              </div>
            )}

            {/* 5 Criteria Scores Breakdown */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#1f1f47] uppercase tracking-wider font-mono block">
                Multi-Criteria Evaluation Scores
              </span>

              <div className="grid grid-cols-2 gap-3">
                {CRITERIA_DEFINITIONS.map((crit) => {
                  const val = activeSolution.criteriaScores[crit.key];
                  return (
                    <div
                      key={crit.key}
                      className="p-3.5 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] space-y-1"
                    >
                      <span className="text-xs text-[#6c7693] font-medium block truncate">
                        {crit.name}
                      </span>
                      <span className="text-lg font-bold font-mono text-[#576cdb]">
                        {val}/10
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer ID & Distances */}
            <div className="pt-4 border-t border-[#eaedf6] flex items-center justify-between text-xs sm:text-sm text-[#84849a] font-mono">
              <span>Dist S+: {activeSolution.distanceToIdealBest}</span>
              <span>Dist S-: {activeSolution.distanceToIdealWorst}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
