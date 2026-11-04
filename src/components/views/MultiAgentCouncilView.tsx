/**
 * Multi-Agent Evaluation Council View - Apple-Inspired Minimal SaaS Redesign
 *
 * Clean white canvas, subtle borders, compact KPI summary bar, collapsible reviewer cards,
 * and minimal score distribution chart without losing any underlying data or functionality.
 */

import React, { useState } from 'react';
import {
  Users,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Scale,
  DollarSign,
  UserCheck,
  Cpu,
  TrendingUp,
  Award,
  Swords,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StartupIdea } from '../../types/index.ts';

interface MultiAgentCouncilViewProps {
  idea: StartupIdea;
  onRunAgents: () => void;
  isLoading: boolean;
}

const AGENT_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; text: string }
> = {
  DollarSign: { icon: DollarSign, bg: 'bg-[#e0e7ff]', text: 'text-[#4f46e5]' },
  UserCheck: { icon: UserCheck, bg: 'bg-[#ecfdf5]', text: 'text-[#059669]' },
  Cpu: { icon: Cpu, bg: 'bg-[#fef2f2]', text: 'text-[#dc2626]' },
  Scale: { icon: Scale, bg: 'bg-[#f3e8ff]', text: 'text-[#7c3aed]' },
  TrendingUp: { icon: TrendingUp, bg: 'bg-[#f0fdf4]', text: 'text-[#16a34a]' },
  Award: { icon: Award, bg: 'bg-[#fffbeb]', text: 'text-[#d97706]' },
};

