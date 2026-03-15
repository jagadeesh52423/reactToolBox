/**
 * Mermaid Flowchart Parser
 *
 * Parses Mermaid flowchart/graph code into a structured graph model.
 * Handles node shapes, arrow types, edge labels, subgraphs, chained edges,
 * classDef/class directives, and semicolon-separated statements.
 */

export type NodeShape =
  | 'rect'
  | 'rounded'
  | 'stadium'
  | 'diamond'
  | 'circle'
  | 'hexagon'
  | 'parallelogram'
  | 'subroutine';

export type ArrowType =
  | 'solid'
  | 'dotted'
  | 'thick'
  | 'bidirectional'
  | 'solid-noarrow';

export type GraphDirection = 'TB' | 'TD' | 'BT' | 'LR' | 'RL';

export interface FlowNode {
  id: string;
  label: string;
  shape: NodeShape;
  className?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  arrowType: ArrowType;
}

export interface FlowSubgraph {
  id: string;
  label: string;
  nodeIds: string[];
}

export interface FlowGraph {
  direction: GraphDirection;
  nodes: FlowNode[];
  edges: FlowEdge[];
  subgraphs: FlowSubgraph[];
}

const VALID_DIRECTIONS: GraphDirection[] = ['TB', 'TD', 'BT', 'LR', 'RL'];

const NODE_ID_PATTERN = '[A-Za-z_][A-Za-z0-9_]*';

/**
 * Arrow patterns ordered from longest to shortest to ensure greedy matching.
 * Each entry maps a Mermaid arrow syntax to its ArrowType.
 */
const ARROW_PATTERNS: Array<{ pattern: string; type: ArrowType }> = [
  { pattern: '<-->', type: 'bidirectional' },
  { pattern: '<-.->',type: 'bidirectional' },
  { pattern: '-.->', type: 'dotted' },
  { pattern: '-->', type: 'solid' },
  { pattern: '==>', type: 'thick' },
  { pattern: '-.-', type: 'dotted' },
  { pattern: '===', type: 'thick' },
  { pattern: '---', type: 'solid-noarrow' },
];

/**
 * Build a regex alternation string for all arrow patterns,
 * escaping special regex characters.
 */
function buildArrowAlternation(): string {
  return ARROW_PATTERNS
    .map((a) => a.pattern.replace(/([.*+?^${}()|[\]\\])/g, '\\$1'))
    .join('|');
}

/**
 * Determine the ArrowType for a matched arrow string.
 */
function getArrowType(arrow: string): ArrowType {
  const found = ARROW_PATTERNS.find((a) => a.pattern === arrow);
  return found ? found.type : 'solid';
}

/**
 * Parse a node definition and extract its id, label, and shape.
 * Returns null if the string is not a valid node definition.
 */
function parseNodeDefinition(raw: string): { id: string; label: string; shape: NodeShape } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Match node id followed by a shape delimiter
  // Order matters: check multi-char delimiters before single-char ones

  // Double brackets: A[[text]] -> subroutine
  const subroutineMatch = trimmed.match(
    new RegExp(`^(${NODE_ID_PATTERN})\\[\\[([^\\]]*(?:\\][^\\]]*)*)\\]\\]$`)
  );
  if (subroutineMatch) {
    return { id: subroutineMatch[1], label: subroutineMatch[2], shape: 'subroutine' };
  }

  // Double parens: A((text)) -> circle
  const circleMatch = trimmed.match(
    new RegExp(`^(${NODE_ID_PATTERN})\\(\\(([^)]*(?:\\)[^)]*)*)\\)\\)$`)
  );
  if (circleMatch) {
    return { id: circleMatch[1], label: circleMatch[2], shape: 'circle' };
  }

  // Stadium (pill): A([text]) -> stadium
  const stadiumMatch = trimmed.match(
    new RegExp(`^(${NODE_ID_PATTERN})\\(\\[([^\\]]*(?:\\][^)]*)*)\\]\\)$`)
  );
  if (stadiumMatch) {
    return { id: stadiumMatch[1], label: stadiumMatch[2], shape: 'stadium' };
  }

  // Double braces: A{{text}} -> hexagon
  const hexagonMatch = trimmed.match(
    new RegExp(`^(${NODE_ID_PATTERN})\\{\\{([^}]*(?:\\}[^}]*)*)\\}\\}$`)
  );
  if (hexagonMatch) {
    return { id: hexagonMatch[1], label: hexagonMatch[2], shape: 'hexagon' };
  }

  // Parallelogram: A>text] -> parallelogram
  const parallelogramMatch = trimmed.match(
    new RegExp(`^(${NODE_ID_PATTERN})>([^\\]]*)\\]$`)
  );
  if (parallelogramMatch) {
    return { id: parallelogramMatch[1], label: parallelogramMatch[2], shape: 'parallelogram' };
  }

  // Diamond: A{text} -> diamond
  const diamondMatch = trimmed.match(
    new RegExp(`^(${NODE_ID_PATTERN})\\{([^}]*)\\}$`)
  );
  if (diamondMatch) {
    return { id: diamondMatch[1], label: diamondMatch[2], shape: 'diamond' };
  }

  // Square bracket: A[text] -> rect
  const rectMatch = trimmed.match(
    new RegExp(`^(${NODE_ID_PATTERN})\\[([^\\]]*)\\]$`)
  );
  if (rectMatch) {
    return { id: rectMatch[1], label: rectMatch[2], shape: 'rect' };
  }

  // Rounded: A(text) -> rounded
  const roundedMatch = trimmed.match(
    new RegExp(`^(${NODE_ID_PATTERN})\\(([^)]*)\\)$`)
  );
  if (roundedMatch) {
    return { id: roundedMatch[1], label: roundedMatch[2], shape: 'rounded' };
  }

  // Bare node id only
  const bareMatch = trimmed.match(new RegExp(`^(${NODE_ID_PATTERN})$`));
  if (bareMatch) {
    return { id: bareMatch[1], label: bareMatch[1], shape: 'rect' };
  }

  return null;
}

