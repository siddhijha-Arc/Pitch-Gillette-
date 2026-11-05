/**
 * Top Navigation & Brand Header - RevenueCat Style
 * Shows only the brand logo and application name as requested.
 */

import React from 'react';
import { Layers, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#eaedf6] dark:border-[#1e2332] bg-white/95 dark:bg-[#0e111a]/95 backdrop-blur-md transition-colors">
      <div className="w-full px-6 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand identity - Only app name and logo */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 -ml-1 rounded-xl text-[#1f1f47] dark:text-white hover:bg-[#eaedf6] dark:hover:bg-[#1e2436] md:hidden transition-colors"
              title="Toggle Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="h-9 w-9 rounded-2xl bg-[#576cdb] flex items-center justify-center shadow-[0_3px_12px_rgba(87,108,219,0.25)] shrink-0">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl sm:text-2xl text-[#1f1f47] dark:text-white tracking-tight font-sans">
              Pitch-Ready
            </span>
            <span className="text-xs font-semibold tracking-wider text-[#6c7693] dark:text-[#84849a] uppercase font-mono hidden sm:inline">
              Engine
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
