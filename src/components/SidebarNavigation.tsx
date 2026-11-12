/**
 * Sidebar Navigation Drawer - Exact Reference Replica
 * Recreated to match user attachment:
 * - Royal Blue background using current palette (#576cdb)
 * - Distinctive rounded top-right corner (rounded-tr-[44px])
 * - Top Action Button: "Upload New Pitch" inside a pristine white pill button
 * - Menu items with crisp white outline icons and typography
 * - Bottom "VENTURE DETAILS" metrics section matching "STORAGE DETAILS" with dual progress lines and diagonal arrow link
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  GitFork,
  ShieldAlert,
  SlidersHorizontal,
  HelpCircle,
  Users,
  GitCompare,
  Presentation,
  ShieldCheck,
  Award,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Plus,
} from 'lucide-react';
import { StartupIdea } from '../types/index.ts';

export type TabId =
  | 'intake'
  | 'decomposition'
  | 'gaps'
  | 'topsis'
  | 'questions'
  | 'agents'
  | 'improvement'
  | 'deck';

interface SidebarNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  idea: StartupIdea | null;
  onOpenAlgorithmsModal: () => void;
  onOpenApiKeyModal: () => void;
  onExportPptx: () => void;
  isExporting: boolean;
  onOpenNewIdea: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isDisabled?: boolean;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onTabChange,
  idea,
  onOpenAlgorithmsModal,
  onExportPptx,
  isExporting,
  onOpenNewIdea,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  isDisabled = false,
}) => {
  const unresolvedQuestions = idea?.questions?.filter((q) => !q.isAnswered).length || 0;
  const fatalGaps = idea?.gaps?.filter((g) => g.severity === 'FATAL_FLAW').length || 0;
  const rootCausesCount = idea?.problems?.filter((p) => p.isRootCause).length || 0;
  const readiness = idea?.overallReadinessScore || 0;

  const navItems: Array<{
    id: TabId;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = [
    {
      id: 'intake',
      label: 'Idea Intake',
      icon: FileText,
    },
    {
      id: 'decomposition',
      label: 'Problem DAG',
      icon: GitFork,
      badge: rootCausesCount > 0 ? `${rootCausesCount}` : undefined,
    },
    {
      id: 'gaps',
      label: '6-Pillar Gaps',
      icon: ShieldAlert,
      badge: fatalGaps > 0 ? `${fatalGaps} Fatal` : idea?.gaps?.length || undefined,
    },
    {
      id: 'topsis',
      label: 'Best Solutions',
      icon: SlidersHorizontal,
      badge: idea?.solutions ? `${idea.solutions.length}` : undefined,
    },
    {
      id: 'questions',
      label: 'Adaptive Q&A',
      icon: HelpCircle,
      badge: unresolvedQuestions > 0 ? `${unresolvedQuestions}` : undefined,
    },
    {
      id: 'agents',
      label: 'Agent Council',
      icon: Users,
      badge: idea?.agentCritiques ? `${idea.agentCritiques.length}` : '6',
    },
    {
      id: 'improvement',
      label: 'Pitch V2 Diff',
      icon: GitCompare,
      badge: `V${idea?.currentVersion || 1}`,
    },
    {
      id: 'deck',
      label: 'Pitch Deck',
      icon: Presentation,
      badge: idea?.pitchDeck ? `${idea.pitchDeck.length} S` : undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Blue Sidebar Drawer */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 md:z-20 flex flex-col bg-gradient-to-b from-[#576cdb] via-[#4f64d8] to-[#4357c9] text-white transition-all duration-300 select-none shadow-[4px_0_24px_rgba(87,108,219,0.18)] ${
          isCollapsed ? 'w-20' : 'w-64 sm:w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        rounded-tr-[44px] shrink-0 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden`}
      >
        {/* Top Header inside Drawer: Collapse button & Mobile Close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {!isCollapsed ? (
            <span className="text-[11px] font-bold tracking-widest uppercase text-white/70">
              Navigation
            </span>
          ) : (
            <div className="w-full text-center" />
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 hidden md:flex transition-colors cursor-pointer"
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 md:hidden transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Top Action Button: Exact match to "Upload New Files" White Pill */}
        <div className="px-4 py-2">
          <motion.button
            whileHover={isDisabled ? undefined : { scale: 1.02 }}
            whileTap={isDisabled ? undefined : { scale: 0.98 }}
            disabled={isDisabled}
            onClick={() => {
              if (isDisabled) return;
              onOpenNewIdea();
              if (onCloseMobile) onCloseMobile();
            }}
            title={isDisabled ? 'Evaluation in progress - Navigation locked' : 'Upload New Pitch Idea'}
            className={`w-full rounded-full bg-white hover:bg-white/95 text-[#576cdb] font-bold text-sm shadow-[0_6px_20px_rgba(0,0,0,0.14)] transition-all flex items-center justify-center gap-2 ${
              isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
            } ${isCollapsed ? 'p-3' : 'py-3.5 px-5'}`}
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.8] text-[#576cdb] shrink-0" />
            {!isCollapsed && <span className="tracking-tight">Upload New Pitch</span>}
          </motion.button>
        </div>

        {/* Navigation Item Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={isDisabled ? 'Evaluation in progress — Navigation locked' : isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-2.5'
                } rounded-xl text-sm font-medium transition-all duration-200 ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed pointer-events-none text-white/50'
                    : 'cursor-pointer'
                } ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold backdrop-blur-xs shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`h-[18px] w-[18px] stroke-[2] shrink-0 ${
                      isActive ? 'text-white' : 'text-white/80'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="tracking-tight text-[14px]">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-[#576cdb]'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Exact match to "STORAGE DETAILS" in Reference Image */}
        {!isCollapsed ? (
          <div className="p-4 mx-3 mb-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-3.5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/70 block mb-2.5">
                STORAGE DETAILS
              </span>

              {/* Item 1: 6-Pillar Storage / Audit Status */}
              <div className="space-y-1 mb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
                  <span>6-Pillar Audit</span>
                </div>
                {/* Thin progress divider line */}
                <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-white rounded-full" />
                </div>
                <div className="text-[11px] text-white/75 font-normal">
                  6 of 6 Pillars evaluated
                </div>
              </div>

              {/* Item 2: Readiness Score Storage */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/95">
                  <Award className="w-3.5 h-3.5 text-white/80" />
                  <span>Readiness Index</span>
                </div>
                {/* Thin progress divider line */}
                <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(readiness, 5)}%` }}
                  />
                </div>
                <div className="text-[11px] text-white/75 font-normal">
                  {readiness}% of 100 Score achieved
                </div>
              </div>
            </div>

            {/* Upgrade / Inspect Action with Diagonal Arrow (Exact match to "Upgrade Storage ↗") */}
            <div className="pt-2 border-t border-white/20 flex items-center justify-between">
              <button
                onClick={onOpenAlgorithmsModal}
                className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 transition-colors cursor-pointer group"
              >
                <span>Inspect Algorithms</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={onExportPptx}
                disabled={isExporting || !idea}
                className="text-[11px] font-semibold text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                {isExporting ? 'Exporting...' : 'Export PPTX'}
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed mini storage icon indicator */
          <div className="p-3 mb-3 text-center">
            <button
              onClick={onOpenAlgorithmsModal}
              title="Inspect Algorithms"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <Award className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