/**
 * Ensure a node is registered in the node map. If the node already exists,
 * keep the first shape definition. Returns the node.
 */
function ensureNode(
  nodeMap: Map<string, FlowNode>,
  id: string,
  label: string,
  shape: NodeShape
): FlowNode {
  if (nodeMap.has(id)) {
    return nodeMap.get(id)!;
  }
  const node: FlowNode = { id, label, shape };
  nodeMap.set(id, node);
  return node;
}

/**
 * Split a line into statements by semicolons, respecting content
 * inside brackets, parens, and braces.
 */
function splitStatements(line: string): string[] {
  const statements: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '[' || ch === '(' || ch === '{') {
      depth++;
      current += ch;
    } else if (ch === ']' || ch === ')' || ch === '}') {
      depth = Math.max(0, depth - 1);
      current += ch;
    } else if (ch === ';' && depth === 0) {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

/**
 * Parse a single statement that may contain chained edges like A --> B --> C,
 * standalone node definitions, or a mix of both.
 *
 * Uses a token-based approach: split the statement by arrow patterns,
 * then iterate over alternating node/arrow tokens.
 */
function parseStatement(
  statement: string,
  nodeMap: Map<string, FlowNode>,
  edges: FlowEdge[]
): void {
  const arrowAlt = buildArrowAlternation();

  // Find all arrow occurrences, including optional pipe-delimited or inline labels
  const arrowFindRegex = new RegExp(
    `(?:--\\s+([^-=.><|]+?)\\s+)?(${arrowAlt})(?:\\|([^|]*)\\|)?`,
    'g'
  );

  const arrowMatches: Array<{
    index: number;
    fullMatch: string;
    inlineLabel?: string;
    arrow: string;
    pipeLabel?: string;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = arrowFindRegex.exec(statement)) !== null) {
    arrowMatches.push({
      index: match.index,
      fullMatch: match[0],
      inlineLabel: match[1]?.trim() || undefined,
      arrow: match[2],
      pipeLabel: match[3]?.trim() || undefined,
    });
  }

  // No arrows found: this is a standalone node definition
  if (arrowMatches.length === 0) {
    const nodeDef = parseNodeDefinition(statement.trim());
    if (nodeDef) {
      ensureNode(nodeMap, nodeDef.id, nodeDef.label, nodeDef.shape);
    }
    return;
  }

  // Extract node segments between arrows
  const segments: string[] = [];
  let lastEnd = 0;

  for (const am of arrowMatches) {
    const before = statement.substring(lastEnd, am.index).trim();
    if (before) {
      // If there was an inline label like "-- text", the inline label was captured
      // but the preceding text before "-- text" is the node.
      // We need to strip any trailing "-- " that's part of inline label syntax.
      const cleanedBefore = before.replace(/\s*--\s*$/, '').trim();
      if (cleanedBefore) {
        segments.push(cleanedBefore);
      }
    }
    lastEnd = am.index + am.fullMatch.length;
  }

  // Last segment after the final arrow
  const trailing = statement.substring(lastEnd).trim();
  if (trailing) {
    segments.push(trailing);
  }

  // We should have exactly arrowMatches.length + 1 segments for a valid chain
  // but handle gracefully if not
  if (segments.length < 2) {
    // Try as a standalone node definition
    const nodeDef = parseNodeDefinition(statement.trim());
    if (nodeDef) {
      ensureNode(nodeMap, nodeDef.id, nodeDef.label, nodeDef.shape);
    }
    return;
  }

  // Parse each segment as a node definition
  const parsedNodes: Array<{ id: string; label: string; shape: NodeShape }> = [];
  for (const seg of segments) {
    const nodeDef = parseNodeDefinition(seg);
    if (nodeDef) {
      parsedNodes.push(nodeDef);
      ensureNode(nodeMap, nodeDef.id, nodeDef.label, nodeDef.shape);
    }
  }

  // Create edges between consecutive node pairs
  for (let i = 0; i < arrowMatches.length; i++) {
    const fromNode = parsedNodes[i];
    const toNode = parsedNodes[i + 1];
    if (!fromNode || !toNode) continue;

    const am = arrowMatches[i];
    const label = am.pipeLabel || am.inlineLabel || undefined;
    const arrowType = getArrowType(am.arrow);

    edges.push({
      from: fromNode.id,
      to: toNode.id,
      label,
      arrowType,
    });
  }
}

