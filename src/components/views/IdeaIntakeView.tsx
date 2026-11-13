/**
 * Idea Intake & Executive Pitch Report View - Gillette Pitch Engine
 *
 * Dual Mode:
 * 1. Chat Intake Mode:
 *    - Floating 3D holographic pearl orb
 *    - "Good Morning! Got an idea? / Let's see if it's actually a good one."
 *    - Floating rounded input card with mandatory Startup Name (with red vibration shake animation),
 *      stage dropdown, and glowing send button.
 * 2. Submitted Idea Report Mode:
 *    - Executive venture scorecard and diagnostic summary
 *    - Readiness score meter, executive pitch transcript, and direct pipeline cards to
 *      Decomposition, Gaps, TOPSIS, Council, and Deck Export.
 *    - Prominent "+ New Pitch" button to return to chat intake anytime.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Paperclip,
  ArrowUp,
  RefreshCw,
  Building2,
  ChevronDown,
  ArrowRight,
  PlusCircle,
  GitFork,
  ShieldAlert,
  SlidersHorizontal,
  HelpCircle,
  Users,
  Presentation,
  CheckCircle2,
  X,
  Lightbulb,
} from 'lucide-react';
import { IdeaValidationResult, StartupIdea } from '../../types/index.ts';
import { TabId } from '../SidebarNavigation.tsx';

interface IdeaIntakeViewProps {
  currentIdea: StartupIdea | null;
  onDeconstruct: () => void;
  onSubmitNewIdea: (title: string, rawPitch: string, stage: string) => void;
  isLoading: boolean;
  isSubmittingNew?: boolean;
  onToggleSubmitNew?: (open: boolean) => void;
  onNavigateTab?: (tab: TabId) => void;
  onOpenApiKeyModal?: () => void;
  validationError?: IdeaValidationResult | null;
  onDismissValidationError?: () => void;
}

export const IdeaIntakeView: React.FC<IdeaIntakeViewProps> = ({
  currentIdea,
  onDeconstruct,
  onSubmitNewIdea,
  isLoading,
  isSubmittingNew: externalIsSubmitting,
  onToggleSubmitNew,
  onNavigateTab,
  validationError,
  onDismissValidationError,
}) => {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(!currentIdea);
  const isSubmittingNew =
    externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

  const setIsSubmittingNew = (open: boolean) => {
    if (onToggleSubmitNew) onToggleSubmitNew(open);
    setInternalIsSubmitting(open);
  };

  const [title, setTitle] = useState(currentIdea?.title || '');
  const [stage, setStage] = useState<StartupIdea['stage']>(currentIdea?.stage || 'CONCEPT');
  const [rawPitch, setRawPitch] = useState(currentIdea?.rawPitch || '');

  // Validation & Red Vibration States
  const [nameError, setNameError] = useState<boolean>(false);
  const [pitchError, setPitchError] = useState<boolean>(false);
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Keep state updated if idea changes
  useEffect(() => {
    if (currentIdea) {
      setTitle(currentIdea.title);
      setRawPitch(currentIdea.rawPitch);
      if (currentIdea.stage) setStage(currentIdea.stage);
    }
  }, [currentIdea]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let finalTitle = title.trim();
    let finalPitch = rawPitch.trim();

    // Auto-derive Startup Name if user typed the pitch but omitted the name input
    if (!finalTitle && finalPitch) {
      const words = finalPitch.split(/\s+/).slice(0, 4).join(' ');
      finalTitle = words.length > 3
        ? words.charAt(0).toUpperCase() + words.slice(1)
        : 'New Startup Venture';
      setTitle(finalTitle);
    }

    // Auto-derive pitch description if user typed only the startup name
    if (!finalPitch && finalTitle) {
      finalPitch = `${finalTitle} - An innovative venture solving key market challenges and scaling operational efficiency.`;
      setRawPitch(finalPitch);
    }

    if (!finalTitle && !finalPitch) {
      setNameError(true);
      setPitchError(true);
      setIsVibrating(true);
      if (titleInputRef.current) titleInputRef.current.focus();
      setTimeout(() => setIsVibrating(false), 550);
      return;
    }

    setNameError(false);
    setPitchError(false);
    onSubmitNewIdea(finalTitle, finalPitch, stage);
  };

  const handleApplySampleIdea = () => {
    setTitle('MedFlow AI');
    setRawPitch(
      'An intelligent emergency department triage and queue orchestration platform that predicts patient wait times and optimizes ER bed allocation to cut wait times by 40%.'
    );
    setStage('EARLY_MVP');
    setNameError(false);
    setPitchError(false);
    if (onDismissValidationError) {
      onDismissValidationError();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // If submitting a new idea (or no idea loaded yet), render the Pristine Chat Intake Page
  if (isSubmittingNew || !currentIdea) {
    return (
      <div className="min-h-[76vh] flex flex-col items-center justify-center px-4 py-8 select-none font-sans">
        <div className="w-full max-w-2xl sm:max-w-3xl flex flex-col items-center">
          
          {/* 1. Floating 3D Iridescent Holographic Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center mb-6 sm:mb-7"
          >
            {/* Ambient soft glow halo */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-[#60a5fa] via-[#a78bfa] to-[#f472b6] blur-2xl opacity-40 animate-pulse pointer-events-none" />

            {/* 3D Iridescent Pearl Sphere */}
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_12px_24px_rgba(99,102,241,0.25)] transform transition-transform hover:scale-105 duration-300"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="orbBase" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#e0e7ff" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#bfdbfe" stopOpacity="0.75" />
                  <stop offset="75%" stopColor="#c4b5fd" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.9" />
                </radialGradient>
                <radialGradient id="orbReflection" cx="65%" cy="75%" r="60%">
                  <stop offset="0%" stopColor="#f472b6" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="specularGleam" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="url(#orbBase)" />
              <circle cx="50" cy="50" r="44" fill="url(#orbReflection)" />
              <ellipse
                cx="38"
                cy="30"
                rx="14"
                ry="8"
                fill="url(#specularGleam)"
                transform="rotate(-25 38 30)"
              />
              <path
                d="M26 66 C 30 76, 44 86, 62 86 C 74 86, 82 80, 84 72"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          {/* 2. Exact Typography Headings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-1 mb-7 sm:mb-9"
          >
            <h1 className="text-2xl sm:text-4xl font-semibold text-[#1e2532] tracking-tight font-['Outfit',sans-serif]">
              Good Morning! Got an idea?
            </h1>
            <p className="text-xl sm:text-3xl font-semibold text-[#1e2532] tracking-tight font-['Outfit',sans-serif]">
              Let's see if it's{' '}
              <span className="bg-gradient-to-r from-[#4f75fe] via-[#6366f1] to-[#8057db] bg-clip-text text-transparent">
                actually a good one.
              </span>
            </p>
          </motion.div>

          {/* Idea Reality & Feasibility Gate Alert Banner */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full mb-6 rounded-2xl border border-rose-200/90 bg-gradient-to-br from-rose-50/95 via-white to-amber-50/60 p-5 sm:p-6 shadow-[0_12px_36px_rgba(225,29,72,0.08)] backdrop-blur-xl relative overflow-hidden"
              >
                {/* Accent glow corner */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-rose-400/10 to-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between gap-4 relative">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          {validationError.category === 'PHYSICALLY_IMPOSSIBLE'
                            ? 'Physically Impossible Concept'
                            : validationError.category === 'GIBBERISH'
                            ? 'Gibberish / Non-Word Input'
                            : validationError.category === 'NON_STARTUP'
                            ? 'Non-Venture Input'
                            : validationError.category === 'INSUFFICIENT_DETAIL'
                            ? 'Insufficient Pitch Detail'
                            : 'Reality Validation Gate Failed'}
                        </span>
                        <span className="text-xs text-rose-700/80 font-medium">
                          Analysis Aborted to Protect Pipeline Integrity
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-[#1e2532] tracking-tight font-['Outfit',sans-serif]">
                        Idea Reality & Feasibility Check: Not Approved
                      </h3>

                      <p className="text-sm text-[#475569] leading-relaxed font-sans">
                        {validationError.reason}
                      </p>

                      {validationError.suggestion && (
                        <div className="flex items-start gap-2 pt-1 text-xs sm:text-sm text-[#334155] bg-white/70 border border-rose-100 rounded-xl p-3">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            <strong className="font-semibold text-[#1e2532]">Recommendation:</strong>{' '}
                            {validationError.suggestion}
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center flex-wrap gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onDismissValidationError) onDismissValidationError();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-[#eaedf6] text-xs font-semibold text-[#1e2532] hover:bg-[#f8fafc] hover:border-[#cbd5e1] shadow-xs transition-all cursor-pointer"
                        >
                          Revise Pitch
                        </button>
                        <button
                          type="button"
                          onClick={handleApplySampleIdea}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#4f75fe] to-[#6366f1] text-white text-xs font-semibold hover:opacity-95 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Load Sample Feasible Startup Idea</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dismiss X button */}
                  {onDismissValidationError && (
                    <button
                      type="button"
                      onClick={onDismissValidationError}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 transition-colors cursor-pointer"
                      title="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Floating Minimalist Chat Box Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white/95 backdrop-blur-xl rounded-[24px] border border-[#eaedf6] shadow-[0_16px_45px_rgba(31,31,71,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5 transition-all duration-300 focus-within:shadow-[0_20px_50px_rgba(79,117,254,0.12)] focus-within:border-[#c7d2fe]"
            >
              {/* Top Textarea Area with Leading Sparkle Icon */}
              <div className="flex items-start gap-3">
                <div className="mt-1 text-[#4f75fe] shrink-0">
                  <Sparkles className="w-4 h-4 text-[#4f75fe]" />
                </div>

                <div className="w-full">
                  <textarea
                    value={rawPitch}
                    onChange={(e) => {
                      setRawPitch(e.target.value);
                      if (pitchError && e.target.value.trim()) setPitchError(false);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Initiate a query or send a command to the AI..."
                    rows={3}
                    disabled={isLoading}
                    className={`w-full bg-transparent resize-none outline-none text-[#1e2532] text-sm sm:text-base placeholder-[#94a3b8] leading-relaxed font-sans min-h-[72px] sm:min-h-[84px] disabled:opacity-50 ${
                      pitchError ? 'placeholder-red-400' : ''
                    }`}
                  />
                  {pitchError && (
                    <span className="text-xs text-red-500 font-medium block mt-1">
                      Please enter your startup problem or pitch query.
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Attachment, Startup Name Pill, Stage Dropdown, & Glowing Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 mt-2 border-t border-[#f1f4f9]">
                
                {/* Left Group: Attachment, Mandatory Startup Name, Stage Dropdown */}
                <div className="flex items-center flex-wrap gap-2">
                  
                  {/* Paperclip Button */}
                  <button
                    type="button"
                    title="Attach pitch deck or notes"
                    className="p-2 rounded-xl text-[#94a3b8] hover:text-[#4f75fe] hover:bg-[#f8fafc] border border-transparent hover:border-[#eaedf6] transition-all shrink-0 cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Mandatory Startup Name Input Pill with Red Vibration Shake */}
                  <motion.div
                    animate={
                      isVibrating
                        ? {
                            x: [-14, 14, -12, 12, -8, 8, -4, 4, 0],
                            boxShadow: [
                              '0 0 0 2px rgba(239, 68, 68, 0.4)',
                              '0 0 0 4px rgba(239, 68, 68, 0.6)',
                              '0 0 0 2px rgba(239, 68, 68, 0.3)',
                              '0 0 0 0px rgba(239, 68, 68, 0)',
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                      nameError
                        ? 'border-red-500 bg-red-50/90 text-red-900 ring-2 ring-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                        : 'bg-[#f8fafc] border-[#eaedf6] focus-within:border-[#4f75fe] focus-within:bg-white focus-within:shadow-xs'
                    }`}
                  >
                    <Building2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        nameError ? 'text-red-500 animate-pulse' : 'text-[#64748b]'
                      }`}
                    />
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (nameError && e.target.value.trim()) setNameError(false);
                      }}
                      placeholder="Startup name (Mandatory)..."
                      disabled={isLoading}
                      className={`bg-transparent outline-none w-32 sm:w-44 text-xs font-medium placeholder-[#94a3b8] disabled:opacity-50 ${
                        nameError
                          ? 'text-red-900 placeholder-red-400 font-semibold'
                          : 'text-[#1e2532]'
                      }`}
                    />
                  </motion.div>

                  {/* Current Stage Select Dropdown Pill */}
                  <div className="relative flex items-center px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#eaedf6] focus-within:border-[#4f75fe] focus-within:bg-white focus-within:shadow-xs transition-all">
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as StartupIdea['stage'])}
                      disabled={isLoading}
                      className="bg-transparent outline-none cursor-pointer text-xs font-medium text-[#1e2532] pr-4 appearance-none disabled:opacity-50"
                    >
                      <option value="CONCEPT">Idea / Concept</option>
                      <option value="EARLY_MVP">MVP / Prototype</option>
                      <option value="GROWTH">Seed / Scaling</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-[#94a3b8] absolute right-2 pointer-events-none" />
                  </div>
                </div>

                {/* Right: Glowing Send Button */}
                <div className="flex items-center justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4f75fe] to-[#7c3aed] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(79,117,254,0.35)] transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none shrink-0 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Toggle back to existing report if available */}
          {currentIdea && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex items-center gap-2 text-xs text-[#6c7693]"
            >
              <span>Currently active evaluation:</span>
              <button
                type="button"
                onClick={() => setIsSubmittingNew(false)}
                className="font-semibold text-[#4f75fe] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Back to {currentIdea.title} Report</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // 2. Executive Report Page for the Submitted Startup Idea
  return (
    <div className="space-y-6 w-full mx-auto font-sans pb-10">
      
      {/* Top Executive Header Card with Readiness Score */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-7 shadow-[0_4px_20px_rgba(31,31,71,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1f1f47] tracking-tight font-['Outfit',sans-serif]">
            {currentIdea.title}
          </h1>
          <p className="text-sm sm:text-base text-[#6c7693] max-w-3xl font-normal leading-relaxed">
            {currentIdea.tagline ||
              'Deconstructs startup problems, audits 6-pillar venture gaps, and ranks solutions using live Gemini reasoning.'}
          </p>
        </div>

        {/* Readiness Meter & Action Buttons */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Circular Score Badge */}
          <div className="flex items-center gap-3 bg-[#f9f9fb] border border-[#eaedf6] px-4 py-3 rounded-2xl">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#eaedf6]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#576cdb]"
                  strokeDasharray={`${currentIdea.overallReadinessScore || 65}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold font-mono text-[#1f1f47]">
                {currentIdea.overallReadinessScore}%
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#84849a] block font-mono">
                Readiness Score
              </span>
              <span className="text-xs text-[#059669] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Venture Audited
              </span>
            </div>
          </div>

          {/* New Pitch Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsSubmittingNew(true)}
            className="px-5 py-3 rounded-xl bg-[#576cdb] hover:bg-[#485bc7] text-white font-medium text-xs sm:text-sm shadow-[0_4px_14px_rgba(87,108,219,0.25)] transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Pitch</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Raw Pitch Statement Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-[0_2px_12px_rgba(31,31,71,0.02)] space-y-3"
      >
        <div className="flex items-center justify-between border-b border-[#f1f4f9] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6c7693] uppercase font-mono tracking-wider">
            <Building2 className="w-4 h-4 text-[#576cdb]" />
            <span>Executive Pitch Statement</span>
          </div>
          <span className="text-xs text-[#84849a] font-mono">
            Version {currentIdea.currentVersion || 1}.0
          </span>
        </div>

        <p className="text-sm sm:text-base text-[#1e2532] leading-relaxed italic bg-[#f9f9fb] p-4 rounded-xl border border-[#eaedf6]">
          "{currentIdea.rawPitch}"
        </p>
      </motion.div>

      {/* Core Diagnostic Navigation Grid (Pipelines to Deep Modules) */}
      <div className="space-y-3">
        <h2 className="text-xs sm:text-sm font-bold text-[#1f1f47] uppercase font-mono tracking-wider">
          Venture Diagnostic Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. Problem Decomposition */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.05)' }}
            onClick={() => onNavigateTab ? onNavigateTab('decomposition') : onDeconstruct()}
            className="bg-white rounded-2xl border border-[#eaedf6] p-5 shadow-xs hover:border-[#c7d2fe] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#dce7fe] text-[#3b5998] flex items-center justify-center">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1e2532] font-['Outfit',sans-serif]">
                Problem Decomposition & DAG
              </h3>
              <p className="text-xs text-[#6c7693] leading-relaxed">
                Separates symptoms from root causes using graph network centrality.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-xs font-semibold text-[#576cdb]">
              <span>{currentIdea.problems?.length || 0} Problems Mapped</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* 2. 6-Pillar Gap Audit */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.05)' }}
            onClick={() => onNavigateTab && onNavigateTab('gaps')}
            className="bg-white rounded-2xl border border-[#eaedf6] p-5 shadow-xs hover:border-[#c7d2fe] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1e2532] font-['Outfit',sans-serif]">
                6-Pillar Venture Gap Audit
              </h3>
              <p className="text-xs text-[#6c7693] leading-relaxed">
                Identifies fatal flaws and critical vulnerabilities across TAM, Tech, Economics, and Moat.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-xs font-semibold text-[#dc2626]">
              <span>{currentIdea.gaps?.length || 0} Gaps Audited</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* 3. TOPSIS Solution Studio */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.05)' }}
            onClick={() => onNavigateTab && onNavigateTab('topsis')}
            className="bg-white rounded-2xl border border-[#eaedf6] p-5 shadow-xs hover:border-[#c7d2fe] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1e2532] font-['Outfit',sans-serif]">
                TOPSIS Ranked Solutions
              </h3>
              <p className="text-xs text-[#6c7693] leading-relaxed">
                Multi-criteria mathematical decision ranking against ideal best and worst solutions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-xs font-semibold text-[#b45309]">
              <span>{currentIdea.solutions?.length || 0} Strategies Ranked</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* 4. Adaptive Stress-Testing */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.05)' }}
            onClick={() => onNavigateTab && onNavigateTab('questions')}
            className="bg-white rounded-2xl border border-[#eaedf6] p-5 shadow-xs hover:border-[#c7d2fe] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1e2532] font-['Outfit',sans-serif]">
                Adaptive Questioning
              </h3>
              <p className="text-xs text-[#6c7693] leading-relaxed">
                Information-theoretic inquiry to validate founder assumptions and resolve risk.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-xs font-semibold text-[#059669]">
              <span>Start Stress-Test</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* 5. 6-Agent Evaluation Council */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.05)' }}
            onClick={() => onNavigateTab && onNavigateTab('agents')}
            className="bg-white rounded-2xl border border-[#eaedf6] p-5 shadow-xs hover:border-[#c7d2fe] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#ede9fe] text-[#6d28d9] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1e2532] font-['Outfit',sans-serif]">
                Evaluation Council (6 Judges)
              </h3>
              <p className="text-xs text-[#6c7693] leading-relaxed">
                1-on-1 persona chats with VC, Customer, CTO, Lawyer, CFO, and Product Builder.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-xs font-semibold text-[#6d28d9]">
              <span>6 Personas Ready</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* 6. Pitch Deck Export */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.05)' }}
            onClick={() => onNavigateTab && onNavigateTab('deck')}
            className="bg-white rounded-2xl border border-[#eaedf6] p-5 shadow-xs hover:border-[#c7d2fe] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#e0e7ff] text-[#4338ca] flex items-center justify-center">
                <Presentation className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1e2532] font-['Outfit',sans-serif]">
                Pitch Deck Generator
              </h3>
              <p className="text-xs text-[#6c7693] leading-relaxed">
                12-slide native PowerPoint (.pptx) pitch deck export with themes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-xs font-semibold text-[#4338ca]">
              <span>Export Presentation</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
