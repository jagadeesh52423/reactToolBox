'use client';
import React, { useMemo } from 'react';
import { scrollToPairIndex } from '../utils/hunks';

export type MinimapRowType = 'unchanged' | 'added' | 'removed' | 'changed';

interface DiffMinimapProps {
  rowTypes: MinimapRowType[];
}

// Above this many rows, group rows into buckets rather than one marker per row —
// keeps the strip to a bounded number of DOM nodes on very large diffs.
const MAX_MARKERS = 300;

const COLOR_BY_TYPE: Record<Exclude<MinimapRowType, 'unchanged'>, string> = {
  changed: 'bg-yellow-400 dark:bg-yellow-500',
  removed: 'bg-red-500 dark:bg-red-500',
  added: 'bg-green-500 dark:bg-green-500',
};

const JUMP_LABEL_BY_TYPE: Record<Exclude<MinimapRowType, 'unchanged'>, string> = {
  changed: 'Jump to changed lines',
  removed: 'Jump to removed lines',
  added: 'Jump to added lines',
};

// Priority for picking a bucket's single "dominant" color when it mixes change types.
const DOMINANCE_ORDER: Exclude<MinimapRowType, 'unchanged'>[] = ['changed', 'removed', 'added'];

interface Bucket {
  startIndex: number;
  dominant: MinimapRowType;
  density: number;
}

function buildBuckets(rowTypes: MinimapRowType[]): Bucket[] {
  const total = rowTypes.length;
  if (total === 0) return [];

  const bucketCount = Math.min(total, MAX_MARKERS);
  const bucketSize = total / bucketCount;
  const buckets: Bucket[] = [];

  for (let bucketIndex = 0; bucketIndex < bucketCount; bucketIndex++) {
    const start = Math.floor(bucketIndex * bucketSize);
    const end = Math.min(total, Math.max(start + 1, Math.floor((bucketIndex + 1) * bucketSize)));

    const counts: Record<MinimapRowType, number> = { unchanged: 0, added: 0, removed: 0, changed: 0 };
    for (let rowIndex = start; rowIndex < end; rowIndex++) counts[rowTypes[rowIndex]]++;

    const changeCount = counts.added + counts.removed + counts.changed;
    const dominant = DOMINANCE_ORDER.find((type) => counts[type] > 0) ?? 'unchanged';

    buckets.push({ startIndex: start, dominant, density: changeCount / (end - start) });
  }

  return buckets;
}

/**
 * Thin vertical strip of colored markers summarizing add/remove/change density across
 * the whole diff. Click a marker to scroll that region into view. Pure CSS/DOM — no
 * charting dependency.
 */
export const DiffMinimap: React.FC<DiffMinimapProps> = ({ rowTypes }) => {
  const buckets = useMemo(() => buildBuckets(rowTypes), [rowTypes]);

  if (buckets.length === 0) return null;

  return (
    <div
      className="hidden md:flex flex-col w-3 flex-shrink-0 self-stretch rounded overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
      role="navigation"
      aria-label="Change minimap"
      title="Change minimap — click a marker to jump to that region"
    >
      {buckets.map((bucket) =>
        bucket.dominant === 'unchanged' ? (
          <div key={bucket.startIndex} className="flex-1 min-h-[2px]" />
        ) : (
          <button
            key={bucket.startIndex}
            type="button"
            onClick={() => scrollToPairIndex(bucket.startIndex)}
            aria-label={JUMP_LABEL_BY_TYPE[bucket.dominant]}
            className={`flex-1 min-h-[2px] cursor-pointer hover:opacity-70 transition-opacity ${COLOR_BY_TYPE[bucket.dominant]}`}
            style={{ opacity: Math.max(0.35, bucket.density) }}
          />
        )
      )}
    </div>
  );
};
