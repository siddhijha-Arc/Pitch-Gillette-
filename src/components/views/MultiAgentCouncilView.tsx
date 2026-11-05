/**
 * Multi-Agent Evaluation Council View - Gillette Pitch Engine
 *
 * Exclusively displays persona-based reviewer perspective cards with
 * interactive 1-on-1 discussion modals, spring animations, and Gillette SaaS styling.
 * Pure Light Mode.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  RefreshCw,
  Sparkles,
  Scale,
  DollarSign,
  UserCheck,
  Cpu,
  TrendingUp,
  Award,
  X,
  MessageSquare,
  Send,
  Bot,
  User,
  ChevronRight,
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
    icon: React.ElementType;
    bg: string;
    text: string;
    quickPrompts: string[];
    roleTitle: string;
  }
> = {
  VC_PARTNER: {
    icon: DollarSign,
    bg: 'bg-[#e0e7ff]',
    text: 'text-[#4f46e5]',
    roleTitle: 'General Partner, Tier-1 VC',
    quickPrompts: [
      'What TAM & market moat metric would upgrade your score to 10/10?',
      'How should we structure our Series A valuation pitch?',
      'What unit economics do you need to see before investing?',
    ],
  },
  ICP_CUSTOMER: {
    icon: UserCheck,
    bg: 'bg-[#ecfdf5]',
    text: 'text-[#059669]',
    roleTitle: 'Chief Medical Officer, Regional Hospital System',
    quickPrompts: [
      'How can we prove zero clinical liability to your hospital board?',
      'What EHR integration features (Epic/Cerner) are non-negotiable?',
      'What transfer response time would make you sign a contract today?',
    ],
  },
  TECH_ARCHITECT: {
    icon: Cpu,
    bg: 'bg-[#fef2f2]',
    text: 'text-[#dc2626]',
    roleTitle: 'Veteran CTO & Systems Architect',
    quickPrompts: [
      'How do we guarantee 99.99% uptime in low-connectivity environments?',
      'What hardware/telemetry stack do you recommend for our MVP?',
      'How can we eliminate latency bottlenecks in high-stress dispatch?',
    ],
  },
  LEGAL_COUNSEL: {
    icon: Scale,
    bg: 'bg-[#f3e8ff]',
    text: 'text-[#7c3aed]',
    roleTitle: 'Healthcare Regulatory & Compliance Attorney',
    quickPrompts: [
      'How do we structure our corporate entity to satisfy state medical boards?',
      'What contract terms prevent Anti-Kickback statute violations?',
      'What HIPAA compliance safeguards must we launch with on Day 1?',
    ],
  },
  FINANCIAL_ANALYST: {
    icon: TrendingUp,
    bg: 'bg-[#f0fdf4]',
    text: 'text-[#16a34a]',
    roleTitle: 'CFO & Unit Economics Specialist',
    quickPrompts: [
      'How can we improve our gross margin profile above 70%?',
      'What is the safest pricing tier strategy for enterprise contracts?',
      'What CAC payback period benchmark should we aim for?',
    ],
  },
  HACKATHON_JUDGE: {
    icon: Award,
    bg: 'bg-[#fffbeb]',
    text: 'text-[#d97706]',
    roleTitle: 'Product Builder & Founder',
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
      const initialGreeting: ChatMessage = {
        sender: 'judge',
        text: `Hello! I'm ${critique.agentName} (${critique.title}). I gave your pitch a score of ${critique.overallScore}/10 (${critique.verdict.replace(/_/g, ' ')}). My primary feedback: "${critique.summaryQuote}". What questions do you have about my evaluation or recommendations?`,
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
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <div className="space-y-6 w-full mx-auto py-2 font-sans">
      {/* 1. Header with Run Deliberation Action */}
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

      {/* 2. Reviewer Perspectives Grid (Exclusively Persona Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-[#1f1f47] uppercase tracking-wider font-mono">
            Reviewer Perspectives ({critiques.length})
          </h2>
          <span className="text-xs sm:text-sm text-[#6c7693]">
            Click any reviewer card to open 1-on-1 persona discussion pop-up
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {critiques.map((critique) => {
            const config = AGENT_CONFIG[critique.agent] || {
              icon: Users,
              bg: 'bg-[#e0e7ff]',
              text: 'text-[#4f46e5]',
              roleTitle: critique.title,
              quickPrompts: [],
            };
            const Icon = config.icon;
            const badgeClass = getVerdictBadge(critique.verdict);

            return (
              <motion.div
                key={critique.agent}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01, boxShadow: '0 12px 28px rgba(87,108,219,0.12)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => openJudgeModal(critique)}
                className="bg-white rounded-2xl border border-[#eaedf6] p-6 space-y-4 shadow-[rgba(73,46,107,0.03)_0px_3px_12px] hover:border-[#576cdb] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${config.bg} flex items-center justify-center ${config.text} shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-medium text-[#1f1f47] tracking-[-0.02em] font-sans">
                          {critique.agentName}
                        </h3>
                        <span className="text-xs sm:text-sm text-[#6c7693] block font-mono">
                          {config.roleTitle}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-2xl sm:text-3xl font-light font-mono text-[#1f1f47]">
                        {critique.overallScore}
                      </span>
                      <span className="text-xs text-[#6c7693] font-mono">/10</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-xs font-semibold font-mono uppercase px-3 py-1 rounded-full border ${badgeClass}`}>
                      {critique.verdict.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-[#6c7693] font-mono">{critique.agent}</span>
                  </div>

                  {/* Quoted Summary Stance */}
                  <p className="text-xs sm:text-sm text-[#3d3d5c] italic bg-[#f9f9fb] p-4 rounded-xl border border-[#eaedf6] leading-relaxed">
                    "{critique.summaryQuote}"
                  </p>

                  {/* Integrated Bullish & Bearish Snippets */}
                  <div className="space-y-2 pt-1 text-xs sm:text-sm">
                    <div className="flex items-start gap-2 text-[#059669]">
                      <span className="font-semibold shrink-0 font-mono">🟢 Strength:</span>
                      <p className="text-[#3d3d5c] line-clamp-2 leading-relaxed">
                        {critique.bullishArgument}
                      </p>
                    </div>

                    <div className="flex items-start gap-2 text-[#dc2626]">
                      <span className="font-semibold shrink-0 font-mono">🔴 Risk:</span>
                      <p className="text-[#3d3d5c] line-clamp-2 leading-relaxed">
                        {critique.bearishArgument}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Call to Action Button */}
                <div className="pt-4 border-t border-[#eaedf6]">
                  <div className="w-full py-2.5 px-4 rounded-xl bg-[#f9f9fb] group-hover:bg-[#576cdb] text-[#576cdb] group-hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-[#eaedf6] group-hover:border-[#576cdb]">
                    <MessageSquare className="h-4 w-4" />
                    <span>Discuss with {critique.agentName.split(' ')[0]} & Full Eval</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 3. Minimal Style Pop-Up Modal (`JudgePersonaModal`) with Framer Motion AnimatePresence */}
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
              className="relative w-full max-w-4xl bg-white rounded-2xl border border-[#eaedf6] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10"
            >
              {(() => {
                const config = AGENT_CONFIG[selectedCritique.agent] || {
                  icon: Users,
                  bg: 'bg-[#e0e7ff]',
                  text: 'text-[#4f46e5]',
                  roleTitle: selectedCritique.title,
                  quickPrompts: [],
                };
                const Icon = config.icon;
                const badgeClass = getVerdictBadge(selectedCritique.verdict);
                const history = chatHistories[selectedCritique.agent] || [];

                return (
                  <>
                    {/* Modal Header */}
                    <div className="p-6 border-b border-[#eaedf6] bg-[#f9f9fb] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center ${config.text} shrink-0 shadow-xs`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#1f1f47] font-sans">
                              {selectedCritique.agentName}
                            </h2>
                            <span className={`text-xs font-semibold font-mono uppercase px-3 py-1 rounded-full border ${badgeClass}`}>
                              {selectedCritique.verdict.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#6c7693] font-mono mt-0.5">
                            {config.roleTitle} • Rating: <strong className="text-[#576cdb]">{selectedCritique.overallScore}/10</strong>
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

                    {/* Modal Content Split: Left (Full Evaluation Data) & Right (Real-Time Persona Discussion) */}
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
                                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                                      msg.sender === 'user'
                                        ? 'bg-[#576cdb] text-white'
                                        : `${config.bg} ${config.text}`
                                    }`}
                                  >
                                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
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
                            placeholder={`Ask ${selectedCritique.agentName.split(' ')[0]} a question...`}
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
