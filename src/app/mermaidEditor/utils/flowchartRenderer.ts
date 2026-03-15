/**
 * Custom SVG Flowchart Renderer
 *
 * Takes a parsed FlowGraph and a FlowchartTheme, uses dagre for automatic
 * layout, and produces a complete SVG string with native gradient fills,
 * drop shadows, arrow markers, edge labels, and an optional legend.
 */

import dagre from '@dagrejs/dagre';
import type { FlowGraph, FlowNode, FlowEdge, FlowSubgraph } from './flowchartParser';
import type { FlowchartTheme, NodeShape } from './flowchartThemes';

// ── Layout types ──

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  node: FlowNode;
}

interface LayoutEdge {
  from: string;
  to: string;
  points: Array<{ x: number; y: number }>;
  edge: FlowEdge;
}

interface LayoutSubgraph {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  subgraphs: LayoutSubgraph[];
  width: number;
  height: number;
}

// ── Constants ──

const FONT_SIZE = 12;
const FONT_FAMILY = 'Inter, system-ui, -apple-system, sans-serif';
const CHAR_WIDTH = 7; // approximate width per char at font-size 12
const NODE_PADDING_X = 20;
const NODE_PADDING_Y = 14;
const MIN_NODE_WIDTH = 80;
const MIN_NODE_HEIGHT = 36;
const DIAMOND_SCALE = 1.4;
const EDGE_LABEL_FONT_SIZE = 10;
const EDGE_LABEL_PADDING = 4;
const LEGEND_HEIGHT = 32;
const LEGEND_ITEM_GAP = 14;
const SUBGRAPH_PADDING = 20;

// ── Helpers ──

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function measureTextWidth(text: string): number {
  return text.length * CHAR_WIDTH;
}

function calculateNodeSize(node: FlowNode): { width: number; height: number } {
  const textWidth = measureTextWidth(node.label);
  let width = Math.max(textWidth + NODE_PADDING_X * 2, MIN_NODE_WIDTH);
  let height = MIN_NODE_HEIGHT;

  switch (node.shape) {
    case 'diamond':
      // Diamond inscribes the text — needs ~1.45x to fit
      width = Math.max(width * DIAMOND_SCALE, MIN_NODE_WIDTH * 1.3);
      height = Math.max(height * DIAMOND_SCALE, MIN_NODE_HEIGHT * 1.3);
      break;
    case 'circle':
      // Circle: diameter must fit both width and height
      const diameter = Math.max(width, height) + 10;
      width = diameter;
      height = diameter;
      break;
    case 'stadium':
      // Pill shape: add extra horizontal padding for rounded ends
      width = Math.max(width + 20, MIN_NODE_WIDTH + 30);
      break;
    case 'hexagon':
      width = Math.max(width + 30, MIN_NODE_WIDTH + 20);
      break;
    case 'parallelogram':
      width = Math.max(width + 30, MIN_NODE_WIDTH + 20);
      break;
    case 'subroutine':
      width = Math.max(width + 20, MIN_NODE_WIDTH + 10);
      break;
  }

  return { width, height };
}

// ── Layout ──