export const MultiAgentCouncilView: React.FC<MultiAgentCouncilViewProps> = ({
  idea,
  onRunAgents,
  isLoading,
}) => {
  const critiques = idea.agentCritiques || [];
  const report = idea.consensusReport;
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'STRONG_BUY':
        return 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]';
      case 'CONDITIONAL_PASS':
        return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]';
      default:
        return 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto py-4">
      {/* 1. Header with Run Deliberation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-6">
        <div>
          <span className="text-[11px] font-semibold text-[#576cdb] tracking-wider uppercase block mb-1 font-mono">
            Orchestrated Expert Committee
          </span>
          <h1 className="text-3xl font-light text-[#1f1f47] tracking-[-0.03em]">
            Evaluation Council
          </h1>
          <p className="text-sm text-[#6c7693] mt-1">
            Autonomous multi-agent scrutiny with variance analysis and dialectical disagreement detection.
          </p>
        </div>

        <button
          onClick={onRunAgents}
          disabled={isLoading}
          className="px-6 py-3 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-xs font-semibold shadow-[0_4px_16px_rgba(87,108,219,0.25)] transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Deliberating Council...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Run Council Deliberation</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Evaluation Summary (Prominent KPI Bar) */}
      {report && (
        <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-[rgba(73,46,107,0.04)_0px_3px_16px]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#eaedf6]">
            {/* Overall Score */}
            <div className="space-y-1 pt-3 md:pt-0">
              <span className="text-xs font-medium text-[#6c7693] uppercase tracking-wider block">
                Mean Score (μ)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-[#1f1f47] tracking-tight">
                  {report.meanScore}
                </span>
                <span className="text-xs text-[#6c7693] font-mono">/ 10.0</span>
              </div>
            </div>

            {/* Number of Reviewers */}
            <div className="space-y-1 pt-3 md:pt-0 md:pl-6">
              <span className="text-xs font-medium text-[#6c7693] uppercase tracking-wider block">
                Reviewers
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-[#1f1f47] tracking-tight">
                  {critiques.length}
                </span>
                <span className="text-xs text-[#576cdb] font-medium">Specialized AI</span>
              </div>
            </div>

            {/* Score Gap (Variance) */}
            <div className="space-y-1 pt-3 md:pt-0 md:pl-6">
              <span className="text-xs font-medium text-[#6c7693] uppercase tracking-wider block">
                Score Variance (σ²)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-[#576cdb] tracking-tight">
                  {report.variance}
                </span>
                <span className="text-xs text-[#6c7693]">Spread</span>
              </div>
            </div>

            {/* Confidence / Polarizing Metric */}
            <div className="space-y-1 pt-3 md:pt-0 md:pl-6">
              <span className="text-xs font-medium text-[#6c7693] uppercase tracking-wider block">
                Std Dev (σ)
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-light tracking-tight ${report.isPolarizing ? 'text-[#d97706]' : 'text-[#059669]'}`}>
                  {report.standardDeviation}
                </span>
                <span className="text-xs font-medium text-[#6c7693]">
                  {report.isPolarizing ? 'Polarizing' : 'Aligned'}
                </span>
              </div>
            </div>

            {/* Verdict Status */}
            <div className="space-y-1 pt-3 md:pt-0 md:pl-6 flex flex-col justify-center">
              <span className="text-xs font-medium text-[#6c7693] uppercase tracking-wider block">
                Consensus Verdict
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-mono w-fit mt-1 border ${
                report.isPolarizing ? 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]' : 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
              }`}>
                {report.consensusVerdict.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#eaedf6] text-sm text-[#3d3d5c] leading-relaxed">
            <span className="font-semibold text-[#1f1f47] mr-2">Committee Synthesis:</span>
            {report.synthesisSummary}
          </div>

          {report.outlierAgents.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e] space-y-1">
              <span className="font-semibold flex items-center gap-1.5 font-mono">
                <AlertTriangle className="h-4 w-4 text-[#d97706]" />
                Statistically Significant Outlier Detected (|x - μ| &gt; 1.3σ)
              </span>
              {report.outlierAgents.map((outlier, idx) => (
                <p key={idx} className="pl-5 text-[#78350f]">
                  • {outlier.reason}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Key Insights (Strengths & Areas to Improve) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths (Bullish Consensus) */}
        <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 space-y-4 shadow-[rgba(73,46,107,0.03)_0px_2px_8px]">
          <div className="flex items-center gap-2 border-b border-[#eaedf6] pb-3">
            <div className="w-2 h-2 rounded-full bg-[#059669]" />
            <h3 className="text-sm font-semibold text-[#1f1f47]">Key Strengths & Bullish Consensus</h3>
          </div>
          <div className="space-y-3">
            {critiques.map((c) => (
              <div key={c.agent} className="p-3.5 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#1f1f47] font-semibold">{c.agentName}</span>
                  <span className="text-[#059669] font-mono font-bold">{c.dimensionScores.tamAndOpportunity || c.overallScore}/10</span>
                </div>
                <p className="text-xs text-[#3d3d5c] leading-relaxed">{c.bullishArgument}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas to Improve (Bearish Risks & Pivots) */}
        <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 space-y-4 shadow-[rgba(73,46,107,0.03)_0px_2px_8px]">
          <div className="flex items-center gap-2 border-b border-[#eaedf6] pb-3">
            <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
            <h3 className="text-sm font-semibold text-[#1f1f47]">Critical Risks & Recommended Pivots</h3>
          </div>
          <div className="space-y-3">
            {critiques.map((c) => (
              <div key={c.agent} className="p-3.5 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#1f1f47] font-semibold">{c.agentName}</span>
                  <span className="text-[#dc2626] font-mono font-bold">Risk Factor</span>
                </div>
                <p className="text-xs text-[#3d3d5c] leading-relaxed">{c.bearishArgument}</p>
                {c.pivotsRecommended && c.pivotsRecommended.length > 0 && (
                  <p className="text-[11px] text-[#b45309] font-medium pt-1">
                    ↳ Pivot: {c.pivotsRecommended[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Score Trend / Distribution Chart */}
      {report && report.dialecticalDisagreements.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 space-y-4 shadow-[rgba(73,46,107,0.03)_0px_2px_8px]">
          <div className="flex items-center gap-2 border-b border-[#eaedf6] pb-3">
            <Swords className="h-4 w-4 text-[#576cdb]" />
            <h3 className="text-sm font-semibold text-[#1f1f47]">Dialectical Disagreements & Strategic Resolutions</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {report.dialecticalDisagreements.map((clash, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1f1f47] font-mono">
                    Dimension: {clash.dimension}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#e0e7ff] text-[#4f46e5]">
                    Polar Tension
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-[#eaedf6] space-y-1">
                    <span className="font-semibold text-[#059669] block">Bull: {clash.agentA.agent}</span>
                    <p className="text-[#3d3d5c]">{clash.agentA.stance}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#eaedf6] space-y-1">
                    <span className="font-semibold text-[#dc2626] block">Bear: {clash.agentB.agent}</span>
                    <p className="text-[#3d3d5c]">{clash.agentB.stance}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#f0f4ff] border border-[#c1c9f6] text-xs text-[#1f1f47]">
                  <span className="font-semibold text-[#576cdb] block mb-0.5">Strategic Resolution:</span>
                  {clash.strategicResolution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Reviewer Perspectives (Spacious, minimal cards with expand/collapse) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1f1f47] uppercase tracking-wider">
            Reviewer Perspectives ({critiques.length})
          </h2>
          <span className="text-xs text-[#6c7693]">Click any card to expand full evaluation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {critiques.map((critique) => {
            const config = AGENT_CONFIG[critique.avatarIcon] || {
              icon: Users,
              bg: 'bg-[#e0e7ff]',
              text: 'text-[#4f46e5]',
            };
            const Icon = config.icon;
            const badgeClass = getVerdictBadge(critique.verdict);
            const isExpanded = expandedAgent === critique.agent;

            return (
              <div
                key={critique.agent}
                onClick={() => setExpandedAgent(isExpanded ? null : critique.agent)}
                className="bg-white rounded-2xl border border-[#eaedf6] p-6 space-y-4 shadow-[rgba(73,46,107,0.03)_0px_3px_12px] hover:border-[#d1d6e1] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${config.bg} flex items-center justify-center ${config.text} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-[17px] font-medium text-[#1f1f47] tracking-[-0.02em]">{critique.agentName}</h4>
                        <span className="text-xs text-[#6c7693] block">{critique.title}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-light font-mono text-[#1f1f47]">
                        {critique.overallScore}
                      </span>
                      <span className="text-xs text-[#6c7693] font-mono">/10</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-semibold font-mono uppercase px-2.5 py-1 rounded-full border ${badgeClass}`}>
                      {critique.verdict.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-[#6c7693] font-mono">{critique.agent}</span>
                  </div>

                  <p className="text-xs text-[#3d3d5c] italic bg-[#f9f9fb] p-3 rounded-xl border border-[#eaedf6]">
                    "{critique.summaryQuote}"
                  </p>
                </div>

                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-[#eaedf6] text-xs animate-in fade-in duration-200">
                    <div>
                      <span className="font-semibold text-[#059669] block mb-0.5">Bullish Argument:</span>
                      <p className="text-[#3d3d5c] leading-relaxed">{critique.bullishArgument}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-[#dc2626] block mb-0.5">Bearish Risk:</span>
                      <p className="text-[#3d3d5c] leading-relaxed">{critique.bearishArgument}</p>
                    </div>
                    {critique.pivotsRecommended && critique.pivotsRecommended.length > 0 && (
                      <div>
                        <span className="font-semibold text-[#d97706] block mb-0.5">Recommended Pivot:</span>
                        <p className="text-[#3d3d5c] leading-relaxed">{critique.pivotsRecommended[0]}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#eaedf6] text-xs text-[#576cdb] font-medium">
                  <span>{isExpanded ? 'Collapse Details' : 'Expand Reviewer Details'}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
