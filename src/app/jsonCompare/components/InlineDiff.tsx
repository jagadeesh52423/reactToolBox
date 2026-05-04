'use client';
import React, { useMemo } from 'react';
import { computeInlineDiff } from '../utils/inlineDiff';

interface InlineDiffProps {
  left: unknown;
  right: unknown;
  side: 'left' | 'right';
}

const stringifyForDiff = (value: unknown): string => {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  return JSON.stringify(value);
};

const InlineDiff: React.FC<InlineDiffProps> = ({ left, right, side }) => {
  const segments = useMemo(() => {
    const a = stringifyForDiff(left);
    const b = stringifyForDiff(right);
    const diff = computeInlineDiff(a, b);
    return side === 'left' ? diff.left : diff.right;
  }, [left, right, side]);

  const changedClass =
    side === 'left'
      ? 'bg-red-200/80 dark:bg-red-500/40 text-red-900 dark:text-red-100 rounded-sm px-0.5'
      : 'bg-emerald-200/80 dark:bg-emerald-500/40 text-emerald-900 dark:text-emerald-100 rounded-sm px-0.5';

  return (
    <span className="font-mono whitespace-pre-wrap break-words">
      {segments.map((seg, idx) => (
        <span key={idx} className={seg.changed ? changedClass : ''}>
          {seg.text}
        </span>
      ))}
    </span>
  );
};

export default InlineDiff;
