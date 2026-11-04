/**
 * Idea Intake & Scope View - RevenueCat Style
 * Cloud-white canvas, clean 16px cards, periwinkle signal pill CTA, zero fluff.
 * Fully dynamic autonomous AI classification (no manual vertical dropdowns, no canned templates).
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Building2,
  RefreshCw,
  PlusCircle,
  Binary,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { StartupIdea } from '../../types/index.ts';

interface IdeaIntakeViewProps {
  currentIdea: StartupIdea | null;
  onDeconstruct: () => void;
  onSubmitNewIdea: (title: string, rawPitch: string, stage: string) => void;
  isLoading: boolean;
  isSubmittingNew?: boolean;
  onToggleSubmitNew?: (open: boolean) => void;
  onOpenApiKeyModal?: () => void;
}

export const IdeaIntakeView: React.FC<IdeaIntakeViewProps> = ({
  currentIdea,
  onDeconstruct,
  onSubmitNewIdea,
  isLoading,
  isSubmittingNew: externalIsSubmitting,
  onToggleSubmitNew,
  onOpenApiKeyModal,
}) => {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(!currentIdea);
  const isSubmittingNew = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;
  const setIsSubmittingNew = (open: boolean) => {
    if (onToggleSubmitNew) onToggleSubmitNew(open);
    setInternalIsSubmitting(open);
  };

  const [title, setTitle] = useState('');
  const [stage, setStage] = useState('CONCEPT');
  const [rawPitch, setRawPitch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawPitch.trim()) return;
    onSubmitNewIdea(title.trim(), rawPitch.trim(), stage);
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto py-2">
      {/* Hero Header Block */}
      <div className="bg-white rounded-2xl border border-[#eaedf6] p-8 sm:p-10 shadow-[rgba(73,46,107,0.08)_0px_3px_16px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d6dbf5] text-[#1f1f47] text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#576cdb]" />
              Live Gemini AI Venture Evaluation
            </span>
            <h1 className="text-3xl sm:text-5xl font-light text-[#1f1f47] tracking-[-0.04em]">
              {currentIdea ? currentIdea.title : 'Pitch-Ready Idea Engine'}
            </h1>
            <p className="text-base text-[#3d3d5c] max-w-2xl font-normal leading-relaxed">
              {currentIdea?.tagline ||
                'Deconstructs startup problems, audits 6-pillar venture gaps, and ranks solutions using live Gemini reasoning and deterministic TOPSIS.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {currentIdea && currentIdea.problems.length === 0 && (
              <button
                onClick={onDeconstruct}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white font-medium text-sm shadow-[0_4px_16px_rgba(87,108,219,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deconstructing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Deconstruct Idea
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsSubmittingNew(!isSubmittingNew)}
              className={`px-5 py-3 rounded-full border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                isSubmittingNew
                  ? 'bg-[#1f1f47] text-white border-[#1f1f47]'
                  : 'bg-white hover:bg-[#f9f9fb] border-[#eaedf6] text-[#1f1f47]'
              }`}
            >
              <PlusCircle className="h-4 w-4 text-[#576cdb]" />
              <span>{isSubmittingNew ? 'Close Form' : '+ Submit New Idea'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Pitch Intake Form */}
      {isSubmittingNew && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#eaedf6] p-8 space-y-6 shadow-[rgba(73,46,107,0.08)_0px_3px_16px]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eaedf6] pb-4">
            <div>
              <h2 className="text-xl font-medium text-[#1f1f47] flex items-center gap-2 tracking-tight">
                <Building2 className="h-5 w-5 text-[#576cdb]" />
                Submit Startup Pitch For Live AI Audit
              </h2>
              <p className="text-xs text-[#6c7693] mt-1">
                Enter your genuine pitch. Industry, target customer ICP, unit economics, and 6-pillar gaps are extracted dynamically by live Gemini AI.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-medium">
              <Binary className="h-3.5 w-3.5" />
              <span>Live AI Classification</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-[#1f1f47]">Startup Name / Working Concept</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. TerraCharge: Autonomous EV Depot Optimization"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-sm text-[#171a1c] placeholder-[#6c7693] outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1f1f47]">Current Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-sm text-[#171a1c] outline-none disabled:opacity-50"
              >
                <option value="CONCEPT">Concept / Pre-Seed</option>
                <option value="EARLY_MVP">Functional Prototype / MVP</option>
                <option value="SEED_TRACTION">Early Revenue / Seed Pilot</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1f1f47]">Pitch Narrative</label>
              <span className="text-[11px] text-[#6c7693]">Explain problem, mechanism, target customer, and business model</span>
            </div>
            <textarea
              value={rawPitch}
              onChange={(e) => setRawPitch(e.target.value)}
              rows={5}
              placeholder="Describe your startup in plain language: What acute problem does it solve? Who is the buyer? What is the technical mechanism? How do you monetize, and why do existing alternatives fail?"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-sm text-[#171a1c] placeholder-[#6c7693] outline-none resize-y transition-all disabled:opacity-50 font-sans"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#6c7693]">
              <ShieldCheck className="h-4 w-4 text-[#576cdb]" />
              <span>Full 9-module evaluation: Causal DAG, TOPSIS ranking, 6-agent council & deck</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSubmittingNew(false)}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-full text-xs font-medium text-[#6c7693] hover:text-[#1f1f47] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !rawPitch.trim()}
                className="px-6 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-xs font-medium shadow-[0_2px_12px_rgba(87,108,219,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing Live with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run Full Venture Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Active Idea Card */}
      {currentIdea ? (
        <div className="bg-white rounded-2xl border border-[#eaedf6] p-8 space-y-5 shadow-[rgba(73,46,107,0.08)_0px_3px_16px]">
          <div className="flex items-center justify-between border-b border-[#eaedf6] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#d6dbf5] text-[#1f1f47]">
                {currentIdea.industry}
              </span>
              <span className="text-xs text-[#6c7693]">• Stage: {currentIdea.stage}</span>
            </div>
            <span className="text-xs text-[#6c7693] font-mono">
              Version {currentIdea.currentVersion}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#6c7693] uppercase tracking-wider mb-2">
              Pitch Statement
            </h3>
            <p className="text-base text-[#1f1f47] leading-relaxed bg-[#f9f9fb] p-5 rounded-xl border border-[#eaedf6]">
              "{currentIdea.rawPitch}"
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#eaedf6]">
              <span className="text-xs text-[#6c7693] font-medium block">Readiness Score</span>
              <span className="text-2xl font-light text-[#576cdb] tracking-tight">
                {currentIdea.overallReadinessScore}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#eaedf6]">
              <span className="text-xs text-[#6c7693] font-medium block">Problem Nodes</span>
              <span className="text-2xl font-light text-[#1f1f47] tracking-tight">
                {currentIdea.problems.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#eaedf6]">
              <span className="text-xs text-[#6c7693] font-medium block">Identified Gaps</span>
              <span className="text-2xl font-light text-[#f25a5a] tracking-tight">
                {currentIdea.gaps.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#eaedf6]">
              <span className="text-xs text-[#6c7693] font-medium block">Ranked Solutions</span>
              <span className="text-2xl font-light text-[#1f1f47] tracking-tight">
                {currentIdea.solutions.length}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-[#eaedf6] p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#f0f4ff] flex items-center justify-center text-[#576cdb]">
            <Zap className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-medium text-[#1f1f47]">No Startup Pitch Loaded</h3>
            <p className="text-xs text-[#6c7693] leading-relaxed">
              Click <strong>+ Submit New Idea</strong> above to enter any startup concept. Live Gemini AI will decompose problems, audit 6-pillar gaps, run TOPSIS, and simulate 6 partner critiques.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
