/**
 * Top Navigation & Brand Header - RevenueCat Style
 * White navbar, periwinkle signal pills, deep indigo typography
 */

import React from 'react';
import {
  Layers,
  Code2,
  FileDown,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { StartupIdea } from '../types/index.ts';

interface HeaderProps {
  currentIdea: StartupIdea | null;
  ideas: Array<{ id: string; title: string; overallReadinessScore: number }>;
  onSelectIdea: (id: string) => void;
  onOpenNewIdea: () => void;
  onOpenAlgorithmsModal: () => void;
  onOpenApiKeyModal: () => void;
  onExportPptx: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentIdea,
  ideas,
  onSelectIdea,
  onOpenNewIdea,
  onOpenAlgorithmsModal,
  onOpenApiKeyModal,
  onExportPptx,
  isExporting,
}) => {
  const readiness = currentIdea?.overallReadinessScore || 0;

  const getScoreBadge = (score: number) => {
    if (score >= 70) {
      return {
        label: 'Venture Ready',
        bg: 'bg-[#c1f6e0] text-[#1f1f47] border-[#a6f2d2]',
        icon: CheckCircle2,
      };
    }
    if (score >= 50) {
      return {
        label: 'De-risking',
        bg: 'bg-[#d6dbf5] text-[#1f1f47] border-[#c1c9f6]',
        icon: Sparkles,
      };
    }
    return {
      label: 'Gaps Detected',
      bg: 'bg-[#f7d4d4] text-[#1f1f47] border-[#f25a5a]/30',
      icon: AlertTriangle,
    };
  };

  const badge = getScoreBadge(readiness);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#eaedf6] bg-white/95 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-[#576cdb] flex items-center justify-center shadow-[0_3px_12px_rgba(87,108,219,0.25)]">
            <Layers className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-[#1f1f47] tracking-tight">
              Pitch-Ready
            </span>
            <span className="text-[11px] font-semibold tracking-wide text-[#6c7693] uppercase font-mono">
              Engine
            </span>
          </div>
        </div>

        {/* Center / Idea Selector */}
        <div className="flex items-center gap-2">
          {ideas.length > 0 && (
            <div className="relative group">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#eaedf6] hover:border-[#d1d6e1] text-xs font-medium text-[#1f1f47] cursor-pointer shadow-sm transition-colors">
                <Lightbulb className="h-3.5 w-3.5 text-[#576cdb]" />
                <span className="max-w-[160px] sm:max-w-[240px] truncate">
                  {currentIdea?.title || 'Select Idea'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[#6c7693] group-hover:rotate-180 transition-transform" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-[#eaedf6] shadow-[rgba(73,46,107,0.12)_0px_8px_24px] p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="px-2.5 py-1 text-[11px] font-bold text-[#6c7693] uppercase tracking-wider">
                  Select Project
                </div>
                {ideas.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectIdea(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentIdea?.id === item.id
                        ? 'bg-[#d6dbf5]/50 text-[#1f1f47] font-semibold'
                        : 'text-[#3d3d5c] hover:bg-[#f9f9fb]'
                    }`}
                  >
                    <span className="truncate pr-2">{item.title}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#f9f9fb] text-[#1f1f47] border border-[#eaedf6]">
                      {item.overallReadinessScore}%
                    </span>
                  </button>
                ))}
                <div className="border-t border-[#eaedf6] mt-1 pt-1">
                  <button
                    onClick={onOpenNewIdea}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#576cdb] hover:bg-[#d6dbf5]/30 font-semibold flex items-center gap-1.5"
                  >
                    + Submit New Startup Idea
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Readiness Score Pill */}
          {currentIdea && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
            >
              <BadgeIcon className="h-3.5 w-3.5" />
              <span>{readiness}%</span>
              <span className="text-[11px] font-normal opacity-90">({badge.label})</span>
            </div>
          )}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5">
          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            title="Configure Gemini API Key"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#f9f9fb] border border-[#eaedf6] text-xs font-medium text-[#3d3d5c] hover:text-[#1f1f47] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          {/* Inspect Math Modal */}
          <button
            onClick={onOpenAlgorithmsModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f9f9fb] border border-[#eaedf6] text-xs font-medium text-[#3d3d5c] hover:text-[#1f1f47] transition-colors"
          >
            <Code2 className="h-3.5 w-3.5 text-[#576cdb]" />
            <span className="hidden sm:inline">Inspect Math</span>
          </button>

          {/* Export PPTX Pill Button */}
          <button
            onClick={onExportPptx}
            disabled={isExporting || !currentIdea}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-xs font-medium shadow-[0_2px_8px_rgba(87,108,219,0.25)] transition-all disabled:opacity-50"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export PPTX'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
