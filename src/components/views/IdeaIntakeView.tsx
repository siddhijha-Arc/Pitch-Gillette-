/**
 * Idea Intake & Scope View - RevenueCat Style
 * Horizontal ergonomic layout: Left column = Pitch Overview, Right column = Core Metrics / Intake Form.
 * Eliminates unnecessary vertical scroll and wide container sprawl.
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
  Layers,
  SlidersHorizontal,
  ChevronRight,
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
    <div className="space-y-6 w-full mx-auto font-sans">
      {/* Compact Top Action Bar */}
      <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-7 shadow-[rgba(73,46,107,0.04)_0px_2px_8px] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d6dbf5] text-[#1f1f47] text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#576cdb]" />
              Live Gemini AI Venture Evaluation
            </span>
            <span className="text-xs text-[#84849a] font-mono">
              Deterministic TOPSIS & DAG
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#1f1f47] tracking-tight font-sans">
            {currentIdea ? currentIdea.title : 'Gillette Pitch Engine'}
          </h1>
          <p className="text-sm sm:text-base text-[#575775] max-w-3xl font-normal leading-relaxed">
            {currentIdea?.tagline ||
              'Deconstructs startup problems, audits 6-pillar venture gaps, and ranks solutions using live Gemini reasoning.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {currentIdea && currentIdea.problems.length === 0 && (
            <button
              onClick={onDeconstruct}
              disabled={isLoading}
              className="px-6 py-3 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white font-medium text-sm shadow-[0_2px_10px_rgba(87,108,219,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Deconstructing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Deconstruct Idea</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setIsSubmittingNew(!isSubmittingNew)}
            className={`px-5 py-3 rounded-full border text-sm font-semibold transition-all flex items-center gap-2 ${
              isSubmittingNew
                ? 'bg-[#1f1f47] text-white border-[#1f1f47]'
                : 'bg-white hover:bg-[#f9f9fb] border-[#eaedf6] text-[#1f1f47]'
            }`}
          >
            <PlusCircle className="h-4 w-4 text-[#576cdb]" />
            <span>{isSubmittingNew ? 'Close Form' : '+ New Pitch'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Alignment: New Pitch Intake Form */}
      {isSubmittingNew && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-8 shadow-[rgba(73,46,107,0.06)_0px_3px_12px] space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#eaedf6] pb-4">
            <h2 className="text-lg font-medium text-[#1f1f47] flex items-center gap-2.5 tracking-tight">
              <Building2 className="h-5 w-5 text-[#576cdb]" />
              Submit Startup Pitch For Live AI Audit
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-semibold">
              <Binary className="h-3.5 w-3.5" />
              <span>Live AI Classification</span>
            </div>
          </div>

          {/* 2-Column Horizontal Split Form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Metadata */}
            <div className="md:col-span-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1f1f47]">
                  Startup Name / Working Concept
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. TerraCharge: Autonomous EV Depot Optimization"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-sm sm:text-base text-[#171a1c] placeholder-[#84849a] outline-none transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1f1f47]">Current Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-sm sm:text-base text-[#171a1c] outline-none disabled:opacity-50"
                >
                  <option value="CONCEPT">Concept / Pre-Seed</option>
                  <option value="EARLY_MVP">Functional Prototype / MVP</option>
                  <option value="SEED_TRACTION">Early Revenue / Seed Pilot</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] text-xs sm:text-sm text-[#575775] space-y-1.5">
                <span className="font-semibold text-[#1f1f47] flex items-center gap-1.5 font-mono text-xs uppercase">
                  <ShieldCheck className="h-4 w-4 text-[#576cdb]" />
                  Autonomous Extraction
                </span>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Gemini extracts ICP, unit economics, 6-pillar gaps, and builds the causal DAG in real time.
                </p>
              </div>
            </div>

            {/* Right Column: Narrative & Action */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#1f1f47]">Pitch Narrative</label>
                  <span className="text-xs text-[#84849a]">Problem, customer, tech, & monetization</span>
                </div>
                <textarea
                  value={rawPitch}
                  onChange={(e) => setRawPitch(e.target.value)}
                  rows={5}
                  placeholder="Describe your startup: What problem does it solve? Who is the buyer? What is the technical mechanism? How do you monetize, and why do existing alternatives fail?"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-sm sm:text-base text-[#171a1c] placeholder-[#84849a] outline-none resize-none transition-all disabled:opacity-50 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmittingNew(false)}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-[#6c7693] hover:text-[#1f1f47] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !title.trim() || !rawPitch.trim()}
                  className="px-6 py-3 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-sm font-semibold shadow-[0_2px_8px_rgba(87,108,219,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Analyzing...</span>
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
          </div>
        </form>
      )}

      {/* Horizontal Alignment: Active Idea Overview & Core Metrics */}
      {currentIdea ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (7 cols): Pitch Statement Card */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-7 shadow-[rgba(73,46,107,0.04)_0px_2px_8px] flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#eaedf6] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold px-3.5 py-1 rounded-full bg-[#d6dbf5] text-[#1f1f47]">
                    {currentIdea.industry}
                  </span>
                  <span className="text-sm text-[#6c7693] font-mono">Stage: {currentIdea.stage}</span>
                </div>
                <span className="text-sm text-[#84849a] font-mono font-medium">
                  Version {currentIdea.currentVersion}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#84849a] uppercase tracking-wider block font-mono mb-2">
                  Pitch Statement
                </span>
                <p className="text-base sm:text-lg text-[#1f1f47] leading-relaxed bg-[#f9f9fb] p-5 rounded-2xl border border-[#eaedf6] italic font-medium">
                  "{currentIdea.rawPitch}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#eaedf6] text-sm text-[#6c7693]">
              <span className="truncate max-w-[360px]">
                {currentIdea.tagline || 'Strategic venture thesis loaded'}
              </span>
              <span className="text-xs font-mono font-bold text-[#576cdb]">
                Active In Engine
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): 4 Core Metrics 2x2 Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {/* Readiness Score */}
            <div className="p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.03)_0px_2px_6px] flex flex-col justify-between">
              <span className="text-sm text-[#6c7693] font-medium block">Readiness Score</span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-light text-[#576cdb] tracking-tight">
                  {currentIdea.overallReadinessScore}%
                </span>
              </div>
              <span className="text-xs text-[#84849a] font-mono">Normalized Index</span>
            </div>

            {/* Problem Nodes */}
            <div className="p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.03)_0px_2px_6px] flex flex-col justify-between">
              <span className="text-sm text-[#6c7693] font-medium block">Problem Nodes</span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-light text-[#1f1f47] tracking-tight">
                  {currentIdea.problems.length}
                </span>
              </div>
              <span className="text-xs text-[#84849a] font-mono">Causal Graph Vertices</span>
            </div>

            {/* Identified Gaps */}
            <div className="p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.03)_0px_2px_6px] flex flex-col justify-between">
              <span className="text-sm text-[#6c7693] font-medium block">Identified Gaps</span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-light text-[#f25a5a] tracking-tight">
                  {currentIdea.gaps.length}
                </span>
              </div>
              <span className="text-xs text-[#f25a5a] font-mono font-medium">6-Pillar Audited</span>
            </div>

            {/* Ranked Solutions */}
            <div className="p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.03)_0px_2px_6px] flex flex-col justify-between">
              <span className="text-sm text-[#6c7693] font-medium block">Ranked Solutions</span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-light text-[#1f1f47] tracking-tight">
                  {currentIdea.solutions.length}
                </span>
              </div>
              <span className="text-xs text-[#10b981] font-mono font-medium">TOPSIS Ranked</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-[#eaedf6] p-10 text-center space-y-3">
          <div className="mx-auto w-10 h-10 rounded-2xl bg-[#f0f4ff] flex items-center justify-center text-[#576cdb]">
            <Zap className="h-5 w-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-medium text-[#1f1f47]">No Startup Pitch Loaded</h3>
            <p className="text-xs text-[#6c7693] leading-relaxed">
              Click <strong>+ New Pitch</strong> above to enter any startup concept. Live Gemini AI will decompose problems, audit 6-pillar gaps, run TOPSIS, and simulate 6 partner critiques.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