/**
 * Parse class assignments from a `class` directive.
 * Syntax: class nodeId1,nodeId2 className
 */
function parseClassDirective(
  line: string,
  nodeMap: Map<string, FlowNode>
): void {
  const classMatch = line.match(/^class\s+(.+?)\s+(\S+)$/);
  if (!classMatch) return;

  const nodeIds = classMatch[1].split(',').map((s) => s.trim());
  const className = classMatch[2];

  for (const nodeId of nodeIds) {
    const node = nodeMap.get(nodeId);
    if (node) {
      node.className = className;
    }
  }
}

/**
 * Parse Mermaid flowchart code into a structured FlowGraph.
 *
 * Returns null if the code does not start with a `graph` or `flowchart` keyword.
 */
export function parseFlowchart(code: string): FlowGraph | null {
  if (!code || typeof code !== 'string') return null;

  const rawLines = code.split('\n');

  // Find the first non-empty, non-comment line to check for graph/flowchart keyword
  let headerLine = '';
  let headerIndex = -1;

  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    if (!trimmed || trimmed.startsWith('%%')) continue;
    headerLine = trimmed;
    headerIndex = i;
    break;
  }

  if (!headerLine) return null;

  // Check for graph or flowchart keyword
  const headerMatch = headerLine.match(/^(graph|flowchart)\s*(TB|TD|BT|LR|RL)?\s*$/i);
  if (!headerMatch) return null;

  const directionRaw = headerMatch[2]?.toUpperCase() as GraphDirection | undefined;
  const direction: GraphDirection =
    directionRaw && VALID_DIRECTIONS.includes(directionRaw) ? directionRaw : 'TD';

  const nodeMap = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];
  const subgraphs: FlowSubgraph[] = [];

  // Subgraph tracking
  const subgraphStack: FlowSubgraph[] = [];

  // Process lines after the header
  for (let i = headerIndex + 1; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('%%')) continue;

    // Split by semicolons into individual statements
    const statements = splitStatements(trimmed);

    for (const stmt of statements) {
      // Skip style directives
      if (/^style\s+/i.test(stmt)) continue;
      if (/^linkStyle\s+/i.test(stmt)) continue;
      if (/^click\s+/i.test(stmt)) continue;

      // Handle classDef (skip the definition itself, classes are applied via `class` directive)
      if (/^classDef\s+/i.test(stmt)) {
        continue;
      }

      // Handle class assignments
      if (/^class\s+/i.test(stmt)) {
        parseClassDirective(stmt, nodeMap);
        continue;
      }

      // Handle subgraph start
      const subgraphMatch = stmt.match(/^subgraph\s+(\S+)(?:\s*\[([^\]]*)\])?\s*$/);
      if (subgraphMatch) {
        const subId = subgraphMatch[1];
        const subLabel = subgraphMatch[2]?.trim() || subId;
        const sub: FlowSubgraph = { id: subId, label: subLabel, nodeIds: [] };
        subgraphStack.push(sub);
        subgraphs.push(sub);
        continue;
      }

      // Handle subgraph end
      if (/^end$/i.test(stmt)) {
        subgraphStack.pop();
        continue;
      }

      // Handle direction override inside subgraph (e.g., `direction LR`)
      if (/^direction\s+(TB|TD|BT|LR|RL)$/i.test(stmt)) {
        continue;
      }

      // Capture node ids before parsing to detect new additions
      const nodeIdsBefore = new Set(Array.from(nodeMap.keys()));

      // Parse as edge chain or node definition
      parseStatement(stmt, nodeMap, edges);

      // Track which nodes were added inside the current subgraph
      if (subgraphStack.length > 0) {
        const currentSubgraph = subgraphStack[subgraphStack.length - 1];
        nodeMap.forEach((_node, nodeId) => {
          if (!nodeIdsBefore.has(nodeId) && !currentSubgraph.nodeIds.includes(nodeId)) {
            currentSubgraph.nodeIds.push(nodeId);
          }
        });
      }
    }
  }

  return {
    direction,
    nodes: Array.from(nodeMap.values()),
    edges,
    subgraphs,
  };
}
