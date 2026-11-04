import React, { useState } from 'react';
import {
  AnswerRecord,
  BusinessProfile,
  SmartQuestion,
  ExpertVerdict,
  CouncilConsensus,
} from '../../types/intakeModule.ts';
import {
  TrendingUp,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Send,
  PlusCircle,
  RefreshCw,
  ChevronRight,
  Check,
  Users,
  Info,
} from 'lucide-react';

interface Screen2SmartQuestionsProps {
  profile: BusinessProfile;
  questions: SmartQuestion[];
  initialScore: number;
  currentScore: number;
  expertVerdicts: ExpertVerdict[];
  consensus: CouncilConsensus | null;
  answers: AnswerRecord[];
  isFollowUpRound: boolean;
  canFollowUp: boolean;
  onAnswerSubmit: (params: {
    questionId: string;
    chosenOptionId?: string;
    isNotSure?: boolean;
    freeText?: string;
  }) => Promise<void>;
  onFreeInputSubmit: (text: string) => Promise<void>;
  onTriggerFollowUp: () => Promise<void>;
  onViewSummary: () => void;
  isLoadingAnswer: boolean;
}

export const Screen2SmartQuestions: React.FC<Screen2SmartQuestionsProps> = ({
  profile,
  questions,
  initialScore,
  currentScore,
  expertVerdicts,
  consensus,
  answers,
  isFollowUpRound,
  canFollowUp,
  onAnswerSubmit,
  onFreeInputSubmit,
  onTriggerFollowUp,
  onViewSummary,
  isLoadingAnswer,
}) => {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [customTextByQuestion, setCustomTextByQuestion] = useState<Record<string, string>>({});
  const [showCustomInputFor, setShowCustomInputFor] = useState<string | null>(null);
  const [bottomChatText, setBottomChatText] = useState('');
  const [isSubmittingBottomChat, setIsSubmittingBottomChat] = useState(false);
  const [bottomChatSuccessNotice, setBottomChatSuccessNotice] = useState<string | null>(null);

  const answeredQuestionIds = new Set(answers.map(a => a.questionId));
  const progressPercent = Math.round((answers.length / (questions.length || 1)) * 100);
  const scoreDelta = currentScore - initialScore;

  const currentQ = questions[activeQuestionIndex] || questions[0];
  const existingAnswer = answers.find(a => a.questionId === currentQ?.id);

  const handleSelectOption = async (optionId: string) => {
    if (isLoadingAnswer || !currentQ) return;
    await onAnswerSubmit({
      questionId: currentQ.id,
      chosenOptionId: optionId,
    });
    autoAdvance(activeQuestionIndex);
  };

  const handleSelectNotSure = async () => {
    if (isLoadingAnswer || !currentQ) return;
    await onAnswerSubmit({
      questionId: currentQ.id,
      isNotSure: true,
    });
    autoAdvance(activeQuestionIndex);
  };

  const handleCustomAnswerSubmit = async () => {
    if (!currentQ) return;
    const customText = (customTextByQuestion[currentQ.id] || '').trim();
    if (!customText || isLoadingAnswer) return;

    await onAnswerSubmit({
      questionId: currentQ.id,
      freeText: customText,
    });
    setShowCustomInputFor(null);
    autoAdvance(activeQuestionIndex);
  };

  const autoAdvance = (currentIndex: number) => {
    if (currentIndex + 1 < questions.length) {
      setActiveQuestionIndex(currentIndex + 1);
    }
  };

  const handleBottomChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottomChatText.trim() || isSubmittingBottomChat) return;

    setIsSubmittingBottomChat(true);
    setBottomChatSuccessNotice(null);
    try {
      await onFreeInputSubmit(bottomChatText.trim());
      setBottomChatText('');
      setBottomChatSuccessNotice('Council sentiments recalculated with your input.');
      setTimeout(() => setBottomChatSuccessNotice(null), 4000);
    } finally {
      setIsSubmittingBottomChat(false);
    }
  };

  const allQuestionsAnswered = answers.length >= questions.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Mathematical Council Panel */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#eaedf6] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] sticky top-3 z-20 backdrop-blur-md bg-[#ffffff]/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs text-[#575775] font-semibold flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-[#576cdb]" />
              <span>Expert Council Sentiment</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#1f1f47]">
                {currentScore}
              </span>
              <span className="text-xs text-[#84849a] font-medium">/ 100 Consensus Score</span>
              {scoreDelta !== 0 && (
                <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  scoreDelta > 0 ? 'bg-[#a6f2d2]/40 text-[#0d593d]' : 'bg-[#f7d4d4]/50 text-[#9c2424]'
                }`}>
                  {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                </span>
              )}
            </div>
          </div>

          <div className="flex -space-x-2 overflow-hidden">
            {expertVerdicts.map((v) => (
              <div 
                key={v.personaId} 
                title={`${v.personaName} (${v.personaRole}): ${v.overallScore}/10`}
                className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform hover:scale-110 cursor-help ${
                  v.sentiment === 'BULLISH' ? 'bg-[#10b981]' : v.sentiment === 'SKEPTICAL' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'
                }`}
              >
                {v.personaName.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        {/* Synthesis & Tension */}
        {consensus && (
          <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-[#eaedf6]">
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-[#84849a] uppercase tracking-wider">Verdict Synthesis</div>
              <p className="text-xs text-[#3d3d5c] leading-relaxed font-medium">
                {consensus.synthesis}
              </p>
            </div>
            {consensus.tensionPoints.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-[#84849a] uppercase tracking-wider">Top Conflict</div>
                <div className="flex items-start gap-2 text-xs bg-[#fef3c7]/40 p-2 rounded-lg border border-[#fef3c7]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#d97706] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#92400e]">{consensus.tensionPoints[0].dimension}: </span>
                    <span className="text-[#92400e]">{consensus.tensionPoints[0].description}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#eaedf6] overflow-hidden mt-4">
          <div
            className="h-full bg-[#576cdb] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Question Carousel */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {questions.map((q, idx) => {
              const isAnswered = answeredQuestionIds.has(q.id);
              const isCurrent = idx === activeQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer border shadow-sm ${
                    isCurrent
                      ? 'bg-[#1f1f47] text-white border-[#1f1f47]'
                      : isAnswered
                      ? 'bg-[#ffffff] text-[#10b981] border-[#10b981]/30'
                      : 'bg-[#ffffff] text-[#84849a] border-[#eaedf6]'
                  }`}
                >
                  {isAnswered ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span>Q{idx + 1}</span>
                  )}
                  <span className="truncate max-w-[80px]">{q.fieldKey.replace(/_/g, ' ')}</span>
                </button>
              );
            })}
          </div>

          {/* Main Question Card */}
          {currentQ && (
            <div className="bg-[#ffffff] rounded-2xl border border-[#eaedf6] p-6 sm:p-8 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#576cdb] bg-[#576cdb]/5 px-2.5 py-1 rounded-md border border-[#576cdb]/10">
                    Strategic Inquiry {activeQuestionIndex + 1}
                  </span>
                  {existingAnswer && (
                    <span className="text-[10px] text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-md font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Answered
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-medium text-[#1f1f47] leading-tight tracking-[-0.025em]">
                  {currentQ.questionText}
                </h2>

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#575775] bg-[#f9f9fb] px-3 py-2 rounded-xl border border-[#eaedf6]">
                  <Sparkles className="w-4 h-4 text-[#576cdb]" />
                  <span>
                    Resolving this could swing the consensus by{' '}
                    <strong className="text-[#576cdb]">{currentQ.questionValue} points</strong>.
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = existingAnswer?.chosenOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      disabled={isLoadingAnswer}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-4 group cursor-pointer ${
                        isSelected
                          ? 'bg-[#576cdb]/5 border-[#576cdb] ring-1 ring-[#576cdb]/20 text-[#1f1f47]'
                          : 'bg-[#ffffff] hover:bg-[#f9f9fb] border-[#eaedf6] text-[#3d3d5c] hover:border-[#d1d6e1]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm leading-tight text-[#171a1c] tracking-[-0.01em]">
                          {opt.label}
                        </div>
                        {opt.explanation && (
                          <div className="text-xs text-[#6c7693] leading-relaxed">
                            {opt.explanation}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                            isSelected
                              ? 'border-[#576cdb] bg-[#576cdb] text-white'
                              : 'border-[#eaedf6] group-hover:border-[#d1d6e1]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#eaedf6] flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isLoadingAnswer}
                  onClick={() =>
                    setShowCustomInputFor(showCustomInputFor === currentQ.id ? null : currentQ.id)
                  }
                  className={`text-[11px] font-bold px-4 py-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                    showCustomInputFor === currentQ.id
                      ? 'bg-[#1f1f47] text-white border-[#1f1f47]'
                      : 'bg-[#ffffff] text-[#3d3d5c] hover:bg-[#f9f9fb] border-[#d1d6e1]'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Manual Input</span>
                </button>

                <button
                  type="button"
                  disabled={isLoadingAnswer}
                  onClick={handleSelectNotSure}
                  className={`text-[11px] font-bold px-4 py-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                    existingAnswer?.isNotSure
                      ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'
                      : 'bg-[#ffffff] text-[#575775] hover:bg-[#ef4444]/5 border-[#eaedf6]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Not Sure / Unknown</span>
                </button>
              </div>

              {showCustomInputFor === currentQ.id && (
                <div className="p-5 rounded-2xl bg-[#f9f9fb] border border-[#eaedf6] space-y-4 shadow-inner">
                  <div className="text-xs font-bold text-[#1f1f47]">Describe your approach:</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTextByQuestion[currentQ.id] || ''}
                      onChange={(e) =>
                        setCustomTextByQuestion({
                          ...customTextByQuestion,
                          [currentQ.id]: e.target.value,
                        })
                      }
                      placeholder="Share details to update expert sentiment..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#d1d6e1] text-sm text-[#171a1c] outline-none focus:ring-2 focus:ring-[#576cdb]/20 focus:border-[#576cdb]"
                    />
                    <button
                      type="button"
                      disabled={isLoadingAnswer || !customTextByQuestion[currentQ.id]?.trim()}
                      onClick={handleCustomAnswerSubmit}
                      className="px-5 py-3 rounded-xl bg-[#576cdb] hover:bg-[#4b5ec4] text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={activeQuestionIndex === 0}
                  onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                  className="text-[11px] font-bold text-[#84849a] hover:text-[#1f1f47] disabled:opacity-30 cursor-pointer"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={activeQuestionIndex >= questions.length - 1}
                  onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                  className="text-[11px] font-bold text-[#576cdb] hover:text-[#1f1f47] disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Expert Sentiment Cards */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-[#84849a] uppercase tracking-wider px-1">Council Member Detail</div>
          {expertVerdicts.map((v) => (
            <div key={v.personaId} className="bg-white rounded-2xl border border-[#eaedf6] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    v.sentiment === 'BULLISH' ? 'bg-[#10b981]' : v.sentiment === 'SKEPTICAL' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'
                  }`}>
                    {v.personaName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1f1f47]">{v.personaName}</div>
                    <div className="text-[10px] text-[#84849a] font-medium">{v.personaRole}</div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${
                  v.sentiment === 'BULLISH' ? 'text-[#10b981]' : v.sentiment === 'SKEPTICAL' ? 'text-[#ef4444]' : 'text-[#f59e0b]'
                }`}>
                  {v.overallScore}/10
                </div>
              </div>
              <div className="text-[11px] text-[#3d3d5c] leading-snug italic">
                "{v.keyReason}"
              </div>
              <div className="space-y-1.5 pt-1">
                {Object.entries(v.categoryScores).map(([cat, score]) => (
                  <div key={cat} className="space-y-0.5">
                    <div className="flex justify-between text-[9px] font-bold text-[#84849a] uppercase tracking-tighter">
                      <span>{cat.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{Math.round(score * 10)}</span>
                    </div>
                    <div className="w-full h-1 bg-[#eaedf6] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${
                          score >= 0.7 ? 'bg-[#10b981]' : score <= 0.4 ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'
                        }`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion UI */}
      {allQuestionsAnswered && (
        <div className="bg-[#1f1f47] rounded-2xl p-8 text-center space-y-6 shadow-xl border-t-4 border-[#576cdb]">
          <div className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#10b981]/20">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Council Evaluation Concluded</h3>
            <p className="text-sm text-[#c1c9f6] mt-2 max-w-md mx-auto">
              The mathematical consensus is finalized at <strong>{currentScore}/100</strong>.
              View the full diagnostic breakdown and expert tension analysis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {canFollowUp && (
              <button
                type="button"
                onClick={onTriggerFollowUp}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#576cdb] text-[#c1c9f6] hover:bg-white/5 text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Follow-up Round</span>
              </button>
            )}

            <button
              type="button"
              onClick={onViewSummary}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#576cdb] hover:bg-[#4b5ec4] text-white text-sm font-bold cursor-pointer transition shadow-lg shadow-[#576cdb]/20 flex items-center justify-center gap-2"
            >
              <span>View Executive Summary</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Input */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#eaedf6] p-5 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
        <form onSubmit={handleBottomChatSubmit} className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#1f1f47]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#576cdb]" />
              <span>Direct Council Input</span>
            </div>
            <span className="text-[10px] text-[#84849a] bg-[#f9f9fb] px-2 py-0.5 rounded-md border border-[#eaedf6]">Mathematical Re-analysis Enabled</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={bottomChatText}
              onChange={(e) => setBottomChatText(e.target.value)}
              placeholder={`Add more context to influence ${profile.ideaName}'s expert scores...`}
              disabled={isSubmittingBottomChat}
              className="flex-1 px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#d1d6e1] text-sm text-[#171a1c] focus:bg-white focus:ring-2 focus:ring-[#576cdb]/20 focus:border-[#576cdb] outline-none transition"
            />
            <button
              type="submit"
              disabled={isSubmittingBottomChat || !bottomChatText.trim()}
              className="px-6 py-3 rounded-xl bg-[#1f1f47] hover:bg-[#3d3d5c] text-white text-xs font-bold cursor-pointer transition disabled:opacity-40 flex items-center gap-2"
            >
              <span>{isSubmittingBottomChat ? 'Analyzing...' : 'Submit'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {bottomChatSuccessNotice && (
            <div className="text-xs text-[#10b981] bg-[#10b981]/10 px-4 py-2 rounded-xl border border-[#10b981]/20 flex items-center gap-2 font-bold animate-pulse">
              <Check className="w-4 h-4" />
              <span>{bottomChatSuccessNotice}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
