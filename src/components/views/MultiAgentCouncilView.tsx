/**
 * Multi-Agent Evaluation Council View - Gillette Pitch Engine
 *
 * Exclusively displays persona-based reviewer perspective cards matching
 * the exact layout, typography, positioning, and spacing from the reference design.
 * Features top pastel banner with vector diagram, 2-line profession title with plus icon,
 * crisp 3-line review description, and centered pastel pill button.
 * Pure Light Mode.
 *
 * Redesigned Persona Sparring Modal inspired by Super Chat UI:
 * - Clean uncluttered layout with 2 views (Live Persona Sparring & Executive Audit).
 * - Clickable prompt cards & clickable dimension score chips.
 * - Copy response actions, regenerate response, and crisp SaaS typography.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw,
  Sparkles,
  X,
  MessageSquare,
  Send,
  User,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Bot,
} from 'lucide-react';
import { AgentCritique, StartupIdea } from '../../types/index.ts';

interface MultiAgentCouncilViewProps {
  idea: StartupIdea;
  onRunAgents: () => void;
  isLoading: boolean;
}

// Eagerly prefetch avatar WebP images in the browser cache so they appear in milliseconds
const PRELOAD_AVATARS = [
  '/assets/aistudio/1000013129_20499cfa.webp',
  '/assets/aistudio/1000013131_173bcf1b.webp',
  '/assets/aistudio/1000013134_4647e05a.webp',
  '/assets/aistudio/1000013133_3217a220.webp',
  '/assets/aistudio/1000013130_64969f18.webp',
  '/assets/aistudio/1000013132_ceaba763.webp',
];
if (typeof window !== 'undefined') {
  PRELOAD_AVATARS.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

const AGENT_CONFIG: Record<
  string,
  {
    titleLine1: string;
    titleLine2: string;
    roleName: string;
    buttonText: string;
    cardBg: string;
    pillBg: string;
    pillText: string;
    avatarUrl: string;
    avatarPng?: string;
    quickPrompts: string[];
  }
> = {
  VC_PARTNER: {
    titleLine1: 'Venture',
    titleLine2: 'capitalist',
    roleName: 'General Partner, Tier-1 VC',
    buttonText: 'Chat with VC',
    cardBg: 'bg-[#dce7fe]',
    pillBg: 'bg-[#dce7fe] hover:bg-[#c9dafc]',
    pillText: 'text-[#3b5998]',
    avatarUrl: '/assets/aistudio/1000013129_20499cfa.webp',
    avatarPng: '/assets/aistudio/1000013129_20499cfa.png',
    quickPrompts: [
      'What TAM & market moat metric would upgrade your score to 10/10?',
      'How should we structure our Series A valuation pitch?',
      'What unit economics do you need to see before investing?',
    ],
  },
  ICP_CUSTOMER: {
    titleLine1: 'Customer',
    titleLine2: 'perspective',
    roleName: 'Chief Medical Officer, Regional Hospital System',
    buttonText: 'Chat with Customer',
    cardBg: 'bg-[#d7f3e3]',
    pillBg: 'bg-[#d7f3e3] hover:bg-[#c2ebd1]',
    pillText: 'text-[#1b764b]',
    avatarUrl: '/assets/aistudio/1000013131_173bcf1b.webp',
    avatarPng: '/assets/aistudio/1000013131_173bcf1b.png',
    quickPrompts: [
      'How can we prove zero clinical liability to your hospital board?',
      'What EHR integration features (Epic/Cerner) are non-negotiable?',
      'What transfer response time would make you sign a contract today?',
    ],
  },
  TECH_ARCHITECT: {
    titleLine1: 'Tech',
    titleLine2: 'architect',
    roleName: 'Veteran CTO & Systems Architect',
    buttonText: 'Chat with CTO',
    cardBg: 'bg-[#fdf3cf]',
    pillBg: 'bg-[#fdf3cf] hover:bg-[#fcedba]',
    pillText: 'text-[#854d0e]',
    avatarUrl: '/assets/aistudio/1000013134_4647e05a.webp',
    avatarPng: '/assets/aistudio/1000013134_4647e05a.png',
    quickPrompts: [
      'How do we guarantee 99.99% uptime in low-connectivity environments?',
      'What hardware/telemetry stack do you recommend for our MVP?',
      'How can we eliminate latency bottlenecks in high-stress dispatch?',
    ],
  },
  LEGAL_COUNSEL: {
    titleLine1: 'Healthcare',
    titleLine2: 'lawyer',
    roleName: 'Healthcare Regulatory & Compliance Attorney',
    buttonText: 'Chat with Lawyer',
    cardBg: 'bg-[#efe6fd]',
    pillBg: 'bg-[#efe6fd] hover:bg-[#e2d2fc]',
    pillText: 'text-[#6d28d9]',
    avatarUrl: '/assets/aistudio/1000013133_3217a220.webp',
    avatarPng: '/assets/aistudio/1000013133_3217a220.png',
    quickPrompts: [
      'How do we structure our corporate entity to satisfy state medical boards?',
      'What contract terms prevent Anti-Kickback statute violations?',
      'What HIPAA compliance safeguards must we launch with on Day 1?',
    ],
  },
  FINANCIAL_ANALYST: {
    titleLine1: 'Financial',
    titleLine2: 'analyst',
    roleName: 'CFO & Unit Economics Specialist',
    buttonText: 'Chat with Analyst',
    cardBg: 'bg-[#ffe5d9]',
    pillBg: 'bg-[#ffe5d9] hover:bg-[#fed3c1]',
    pillText: 'text-[#c2410c]',
    avatarUrl: '/assets/aistudio/1000013130_64969f18.webp',
    avatarPng: '/assets/aistudio/1000013130_64969f18.png',
    quickPrompts: [
      'How can we improve our gross margin profile above 70%?',
      'What is the safest pricing tier strategy for enterprise contracts?',
      'What CAC payback period benchmark should we aim for?',
    ],
  },
  HACKATHON_JUDGE: {
    titleLine1: 'Product',
    titleLine2: 'builder',
    roleName: 'Product Builder & Founder',
    buttonText: 'Chat with Founder',
    cardBg: 'bg-[#dbeafe]',
    pillBg: 'bg-[#dbeafe] hover:bg-[#c9dafc]',
    pillText: 'text-[#2563eb]',
    avatarUrl: '/assets/aistudio/1000013132_ceaba763.webp',
    avatarPng: '/assets/aistudio/1000013132_ceaba763.png',
    quickPrompts: [
      'What is the single core feature we should focus on for our 30-day MVP?',
      'How do we remove onboarding friction for ambulance operators?',
      'What pitch narrative framing works best for demo presentations?',
    ],
  },
};

interface ChatMessage {
  sender: 'user' | 'judge';
  text: string;
  timestamp: string;
}

export const MultiAgentCouncilView: React.FC<MultiAgentCouncilViewProps> = ({
  idea,
  onRunAgents,
  isLoading,
}) => {
  const critiques = idea.agentCritiques || [];

  // Selected judge persona for live pop-up modal & discussion
  const [selectedCritique, setSelectedCritique] = useState<AgentCritique | null>(null);

  // Per-agent chat history state map: agentRole -> ChatMessage[]
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});

  // Active chat input string & loading state
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // Modal mode: 'CHAT' (Super Chat Sparring) vs 'AUDIT' (Full Audit Report)
  const [activeModalTab, setActiveModalTab] = useState<'CHAT' | 'AUDIT'>('CHAT');

  // Copy indicator state
  const [copiedMsgIndex, setCopiedMsgIndex] = useState<number | null>(null);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'STRONG_BUY':
        return 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]';
      case 'CONDITIONAL_PASS':
        return 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]';
      default:
        return 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';
    }
  };

  const openJudgeModal = (critique: AgentCritique) => {
    setSelectedCritique(critique);
    setChatInput('');
    setActiveModalTab('CHAT');

    // Initialize initial greeting if chat history is empty
    if (!chatHistories[critique.agent] || chatHistories[critique.agent].length === 0) {
      const config = AGENT_CONFIG[critique.agent] || { titleLine1: critique.title, titleLine2: '' };
      const fullTitle = `${config.titleLine1} ${config.titleLine2}`.trim();
      const initialGreeting: ChatMessage = {
        sender: 'judge',
        text: `Hello! I'm ${critique.agentName} (${fullTitle}). I gave your pitch a score of ${critique.overallScore}/10 (${critique.verdict.replace(/_/g, ' ')}).\n\nMy core takeaway: "${critique.summaryQuote}"\n\nAsk me anything about my evaluation, or click any suggested question on the right!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistories((prev) => ({
        ...prev,
        [critique.agent]: [initialGreeting],
      }));
    }
  };

  const closeJudgeModal = () => {
    setSelectedCritique(null);
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIndex(index);
    setTimeout(() => {
      setCopiedMsgIndex(null);
    }, 2000);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput.trim();
    if (!textToSend || !selectedCritique || isChatSending) return;

    const agentRole = selectedCritique.agent;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: nowStr,
    };

    // Append user message immediately
    const existingHistory = chatHistories[agentRole] || [];
    const updatedHistory = [...existingHistory, userMsg];

    setChatHistories((prev) => ({
      ...prev,
      [agentRole]: updatedHistory,
    }));
    setChatInput('');
    setIsChatSending(true);

    try {
      const customKey = localStorage.getItem('gillette_gemini_api_key') || localStorage.getItem('pitchready_gemini_api_key') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['X-Gemini-Api-Key'] = customKey;
      }

      const res = await fetch(`/api/ideas/${idea.id}/agents/${agentRole}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userMessage: textToSend,
          chatHistory: existingHistory.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.response) {
        const judgeMsg: ChatMessage = {
          sender: 'judge',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistories((prev) => ({
          ...prev,
          [agentRole]: [...(prev[agentRole] || []), judgeMsg],
        }));
      } else {
        const errorMsg: ChatMessage = {
          sender: 'judge',
          text: `[System]: ${data.error || 'Failed to connect with judge persona. Please check your Gemini API key.'}`,
          timestamp: nowStr,
        };
        setChatHistories((prev) => ({
          ...prev,
          [agentRole]: [...(prev[agentRole] || []), errorMsg],
        }));
      }
    } catch (err: any) {
      console.error('Failed to chat with judge:', err);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleRegenerateLast = () => {
    if (!selectedCritique || isChatSending) return;
    const history = chatHistories[selectedCritique.agent] || [];
    if (history.length <= 1) return;

    // Find last user message
    const lastUserMsg = [...history].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.text);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
  };

  // Auto-run Evaluation Council if not yet deliberated
  React.useEffect(() => {
    if ((!idea.agentCritiques || idea.agentCritiques.length === 0) && !isLoading) {
      onRunAgents();
    }
  }, [idea.agentCritiques, isLoading, onRunAgents]);

  return (
    <div className="space-y-6 w-full mx-auto py-2 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Top Header with Run Deliberation Action */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-6"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1f1f47] tracking-tight">
            Evaluation Council
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1.5 font-normal leading-relaxed">
            Persona-based reviewer perspectives with real-time 1-on-1 judge discussions.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRunAgents}
          disabled={isLoading}
          className="px-7 py-3.5 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(87,108,219,0.25)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Deliberating Council...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Run Council Deliberation</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* 2. Grid of Persona Reviewer Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
      >
        {critiques.map((critique) => {
          const config = AGENT_CONFIG[critique.agent] || {
            titleLine1: critique.title,
            titleLine2: '',
            roleName: critique.agentName,
            buttonText: 'Chat',
            cardBg: 'bg-[#dce7fe]',
            pillBg: 'bg-[#dce7fe] hover:bg-[#c9dafc]',
            pillText: 'text-[#3b5998]',
            avatarUrl: '/assets/aistudio/1000013129_20499cfa.webp',
            avatarPng: '/assets/aistudio/1000013129_20499cfa.png',
            quickPrompts: [],
          };

          return (
            <motion.div
              key={critique.agent}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.07)' }}
              whileTap={{ scale: 0.99 }}
              onClick={() => openJudgeModal(critique)}
              className={`${config.cardBg} rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-transparent transition-all duration-200 cursor-pointer flex flex-col justify-between group select-none`}
            >
              {/* Top Pastel Banner with Grounded 3D Persona Avatar */}
              <div className="relative h-56 sm:h-64 flex items-end justify-center overflow-hidden select-none">
                <picture className="relative z-10 h-52 sm:h-60 w-auto max-w-[88%] flex items-end justify-center">
                  <source srcSet={config.avatarUrl} type="image/webp" />
                  <img
                    src={config.avatarPng || config.avatarUrl}
                    alt={config.roleName}
                    className="h-52 sm:h-60 w-auto object-contain object-bottom drop-shadow-[0_6px_14px_rgba(0,0,0,0.12)] transform transition-transform duration-300 group-hover:scale-105 translate-y-[2px]"
                    loading="eager"
                    decoding="async"
                  />
                </picture>
              </div>

              {/* Lower White Section */}
              <div className="bg-white rounded-t-[28px] rounded-b-[32px] p-6 pt-5 pb-6 flex flex-col justify-between flex-1 relative z-20">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-['Outfit',sans-serif] text-[22px] font-semibold text-[#1e2532] leading-[1.18] tracking-tight">
                      <div>{config.titleLine1}</div>
                      <div className="lowercase font-normal">{config.titleLine2}</div>
                    </h3>
                    <span className="text-[#94a3b8] text-[20px] font-light leading-none group-hover:text-[#4b5563] transition-colors mt-0.5">
                      +
                    </span>
                  </div>

                  <p className="font-sans text-[13px] text-[#6c7693] font-normal leading-[1.5] mt-3 line-clamp-3">
                    "{critique.summaryQuote}"
                  </p>
                </div>

                <div className="mt-6 pt-2 flex items-center justify-between">
                  <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold font-sans transition-colors ${config.pillBg} ${config.pillText}`}>
                    {config.buttonText}
                  </span>
                  <span className="text-xs font-bold font-mono text-[#576cdb]">
                    {critique.overallScore}/10
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 3. Redesigned Premium Persona Sparring Modal (Super Chat UI Style) */}
      <AnimatePresence>
        {selectedCritique && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Animated Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeJudgeModal}
              className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-[6px]"
            />

            {/* Premium SaaS Pop-up Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
              className="relative w-full max-w-5xl bg-[#f8f9fd] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 border border-white/60"
            >
              {(() => {
                const config = AGENT_CONFIG[selectedCritique.agent] || {
                  titleLine1: selectedCritique.title,
                  titleLine2: '',
                  roleName: selectedCritique.agentName,
                  buttonText: 'Chat',
                  cardBg: 'bg-[#dce7fe]',
                  pillBg: 'bg-[#dce7fe]',
                  pillText: 'text-[#3b5998]',
                  avatarUrl: '/assets/aistudio/1000013129_20499cfa.webp',
                  avatarPng: '/assets/aistudio/1000013129_20499cfa.png',
                  quickPrompts: [],
                };
                const badgeClass = getVerdictBadge(selectedCritique.verdict);
                const history = chatHistories[selectedCritique.agent] || [];
                const fullJudgeTitle = `${config.titleLine1} ${config.titleLine2}`.trim();

                return (
                  <>
                    {/* Modal Top Header Bar */}
                    <div className="px-6 py-4 border-b border-[#eaedf6] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                      {/* Left: Persona Identity */}
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl ${config.cardBg} relative overflow-hidden flex items-end justify-center p-0.5 shrink-0 shadow-2xs border border-white/80`}>
                          <picture className="relative z-10 h-11 w-auto flex items-end justify-center">
                            <source srcSet={config.avatarUrl} type="image/webp" />
                            <img
                              src={config.avatarPng || config.avatarUrl}
                              alt={config.roleName}
                              className="relative z-10 h-11 w-auto object-contain object-bottom drop-shadow-sm translate-y-[1px]"
                              loading="eager"
                              decoding="async"
                            />
                          </picture>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg sm:text-xl font-bold text-[#0f172a]">
                              {fullJudgeTitle} ({selectedCritique.agentName})
                            </h2>
                            <span className={`text-[11px] font-bold uppercase px-3 py-0.5 rounded-full border ${badgeClass}`}>
                              {selectedCritique.verdict.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748b] mt-0.5 font-medium">
                            {config.roleName} • Rating: <strong className="text-[#576cdb]">{selectedCritique.overallScore}/10</strong>
                          </p>
                        </div>
                      </div>

                      {/* Right: Tab Toggle & Close Action */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        {/* Clean Pill Tab Switcher */}
                        <div className="flex items-center bg-[#f1f4fb] p-1 rounded-full border border-[#eaedf6]">
                          <button
                            onClick={() => setActiveModalTab('CHAT')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeModalTab === 'CHAT'
                                ? 'bg-white text-[#576cdb] shadow-2xs'
                                : 'text-[#64748b] hover:text-[#0f172a]'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Live Sparring</span>
                          </button>
                          <button
                            onClick={() => setActiveModalTab('AUDIT')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeModalTab === 'AUDIT'
                                ? 'bg-white text-[#576cdb] shadow-2xs'
                                : 'text-[#64748b] hover:text-[#0f172a]'
                            }`}
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>Audit Report</span>
                          </button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.08, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={closeJudgeModal}
                          className="w-9 h-9 rounded-full bg-[#f1f4fb] hover:bg-[#eaedf6] flex items-center justify-center text-[#64748b] transition-colors shrink-0 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* TAB 1: LIVE PERSONA SPARRING (Super Chat Inspired Layout) */}
                    {activeModalTab === 'CHAT' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#eaedf6] flex-1 min-h-0 overflow-hidden">
                        
                        {/* Main Super Chat Area (7 Columns on Desktop) */}
                        <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-white min-h-0 overflow-hidden space-y-4">
                          {/* Chat Messages Feed */}
                          <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 min-h-[320px]">
                            <AnimatePresence>
                              {history.map((msg, index) => {
                                const isUser = msg.sender === 'user';
                                const isCopied = copiedMsgIndex === index;

                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                                  >
                                    {/* Avatar Badge */}
                                    <div
                                      className={`w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                                        isUser
                                          ? 'bg-[#576cdb] text-white'
                                          : `${config.cardBg} border border-white/80`
                                      }`}
                                    >
                                      {isUser ? (
                                        <User className="h-4 w-4" />
                                      ) : (
                                        <picture className="h-8 w-auto flex items-end justify-center">
                                          <source srcSet={config.avatarUrl} type="image/webp" />
                                          <img
                                            src={config.avatarPng || config.avatarUrl}
                                            alt={config.roleName}
                                            className="h-8 w-auto object-contain object-bottom"
                                            loading="eager"
                                            decoding="async"
                                          />
                                        </picture>
                                      )}
                                    </div>

                                    {/* Message Card Container (Super Chat Pill Style) */}
                                    <div
                                      className={`p-4 sm:p-5 rounded-3xl max-w-[85%] space-y-2 relative transition-all ${
                                        isUser
                                          ? 'bg-[#576cdb] text-white rounded-tr-xs shadow-xs'
                                          : 'bg-[#f4fbf7] border border-[#dcfce7] text-[#0f172a] rounded-tl-xs shadow-2xs'
                                      }`}
                                    >
                                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                        {msg.text}
                                      </p>

                                      {/* Action Line: Timestamp & Copy Button */}
                                      <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px] text-[#64748b]">
                                        <span className={isUser ? 'text-white/70' : 'text-[#8a94a6]'}>
                                          {msg.timestamp}
                                        </span>

                                        {!isUser && (
                                          <button
                                            onClick={() => handleCopyMessage(msg.text, index)}
                                            className="px-2 py-0.5 rounded-full hover:bg-white text-[#576cdb] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                            title="Copy response"
                                          >
                                            {isCopied ? (
                                              <>
                                                <Check className="w-3 h-3 text-[#059669]" />
                                                <span className="text-[#059669]">Copied</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="w-3 h-3" />
                                                <span>Copy</span>
                                              </>
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>

                            {/* Typing indicator */}
                            {isChatSending && (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3.5 rounded-2xl bg-[#f8f9fd] border border-[#eaedf6] text-xs text-[#576cdb] font-semibold flex items-center gap-2 max-w-fit"
                              >
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>{selectedCritique.agentName} is formulating strategic feedback...</span>
                              </motion.div>
                            )}
                          </div>

                          {/* Floating Regenerate Pill */}
                          {history.length > 1 && !isChatSending && (
                            <div className="flex justify-center -my-1">
                              <button
                                onClick={handleRegenerateLast}
                                className="px-3.5 py-1.5 rounded-full bg-[#f1f4fb] hover:bg-[#e0e7ff] text-[#576cdb] text-xs font-bold transition-all border border-[#eaedf6] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Regenerate Response</span>
                              </button>
                            </div>
                          )}

                          {/* Input Bar (Clean Super Chat Bar) */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMessage();
                            }}
                            className="relative flex items-center bg-[#f8f9fd] rounded-full border border-[#eaedf6] p-1.5 focus-within:border-[#576cdb] focus-within:bg-white focus-within:shadow-md transition-all"
                          >
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder={`Ask or search anything with ${selectedCritique.agentName}...`}
                              disabled={isChatSending}
                              className="flex-1 px-4 py-2.5 bg-transparent text-xs sm:text-sm text-[#0f172a] placeholder-[#8a94a6] outline-none font-sans disabled:opacity-50"
                            />

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="submit"
                              disabled={isChatSending || !chatInput.trim()}
                              className="w-10 h-10 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white flex items-center justify-center shadow-xs transition-all disabled:opacity-40 shrink-0 cursor-pointer"
                            >
                              <Send className="h-4 w-4" />
                            </motion.button>
                          </form>
                        </div>

                        {/* Right Sidebar: Interactive Prompts & Persona Scorecards (5 Columns on Desktop) */}
                        <div className="lg:col-span-5 p-5 sm:p-6 bg-[#f8f9fd] space-y-5 overflow-y-auto">
                          {/* Suggested Persona Prompts Section (Super Chat Card Style) */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-[#576cdb]" />
                              <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider">
                                Clickable Prompts
                              </span>
                            </div>

                            <div className="space-y-2">
                              {config.quickPrompts.map((promptText, idx) => (
                                <motion.div
                                  key={idx}
                                  whileHover={{ x: 3, scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleSendMessage(promptText)}
                                  className="p-3.5 rounded-2xl bg-white border border-[#eaedf6] hover:border-[#576cdb] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-xl bg-[#e0e7ff] text-[#4338ca] flex items-center justify-center shrink-0">
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-semibold text-[#0f172a] group-hover:text-[#576cdb] transition-colors leading-snug line-clamp-2">
                                      "{promptText}"
                                    </span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-[#8a94a6] group-hover:text-[#576cdb] shrink-0" />
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Interactive Dimension Score Chips */}
                          <div className="space-y-2.5 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider">
                                Evaluation Scorecard
                              </span>
                              <span className="text-[11px] text-[#64748b]">Click chip to question</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(selectedCritique.dimensionScores).map(([key, val]) => {
                                const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                                return (
                                  <button
                                    key={key}
                                    onClick={() =>
                                      handleSendMessage(
                                        `Can you elaborate on your ${formattedKey} score of ${val}/10? How can we fix this?`
                                      )
                                    }
                                    className="p-3 rounded-2xl bg-white border border-[#eaedf6] hover:border-[#576cdb] hover:shadow-2xs text-left transition-all cursor-pointer space-y-0.5 group"
                                  >
                                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold block truncate">
                                      {formattedKey}
                                    </span>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-extrabold text-[#576cdb] font-mono">
                                        {val}/10
                                      </span>
                                      <span className="text-[10px] font-bold text-[#576cdb] opacity-0 group-hover:opacity-100 transition-opacity">
                                        Ask →
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Quick Summary Stance Box */}
                          <div className="p-4 rounded-2xl bg-white border border-[#eaedf6] space-y-2">
                            <span className="text-xs font-bold text-[#1f1f47] uppercase tracking-wider block">
                              Executive Takeaway
                            </span>
                            <p className="text-xs text-[#475569] leading-relaxed italic">
                              "{selectedCritique.summaryQuote}"
                            </p>
                            <button
                              onClick={() => setActiveModalTab('AUDIT')}
                              className="text-xs font-bold text-[#576cdb] hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                            >
                              <span>View Full Audit Breakdown</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* TAB 2: FULL EXECUTIVE AUDIT REPORT */}
                    {activeModalTab === 'AUDIT' && (
                      <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-white">
                        {/* Executive Summary Quote Banner */}
                        <div className="p-5 rounded-2xl bg-[#f8f9fd] border border-[#eaedf6] space-y-2">
                          <span className="text-xs font-bold text-[#576cdb] uppercase tracking-wider flex items-center gap-1.5">
                            <Bot className="w-4 h-4" />
                            <span>Executive Stance Summary</span>
                          </span>
                          <p className="text-sm sm:text-base text-[#0f172a] italic leading-relaxed">
                            "{selectedCritique.summaryQuote}"
                          </p>
                        </div>

                        {/* Bullish & Bearish Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Key Strength */}
                          <div className="p-5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] space-y-2">
                            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Key Strength & Bullish Argument</span>
                            </span>
                            <p className="text-xs sm:text-sm text-[#065f46] leading-relaxed">
                              {selectedCritique.bullishArgument}
                            </p>
                          </div>

                          {/* Critical Risk */}
                          <div className="p-5 rounded-2xl bg-[#fef2f2] border border-[#fecaca] space-y-2">
                            <span className="text-xs font-bold text-[#dc2626] uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Critical Risk & Bearish Objection</span>
                            </span>
                            <p className="text-xs sm:text-sm text-[#991b1b] leading-relaxed">
                              {selectedCritique.bearishArgument}
                            </p>
                          </div>
                        </div>

                        {/* Recommended Pivot Card */}
                        {selectedCritique.pivotsRecommended && selectedCritique.pivotsRecommended.length > 0 && (
                          <div className="p-5 rounded-2xl bg-[#fffbeb] border border-[#fde68a] space-y-1.5">
                            <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider flex items-center gap-1.5">
                              <Zap className="w-4 h-4" />
                              <span>Recommended Pivot Strategy</span>
                            </span>
                            <p className="text-xs sm:text-sm text-[#78350f] font-medium leading-relaxed">
                              {selectedCritique.pivotsRecommended[0]}
                            </p>
                          </div>
                        )}

                        {/* Dimension Score Bar Matrix */}
                        <div className="space-y-3">
                          <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block">
                            Full 5-Dimension Evaluation Scorecard
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(selectedCritique.dimensionScores).map(([key, val]) => {
                              const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                              return (
                                <div
                                  key={key}
                                  className="p-4 rounded-2xl bg-[#f8f9fd] border border-[#eaedf6] space-y-2"
                                >
                                  <div className="flex items-center justify-between text-xs font-bold text-[#0f172a]">
                                    <span className="capitalize">{formattedKey}</span>
                                    <span className="font-mono text-[#576cdb]">{val}/10</span>
                                  </div>
                                  <div className="w-full bg-[#eaedf6] h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-[#576cdb] h-full rounded-full transition-all duration-300"
                                      style={{ width: `${val * 10}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Switch Back to Sparring Action */}
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => setActiveModalTab('CHAT')}
                            className="px-6 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Return to Live Sparring Discussion</span>
                          </button>
                        </div>
                      </div>
                    )}
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
