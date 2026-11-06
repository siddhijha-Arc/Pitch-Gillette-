/**
 * Multi-Agent Evaluation Council View - Gillette Pitch Engine
 *
 * Exclusively displays persona-based reviewer perspective cards matching
 * the exact layout, typography, positioning, and spacing from the reference design.
 * Features top pastel banner with vector diagram, 2-line profession title with plus icon,
 * crisp 3-line review description, and centered pastel pill button.
 * Pure Light Mode.
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
} from 'lucide-react';
import { AgentCritique, StartupIdea } from '../../types/index.ts';

interface MultiAgentCouncilViewProps {
  idea: StartupIdea;
  onRunAgents: () => void;
  isLoading: boolean;
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
    avatarUrl: '/assets/aistudio/1000013129_20499cfa.png',
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
    avatarUrl: '/assets/aistudio/1000013131_173bcf1b.png',
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
    avatarUrl: '/assets/aistudio/1000013134_4647e05a.png',
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
    avatarUrl: '/assets/aistudio/1000013133_3217a220.png',
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
    avatarUrl: '/assets/aistudio/1000013130_64969f18.png',
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
    avatarUrl: '/assets/aistudio/1000013132_ceaba763.png',
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

    // Initialize initial greeting if chat history is empty
    if (!chatHistories[critique.agent] || chatHistories[critique.agent].length === 0) {
      const config = AGENT_CONFIG[critique.agent] || { titleLine1: critique.title, titleLine2: '' };
      const fullTitle = `${config.titleLine1} ${config.titleLine2}`.trim();
      const initialGreeting: ChatMessage = {
        sender: 'judge',
        text: `Hello! I'm ${critique.agentName} (${fullTitle}). I gave your pitch a score of ${critique.overallScore}/10 (${critique.verdict.replace(/_/g, ' ')}). My feedback summary: "${critique.summaryQuote}". What questions do you have about my evaluation or recommendations?`,
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

  return (
    <div className="space-y-6 w-full mx-auto py-2 font-sans">
      {/* 1. Top Header with Run Deliberation Action */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-6"
      >
        <div>
          <span className="text-xs font-semibold text-[#576cdb] tracking-wider uppercase block mb-1 font-mono">
            Gillette Pitch Engine • Expert Council
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-[#1f1f47] tracking-[-0.03em] font-sans">
            Evaluation Council
          </h1>
          <p className="text-sm sm:text-base text-[#6c7693] mt-1.5 font-normal leading-relaxed">
            Persona-based reviewer perspectives with real-time 1-on-1 judge discussions.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRunAgents}
          disabled={isLoading}
          className="px-7 py-3.5 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(87,108,219,0.25)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 shrink-0"
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

      {/* 2. Reviewer Perspectives Grid (Identical to Reference Design Image) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-[#1f1f47] uppercase tracking-wider font-mono">
            Reviewer Perspectives ({critiques.length})
          </h2>
          <span className="text-xs sm:text-sm text-[#6c7693]">
            Click any card to open 1-on-1 persona chat & full evaluation
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
        >
          {critiques.map((critique) => {
            const config = AGENT_CONFIG[critique.agent] || {
              titleLine1: critique.title,
              titleLine2: 'reviewer',
              roleName: critique.agentName,
              buttonText: 'Chat',
              cardBg: 'bg-[#dce7fe]',
              pillBg: 'bg-[#dce7fe] hover:bg-[#c9dafc]',
              pillText: 'text-[#3b5998]',
              avatarUrl: '/assets/aistudio/1000013129_20499cfa.png',
              quickPrompts: [],
            };

            return (
              <motion.div
                key={critique.agent}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.07)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => openJudgeModal(critique)}
                className={`${config.cardBg} rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-transparent transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
              >
                {/* Top Pastel Banner with Grounded 3D Persona Avatar */}
                <div className="relative h-56 sm:h-64 flex items-end justify-center overflow-hidden select-none">
                  {/* 3D Character Avatar enlarged & grounded directly flush on top of the white card */}
                  <img
                    src={config.avatarUrl}
                    alt={config.roleName}
                    className="relative z-10 h-52 sm:h-60 w-auto max-w-[88%] object-contain object-bottom drop-shadow-[0_6px_14px_rgba(0,0,0,0.12)] transform transition-transform duration-300 group-hover:scale-105 translate-y-[2px]"
                    loading="lazy"
                  />
                </div>

                {/* Lower White Section with Rounded Top Corners */}
                <div className="bg-white rounded-t-[28px] rounded-b-[32px] p-6 pt-5 pb-6 flex flex-col justify-between flex-1 relative z-20">
                  <div>
                    {/* Title & Plus Icon Header Line */}
                    <div className="flex items-start justify-between">
                      <h3 className="font-['Outfit',sans-serif] text-[22px] font-semibold text-[#1e2532] leading-[1.18] tracking-tight">
                        <div>{config.titleLine1}</div>
                        <div className="lowercase font-normal">{config.titleLine2}</div>
                      </h3>
                      <span className="text-[#94a3b8] text-[20px] font-light leading-none group-hover:text-[#4b5563] transition-colors mt-0.5">
                        +
                      </span>
                    </div>

                    {/* Crisp 3-Line Description Paragraph */}
                    <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[13px] text-[#8896a6] leading-[1.65] font-normal mt-3.5 line-clamp-3">
                      {critique.summaryQuote}
                    </p>
                  </div>

                  {/* Centered Small Pill Button */}
                  <div className="mt-5 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openJudgeModal(critique);
                      }}
                      className={`font-['Plus_Jakarta_Sans',sans-serif] text-[12px] font-medium px-6 py-1.5 rounded-full transition-all shadow-xs ${config.pillBg} ${config.pillText}`}
                    >
                      {config.buttonText}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 3. Minimal Style Pop-Up Modal (`JudgePersonaModal`) */}
      <AnimatePresence>
        {selectedCritique && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-sans">
            {/* Animated Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeJudgeModal}
              className="absolute inset-0 bg-[#171a1c]/60 backdrop-blur-[4px]"
            />

            {/* Pop-up Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
              className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#eaedf6] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10"
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
                  avatarUrl: '/assets/aistudio/1000013129_20499cfa.png',
                  quickPrompts: [],
                };
                const badgeClass = getVerdictBadge(selectedCritique.verdict);
                const history = chatHistories[selectedCritique.agent] || [];
                const fullJudgeTitle = `${config.titleLine1} ${config.titleLine2}`.trim();

                return (
                  <>
                    {/* Modal Header */}
                    <div className="p-6 border-b border-[#eaedf6] bg-[#f9f9fb] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-14 h-14 rounded-2xl ${config.cardBg} relative overflow-hidden flex items-end justify-center p-0.5 shrink-0 shadow-xs border border-white/80`}>
                          <img
                            src={config.avatarUrl}
                            alt={config.roleName}
                            className="relative z-10 h-13 w-auto object-contain object-bottom drop-shadow-sm translate-y-[1px]"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#1f1f47] font-['Outfit',sans-serif]">
                              {fullJudgeTitle} ({selectedCritique.agentName})
                            </h2>
                            <span className={`text-xs font-semibold font-mono uppercase px-3 py-1 rounded-full border ${badgeClass}`}>
                              {selectedCritique.verdict.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#6c7693] font-mono mt-0.5">
                            {selectedCritique.title} • Rating: <strong className="text-[#576cdb]">{selectedCritique.overallScore}/10</strong>
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={closeJudgeModal}
                        className="w-10 h-10 rounded-full border border-[#eaedf6] bg-white hover:bg-[#eaedf6] flex items-center justify-center text-[#6c7693] transition-colors shrink-0"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>

                    {/* Modal Content Split: Left (Detailed Evaluation) & Right (1-on-1 Chat) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#eaedf6] overflow-y-auto flex-1">
                      
                      {/* Left Pane: Detailed Evaluation Breakdown */}
                      <div className="p-6 space-y-6 overflow-y-auto">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-[#6c7693] uppercase tracking-wider font-mono">
                            Executive Stance Summary
                          </span>
                          <p className="text-sm text-[#1f1f47] italic bg-[#f9f9fb] p-4 rounded-xl border border-[#eaedf6] leading-relaxed">
                            "{selectedCritique.summaryQuote}"
                          </p>
                        </div>

                        {/* Bullish & Bearish Analysis */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] space-y-1.5">
                            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider font-mono flex items-center gap-1.5">
                              🟢 Key Strength & Bullish Argument
                            </span>
                            <p className="text-xs sm:text-sm text-[#065f46] leading-relaxed">
                              {selectedCritique.bullishArgument}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] space-y-1.5">
                            <span className="text-xs font-bold text-[#dc2626] uppercase tracking-wider font-mono flex items-center gap-1.5">
                              🔴 Critical Risk & Bearish Objection
                            </span>
                            <p className="text-xs sm:text-sm text-[#991b1b] leading-relaxed">
                              {selectedCritique.bearishArgument}
                            </p>
                            {selectedCritique.pivotsRecommended && selectedCritique.pivotsRecommended.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#fecaca] text-xs font-medium text-[#b45309]">
                                <strong>Recommended Pivot:</strong> {selectedCritique.pivotsRecommended[0]}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dimension Scores Matrix */}
                        <div className="space-y-3">
                          <span className="text-xs font-bold text-[#6c7693] uppercase tracking-wider font-mono block">
                            Evaluation Dimensions Breakdown
                          </span>
                          <div className="grid grid-cols-2 gap-2.5">
                            {Object.entries(selectedCritique.dimensionScores).map(([key, val]) => (
                              <div key={key} className="p-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] space-y-0.5">
                                <span className="text-[11px] text-[#6c7693] capitalize font-medium block truncate">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-base font-bold font-mono text-[#576cdb]">
                                  {val}/10
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Pane: Live Real-Time 1-on-1 Persona Chat */}
                      <div className="p-6 flex flex-col justify-between bg-[#fcfcfd] space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-[#eaedf6] pb-3 mb-3">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-[#576cdb]" />
                              <span className="text-xs sm:text-sm font-bold text-[#1f1f47] uppercase tracking-wider font-mono">
                                Live Persona Discussion
                              </span>
                            </div>
                            <span className="text-xs text-[#059669] font-mono flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                              Active Persona
                            </span>
                          </div>

                          {/* Recommended Quick Question Chips */}
                          {config.quickPrompts.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                              <span className="text-[11px] text-[#6c7693] font-mono">Suggested Persona Questions:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {config.quickPrompts.map((promptText, idx) => (
                                  <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSendMessage(promptText)}
                                    disabled={isChatSending}
                                    className="text-left text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-[#576cdb] hover:text-white text-[#1f1f47] border border-[#eaedf6] transition-colors disabled:opacity-50"
                                  >
                                    {promptText}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Streamed Messages Box */}
                          <div className="space-y-3 overflow-y-auto max-h-[300px] sm:max-h-[360px] pr-1 py-1">
                            <AnimatePresence>
                              {history.map((msg, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                  className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                                  }`}
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full overflow-hidden flex items-end justify-center shrink-0 mt-0.5 text-xs shadow-xs ${
                                      msg.sender === 'user'
                                        ? 'bg-[#576cdb] text-white p-1.5'
                                        : `${config.cardBg} border border-[#eaedf6]`
                                    }`}
                                  >
                                    {msg.sender === 'user' ? (
                                      <User className="h-4 w-4" />
                                    ) : (
                                      <img
                                        src={config.avatarUrl}
                                        alt={config.roleName}
                                        className="h-7 w-auto object-contain object-bottom"
                                      />
                                    )}
                                  </div>

                                  <div
                                    className={`p-3.5 rounded-2xl max-w-[82%] space-y-1 ${
                                      msg.sender === 'user'
                                        ? 'bg-[#576cdb] text-white rounded-tr-none'
                                        : 'bg-white text-[#1f1f47] border border-[#eaedf6] rounded-tl-none shadow-sm'
                                    }`}
                                  >
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    <span
                                      className={`text-[10px] block text-right font-mono ${
                                        msg.sender === 'user' ? 'text-white/70' : 'text-[#84849a]'
                                      }`}
                                    >
                                      {msg.timestamp}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {isChatSending && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-xs text-[#576cdb] font-mono animate-pulse p-2"
                              >
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>{selectedCritique.agentName} is reviewing pitch data and typing response...</span>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Chat Input Bar */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                          }}
                          className="flex items-center gap-2 pt-2 border-t border-[#eaedf6]"
                        >
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={`Ask ${fullJudgeTitle.split(' ')[0]} a question...`}
                            disabled={isChatSending}
                            className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#eaedf6] focus:border-[#576cdb] text-xs sm:text-sm text-[#171a1c] placeholder-[#6c7693] outline-none transition-all disabled:opacity-50 font-sans"
                          />
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={isChatSending || !chatInput.trim()}
                            className="px-4 py-3 rounded-xl bg-[#576cdb] hover:bg-[#485bc7] text-white font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                          >
                            <Send className="h-4 w-4" />
                          </motion.button>
                        </form>
                      </div>
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
