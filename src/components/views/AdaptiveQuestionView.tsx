/**
 * Adaptive Question Engine View - RevenueCat Light Style
 * White cards, 16px corners, periwinkle signal selection, clean resolution ledger.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { StartupIdea } from '../../types/index.ts';

interface AdaptiveQuestionViewProps {
  idea: StartupIdea;
  onAnswerQuestion: (questionId: string, answerText: string) => void;
  isLoading: boolean;
}

export const AdaptiveQuestionView: React.FC<AdaptiveQuestionViewProps> = ({
  idea,
  onAnswerQuestion,
  isLoading,
}) => {
  const [customAnswer, setCustomAnswer] = useState('');
  const [selectedQuickAnswer, setSelectedQuickAnswer] = useState<string | null>(null);

  const questions = idea.questions || [];
  const unanswered = questions.filter((q) => !q.isAnswered);
  const answered = questions.filter((q) => q.isAnswered);
  const activeQuestion = unanswered[0] || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion) return;
    const finalAnswer = selectedQuickAnswer || customAnswer.trim();
    if (!finalAnswer) return;

    onAnswerQuestion(activeQuestion.id, finalAnswer);
    setSelectedQuickAnswer(null);
    setCustomAnswer('');
  };

  return (
    <div className="space-y-6 w-full mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light text-[#1f1f47] tracking-tight font-sans">
            Adaptive Information-Entropy Q&A
          </h1>
          <p className="text-sm sm:text-base text-[#6c7693] mt-1">
            Prioritized by uncertainty. Answering resolves assumptions and updates the readiness score.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#64748b] font-medium">
          <span>{unanswered.length} Pending</span>
          <span>•</span>
          <span>{answered.length} Resolved</span>
        </div>
      </div>

      {/* Active Question Card */}
      {activeQuestion ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#eaedf6] p-6 sm:p-8 space-y-6 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#eaedf6] pb-4">
            <span className="text-xs font-bold text-[#576cdb] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#576cdb]" />
              Critical Clarification Question
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-medium text-[#1f1f47] tracking-[-0.02em] leading-relaxed">
              {activeQuestion.question}
            </h2>

            {/* Investor Rationale Callout */}
            <div className="mt-5 p-5 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] text-sm text-[#3d3d5c] flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-[#576cdb] mt-0.5" />
              <div>
                <span className="font-semibold text-[#1f1f47] block mb-1">Investor Context:</span>
                <span className="leading-relaxed">{activeQuestion.investorRationale}</span>
              </div>
            </div>
          </div>

          {/* Quick Answers */}
          {activeQuestion.suggestedAnswers && activeQuestion.suggestedAnswers.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#1f1f47] block">
                Select a response:
              </label>
              <div className="space-y-2.5">
                {activeQuestion.suggestedAnswers.map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedQuickAnswer(option);
                      setCustomAnswer('');
                    }}
                    className={`p-4 rounded-xl border text-sm cursor-pointer transition-all flex items-start gap-3.5 ${
                      selectedQuickAnswer === option
                        ? 'bg-[#d6dbf5]/40 border-[#576cdb] text-[#1f1f47] font-medium shadow-sm'
                        : 'bg-[#f9f9fb] border-[#eaedf6] text-[#3d3d5c] hover:border-[#d1d6e1]'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedQuickAnswer === option
                          ? 'border-[#576cdb] bg-[#576cdb]'
                          : 'border-[#d1d6e1] bg-white'
                      }`}
                    >
                      {selectedQuickAnswer === option && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="leading-relaxed">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1f1f47] block">
              Or write custom response:
            </label>
            <textarea
              value={customAnswer}
              onChange={(e) => {
                setCustomAnswer(e.target.value);
                setSelectedQuickAnswer(null);
              }}
              rows={3}
              placeholder="Provide exact metrics, architecture specifics, or verified numbers..."
              className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-sm text-[#171a1c] placeholder-[#6c7693] outline-none resize-none transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs sm:text-sm text-[#6c7693]">
              Resolves assumption & upgrades readiness index
            </span>

            <button
              type="submit"
              disabled={isLoading || (!selectedQuickAnswer && !customAnswer.trim())}
              className="px-6 py-3 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white font-semibold text-sm shadow-[0_2px_8px_rgba(87,108,219,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>Submit Answer</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-10 rounded-2xl bg-white border border-[#eaedf6] text-center space-y-4 shadow-[rgba(73,46,107,0.06)_0px_2px_8px]">
          <div className="h-14 w-14 rounded-full bg-[#c1f6e0] flex items-center justify-center mx-auto text-[#1f1f47]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-[#1f1f47]">All Critical Questions Resolved</h2>
          <p className="text-sm text-[#6c7693] max-w-md mx-auto leading-relaxed">
            Your answers have been integrated into the venture ledger and the readiness score is updated.
          </p>
        </div>
      )}

      {/* Answered Questions Ledger */}
      {answered.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#eaedf6]">
          <h3 className="text-sm font-semibold text-[#1f1f47] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#576cdb]" />
            Resolved Answers ({answered.length})
          </h3>

          <div className="space-y-3">
            {answered.map((q) => (
              <div key={q.id} className="p-5 rounded-xl bg-white border border-[#eaedf6] shadow-sm space-y-3">
                <div className="flex items-center justify-between text-sm sm:text-base gap-3">
                  <span className="font-medium text-[#1f1f47]">{q.question}</span>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#c1f6e0] text-[#1f1f47] font-bold shrink-0">
                    RESOLVED
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-[#f9f9fb] text-sm text-[#3d3d5c] flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#576cdb] mt-0.5" />
                  <span className="leading-relaxed">{q.answeredText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
