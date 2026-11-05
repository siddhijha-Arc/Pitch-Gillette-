/**
 * Sidebar Navigation Drawer - Clean Minimal SaaS Sidebar
 * Fixed Light Mode design with collapsible state and Framer Motion micro-interactions.
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
  Layers,
  Code2,
  KeyRound,
  FileDown,
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
      badgeStyle: 'bg-[#d6dbf5] text-[#1f1f47]',
    },
    {
      id: 'gaps',
      label: '6-Pillar Gaps',
      icon: ShieldAlert,
      badge: fatalGaps > 0 ? `${fatalGaps} Fatal` : idea?.gaps.length || undefined,
      badgeStyle: fatalGaps > 0 ? 'bg-[#f7d4d4] text-[#f25a5a]' : 'bg-[#eaedf6] text-[#6c7693]',
    },
    {
      id: 'topsis',
      label: 'TOPSIS Studio',
      icon: SlidersHorizontal,
      badge: idea?.solutions ? `${idea.solutions.length}` : undefined,
      badgeStyle: 'bg-[#c1f6e0] text-[#1f1f47]',
    },
    {
      id: 'questions',
      label: 'Adaptive Q&A',
      icon: HelpCircle,
      badge: unresolvedQuestions > 0 ? `${unresolvedQuestions}` : undefined,
      badgeStyle: 'bg-[#d6dbf5] text-[#576cdb]',
    },
    {
      id: 'agents',
      label: 'Agent Council',
      icon: Users,
      badge: idea?.agentCritiques ? `${idea.agentCritiques.length}` : '6',
      badgeStyle: idea?.consensusReport?.isPolarizing ? 'bg-[#f7d4d4] text-[#f25a5a]' : 'bg-[#eaedf6] text-[#6c7693]',
    },
    {
      id: 'improvement',
      label: 'Pitch V2 Diff',
      icon: GitCompare,
      badge: `V${idea?.currentVersion || 1}`,
      badgeStyle: 'bg-[#d6dbf5] text-[#1f1f47]',
    },
    {
      id: 'deck',
      label: 'Pitch Deck',
      icon: Presentation,
      badge: idea?.pitchDeck ? `${idea.pitchDeck.length} S` : undefined,
      badgeStyle: 'bg-[#c1c9f6] text-[#1f1f47]',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Drawer Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-[#eaedf6] transition-all duration-300 select-none ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header & Toggle Button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#eaedf6]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-2xl bg-[#576cdb] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-bold text-sm text-[#1f1f47] tracking-tight truncate font-sans">
                  Gillette Pitch Engine
                </h1>
                <span className="text-[10px] text-[#6c7693] font-mono block">
                  v2.5 • Gillette SaaS Platform
                </span>
              </div>
            )}
          </div>

          {/* Desktop Minimize/Collapse Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-xl text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f1f4f9] hidden md:flex transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </motion.button>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f1f4f9] md:hidden transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </div>

        {/* Active Venture Summary Box */}
        {!isCollapsed && (
          <div className="p-3 border-b border-[#eaedf6]">
            <div className="p-3 rounded-2xl bg-[#f8f9fc] border border-[#eaedf6] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6c7693] font-mono">
                <span>Active Venture</span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-[#e0e7ff] text-[#4338ca]">
                  {readiness}% Readiness
                </span>
              </div>
              <div className="font-semibold text-sm text-[#1f1f47] truncate">
                {idea ? idea.title : 'No Pitch Loaded'}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Item Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.015, x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                  } rounded-xl text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-[#576cdb] text-white shadow-[0_2px_8px_rgba(87,108,219,0.25)]'
                      : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f1f4f9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-[#6c7693]'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeStyle || 'bg-[#eaedf6] text-[#6c7693]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer Console Actions */}
        <div className="p-3 border-t border-[#eaedf6] bg-[#f8f9fc] space-y-1.5">
          {/* Inspect Mathematics */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAlgorithmsModal}
            title={isCollapsed ? 'Inspect Mathematics' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-xl text-sm font-medium transition-colors text-[#6c7693] hover:text-[#1f1f47] hover:bg-white`}
          >
            <Code2 className="h-4.5 w-4.5 text-[#576cdb]" />
            {!isCollapsed && <span>Inspect Math</span>}
          </motion.button>

          {/* API Key Modal */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenApiKeyModal}
            title={isCollapsed ? 'API Key & Quota' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-xl text-sm font-medium transition-colors text-[#6c7693] hover:text-[#1f1f47] hover:bg-white`}
          >
            <KeyRound className="h-4.5 w-4.5 text-[#576cdb]" />
            {!isCollapsed && <span>API Key</span>}
          </motion.button>

          {/* Export PPTX */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportPptx}
            disabled={isExporting || !idea}
            title={isCollapsed ? 'Export PPTX Deck' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'gap-3 px-3.5 py-2.5'
            } rounded-xl text-sm font-medium bg-[#576cdb]/10 text-[#576cdb] hover:bg-[#576cdb]/20 transition-colors disabled:opacity-40`}
          >
            <FileDown className="h-4.5 w-4.5" />
            {!isCollapsed && <span>{isExporting ? 'Compiling...' : 'Export PPTX'}</span>}
          </motion.button>
        </div>
      </aside>
    </>
  );
};
