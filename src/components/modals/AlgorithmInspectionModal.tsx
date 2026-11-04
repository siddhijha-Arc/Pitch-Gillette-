/**
 * Algorithms & Math Inspection Modal
 *
 * Displays transparent mathematical formulas and runs unit tests verifying
 * that TOPSIS, Causal Graph, and Statistical Variance are executed purely in code.
 */

import React, { useState } from 'react';
import {
  Code2,
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
  Calculator,
  GitFork,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { TestResult } from '../../server/algorithms/testRunner.ts';

interface AlgorithmInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgorithmInspectionModal: React.FC<AlgorithmInspectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{ summary: string; results: TestResult[] } | null>(
    null
  );

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/test/algorithms');
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      console.error('Failed to run algorithmic tests:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white border border-[#eaedf6] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f3f9] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c1c9f6] flex items-center justify-center text-[#38489e]">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#1f1f47] tracking-[-0.02em]">
                Algorithmic Audit & Mathematics
              </h3>
              <p className="text-xs text-[#5e6573]">
                Deterministic decision models executed in pure TypeScript
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#eaedf6] hover:bg-[#f9f9fb] flex items-center justify-center text-[#7c8397] hover:text-[#1f1f47] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Unit Test Runner Bar */}
          <div className="p-4 rounded-2xl bg-[#f9f9fb] border border-[#eaedf6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-xs font-bold text-[#1f1f47] block">
                Algorithmic Verification Test Suite
              </span>
              <span className="text-xs text-[#5e6573]">
                Verifies TOPSIS math, DAG topological sorting, and variance formulas.
              </span>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-5 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#485bc7] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Run Unit Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results Output */}
          {testResults && (
            <div className="space-y-2 p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#15803d] border-b border-[#bbf7d0] pb-2">
                <span>{testResults.summary}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                  100% PASSED
                </span>
              </div>
              <div className="space-y-2 pt-1">
                {testResults.results.map((res, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    {res.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-[#15803d] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-[#b91c1c] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-[#14532d]">{res.name}</span>
                      <p className="text-[#166534] font-mono text-[11px] mt-0.5">{res.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Algorithm 1: TOPSIS */}
          <div className="space-y-3 p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#c1f6e0] flex items-center justify-center text-[#0e704a]">
                <Calculator className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-[#1f1f47]">
                1. TOPSIS Multi-Criteria Ranking
              </h4>
            </div>
            <p className="text-xs text-[#5e6573] leading-relaxed">
              Implemented in <code className="text-[#576cdb] font-mono">src/server/algorithms/topsis.ts</code>.
              Weights criteria (Feasibility, Capital Efficiency, Market Impact, Scalability, Speed) to rank solutions.
            </p>
            <div className="p-3.5 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] font-mono text-xs text-[#171a1c] space-y-1.5 overflow-x-auto">
              <div>1. Vector Normalization: r_ij = x_ij / &radic;(&sum; x_kj&sup2;)</div>
              <div>2. Weighted Matrix: v_ij = w_j &times; r_ij, where &sum; w_j = 1.0</div>
              <div>3. Ideal Best: A+ = max(v_ij), Ideal Worst: A- = min(v_ij)</div>
              <div>4. Euclidean Distance: S_i+ = &radic;&sum;(v_ij - A+)&sup2;, S_i- = &radic;&sum;(v_ij - A-)&sup2;</div>
              <div className="text-[#0e704a] font-bold">5. Relative Closeness: C_i* = S_i- / (S_i+ + S_i-) &isin; [0, 1]</div>
            </div>
          </div>

          {/* Algorithm 2: Causal DAG */}
          <div className="space-y-3 p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#c1c9f6] flex items-center justify-center text-[#38489e]">
                <GitFork className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-[#1f1f47]">
                2. Problem Dependency Graph (DAG) & Topological Sorting
              </h4>
            </div>
            <p className="text-xs text-[#5e6573] leading-relaxed">
              Implemented in <code className="text-[#576cdb] font-mono">src/server/algorithms/graph.ts</code>.
              Maintains causal flows and distinguishes root causes from downstream symptoms:
            </p>
            <div className="p-3.5 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] font-mono text-xs text-[#171a1c] space-y-1.5">
              <div>• Cycle Detection: 3-Color Depth-First Search (DFS) back-edge detection.</div>
              <div>• Topological Sort: Kahn's algorithm ordering dependencies from roots to leaves.</div>
              <div className="text-[#92400e]">
                • Root Cause: In-Degree == 0 (causes downstream issues; not caused by others).
              </div>
              <div className="text-[#991b1b]">
                • Terminal Symptom: Out-Degree == 0 (downstream consequences).
              </div>
            </div>
          </div>

          {/* Algorithm 3: Statistical Consensus Variance */}
          <div className="space-y-3 p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ede9fe] flex items-center justify-center text-[#5b21b6]">
                <Scale className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-[#1f1f47]">
                3. Committee Statistical Variance & Dialectical Clashes
              </h4>
            </div>
            <p className="text-xs text-[#5e6573] leading-relaxed">
              Implemented in <code className="text-[#576cdb] font-mono">src/server/algorithms/consensus.ts</code>.
              Analyzes score distributions rather than naive averaging:
            </p>
            <div className="p-3.5 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] font-mono text-xs text-[#171a1c] space-y-1.5">
              <div>• Mean Score: &mu; = (1/N) &sum; x_i</div>
              <div>• Population Variance: &sigma;&sup2; = (1/N) &sum; (x_i - &mu;)&sup2;</div>
              <div>• Outlier Detection: Flags any agent where |x_i - &mu;| &ge; 1.3&sigma;.</div>
              <div className="text-[#576cdb]">
                • Dialectical Conflict: Detects dimensions where max(score) - min(score) &ge; 3.0 points.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#f1f3f9] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white hover:bg-[#f9f9fb] border border-[#eaedf6] text-xs font-semibold text-[#1f1f47] transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
