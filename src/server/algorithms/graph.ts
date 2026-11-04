/**
 * Real Deterministic Problem & Causal Graph Implementation
 *
 * Implements Directed Acyclic Graph (DAG) structures for startup problem decomposition,
 * cycle detection, topological sorting, causal centrality, and root cause vs. symptom classification.
 */

import { ProblemNode } from '../../types/index.ts';

export interface GraphNodeAnalysis {
  nodeId: string;
  inDegree: number;   // Number of problems causing this node
  outDegree: number;  // Number of downstream problems caused by this node
  isRootCause: boolean;
  isSymptom: boolean;
  depth: number;      // Topological depth (0 = foundational root)
  ancestorIds: string[]; // Upstream causal chain
  descendantIds: string[]; // Downstream ripple effects
  uncertaintyRating: number; // Propagated uncertainty
}

export interface GraphAnalysisResult {
  hasCycle: boolean;
  cycleNodes: string[];
  topologicalOrder: string[];
  nodeAnalyses: Record<string, GraphNodeAnalysis>;
  rootCauses: ProblemNode[];
  symptoms: ProblemNode[];
  intermediateChallenges: ProblemNode[];
}

export class ProblemDependencyGraph {
  private adjacencyList: Map<string, Set<string>> = new Map(); // from cause -> set of effects
  private reverseAdjacencyList: Map<string, Set<string>> = new Map(); // from effect -> set of causes
  private problemsMap: Map<string, ProblemNode> = new Map();

  constructor(problems: ProblemNode[]) {
    for (const p of problems) {
      this.problemsMap.set(p.id, p);
      this.adjacencyList.set(p.id, new Set());
      this.reverseAdjacencyList.set(p.id, new Set());
    }

    // Populate directed edges
    // If Problem B dependsOnProblemIds contains Problem A:
    // A -> B (A is the cause / dependency, B is the downstream symptom/effect)
    for (const p of problems) {
      if (Array.isArray(p.dependsOnProblemIds)) {
        for (const depId of p.dependsOnProblemIds) {
          if (this.problemsMap.has(depId) && depId !== p.id) {
            this.adjacencyList.get(depId)?.add(p.id);
            this.reverseAdjacencyList.get(p.id)?.add(depId);
          }
        }
      }
    }
  }

  /**
   * Detects cycles in the problem graph using 3-color DFS.
   */
  public detectCycles(): { hasCycle: boolean; cycleNodes: string[] } {
    const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
    for (const key of this.problemsMap.keys()) {
      visited.set(key, 0);
    }

    const cycleNodes: string[] = [];
    const recursionStack: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.set(nodeId, 1);
      recursionStack.push(nodeId);

      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (visited.get(neighbor) === 1) {
          // Found back-edge!
          cycleNodes.push(...recursionStack.slice(recursionStack.indexOf(neighbor)));
          return true;
        }
        if (visited.get(neighbor) === 0) {
          if (dfs(neighbor)) return true;
        }
      }

      visited.set(nodeId, 2);
      recursionStack.pop();
      return false;
    };

    for (const nodeId of this.problemsMap.keys()) {
      if (visited.get(nodeId) === 0) {
        if (dfs(nodeId)) {
          return { hasCycle: true, cycleNodes };
        }
      }
    }

    return { hasCycle: false, cycleNodes: [] };
  }

  /**
   * Performs Kahn's topological sort.
   */
  public topologicalSort(): string[] {
    const inDegreeMap = new Map<string, number>();
    for (const [id] of this.problemsMap) {
      inDegreeMap.set(id, this.reverseAdjacencyList.get(id)?.size || 0);
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegreeMap) {
      if (deg === 0) queue.push(id);
    }

    const result: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = this.adjacencyList.get(current) || new Set();
      for (const neighbor of neighbors) {
        const newDeg = (inDegreeMap.get(neighbor) || 1) - 1;
        inDegreeMap.set(neighbor, newDeg);
        if (newDeg === 0) {
          queue.push(neighbor);
        }
      }
    }

    // If topological sort missed nodes due to cycles, append remaining
    for (const id of this.problemsMap.keys()) {
      if (!result.includes(id)) {
        result.push(id);
      }
    }

    return result;
  }

  /**
   * Computes comprehensive causal analysis, isolating root causes vs. symptoms.
   */
  public analyze(): GraphAnalysisResult {
    const cycleCheck = this.detectCycles();
    const topologicalOrder = this.topologicalSort();
    const nodeAnalyses: Record<string, GraphNodeAnalysis> = {};

    const rootCauses: ProblemNode[] = [];
    const symptoms: ProblemNode[] = [];
    const intermediateChallenges: ProblemNode[] = [];

    // Compute topological depth for each node
    const depths = new Map<string, number>();
    for (const id of topologicalOrder) {
      const causes = this.reverseAdjacencyList.get(id) || new Set();
      if (causes.size === 0) {
        depths.set(id, 0);
      } else {
        let maxCauseDepth = 0;
        for (const c of causes) {
          maxCauseDepth = Math.max(maxCauseDepth, depths.get(c) || 0);
        }
        depths.set(id, maxCauseDepth + 1);
      }
    }

    for (const [id, problem] of this.problemsMap) {
      const inDegree = this.reverseAdjacencyList.get(id)?.size || 0;
      const outDegree = this.adjacencyList.get(id)?.size || 0;

      // Traversal for full upstream and downstream reach
      const ancestorIds = this.getReachable(id, this.reverseAdjacencyList);
      const descendantIds = this.getReachable(id, this.adjacencyList);

      // Root Cause: not caused by other problems in this system (inDegree == 0)
      // or causes significantly more problems than it is caused by
      const isRootCause = inDegree === 0 || (outDegree >= 2 && inDegree === 1);

      // Symptom: has causes, but causes nothing further downstream (outDegree == 0)
      const isSymptom = outDegree === 0 && inDegree > 0;

      // Propagate uncertainty: based on assumptions confidence
      const assumptions = problem.assumptions || [];
      const avgConfidence =
        assumptions.length > 0
          ? assumptions.reduce((acc, a) => acc + (a.confidence || 0.5), 0) / assumptions.length
          : 0.6;
      const uncertaintyRating = Number((1 - avgConfidence).toFixed(2));

      nodeAnalyses[id] = {
        nodeId: id,
        inDegree,
        outDegree,
        isRootCause,
        isSymptom,
        depth: depths.get(id) || 0,
        ancestorIds,
        descendantIds,
        uncertaintyRating,
      };

      const enrichedProblem: ProblemNode = {
        ...problem,
        isRootCause,
        isSymptom,
        uncertaintyScore: uncertaintyRating,
      };

      if (isRootCause) {
        rootCauses.push(enrichedProblem);
      } else if (isSymptom) {
        symptoms.push(enrichedProblem);
      } else {
        intermediateChallenges.push(enrichedProblem);
      }
    }

    return {
      hasCycle: cycleCheck.hasCycle,
      cycleNodes: cycleCheck.cycleNodes,
      topologicalOrder,
      nodeAnalyses,
      rootCauses,
      symptoms,
      intermediateChallenges,
    };
  }

  private getReachable(startId: string, adj: Map<string, Set<string>>): string[] {
    const visited = new Set<string>();
    const stack = [startId];
    while (stack.length > 0) {
      const curr = stack.pop()!;
      const neighbors = adj.get(curr) || new Set();
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          stack.push(n);
        }
      }
    }
    return Array.from(visited);
  }
}
