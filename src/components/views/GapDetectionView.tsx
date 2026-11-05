/**
 * 6-Pillar Gap Detection View
 * Card header, divider, right-aligned metadata, and title typography matching user uploaded screenshot.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { GapPillar, GapRecord, GapSeverity, StartupIdea } from '../../types/index.ts';

interface GapDetectionViewProps {
  idea: StartupIdea;
  onDetectGaps: () => void;
  isLoading: boolean;
}

export const GapDetectionView: React.FC<GapDetectionViewProps> = ({
  idea,
  onDetectGaps,
  isLoading,
}) => {
  const gaps = idea.gaps || [];

  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState<boolean>(true);

  // Filtered list based on selected pillar & severity
  const filteredGaps = gaps.filter((g) => {
    const matchesPillar = selectedPillar === 'ALL' || g.pillar === selectedPillar;
    const matchesSeverity = severityFilter === 'ALL' || g.severity === severityFilter;
    return matchesPillar && matchesSeverity;
  });

  // Selected gap object
  const activeGap = gaps.find((g) => g.id === selectedGapId) || filteredGaps[0] || null;

  const fatalCount = gaps.filter((g) => g.severity === 'FATAL_FLAW').length;
  const criticalCount = gaps.filter((g) => g.severity === 'CRITICAL_GAP').length;
  const resolvedCount = gaps.filter((g) => g.status === 'RESOLVED').length;

  const getSeverityBadge = (severity: GapSeverity) => {
    switch (severity) {
      case 'FATAL_FLAW':
        return {
          label: 'Fatal Flaw',
          bg: 'bg-[#f7d4d4]',
          text: 'text-[#f25a5a]',
          border: 'border-[#f25a5a]/30',
          dot: 'bg-[#f25a5a]',
        };
      case 'CRITICAL_GAP':
        return {
          label: 'Critical Gap',
          bg: 'bg-[#ffedd5]',
          text: 'text-[#ea580c]',
          border: 'border-[#fed7aa]',
          dot: 'bg-[#ea580c]',
        };
      case 'MODERATE_GAP':
        return {
          label: 'Moderate Risk',
          bg: 'bg-[#d6dbf5]',
          text: 'text-[#3d3d5c]',
          border: 'border-[#c1c9f6]',
          dot: 'bg-[#576cdb]',
        };
      default:
        return {
          label: 'Optimization',
          bg: 'bg-[#e3e6e8]',
          text: 'text-[#575775]',
          border: 'border-[#eaedf6]',
          dot: 'bg-[#84849a]',
        };
    }
  };

  const handleCardClick = (gap: GapRecord) => {
    setSelectedGapId(gap.id);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const renderImpactDots = (weight: number) => {
    return (
      <div className="inline-flex items-center gap-1.5 ml-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${
              i <= weight ? 'bg-[#f59e0b]' : 'bg-[#e3e6e8]'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative space-y-6 w-full mx-auto py-2 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light text-[#1f1f47] tracking-tight font-sans">
            6-Pillar Venture Gap Audit
          </h1>
          <p className="text-sm sm:text-base text-[#6c7693] mt-1.5 font-normal leading-relaxed">
            Evaluates TAM, tech viability, unit economics, distribution, legal compliance, and defensibility.
          </p>
        </div>

        <button
          onClick={onDetectGaps}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-full bg-white hover:bg-[#f9f9fb] border border-[#eaedf6] text-sm font-semibold text-[#1f1f47] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 shrink-0 font-sans"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-[#576cdb]" />
              <span>Auditing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-[#576cdb]" />
              <span>Re-run Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row (3 Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Fatal Flaws Metric */}
        <div className="p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.06)_0px_2px_8px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f25a5a]" />
            <span className="text-xs font-bold text-[#f25a5a] uppercase tracking-wider font-mono">
              FATAL FLAWS
            </span>
          </div>
          <span className="text-3xl font-light text-[#1f1f47] tracking-tight block pl-4 font-sans">
            {fatalCount}
          </span>
        </div>

        {/* Critical Gaps Metric */}
        <div className="p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.06)_0px_2px_8px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
            <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider font-mono">
              CRITICAL GAPS
            </span>
          </div>
          <span className="text-3xl font-light text-[#1f1f47] tracking-tight block pl-4 font-sans">
            {criticalCount}
          </span>
        </div>

        {/* Resolved Metric */}
        <div className="p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.06)_0px_2px_8px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84849a]" />
            <span className="text-xs font-bold text-[#6c7693] uppercase tracking-wider font-mono">
              RESOLVED
            </span>
          </div>
          <span className="text-3xl font-light text-[#1f1f47] tracking-tight block pl-4 font-sans">
            {resolvedCount}
          </span>
        </div>
      </div>

      {/* Filter & Severity Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="px-4 py-2 rounded-full bg-white hover:bg-[#f9f9fb] border border-[#eaedf6] text-xs font-semibold text-[#1f1f47] shadow-sm transition-all flex items-center gap-2 font-sans"
        >
          <Filter className="h-3.5 w-3.5 text-[#576cdb]" />
          <span>Filter & Severity</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#6c7693] transition-transform duration-200 ${
              isFilterOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Filter Dropdown Panel */}
        {isFilterOpen && (
          <div className="absolute left-0 top-full mt-2 z-30 w-full sm:w-[480px] bg-white rounded-2xl border border-[#eaedf6] shadow-[rgba(71,92,133,0.12)_0px_8px_24px] p-5 space-y-4 animate-in fade-in duration-150">
            {/* Pillar Filter */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#6c7693] uppercase tracking-wider block font-mono">
                Pillar Filter
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'TAM_MARKET', 'TECH_VIABILITY', 'UNIT_ECONOMICS', 'DISTRIBUTION', 'LEGAL', 'MOAT'].map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPillar(p)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors font-sans ${
                        selectedPillar === p
                          ? 'bg-[#1f1f47] text-white'
                          : 'bg-[#f9f9fb] text-[#6c7693] hover:bg-[#eaedf6]'
                      }`}
                    >
                      {p === 'ALL' ? 'All Pillars' : p.replace(/_/g, ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Severity Filter */}
            <div className="space-y-2 pt-2 border-t border-[#eaedf6]">
              <span className="text-[11px] font-bold text-[#6c7693] uppercase tracking-wider block font-mono">
                Severity Filter
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'FATAL_FLAW', 'CRITICAL_GAP', 'MODERATE_GAP'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors font-sans ${
                      severityFilter === s
                        ? 'bg-[#576cdb] text-white'
                        : 'bg-[#f9f9fb] text-[#6c7693] hover:bg-[#eaedf6]'
                    }`}
                  >
                    {s === 'ALL' ? 'All Severities' : s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#eaedf6]">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-xs font-semibold text-[#576cdb] hover:underline font-sans"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Bar-Shaped Gap Cards (Screenshot Typography Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGaps.map((gap) => {
          const badge = getSeverityBadge(gap.severity);
          const isSelected = isDrawerOpen && activeGap?.id === gap.id;

          return (
            <div
              key={gap.id}
              onClick={() => handleCardClick(gap)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 space-y-3 relative ${
                isSelected
                  ? 'bg-[#d6dbf5]/20 border-2 border-[#576cdb] shadow-[0_4px_16px_rgba(87,108,219,0.15)] ring-2 ring-[#576cdb]/20'
                  : 'bg-white border border-[#eaedf6] hover:border-[#d1d6e1] hover:shadow-sm'
              }`}
            >
              {/* Card Header Row: Badge on Left + Right Aligned Metadata */}
              <div className="flex items-center justify-between gap-2 border-b border-[#f1f3f9] pb-3.5">
                <span
                  className={`text-xs sm:text-sm font-semibold px-3.5 py-1 rounded-full font-mono ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </span>

                <div className="flex items-center gap-3 text-xs sm:text-sm font-mono">
                  <span className="text-[#84849a]">
                    Impact: <strong className="text-[#1f1f47] font-bold">{gap.impactWeight}/5</strong>
                  </span>
                  <span className="text-[#84849a]">
                    Pillar: <strong className="text-[#1f1f47] font-semibold uppercase">{gap.pillar.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
              </div>

              {/* Title Typography matching Screenshot: Medium weight, deep indigo, -0.02em tracking */}
              <h3 className="text-lg sm:text-xl font-medium text-[#1f1f47] leading-snug tracking-[-0.02em] font-sans pt-1">
                {gap.title}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Minimal Modal Popup Overlay */}
      {isDrawerOpen && activeGap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171a1c]/40 backdrop-blur-[3px] animate-in fade-in duration-200 font-sans">
          {/* Backdrop click */}
          <div className="absolute inset-0" onClick={closeDrawer} />

          {/* Modal Content Box */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#eaedf6] shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header: Badges & Close Button */}
            <div className="flex items-center justify-between border-b border-[#eaedf6] pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const badge = getSeverityBadge(activeGap.severity);
                  return (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full font-mono ${badge.bg} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}

                <span className="text-xs font-bold font-mono px-3 py-1 rounded-md bg-[#e3e6e8] text-[#3d3d5c] uppercase">
                  {activeGap.pillar.replace(/_/g, ' ')}
                </span>
              </div>

              <button
                onClick={closeDrawer}
                className="w-8 h-8 rounded-full border border-[#eaedf6] bg-white hover:bg-[#f9f9fb] flex items-center justify-center text-[#7c8397] hover:text-[#1f1f47] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Gap Title */}
            <h2 className="text-xl sm:text-2xl font-medium text-[#1f1f47] leading-tight tracking-[-0.025em]">
              {activeGap.title}
            </h2>

            {/* Description Card Box */}
            <div className="p-4 bg-[#f9f9fb] rounded-2xl border border-[#eaedf6] space-y-3">
              <span className="text-xs font-bold text-[#1f1f47] uppercase tracking-wider font-mono block">
                Description & Deficiency
              </span>
              <p className="text-xs sm:text-sm text-[#3d3d5c] leading-relaxed font-normal">
                {activeGap.deficiency}
              </p>
            </div>

            {/* Impact Weight Metric */}
            <div className="p-4 bg-white rounded-xl border border-[#eaedf6] flex items-center justify-between text-xs font-bold text-[#1f1f47] font-mono">
              <span>Impact Weight: {activeGap.impactWeight}/5</span>
              {renderImpactDots(activeGap.impactWeight)}
            </div>

            {/* Resolution Strategy if available */}
            {activeGap.resolutionStrategy && (
              <div className="p-4 bg-[#c1f6e0]/50 border border-[#a6f2d2] rounded-2xl text-xs text-[#1f1f47] space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#576cdb]" />
                  Resolution Strategy
                </span>
                <p className="text-[#3d3d5c] leading-relaxed">
                  {activeGap.resolutionStrategy}
                </p>
              </div>
            )}

            {/* Footer ID */}
            <div className="pt-4 border-t border-[#eaedf6] flex items-center justify-between text-xs text-[#84849a] font-mono">
              <span>Pillar: {activeGap.pillar}</span>
              <span>ID: {activeGap.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
