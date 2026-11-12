/**
 * Pitch-Ready: AI Startup Idea Evaluator & Problem-Solving Engine
 * Master Application Container
 * Live Gemini AI integration with QuotaExceeded prompt modal.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header.tsx';
import { TabId, SidebarNavigation } from './components/SidebarNavigation.tsx';
import { IdeaIntakeView } from './components/views/IdeaIntakeView.tsx';
import { ProblemDecompositionView } from './components/views/ProblemDecompositionView.tsx';
import { GapDetectionView } from './components/views/GapDetectionView.tsx';
import { TopsisStudioView } from './components/views/TopsisStudioView.tsx';
import { AdaptiveQuestionView } from './components/views/AdaptiveQuestionView.tsx';
import { MultiAgentCouncilView } from './components/views/MultiAgentCouncilView.tsx';
import { DynamicImprovementView } from './components/views/DynamicImprovementView.tsx';
import { PitchDeckExportView } from './components/views/PitchDeckExportView.tsx';
import { AlgorithmInspectionModal } from './components/modals/AlgorithmInspectionModal.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { IdeaValidationResult, StartupIdea, TopsisCriteriaWeights } from './types/index.ts';
import { DeckThemeName } from './server/pptxGenerator.ts';
import { EvaluationProgressBar, EvaluationStepInfo } from './components/EvaluationProgressBar.tsx';

export default function App() {
  const [ideas, setIdeas] = useState<Array<{ id: string; title: string; overallReadinessScore: number }>>([]);
  const [currentIdeaId, setCurrentIdeaId] = useState<string>('');
  const [currentIdea, setCurrentIdea] = useState<StartupIdea | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('intake');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<IdeaValidationResult | null>(null);
  const [loadingStep, setLoadingStep] = useState<EvaluationStepInfo>({
    percent: 15,
    message: 'Analyzing Pitch & Vertical Classification...',
    submessage: 'Parsing problem statement and business model mechanics...',
    currentStepIndex: 1,
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isAlgorithmsModalOpen, setIsAlgorithmsModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('pitchready_sidebar_collapsed') === 'true';
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    localStorage.setItem('pitchready_sidebar_collapsed', String(next));
  };

  // Custom API Key state & quota error tracking
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('pitchready_gemini_api_key') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isQuotaExhaustedError, setIsQuotaExhaustedError] = useState<boolean>(false);

  // Authenticated fetch wrapper injecting user-provided Gemini API key
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (customApiKey) {
      headers.set('X-Gemini-Api-Key', customApiKey);
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 429) {
      setIsQuotaExhaustedError(true);
      setIsApiKeyModalOpen(true);
    }
    return res;
  };

  const handleSaveApiKey = (newKey: string) => {
    setCustomApiKey(newKey);
    localStorage.setItem('pitchready_gemini_api_key', newKey);
    setIsQuotaExhaustedError(false);
  };

  // Initial load
  useEffect(() => {
    fetchIdeas();
  }, []);

  // Fetch full details whenever selected idea ID changes
  useEffect(() => {
    if (currentIdeaId) {
      fetchIdeaDetails(currentIdeaId);
    }
  }, [currentIdeaId]);

  const fetchIdeas = async () => {
    try {
      const res = await apiFetch('/api/ideas');
      const data = await res.json();
      if (data.success && data.ideas) {
        setIdeas(data.ideas);
        if (!currentIdeaId && data.ideas.length > 0) {
          setCurrentIdeaId(data.ideas[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    }
  };

  const fetchIdeaDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/ideas/${id}`);
      const data = await res.json();
      if (data.success && data.idea) {
        setCurrentIdea(data.idea);
      }
    } catch (err) {
      console.error('Failed to fetch idea details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Deconstruct Idea (Module 1 & 2)
  const handleDeconstruct = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    setLoadingStep({
      percent: 25,
      message: 'Re-analyzing Causal Problem DAG & Root Causes...',
      submessage: 'Updating directed cause-and-effect nodes...',
      currentStepIndex: 2,
    });

    try {
      const res1 = await apiFetch(`/api/ideas/${currentIdea.id}/decompose`, { method: 'POST' });
      await res1.json();

      setLoadingStep({
        percent: 55,
        message: 'Auditing 6-Pillar Venture Gaps (TAM, Tech, Economics, GTM, Legal, Moat)...',
        submessage: 'Evaluating risk levels across all venture dimensions...',
        currentStepIndex: 3,
      });

      const res2 = await apiFetch(`/api/ideas/${currentIdea.id}/gaps`, { method: 'POST' });
      await res2.json();

      setLoadingStep({
        percent: 85,
        message: 'Re-running 6-Persona Evaluation Council...',
        submessage: 'Updating judge consensus and persona critiques...',
        currentStepIndex: 5,
      });

      try {
        await apiFetch(`/api/ideas/${currentIdea.id}/agents/evaluate`, { method: 'POST' });
      } catch (e) {}

      setLoadingStep({
        percent: 100,
        message: 'Re-analysis Complete!',
        submessage: 'Updating workspace views...',
        currentStepIndex: 6,
      });

      await fetchIdeaDetails(currentIdea.id);
      setActiveTab('decomposition');
    } catch (err) {
      console.error('Deconstruction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Gap Detection (Module 2)
  const handleDetectGaps = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/gaps`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurrentIdea((prev) => (prev ? { ...prev, gaps: data.gaps } : null));
      }
    } catch (err) {
      console.error('Gap detection failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Solution Generation & TOPSIS (Module 4)
  const handleGenerateSolutions = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/solutions`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurrentIdea((prev) => (prev ? { ...prev, solutions: data.solutions } : null));
      }
    } catch (err) {
      console.error('Solution generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. TOPSIS Weight Recalculation (Deterministic Math)
  const handleUpdateTopsisWeights = async (weights: TopsisCriteriaWeights) => {
    if (!currentIdea) return;
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/topsis/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentIdea((prev) =>
          prev
            ? {
                ...prev,
                solutions: data.rankedSolutions,
                topsisWeights: weights,
              }
            : null
        );
      }
    } catch (err) {
      console.error('TOPSIS recalculation failed:', err);
    }
  };

  // 5. Adaptive Question Answer (Module 5)
  const handleAnswerQuestion = async (questionId: string, answerText: string) => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerText }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentIdea(data.idea);
        fetchIdeas();
      }
    } catch (err) {
      console.error('Failed to submit question answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchNextQuestion = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/questions/next`);
      const data = await res.json();
      if (data.success && data.allQuestions) {
        setCurrentIdea((prev) => (prev ? { ...prev, questions: data.allQuestions } : null));
      }
    } catch (err) {
      console.error('Failed to fetch next question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Multi-Agent Evaluation (Module 6)
  const handleRunAgents = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/agents/evaluate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurrentIdea((prev) =>
          prev
            ? {
                ...prev,
                agentCritiques: data.critiques,
                consensusReport: data.consensusReport,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Agent evaluation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Dynamic Improvement (Module 8)
  const handleSynthesizeImprovement = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/improve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurrentIdea(data.idea);
        fetchIdeas();
      }
    } catch (err) {
      console.error('Improvement synthesis failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Pitch Deck Generation (Module 9)
  const handleGenerateDeck = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/deck/generate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCurrentIdea((prev) => (prev ? { ...prev, pitchDeck: data.slides } : null));
      }
    } catch (err) {
      console.error('Deck generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 9. PPTX Export & File Download
  const handleExportPptx = async (theme: DeckThemeName = 'EXECUTIVE_DARK') => {
    if (!currentIdea) return;
    setIsExporting(true);
    try {
      const res = await apiFetch(`/api/ideas/${currentIdea.id}/deck/export-pptx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      if (!res.ok) throw new Error('Failed to generate presentation');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentIdea.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_PitchDeck.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PPTX export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Create New Custom Idea
  const [isCreatingIdea, setIsCreatingIdea] = useState<boolean>(false);

  const handleSubmitNewIdea = async (
    title: string,
    rawPitch: string,
    stage: string = 'CONCEPT'
  ) => {
    setValidationError(null);
    setIsLoading(true);
    setLoadingStep({
      percent: 12,
      message: 'Validating Idea Reality & Feasibility (Gate 0)...',
      submessage: 'Checking physics plausibility, semantic coherence, and venture viability...',
      currentStepIndex: 1,
    });

    try {
      const res = await apiFetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, rawPitch, stage }),
      });
      const data = await res.json();
      if (!data.success || !data.idea) {
        if (data.error === 'IDEA_VALIDATION_FAILED' && data.validation) {
          setValidationError(data.validation);
          setIsLoading(false);
          return;
        }
        if (data.error === 'QUOTA_EXCEEDED') {
          setIsQuotaExhaustedError(true);
          setIsApiKeyModalOpen(true);
        } else {
          alert(data.error || 'Failed to submit idea. Please check your pitch or Gemini API key.');
        }
        setIsLoading(false);
        return;
      }

      let createdIdea: StartupIdea = data.idea;

      setIdeas((prev) => [
        {
          id: createdIdea.id,
          title: createdIdea.title,
          overallReadinessScore: createdIdea.overallReadinessScore,
        },
        ...prev.filter((i) => i.id !== createdIdea.id),
      ]);
      setCurrentIdeaId(createdIdea.id);
      setCurrentIdea(createdIdea);
      setIsCreatingIdea(false);

      // Step 2: 6-Pillar Gap Audit & TOPSIS
      setLoadingStep({
        percent: 55,
        message: 'Auditing 6-Pillar Venture Gaps (TAM, Tech, Economics, Distribution, Legal, Moat)...',
        submessage: 'Evaluating structural deficiencies and defensibility barriers...',
        currentStepIndex: 3,
      });

      // Step 3: Automatically run 6-Persona Evaluation Council (VC, ICP, CTO, Lawyer, Analyst, Judge)
      setLoadingStep({
        percent: 75,
        message: 'Convening 6-Persona Evaluation Council...',
        submessage: 'VC Partner, ICP Target Customer, CTO, Lawyer, Analyst, & Judge deliberating...',
        currentStepIndex: 5,
      });

      try {
        const agentRes = await apiFetch(`/api/ideas/${createdIdea.id}/agents/evaluate`, { method: 'POST' });
        const agentData = await agentRes.json();
        if (agentData.success) {
          createdIdea = {
            ...createdIdea,
            agentCritiques: agentData.critiques,
            consensusReport: agentData.consensusReport,
          };
          setCurrentIdea(createdIdea);
        }
      } catch (agentErr) {
        console.error('Auto agent evaluation error:', agentErr);
      }

      // Step 4: Automatically fetch Adaptive Clarification Questions
      setLoadingStep({
        percent: 92,
        message: 'Generating adaptive clarification questions...',
        submessage: 'Calculating entropy scores to resolve critical founder assumptions...',
        currentStepIndex: 6,
      });

      try {
        const qRes = await apiFetch(`/api/ideas/${createdIdea.id}/questions/next`);
        const qData = await qRes.json();
        if (qData.success && qData.allQuestions) {
          createdIdea = {
            ...createdIdea,
            questions: qData.allQuestions,
          };
          setCurrentIdea(createdIdea);
        }
      } catch (qErr) {
        console.error('Auto question fetch error:', qErr);
      }

      // Finish evaluation
      setLoadingStep({
        percent: 100,
        message: 'Full Venture Audit Complete!',
        submessage: 'Redirecting to workspace...',
        currentStepIndex: 6,
      });

    } catch (err: any) {
      console.error('Failed to create new idea:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-[#1f1f47] flex flex-col font-sans selection:bg-[#576cdb]/30 selection:text-white">
      {/* Top Header Bar - Exact Reference Replica spanning full width */}
      <Header
        isDisabled={isLoading}
        onToggleMobileMenu={() => !isLoading && setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        onOpenApiKeyModal={() => {
          if (isLoading) return;
          setIsQuotaExhaustedError(false);
          setIsApiKeyModalOpen(true);
        }}
        onOpenAlgorithmsModal={() => {
          if (isLoading) return;
          setIsAlgorithmsModalOpen(true);
        }}
        idea={currentIdea}
        onNavigateTab={(tab) => {
          if (isLoading) return;
          setActiveTab(tab);
          if (tab === 'questions' && currentIdea && (!currentIdea.questions || currentIdea.questions.length === 0)) {
            handleFetchNextQuestion();
          }
          if (tab === 'deck' && currentIdea && (!currentIdea.pitchDeck || currentIdea.pitchDeck.length === 0)) {
            handleGenerateDeck();
          }
        }}
      />

      {/* Live AI Venture Evaluation Progress Bar Overlay */}
      <AnimatePresence>
        {isLoading && <EvaluationProgressBar progress={loadingStep} />}
      </AnimatePresence>

      {/* Main Workspace Body - Sidebar on Left with curved top + Content on Right */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Sidebar Navigation Drawer */}
        <SidebarNavigation
          isDisabled={isLoading}
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (isLoading) return;
            setActiveTab(tab);
            if (tab === 'questions' && currentIdea && (!currentIdea.questions || currentIdea.questions.length === 0)) {
              handleFetchNextQuestion();
            }
            if (tab === 'deck' && currentIdea && (!currentIdea.pitchDeck || currentIdea.pitchDeck.length === 0)) {
              handleGenerateDeck();
            }
          }}
          idea={currentIdea}
          onOpenAlgorithmsModal={() => {
            if (isLoading) return;
            setIsAlgorithmsModalOpen(true);
          }}
          onOpenApiKeyModal={() => {
            if (isLoading) return;
            setIsQuotaExhaustedError(false);
            setIsApiKeyModalOpen(true);
          }}
          onExportPptx={() => !isLoading && handleExportPptx('EXECUTIVE_DARK')}
          isExporting={isExporting}
          onOpenNewIdea={() => {
            if (isLoading) return;
            setActiveTab('intake');
            setIsCreatingIdea(true);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Content Area - Full width with generous padding */}
        <main className="flex-1 min-w-0 px-6 sm:px-10 py-6 pb-20 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
              className="w-full"
            >
              {activeTab === 'intake' && (
                <IdeaIntakeView
                  currentIdea={currentIdea}
                  onDeconstruct={handleDeconstruct}
                  onSubmitNewIdea={handleSubmitNewIdea}
                  isLoading={isLoading}
                  isSubmittingNew={isCreatingIdea || !currentIdea}
                  onToggleSubmitNew={(open) => setIsCreatingIdea(open)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenApiKeyModal={() => {
                    setIsQuotaExhaustedError(false);
                    setIsApiKeyModalOpen(true);
                  }}
                  validationError={validationError}
                  onDismissValidationError={() => setValidationError(null)}
                />
              )}

              {activeTab === 'decomposition' && currentIdea && (
                <ProblemDecompositionView
                  idea={currentIdea}
                  onDecompose={handleDeconstruct}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'gaps' && currentIdea && (
                <GapDetectionView
                  idea={currentIdea}
                  onDetectGaps={handleDetectGaps}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'topsis' && currentIdea && (
                <TopsisStudioView
                  idea={currentIdea}
                  onGenerateSolutions={handleGenerateSolutions}
                  onUpdateWeights={handleUpdateTopsisWeights}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'questions' && currentIdea && (
                <AdaptiveQuestionView
                  idea={currentIdea}
                  onAnswerQuestion={handleAnswerQuestion}
                  onFetchNextQuestion={handleFetchNextQuestion}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'agents' && currentIdea && (
                <MultiAgentCouncilView
                  idea={currentIdea}
                  onRunAgents={handleRunAgents}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'improvement' && currentIdea && (
                <DynamicImprovementView
                  idea={currentIdea}
                  onSynthesizeImprovement={handleSynthesizeImprovement}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'deck' && currentIdea && (
                <PitchDeckExportView
                  idea={currentIdea}
                  onGenerateDeck={handleGenerateDeck}
                  onExportPptx={handleExportPptx}
                  isLoading={isLoading}
                  isExporting={isExporting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AlgorithmInspectionModal
        isOpen={isAlgorithmsModalOpen}
        onClose={() => setIsAlgorithmsModalOpen(false)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={handleSaveApiKey}
        currentKey={customApiKey}
        isQuotaExhaustedError={isQuotaExhaustedError}
      />
    </div>
  );
}
