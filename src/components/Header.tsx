/**
 * Top Navigation & Brand Header - Reference Replica
 * Exact design replica of the top bar from user attachment:
 * Left: Brand Logo & Title
 * Middle: Rounded Pill Search Bar
 * Right: Bell (Notifications), HelpCircle, Settings, User Avatar ("Founder [F]"), Sliders (Filters)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Search,
  Bell,
  HelpCircle,
  Settings,
  SlidersHorizontal,
  Menu,
  X,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { StartupIdea } from '../types/index.ts';
import { TabId } from './SidebarNavigation.tsx';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  onOpenApiKeyModal?: () => void;
  onOpenAlgorithmsModal?: () => void;
  idea?: StartupIdea | null;
  onNavigateTab?: (tab: TabId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenApiKeyModal,
  onOpenAlgorithmsModal,
  idea,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick search results
  const allNavigationItems: Array<{ label: string; sub: string; tab: TabId }> = [
    { label: '6-Pillar Gap Audit', sub: 'Inspect fatal and critical vulnerabilities', tab: 'gaps' },
    { label: 'TOPSIS Solution Studio', sub: 'Multi-criteria algorithmic solution matrix', tab: 'topsis' },
    { label: 'Agent Council & Personas', sub: '6 AI judge evaluations and consensus', tab: 'agents' },
    { label: 'Problem Decomposition DAG', sub: 'Root causes and symptom tree', tab: 'decomposition' },
    { label: 'Adaptive Founder Q&A', sub: 'Precision drill-down clarification questions', tab: 'questions' },
    { label: 'Pitch Deck Export', sub: 'Executive PPTX slides generator', tab: 'deck' },
  ];

  const searchResults = allNavigationItems.filter((item) =>
    searchQuery.trim() === ''
      ? true
      : item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fatalGapsCount = idea?.gaps?.filter((g) => g.severity === 'FATAL_FLAW').length || 0;
  const totalGapsCount = idea?.gaps?.length || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#eaedf6] font-['Plus_Jakarta_Sans',sans-serif] select-none">
      <div className="w-full px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity (Logo + Name) */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-2 -ml-2 rounded-xl text-[#1f1f47] hover:bg-[#f1f4fb] md:hidden transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Gillette Brand Logo Icon */}
          <div className="h-10 w-10 rounded-2xl bg-[#576cdb] flex items-center justify-center shadow-[0_3px_12px_rgba(87,108,219,0.28)] shrink-0">
            <Layers className="h-5 w-5 text-white" />
          </div>

          {/* App Title */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl sm:text-[22px] text-[#0f172a] tracking-tight">
              Gillette
            </span>
            <span className="font-semibold text-lg sm:text-[20px] text-[#576cdb] tracking-tight">
              Drive
            </span>
          </div>
        </div>

        {/* Middle: Pill Search Bar (Exact Reference Replica) */}
        <div className="relative flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block">
          <div
            className={`w-full h-11 px-4 rounded-full bg-[#f1f4fb] transition-all duration-200 flex items-center gap-3 border ${
              isSearchFocused
                ? 'bg-white border-[#576cdb]/50 shadow-[0_4px_16px_rgba(87,108,219,0.12)]'
                : 'border-transparent hover:bg-[#eef2fa]'
            }`}
          >
            <Search className="h-4.5 w-4.5 text-[#8a94a6] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search Drive..."
              className="w-full bg-transparent text-sm text-[#0f172a] placeholder-[#8a94a6] focus:outline-hidden font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#8a94a6] hover:text-[#0f172a] p-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-13 left-0 right-0 bg-white rounded-2xl border border-[#eaedf6] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#8a94a6] uppercase tracking-wider">
                Quick Navigation
              </div>
              <div className="space-y-0.5 mt-1">
                {searchResults.slice(0, 5).map((res) => (
                  <button
                    key={res.tab}
                    onMouseDown={() => {
                      if (onNavigateTab) onNavigateTab(res.tab);
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#f1f4fb] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#0f172a] group-hover:text-[#576cdb]">
                        {res.label}
                      </div>
                      <div className="text-xs text-[#64748b]">{res.sub}</div>
                    </div>
                    <span className="text-xs text-[#8a94a6] font-mono group-hover:text-[#576cdb]">
                      Jump ↵
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Toolbar: Bell, Help, Settings, User Avatar, Sliders (Exact Reference Replica) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Notification Bell with Badge */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 sm:p-2.5 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {totalGapsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f43f5e] ring-2 ring-white" />
              )}
            </button>

            {/* Notification Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-88 bg-white rounded-2xl border border-[#eaedf6] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#eaedf6]">
                  <h4 className="text-sm font-bold text-[#0f172a]">Venture Notifications</h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e0e7ff] text-[#576cdb]">
                    Live Audit
                  </span>
                </div>
                <div className="space-y-2.5 mt-3">
                  {fatalGapsCount > 0 ? (
                    <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-start gap-2.5">
                      <ShieldAlert className="h-4 w-4 text-[#e11d48] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-[#e11d48]">
                          {fatalGapsCount} Fatal Flaw{fatalGapsCount > 1 ? 's' : ''} Detected
                        </div>
                        <div className="text-[11px] text-[#9f1239] mt-0.5">
                          Requires immediate structural pivot before investor pitch.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-[#059669]">
                          No Fatal Flaws
                        </div>
                        <div className="text-[11px] text-[#065f46] mt-0.5">
                          Core architecture passes essential fundability baseline.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#f8f9fc] border border-[#eaedf6] flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-[#576cdb] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">
                        Readiness Index: {idea?.overallReadinessScore || 0}%
                      </div>
                      <div className="text-[11px] text-[#64748b] mt-0.5">
                        {idea?.stage || 'CONCEPT'} Stage evaluation active.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Circle Button */}
          <button
            onClick={onOpenAlgorithmsModal}
            className="p-2 sm:p-2.5 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors cursor-pointer"
            title="Help & Algorithm Inspection"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* Settings Gear Button */}
          <button
            onClick={onOpenApiKeyModal}
            className="p-2 sm:p-2.5 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors cursor-pointer"
            title="Settings & API Key"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* User Profile: Name + Circular Avatar Initial (Exact match to "Jessica [J]") */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#eaedf6]">
            <span className="text-sm font-semibold text-[#0f172a] hidden lg:inline max-w-[100px] truncate">
              {idea ? idea.title.split(' ')[0] : 'Jessica'}
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#576cdb] text-white font-bold text-sm flex items-center justify-center shadow-xs select-none">
              {idea ? idea.title.charAt(0).toUpperCase() : 'J'}
            </div>
          </div>

          {/* Sliders / Filter Controls Button (Far Right icon from image) */}
          <button
            onClick={onOpenAlgorithmsModal}
            className="p-2 sm:p-2.5 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors cursor-pointer"
            title="Inspect Tuning & Sliders"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
