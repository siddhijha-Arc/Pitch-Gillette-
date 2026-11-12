/**
 * GILLET PITCH ENGINE — Interactive Master App Tour & Guidance System
 *
 * Provides a comprehensive, beginner-friendly walkthrough of:
 * - Every single Tab (what it does, why it matters, how to use it)
 * - Every single Card and Metric (Readiness %, Root vs Symptom, Pillars, TOPSIS math, Judges)
 * - Interactive step-by-step tour mode with "Take me there" tab navigation
 * - Searchable Guide Directory for instant answers in plain language
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  FileText,
  GitFork,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  GitCompare,
  Presentation,
  Sparkles,
  BookOpen,
  TrendingDown,
  Award,
  ChevronRight,
  Lightbulb,
  ExternalLink,
  Search,
} from 'lucide-react';
import { TabId } from '../SidebarNavigation.tsx';

interface AppTourGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabId;
  onNavigateTab: (tab: TabId) => void;
}

interface TourStep {
  tabId: TabId;
  title: string;
  hindiTitle: string;
  category: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  whatItIs: string;
  whatItIsHindi: string;
  howToUse: string[];
  keyCardsExplained: Array<{
    name: string;
    description: string;
    tip?: string;
  }>;
  expectedOutcome: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    tabId: 'intake',
    title: 'Idea Intake & Pitch Studio',
    hindiTitle: 'Startup Idea Dalne Ka Page',
    category: 'Step 1 • Foundation',
    icon: FileText,
    iconColor: 'text-[#576cdb]',
    iconBg: 'bg-[#e0e7ff]',
    whatItIs:
      'The intake command center where you submit your startup concept. The AI immediately analyzes your pitch, computes an initial Readiness Score, and structures your venture for evaluation.',
    whatItIsHindi:
      'Yahan aap apna startup idea aur stage select karke submit karte hain. AI automatically iska industry, tagline aur initial readiness score calculate karta hai.',
    howToUse: [
      'Enter your Startup Name (mandatory, with red vibration check if left blank).',
      'Select your business stage: Concept, Early MVP, or Growth.',
      'Type or paste your elevator pitch and core value proposition.',
      'Click "Evaluate Pitch" to kick off the multi-module analysis.',
    ],
    keyCardsExplained: [
      {
        name: 'Readiness Index Circle (0-100%)',
        description: 'Measures overall investor preparedness based on systemic risk weights.',
        tip: 'Above 75% indicates your pitch has answered critical venture failure modes.',
      },
      {
        name: 'Stage Dropdown (Concept / MVP / Growth)',
        description: 'Tells the AI how strictly to evaluate your business model.',
      },
      {
        name: 'Active Venture Summary',
        description: 'Shows your derived industry vertical and positioning tagline.',
      },
    ],
    expectedOutcome: 'A structured venture profile ready for deep algorithmic de-risking.',
  },
  {
    tabId: 'decomposition',
    title: 'Problem DAG (Causal Graph)',
    hindiTitle: 'Asli Wajah (Root Causes) & Asar (Symptoms)',
    category: 'Step 2 • Problem Science',
    icon: GitFork,
    iconColor: 'text-[#ea580c]',
    iconBg: 'bg-[#ffedd5]',
    whatItIs:
      'A multi-tier causal network separating foundational Root Causes from intermediate bottlenecks and surface Symptoms. Prevents founders from wasting capital solving mere symptoms.',
    whatItIsHindi:
      'Yeh page batata hai ki aapke startup ke problem ki asli jadd (Root Cause) kya hai, beech ki rukawate (Bottlenecks) kya hain, aur bahar kya asar (Symptoms) dikh raha hai.',
    howToUse: [
      'Use the "Simplified Flow" view for a clean 3-step causal chain.',
      'Click on any Root Cause (Red) to see exactly which downstream bottlenecks (Orange) and symptoms (Yellow) it creates.',
      'Switch to "Interactive Graph Canvas" if you want 2D pan/zoom network exploration.',
      'Inspect the Side Drawer to see verified facts vs founder assumptions.',
    ],
    keyCardsExplained: [
      {
        name: '🔴 Root Causes (Origin Bottlenecks)',
        description: 'The foundational laws of physics, market, or unit economics causing all troubles. Fix these first!',
        tip: 'If you cure the Root Cause, all connected symptoms disappear automatically.',
      },
      {
        name: '🟠 Intermediate Problems (Catalysts)',
        description: 'Middle operational hurdles triggered by root causes that amplify friction.',
      },
      {
        name: '🟡 Symptoms (Visible Pain)',
        description: 'Surface metrics like low user conversion, high churn, or slow loading.',
        tip: 'Treating a symptom without fixing its root cause is like taking painkiller for a fracture.',
      },
      {
        name: 'Primary Critical Causal Chain Banner',
        description: 'AI plain-language summary of your most dangerous cascading failure path.',
      },
    ],
    expectedOutcome: 'Crystal clarity on the #1 core structural problem you must solve first.',
  },
  {
    tabId: 'gaps',
    title: '6-Pillar Gap Audit (GILLET CHECK)',
    hindiTitle: '6 Pillars Ki Kamiyan (Audit)',
    category: 'Step 3 • Venture Diligence',
    icon: ShieldAlert,
    iconColor: 'text-[#e11d48]',
    iconBg: 'bg-[#ffe4e6]',
    whatItIs:
      'An exhaustive due-diligence audit examining 6 critical pillars of venture survival: Market TAM, Tech Viability, Unit Economics, GTM Distribution, Legal/Compliance, and Competitive Moat.',
    whatItIsHindi:
      'VCs aapke pitch mein kya kamiyan dhundenge, yeh 6 categories mein audit karta hai. Har card ka color uski severity (risk level) batata hai.',
    howToUse: [
      'Look at all 6 cards arranged in the 3x2 grid.',
      'Soft Mint = Low Severity, Soft Warm Yellow = Moderate, Soft Blush Rose = High/Fatal Severity.',
      'Click any card to open the complete breakdown of identified deficiencies and recommended fixes.',
    ],
    keyCardsExplained: [
      {
        name: 'Market & Customer Validation',
        description: 'Audits if your TAM is large enough and if customer need is urgent vs "nice-to-have".',
      },
      {
        name: 'Technical Viability',
        description: 'Verifies architecture scaling, hardware/cloud latency, and core IP defensibility.',
      },
      {
        name: 'Financial Feasibility',
        description: 'Audits gross margins, CAC/LTV ratios, burn multiples, and capital intensity.',
      },
      {
        name: 'Distribution & GTM',
        description: 'Examines customer acquisition channels, virality, and sales cycle speed.',
      },
      {
        name: 'Legal & Regulatory',
        description: 'Flags compliance liabilities, data privacy (GDPR/HIPAA), and jurisdictional barriers.',
      },
      {
        name: 'Competitive Moat',
        description: 'Evaluates switching costs, network effects, data flywheels, and competitor retaliation.',
      },
    ],
    expectedOutcome: 'Zero blind spots before stepping in front of real investors.',
  },
  {
    tabId: 'topsis',
    title: 'Find Your Best Solution',
    hindiTitle: 'Startup Ka Sabse Best Solution Dhoondo',
    category: 'Step 4 • Priority-Matched Solutions',
    icon: SlidersHorizontal,
    iconColor: 'text-[#059669]',
    iconBg: 'bg-[#dcfce7]',
    whatItIs:
      'Compare different ways to solve your startup’s biggest challenges. Ranks solutions based on how well they match your custom priorities (cost, speed, scale, simplicity, and market impact).',
    whatItIsHindi:
      'Aapke preferences (kam kharch, jaldi launch, scale) ke hisab se mathematically calculate karta hai ki aapke startup ke liye sabse best rasta koun sa hai.',
    howToUse: [
      'Answer the 5 simple priority questions or choose a preset like "Bootstrapped", "Fast MVP", or "VC Hypergrowth".',
      'Review the #1 Recommended Solution with its key advantages, trade-offs, and immediate next steps.',
      'Compare alternative options or open the "Advanced Analysis" tab to inspect the raw TOPSIS mathematical matrix.',
    ],
    keyCardsExplained: [
      {
        name: 'Solution Candidate Cards (Rank #1, #2, #3)',
        description: 'Concrete strategic interventions ranked by mathematical optimality.',
        tip: 'Rank 1 is closest to the Ideal Best and furthest from the Ideal Worst.',
      },
      {
        name: 'Tactile Weight Sliders',
        description: 'Custom sliders letting you decide what your startup prioritizes right now.',
      },
      {
        name: 'TOPSIS Score (Ci)',
        description: 'Relative closeness coefficient between 0 and 1. Higher is mathematically superior.',
      },
    ],
    expectedOutcome: 'An unassailable, mathematically proven roadmap for your next engineering sprint.',
  },
  {
    tabId: 'questions',
    title: 'Adaptive Q&A Engine',
    hindiTitle: 'AI Ke Sawal & Founder Assumptions',
    category: 'Step 5 • De-risking Inquiries',
    icon: HelpCircle,
    iconColor: 'text-[#9333ea]',
    iconBg: 'bg-[#f3e8ff]',
    whatItIs:
      'A precision inquiry module that detects high-entropy (high uncertainty) assumptions in your pitch and asks targeted clarifying questions to raise your readiness score.',
    whatItIsHindi:
      'AI aapse woh sabse zaroori sawal poochta hai jahan aapne assume kiya hai lekin prove nahi kiya. Answer karne se aapka readiness score badhta hai.',
    howToUse: [
      'Read the priority question and the investor rationale behind it.',
      'Click one of the suggested quick-answers or type your custom answer.',
      'Submit to resolve the assumption and automatically re-calculate venture metrics.',
    ],
    keyCardsExplained: [
      {
        name: 'Priority Question Card',
        description: 'The single most urgent question that will remove the largest variance of risk.',
      },
      {
        name: 'Investor Rationale Callout',
        description: 'Explains why a VC will drill into this specific point during pitch Q&A.',
      },
      {
        name: 'Resolved Assumptions Archive',
        description: 'History of previous questions answered with their impact on readiness.',
      },
    ],
    expectedOutcome: 'Tighter answers for the hardest questions investors will ask.',
  },
  {
    tabId: 'agents',
    title: '6-Persona AI Reviewer Council',
    hindiTitle: '6 AI Judges & 1-on-1 Chat',
    category: 'Step 6 • Stress Testing',
    icon: Users,
    iconColor: 'text-[#2563eb]',
    iconBg: 'bg-[#dbeafe]',
    whatItIs:
      'A multi-agent review board of 6 specialized personas who debate your pitch from opposing viewpoints. Includes live 1-on-1 sparring chat with any individual judge.',
    whatItIsHindi:
      'Yahan 6 alag-alag expert judges aapke pitch ko judge karte hain. Aap kisi bhi judge ke sath akele mein 1-on-1 chat karke debate bhi kar sakte hain.',
    howToUse: [
      'Review each judge card: VC Partner, ICP Customer, Tech Architect, Lawyer, Financial Analyst, Product Builder.',
      'Check the Consensus Report to see if your idea is universally loved or highly polarizing.',
      'Click "Chat with [Judge]" on any avatar card to open a 1-on-1 sparring session with that persona.',
    ],
    keyCardsExplained: [
      {
        name: '💼 VC Partner',
        description: 'Focuses on 100x TAM, market size, and whether this can be a fund-returner.',
      },
      {
        name: '👤 ICP Customer',
        description: 'Focuses on real willingness to pay, everyday friction, and usability.',
      },
      {
        name: '⚙️ Tech Architect',
        description: 'Focuses on infrastructure scalability, algorithmic moat, and latency.',
      },
      {
        name: '⚖️ Healthcare / Regulatory Lawyer',
        description: 'Focuses on liability exposure, data compliance, and legal roadblocks.',
      },
      {
        name: '📊 Financial Analyst',
        description: 'Focuses on CAC payback, gross margin sustainability, and burn rate.',
      },
      {
        name: '🎯 Product Builder',
        description: 'Focuses on onboarding simplicity, retention loops, and product-market fit.',
      },
    ],
    expectedOutcome: 'Pre-pitch trial simulations so real investor meetings feel easy.',
  },
  {
    tabId: 'improvement',
    title: 'Pitch V2 Diff & Evolution',
    hindiTitle: 'Pitch Ka Naya V2 Version',
    category: 'Step 7 • Pitch Synthesis',
    icon: GitCompare,
    iconColor: 'text-[#4f46e5]',
    iconBg: 'bg-[#ede9fe]',
    whatItIs:
      'Synthesizes everything learned from the gaps, solutions, and judge critiques into an upgraded, de-risked version (V2, V3...) of your pitch.',
    whatItIsHindi:
      'Aapke original pitch aur AI ke de-risked pitch ko side-by-side compare karta hai, aur dikhata hai ki koun si kamiyan resolve ho chuki hain.',
    howToUse: [
      'Click "Generate Refined Pitch V2" to create an evolved version.',
      'Inspect the Side-by-Side Diff to see exactly what copy changed.',
      'Check the readiness delta score (e.g. +22% improvement).',
    ],
    keyCardsExplained: [
      {
        name: 'Side-by-Side Pitch Diff',
        description: 'Highlights text added, modified, or strengthened between versions.',
      },
      {
        name: 'Resolved Gaps Checklist',
        description: 'Every audit vulnerability that the new version successfully mitigates.',
      },
      {
        name: 'Readiness Delta (+X%)',
        description: 'Quantifiable improvement in fundability between pitch iterations.',
      },
    ],
    expectedOutcome: 'A rock-solid investor pitch with all critical risks pre-emptively addressed.',
  },
  {
    tabId: 'deck',
    title: 'Executive Pitch Deck Export',
    hindiTitle: 'PowerPoint (.pptx) Presentation Download',
    category: 'Step 8 • Investor Deliverable',
    icon: Presentation,
    iconColor: 'text-[#0891b2]',
    iconBg: 'bg-[#cffafe]',
    whatItIs:
      'Generates a professional 10-slide investor pitch deck exportable directly to native Microsoft PowerPoint (.pptx) format.',
    whatItIsHindi:
      'Aapke pure evaluation ka 10-slide PowerPoint (.pptx) presentation banata hai jise aap download karke directly investors ko present kar sakte hain.',
    howToUse: [
      'Choose your presentation theme: Executive Dark, Clean Light, Midnight Navy, or Minimalist.',
      'Browse through slide previews (Problem, Solution, TAM, Business Model, Moat, The Ask).',
      'Click "Download PPTX" to save the native presentation file to your device.',
    ],
    keyCardsExplained: [
      {
        name: '10-Slide Deck Structure',
        description: 'Standard institutional VC slide sequence (Problem ➔ TAM ➔ Tech ➔ GTM ➔ Financials).',
      },
      {
        name: 'Native .PPTX Exporter',
        description: 'Generates real editable shapes, text boxes, and tables (not flat screenshots).',
      },
      {
        name: 'Theme Palette Selector',
        description: 'Allows instant visual styling between dark high-contrast and clean light styles.',
      },
    ],
    expectedOutcome: 'An institutional-quality pitch deck ready for your seed or Series A pitch.',
  },
];

export const AppTourGuideModal: React.FC<AppTourGuideModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    const idx = TOUR_STEPS.findIndex((s) => s.tabId === activeTab);
    return idx >= 0 ? idx : 0;
  });

  const [activeMode, setActiveMode] = useState<'STEP_TOUR' | 'DIRECTORY' | 'GLOSSARY'>(
    'STEP_TOUR'
  );
  const [languageMode, setLanguageMode] = useState<'ENGLISH' | 'HINGLISH'>('ENGLISH');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleJumpToTab = (tabId: TabId) => {
    onNavigateTab(tabId);
    onClose();
  };

  const filteredSteps = TOUR_STEPS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.whatItIs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.keyCardsExplained.some((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#eaedf6] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10"
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#eaedf6] bg-gradient-to-r from-[#f8f9ff] via-white to-[#f8f9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#576cdb] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(87,108,219,0.3)] shrink-0">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
                  Gillette App Tour & Master Guide
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e0e7ff] text-[#576cdb]">
                  Interactive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
                Har tab, har card aur feature ka complete matlab aur use karne ka tarika.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#f1f4fb] p-1 rounded-full border border-[#eaedf6]">
              <button
                onClick={() => setLanguageMode('ENGLISH')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  languageMode === 'ENGLISH'
                    ? 'bg-white text-[#576cdb] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguageMode('HINGLISH')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  languageMode === 'HINGLISH'
                    ? 'bg-white text-[#576cdb] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Hinglish
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Nav Bar */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-[#eaedf6] bg-white flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveMode('STEP_TOUR')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'STEP_TOUR'
                  ? 'bg-[#576cdb] text-white shadow-xs'
                  : 'bg-[#f8f9fb] text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Step-by-Step Tour</span>
            </button>

            <button
              onClick={() => setActiveMode('DIRECTORY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'DIRECTORY'
                  ? 'bg-[#576cdb] text-white shadow-xs'
                  : 'bg-[#f8f9fb] text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All 8 Tabs Explained</span>
            </button>

            <button
              onClick={() => setActiveMode('GLOSSARY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'GLOSSARY'
                  ? 'bg-[#576cdb] text-white shadow-xs'
                  : 'bg-[#f8f9fb] text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Cards & Metrics Glossary</span>
            </button>
          </div>

          <span className="text-xs text-[#8a94a6] font-medium hidden sm:inline">
            Step {currentStepIndex + 1} of {TOUR_STEPS.length}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* MODE 1: STEP-BY-STEP TOUR */}
          {activeMode === 'STEP_TOUR' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Step Navigation Pill Indicator */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {TOUR_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = idx === currentStepIndex;
                  return (
                    <button
                      key={step.tabId}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#576cdb] text-white shadow-xs'
                          : 'bg-[#f1f4fb] text-[#64748b] hover:bg-[#eaedf6]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{idx + 1}. {step.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Current Step Hero Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#f8f9fd] to-white border border-[#eaedf6] shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-14 h-14 rounded-2xl ${currentStep.iconBg} ${currentStep.iconColor} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <currentStep.icon className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#576cdb] uppercase tracking-wider block">
                        {currentStep.category}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
                        {currentStep.title}
                      </h3>
                      <span className="text-xs text-[#64748b] font-medium block">
                        {currentStep.hindiTitle}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJumpToTab(currentStep.tabId)}
                    className="px-4 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center shrink-0"
                  >
                    <span>Open This Tab Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* What It Does Section */}
                <div className="p-4 rounded-xl bg-white border border-[#eaedf6] space-y-2">
                  <h4 className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#576cdb]" />
                    {languageMode === 'ENGLISH' ? 'What This Tab Does' : 'Yeh Page Kya Karta Hai?'}
                  </h4>
                  <p className="text-sm text-[#334155] leading-relaxed font-normal">
                    {languageMode === 'ENGLISH'
                      ? currentStep.whatItIs
                      : currentStep.whatItIsHindi}
                  </p>
                </div>

                {/* How to use checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider">
                    {languageMode === 'ENGLISH' ? 'How to Use It (Step-by-Step)' : 'Isko Use Kaise Karein'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentStep.howToUse.map((instruction, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-[#eaedf6] text-xs text-[#334155] flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#e0e7ff] text-[#576cdb] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Cards Explained */}
                <div className="space-y-2.5 pt-2 border-t border-[#eaedf6]">
                  <h4 className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider">
                    {languageMode === 'ENGLISH' ? 'Cards & Features on this Page' : 'Is Page Ke Har Card Ka Matlab'}
                  </h4>
                  <div className="space-y-2">
                    {currentStep.keyCardsExplained.map((card, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-white border border-[#eaedf6] space-y-1 hover:border-[#576cdb]/40 transition-colors"
                      >
                        <div className="text-xs font-bold text-[#0f172a] flex items-center justify-between">
                          <span>{card.name}</span>
                        </div>
                        <p className="text-xs text-[#64748b] leading-relaxed">
                          {card.description}
                        </p>
                        {card.tip && (
                          <div className="text-[11px] text-[#576cdb] font-medium flex items-center gap-1 pt-0.5">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span>{card.tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Outcome */}
                <div className="p-3.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center gap-2.5 text-xs text-[#065f46]">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <div>
                    <span className="font-bold">Final Takeaway: </span>
                    <span>{currentStep.expectedOutcome}</span>
                  </div>
                </div>
              </div>

              {/* Prev / Next Footer Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="px-4 py-2.5 rounded-full border border-[#eaedf6] text-xs font-bold text-[#0f172a] hover:bg-[#f8f9fb] transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                <div className="flex items-center gap-1">
                  {TOUR_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentStepIndex
                          ? 'w-6 bg-[#576cdb]'
                          : 'w-1.5 bg-[#cbd5e1]'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentStepIndex === TOUR_STEPS.length - 1}
                  className="px-5 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: DIRECTORY OF ALL 8 TABS */}
          {activeMode === 'DIRECTORY' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a94a6]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any tab, card, or feature (e.g. TOPSIS, Root Cause, Judges, PPTX)..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f8f9fb] border border-[#eaedf6] text-xs text-[#0f172a] placeholder-[#8a94a6] focus:outline-hidden focus:border-[#576cdb] focus:bg-white transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSteps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.tabId}
                      className="p-5 rounded-2xl bg-white border border-[#eaedf6] hover:border-[#576cdb]/50 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl ${step.iconBg} ${step.iconColor} flex items-center justify-center font-bold`}
                            >
                              <Icon className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-[#8a94a6] uppercase tracking-wider block">
                                Step {idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-[#576cdb] transition-colors">
                                {step.title}
                              </h4>
                            </div>
                          </div>

                          <span className="text-[11px] font-semibold text-[#64748b]">
                            {step.hindiTitle}
                          </span>
                        </div>

                        <p className="text-xs text-[#64748b] mt-3 leading-relaxed line-clamp-3">
                          {languageMode === 'ENGLISH' ? step.whatItIs : step.whatItIsHindi}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#eaedf6] flex items-center justify-between">
                        <button
                          onClick={() => {
                            setCurrentStepIndex(idx);
                            setActiveMode('STEP_TOUR');
                          }}
                          className="text-xs font-bold text-[#576cdb] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Detailed Walkthrough</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleJumpToTab(step.tabId)}
                          className="px-3 py-1.5 rounded-full bg-[#f1f4fb] hover:bg-[#576cdb] hover:text-white text-xs font-bold text-[#0f172a] transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Open Tab</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 3: CARDS & METRICS GLOSSARY */}
          {activeMode === 'GLOSSARY' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#eaedf6] text-xs text-[#334155]">
                <span className="font-bold text-[#576cdb]">💡 Quick Cheatsheet: </span>
                <span>
                  Below is an index of every key metric, card type, and score across Gillette Pitch Engine.
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    term: 'Readiness Index (0-100%)',
                    meaning:
                      'The overall institutional fundability score. It measures whether your business model has answers to key technical, market, financial, and legal risks.',
                    hindiMeaning: 'Overall kitna tayyar hai aapka startup investors ke samne jane ke liye.',
                    tab: 'Idea Intake / Everywhere',
                  },
                  {
                    term: '🔴 Root Cause vs 🟡 Symptom',
                    meaning:
                      'Root Causes are the foundational physical/market origin constraints. Symptoms (churn, low conversion) are just surface manifestations. Fix root causes first!',
                    hindiMeaning: 'Root Cause asli bimari hai; Symptom sirf bukhar hai. Asli bimari theek karo.',
                    tab: 'Problem DAG',
                  },
                  {
                    term: '🟠 Intermediate Problems (Bottlenecks)',
                    meaning:
                      'Problems that sit in between root causes and symptoms. They are caused by root problems and pass the friction downstream.',
                    hindiMeaning: 'Beech ki rukawat jo root cause ki wajah se paida hoti hai.',
                    tab: 'Problem DAG',
                  },
                  {
                    term: 'Fatal Flaw vs Critical Gap',
                    meaning:
                      'A Fatal Flaw will instantly kill an investment deal or make the company unviable. A Critical Gap is a major operational risk that must be addressed in the next 90 days.',
                    hindiMeaning: 'Fatal Flaw deal todne wali kami hai; Critical Gap 90 din mein solve karni hoti hai.',
                    tab: '6-Pillar Gap Audit',
                  },
                  {
                    term: 'TOPSIS Distance & Score (Ci)',
                    meaning:
                      'Mathematical ranking between 0.000 and 1.000 calculating geometric closeness to the Ideal Best solution versus the Ideal Worst.',
                    hindiMeaning: 'Pure mathematics se batata hai ki sabse behtar solution koun sa hai.',
                    tab: 'TOPSIS Studio',
                  },
                  {
                    term: 'Information-Entropy Q&A',
                    meaning:
                      'Questions ranked by mathematical uncertainty. Answering high-entropy questions resolves critical founder assumptions and maximizes readiness score gain.',
                    hindiMeaning: 'AI aapse sabse zaroori sawal poochta hai jisse risk khatm ho sake.',
                    tab: 'Adaptive Q&A',
                  },
                  {
                    term: '1-on-1 Persona Sparring Chat',
                    meaning:
                      'Interactive real-time dialogue with simulated VC, Customer, CTO, Lawyer, or Financial Analyst to test and defend your claims before real meetings.',
                    hindiMeaning: 'Alag-alag expert judges ke sath akele mein debate aur practice karna.',
                    tab: 'Agent Council',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white border border-[#eaedf6] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#0f172a]">
                        {item.term}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f1f4fb] text-[#64748b]">
                        Found in: {item.tab}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] leading-relaxed">
                      {languageMode === 'ENGLISH' ? item.meaning : item.hindiMeaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
