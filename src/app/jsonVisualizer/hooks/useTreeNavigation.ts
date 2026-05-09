import { useState, useCallback, useMemo } from 'react';
import { JsonPath, JSONValue, JsonNode, JsonValueType } from '../models/JsonModels';

export interface UseTreeNavigationReturn {
  focusedPath: JsonPath | null;
  focusedIndex: number;
  setFocusedPath: (path: JsonPath | null) => void;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  flatNodes: JsonNode[];
}

function buildFlatNodes(
  data: JSONValue,
  expandedPaths: Set<string>,
  path: JsonPath = [],
  level: number = 0
): JsonNode[] {
  const nodes: JsonNode[] = [];
  const pathStr = path.join('.');
  const key = path.length > 0 ? path[path.length - 1] : 'root';

  if (Array.isArray(data)) {
    nodes.push({
      value: data,
      path: [...path],
      level,
      key,
      type: JsonValueType.ARRAY,
      hasChildren: data.length > 0,
      childCount: data.length,
    });
    if (expandedPaths.has(pathStr) || path.length === 0) {
      data.forEach((item, index) => {
        nodes.push(...buildFlatNodes(item, expandedPaths, [...path, String(index)], level + 1));
      });
    }
  } else if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    nodes.push({
      value: data,
      path: [...path],
      level,
      key,
      type: JsonValueType.OBJECT,
      hasChildren: entries.length > 0,
      childCount: entries.length,
    });
    if (expandedPaths.has(pathStr) || path.length === 0) {
      entries.forEach(([k, v]) => {
        nodes.push(...buildFlatNodes(v, expandedPaths, [...path, k], level + 1));
      });
    }
  } else {
    let type = JsonValueType.UNKNOWN;
    if (typeof data === 'string') type = JsonValueType.STRING;
    else if (typeof data === 'number') type = JsonValueType.NUMBER;
    else if (typeof data === 'boolean') type = JsonValueType.BOOLEAN;
    else if (data === null) type = JsonValueType.NULL;

    nodes.push({
      value: data,
      path: [...path],
      level,
      key,
      type,
      hasChildren: false,
      childCount: 0,
    });
  }

  return nodes;
}

export function useTreeNavigation(
  parsedJson: JSONValue | null,
  expandedPaths: Set<string>,
  onToggleExpand?: (path: JsonPath) => void
): UseTreeNavigationReturn {
  const [focusedPath, setFocusedPath] = useState<JsonPath | null>(null);

  const flatNodes = useMemo(() => {
    if (!parsedJson) return [];
    return buildFlatNodes(parsedJson, expandedPaths);
  }, [parsedJson, expandedPaths]);

  const focusedIndex = useMemo(() => {
    if (!focusedPath) return -1;
    const pathStr = focusedPath.join('.');
    return flatNodes.findIndex(n => n.path.join('.') === pathStr);
  }, [focusedPath, flatNodes]);

  const moveUp = useCallback(() => {
    if (flatNodes.length === 0) return;
    if (focusedIndex <= 0) {
      setFocusedPath(flatNodes[0]?.path || null);
    } else {
      setFocusedPath(flatNodes[focusedIndex - 1].path);
    }
  }, [flatNodes, focusedIndex]);

  const moveDown = useCallback(() => {
    if (flatNodes.length === 0) return;
    if (focusedIndex < 0) {
      setFocusedPath(flatNodes[0]?.path || null);
    } else if (focusedIndex < flatNodes.length - 1) {
      setFocusedPath(flatNodes[focusedIndex + 1].path);
    }
  }, [flatNodes, focusedIndex]);

  const moveLeft = useCallback(() => {
    if (focusedIndex < 0) return;
    const node = flatNodes[focusedIndex];
    const pathStr = node.path.join('.');
    if (node.hasChildren && expandedPaths.has(pathStr)) {
      onToggleExpand?.(node.path);
    } else if (node.path.length > 0) {
      setFocusedPath(node.path.slice(0, -1));
    }
  }, [flatNodes, focusedIndex, expandedPaths, onToggleExpand]);

  const moveRight = useCallback(() => {
    if (focusedIndex < 0) return;
    const node = flatNodes[focusedIndex];
    const pathStr = node.path.join('.');
    if (node.hasChildren && !expandedPaths.has(pathStr)) {
      onToggleExpand?.(node.path);
    } else if (node.hasChildren && focusedIndex < flatNodes.length - 1) {
      setFocusedPath(flatNodes[focusedIndex + 1].path);
    }
  }, [flatNodes, focusedIndex, expandedPaths, onToggleExpand]);

  return {
    focusedPath,
    focusedIndex,
    setFocusedPath,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    flatNodes,
  };
}
