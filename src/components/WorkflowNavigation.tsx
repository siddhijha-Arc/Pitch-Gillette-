/**
 * Workflow Navigation Tabs - RevenueCat Style
 * Minimalist horizontal pills, clear active state, zero unuseful descriptions.
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

interface WorkflowNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  idea: StartupIdea | null;
}

export const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({
  activeTab,
  onTabChange,
  idea,
}) => {
  const unresolvedQuestions = idea?.questions.filter((q) => !q.isAnswered).length || 0;
  const fatalGaps = idea?.gaps.filter((g) => g.severity === 'FATAL_FLAW').length || 0;
  const rootCausesCount = idea?.problems.filter((p) => p.isRootCause).length || 0;

  const tabs: Array<{
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
      badge: rootCausesCount > 0 ? `${rootCausesCount} Roots` : undefined,
      badgeStyle: 'bg-[#d6dbf5] text-[#1f1f47]',
    },
    {
      id: 'gaps',
      label: '6-Pillar Gaps',
      icon: ShieldAlert,
      badge: fatalGaps > 0 ? `${fatalGaps} Fatal` : idea?.gaps.length || undefined,
      badgeStyle: fatalGaps > 0 ? 'bg-[#f7d4d4] text-[#f25a5a]' : 'bg-[#f9f9fb] text-[#6c7693]',
    },
    {
      id: 'topsis',
      label: 'TOPSIS Studio',
      icon: SlidersHorizontal,
      badge: idea?.solutions.length ? `${idea.solutions.length} Ranked` : undefined,
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
      badge: idea?.consensusReport?.isPolarizing ? 'Polarized' : '6 Agents',
      badgeStyle: idea?.consensusReport?.isPolarizing ? 'bg-[#f7d4d4] text-[#f25a5a]' : 'bg-[#f9f9fb] text-[#6c7693]',
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
      badge: '10 Slides',
      badgeStyle: 'bg-[#c1c9f6] text-[#1f1f47]',
    },
  ];

  return (
    <nav className="w-full border-b border-[#eaedf6] bg-[#f9f9fb] overflow-x-auto scrollbar-none py-2.5">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center space-x-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-[#1f1f47] font-semibold border border-[#eaedf6] shadow-[rgba(73,46,107,0.06)_0px_2px_8px]'
                    : 'text-[#6c7693] hover:text-[#1f1f47] hover:bg-white/60 border border-transparent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#576cdb]' : 'text-[#6c7693]'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.2 rounded-full ${tab.badgeStyle}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
