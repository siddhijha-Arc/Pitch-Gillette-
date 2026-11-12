/**
 * EvaluationProgressBar Component
 * Displays a live, animated multi-step progress bar during AI startup evaluation.
 * Locks navigation and informs the user of active evaluation steps.
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Brain,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  HelpCircle,
} from 'lucide-react';

export interface EvaluationStepInfo {
  percent: number;
  message: string;
  submessage: string;
  currentStepIndex: number;
}

interface EvaluationProgressBarProps {
  progress: EvaluationStepInfo;
}

const STEPS = [
  { id: 1, label: 'Pitch Intake', icon: Brain },
  { id: 2, label: 'Problem DAG', icon: Sparkles },
  { id: 3, label: '6-Pillar Gaps', icon: ShieldAlert },
  { id: 4, label: 'Best Solutions', icon: SlidersHorizontal },
  { id: 5, label: 'Agent Council', icon: Users },
  { id: 6, label: 'Adaptive Q&A', icon: HelpCircle },
];

export const EvaluationProgressBar: React.FC<EvaluationProgressBarProps> = ({ progress }) => {
  const currentStep = Math.min(Math.max(progress.currentStepIndex || 1, 1), 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full bg-gradient-to-r from-[#1f1f47] via-[#2a2a5e] to-[#1f1f47] text-white border-b border-[#576cdb]/30 shadow-xl relative z-30 font-['Plus_Jakarta_Sans',sans-serif] select-none"
    >
      <div className="w-full px-5 sm:px-8 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left Info: Active Step Title & Submessage */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="relative w-10 h-10 rounded-2xl bg-[#576cdb] flex items-center justify-center text-white shadow-[0_0_15px_rgba(87,108,219,0.5)] shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#a5b4fc]">
                LIVE AI VENTURE AUDIT
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0e7ff]/20 text-white border border-white/20 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#fca5a5]" />
                Navigation Locked
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
              {progress.message}
            </h3>

            <p className="text-xs text-white/70 hidden sm:block">
              {progress.submessage}
            </p>
          </div>
        </div>

        {/* Center: Live Progress Bar & Percentage */}
        <div className="flex-1 max-w-md mx-2">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-white/80">Step {currentStep} of 6</span>
            <span className="text-[#a5b4fc] font-mono font-bold">{Math.round(progress.percent)}%</span>
          </div>

          {/* Animated Progress Bar Track */}
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#576cdb] via-[#818cf8] to-[#6366f1] rounded-full shadow-[0_0_12px_rgba(129,140,248,0.8)] relative overflow-hidden"
            >
              {/* Shimmer stripe animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </motion.div>
          </div>
        </div>

        {/* Right: Step Indicator Pills (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          {STEPS.map((step) => {
            const isDone = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                  isDone
                    ? 'bg-[#059669]/20 text-[#34d399] border border-[#059669]/40'
                    : isCurrent
                    ? 'bg-[#576cdb] text-white shadow-xs border border-white/40 ring-2 ring-white/20'
                    : 'bg-white/5 text-white/40 border border-white/5'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-[#34d399]" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
};
