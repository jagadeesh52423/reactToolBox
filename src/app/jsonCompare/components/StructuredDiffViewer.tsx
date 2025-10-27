'use client';
import React, { useMemo } from 'react';

interface StructuredDiffViewerProps {
  left: string;
  right: string;
}

interface DiffNode {
  key: string;
  path: string;
  value: any;
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  children?: DiffNode[];
  leftValue?: any;
  rightValue?: any;
  level: number;
}

interface DiffSegment {
  text: string;
  type: 'common' | 'removed' | 'added';
}

const StructuredDiffViewer: React.FC<StructuredDiffViewerProps> = ({ left, right }) => {
  const diffTree = useMemo(() => {
    try {
      const leftObj = JSON.parse(left);
      const rightObj = JSON.parse(right);
      return buildDiffTree(leftObj, rightObj);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  }, [left, right]);

  // Word-level diff using LCS (Longest Common Subsequence)
  function computeWordDiff(oldText: string, newText: string): { oldSegments: DiffSegment[], newSegments: DiffSegment[] } {
    const oldWords = oldText.split(/(\s+)/);
    const newWords = newText.split(/(\s+)/);

    // Compute LCS
    const lcs = computeLCS(oldWords, newWords);

    // Build diff segments
    const oldSegments: DiffSegment[] = [];
    const newSegments: DiffSegment[] = [];

    let oldIndex = 0;
    let newIndex = 0;
    let lcsIndex = 0;

    while (oldIndex < oldWords.length || newIndex < newWords.length) {
      if (lcsIndex < lcs.length &&
          oldIndex < oldWords.length &&
          newIndex < newWords.length &&
          oldWords[oldIndex] === newWords[newIndex] &&
          oldWords[oldIndex] === lcs[lcsIndex]) {
        // Common part
        oldSegments.push({ text: oldWords[oldIndex], type: 'common' });
        newSegments.push({ text: newWords[newIndex], type: 'common' });
        oldIndex++;
        newIndex++;
        lcsIndex++;
      } else {
        // Handle deletions from old
        while (oldIndex < oldWords.length &&
               (lcsIndex >= lcs.length || oldWords[oldIndex] !== lcs[lcsIndex])) {
          oldSegments.push({ text: oldWords[oldIndex], type: 'removed' });
          oldIndex++;
        }

        // Handle additions to new
        while (newIndex < newWords.length &&
               (lcsIndex >= lcs.length || newWords[newIndex] !== lcs[lcsIndex])) {
          newSegments.push({ text: newWords[newIndex], type: 'added' });
          newIndex++;
        }
      }
    }

    return { oldSegments, newSegments };
  }

  // LCS algorithm
  function computeLCS(arr1: string[], arr2: string[]): string[] {
    const m = arr1.length;
    const n = arr2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Fill DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Reconstruct LCS
    const lcs: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        lcs.unshift(arr1[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  // Helper function to check if any descendant has changes
  function hasDescendantChanges(nodes: DiffNode[]): boolean {
    return nodes.some(node => {
      if (node.type !== 'unchanged') {
        return true;
      }
      if (node.children && node.children.length > 0) {
        return hasDescendantChanges(node.children);
      }
      return false;
    });
  }

  // Helper function to check if a node or its descendants have actual changes
  function hasActualChanges(node: DiffNode): boolean {
    if (node.type !== 'unchanged') {
      return true;
    }
    if (node.children && node.children.length > 0) {
      return node.children.some(child => hasActualChanges(child));
    }
    return false;
  }

  function buildDiffTree(left: any, right: any, path = '', level = 0): DiffNode[] {
    const nodes: DiffNode[] = [];

    // Handle the case where one or both values are not objects
    if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) {
      if (left === right) {
        return [{
          key: path || 'root',
          path,
          value: left,
          type: 'unchanged',
          level
        }];
      }

      if (left !== undefined && right !== undefined) {
        return [{
          key: path || 'root',
          path,
          value: null,
          type: 'changed',
          leftValue: left,
          rightValue: right,
          level
        }];
      }

      if (left !== undefined) {
        return [{
          key: path || 'root',
          path,
          value: left,
          type: 'removed',
          level
        }];
      }

      return [{
        key: path || 'root',
        path,
        value: right,
        type: 'added',
        level
      }];
    }

    const allKeys = new Set([...Object.keys(left || {}), ...Object.keys(right || {})]);

    for (const key of Array.from(allKeys).sort()) {
      const currentPath = path ? `${path}.${key}` : key;
      const leftValue = left?.[key];
      const rightValue = right?.[key];

      // Key exists in both
      if (key in (left || {}) && key in (right || {})) {
        if (typeof leftValue === 'object' && typeof rightValue === 'object' &&
            leftValue !== null && rightValue !== null) {
          // Both are objects - create parent node and recurse
          const children = buildDiffTree(leftValue, rightValue, currentPath, level + 1);

          // Both are objects - create parent node and recurse
          const hasAnyChanges = hasDescendantChanges(children);

          // Always show the parent if there are any changes in descendants
          if (hasAnyChanges || children.some(child => child.type !== 'unchanged')) {
            nodes.push({
              key,
              path: currentPath,
              value: Array.isArray(leftValue) ? [] : {}, // Use proper container type
              type: 'unchanged', // Parent is unchanged, only children differ
              children: children, // Include all children
              level
            });
          }
        } else {
          // Compare primitive values
          if (leftValue === rightValue) {
            nodes.push({
              key,
              path: currentPath,
              value: leftValue,
              type: 'unchanged',
              level
            });
          } else {
            nodes.push({
              key,
              path: currentPath,
              value: null,
              type: 'changed',
              leftValue,
              rightValue,
              level
            });
          }
        }
      }
      // Key only in left (removed)
      else if (key in (left || {})) {
        if (typeof leftValue === 'object' && leftValue !== null) {
          const children = buildDiffTree(leftValue, {}, currentPath, level + 1);
          // For removed objects, show all children as removed
          nodes.push({
            key,
            path: currentPath,
            value: Array.isArray(leftValue) ? [] : {}, // Use proper container type
            type: 'removed',
            children: children.map(child => ({ ...child, type: 'removed' as const })),
            level
          });
        } else {
          nodes.push({
            key,
            path: currentPath,
            value: leftValue,
            type: 'removed',
            level
          });
        }
      }
      // Key only in right (added)
      else if (key in (right || {})) {
        if (typeof rightValue === 'object' && rightValue !== null) {
          const children = buildDiffTree({}, rightValue, currentPath, level + 1);
          // For added objects, show all children as added
          nodes.push({
            key,
            path: currentPath,
            value: Array.isArray(rightValue) ? [] : {}, // Use proper container type
            type: 'added',
            children: children.map(child => ({ ...child, type: 'added' as const })),
            level
          });
        } else {
          nodes.push({
            key,
            path: currentPath,
            value: rightValue,
            type: 'added',
            level
          });
        }
      }
    }

    return nodes;
  }

  const renderNode = (node: DiffNode): React.ReactNode => {
    const indent = node.level * 24; // 24px per level
    const hasChildren = node.children && node.children.length > 0;

    const getBackgroundColor = (type: string, hasChildren: boolean) => {
      switch (type) {
        case 'added': return 'bg-green-100 border-l-4 border-green-400';
        case 'removed': return 'bg-red-100 border-l-4 border-red-400';
        case 'changed': return 'bg-yellow-100 border-l-4 border-yellow-400';
        default:
          // For unchanged parents, use a more subtle styling
          return hasChildren ? 'bg-gray-25 border-l-4 border-gray-300' : 'bg-gray-50 border-l-4 border-gray-200';
      }
    };

    const getTextColor = (type: string) => {
      switch (type) {
        case 'added': return 'text-green-800';
        case 'removed': return 'text-red-800';
        case 'changed': return 'text-yellow-800';
        default: return 'text-gray-700';
      }
    };

    const formatValue = (value: any) => {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') return `"${value}"`;
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return value.length === 0 ? '[...]' : `[${value.length} items]`;
        }
        return Object.keys(value).length === 0 ? '{...}' : `{${Object.keys(value).length} props}`;
      }
      return String(value);
    };

    return (
      <div key={node.path || node.key}>
        <div
          className={`p-2 mb-1 rounded ${getBackgroundColor(node.type, hasChildren || false)} ${getTextColor(node.type)}`}
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="flex items-center">
            <span className="font-mono font-medium mr-2">
              {node.key}:
            </span>

            {node.type === 'changed' ? (
              <div className="flex flex-col space-y-2">
                {/* Render word-level diff for string values */}
                {typeof node.leftValue === 'string' && typeof node.rightValue === 'string' ?
                  (() => {
                    const { oldSegments, newSegments } = computeWordDiff(node.leftValue, node.rightValue);
                    return (
                      <>
                        <div className="bg-red-100 border border-red-300 rounded px-3 py-2">
                          <div className="font-mono text-sm">
                            {oldSegments.map((segment, idx) => (
                              <span
                                key={idx}
                                className={segment.type === 'removed' ? 'bg-red-300 text-red-900 font-bold' : ''}
                              >
                                {segment.text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-green-100 border border-green-300 rounded px-3 py-2">
                          <div className="font-mono text-sm">
                            {newSegments.map((segment, idx) => (
                              <span
                                key={idx}
                                className={segment.type === 'added' ? 'bg-green-300 text-green-900 font-bold' : ''}
                              >
                                {segment.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()
                  :
                  /* Fallback for non-string values */
                  (
                    <>
                      <div className="bg-red-100 border border-red-300 rounded px-3 py-2">
                        <span className="font-mono text-sm">{formatValue(node.leftValue)}</span>
                      </div>
                      <div className="bg-green-100 border border-green-300 rounded px-3 py-2">
                        <span className="font-mono text-sm">{formatValue(node.rightValue)}</span>
                      </div>
                    </>
                  )
                }
              </div>
            ) : (
              <span className="font-mono">
                {hasChildren ? (
                  typeof node.value === 'object' && node.value !== null ?
                    (Array.isArray(node.value) ? '[...]' : '{...}') :
                    formatValue(node.value)
                ) : formatValue(node.value)}
              </span>
            )}

            {/* Don't show status badge for unchanged parent nodes */}
            {!(node.type === 'unchanged' && hasChildren) && (
              <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                node.type === 'added' ? 'bg-green-200 text-green-800' :
                node.type === 'removed' ? 'bg-red-200 text-red-800' :
                node.type === 'changed' ? 'bg-yellow-200 text-yellow-800' :
                'bg-gray-200 text-gray-600'
              }`}>
                {node.type}
              </span>
            )}
          </div>
        </div>

        {hasChildren && node.children?.map(child => renderNode(child))}
      </div>
    );
  };

  // Check if there are any actual differences (not just unchanged nodes)
  const hasActualDifferences = diffTree.some(node => hasActualChanges(node));

  if (diffTree.length === 0 || !hasActualDifferences) {
    return (
      <div className="p-4 text-center text-green-600 bg-green-50 rounded">
        JSON objects are identical!
      </div>
    );
  }

  return (
    <div className="border rounded p-4 bg-white">
      <div className="space-y-1">
        {diffTree.map(node => renderNode(node))}
      </div>
    </div>
  );
};

export default StructuredDiffViewer;