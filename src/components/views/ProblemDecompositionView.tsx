/**
 * GILLET CHECK - Problem Decomposition & Causal Graph System
 *
 * Simplified for New Founders while keeping Full Power for Advanced Users:
 * 1. Default "Simplified Causal Flow" view:
 *    - 3 clear progressive columns: Root Causes (Red) -> Bottlenecks (Orange) -> Symptoms (Yellow)
 *    - Interactive breadcrumb chain tracker showing exactly how problems link together
 *    - Plain-language founder tips on why fixing root causes cures symptoms
 * 2. "Interactive 2D Graph" canvas:
 *    - Spatial 2D pan/zoom canvas with bezier directional arrows and custom draggable nodes
 * 3. Deep Slide-Over Inspection Drawer:
 *    - Verified facts vs AI hypotheses vs founder assumptions
 *    - Clear actionable next steps for founders
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
  GitFork,
  ArrowLeft,
  Info,
  Compass,
  BookOpen,
  Filter,
} from 'lucide-react';
import { ProblemNode, StartupIdea, ProblemNodeType } from '../../types/index.ts';

interface ProblemDecompositionViewProps {
  idea: StartupIdea;
  onDecompose: () => void;
  isLoading: boolean;
  onOpenAppGuide?: () => void;
}

interface NodeLayout {
  id: string;
  problem: ProblemNode;
  tier: number;
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
  onOpenAppGuide,
}) => {
  const problems = useMemo(() => idea.problems || [], [idea.problems]);

  // View Mode: 'CHAIN' (simplified columns) vs 'GRAPH' (2D canvas)
  const [viewMode, setViewMode] = useState<'CHAIN' | 'GRAPH'>('CHAIN');

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [traceMode, setTraceMode] = useState<'NONE' | 'UPSTREAM' | 'DOWNSTREAM'>('NONE');
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // Pan & Zoom state for Graph view
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
    const visited = new Map<string, number>();
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

    // Topological depth calculation
    const depths = new Map<string, number>();
    const getDepth = (id: string, path: Set<string>): number => {
      if (depths.has(id)) return depths.get(id)!;
      if (path.has(id)) return 0;
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

    // Categorize nodes into tiers
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

    // Ancestor and descendant reachability
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

  // 2. Spatial Layout for 2D Graph
  const { nodeLayouts, edgeLayouts } = useMemo(() => {
    if (problems.length === 0) {
      return { nodeLayouts: [], edgeLayouts: [] };
    }

    const { adj, revAdj, probMap, depths, nodeTypes, cycleEdges } = graphTopology;

    const rootNodes: ProblemNode[] = [];
    const intermediateNodes: ProblemNode[] = [];
    const symptomNodes: ProblemNode[] = [];

    for (const p of problems) {
      const type = nodeTypes.get(p.id) || (p.isRootCause ? 'ROOT_CAUSE' : p.isSymptom ? 'SYMPTOM' : 'INTERMEDIATE');
      if (type === 'ROOT_CAUSE') rootNodes.push(p);
      else if (type === 'SYMPTOM') symptomNodes.push(p);
      else intermediateNodes.push(p);
    }

    const intermediateTiersMap = new Map<number, ProblemNode[]>();
    for (const p of intermediateNodes) {
      const d = Math.max(1, depths.get(p.id) || 1);
      if (!intermediateTiersMap.has(d)) {
        intermediateTiersMap.set(d, []);
      }
      intermediateTiersMap.get(d)!.push(p);
    }

    const sortedDepths = Array.from(intermediateTiersMap.keys()).sort((a, b) => a - b);
    const columns: ProblemNode[][] = [];
    columns.push(rootNodes);
    for (const d of sortedDepths) {
      columns.push(intermediateTiersMap.get(d)!);
    }
    columns.push(symptomNodes);

    const cardWidth = 300;
    const cardHeight = 140;
    const columnGap = 150;
    const rowGap = 32;
    const startX = 60;
    const startY = 70;

    const layouts: NodeLayout[] = [];
    const posMap = new Map<string, { x: number; y: number }>();

    columns.forEach((col, colIdx) => {
      const colX = startX + colIdx * (cardWidth + columnGap);
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

    const edges: EdgeLayout[] = [];
    for (const [causeId, effectSet] of adj) {
      const causePos = posMap.get(causeId);
      if (!causePos) continue;

      for (const effectId of effectSet) {
        const effectPos = posMap.get(effectId);
        if (!effectPos) continue;
        if (collapsedNodeIds.has(causeId)) continue;

        const x1 = causePos.x + cardWidth;
        const y1 = causePos.y + cardHeight / 2;
        const x2 = effectPos.x;
        const y2 = effectPos.y + cardHeight / 2;

        const dx = Math.max(40, (x2 - x1) * 0.45);
        const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const isCycle = cycleEdges.has(`${causeId}->${effectId}`);
        edges.push({
          id: `${causeId}->${effectId}`,
          fromId: causeId,
          toId: effectId,
          label: 'Causes',
          pathD,
          midX,
          midY,
          isCycle,
        });
      }
    }

    return { nodeLayouts: layouts, edgeLayouts: edges };
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
        const directParents = graphTopology.revAdj.get(selectedNodeId) || new Set();
        const directChildren = graphTopology.adj.get(selectedNodeId) || new Set();
        directParents.forEach((id) => highlightedNodeIds.add(id));
        directChildren.forEach((id) => highlightedNodeIds.add(id));
      }

      for (const edge of edgeLayouts) {
        if (highlightedNodeIds.has(edge.fromId) && highlightedNodeIds.has(edge.toId)) {
          highlightedEdgeIds.add(edge.id);
        }
      }
    }

    const hasActiveHighlight =
      selectedNodeId !== null || searchQuery.trim() !== '' || selectedCategory !== 'ALL';

    return { hasActiveHighlight, highlightedNodeIds, highlightedEdgeIds };
  }, [
    selectedNodeId,
    searchQuery,
    selectedCategory,
    traceMode,
    graphTopology,
    problems,
    edgeLayouts,
  ]);

  // Active selected problem
  const activeNode = useMemo(() => {
    return problems.find((p) => p.id === selectedNodeId) || null;
  }, [problems, selectedNodeId]);

  // Connected causes and symptoms of the currently selected problem
  const selectedNodeConnectedCauses = useMemo(() => {
    if (!selectedNodeId) return [];
    const causeIds = graphTopology.ancestorsMap.get(selectedNodeId) || new Set();
    return problems.filter((p) => causeIds.has(p.id));
  }, [selectedNodeId, graphTopology.ancestorsMap, problems]);

  const selectedNodeConnectedEffects = useMemo(() => {
    if (!selectedNodeId) return [];
    const effectIds = graphTopology.descendantsMap.get(selectedNodeId) || new Set();
    return problems.filter((p) => effectIds.has(p.id));
  }, [selectedNodeId, graphTopology.descendantsMap, problems]);

  // Color helper functions
  const getNodeColorTheme = (type: ProblemNodeType) => {
    switch (type) {
      case 'ROOT_CAUSE':
        return {
          bg: 'bg-gradient-to-b from-[#fff5f5] via-[#fffbfb] to-white',
          border: 'border-[#fca5a5]',
          borderActive: 'border-[#e11d48] ring-3 ring-[#ffe4e6]',
          badgeBg: 'bg-[#ffe4e6]',
          badgeText: 'text-[#e11d48]',
          badgeLabel: 'Root Cause',
          dot: 'bg-[#f43f5e]',
          glow: 'shadow-[0_4px_20px_rgba(225,29,72,0.12)]',
          iconColor: 'text-[#e11d48]',
        };
      case 'INTERMEDIATE':
        return {
          bg: 'bg-gradient-to-b from-[#fff7ed] via-[#fffdfa] to-white',
          border: 'border-[#fdba74]',
          borderActive: 'border-[#ea580c] ring-3 ring-[#ffedd5]',
          badgeBg: 'bg-[#ffedd5]',
          badgeText: 'text-[#ea580c]',
          badgeLabel: 'Bottleneck',
          dot: 'bg-[#f97316]',
          glow: 'shadow-[0_4px_20px_rgba(234,88,12,0.12)]',
          iconColor: 'text-[#ea580c]',
        };
      case 'SYMPTOM':
      default:
        return {
          bg: 'bg-gradient-to-b from-[#fefce8] via-[#fffffa] to-white',
          border: 'border-[#fde047]',
          borderActive: 'border-[#ca8a04] ring-3 ring-[#fef9c3]',
          badgeBg: 'bg-[#fef9c3]',
          badgeText: 'text-[#a16207]',
          badgeLabel: 'Symptom',
          dot: 'bg-[#eab308]',
          glow: 'shadow-[0_4px_20px_rgba(202,138,4,0.12)]',
          iconColor: 'text-[#a16207]',
        };
    }
  };

  // 4. Pan & Drag Event Handlers for 2D Graph
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
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(nodeId);
      setTraceMode('NONE');
    }
  };

  const handleOpenDetail = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNodeId(nodeId);
    setIsDetailDrawerOpen(true);
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

  // Stats calculation
  const rootCausesList = problems.filter(
    (p) => (graphTopology.nodeTypes.get(p.id) || (p.isRootCause ? 'ROOT_CAUSE' : 'INTERMEDIATE')) === 'ROOT_CAUSE'
  );
  const intermediateList = problems.filter(
    (p) => graphTopology.nodeTypes.get(p.id) === 'INTERMEDIATE'
  );
  const symptomsList = problems.filter(
    (p) => graphTopology.nodeTypes.get(p.id) === 'SYMPTOM'
  );

  // Key bottleneck (Root cause with highest downstream impact)
  const keyBottleneck = useMemo(() => {
    let maxDescendants = -1;
    let bottleneckNode: ProblemNode | null = null;
    for (const p of rootCausesList) {
      const count = graphTopology.descendantsMap.get(p.id)?.size || 0;
      if (count > maxDescendants) {
        maxDescendants = count;
        bottleneckNode = p;
      }
    }
    return { node: bottleneckNode, count: maxDescendants };
  }, [rootCausesList, graphTopology.descendantsMap]);

  // Filtered lists for the 3 columns in Simplified Chain view
  const filterProblem = (p: ProblemNode) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  };

  const filteredRoots = rootCausesList.filter(filterProblem);
  const filteredIntermediates = intermediateList.filter(filterProblem);
  const filteredSymptoms = symptomsList.filter(filterProblem);

  return (
    <div className="w-full space-y-6 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#eaedf6] pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172a] tracking-tight">
            Problem Decomposition & Causal Flow
          </h1>
          <p className="text-sm sm:text-base text-[#64748b] mt-1.5 leading-relaxed">
            Understand how foundational root causes trigger intermediate bottlenecks and surface symptoms.
          </p>
        </div>

        {/* Action Controls & Tour Guide Trigger */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onOpenAppGuide && (
            <button
              onClick={onOpenAppGuide}
              className="px-4 py-2.5 rounded-full bg-[#e0e7ff] hover:bg-[#d0dbfc] text-[#576cdb] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open App Guide"
            >
              <Compass className="w-4 h-4" />
              <span>How This Page Works</span>
            </button>
          )}

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
                <span>Re-Analyze Causal Flow</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Red: Root Causes */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#fff5f5] to-white border border-[#fed7d7] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e11d48] block">
              ROOT CAUSES
            </span>
            <div className="text-3xl font-extrabold text-[#0f172a] mt-0.5">
              {rootCausesList.length}
            </div>
            <span className="text-xs text-[#9f1239] mt-0.5 block">
              Fix these first
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Orange: Intermediate Bottlenecks */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#fff7ed] to-white border border-[#fed7aa] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c] block">
              BOTTLENECKS
            </span>
            <div className="text-3xl font-extrabold text-[#0f172a] mt-0.5">
              {intermediateList.length}
            </div>
            <span className="text-xs text-[#9a3412] mt-0.5 block">
              Friction hurdles
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
              {symptomsList.length}
            </div>
            <span className="text-xs text-[#854d0e] mt-0.5 block">
              Visible pain points
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
              CAUSAL LINKS
            </span>
            <div className="text-3xl font-extrabold text-[#0f172a] mt-0.5">
              {edgeLayouts.length}
            </div>
            <span className="text-xs text-[#64748b] mt-0.5 block">
              Cause-to-effect paths
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#e0e7ff] text-[#576cdb] flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Primary Critical Causal Chain Banner */}
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

        {graphTopology.hasCycle && (
          <div className="px-4 py-2.5 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-center gap-2 text-xs font-semibold text-[#e11d48] shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#e11d48]" />
            <span>Cycle Warning: Circular causal loops detected.</span>
          </div>
        )}
      </div>

      {/* 4. View Mode Switcher & Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#eaedf6] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedf6] pb-3">
          
          {/* View Mode Toggle: Simplified Flow vs Full Graph */}
          <div className="flex items-center bg-[#f1f4fb] p-1 rounded-2xl border border-[#eaedf6]">
            <button
              onClick={() => setViewMode('CHAIN')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'CHAIN'
                  ? 'bg-white text-[#576cdb] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Simplified Flow (Easy & Clear)</span>
            </button>

            <button
              onClick={() => setViewMode('GRAPH')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'GRAPH'
                  ? 'bg-white text-[#576cdb] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Interactive 2D Graph (Advanced)</span>
            </button>
          </div>

          <div className="text-xs text-[#64748b] font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-[#576cdb]" />
            <span>Click any problem card to trace connected causes and symptoms.</span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a94a6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem, category, or keyword..."
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
        </div>
      </div>

      {/* 5A. VIEW MODE 1: SIMPLIFIED CAUSAL FLOW (BEGINNER-FRIENDLY DEFAULT) */}
      {viewMode === 'CHAIN' && (
        <div className="space-y-6">
          {/* Interactive Causal Chain Breadcrumb Bar */}
          {activeNode ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#f8f9ff] via-white to-[#f8f9ff] border border-[#d6dbf5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#576cdb] animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#576cdb] uppercase tracking-wider">
                      Selected Causal Path
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#e0e7ff] text-[#4338ca]">
                      {activeNode.category}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-[#0f172a] mt-0.5">
                    {activeNode.title}
                  </h4>
                  <div className="text-xs text-[#64748b] mt-0.5">
                    Triggered by {selectedNodeConnectedCauses.length} upstream cause(s) • Directly creates {selectedNodeConnectedEffects.length} downstream ripple effect(s).
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenDetail(activeNode.id)}
                  className="px-4 py-2 rounded-full bg-[#576cdb] hover:bg-[#475cc7] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Inspect Full Details</span>
                </button>

                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-2 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f4fb] transition-colors cursor-pointer"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Educational Founder Advice Box */
            <div className="p-4 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center gap-3.5 text-xs text-[#1e40af]">
              <Sparkles className="w-5 h-5 text-[#2563eb] shrink-0" />
              <div>
                <span className="font-bold">Founder Rule: </span>
                <span>
                  Start by reading the <strong>Root Causes (Column 1)</strong>. Fixing a symptom (like running ads to fix high customer churn) wastes capital; solving the root cause eliminates all downstream bottlenecks and symptoms automatically.
                </span>
              </div>
            </div>
          )}

          {/* 3 Progressive Columns Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Root Causes (Origin Problems) */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#fff5f5] border border-[#fca5a5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f43f5e]" />
                  <span className="text-xs font-bold text-[#e11d48] uppercase tracking-wider">
                    1. Root Causes ({filteredRoots.length})
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#9f1239]">
                  Origin Issues
                </span>
              </div>

              <div className="space-y-3">
                {filteredRoots.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white border border-[#eaedf6] text-center text-xs text-[#64748b]">
                    No root causes match search or filter.
                  </div>
                ) : (
                  filteredRoots.map((p) => {
                    const isSelected = selectedNodeId === p.id;
                    const isPartOfChain =
                      highlightedState.hasActiveHighlight &&
                      highlightedState.highlightedNodeIds.has(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectNode(p.id)}
                        className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer space-y-3 ${
                          isSelected
                            ? 'border-[#e11d48] shadow-lg ring-3 ring-[#ffe4e6] bg-[#fffbfb]'
                            : isPartOfChain
                            ? 'border-[#fca5a5] shadow-md bg-[#fffdfd]'
                            : 'border-[#eaedf6] hover:border-[#fca5a5] hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                            <span className="text-xs font-semibold text-[#64748b]">
                              {p.category}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#e11d48]">
                            Root Origin
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#0f172a] leading-snug">
                          {p.title}
                        </h4>

                        <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
                          {p.description}
                        </p>

                        <div className="pt-2 border-t border-[#eaedf6] flex items-center justify-between text-xs">
                          <span className="text-[#8a94a6] text-[11px]">
                            Triggers {graphTopology.descendantsMap.get(p.id)?.size || 0} downstream problem(s)
                          </span>
                          <button
                            onClick={(e) => handleOpenDetail(p.id, e)}
                            className="text-[#576cdb] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Intermediate Bottlenecks (Friction Hurdles) */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#fff7ed] border border-[#fdba74] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f97316]" />
                  <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                    2. Bottlenecks ({filteredIntermediates.length})
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#9a3412]">
                  Cascading Hurdles
                </span>
              </div>

              <div className="space-y-3">
                {filteredIntermediates.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white border border-[#eaedf6] text-center text-xs text-[#64748b]">
                    No intermediate bottlenecks match search or filter.
                  </div>
                ) : (
                  filteredIntermediates.map((p) => {
                    const isSelected = selectedNodeId === p.id;
                    const isPartOfChain =
                      highlightedState.hasActiveHighlight &&
                      highlightedState.highlightedNodeIds.has(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectNode(p.id)}
                        className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer space-y-3 ${
                          isSelected
                            ? 'border-[#ea580c] shadow-lg ring-3 ring-[#ffedd5] bg-[#fffdfa]'
                            : isPartOfChain
                            ? 'border-[#fdba74] shadow-md bg-[#fffffd]'
                            : 'border-[#eaedf6] hover:border-[#fdba74] hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                            <span className="text-xs font-semibold text-[#64748b]">
                              {p.category}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#ea580c]">
                            Bottleneck
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#0f172a] leading-snug">
                          {p.title}
                        </h4>

                        <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
                          {p.description}
                        </p>

                        <div className="pt-2 border-t border-[#eaedf6] flex items-center justify-between text-xs">
                          <span className="text-[#8a94a6] text-[11px]">
                            ← {p.dependsOnProblemIds?.length || 1} cause | → {graphTopology.adj.get(p.id)?.size || 1} effect
                          </span>
                          <button
                            onClick={(e) => handleOpenDetail(p.id, e)}
                            className="text-[#576cdb] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 3: Observable Symptoms (Visible Surface Pain) */}
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#fefce8] border border-[#fde047] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                  <span className="text-xs font-bold text-[#a16207] uppercase tracking-wider">
                    3. Symptoms ({filteredSymptoms.length})
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#854d0e]">
                  Observable Pain
                </span>
              </div>

              <div className="space-y-3">
                {filteredSymptoms.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white border border-[#eaedf6] text-center text-xs text-[#64748b]">
                    No observable symptoms match search or filter.
                  </div>
                ) : (
                  filteredSymptoms.map((p) => {
                    const isSelected = selectedNodeId === p.id;
                    const isPartOfChain =
                      highlightedState.hasActiveHighlight &&
                      highlightedState.highlightedNodeIds.has(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectNode(p.id)}
                        className={`p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer space-y-3 ${
                          isSelected
                            ? 'border-[#ca8a04] shadow-lg ring-3 ring-[#fef9c3] bg-[#fffff8]'
                            : isPartOfChain
                            ? 'border-[#fde047] shadow-md bg-[#fffffa]'
                            : 'border-[#eaedf6] hover:border-[#fde047] hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                            <span className="text-xs font-semibold text-[#64748b]">
                              {p.category}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#a16207]">
                            Surface Symptom
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#0f172a] leading-snug">
                          {p.title}
                        </h4>

                        <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
                          {p.description}
                        </p>

                        <div className="pt-2 border-t border-[#eaedf6] flex items-center justify-between text-xs">
                          <span className="text-[#8a94a6] text-[11px]">
                            Stemming from {p.dependsOnProblemIds?.length || 1} upstream cause(s)
                          </span>
                          <button
                            onClick={(e) => handleOpenDetail(p.id, e)}
                            className="text-[#576cdb] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5B. VIEW MODE 2: INTERACTIVE 2D GRAPH CANVAS (ADVANCED SPATIAL VIEW) */}
      {viewMode === 'GRAPH' && (
        <div className="relative w-full h-[620px] sm:h-[680px] bg-[#f8f9fd] rounded-3xl border border-[#eaedf6] overflow-hidden shadow-inner">
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Floating Zoom & Controls */}
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

          {/* Interactive Graph Surface */}
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
              {/* SVG Directional Curves */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <defs>
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
                </defs>

                {edgeLayouts.map((edge) => {
                  const isEdgeHighlighted = highlightedState.highlightedEdgeIds.has(edge.id);
                  const isFaded = highlightedState.hasActiveHighlight && !isEdgeHighlighted;

                  return (
                    <g key={edge.id} className="transition-opacity duration-300">
                      <path
                        d={edge.pathD}
                        fill="none"
                        stroke={isEdgeHighlighted ? '#576cdb' : '#cbd5e1'}
                        strokeWidth={isEdgeHighlighted ? '3.2' : '1.8'}
                        markerEnd={isEdgeHighlighted ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                        opacity={isFaded ? 0.2 : 1}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Problem Nodes */}
              {nodeLayouts.map((layout) => {
                const { problem, nodeType } = layout;
                const theme = getNodeColorTheme(nodeType);
                const isSelected = selectedNodeId === problem.id;
                const isHighlighted =
                  highlightedState.highlightedNodeIds.has(problem.id) ||
                  (selectedCategory !== 'ALL' && problem.category === selectedCategory);
                const isFaded = highlightedState.hasActiveHighlight && !isHighlighted && !isSelected;

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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                        <span className="text-xs font-semibold text-[#64748b]">
                          {problem.category}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[#0f172a] tracking-tight leading-snug line-clamp-2">
                      {problem.title}
                    </h4>

                    <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed line-clamp-2">
                      {problem.description}
                    </p>

                    <div className="mt-3.5 pt-2.5 border-t border-[#eaedf6]/80 flex items-center justify-between text-[11px] text-[#8a94a6]">
                      <span>
                        ← {layout.inDegree} causes | → {layout.outDegree} effects
                      </span>
                      <button
                        onClick={(e) => handleOpenDetail(problem.id, e)}
                        className="text-[#576cdb] hover:underline font-bold text-[10px] cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-[#eaedf6] shadow-md flex items-center gap-4 text-xs font-semibold text-[#0f172a]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
              <span>Root Cause</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
              <span>Bottleneck</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
              <span>Symptom</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Slide-Over Node Detail Panel */}
      <AnimatePresence>
        {isDetailDrawerOpen && activeNode && (
          <div className="fixed inset-0 z-50 flex justify-end font-['Plus_Jakarta_Sans',sans-serif]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailDrawerOpen(false)}
              className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-[2px]"
            />

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

                {/* 3. Directly Connected Causes & Symptoms */}
                <div className="space-y-4">
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

                  <div>
                    {(() => {
                      const effects = Array.from(graphTopology.adj.get(activeNode.id) || []);
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

                {/* 4. Supporting Evidence vs Assumptions */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#8a94a6] uppercase tracking-wider block">
                    Evidence & Status
                  </span>
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

                {/* 5. Suggested Next Action */}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
