/**
 * Adaptive Question Engine View - RevenueCat Style
 * White cards, 16px corners, periwinkle signal selection, clean resolution ledger.
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { StartupIdea } from '../../types/index.ts';

interface AdaptiveQuestionViewProps {
  idea: StartupIdea;
  onAnswerQuestion: (questionId: string, answerText: string) => void;
  onFetchNextQuestion: () => void;
  isLoading: boolean;
}

export const AdaptiveQuestionView: React.FC<AdaptiveQuestionViewProps> = ({
  idea,
  onAnswerQuestion,
  onFetchNextQuestion,
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
    <div className="space-y-6 max-w-[900px] mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf6] pb-4">
        <div>
          <h1 className="text-2xl font-light text-[#1f1f47] tracking-tight">
            Adaptive Information-Entropy Q&A
          </h1>
          <p className="text-xs text-[#6c7693] mt-0.5">
            Prioritized by uncertainty. Answering resolves assumptions and updates the readiness score.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-[#ffedd5] text-[#ea580c] font-medium">
            {unanswered.length} Gaps Pending
          </span>
          <span className="px-3 py-1 rounded-full bg-[#c1f6e0] text-[#1f1f47] font-medium">
            {answered.length} Resolved
          </span>
        </div>
      </div>

      {/* Active Question Card */}
      {activeQuestion ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#eaedf6] p-8 space-y-6 shadow-[rgba(73,46,107,0.08)_0px_3px_16px]"
        >
          <div className="flex items-center justify-between border-b border-[#eaedf6] pb-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#d6dbf5] text-[#1f1f47] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#576cdb]" />
              Priority Question ({activeQuestion.priorityScore.toFixed(1)})
            </span>
            <span className="text-xs text-[#6c7693] font-mono">ID: {activeQuestion.id}</span>
          </div>

          <div>
            <h2 className="text-xl font-medium text-[#1f1f47] tracking-[-0.02em] leading-snug">
              {activeQuestion.question}
            </h2>

            {/* Investor Rationale Callout */}
            <div className="mt-4 p-4 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] text-xs text-[#3d3d5c] flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#576cdb] mt-0.5" />
              <div>
                <span className="font-semibold text-[#1f1f47] block mb-0.5">Investor Context:</span>
                <span className="leading-relaxed">{activeQuestion.investorRationale}</span>
              </div>
            </div>
          </div>

          {/* Quick Answers */}
          {activeQuestion.suggestedAnswers && activeQuestion.suggestedAnswers.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-[#1f1f47] block">
                Select a response:
              </label>
              <div className="space-y-2">
                {activeQuestion.suggestedAnswers.map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedQuickAnswer(option);
                      setCustomAnswer('');
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
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
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1f1f47]">
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
              className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-xs text-[#171a1c] placeholder-[#6c7693] outline-none resize-none transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#6c7693]">
              Resolves assumption & upgrades readiness index
            </span>

            <button
              type="submit"
              disabled={isLoading || (!selectedQuickAnswer && !customAnswer.trim())}
              className="px-6 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white font-medium text-xs shadow-[0_2px_8px_rgba(87,108,219,0.25)] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Answer</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-10 rounded-2xl bg-white border border-[#eaedf6] text-center space-y-3 shadow-[rgba(73,46,107,0.06)_0px_2px_8px]">
          <div className="h-12 w-12 rounded-full bg-[#c1f6e0] flex items-center justify-center mx-auto text-[#1f1f47]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-[#1f1f47]">All Critical Questions Resolved</h2>
          <p className="text-xs text-[#6c7693] max-w-sm mx-auto">
            Your answers have been integrated into the venture ledger and the readiness score is updated.
          </p>
        </div>
      )}

      {/* Answered Questions Ledger */}
      {answered.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#eaedf6]">
          <h3 className="text-xs font-semibold text-[#1f1f47] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#576cdb]" />
            Resolved Answers ({answered.length})
          </h3>

          <div className="space-y-3">
            {answered.map((q) => (
              <div key={q.id} className="p-4 rounded-xl bg-white border border-[#eaedf6] shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1f1f47]">{q.question}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#c1f6e0] text-[#1f1f47]">
                    RESOLVED
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#f9f9fb] text-xs text-[#3d3d5c] flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#576cdb] mt-0.5" />
                  <span>{q.answeredText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
