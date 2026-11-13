/**
 * Full Causal Analysis Report Modal
 * Presents a complete structured breakdown of Root Causes, Bottlenecks,
 * Symptoms, Evidence, and Prioritized Founder Actions for export or review.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Copy,
  Check,
  ShieldAlert,
  GitFork,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { ProblemNode, ProblemNodeType, StartupIdea } from '../../types/index.ts';

interface CausalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: StartupIdea;
  rootCauses: ProblemNode[];
  bottlenecks: ProblemNode[];
  symptoms: ProblemNode[];
  edgeCount: number;
  nodeTypes: Map<string, ProblemNodeType>;
}

export const CausalReportModal: React.FC<CausalReportModalProps> = ({
  isOpen,
  onClose,
  idea,
  rootCauses,
  bottlenecks,
  symptoms,
  edgeCount,
  nodeTypes,
}) => {
  const [copied, setCopied] = useState(false);

  const buildMarkdownReport = () => {
    const lines: string[] = [
      `# Problem Decomposition & Causal Flow Report — ${idea.title}`,
      `Industry: ${idea.industry} | Stage: ${idea.stage}`,
      `Nodes: ${idea.problems.length} (${rootCauses.length} Root Causes, ${bottlenecks.length} Bottlenecks, ${symptoms.length} Symptoms) | Causal Links: ${edgeCount}`,
      '',
      `## Primary Causal Chain`,
      idea.causalSummary || 'Root causes cascade through intermediate bottlenecks into observable symptoms.',
      '',
    ];

    const addSection = (heading: string, list: ProblemNode[]) => {
      lines.push(`## ${heading} (${list.length})`);
      list.forEach((p, idx) => {
        lines.push(`### ${idx + 1}. ${p.title} [${p.category} · Severity ${p.severity}/10]`);
        lines.push(p.description);
        if (p.whyItOccurs) lines.push(`- **Why it occurs:** ${p.whyItOccurs}`);
        if (p.supportingEvidence?.length) {
          lines.push(`- **Evidence:** ${p.supportingEvidence.join('; ')}`);
        }
        if (p.suggestedAction) lines.push(`- **Recommended action:** ${p.suggestedAction}`);
        lines.push('');
      });
    };

    addSection('Stage 1: Root Causes', rootCauses);
    addSection('Stage 2: Bottlenecks', bottlenecks);
    addSection('Stage 3: Symptoms', symptoms);
    return lines.join('\n');
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdownReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([buildMarkdownReport()], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Causal_Report.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const renderGroup = (
    title: string,
    subtitle: string,
    list: ProblemNode[],
    accentClass: string,
    surfaceClass: string,
    Icon: React.ElementType
  ) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-[#eaedf6] pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${surfaceClass} ${accentClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0f172a] font-['Outfit',sans-serif]">{title}</h3>
            <p className="text-xs text-[#64748b]">{subtitle}</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#64748b] tabular-nums">{list.length} nodes</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((node) => {
          const typeLabel = nodeTypes.get(node.id) || 'INTERMEDIATE';
          return (
            <div
              key={node.id}
              className="p-4 rounded-xl bg-white border border-[#eaedf6] space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-[#64748b]">
                <span className="font-medium">
                  {node.category} · {typeLabel === 'ROOT_CAUSE' ? 'Root Cause' : typeLabel === 'SYMPTOM' ? 'Symptom' : 'Bottleneck'}
                </span>
                <span className="font-mono tabular-nums font-semibold text-[#0f172a]">
                  Severity {node.severity}/10
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0f172a] leading-snug">{node.title}</h4>
              <p className="text-xs text-[#475569] leading-relaxed">{node.description}</p>
              {node.suggestedAction && (
                <div className="pt-2 border-t border-[#f1f4f9] flex items-start gap-2 text-xs text-[#334155]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#576cdb] shrink-0 mt-0.5" />
                  <span>{node.suggestedAction}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0f172a]/45 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-4xl max-h-[88vh] bg-[#f8f9fd] rounded-2xl border border-[#eaedf6] shadow-2xl flex flex-col overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-[#eaedf6] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-[#0f172a] font-['Outfit',sans-serif] truncate">
                  Full Causal Analysis Report — {idea.title}
                </h2>
                <p className="text-xs text-[#64748b] tabular-nums mt-0.5">
                  {idea.problems.length} total nodes · {rootCauses.length} Root Causes · {bottlenecks.length} Bottlenecks · {symptoms.length} Symptoms · {edgeCount} causal links
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="px-3.5 py-2 rounded-lg bg-[#f1f4fb] hover:bg-[#e5eaf8] text-[#1f1f47] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="px-3.5 py-2 rounded-lg bg-[#576cdb] hover:bg-[#475cc7] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .md</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Report"
                  className="p-2 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {idea.causalSummary && (
                <div className="p-4 rounded-xl bg-white border border-[#eaedf6] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#576cdb]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Executive Causal Chain Summary</span>
                  </div>
                  <p className="text-sm text-[#334155] leading-relaxed">{idea.causalSummary}</p>
                </div>
              )}

              {renderGroup(
                'Stage 1 — Root Causes',
                'Foundational structural constraints to address first',
                rootCauses,
                'text-[#e11d48]',
                'bg-[#ffe4e6]',
                ShieldAlert
              )}

              {renderGroup(
                'Stage 2 — Intermediate Bottlenecks',
                'Operational and technical friction points propagating impact',
                bottlenecks,
                'text-[#4f46e5]',
                'bg-[#e0e7ff]',
                GitFork
              )}

              {renderGroup(
                'Stage 3 — Observable Symptoms',
                'Visible market, financial, and customer pain outcomes',
                symptoms,
                'text-[#059669]',
                'bg-[#d1fae5]',
                TrendingUp
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
