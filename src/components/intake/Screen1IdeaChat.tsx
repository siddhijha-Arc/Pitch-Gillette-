import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb, Compass, AlertCircle, Loader2 } from 'lucide-react';

interface Screen1IdeaChatProps {
  onAnalyze: (ideaText: string) => Promise<void>;
  isLoading: boolean;
  loadingStepText: string;
}

const SAMPLE_IDEAS = [
  'Hello HR: AI mock interview coach for college students, Rs 149/month',
  'MediScan: WhatsApp bot for rural doctors to detect diabetic retinopathy from phone photos',
  'FleetFlow: B2B SaaS route planner for EV delivery fleets with dynamic battery charging stops',
];

export const Screen1IdeaChat: React.FC<Screen1IdeaChatProps> = ({
  onAnalyze,
  isLoading,
  loadingStepText,
}) => {
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setValidationError('Please type your startup idea above.');
      return;
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 4) {
      setValidationError('Please share a few more words (e.g., target customer, product, or price) so our engine can analyse it.');
      return;
    }

    setValidationError(null);
    onAnalyze(trimmed);
  };

  const handleSelectSample = (sample: string) => {
    setInputText(sample);
    setValidationError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eaedf6] text-[#1f1f47] text-xs font-semibold mb-4 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#576cdb]" />
          Idea Intake & Diagnostic Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#1f1f47] mb-3">
          Tell us your startup idea in plain English
        </h1>
        <p className="text-sm sm:text-base text-[#575775] max-w-lg mx-auto">
          No rigid forms. Mention your idea, customer, price, or anything you have in mind. Our engine decomposes it and identifies the highest-impact questions.
        </p>
      </div>

      {/* Single Chat Box */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#eaedf6] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-7 transition-all duration-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Hello HR: AI mock interview coach for college students, Rs 149/month..."
              rows={4}
              disabled={isLoading}
              className="w-full p-4 rounded-xl bg-[#f9f9fb] border border-[#d1d6e1] text-[#171a1c] placeholder:text-[#84849a] focus:bg-[#ffffff] focus:border-[#576cdb] focus:ring-3 focus:ring-[#576cdb]/15 outline-none resize-none text-base transition duration-150 leading-relaxed disabled:opacity-50"
            />
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#f25a5a] bg-[#f7d4d4]/40 px-3.5 py-2.5 rounded-lg border border-[#f7d4d4]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="p-4 rounded-xl bg-[#eaedf6]/50 border border-[#eaedf6] text-center space-y-2">
              <div className="flex items-center justify-center gap-2.5 text-[#1f1f47] font-medium text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#576cdb]" />
                <span>{loadingStepText || 'Analyzing business model & gaps...'}</span>
              </div>
              <p className="text-xs text-[#575775]">
                Decomposing customer, pricing, unit economics, and simulating question value...
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-[#6c7693] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#576cdb]" />
                <span>Simulates questions deterministically via option variance</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#576cdb] hover:bg-[#4b5ec4] text-white font-medium text-sm transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Analyse</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Quick Test Prompt Shortcuts */}
      <div className="mt-8">
        <div className="flex items-center gap-2 text-xs font-medium text-[#575775] mb-2.5">
          <Lightbulb className="w-3.5 h-3.5 text-[#576cdb]" />
          <span>Or test with a 1-click example:</span>
        </div>
        <div className="flex flex-col gap-2">
          {SAMPLE_IDEAS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectSample(sample)}
              className="text-left px-3.5 py-2.5 rounded-xl bg-[#ffffff] hover:bg-[#eaedf6]/60 border border-[#eaedf6] text-xs sm:text-sm text-[#3d3d5c] hover:text-[#1f1f47] transition duration-150 flex items-center justify-between group disabled:opacity-50"
            >
              <span className="truncate pr-2 font-normal">
                {idx === 0 ? <strong className="font-semibold text-[#1f1f47]">[Required Benchmark] </strong> : null}
                {sample}
              </span>
              <span className="text-xs text-[#576cdb] opacity-0 group-hover:opacity-100 transition shrink-0">
                Load
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