function layoutGraph(graph: FlowGraph): LayoutResult {
  const g = new dagre.graphlib.Graph({ compound: true });
  const rankdir = graph.direction === 'TD' ? 'TB' : graph.direction;
  g.setGraph({
    rankdir,
    nodesep: 40,
    ranksep: 50,
    marginx: 30,
    marginy: 30,
    edgesep: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add subgraph cluster nodes
  for (const sg of graph.subgraphs) {
    g.setNode(sg.id, { label: sg.label, clusterLabelPos: 'top', style: 'subgraph' });
  }

  // Add nodes
  for (const node of graph.nodes) {
    const { width, height } = calculateNodeSize(node);
    g.setNode(node.id, { width, height, label: node.label });

    // Assign node to parent subgraph if applicable
    for (const sg of graph.subgraphs) {
      if (sg.nodeIds.includes(node.id)) {
        g.setParent(node.id, sg.id);
        break;
      }
    }
  }

  // Add edges
  for (const edge of graph.edges) {
    g.setEdge(edge.from, edge.to, {
      label: edge.label || '',
      minlen: 1,
      weight: 1,
    });
  }

  dagre.layout(g);

  // Extract layout results
  const layoutNodes: LayoutNode[] = [];
  const nodeMap = new Map<string, FlowNode>();
  for (const node of graph.nodes) {
    nodeMap.set(node.id, node);
  }

  for (const nodeId of g.nodes()) {
    const layoutData = g.node(nodeId);
    if (!layoutData) continue;
    const flowNode = nodeMap.get(nodeId);
    if (!flowNode) continue; // skip subgraph pseudo-nodes

    layoutNodes.push({
      id: nodeId,
      x: layoutData.x,
      y: layoutData.y,
      width: layoutData.width,
      height: layoutData.height,
      node: flowNode,
    });
  }

  const layoutEdges: LayoutEdge[] = [];
  for (const edgeObj of g.edges()) {
    const layoutData = g.edge(edgeObj);
    if (!layoutData || !layoutData.points) continue;
    const flowEdge = graph.edges.find(
      (e) => e.from === edgeObj.v && e.to === edgeObj.w
    );
    if (!flowEdge) continue;

    layoutEdges.push({
      from: edgeObj.v,
      to: edgeObj.w,
      points: layoutData.points,
      edge: flowEdge,
    });
  }

  // Subgraph bounds
  const layoutSubgraphs: LayoutSubgraph[] = [];
  for (const sg of graph.subgraphs) {
    const sgData = g.node(sg.id);
    if (sgData) {
      layoutSubgraphs.push({
        id: sg.id,
        label: sg.label,
        x: sgData.x - (sgData.width || 200) / 2,
        y: sgData.y - (sgData.height || 100) / 2,
        width: sgData.width || 200,
        height: sgData.height || 100,
      });
    }
  }

  // Calculate actual bounds from node and edge positions
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const ln of layoutNodes) {
    minX = Math.min(minX, ln.x - ln.width / 2);
    minY = Math.min(minY, ln.y - ln.height / 2);
    maxX = Math.max(maxX, ln.x + ln.width / 2);
    maxY = Math.max(maxY, ln.y + ln.height / 2);
  }

  for (const le of layoutEdges) {
    for (const pt of le.points) {
      minX = Math.min(minX, pt.x);
      minY = Math.min(minY, pt.y);
      maxX = Math.max(maxX, pt.x);
      maxY = Math.max(maxY, pt.y);
    }
  }

  for (const sg of layoutSubgraphs) {
    minX = Math.min(minX, sg.x);
    minY = Math.min(minY, sg.y);
    maxX = Math.max(maxX, sg.x + sg.width);
    maxY = Math.max(maxY, sg.y + sg.height);
  }

  // Add padding around the computed bounds
  const pad = 25;
  if (minX === Infinity) {
    // Fallback if no nodes
    const graphData = g.graph();
    return { nodes: layoutNodes, edges: layoutEdges, subgraphs: layoutSubgraphs, width: (graphData.width || 600) + 100, height: (graphData.height || 400) + 100 };
  }

  const width = maxX - minX + pad * 2;
  const height = maxY - minY + pad * 2;

  // Offset all positions so the graph starts at (pad, pad)
  const offsetX = -minX + pad;
  const offsetY = -minY + pad;

  for (const ln of layoutNodes) {
    ln.x += offsetX;
    ln.y += offsetY;
  }
  for (const le of layoutEdges) {
    for (const pt of le.points) {
      pt.x += offsetX;
      pt.y += offsetY;
    }
  }
  for (const sg of layoutSubgraphs) {
    sg.x += offsetX;
    sg.y += offsetY;
  }

  return { nodes: layoutNodes, edges: layoutEdges, subgraphs: layoutSubgraphs, width, height };
}

// ── SVG shape renderers ──

function renderNodeShape(
  node: LayoutNode,
  gradientId: string,
  theme: FlowchartTheme,
  strokeOverride?: string,
  strokeWidthOverride?: number
): string {
  const { x, y, width, height } = node;
  const left = x - width / 2;
  const top = y - height / 2;
  const shape = node.node.shape;
  const style = theme.nodeStyles[shape];
  const effectiveStroke = strokeOverride || style.strokeColor;
  const effectiveStrokeWidth = strokeWidthOverride || style.strokeWidth || 1;
  const strokeAttr = effectiveStroke ? ` stroke="${effectiveStroke}" stroke-width="${effectiveStrokeWidth}"` : '';

  switch (shape) {
    case 'stadium':
      return `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="${height / 2}" fill="url(#${gradientId})"${strokeAttr}/>`;

    case 'diamond': {
      const cx = x, cy = y;
      const hw = width / 2, hh = height / 2;
      return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="url(#${gradientId})"${strokeAttr}/>`;
    }

    case 'circle': {
      const rx = width / 2, ry = height / 2;
      return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${gradientId})"${strokeAttr}/>`;
    }

    case 'hexagon': {
      const hw = width / 2, hh = height / 2;
      const indent = width * 0.15;
      return `<polygon points="${left + indent},${top} ${left + width - indent},${top} ${left + width},${y} ${left + width - indent},${top + height} ${left + indent},${top + height} ${left},${y}" fill="url(#${gradientId})"${strokeAttr}/>`;
    }

    case 'parallelogram': {
      const skew = width * 0.12;
      return `<polygon points="${left + skew},${top} ${left + width},${top} ${left + width - skew},${top + height} ${left},${top + height}" fill="url(#${gradientId})"${strokeAttr}/>`;
    }

    case 'subroutine': {
      const inset = 8;
      return [
        `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="4" fill="url(#${gradientId})"${strokeAttr}/>`,
        `<line x1="${left + inset}" y1="${top}" x2="${left + inset}" y2="${top + height}" stroke="${style.textColor}" stroke-opacity="0.3" stroke-width="1"/>`,
        `<line x1="${left + width - inset}" y1="${top}" x2="${left + width - inset}" y2="${top + height}" stroke="${style.textColor}" stroke-opacity="0.3" stroke-width="1"/>`,
      ].join('\n');
    }

    case 'rounded':
      return `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="12" fill="url(#${gradientId})"${strokeAttr}/>`;

    case 'rect':
    default:
      return `<rect x="${left}" y="${top}" width="${width}" height="${height}" rx="6" fill="url(#${gradientId})"${strokeAttr}/>`;
  }
}

// ── Edge endpoint clipping ──

/**
 * Clip a point (inside a node) to the node boundary along the direction
 * from `from` toward `to`. Returns the intersection on the node border.
 */
function clipToNodeBorder(
  nodeCenter: { x: number; y: number },
  nodeWidth: number,
  nodeHeight: number,
  shape: string,
  from: { x: number; y: number }
): { x: number; y: number } {
  const dx = from.x - nodeCenter.x;
  const dy = from.y - nodeCenter.y;
  if (dx === 0 && dy === 0) return { ...nodeCenter };

  const hw = nodeWidth / 2;
  const hh = nodeHeight / 2;

  if (shape === 'diamond') {
    // Diamond: |x/hw| + |y/hh| = 1
    // Parametric intersection along direction (dx, dy) from center
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const t = 1 / (adx / hw + ady / hh);
    return {
      x: nodeCenter.x + dx * t,
      y: nodeCenter.y + dy * t,
    };
  }

  if (shape === 'circle') {
    // Ellipse: (x/hw)^2 + (y/hh)^2 = 1
    const angle = Math.atan2(dy, dx);
    return {
      x: nodeCenter.x + hw * Math.cos(angle),
      y: nodeCenter.y + hh * Math.sin(angle),
    };
  }

  if (shape === 'stadium') {
    // Pill: rectangle with semicircle ends (rx = hh)
    const rx = Math.min(hh, hw);
    // Check if the line exits through the rounded end or the flat side
    const angle = Math.atan2(dy, dx);
    // For simplicity, treat as ellipse with slightly reduced radii
    const effectiveHw = hw - 2;
    const effectiveHh = hh - 2;
    const t = Math.min(
      effectiveHw / Math.max(Math.abs(dx), 0.001),
      effectiveHh / Math.max(Math.abs(dy), 0.001)
    );
    return {
      x: nodeCenter.x + dx * t,
      y: nodeCenter.y + dy * t,
    };
  }

  // Default rectangle intersection (works for rect, rounded, subroutine, etc.)
  const t = Math.min(
    hw / Math.max(Math.abs(dx), 0.001),
    hh / Math.max(Math.abs(dy), 0.001)
  );
  return {
    x: nodeCenter.x + dx * t,
    y: nodeCenter.y + dy * t,
  };
}

// ── Edge path builder ──

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return '';

  const p = points;
  let d = `M${p[0].x.toFixed(1)},${p[0].y.toFixed(1)}`;

  if (p.length === 2) {
    d += ` L${p[1].x.toFixed(1)},${p[1].y.toFixed(1)}`;
    return d;
  }

  // Use cubic bezier curves for smooth paths through control points
  for (let i = 1; i < p.length - 1; i++) {
    const prev = p[i - 1];
    const curr = p[i];
    const next = p[i + 1];

    // Control points for smooth curve
    const cpx1 = (prev.x + curr.x) / 2;
    const cpy1 = (prev.y + curr.y) / 2;

    if (i === 1) {
      d += ` Q${curr.x.toFixed(1)},${curr.y.toFixed(1)} ${((curr.x + next.x) / 2).toFixed(1)},${((curr.y + next.y) / 2).toFixed(1)}`;
    } else if (i === p.length - 2) {
      d += ` Q${curr.x.toFixed(1)},${curr.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
    } else {
      d += ` Q${curr.x.toFixed(1)},${curr.y.toFixed(1)} ${((curr.x + next.x) / 2).toFixed(1)},${((curr.y + next.y) / 2).toFixed(1)}`;
    }
  }

  return d;
}

// ── Main renderer ──

export interface NodeOverride {
  gradientStops?: Array<{ offset: string; color: string }>;
  textGradientStops?: Array<{ offset: string; color: string }>;
  strokeGradientStops?: Array<{ offset: string; color: string }>;
  strokeWidth?: number;
}

export interface EdgeOverride {
  colorStops?: Array<{ offset: string; color: string }>;
  textColorStops?: Array<{ offset: string; color: string }>;
  strokeWidth?: number;
}

export interface RenderOptions {
  showLegend?: boolean;
  showShadows?: boolean;
  background?: string;
  nodeOverrides?: Record<string, NodeOverride>;
  edgeOverrides?: Record<string, EdgeOverride>;
}

export function renderFlowchartSVG(
  graph: FlowGraph,
  theme: FlowchartTheme,
  options: RenderOptions = {}
): string {
  const { showLegend = true, showShadows = true, background, nodeOverrides = {}, edgeOverrides = {} } = options;

  // Layout the graph
  const layout = layoutGraph(graph);
  const legendExtra = showLegend ? LEGEND_HEIGHT + 20 : 0;
  const svgWidth = Math.max(layout.width, 400);
  const svgHeight = layout.height + legendExtra;

  // Collect unique edge colors for markers (include overrides)
  const edgeColorsSet = new Set<string>();
  edgeColorsSet.add(theme.edgeColor);
  for (const key of Object.keys(edgeOverrides)) {
    const eo = edgeOverrides[key];
    if (eo?.colorStops && eo.colorStops.length >= 1) {
      // Add all stop colors as potential marker colors; use first for marker
      edgeColorsSet.add(eo.colorStops[0].color);
    }
  }
  const edgeColors = Array.from(edgeColorsSet);

  // Collect used shapes for legend
  const usedShapesSet = new Set<NodeShape>();
  for (const n of graph.nodes) {
    usedShapesSet.add(n.shape);
  }
  const usedShapes = Array.from(usedShapesSet);

  // ── Build SVG ──

  const parts: string[] = [];

  // SVG open
  parts.push(`<svg width="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family: ${FONT_FAMILY};">`);

  // Background
  const bgColor = background || theme.background;
  parts.push(`  <rect width="100%" height="100%" fill="${bgColor}"/>`);

  // ── Defs ──
  parts.push('  <defs>');

  // Drop shadow filter
  if (showShadows) {
    parts.push(`    <filter id="fcr-shadow" x="-10%" y="-10%" width="120%" height="130%">`);
    parts.push(`      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="${theme.shadowColor}"/>`);
    parts.push('    </filter>');
  }

  // Arrow markers for each edge color — filled triangles
  for (const color of edgeColors) {
    const markerId = `fcr-arrow-${color.replace('#', '')}`;
    parts.push(`    <marker id="${markerId}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">`);
    parts.push(`      <path d="M0 0L10 5L0 10Z" fill="${color}"/>`);
    parts.push('    </marker>');
  }

  // Node gradients (fill, stroke, text)
  for (const layoutNode of layout.nodes) {
    const shape = layoutNode.node.shape;
    const style = theme.nodeStyles[shape];
    const override = nodeOverrides[layoutNode.id];

    // Fill gradient
    const fillGradId = `fcr-grad-${layoutNode.id}`;
    const fillStops = override?.gradientStops && override.gradientStops.length >= 2
      ? override.gradientStops
      : style.gradient.stops;
    const isHorizontal = shape !== 'diamond';
    parts.push(`    <linearGradient id="${fillGradId}" x1="0" y1="0" x2="${isHorizontal ? '1' : '0.5'}" y2="${isHorizontal ? '0' : '1'}">`);
    for (const stop of fillStops) {
      parts.push(`      <stop offset="${stop.offset}" stop-color="${stop.color}"/>`);
    }
    parts.push('    </linearGradient>');

    // Stroke gradient (if override has 2+ stops)
    if (override?.strokeGradientStops && override.strokeGradientStops.length >= 2) {
      const strokeGradId = `fcr-stroke-${layoutNode.id}`;
      parts.push(`    <linearGradient id="${strokeGradId}" x1="0" y1="0" x2="1" y2="0">`);
      for (const stop of override.strokeGradientStops) {
        parts.push(`      <stop offset="${stop.offset}" stop-color="${stop.color}"/>`);
      }
      parts.push('    </linearGradient>');
    }

    // Text gradient (if override has 2+ stops)
    if (override?.textGradientStops && override.textGradientStops.length >= 2) {
      const textGradId = `fcr-text-${layoutNode.id}`;
      parts.push(`    <linearGradient id="${textGradId}" x1="0" y1="0" x2="1" y2="0">`);
      for (const stop of override.textGradientStops) {
        parts.push(`      <stop offset="${stop.offset}" stop-color="${stop.color}"/>`);
      }
      parts.push('    </linearGradient>');
    }
  }

  // Edge override gradients (line color, label text color)
  for (let i = 0; i < layout.edges.length; i++) {
    const edgeKey = `${layout.edges[i].from}-${layout.edges[i].to}`;
    const eo = edgeOverrides[edgeKey] || edgeOverrides[String(i)];
    if (eo?.colorStops && eo.colorStops.length >= 2) {
      const edgeGradId = `fcr-edge-${i}`;
      parts.push(`    <linearGradient id="${edgeGradId}" x1="0" y1="0" x2="1" y2="0">`);
      for (const stop of eo.colorStops) {
        parts.push(`      <stop offset="${stop.offset}" stop-color="${stop.color}"/>`);
      }
      parts.push('    </linearGradient>');
    }
    if (eo?.textColorStops && eo.textColorStops.length >= 2) {
      const edgeTextGradId = `fcr-edge-text-${i}`;
      parts.push(`    <linearGradient id="${edgeTextGradId}" x1="0" y1="0" x2="1" y2="0">`);
      for (const stop of eo.textColorStops) {
        parts.push(`      <stop offset="${stop.offset}" stop-color="${stop.color}"/>`);
      }
      parts.push('    </linearGradient>');
    }
  }

  parts.push('  </defs>');

  // ── Subgraphs ──
  for (const sg of layout.subgraphs) {
    parts.push(`  <g>`);
    parts.push(`    <rect x="${sg.x}" y="${sg.y}" width="${sg.width}" height="${sg.height}" rx="8" fill="${theme.subgraphBg}" stroke="${theme.subgraphBorder}" stroke-width="1.5" stroke-dasharray="6 3"/>`);
    parts.push(`    <text x="${sg.x + 12}" y="${sg.y + 18}" font-size="12" font-weight="600" fill="${theme.subgraphTextColor}">${escapeXml(sg.label)}</text>`);
    parts.push('  </g>');
  }

  // Build a lookup for layout nodes by ID (for edge clipping)
  const layoutNodeMap = new Map<string, LayoutNode>();
  for (const ln of layout.nodes) {
    layoutNodeMap.set(ln.id, ln);
  }

  // ── Edges (render before nodes so nodes are on top) ──
  for (let i = 0; i < layout.edges.length; i++) {
    const le = layout.edges[i];
    const edge = le.edge;
    const edgeKey = `${le.from}-${le.to}`;
    const edgeOverride = edgeOverrides[edgeKey] || edgeOverrides[String(i)];
    // Resolve edge color: gradient URL, single color, or theme default
    let color: string;
    let markerColor: string; // markers need a flat color, not gradient URL
    if (edgeOverride?.colorStops && edgeOverride.colorStops.length >= 2) {
      color = `url(#fcr-edge-${i})`;
      markerColor = edgeOverride.colorStops[0].color;
    } else if (edgeOverride?.colorStops && edgeOverride.colorStops.length === 1) {
      color = edgeOverride.colorStops[0].color;
      markerColor = color;
    } else {
      color = theme.edgeColor;
      markerColor = color;
    }
    const markerId = `fcr-arrow-${markerColor.replace('#', '')}`;

    // Clip edge endpoints to node boundaries so arrows sit on the border
    const clippedPoints = [...le.points];
    const sourceNode = layoutNodeMap.get(le.from);
    const targetNode = layoutNodeMap.get(le.to);

    if (sourceNode && clippedPoints.length >= 2) {
      const nextPt = clippedPoints[1];
      clippedPoints[0] = clipToNodeBorder(
        { x: sourceNode.x, y: sourceNode.y },
        sourceNode.width,
        sourceNode.height,
        sourceNode.node.shape,
        nextPt
      );
    }
    if (targetNode && clippedPoints.length >= 2) {
      const prevPt = clippedPoints[clippedPoints.length - 2];
      clippedPoints[clippedPoints.length - 1] = clipToNodeBorder(
        { x: targetNode.x, y: targetNode.y },
        targetNode.width,
        targetNode.height,
        targetNode.node.shape,
        prevPt
      );
    }

    // Edge path
    const pathD = buildSmoothPath(clippedPoints);
    if (!pathD) continue;

    let strokeDasharray = '';
    let strokeWidth = edgeOverride?.strokeWidth ? String(edgeOverride.strokeWidth) : '1.8';
    let markerEnd = '';
    let markerStart = '';

    switch (edge.arrowType) {
      case 'dotted':
        strokeDasharray = ' stroke-dasharray="6 4"';
        markerEnd = ` marker-end="url(#${markerId})"`;
        break;
      case 'thick':
        if (!edgeOverride?.strokeWidth) strokeWidth = '3';
        markerEnd = ` marker-end="url(#${markerId})"`;
        break;
      case 'bidirectional':
        markerEnd = ` marker-end="url(#${markerId})"`;
        markerStart = ` marker-start="url(#${markerId})"`;
        break;
      case 'solid-noarrow':
        // No markers
        break;
      case 'solid':
      default:
        markerEnd = ` marker-end="url(#${markerId})"`;
        break;
    }

    parts.push(`  <path d="${pathD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"${strokeDasharray}${markerEnd}${markerStart}/>`);

    // Edge label
    if (edge.label) {
      // Position at midpoint of the path
      const midIdx = Math.floor(le.points.length / 2);
      const midPt = le.points[midIdx];
      const labelWidth = measureTextWidth(edge.label) + EDGE_LABEL_PADDING * 2;
      const labelHeight = EDGE_LABEL_FONT_SIZE + EDGE_LABEL_PADDING * 2;

      let labelTextColor: string;
      if (edgeOverride?.textColorStops && edgeOverride.textColorStops.length >= 2) {
        labelTextColor = `url(#fcr-edge-text-${i})`;
      } else if (edgeOverride?.textColorStops && edgeOverride.textColorStops.length === 1) {
        labelTextColor = edgeOverride.textColorStops[0].color;
      } else {
        labelTextColor = theme.edgeLabelColor;
      }
      parts.push(`  <rect x="${midPt.x - labelWidth / 2}" y="${midPt.y - labelHeight / 2}" width="${labelWidth}" height="${labelHeight}" rx="4" fill="${theme.edgeLabelBg}" stroke="${theme.edgeColor}" stroke-width="0.5" opacity="0.95"/>`);
      parts.push(`  <text x="${midPt.x}" y="${midPt.y}" text-anchor="middle" dominant-baseline="central" font-size="${EDGE_LABEL_FONT_SIZE}" font-weight="500" fill="${labelTextColor}">${escapeXml(edge.label)}</text>`);
    }
  }

  // ── Nodes ──
  for (const ln of layout.nodes) {
    const gradId = `fcr-grad-${ln.id}`;
    const shape = ln.node.shape;
    const style = theme.nodeStyles[shape];
    const filterAttr = showShadows ? ' filter="url(#fcr-shadow)"' : '';
    const nodeOverride = nodeOverrides[ln.id];

    // Resolve stroke: gradient URL if multi-stop override, else theme default
    let strokeFill: string | undefined;
    if (nodeOverride?.strokeGradientStops && nodeOverride.strokeGradientStops.length >= 2) {
      strokeFill = `url(#fcr-stroke-${ln.id})`;
    } else if (nodeOverride?.strokeGradientStops && nodeOverride.strokeGradientStops.length === 1) {
      strokeFill = nodeOverride.strokeGradientStops[0].color;
    }

    parts.push(`  <g${filterAttr}>`);
    parts.push(`    ${renderNodeShape(ln, gradId, theme, strokeFill, nodeOverride?.strokeWidth)}`);
    parts.push('  </g>');

    // Resolve text: gradient URL if multi-stop override, else theme default
    let textFill: string;
    if (nodeOverride?.textGradientStops && nodeOverride.textGradientStops.length >= 2) {
      textFill = `url(#fcr-text-${ln.id})`;
    } else if (nodeOverride?.textGradientStops && nodeOverride.textGradientStops.length === 1) {
      textFill = nodeOverride.textGradientStops[0].color;
    } else {
      textFill = style.textColor;
    }
    parts.push(`  <text x="${ln.x}" y="${ln.y}" text-anchor="middle" dominant-baseline="central" font-size="${FONT_SIZE}" font-weight="600" fill="${textFill}">${escapeXml(ln.node.label)}</text>`);
  }

  // ── Legend ──
  if (showLegend && usedShapes.length > 0) {
    const legendY = svgHeight - LEGEND_HEIGHT + 5;
    const shapeLabels: Record<string, string> = {
      stadium: 'Start / End',
      rect: 'Process',
      diamond: 'Decision',
      rounded: 'Operation',
      circle: 'Event',
      hexagon: 'Preparation',
      parallelogram: 'I/O',
      subroutine: 'Subroutine',
    };

    // Calculate legend width to center it
    const legendItems = usedShapes;
    const itemWidths = legendItems.map(s => measureTextWidth(shapeLabels[s] || s) + 24);
    const totalLegendWidth = itemWidths.reduce((sum, w) => sum + w + LEGEND_ITEM_GAP, -LEGEND_ITEM_GAP);
    let legendX = (svgWidth - totalLegendWidth) / 2;

    for (const shape of legendItems) {
      const style = theme.nodeStyles[shape];
      const stops = style.gradient.stops;
      const label = shapeLabels[shape] || shape;

      // Mini gradient swatch
      const swatchId = `fcr-legend-${shape}`;
      // We need to add this gradient to defs — but defs is already closed.
      // Instead, use the first stop color as a flat swatch color (simpler for legend)
      const swatchColor = stops.length > 1
        ? stops[0].color
        : stops[0]?.color || '#888';

      parts.push(`  <rect x="${legendX}" y="${legendY}" width="14" height="14" rx="3" fill="${swatchColor}"/>`);
      parts.push(`  <text x="${legendX + 20}" y="${legendY + 11}" font-size="11" fill="${theme.legendTextColor}">${escapeXml(label)}</text>`);

      legendX += measureTextWidth(label) + 24 + LEGEND_ITEM_GAP;
    }
  }

  parts.push('</svg>');

  return parts.join('\n');
}
