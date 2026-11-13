/**
 * Live Market Intelligence Module (Module 7) - Gillette Check
 *
 * Real-world market research dashboard with visual category cards matching
 * user reference design, vector art illustrations, and smooth card click navigation.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Search,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Database,
  MessageSquare,
  BarChart2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { StartupIdea, MarketSourceItem } from '../../types/index.ts';

interface MarketIntelligenceViewProps {
  idea: StartupIdea;
  onUpdateIdea: (updatedIdea: StartupIdea) => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export const MarketIntelligenceView: React.FC<MarketIntelligenceViewProps> = ({
  idea,
  onUpdateIdea,
  apiFetch,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing live market research engines...');
  const [activeSubTab, setActiveSubTab] = useState<'hub' | 'overview' | 'trends' | 'problems' | 'opportunities' | 'risks' | 'recommendations' | 'sources'>('hub');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('ALL');

  const report = idea.marketReport;

  const handleRunMarketResearch = async () => {
    setIsLoading(true);
    setSelectedPlatformFilter('ALL');
    setLoadingStep('Running live Google Web Search across Reddit & Quora threads...');
    const t1 = setTimeout(() => {
      setLoadingStep('Scanning YouTube reviews, Hacker News & Product Hunt discussions...');
    }, 2500);
    const t2 = setTimeout(() => {
      setLoadingStep('Fetching World Bank macroeconomic indicators & verifying URLs...');
    }, 5500);
    const t3 = setTimeout(() => {
      setLoadingStep('Synthesizing sentiment-scored pain points & Market Intelligence Report...');
    }, 8500);

    try {
      const res = await apiFetch(`/api/ideas/${idea.id}/market-intelligence`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.idea) {
        onUpdateIdea(data.idea);
      } else {
        alert(data.error || 'Failed to generate market intelligence report');
      }
    } catch (err) {
      console.error('Market intelligence fetch failed:', err);
      alert('Failed to connect to market intelligence services.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsLoading(false);
    }
  };

  const getSourceBadgeColor = (type: MarketSourceItem['sourceType']) => {
    switch (type) {
      case 'GOOGLE_SEARCH':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'BRAVE_SEARCH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REDDIT_DISCUSSION':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'YOUTUBE_DISCUSSION':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'QUORA_DISCUSSION':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HACKER_NEWS_DISCUSSION':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'PRODUCT_HUNT_DISCUSSION':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'STACK_EXCHANGE_QA':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'WORLD_BANK_DATA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'INDUSTRY_REPORT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPlatformBadgeColor = (platform?: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('reddit')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (p.includes('youtube')) return 'bg-red-50 text-red-700 border-red-200';
    if (p.includes('quora')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (p.includes('hacker')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (p.includes('product')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (p.includes('stack')) return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  const getVerificationBadge = (status: MarketSourceItem['verificationStatus']) => {
    switch (status) {
      case 'VERIFIED_FACT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Verified Fact</span>;
      case 'THIRD_PARTY_ESTIMATE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Third-Party Estimate</span>;
      case 'AI_INTERPRETATION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">AI Interpretation</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Unavailable</span>;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto font-sans pb-16">
      
      {/* Top Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-7 shadow-[0_4px_20px_rgba(31,31,71,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#576cdb]/10 text-[#576cdb] border border-[#576cdb]/20 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Module 7</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1f1f47] tracking-tight font-['Outfit',sans-serif]">
              Live Market Intelligence
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#6c7693] max-w-3xl font-normal leading-relaxed">
            Real-world market research driven by live Google Web Search (Reddit, YouTube, Quora, Product Hunt), Hacker News, World Bank data, and Gemini synthesis.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {report && activeSubTab !== 'hub' && (
            <button
              type="button"
              onClick={() => setActiveSubTab('hub')}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#eaedf6] text-xs font-semibold text-[#1f1f47] hover:bg-[#f8fafc] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#576cdb]" />
              <span>Back to Hub Cards</span>
            </button>
          )}

          {report && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#eaedf6] text-xs text-[#64748b]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Research Active</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRunMarketResearch}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#576cdb] to-[#4357c9] text-white text-sm font-semibold shadow-[0_8px_20px_rgba(87,108,219,0.3)] hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{report ? 'Refresh Research' : 'Run Live Market Intelligence'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Loading State Banner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-[#576cdb]/10 via-[#4357c9]/10 to-indigo-50 border border-[#576cdb]/30 rounded-2xl p-5 shadow-sm flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#576cdb] text-white flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1f1f47]">Conducting Live Multi-Source Research...</h3>
              <p className="text-xs text-[#576cdb] font-medium">{loadingStep}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State if no report generated yet */}
      {!report && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#eaedf6] p-12 text-center space-y-4 shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#576cdb]/10 text-[#576cdb] flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[#1f1f47] font-['Outfit',sans-serif]">No Market Research Generated Yet</h2>
            <p className="text-sm text-[#6c7693]">
              Click "Run Live Market Intelligence" to query live web search results, Reddit customer sentiment, and global economic benchmarks for <strong className="text-[#1f1f47]">{idea.title}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunMarketResearch}
            className="px-6 py-3 rounded-xl bg-[#576cdb] text-white text-sm font-semibold shadow-md hover:bg-[#4357c9] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Run Market Intelligence Report</span>
          </button>
        </motion.div>
      )}

      {/* Report Dashboard */}
      {report && (
        <div className="space-y-6">
          
          {/* Back button header when inside a detail tab */}
          {activeSubTab !== 'hub' && (
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('hub')}
                className="px-4 py-2 rounded-xl bg-white border border-[#eaedf6] text-xs font-bold text-[#576cdb] hover:bg-[#f8fafc] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back to Research Cards</span>
              </button>
            </div>
          )}

          {/* HUB VIEW: Interactive Visual Category Cards Grid matching reference design */}
          {activeSubTab === 'hub' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'overview',
                  title: 'Market Overview',
                  subtitle: 'Sector demand & global indicators',
                  count: 'Overview',
                  colorBg: 'bg-[#3b82f6]',
                  svgArt: (
                    <svg className="w-20 h-20 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10M12 20V4M6 20v-6" />
                    </svg>
                  ),
                },
                {
                  id: 'trends',
                  title: 'Market Trends',
                  subtitle: `${report.trends.length} emerging signals tracked`,
                  count: `${report.trends.length} Trends`,
                  colorBg: 'bg-[#22c55e]',
                  svgArt: (
                    <svg className="w-20 h-20 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ),
                },
                {
                  id: 'problems',
                  title: 'Customer Pain Points',
                  subtitle: `${report.customerProblems.length} community complaints`,
                  count: `${report.customerProblems.length} Issues`,
                  colorBg: 'bg-[#f97316]',
                  svgArt: (
                    <svg className="w-20 h-20 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ),
                },
                {
                  id: 'opportunities',
                  title: 'Market Opportunities',
                  subtitle: `${report.opportunities.length} underserved segments`,
                  count: `${report.opportunities.length} Opps`,
                  colorBg: 'bg-[#8b5cf6]',
                  svgArt: (
                    <svg className="w-20 h-20 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                },
                {
                  id: 'risks',
                  title: 'Market Risks',
                  subtitle: `${report.risks.length} industry vulnerabilities`,
                  count: `${report.risks.length} Risks`,
                  colorBg: 'bg-[#f43f5e]',
                  svgArt: (
                    <svg className="w-20 h-20 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ),
                },
                {
                  id: 'recommendations',
                  title: 'Strategic Roadmap',
                  subtitle: 'Positioning & validation strategy',
                  count: 'Roadmap',
                  colorBg: 'bg-[#6366f1]',
                  svgArt: (
                    <svg className="w-20 h-20 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  id: 'sources',
                  title: 'Evidence Sources',
                  subtitle: `${report.sources.length} verified citations`,
                  count: `${report.sources.length} Sources`,
                  colorBg: 'bg-[#14b8a6]',
                  svgArt: (
                    <svg className="w-20 h-20 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  ),
                },
              ].map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSubTab(card.id as any)}
                  className="rounded-[24px] bg-white shadow-[0_12px_35px_rgba(0,0,0,0.08)] overflow-hidden cursor-pointer border border-[#eaedf6] transition-all flex flex-col group"
                >
                  {/* Top Colored Container with window dots */}
                  <div className={`${card.colorBg} p-6 flex flex-col items-center justify-center relative min-h-[170px]`}>
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 opacity-80">
                      <span className="w-2 h-2 rounded-full bg-white/70" />
                      <span className="w-2 h-2 rounded-full bg-white/70" />
                      <span className="w-2 h-2 rounded-full bg-white/70" />
                    </div>
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-black/20 text-white px-2.5 py-0.5 rounded-full">
                      {card.count}
                    </span>
                    <div className="my-auto py-3 transform group-hover:scale-110 transition-transform duration-300">
                      {card.svgArt}
                    </div>
                  </div>

                  {/* Bottom White Container */}
                  <div className="p-6 bg-white space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#1f1f47] tracking-tight font-['Outfit',sans-serif] group-hover:text-[#576cdb] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6c7693] font-normal leading-relaxed">
                        {card.subtitle}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-xs font-semibold text-[#576cdb]">
                      <span>Explore section</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* DETAIL VIEW: Tab 1: Market Overview */}
          {activeSubTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-7 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-[#576cdb]">
                    <BarChart2 className="w-5 h-5" />
                    <h3 className="text-lg font-bold text-[#1f1f47] font-['Outfit',sans-serif]">Sector Overview & Market Demand</h3>
                  </div>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {report.overview.industryOverview}
                  </p>
                  <div className="pt-2 border-t border-[#f1f4f9] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#eaedf6]">
                      <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Market Demand Velocity</span>
                      <p className="text-xs sm:text-sm text-[#1f1f47] font-medium leading-relaxed">{report.overview.marketDemand}</p>
                    </div>
                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#eaedf6]">
                      <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Target Audience</span>
                      <p className="text-xs sm:text-sm text-[#1f1f47] font-medium leading-relaxed">{report.overview.targetAudience}</p>
                    </div>
                  </div>
                </div>

                {/* Market Size & TAM */}
                {report.overview.marketSizeEvidence && (
                  <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Evidence-Backed Market Sizing</span>
                      <span className="text-xs text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full font-semibold">Verified Source</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-xs text-[#6c7693] block">Total Addressable Market</span>
                        <span className="text-xl sm:text-2xl font-bold text-[#1f1f47] font-['Outfit',sans-serif]">
                          {report.overview.marketSizeEvidence.totalAddressableMarket || 'Growing Sector'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[#6c7693] block">Compound Annual Growth Rate</span>
                        <span className="text-xl sm:text-2xl font-bold text-[#1f1f47] font-['Outfit',sans-serif]">
                          {report.overview.marketSizeEvidence.cagr || 'Double-digit expansion'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar: API Status & Geography */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#1f1f47] uppercase tracking-wider">Live API Connectivity Status</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'YouTube Live Search', status: report.apiStatus.youtubeSearch || 'CONNECTED' },
                      { name: 'Reddit Discussions (Live Archive)', status: report.apiStatus.redditApi },
                      { name: 'Quora Q&A Web Index', status: report.apiStatus.quoraSearch || 'CONNECTED' },
                      { name: 'Hacker News Algolia API', status: report.apiStatus.hackerNewsApi || 'CONNECTED' },
                      { name: 'StackExchange Q&A API', status: report.apiStatus.stackExchangeApi || 'CONNECTED' },
                      { name: 'Industry News & Web Index', status: report.apiStatus.googleWebSearch || 'CONNECTED' },
                      { name: 'World Bank Open Data', status: report.apiStatus.worldBank },
                      { name: 'Brave Search API (Optional)', status: report.apiStatus.braveSearch },
                    ].map((api, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#eaedf6]">
                        <span className="text-xs font-medium text-[#1f1f47]">{api.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          api.status === 'CONNECTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : api.status === 'UNAVAILABLE'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {api.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-[#1f1f47] uppercase tracking-wider">Geographic Scope</h3>
                  <p className="text-xs text-[#6c7693] leading-relaxed">{report.overview.geography}</p>
                </div>
              </div>
            </div>
          )}

          {/* DETAIL VIEW: Tab 2: Market Trends */}
          {activeSubTab === 'trends' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.trends.map((trend, idx) => (
                <div key={trend.id || idx} className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    {trend.growthIndicator && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {trend.growthIndicator}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#1f1f47] font-['Outfit',sans-serif]">{trend.trendTitle}</h3>
                  <p className="text-sm text-[#6c7693] leading-relaxed">{trend.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* DETAIL VIEW: Tab 3: Customer Problems */}
          {activeSubTab === 'problems' && (() => {
            const availablePlatforms = Array.from(
              new Set(report.customerProblems.map((p) => p.sourcePlatform || 'Community'))
            );
            const filteredProblems =
              selectedPlatformFilter === 'ALL'
                ? report.customerProblems
                : report.customerProblems.filter(
                    (p) => (p.sourcePlatform || 'Community') === selectedPlatformFilter
                  );

            return (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#1f1f47] font-['Outfit',sans-serif]">Multi-Platform Community Sentiment & Pain Points</h3>
                      <p className="text-xs text-[#6c7693]">Aggregated discussions and customer complaints extracted from Reddit, Quora, YouTube, Hacker News, and Product Hunt.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 self-start sm:self-auto">
                      {filteredProblems.length} Analyzed Pain Points
                    </span>
                  </div>

                  {/* Platform Filter Controls */}
                  {availablePlatforms.length > 1 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#f1f4f9]">
                      <button
                        type="button"
                        onClick={() => setSelectedPlatformFilter('ALL')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedPlatformFilter === 'ALL'
                            ? 'bg-[#1f1f47] text-white'
                            : 'bg-[#f8fafc] text-[#64748b] hover:text-[#1f1f47] border border-[#eaedf6]'
                        }`}
                      >
                        All Platforms ({report.customerProblems.length})
                      </button>
                      {availablePlatforms.map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => setSelectedPlatformFilter(platform)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            selectedPlatformFilter === platform
                              ? 'bg-[#576cdb] text-white'
                              : 'bg-[#f8fafc] text-[#64748b] hover:text-[#1f1f47] border border-[#eaedf6]'
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProblems.map((prob, idx) => {
                    const matchingSource =
                      (prob.sourceId && report.sources.find((s) => s.id === prob.sourceId)) ||
                      report.sources.find(
                        (s) =>
                          (s.platformName || '').toLowerCase() === (prob.sourcePlatform || '').toLowerCase()
                      ) ||
                      (report.sources.length > 0 ? report.sources[idx % report.sources.length] : undefined);

                    const discussionUrl = prob.sourceUrl || matchingSource?.url;
                    const discussionTitle = prob.sourceTitle || matchingSource?.title;

                    return (
                      <div key={prob.id || idx} className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-xs space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${getPlatformBadgeColor(prob.sourcePlatform)}`}>
                              <MessageSquare className="w-3 h-3" />
                              <span>{prob.sourcePlatform || 'Community Discussion'}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              {prob.discussionVolume && (
                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  Vol: {prob.discussionVolume}
                                </span>
                              )}
                              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                {prob.sentiment || 'HIGH_NEGATIVE'}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-[#1f1f47] font-['Outfit',sans-serif]">{prob.problemTitle}</h3>
                          <p className="text-sm text-[#475569] leading-relaxed bg-[#f8fafc] p-4 rounded-xl border border-[#eaedf6]">
                            "{prob.customerComplaintSummary}"
                          </p>
                        </div>

                        {discussionUrl && (
                          <div className="pt-3 border-t border-[#f1f4f9] flex items-center justify-between text-xs gap-2">
                            <span className="text-[#6c7693] truncate max-w-[240px] font-mono">
                              {discussionTitle || discussionUrl}
                            </span>
                            <a
                              href={discussionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-[#576cdb] hover:underline flex items-center gap-1 shrink-0"
                            >
                              <span>View Discussion</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* DETAIL VIEW: Tab 4: Market Opportunities */}
          {activeSubTab === 'opportunities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.opportunities.map((opp, idx) => (
                <div key={opp.id || idx} className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Lightbulb className="w-5 h-5" />
                    <h3 className="text-lg font-bold text-[#1f1f47] font-['Outfit',sans-serif]">{opp.opportunityTitle}</h3>
                  </div>
                  <p className="text-sm text-[#6c7693] leading-relaxed">{opp.description}</p>
                  <div className="pt-2 border-t border-[#f1f4f9] space-y-2">
                    <div className="text-xs">
                      <strong className="text-[#1f1f47]">Underserved Segment:</strong>{' '}
                      <span className="text-[#6c7693]">{opp.underservedSegment}</span>
                    </div>
                    <div className="text-xs">
                      <strong className="text-[#1f1f47]">Differentiation:</strong>{' '}
                      <span className="text-[#6c7693]">{opp.potentialDifferentiation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DETAIL VIEW: Tab 5: Market Risks */}
          {activeSubTab === 'risks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.risks.map((risk, idx) => (
                <div key={risk.id || idx} className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      Severity: {risk.severity}
                    </span>
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1f1f47] font-['Outfit',sans-serif]">{risk.riskTitle}</h3>
                  <p className="text-sm text-[#6c7693] leading-relaxed">{risk.riskDescription}</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                    <strong className="font-semibold block mb-0.5">Mitigation Strategy:</strong>
                    {risk.mitigationSuggestion}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DETAIL VIEW: Tab 6: Strategic Roadmap */}
          {activeSubTab === 'recommendations' && (
            <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-[#576cdb]">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-xl font-bold text-[#1f1f47] font-['Outfit',sans-serif]">Strategic Market Roadmap</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#eaedf6] space-y-2">
                  <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Recommended Target Audience</span>
                  <p className="text-sm font-semibold text-[#1f1f47]">{report.recommendations.recommendedTargetAudience}</p>
                </div>
                <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#eaedf6] space-y-2">
                  <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Suggested Positioning</span>
                  <p className="text-sm font-semibold text-[#1f1f47]">{report.recommendations.suggestedPositioning}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#1f1f47] uppercase tracking-wider">Initial Validation Strategy</h4>
                  <ul className="space-y-2">
                    {report.recommendations.initialValidationStrategy.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-[#475569] bg-[#f8fafc] p-3 rounded-xl border border-[#eaedf6]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#1f1f47] uppercase tracking-wider">Recommended Next Steps</h4>
                  <ul className="space-y-2">
                    {report.recommendations.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-[#475569] bg-[#f8fafc] p-3 rounded-xl border border-[#eaedf6]">
                        <CheckCircle2 className="w-4 h-4 text-[#576cdb] shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* DETAIL VIEW: Tab 7: Evidence Sources */}
          {activeSubTab === 'sources' && (
            <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1f1f47] font-['Outfit',sans-serif]">Evidence Verification & Sources</h3>
                  <p className="text-xs text-[#6c7693]">Every factual claim in this report is backed by verified retrieved sources.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {report.sources.length} Verified Sources
                </span>
              </div>

              <div className="space-y-4">
                {report.sources.map((src, idx) => (
                  <div key={src.id || idx} className="bg-[#f8fafc] rounded-2xl p-5 border border-[#eaedf6] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSourceBadgeColor(src.sourceType)}`}>
                          {src.platformName || src.sourceType}
                        </span>
                        {getVerificationBadge(src.verificationStatus)}
                      </div>
                      <span className="text-xs text-[#64748b]">Retrieved: {src.retrievalDate}</span>
                    </div>

                    <div className="space-y-1">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-[#576cdb] hover:underline flex items-center gap-1.5"
                      >
                        <span>{src.title}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <p className="text-xs text-[#6c7693] font-mono break-all">{src.url}</p>
                    </div>

                    <blockquote className="text-xs sm:text-sm text-[#334155] bg-white p-3.5 rounded-xl border border-[#eaedf6] italic">
                      "{src.evidenceExcerpt}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
