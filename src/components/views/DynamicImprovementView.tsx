/**
 * Dynamic Improvement Engine & Version Diff View
 * Tracks iteration history, problem resolution ledger, and delta readiness scores.
 */

import React from 'react';
import {
  GitCompare,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { StartupIdea } from '../../types/index.ts';

interface DynamicImprovementViewProps {
  idea: StartupIdea;
  onSynthesizeImprovement: () => void;
  isLoading: boolean;
}

export const DynamicImprovementView: React.FC<DynamicImprovementViewProps> = ({
  idea,
  onSynthesizeImprovement,
  isLoading,
}) => {
  const versions = idea.versions || [];
  const latestVersion = versions[versions.length - 1];
  const initialVersion = versions[0];
  const delta = (latestVersion?.readinessScore || 50) - (initialVersion?.readinessScore || 40);

  const resolvedGaps = idea.gaps.filter((g) => g.status === 'RESOLVED');
  const openGaps = idea.gaps.filter((g) => g.status !== 'RESOLVED');

  return (
    <div className="space-y-6 w-full mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#c1c9f6] flex items-center justify-center text-[#38489e]">
              <GitCompare className="h-5 w-5" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-[#1f1f47] tracking-tight font-sans">
              Pitch Evolution & Diff
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#5e6573] mt-1 font-normal leading-relaxed">
            Compare raw concept against de-risked proposal and audit resolved risks.
          </p>
        </div>

        <button
          onClick={onSynthesizeImprovement}
          disabled={isLoading}
          className="px-6 py-3 rounded-full bg-[#576cdb] hover:bg-[#485bc7] text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Synthesizing V{idea.currentVersion + 1}...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Refined Pitch V{idea.currentVersion + 1}</span>
            </>
          )}
        </button>
      </div>

      {/* Delta Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-[#eaedf6] flex items-center justify-between shadow-[0_2px_8px_rgba(73,46,107,0.03)]">
          <div>
            <span className="text-xs font-bold text-[#7c8397] uppercase tracking-wider block font-mono">
              Iteration
            </span>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-[#1f1f47] mt-1 block">
              Version {idea.currentVersion}
            </span>
            <span className="text-xs sm:text-sm text-[#5e6573] block mt-1">
              {versions.length} total snapshots
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#c1c9f6] flex items-center justify-center text-[#38489e]">
            <GitCompare className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#eaedf6] flex items-center justify-between shadow-[0_2px_8px_rgba(73,46,107,0.03)]">
          <div>
            <span className="text-xs font-bold text-[#7c8397] uppercase tracking-wider block font-mono">
              Readiness Score
            </span>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-[#0e704a]">
                {idea.overallReadinessScore}%
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono px-2.5 py-1 rounded-full bg-[#c1f6e0]/60 text-[#0e704a]">
                +{delta} pts
              </span>
            </div>
            <span className="text-xs sm:text-sm text-[#5e6573] block mt-1">Venture readiness</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#c1f6e0] flex items-center justify-center text-[#0e704a]">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#eaedf6] flex items-center justify-between shadow-[0_2px_8px_rgba(73,46,107,0.03)]">
          <div>
            <span className="text-xs font-bold text-[#7c8397] uppercase tracking-wider block font-mono">
              Risk Mitigation
            </span>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-[#1f1f47] mt-1 block">
              {resolvedGaps.length} / {idea.gaps.length}
            </span>
            <span className="text-[11px] text-[#5e6573] block mt-0.5">
              {openGaps.length} active risks remaining
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ede9fe] flex items-center justify-center text-[#5b21b6]">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Side-by-Side Diff: Original vs Improved Proposal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Original V1 Intake */}
        <div className="rounded-2xl bg-white border border-[#eaedf6] p-5 space-y-4 shadow-[0_2px_8px_rgba(73,46,107,0.03)]">
          <div className="flex items-center justify-between border-b border-[#f1f3f9] pb-3">
            <span className="text-xs font-bold text-[#7c8397] uppercase tracking-wider font-mono">
              Original Concept (V1)
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#f1f3f9] text-[#5e6573]">
              Score: {initialVersion?.readinessScore || 45}%
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c8397] block font-mono">
                Initial Pitch
              </span>
              <p className="text-xs text-[#5e6573] mt-1 leading-relaxed bg-[#f9f9fb] p-3 rounded-xl border border-[#eaedf6]">
                "{idea.rawPitch}"
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c8397] block font-mono">
                Customer Target
              </span>
              <p className="text-xs text-[#5e6573] mt-1 bg-[#f9f9fb] p-2.5 rounded-xl border border-[#eaedf6]">
                {initialVersion?.targetAudience || 'Broad horizontal customer segment'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c8397] block font-mono">
                Monetization Model
              </span>
              <p className="text-xs text-[#5e6573] mt-1 bg-[#f9f9fb] p-2.5 rounded-xl border border-[#eaedf6]">
                {initialVersion?.monetization || 'Unstructured pricing'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: De-risked Pitch-Ready Proposal */}
        <div className="rounded-2xl bg-white border-2 border-[#576cdb]/40 p-5 space-y-4 shadow-[0_4px_16px_rgba(87,108,219,0.06)]">
          <div className="flex items-center justify-between border-b border-[#f1f3f9] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#576cdb]" />
              <span className="text-xs font-bold text-[#576cdb] uppercase tracking-wider font-mono">
                Refined Proposal (V{idea.currentVersion})
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#c1c9f6]/40 text-[#2f3e8f] border border-[#a5b2f2]">
              Score: {idea.overallReadinessScore}%
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#576cdb] block font-mono">
                De-risked Strategy
              </span>
              <p className="text-xs text-[#171a1c] mt-1 leading-relaxed bg-[#f8f9ff] p-3 rounded-xl border border-[#e0e7ff] font-medium">
                {latestVersion?.pitchSummary ||
                  'Synthesize the improved pitch to incorporate the top-ranked TOPSIS solution and customer mitigations.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e704a] block font-mono">
                Unique Value Proposition
              </span>
              <p className="text-xs text-[#171a1c] mt-1 bg-[#f0fdf4] p-2.5 rounded-xl border border-[#bbf7d0]">
                {latestVersion?.valueProposition || idea.tagline}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#38489e] block font-mono">
                Beachhead ICP
              </span>
              <p className="text-xs text-[#171a1c] mt-1 bg-[#f8f9ff] p-2.5 rounded-xl border border-[#e0e7ff]">
                {latestVersion?.targetAudience || 'Target beachhead customer profile'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#92400e] block font-mono">
                Unit Economics
              </span>
              <p className="text-xs text-[#171a1c] mt-1 bg-[#fff8eb] p-2.5 rounded-xl border border-[#fde68a]">
                {latestVersion?.monetization || 'Hybrid seat license + consumption credits'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Resolution Ledger */}
      <div className="rounded-2xl bg-white border border-[#eaedf6] p-5 space-y-4 shadow-[0_2px_8px_rgba(73,46,107,0.03)]">
        <div className="flex items-center justify-between border-b border-[#f1f3f9] pb-3">
          <h3 className="text-sm font-medium text-[#1f1f47] tracking-[-0.01em] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#0e704a]" />
            Risk Audit Ledger
          </h3>
          <span className="text-xs text-[#7c8397] font-mono">
            {resolvedGaps.length} resolved • {openGaps.length} open
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resolved Column */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#0e704a] uppercase tracking-wider block font-mono">
              Mitigated Gaps ({resolvedGaps.length})
            </span>
            {resolvedGaps.length > 0 ? (
              resolvedGaps.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#14532d]">{g.title}</span>
                    <span className="text-[10px] font-mono text-[#0e704a]">{g.pillar}</span>
                  </div>
                  {g.resolutionStrategy && (
                    <p className="text-[11px] text-[#166534]">{g.resolutionStrategy}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#7c8397] italic">
                Answer adaptive questions or generate Pitch V2 to mark risks as resolved.
              </p>
            )}
          </div>

          {/* Remaining Risks Column */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#92400e] uppercase tracking-wider block font-mono">
              Monitored Risks ({openGaps.length})
            </span>
            {openGaps.map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#1f1f47]">{g.title}</span>
                  <span className="text-[10px] font-mono text-[#991b1b]">{g.severity}</span>
                </div>
                <p className="text-[11px] text-[#5e6573]">{g.deficiency}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
