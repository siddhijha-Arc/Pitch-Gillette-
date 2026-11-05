/**
 * Sidebar Navigation Drawer - Clean Minimal SaaS Sidebar
 * Supports collapsible (minimize/expand) state and full Light/Dark mode parity.
 */

import React from 'react';
import {
  FileText,
  GitFork,
  ShieldAlert,
  SlidersHorizontal,
  HelpCircle,
  Users,
  GitCompare,
  Presentation,
  Layers,
  Code2,
  KeyRound,
  FileDown,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
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
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onTabChange,
  idea,
  onOpenAlgorithmsModal,
  onOpenApiKeyModal,
  onExportPptx,
  isExporting,
  isDarkMode,
  onToggleDarkMode,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const unresolvedQuestions = idea?.questions.filter((q) => !q.isAnswered).length || 0;
  const fatalGaps = idea?.gaps.filter((g) => g.severity === 'FATAL_FLAW').length || 0;
  const rootCausesCount = idea?.problems.filter((p) => p.isRootCause).length || 0;
  const readiness = idea?.overallReadinessScore || 0;

  const items: Array<{
    id: TabId;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeStyle?: string;
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
      badgeStyle: isDarkMode ? 'bg-[#576cdb]/20 text-[#a5b4fc]' : 'bg-[#d6dbf5] text-[#1f1f47]',
    },
    {
      id: 'gaps',
      label: '6-Pillar Gaps',
      icon: ShieldAlert,
      badge: fatalGaps > 0 ? `${fatalGaps} Fatal` : idea?.gaps.length || undefined,
      badgeStyle: fatalGaps > 0 ? 'bg-[#f7d4d4] text-[#f25a5a]' : (isDarkMode ? 'bg-[#23293e] text-[#94a3b8]' : 'bg-[#eaedf6] text-[#6c7693]'),
    },
    {
      id: 'topsis',
      label: 'TOPSIS Studio',
      icon: SlidersHorizontal,
      badge: idea?.solutions.length ? `${idea.solutions.length}` : undefined,
      badgeStyle: isDarkMode ? 'bg-[#10b981]/20 text-[#6ee7b7]' : 'bg-[#c1f6e0] text-[#1f1f47]',
    },
    {
      id: 'questions',
      label: 'Adaptive Q&A',
      icon: HelpCircle,
      badge: unresolvedQuestions > 0 ? `${unresolvedQuestions}` : undefined,
      badgeStyle: isDarkMode ? 'bg-[#576cdb]/20 text-[#a5b4fc]' : 'bg-[#d6dbf5] text-[#576cdb]',
    },
    {
      id: 'agents',
      label: 'Agent Council',
      icon: Users,
      badge: idea?.consensusReport?.isPolarizing ? 'Split' : '6 AI',
      badgeStyle: idea?.consensusReport?.isPolarizing ? 'bg-[#f7d4d4] text-[#f25a5a]' : (isDarkMode ? 'bg-[#23293e] text-[#94a3b8]' : 'bg-[#eaedf6] text-[#6c7693]'),
    },
    {
      id: 'improvement',
      label: 'Pitch V2 Diff',
      icon: GitCompare,
      badge: `V${idea?.currentVersion || 1}`,
      badgeStyle: isDarkMode ? 'bg-[#576cdb]/20 text-[#a5b4fc]' : 'bg-[#d6dbf5] text-[#1f1f47]',
    },
    {
      id: 'deck',
      label: 'Pitch Deck',
      icon: Presentation,
      badge: '10',
      badgeStyle: isDarkMode ? 'bg-[#a855f7]/20 text-[#d8b4fe]' : 'bg-[#c1c9f6] text-[#1f1f47]',
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen transition-transform duration-200 flex flex-col h-screen shrink-0 font-sans select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-20' : 'md:w-72'
        } w-72 ${
          isDarkMode
            ? 'bg-[#0e111a] text-[#f1f3f9] border-r border-[#1e2332]'
            : 'bg-white text-[#1f1f47] border-r border-[#eaedf6]'
        }`}
      >
        {/* Brand & Collapse Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-[#1e2332]' : 'border-[#eaedf6]'
        }`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-[#576cdb] flex items-center justify-center shadow-[0_3px_12px_rgba(87,108,219,0.25)] shrink-0">
                  <Layers className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className={`font-bold text-sm tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-[#1f1f47]'}`}>
                    Pitch-Ready
                  </h1>
                  <span className="text-[10px] font-mono tracking-widest text-[#84849a] uppercase block">
                    Venture Engine
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleCollapse}
                  title="Minimize Sidebar"
                  className={`hidden md:block p-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'text-[#84849a] hover:text-white hover:bg-[#181d2c]' : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f1f4f9]'
                  }`}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
                {onCloseMobile && (
                  <button
                    onClick={onCloseMobile}
                    title="Close Drawer"
                    className={`md:hidden p-1.5 rounded-lg transition-colors ${
                      isDarkMode ? 'text-[#84849a] hover:text-white hover:bg-[#181d2c]' : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f1f4f9]'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#576cdb] flex items-center justify-center shadow-[0_3px_12px_rgba(87,108,219,0.25)]">
              <Layers className="h-4.5 w-4.5 text-white" />
            </div>
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'text-[#84849a] hover:text-white hover:bg-[#181d2c]' : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f1f4f9]'
              }`}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Idea Profile Card */}
      {!isCollapsed ? (
        <div className={`p-4 m-3 rounded-2xl border space-y-2 ${
          isDarkMode ? 'bg-[#151926] border-[#23293e]' : 'bg-[#f8f9fc] border-[#eaedf6]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#84849a]">
              Active Venture
            </span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
              isDarkMode ? 'bg-[#20273a] text-[#818cf8]' : 'bg-[#e0e7ff] text-[#4338ca]'
            }`}>
              {readiness}% Ready
            </span>
          </div>
          <div className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-[#1f1f47]'}`}>
            {idea ? idea.title : 'No Venture Loaded'}
          </div>
        </div>
      ) : (
        <div className="my-3 flex justify-center">
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
            isDarkMode ? 'bg-[#20273a] text-[#818cf8]' : 'bg-[#e0e7ff] text-[#4338ca]'
          }`} title={`Readiness: ${readiness}%`}>
            {readiness}%
          </span>
        </div>
      )}

      {/* Navigation Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {/* OVERVIEW SECTION */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <span className="px-3 text-xs font-mono uppercase tracking-widest text-[#84849a] block mb-2">
              Overview & Intake
            </span>
          )}
          {items.slice(0, 1).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-3'} rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#576cdb] text-white shadow-[0_2px_10px_rgba(87,108,219,0.3)] font-semibold'
                    : isDarkMode
                    ? 'text-[#94a3b8] hover:text-white hover:bg-[#181d2c]'
                    : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f1f4f9]'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}>
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : isDarkMode ? 'text-[#94a3b8]' : 'text-[#6c7693]'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* EVALUATION & MODULES SECTION */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <span className="px-3 text-xs font-mono uppercase tracking-widest text-[#84849a] block mb-2">
              Evaluation & Modules
            </span>
          )}
          {items.slice(1).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-3'} rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#576cdb] text-white shadow-[0_2px_10px_rgba(87,108,219,0.3)] font-semibold'
                    : isDarkMode
                    ? 'text-[#94a3b8] hover:text-white hover:bg-[#181d2c]'
                    : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f1f4f9]'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}>
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : isDarkMode ? 'text-[#94a3b8]' : 'text-[#6c7693]'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Console Actions */}
      <div className={`p-3 border-t space-y-1.5 ${
        isDarkMode ? 'border-[#1e2332] bg-[#0a0d14]' : 'border-[#eaedf6] bg-[#f8f9fc]'
      }`}>
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={isCollapsed ? (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3.5 py-2.5'} rounded-xl text-sm font-medium transition-colors ${
            isDarkMode
              ? 'text-[#e3e6e8] hover:bg-[#181d2c]'
              : 'text-[#1f1f47] hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="h-4.5 w-4.5 text-[#818cf8]" /> : <Sun className="h-4.5 w-4.5 text-[#f59e0b]" />}
            {!isCollapsed && <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>}
          </div>
          {!isCollapsed && (
            <div className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${isDarkMode ? 'bg-[#576cdb]' : 'bg-[#cbd5e1]'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          )}
        </button>

        {/* Inspect Mathematics */}
        <button
          onClick={onOpenAlgorithmsModal}
          title={isCollapsed ? 'Inspect Mathematics' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-sm font-medium transition-colors ${
            isDarkMode
              ? 'text-[#94a3b8] hover:text-white hover:bg-[#181d2c]'
              : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-white'
          }`}
        >
          <Code2 className="h-4.5 w-4.5 text-[#576cdb]" />
          {!isCollapsed && <span>Inspect Math</span>}
        </button>

        {/* API Key Modal */}
        <button
          onClick={onOpenApiKeyModal}
          title={isCollapsed ? 'API Key & Quota' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-sm font-medium transition-colors ${
            isDarkMode
              ? 'text-[#94a3b8] hover:text-white hover:bg-[#181d2c]'
              : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-white'
          }`}
        >
          <KeyRound className="h-4.5 w-4.5 text-[#576cdb]" />
          {!isCollapsed && <span>API Key</span>}
        </button>

        {/* Export PPTX */}
        <button
          onClick={onExportPptx}
          disabled={isExporting || !idea}
          title={isCollapsed ? 'Export PPTX Deck' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-sm font-medium bg-[#576cdb]/10 text-[#576cdb] hover:bg-[#576cdb]/20 transition-colors disabled:opacity-40`}
        >
          <FileDown className="h-4.5 w-4.5" />
          {!isCollapsed && <span>{isExporting ? 'Compiling...' : 'Export PPTX'}</span>}
        </button>
      </div>
    </aside>
  </>
);
};
