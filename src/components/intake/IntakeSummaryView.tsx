import React, { useState } from 'react';
import {
  AnswerRecord,
  BusinessProfile,
  ProfileField,
  SmartQuestion,
  ExpertVerdict,
  CouncilConsensus,
} from '../../types/intakeModule.ts';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  FileText,
  ShieldCheck,
  Activity,
  Users,
} from 'lucide-react';

interface IntakeSummaryViewProps {
  profile: BusinessProfile;
  initialScore: number;
  currentScore: number;
  expertVerdicts: ExpertVerdict[];
  consensus: CouncilConsensus | null;
  questions: SmartQuestion[];
  answers: AnswerRecord[];
  understood: ProfileField[];
  unknown: ProfileField[];
  onStartOver: () => void;
}

export const IntakeSummaryView: React.FC<IntakeSummaryViewProps> = ({
  profile,
  initialScore,
  currentScore,
  expertVerdicts,
  consensus,
  questions,
  answers,
  understood,
  unknown,
  onStartOver,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);

  const scoreDelta = currentScore - initialScore;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 text-[#171a1c]">
      {/* Top Banner & Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaedf6] text-[#1f1f47] text-[10px] font-bold uppercase tracking-widest border border-[#d1d6e1]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#576cdb]" />
          Mathematical Consensus Report
        </div>
        <h1 className="text-3xl sm:text-4xl font-light text-[#1f1f47] tracking-[-0.03em]">
          {profile.ideaName} Diagnostic
        </h1>
        <p className="text-sm text-[#575775] max-w-md mx-auto font-normal">
          {profile.businessType} • {profile.customerType} model
        </p>
      </div>

      {/* Hero Council Consensus Card */}
      <div className="bg-white rounded-3xl border border-[#eaedf6] p-8 shadow-[0_12px_40px_rgb(0,0,0,0.04)] space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-[#84849a] uppercase tracking-[0.15em] mb-1">Mathematical Consensus Score</div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-light text-[#1f1f47] tracking-tight">
                  {currentScore}
                </span>
                <span className="text-xl text-[#84849a] font-normal">/ 100</span>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f9f9fb] border border-[#eaedf6]">
              <div className={`w-2 h-2 rounded-full ${scoreDelta >= 0 ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} />
              <span className="text-xs font-medium text-[#1f1f47]">
                {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} variance from initial sentiment
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="text-[10px] font-bold text-[#84849a] uppercase tracking-[0.15em]">Council Verdict</div>
            <div className="text-xl font-medium text-[#1f1f47] leading-tight tracking-[-0.02em]">
              {consensus?.verdict.replace(/_/g, ' ')}
            </div>
            <p className="text-sm text-[#3d3d5c] leading-relaxed font-medium">
              {consensus?.synthesis}
            </p>
            {consensus?.isPolarizing && (
              <div className="p-3 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#ef4444] shrink-0" />
                <p className="text-xs text-[#ef4444] font-bold">
                  HIGH POLARITY: Experts are sharply divided on this proposal. Success depends on resolving specific skepticism identified below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Expert Detail Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {expertVerdicts.map((v) => (
            <div key={v.personaId} className="p-4 rounded-2xl bg-[#f9f9fb] border border-[#eaedf6] space-y-2">
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm ${
                  v.sentiment === 'BULLISH' ? 'bg-[#10b981]' : v.sentiment === 'SKEPTICAL' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'
                }`}>
                  {v.personaName.charAt(0)}
                </div>
                <div className="text-sm font-black text-[#1f1f47]">{v.overallScore}/10</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#1f1f47] truncate">{v.personaName}</div>
                <div className="text-[9px] text-[#84849a] font-bold uppercase tracking-tighter">{v.personaRole}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expert Tension Points */}
      {consensus && consensus.tensionPoints.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Users className="w-4 h-4 text-[#576cdb]" />
            <h2 className="text-xs font-bold text-[#84849a] uppercase tracking-widest">Dialectical Tension Points</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {consensus.tensionPoints.map((tp, idx) => (
              <div key={tp.dimension} className="bg-white rounded-2xl border border-[#eaedf6] p-5 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#f59e0b]" />
                <div className="text-[10px] font-black text-[#f59e0b] uppercase tracking-widest">Conflict {idx + 1}</div>
                <div className="text-sm font-bold text-[#1f1f47]">{tp.dimension}</div>
                <p className="text-xs text-[#3d3d5c] font-medium leading-relaxed">
                  {tp.description}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="text-[9px] font-bold px-2 py-0.5 bg-[#eaedf6] rounded-md text-[#1f1f47]">vs</div>
                  <span className="text-[9px] font-bold text-[#84849a]">{tp.agents.join(' & ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Understood vs Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#10b981] font-bold text-xs uppercase tracking-widest pb-2 border-b border-[#eaedf6]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Dynamics ({understood.length})</span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {understood.map((field) => (
              <div key={field.key} className="p-4 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1f1f47]">{field.label}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#10b981]/10 text-[#10b981] font-bold text-[9px]">
                    {field.confidence === 1 ? '1.0' : '0.5'}
                  </span>
                </div>
                <p className="text-xs text-[#3d3d5c] font-medium leading-relaxed">{field.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#eaedf6] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#ef4444] font-bold text-xs uppercase tracking-widest pb-2 border-b border-[#eaedf6]">
            <AlertTriangle className="w-4 h-4" />
            <span>Unresolved Uncertainties ({unknown.length})</span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {unknown.map((field) => (
              <div key={field.key} className="p-4 rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1f1f47]">{field.label}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#ef4444]/10 text-[#ef4444] font-bold text-[9px]">
                    Impact {field.impact}/5
                  </span>
                </div>
                <p className="text-xs text-[#ef4444] font-bold leading-relaxed">
                  {field.notes || 'Unspecified risk factor needing validation.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Over Button */}
      <div className="text-center pt-8">
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#1f1f47] hover:bg-[#3d3d5c] text-white font-bold text-sm transition cursor-pointer shadow-lg shadow-[#1f1f47]/20"
        >
          <RotateCcw className="w-5 h-5" />
          <span>New Startup Analysis</span>
        </button>
      </div>
    </div>
  );
};
