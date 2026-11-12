/**
 * 6-Pillar Venture Gap Audit View - Gillette Pitch Engine
 *
 * Exact replication of the reference Market & Customer Validation card design
 * across all six venture audit categories in a 3-column x 2-row grid.
 *
 * Specific fixes:
 * 1. Monospace font eliminated: IDENTIFIED GAPS and "X Gaps Found" now use
 *    exact Plus Jakarta Sans typography with font-extrabold for the count number
 *    and medium slate for "Gaps Found", exactly matching the reference card.
 * 2. Removed "ACTIVE" and "CRITICAL" badges. Badges now display soft, light-shade
 *    severity indicators (LOW SEVERITY, MODERATE, HIGH SEVERITY) with pastel backgrounds
 *    strictly derived from actual evaluation gap severity data.
 * 3. Exact proportions, 64x64 pastel icon containers, 32px rounded corners,
 *    thin divider, and 50x50 circular arrow button.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  RefreshCw,
  X,
  ArrowRight,
  TrendingUp,
  Cpu,
  DollarSign,
  Share2,
  Scale,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { GapPillar, GapRecord, StartupIdea } from '../../types/index.ts';

interface GapDetectionViewProps {
  idea: StartupIdea;
  onDetectGaps: () => void;
  isLoading: boolean;
}

interface CategoryConfig {
  pillar: GapPillar;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    pillar: 'TAM_MARKET',
    title: 'Market & Customer Validation',
    description: 'Check if your target market is large enough and if customers really need your product.',
    icon: TrendingUp,
    iconBg: 'bg-[#ede9fe]',
    iconColor: 'text-[#6366f1]',
  },
  {
    pillar: 'TECH_VIABILITY',
    title: 'Technical Viability',
    description: 'Verify architectural scaling, latency bottlenecks, and core IP defensibility.',
    icon: Cpu,
    iconBg: 'bg-[#dbeafe]',
    iconColor: 'text-[#2563eb]',
  },
  {
    pillar: 'UNIT_ECONOMICS',
    title: 'Financial Feasibility',
    description: 'Audit unit economics, CAC/LTV ratios, gross margins, and capital burn multiples.',
    icon: DollarSign,
    iconBg: 'bg-[#ffedd5]',
    iconColor: 'text-[#ea580c]',
  },
  {
    pillar: 'DISTRIBUTION',
    title: 'Distribution & GTM',
    description: 'Evaluate go-to-market channels, sales cycle velocity, and customer acquisition efficiency.',
    icon: Share2,
    iconBg: 'bg-[#dcfce7]',
    iconColor: 'text-[#16a34a]',
  },
  {
    pillar: 'LEGAL',
    title: 'Legal & Regulatory',
    description: 'Assess compliance mandates, data privacy liability, and jurisdictional barriers.',
    icon: Scale,
    iconBg: 'bg-[#f3e8ff]',
    iconColor: 'text-[#9333ea]',
  },
  {
    pillar: 'MOAT',
    title: 'Competitive Moat',
    description: 'Analyze network effects, switching barriers, data flywheels, and competitor retaliation.',
    icon: Award,
    iconBg: 'bg-[#fef9c3]',
    iconColor: 'text-[#ca8a04]',
  },
];

export const GapDetectionView: React.FC<GapDetectionViewProps> = ({
  idea,
  onDetectGaps,
  isLoading,
}) => {
  const gaps = idea.gaps || [];

  // Selected category modal/drawer state
  const [selectedPillar, setSelectedPillar] = useState<GapPillar | null>(null);

  /**
   * Derives a soft, light pastel shade badge and card theme according to gap severity.
   * Background and border colors softly reflect the category's risk level.
   */
  const getPillarCardTheme = (pillarGaps: GapRecord[]) => {
    if (pillarGaps.length === 0) {
      return {
        cardBg: 'bg-gradient-to-b from-[#f2fbf6] via-[#f9fdfa] to-white',
        badge: {
          label: 'LOW SEVERITY',
          bg: 'bg-[#ecfdf5]',
          text: 'text-[#059669]',
          dot: 'bg-[#10b981]',
        },
      };
    }

    const hasFatal = pillarGaps.some((g) => g.severity === 'FATAL_FLAW');
    const hasCritical = pillarGaps.some((g) => g.severity === 'CRITICAL_GAP');

    if (hasFatal || hasCritical) {
      return {
        cardBg: 'bg-gradient-to-b from-[#fff5f5] via-[#fffbfb] to-white',
        badge: {
          label: 'HIGH SEVERITY',
          bg: 'bg-[#ffe4e6]',
          text: 'text-[#e11d48]',
          dot: 'bg-[#f43f5e]',
        },
      };
    }

    return {
      cardBg: 'bg-gradient-to-b from-[#fffdf5] via-[#fffffb] to-white',
      badge: {
        label: 'MODERATE',
        bg: 'bg-[#fef9c3]',
        text: 'text-[#a16207]',
        dot: 'bg-[#eab308]',
      },
    };
  };

  return (
    <div className="space-y-7 w-full mx-auto py-2 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Venture Gap Audit
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1.5 font-normal leading-relaxed">
            Exhaustive evaluation across all 6 core pillars of venture fundability.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDetectGaps}
          disabled={isLoading}
          className="px-6 py-3 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(87,108,219,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Auditing Gaps...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Re-run Exhaustive Audit</span>
            </>
          )}
        </motion.button>
      </div>

      {/* 2. 3-Column x 2-Row Category Cards Grid (Exact Reference Replica + 3D Bulged Glass Icon + Severity Theming) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {CATEGORIES.map((cat) => {
          const pillarGaps = gaps.filter((g) => g.pillar === cat.pillar);
          const gapCount = pillarGaps.length;
          const theme = getPillarCardTheme(pillarGaps);
          const badge = theme.badge;
          const IconComponent = cat.icon;

          return (
            <motion.div
              key={cat.pillar}
              whileHover={{
                y: -8,
                scale: 1.015,
                boxShadow:
                  '0 32px 64px -12px rgba(0,0,0,0.3), 0 18px 36px -8px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.3)',
              }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedPillar(cat.pillar)}
              className={`${theme.cardBg} rounded-[32px] p-7 sm:p-8 shadow-[0_22px_45px_-10px_rgba(0,0,0,0.18),0_12px_24px_-6px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer flex flex-col justify-between group select-none`}
            >
              <div>
                {/* Top Row: Bulged Out Glass Expo Icon Tile (Left) + Light-Shade Severity Badge (Right) */}
                <div className="flex items-center justify-between">
                  
                  {/* 3D Bulged Out Glass Expo Icon Effect */}
                  <div className="relative group/icon">
                    {/* Underlying ambient contact shadow */}
                    <div className="absolute inset-0 rounded-[24px] bg-black/10 blur-[6px] translate-y-2 transform scale-95 pointer-events-none" />

                    {/* Bulged Glass Tile with Specular Highlight and Depth */}
                    <div
                      className={`relative w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-[24px] ${cat.iconBg} ${cat.iconColor} flex items-center justify-center shrink-0 
                      backdrop-blur-md 
                      shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_6px_rgba(0,0,0,0.08),0_10px_22px_rgba(15,23,42,0.08),0_3px_6px_rgba(15,23,42,0.04)] 
                      border border-white/90 ring-1 ring-black/[0.04] 
                      transform transition-all duration-300 group-hover:scale-108 group-hover:-translate-y-1 overflow-hidden`}
                    >
                      {/* Top Gloss Reflection / Glare Lens (Expo Glass effect) */}
                      <div className="absolute top-0 left-0 right-0 h-[48%] bg-gradient-to-b from-white/75 via-white/30 to-transparent rounded-t-[24px] pointer-events-none" />

                      {/* Bottom Subtle Refraction Ray */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/40 blur-[1px] rounded-full pointer-events-none" />

                      {/* 3D Icon with tactile drop shadow */}
                      <IconComponent className="relative z-10 w-8 h-8 stroke-[2.3] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
                    </div>
                  </div>

                  {/* Light Shade Badge According to Severity of Gap */}
                  <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider font-['Plus_Jakarta_Sans',sans-serif] ${badge.bg} ${badge.text} shadow-[0_2px_8px_rgba(0,0,0,0.08)]`}>
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>

                {/* Category Title: Bold, Tight Tracking, Exact Reference Font */}
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[26px] sm:text-[28px] font-bold text-[#0f172a] leading-[1.22] tracking-[-0.02em] mt-6">
                  {cat.title}
                </h3>

                {/* Category Description: Increased font size by 1-2 sizes for high readability */}
                <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[17px] sm:text-[18px] text-[#475569] leading-[1.6] font-normal mt-3">
                  {cat.description}
                </p>
              </div>

              <div>
                {/* Thin Subtle Divider Line */}
                <div className="h-px bg-slate-200/80 my-6" />

                {/* Bottom Row: Exact Typography for Identified Gaps + Circular Arrow Button */}
                <div className="flex items-end justify-between">
                  <div>
                    {/* Small Uppercase Label: Pure Sans-serif, Clean Spacing */}
                    <span className="text-[13px] font-bold text-[#8a94a6] uppercase tracking-[0.06em] font-['Plus_Jakarta_Sans',sans-serif] block mb-1.5">
                      IDENTIFIED GAPS
                    </span>

                    {/* Gap Count: Extra Bold Number + Medium Text on Same Baseline */}
                    <div className="flex items-baseline">
                      <span className="text-[32px] sm:text-[36px] font-[800] text-[#0f172a] font-['Plus_Jakarta_Sans',sans-serif] leading-none">
                        {gapCount}
                      </span>
                      <span className="text-[19px] sm:text-[21px] font-medium text-[#64748b] font-['Plus_Jakarta_Sans',sans-serif] leading-none ml-2.5">
                        {gapCount === 1 ? 'Gap Found' : 'Gaps Found'}
                      </span>
                    </div>
                  </div>

                  {/* Circular Right Arrow Button with bulged shadow, no border */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-[50px] h-[50px] rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.14)] group-hover:bg-[#576cdb] group-hover:text-white flex items-center justify-center text-[#334155] transition-all shrink-0"
                  >
                    <ArrowRight className="w-5 h-5 stroke-[2.2]" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Detailed Gap Analysis Modal (Opens on Card Click) */}
      <AnimatePresence>
        {selectedPillar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPillar(null)}
              className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-[4px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              {(() => {
                const cat = CATEGORIES.find((c) => c.pillar === selectedPillar) || CATEGORIES[0];
                const pillarGaps = gaps.filter((g) => g.pillar === selectedPillar);
                const theme = getPillarCardTheme(pillarGaps);
                const badge = theme.badge;

                return (
                  <>
                    {/* Modal Header */}
                    <div className="p-6 border-b border-[#eaedf6] bg-[#f9f9fb] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} ${cat.iconColor} flex items-center justify-center shrink-0 shadow-xs`}>
                          <cat.icon className="w-7 h-7 stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a]">
                              {cat.title}
                            </h2>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
                            {pillarGaps.length} {pillarGaps.length === 1 ? 'vulnerability identified' : 'vulnerabilities identified'}
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedPillar(null)}
                        className="w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-[#eaedf6] flex items-center justify-center text-[#64748b] transition-colors shrink-0 cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>

                    {/* Modal Content: List of Gaps in this Pillar */}
                    <div className="p-6 overflow-y-auto space-y-4 flex-1">
                      {pillarGaps.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                          <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto" />
                          <h3 className="text-base font-semibold text-[#0f172a]">No Critical Gaps Identified</h3>
                          <p className="text-xs sm:text-sm text-[#64748b]">This venture pillar is robustly satisfied in your current pitch evaluation.</p>
                        </div>
                      ) : (
                        pillarGaps.map((gap) => (
                          <div
                            key={gap.id}
                            className="p-5 rounded-2xl bg-[#f8fafc] shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold px-3 py-1 rounded-full font-sans uppercase tracking-wider bg-white shadow-2xs text-[#334155]">
                                {gap.severity.replace(/_/g, ' ')}
                              </span>

                              <span className="text-xs text-[#64748b]">
                                Impact Weight: <strong className="text-[#0f172a]">{gap.impactWeight}/5</strong>
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-[#0f172a]">
                              {gap.title}
                            </h4>

                            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                              {gap.deficiency}
                            </p>

                            {gap.resolutionStrategy && (
                              <div className="mt-3 pt-3 border-t border-[#e2e8f0] text-xs text-[#15803d] font-medium flex items-start gap-1.5">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                <span><strong>Resolution Strategy:</strong> {gap.resolutionStrategy}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
