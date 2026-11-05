/**
 * Pitch Deck Generator & Real PPTX Export View
 * Slide-by-slide deck preview with customizable master themes and native .pptx export.
 */

import React, { useState } from 'react';
import {
  Presentation,
  FileDown,
  Sparkles,
  RefreshCw,
  Palette,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StartupIdea } from '../../types/index.ts';
import { DeckThemeName } from '../../server/pptxGenerator.ts';

interface PitchDeckExportViewProps {
  idea: StartupIdea;
  onGenerateDeck: () => void;
  onExportPptx: (theme: DeckThemeName) => void;
  isLoading: boolean;
  isExporting: boolean;
}

export const PitchDeckExportView: React.FC<PitchDeckExportViewProps> = ({
  idea,
  onGenerateDeck,
  onExportPptx,
  isLoading,
  isExporting,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<DeckThemeName>('MODERN_LIGHT');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = idea.pitchDeck || [];
  const activeSlide = slides[currentSlideIndex] || slides[0] || null;

  const themes: Array<{ id: DeckThemeName; name: string }> = [
    { id: 'MODERN_LIGHT', name: 'Clean Light Enterprise' },
    { id: 'VENTURE_NAVY', name: 'Venture Navy' },
    { id: 'EXECUTIVE_DARK', name: 'Executive Slate' },
    { id: 'MINIMAL_INDIGO', name: 'Obsidian Purple' },
  ];

  return (
    <div className="space-y-6 w-full mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] dark:border-[#1e2332] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#c1c9f6] dark:bg-[#576cdb]/20 flex items-center justify-center text-[#38489e] dark:text-[#576cdb]">
              <Presentation className="h-5 w-5" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-[#1f1f47] dark:text-white tracking-tight font-sans">
              Investor Pitch Deck
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#5e6573] dark:text-[#84849a] mt-1 font-normal leading-relaxed">
            10-slide deck exportable directly to native Microsoft PowerPoint (.pptx).
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onGenerateDeck}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1a1d29] hover:bg-slate-50 dark:hover:bg-[#202538] border border-[#eaedf6] dark:border-[#2a2f42] text-xs sm:text-sm font-semibold text-[#1f1f47] dark:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-[#576cdb]" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#576cdb]" />
                <span>Regenerate Slides</span>
              </>
            )}
          </button>

          <button
            onClick={() => onExportPptx(selectedTheme)}
            disabled={isExporting || slides.length === 0}
            className="px-6 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#485bc7] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            <span>{isExporting ? 'Compiling PPTX...' : 'Download PPTX'}</span>
          </button>
        </div>
      </div>

      {/* Theme Selector Console */}
      <div className="rounded-2xl bg-white dark:bg-[#171a24] border border-[#eaedf6] dark:border-[#1e2332] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(73,46,107,0.03)]">
        <div className="flex items-center gap-2.5 text-sm sm:text-base text-[#1f1f47] dark:text-white font-semibold">
          <Palette className="h-5 w-5 text-[#576cdb]" />
          <span>PowerPoint Theme:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                selectedTheme === theme.id
                  ? 'bg-[#576cdb] text-white border-[#576cdb] shadow-sm'
                  : 'bg-white dark:bg-[#1f2433] text-[#5e6573] dark:text-[#84849a] border-[#eaedf6] dark:border-[#2a2f42] hover:text-[#1f1f47] dark:hover:text-white'
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Slide Presentation Preview */}
      {activeSlide && (
        <div className="rounded-2xl bg-white border border-[#eaedf6] p-6 sm:p-8 space-y-6 shadow-[0_4px_20px_rgba(73,46,107,0.05)]">
          {/* Slide Chrome Header */}
          <div className="flex items-center justify-between border-b border-[#f1f3f9] pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#c1c9f6]/40 text-[#2f3e8f] border border-[#a5b2f2]">
                Slide {activeSlide.slideNumber} of {slides.length} • {activeSlide.slideType.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Slide Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="w-8 h-8 rounded-full border border-[#eaedf6] bg-white hover:bg-[#f9f9fb] flex items-center justify-center text-[#1f1f47] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono font-bold text-[#1f1f47] px-1">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <button
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="w-8 h-8 rounded-full border border-[#eaedf6] bg-white hover:bg-[#f9f9fb] flex items-center justify-center text-[#1f1f47] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Slide Canvas Body */}
          <div className="space-y-4 min-h-[280px]">
            <div>
              <h3 className="text-2xl sm:text-3xl font-medium text-[#1f1f47] tracking-[-0.025em]">
                {activeSlide.title}
              </h3>
              {activeSlide.subtitle && (
                <p className="text-sm text-[#5e6573] mt-1 italic font-medium">
                  "{activeSlide.subtitle}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Left / Bullets Container */}
              <div className="md:col-span-2 space-y-3 p-5 rounded-2xl bg-[#f9f9fb] border border-[#eaedf6]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#576cdb] font-mono block">
                  Core Argument
                </span>
                <ul className="space-y-3">
                  {activeSlide.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#171a1c] leading-relaxed">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#576cdb] mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right / Metric Callout Card */}
              <div className="space-y-4">
                {activeSlide.metricCallout && (
                  <div className="p-5 rounded-2xl bg-[#f8f9ff] border border-[#e0e7ff] text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c8397] font-mono block">
                      {activeSlide.metricCallout.label}
                    </span>
                    <span className="text-3xl font-black font-mono text-[#576cdb] block tracking-tight">
                      {activeSlide.metricCallout.value}
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-[#f9f9fb] border border-[#eaedf6] space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c8397] font-mono block">
                    Venture Context
                  </span>
                  <p className="text-[#5e6573] text-[11px]">
                    {activeSlide.citation
                      ? `Source: ${activeSlide.citation}`
                      : `Audited Readiness: ${idea.overallReadinessScore}/100 • ${idea.stage}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide Thumbnails Rail */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#7c8397] uppercase tracking-wider block font-mono">
          Slide Navigation ({slides.length} Slides)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {slides.map((s, idx) => (
            <button
              key={s.slideNumber}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                currentSlideIndex === idx
                  ? 'bg-[#f8f9ff] border-[#576cdb] shadow-sm'
                  : 'bg-white border-[#eaedf6] text-[#5e6573] hover:text-[#1f1f47] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-[#1f1f47]">Slide {s.slideNumber}</span>
                <span className="text-[#7c8397]">{s.slideType}</span>
              </div>
              <div className="text-xs font-semibold truncate text-[#1f1f47]">{s.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
