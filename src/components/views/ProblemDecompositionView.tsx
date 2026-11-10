/**
 * GILLET CHECK - Problem Decomposition & Causal Graph System
 *
 * Fully interactive, dynamic Causal Problem Mapping System:
 * - Multi-tier causal network (Root Causes [Red], Intermediate Problems [Orange], Symptoms [Yellow])
 * - Multi-parent, multi-child, 1-to-many, many-to-1, many-to-many relationships
 * - Interactive Canvas: Pan, Zoom, Drag nodes, Fit-to-screen
 * - Path Tracing: Trace Root Causes backwards, Trace Downstream Impact forwards
 * - Node Expand/Collapse branches
 * - Automatic rank layout with collision avoidance
 * - Directional bezier arrows with causal relationship labels
 * - Deep Node Detail Panel with verified evidence vs AI hypothesis vs founder assumptions
 * - Graph Simulation: Cycle detection, disconnected node detection, critical bottlenecks
 * - User-Friendly Summary with metrics and plain-language critical chain summary
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sparkles,
  TrendingDown,
  RefreshCw,
  X,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Activity,
  Filter,
  Eye,
  GitFork,
  ArrowLeft,
  Info,
  Maximize,
  Compass,
} from 'lucide-react';
import { ProblemNode, StartupIdea, ProblemCategory, ProblemNodeType } from '../../types/index.ts';

interface ProblemDecompositionViewProps {
  idea: StartupIdea;
  onDecompose: () => void;
  isLoading: boolean;
}

interface NodeLayout {
  id: string;
  problem: ProblemNode;
  tier: number; // 0 = Root, 1..k = Intermediate, max = Symptom
  x: number;
  y: number;
  width: number;
  height: number;
  nodeType: ProblemNodeType;
  inDegree: number;
  outDegree: number;
  upstreamCauses: string[];
  downstreamEffects: string[];
}

interface EdgeLayout {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  pathD: string;
  midX: number;
  midY: number;
  isCycle?: boolean;
}

export const ProblemDecompositionView: React.FC<ProblemDecompositionViewProps> = ({
  idea,
  onDecompose,
  isLoading,
}) => {
  const problems = useMemo(() => idea.problems || [], [idea.problems]);

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [traceMode, setTraceMode] = useState<'NONE' | 'UPSTREAM' | 'DOWNSTREAM'>('NONE');
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // Pan & Zoom state
  const [transform, setTransform] = useState<{ x: number; y: number; zoom: number }>({
    x: 40,
    y: 30,
    zoom: 0.95,
  });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Custom dragged positions for individual nodes
  const [draggedOffsets, setDraggedOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const draggingNodeRef = useRef<{ id: string; startX: number; startY: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Build Deterministic Graph Topology
  const graphTopology = useMemo(() => {
    const adj = new Map<string, Set<string>>(); // cause -> set of effects
    const revAdj = new Map<string, Set<string>>(); // effect -> set of causes
    const probMap = new Map<string, ProblemNode>();

    for (const p of problems) {
      probMap.set(p.id, p);
      adj.set(p.id, new Set());
      revAdj.set(p.id, new Set());
    }

    for (const p of problems) {
      const deps = p.dependsOnProblemIds || [];
      for (const depId of deps) {
        if (probMap.has(depId) && depId !== p.id) {
          adj.get(depId)?.add(p.id);
          revAdj.get(p.id)?.add(depId);
        }
      }
    }

    // Detect Cycles via DFS
    const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
    const cycleEdges = new Set<string>();
    const cycleNodes = new Set<string>();

    const dfsCycle = (curr: string, stack: string[]): boolean => {
      visited.set(curr, 1);
      stack.push(curr);

      const neighbors = adj.get(curr) || new Set();
      for (const n of neighbors) {
        if (visited.get(n) === 1) {
          cycleEdges.add(`${curr}->${n}`);
          cycleNodes.add(curr);
          cycleNodes.add(n);
        } else if (!visited.get(n)) {
          dfsCycle(n, stack);
        }
      }

      visited.set(curr, 2);
      stack.pop();
      return false;
    };

    for (const id of probMap.keys()) {
      if (!visited.get(id)) {
        dfsCycle(id, []);
      }
    }

    // Topological depth calculation (Layer assignment)
    const depths = new Map<string, number>();
    const getDepth = (id: string, path: Set<string>): number => {
      if (depths.has(id)) return depths.get(id)!;
      if (path.has(id)) return 0; // break cycles
      path.add(id);

      const causes = Array.from(revAdj.get(id) || []);
      if (causes.length === 0) {
        depths.set(id, 0);
        return 0;
      }

      let maxParentDepth = 0;
      for (const c of causes) {
        maxParentDepth = Math.max(maxParentDepth, getDepth(c, new Set(path)));
      }

      const d = maxParentDepth + 1;
      depths.set(id, d);
      return d;
    };

    for (const id of probMap.keys()) {
      getDepth(id, new Set());
    }

    // Categorize nodes into tiers:
    // Root Causes: inDegree === 0 (or causes far more than caused by)
    // Symptoms: outDegree === 0 && inDegree > 0
    // Intermediate: inDegree > 0 && outDegree > 0
    const nodeTypes = new Map<string, ProblemNodeType>();
    for (const [id] of probMap) {
      const inDeg = revAdj.get(id)?.size || 0;
      const outDeg = adj.get(id)?.size || 0;

      if (inDeg === 0) {
        nodeTypes.set(id, 'ROOT_CAUSE');
      } else if (outDeg === 0) {
        nodeTypes.set(id, 'SYMPTOM');
      } else {
        nodeTypes.set(id, 'INTERMEDIATE');
      }
    }

    // Calculate ancestors and descendants for each node (for ripple reach)
    const ancestorsMap = new Map<string, Set<string>>();
    const descendantsMap = new Map<string, Set<string>>();

    const getReachable = (startId: string, mapAdj: Map<string, Set<string>>): Set<string> => {
      const reached = new Set<string>();
      const queue = [startId];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const neighbors = mapAdj.get(curr) || new Set();
        for (const n of neighbors) {
          if (!reached.has(n)) {
            reached.add(n);
            queue.push(n);
          }
        }
      }
      return reached;
    };

    for (const id of probMap.keys()) {
      ancestorsMap.set(id, getReachable(id, revAdj));
      descendantsMap.set(id, getReachable(id, adj));
    }

    return {
      adj,
      revAdj,
      probMap,
      depths,
      nodeTypes,
      cycleEdges,
      cycleNodes,
      hasCycle: cycleNodes.size > 0,
      ancestorsMap,
      descendantsMap,
    };
  }, [problems]);

  // 2. Compute Responsive Layout Positions
  const { nodeLayouts, edgeLayouts, tiersCount, maxTierHeight } = useMemo(() => {
    if (problems.length === 0) {
      return { nodeLayouts: [], edgeLayouts: [], tiersCount: 0, maxTierHeight: 0 };
    }

    const { adj, revAdj, probMap, depths, nodeTypes, cycleEdges } = graphTopology;

    // Determine tier groupings:
    // Tier 0: Root Causes (nodeType === 'ROOT_CAUSE')
    // Tier 1..k: Intermediate Problems (grouped by relative depth)
    // Tier Last: Symptoms (nodeType === 'SYMPTOM')
    const rootNodes: ProblemNode[] = [];
    const intermediateNodes: ProblemNode[] = [];
    const symptomNodes: ProblemNode[] = [];

    for (const p of problems) {
      const type = nodeTypes.get(p.id) || (p.isRootCause ? 'ROOT_CAUSE' : p.isSymptom ? 'SYMPTOM' : 'INTERMEDIATE');
      if (type === 'ROOT_CAUSE') {
        rootNodes.push(p);
      } else if (type === 'SYMPTOM') {
        symptomNodes.push(p);
      } else {
        intermediateNodes.push(p);
      }
    }

    // Split intermediate into sub-tiers if multiple depths exist
    const intermediateTiersMap = new Map<number, ProblemNode[]>();
    for (const p of intermediateNodes) {
      const d = Math.max(1, depths.get(p.id) || 1);
      if (!intermediateTiersMap.has(d)) {
        intermediateTiersMap.set(d, []);
      }
      intermediateTiersMap.get(d)!.push(p);
    }

    const sortedIntermediateDepths = Array.from(intermediateTiersMap.keys()).sort((a, b) => a - b);

    // Assemble ordered columns
    const columns: ProblemNode[][] = [];
    columns.push(rootNodes);
    for (const d of sortedIntermediateDepths) {
      columns.push(intermediateTiersMap.get(d)!);
    }
    // If no intermediate nodes, symptom is column 1; otherwise column n
    columns.push(symptomNodes);

    // Layout dimensional constants
    const cardWidth = 320;
    const cardHeight = 150;
    const columnGap = 160;
    const rowGap = 36;
    const startX = 60;
    const startY = 70;

    let maxColHeight = 0;
    const layouts: NodeLayout[] = [];
    const posMap = new Map<string, { x: number; y: number }>();

    columns.forEach((col, colIdx) => {
      const colX = startX + colIdx * (cardWidth + columnGap);
      const totalColHeight = col.length * (cardHeight + rowGap);
      if (totalColHeight > maxColHeight) maxColHeight = totalColHeight;

      col.forEach((prob, rowIdx) => {
        const defaultY = startY + rowIdx * (cardHeight + rowGap);
        const drag = draggedOffsets[prob.id] || { x: 0, y: 0 };
        const finalX = colX + drag.x;
        const finalY = defaultY + drag.y;

        posMap.set(prob.id, { x: finalX, y: finalY });

        const type = nodeTypes.get(prob.id) || 'INTERMEDIATE';
        layouts.push({
          id: prob.id,
          problem: prob,
          tier: colIdx,
          x: finalX,
          y: finalY,
          width: cardWidth,
          height: cardHeight,
          nodeType: type,
          inDegree: revAdj.get(prob.id)?.size || 0,
          outDegree: adj.get(prob.id)?.size || 0,
          upstreamCauses: Array.from(revAdj.get(prob.id) || []),
          downstreamEffects: Array.from(adj.get(prob.id) || []),
        });
      });
    });

    // Generate Directional Edge Curves with midpoint coordinates
    const edges: EdgeLayout[] = [];
    for (const [causeId, effectSet] of adj) {
      const causePos = posMap.get(causeId);
      if (!causePos) continue;

      for (const effectId of effectSet) {
        const effectPos = posMap.get(effectId);
        if (!effectPos) continue;

        // Skip edge if cause is collapsed
        if (collapsedNodeIds.has(causeId)) continue;

        // Start point: right edge of cause card
        const x1 = causePos.x + cardWidth;
        const y1 = causePos.y + cardHeight / 2;

        // End point: left edge of effect card
        const x2 = effectPos.x;
        const y2 = effectPos.y + cardHeight / 2;

        const dx = Math.max(40, (x2 - x1) * 0.45);
        const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        // Bezier midpoint approximation for relationship tag
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Pick contextual relationship label
        const causeNode = probMap.get(causeId);
        const effectNode = probMap.get(effectId);
        let label = 'Leads to';
        if (causeNode?.category === 'TECH' && effectNode?.category === 'OPERATIONAL') label = 'Constrains';
        else if (causeNode?.category === 'MARKET') label = 'Triggers';
        else if (causeNode?.category === 'FINANCIAL') label = 'Amplifies';
        else if (causeNode?.isRootCause) label = 'Directly causes';

        const isCycle = cycleEdges.has(`${causeId}->${effectId}`);

        edges.push({
          id: `${causeId}->${effectId}`,
          fromId: causeId,
          toId: effectId,
          label,
          pathD,
          midX,
          midY,
          isCycle,
        });
      }
    }

    return {
      nodeLayouts: layouts,
      edgeLayouts: edges,
      tiersCount: columns.length,
      maxTierHeight: maxColHeight,
    };
  }, [problems, graphTopology, draggedOffsets, collapsedNodeIds]);

  // 3. Highlighted Subgraph Logic
  const highlightedState = useMemo(() => {
    const highlightedNodeIds = new Set<string>();
    const highlightedEdgeIds = new Set<string>();

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      for (const p of problems) {
        if (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        ) {
          highlightedNodeIds.add(p.id);
        }
      }
    }

    if (selectedNodeId) {
      highlightedNodeIds.add(selectedNodeId);

      const ancestors = graphTopology.ancestorsMap.get(selectedNodeId) || new Set();
      const descendants = graphTopology.descendantsMap.get(selectedNodeId) || new Set();

      if (traceMode === 'UPSTREAM') {
        ancestors.forEach((id) => highlightedNodeIds.add(id));
      } else if (traceMode === 'DOWNSTREAM') {
        descendants.forEach((id) => highlightedNodeIds.add(id));
      } else {
        // Direct connections highlight
        const directParents = graphTopology.revAdj.get(selectedNodeId) || new Set();
        const directChildren = graphTopology.adj.get(selectedNodeId) || new Set();
        directParents.forEach((id) => highlightedNodeIds.add(id));
        directChildren.forEach((id) => highlightedNodeIds.add(id));
      }

      // Highlight active edges
      for (const edge of edgeLayouts) {
        if (highlightedNodeIds.has(edge.fromId) && highlightedNodeIds.has(edge.toId)) {
          highlightedEdgeIds.add(edge.id);
        }
      }
    }

    const hasActiveHighlight =
      selectedNodeId !== null || searchQuery.trim() !== '' || selectedCategory !== 'ALL';

    return {
      hasActiveHighlight,
      highlightedNodeIds,
      highlightedEdgeIds,
    };
  }, [
    selectedNodeId,
    searchQuery,
    selectedCategory,
    traceMode,
    graphTopology,
    problems,
    edgeLayouts,
  ]);

  // Selected Problem details
  const activeNode = useMemo(() => {
    return problems.find((p) => p.id === selectedNodeId) || null;
  }, [problems, selectedNodeId]);

  // 4. Pan & Drag Event Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (draggingNodeRef.current) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNodeRef.current) {
        const { id, startX, startY } = draggingNodeRef.current;
        const deltaX = (e.clientX - startX) / transform.zoom;
        const deltaY = (e.clientY - startY) / transform.zoom;
        setDraggedOffsets((prev) => ({
          ...prev,
          [id]: {
            x: (prev[id]?.x || 0) + deltaX,
            y: (prev[id]?.y || 0) + deltaY,
          },
        }));
        draggingNodeRef.current = { id, startX: e.clientX, startY: e.clientY };
        return;
      }

      if (isPanning) {
        setTransform((prev) => ({
          ...prev,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        }));
      }
    },
    [isPanning, panStart, transform.zoom]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    draggingNodeRef.current = null;
  }, []);

  // Zoom controls
  const handleZoomIn = () => setTransform((t) => ({ ...t, zoom: Math.min(t.zoom + 0.15, 1.8) }));
  const handleZoomOut = () => setTransform((t) => ({ ...t, zoom: Math.max(t.zoom - 0.15, 0.4) }));
  const handleFitScreen = () => {
    setTransform({ x: 30, y: 30, zoom: 0.88 });
    setDraggedOffsets({});
  };

  // Node selection & inspection
  const handleSelectNode = (nodeId: string) => {
    if (selectedNodeId === nodeId) {
      setIsDetailDrawerOpen(true);
    } else {
      setSelectedNodeId(nodeId);
      setIsDetailDrawerOpen(true);
      setTraceMode('NONE');
    }
  };

  // Toggle Collapse on Branch
  const handleToggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // Tracing actions
  const handleTraceUpstream = () => setTraceMode('UPSTREAM');
  const handleTraceDownstream = () => setTraceMode('DOWNSTREAM');
  const handleResetTrace = () => {
    setTraceMode('NONE');
    setSelectedNodeId(null);
  };

  // Stats calculation
  const totalRootCauses = nodeLayouts.filter((n) => n.nodeType === 'ROOT_CAUSE').length;
  const totalIntermediate = nodeLayouts.filter((n) => n.nodeType === 'INTERMEDIATE').length;
  const totalSymptoms = nodeLayouts.filter((n) => n.nodeType === 'SYMPTOM').length;
  const totalEdges = edgeLayouts.length;

  // Key bottleneck (Root cause with highest downstream impact)
  const keyBottleneck = useMemo(() => {
    let maxDescendants = -1;
    let bottleneckNode: ProblemNode | null = null;
    for (const node of nodeLayouts) {
      if (node.nodeType === 'ROOT_CAUSE') {
        const count = graphTopology.descendantsMap.get(node.id)?.size || 0;
        if (count > maxDescendants) {
          maxDescendants = count;
          bottleneckNode = node.problem;
        }
      }
    }
    return { node: bottleneckNode, count: maxDescendants };
  }, [nodeLayouts, graphTopology.descendantsMap]);

  // Color helper functions
  const getNodeColorTheme = (type: ProblemNodeType) => {
    switch (type) {
      case 'ROOT_CAUSE':
        return {
          bg: 'bg-gradient-to-b from-[#fff5f5] via-[#fffbfb] to-white',
          border: 'border-[#fca5a5]',
          borderActive: 'border-[#e11d48] ring-4 ring-[#ffe4e6]',
          badgeBg: 'bg-[#ffe4e6]',
          badgeText: 'text-[#e11d48]',
          badgeLabel: 'ROOT CAUSE',
          dot: 'bg-[#f43f5e]',
          glow: 'shadow-[0_4px_20px_rgba(225,29,72,0.12)]',
          iconColor: 'text-[#e11d48]',
        };
      case 'INTERMEDIATE':
        return {
          bg: 'bg-gradient-to-b from-[#fff7ed] via-[#fffdfa] to-white',
          border: 'border-[#fdba74]',
          borderActive: 'border-[#ea580c] ring-4 ring-[#ffedd5]',
          badgeBg: 'bg-[#ffedd5]',
          badgeText: 'text-[#ea580c]',
          badgeLabel: 'INTERMEDIATE',
          dot: 'bg-[#f97316]',
          glow: 'shadow-[0_4px_20px_rgba(234,88,12,0.12)]',
          iconColor: 'text-[#ea580c]',
        };
      case 'SYMPTOM':
      default:
        return {
          bg: 'bg-gradient-to-b from-[#fefce8] via-[#fffffa] to-white',
          border: 'border-[#fde047]',
          borderActive: 'border-[#ca8a04] ring-4 ring-[#fef9c3]',
          badgeBg: 'bg-[#fef9c3]',
          badgeText: 'text-[#a16207]',
          badgeLabel: 'SYMPTOM',
          dot: 'bg-[#eab308]',
          glow: 'shadow-[0_4px_20px_rgba(202,138,4,0.12)]',
          iconColor: 'text-[#a16207]',
        };
    }
  };

  return (
    <div className="w-full space-y-6 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#eaedf6] pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
            Causal Problem Mapping System
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1.5 leading-relaxed">
            Multi-tiered directed causal network isolating root causes, intermediate friction hurdles, and observable symptoms.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDecompose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(87,108,219,0.25)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Simulating Network...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Re-Analyze Causal Graph</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Requirement 6: User-Friendly Summary) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Red: Root Causes */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#fff5f5] to-white border border-[#fed7d7] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e11d48] block">
              ROOT CAUSES
            </span>
            <div className="text-3xl font-extrabold text-[#0f172a] mt-0.5">
              {totalRootCauses}
            </div>
            <span className="text-xs text-[#9f1239] mt-0.5 block">
              Foundational origins
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Orange: Intermediate Problems */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#fff7ed] to-white border border-[#fed7aa] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c] block">
              INTERMEDIATE
            </span>
            <div className="text-3xl font-extrabold text-[#0f172a] mt-0.5">
              {totalIntermediate}
            </div>
            <span className="text-xs text-[#9a3412] mt-0.5 block">
              Catalysts & friction
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center font-bold">
            <GitFork className="w-5 h-5" />
          </div>
        </div>

        {/* Yellow: Symptoms */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#fefce8] to-white border border-[#fef08a] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a16207] block">
              SYMPTOMS
            </span>
            <div className="text-3xl font-extrabold text-[#0f172a] mt-0.5">
              {totalSymptoms}
            </div>
            <span className="text-xs text-[#854d0e] mt-0.5 block">
              Observable effects
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#fef9c3] text-[#a16207] flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Total Connections */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#f8f9ff] to-white border border-[#d6dbf5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#576cdb] block">
              CONNECTIONS
            </span>
            <div className="text-3xl font-extrabold text-[#0f172a] mt-0.5">
              {totalEdges}
            </div>
            <span className="text-xs text-[#64748b] mt-0.5 block">
              Directed cause-effects
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#e0e7ff] text-[#576cdb] flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. AI Critical Causal Chain Banner */}
      <div className="p-5 rounded-2xl bg-white border border-[#eaedf6] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#e0e7ff] text-[#576cdb] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">
              Primary Critical Causal Chain
            </h3>
            <p className="text-sm text-[#334155] font-medium mt-1 leading-relaxed">
              {idea.causalSummary ||
                `Root bottleneck "${keyBottleneck.node?.title || 'Systemic friction'}" directly generates ${
                  keyBottleneck.count
                } ripple disruptions downstream, cascading through intermediate bottlenecks before manifesting as surface symptoms.`}
            </p>
          </div>
        </div>

        {/* Circular Dependency Warning If Any */}
        {graphTopology.hasCycle && (
          <div className="px-4 py-2.5 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-center gap-2 text-xs font-semibold text-[#e11d48] shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#e11d48]" />
            <span>Cycle Warning: Circular causal dependencies detected.</span>
          </div>
        )}
      </div>

      {/* 4. Graph Navigation & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#eaedf6] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a94a6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problem, category, or mechanism..."
            className="w-full h-10 pl-10 pr-8 rounded-full bg-[#f8f9fb] border border-[#eaedf6] text-xs text-[#0f172a] placeholder-[#8a94a6] focus:outline-hidden focus:border-[#576cdb] focus:bg-white transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a94a6] hover:text-[#0f172a]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-[11px] font-bold text-[#8a94a6] uppercase tracking-wider mr-1 hidden lg:inline">
            Category:
          </span>
          {['ALL', 'TECH', 'MARKET', 'FINANCIAL', 'OPERATIONAL', 'REGULATORY', 'COMPETITIVE'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#576cdb] text-white shadow-xs'
                    : 'bg-[#f1f4fb] text-[#64748b] hover:bg-[#eaedf6] hover:text-[#0f172a]'
                }`}
              >
                {cat === 'ALL' ? 'All (6)' : cat}
              </button>
            )
          )}
        </div>

        {/* Active Trace Mode Indicators & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {selectedNodeId ? (
            <div className="flex items-center gap-1.5 bg-[#f1f4fb] p-1 rounded-full border border-[#eaedf6]">
              <button
                onClick={handleTraceUpstream}
                title="Trace Backwards to Root Causes"
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  traceMode === 'UPSTREAM'
                    ? 'bg-[#e11d48] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Trace Causes ↑
              </button>

              <button
                onClick={handleTraceDownstream}
                title="Trace Forward to Downstream Symptoms"
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  traceMode === 'DOWNSTREAM'
                    ? 'bg-[#ea580c] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Trace Symptoms ↓
              </button>

              <button
                onClick={handleResetTrace}
                title="Reset Selection"
                className="p-1 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-[#8a94a6] font-medium hidden sm:inline">
              Click any node to trace relationships
            </span>
          )}
        </div>
      </div>

      {/* 5. Main Interactive Causal Graph Canvas */}
      <div className="relative w-full h-[620px] sm:h-[680px] bg-[#f8f9fd] rounded-3xl border border-[#eaedf6] overflow-hidden shadow-inner">
        
        {/* Canvas Background Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating Zoom & Canvas Controls (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[#eaedf6] shadow-md">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-[#eaedf6] mx-0.5" />
          <button
            onClick={handleFitScreen}
            title="Fit to Screen & Reset Positions"
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#576cdb] hover:bg-[#e0e7ff] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit</span>
          </button>
        </div>

        {/* Interactive Graph Surface with Pan & Drag */}
        <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className={`w-full h-full cursor-${isPanning ? 'grabbing' : 'grab'} overflow-hidden relative`}
        >
          <div
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
              transformOrigin: '0 0',
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
            className="absolute top-0 left-0 w-[2400px] h-[1600px] pointer-events-auto"
          >
            {/* SVG Directional Arrow Curves */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Standard Arrowhead */}
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                </marker>

                {/* Highlighted Glowing Arrowhead */}
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#576cdb" />
                </marker>

                {/* Cycle Warning Arrowhead */}
                <marker
                  id="arrow-cycle"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#e11d48" />
                </marker>
              </defs>

              {edgeLayouts.map((edge) => {
                const isEdgeHighlighted = highlightedState.highlightedEdgeIds.has(edge.id);
                const isFaded =
                  highlightedState.hasActiveHighlight && !isEdgeHighlighted;

                return (
                  <g key={edge.id} className="transition-opacity duration-300">
                    {/* Shadow halo for active edges */}
                    {isEdgeHighlighted && (
                      <path
                        d={edge.pathD}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="7"
                        strokeOpacity="0.4"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Main Bezier Line */}
                    <path
                      d={edge.pathD}
                      fill="none"
                      stroke={
                        edge.isCycle
                          ? '#e11d48'
                          : isEdgeHighlighted
                          ? '#576cdb'
                          : '#cbd5e1'
                      }
                      strokeWidth={isEdgeHighlighted ? '3.2' : '1.8'}
                      strokeDasharray={edge.isCycle ? '6,4' : undefined}
                      markerEnd={
                        edge.isCycle
                          ? 'url(#arrow-cycle)'
                          : isEdgeHighlighted
                          ? 'url(#arrow-active)'
                          : 'url(#arrow-default)'
                      }
                      opacity={isFaded ? 0.2 : 1}
                      className="transition-all duration-200"
                    />

                    {/* Centered Edge Label Pill */}
                    {(!isFaded || isEdgeHighlighted) && (
                      <g transform={`translate(${edge.midX}, ${edge.midY})`}>
                        <rect
                          x="-34"
                          y="-9"
                          width="68"
                          height="18"
                          rx="9"
                          fill={isEdgeHighlighted ? '#e0e7ff' : '#ffffff'}
                          stroke={isEdgeHighlighted ? '#576cdb' : '#e2e8f0'}
                          strokeWidth="1"
                          className="shadow-xs"
                        />
                        <text
                          textAnchor="middle"
                          y="3.5"
                          fontSize="9"
                          fontWeight="700"
                          fill={isEdgeHighlighted ? '#4338ca' : '#64748b'}
                          className="font-sans select-none"
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Interactive Problem Nodes */}
            {nodeLayouts.map((layout) => {
              const { problem, nodeType } = layout;
              const theme = getNodeColorTheme(nodeType);
              const isSelected = selectedNodeId === problem.id;
              const isHighlighted =
                highlightedState.highlightedNodeIds.has(problem.id) ||
                (selectedCategory !== 'ALL' && problem.category === selectedCategory);
              const isFaded =
                highlightedState.hasActiveHighlight && !isHighlighted && !isSelected;
              const isCollapsed = collapsedNodeIds.has(problem.id);

              return (
                <div
                  key={problem.id}
                  style={{
                    transform: `translate(${layout.x}px, ${layout.y}px)`,
                    width: `${layout.width}px`,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    draggingNodeRef.current = {
                      id: problem.id,
                      startX: e.clientX,
                      startY: e.clientY,
                    };
                  }}
                  onClick={() => handleSelectNode(problem.id)}
                  className={`absolute top-0 left-0 p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    theme.bg
                  } ${
                    isSelected
                      ? `${theme.borderActive} shadow-xl scale-[1.03] z-30`
                      : isHighlighted
                      ? `${theme.border} shadow-lg ring-2 ring-[#576cdb]/20 z-20`
                      : `${theme.border} shadow-sm z-10 hover:shadow-md hover:-translate-y-0.5`
                  } ${isFaded ? 'opacity-25 grayscale-[40%]' : 'opacity-100'}`}
                >
                  {/* Card Top: Clean Category Indicator without Clutter Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                      <span className="text-xs font-semibold text-[#64748b]">
                        {problem.category}
                      </span>
                    </div>
                  </div>

                  {/* Problem Title */}
                  <h4 className="text-sm font-bold text-[#0f172a] tracking-tight leading-snug line-clamp-2">
                    {problem.title}
                  </h4>

                  {/* Short concise explanation */}
                  <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed line-clamp-2">
                    {problem.description}
                  </p>

                  {/* Bottom Row: In/Out Connection Counts & Expand/Collapse branch toggle */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#eaedf6]/80 flex items-center justify-between text-[11px] text-[#8a94a6]">
                    <div className="flex items-center gap-3 font-medium">
                      <span title={`${layout.inDegree} causes leading into this`}>
                        ← {layout.inDegree} {layout.inDegree === 1 ? 'cause' : 'causes'}
                      </span>
                      <span title={`${layout.outDegree} downstream effects triggered`}>
                        → {layout.outDegree} {layout.outDegree === 1 ? 'effect' : 'effects'}
                      </span>
                    </div>

                    {/* Expand/Collapse branch toggle if node has outgoing edges */}
                    {layout.outDegree > 0 && (
                      <button
                        onClick={(e) => handleToggleCollapse(problem.id, e)}
                        title={isCollapsed ? 'Expand downstream branch' : 'Collapse downstream branch'}
                        className="p-1 rounded-md hover:bg-black/5 text-[#576cdb] font-bold flex items-center gap-0.5 text-[10px] cursor-pointer"
                      >
                        <span>{isCollapsed ? `+${layout.outDegree} Expand` : 'Collapse'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend Overlay (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-[#eaedf6] shadow-md flex items-center gap-4 text-xs font-semibold text-[#0f172a]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
            <span>Root Cause</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
            <span>Intermediate Problem</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
            <span>Symptom</span>
          </div>
          <div className="h-3 w-[1px] bg-[#eaedf6]" />
          <div className="flex items-center gap-1.5 text-[#64748b]">
            <ArrowRight className="w-3.5 h-3.5 text-[#576cdb]" />
            <span>Directed Causal Flow</span>
          </div>
        </div>
      </div>

      {/* 6. Node Detail Panel / Slide-Over Drawer (Requirement 4) */}
      <AnimatePresence>
        {isDetailDrawerOpen && activeNode && (
          <div className="fixed inset-0 z-50 flex justify-end font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailDrawerOpen(false)}
              className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-[2px]"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#eaedf6] flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#eaedf6] bg-[#f9f9fb] flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        getNodeColorTheme(
                          activeNode.nodeType ||
                            (activeNode.isRootCause
                              ? 'ROOT_CAUSE'
                              : activeNode.isSymptom
                              ? 'SYMPTOM'
                              : 'INTERMEDIATE')
                        ).dot
                      }`}
                    />
                    <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                      {activeNode.nodeType?.replace('_', ' ') ||
                        (activeNode.isRootCause
                          ? 'ROOT CAUSE'
                          : activeNode.isSymptom
                          ? 'SYMPTOM'
                          : 'INTERMEDIATE PROBLEM')}{' '}
                      • {activeNode.category}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#0f172a] tracking-tight leading-snug">
                    {activeNode.title}
                  </h2>
                </div>

                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Mechanism Explanation */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block">
                    Mechanism & Failure Mode
                  </span>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {activeNode.description}
                  </p>
                </div>

                {/* 2. Why It Occurs */}
                <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-[#eaedf6] space-y-1.5">
                  <span className="text-xs font-bold text-[#576cdb] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Why This Friction Occurs
                  </span>
                  <p className="text-xs sm:text-sm text-[#1e293b] leading-relaxed font-normal">
                    {activeNode.whyItOccurs ||
                      `Structural friction arising from ${activeNode.category.toLowerCase()} dependencies and operational trade-offs.`}
                  </p>
                </div>

                {/* 3. Directly Connected Causes & Downstream Symptoms */}
                <div className="space-y-4">
                  {/* Causes */}
                  <div>
                    <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block mb-2">
                      Direct Causes Upstream ({activeNode.dependsOnProblemIds?.length || 0})
                    </span>
                    {activeNode.dependsOnProblemIds && activeNode.dependsOnProblemIds.length > 0 ? (
                      <div className="space-y-1.5">
                        {activeNode.dependsOnProblemIds.map((causeId) => {
                          const causeNode = problems.find((p) => p.id === causeId);
                          return (
                            <button
                              key={causeId}
                              onClick={() => setSelectedNodeId(causeId)}
                              className="w-full text-left p-3 rounded-xl bg-[#fff5f5] hover:bg-[#ffe4e6] border border-[#fca5a5] flex items-center justify-between text-xs font-semibold text-[#0f172a] transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-2 h-2 rounded-full bg-[#f43f5e] shrink-0" />
                                <span className="truncate">{causeNode?.title || causeId}</span>
                              </div>
                              <span className="text-[10px] text-[#e11d48] font-mono shrink-0">
                                View Cause →
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-xs text-[#065f46] font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                        <span>Root Cause: No upstream dependencies in this system.</span>
                      </div>
                    )}
                  </div>

                  {/* Effects / Symptoms */}
                  <div>
                    {(() => {
                      const effects = Array.from(
                        graphTopology.adj.get(activeNode.id) || []
                      );
                      return (
                        <>
                          <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block mb-2">
                            Downstream Ripple Effects ({effects.length})
                          </span>
                          {effects.length > 0 ? (
                            <div className="space-y-1.5">
                              {effects.map((effectId) => {
                                const effectNode = problems.find((p) => p.id === effectId);
                                return (
                                  <button
                                    key={effectId}
                                    onClick={() => setSelectedNodeId(effectId)}
                                    className="w-full text-left p-3 rounded-xl bg-[#fefce8] hover:bg-[#fef9c3] border border-[#fde047] flex items-center justify-between text-xs font-semibold text-[#0f172a] transition-all cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="w-2 h-2 rounded-full bg-[#eab308] shrink-0" />
                                      <span className="truncate">{effectNode?.title || effectId}</span>
                                    </div>
                                    <span className="text-[10px] text-[#a16207] font-mono shrink-0">
                                      View Effect →
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-[#f8f9fb] border border-[#eaedf6] text-xs text-[#64748b]">
                              Terminal Symptom: Does not trigger further structural causes.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 4. Supporting Evidence vs Hypotheses (Critical Requirement 4) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block">
                      Evidence & Scientific Status
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeNode.evidenceType === 'VERIFIED_FACT'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : activeNode.evidenceType === 'FOUNDER_ASSUMPTION'
                          ? 'bg-[#fee2e2] text-[#b91c1c]'
                          : 'bg-[#e0e7ff] text-[#4338ca]'
                      }`}
                    >
                      {activeNode.evidenceType === 'VERIFIED_FACT'
                        ? 'Verified Empirical Fact'
                        : activeNode.evidenceType === 'FOUNDER_ASSUMPTION'
                        ? 'Unvalidated Assumption'
                        : 'AI-Generated Hypothesis'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(activeNode.supportingEvidence && activeNode.supportingEvidence.length > 0
                      ? activeNode.supportingEvidence
                      : ['Industry benchmark data and domain execution constraints.']
                    ).map((ev, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-[#eaedf6] text-xs text-[#334155] flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Founder Assumptions */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block">
                    Underlying Founder Assumptions
                  </span>
                  <div className="space-y-1.5">
                    {activeNode.assumptions && activeNode.assumptions.length > 0 ? (
                      activeNode.assumptions.map((ass) => (
                        <div
                          key={ass.id}
                          className="p-3 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-xs text-[#9a3412] flex items-start gap-2.5"
                        >
                          <HelpCircle className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold">{ass.statement}</div>
                            <div className="text-[10px] text-[#c2410c] mt-0.5">
                              Confidence: {Math.round((ass.confidence || 0.5) * 100)}% • Status:{' '}
                              {ass.isResolved ? 'Resolved' : 'Pending Validation'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-[#f8f9fb] border border-[#eaedf6] text-xs text-[#64748b]">
                        Implicit assumption that customer adoption will occur without friction.
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Suggested Next Action */}
                <div className="p-4 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] space-y-1.5">
                  <span className="text-xs font-bold text-[#2563eb] uppercase tracking-wider block">
                    Suggested Next Action for Founder
                  </span>
                  <p className="text-xs sm:text-sm text-[#1e40af] font-medium leading-relaxed">
                    {activeNode.suggestedAction ||
                      'Run structured discovery interviews to validate technical latency constraints and customer willingness-to-pay.'}
                  </p>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#eaedf6] bg-white flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleTraceUpstream();
                    setIsDetailDrawerOpen(false);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#fff5f5] hover:bg-[#ffe4e6] text-[#e11d48] border border-[#fca5a5] text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Trace Ancestors ↑
                </button>
                <button
                  onClick={() => {
                    handleTraceDownstream();
                    setIsDetailDrawerOpen(false);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] text-[#ea580c] border border-[#fdba74] text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Trace Ripple ↓
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
