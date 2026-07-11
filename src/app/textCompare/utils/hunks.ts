import { DiffLine, DiffType } from '../models/DiffModels';

export interface PairLike {
  index: number;
  left: DiffLine;
  right: DiffLine;
}

export interface Hunk {
  id: string;
  pairIndices: number[];
}

const isUnchangedPair = (pair: PairLike): boolean =>
  pair.left.type === DiffType.UNCHANGED && pair.right.type === DiffType.UNCHANGED;

/**
 * Groups index-aligned left/right pairs into hunks: contiguous runs of non-unchanged
 * pairs. Shared by keyboard/minimap navigation (C1/C2) and per-hunk copy (C7) so all
 * three agree on what counts as one "change".
 */
export function groupHunks(pairs: PairLike[]): Hunk[] {
  const hunks: Hunk[] = [];
  let current: number[] = [];
  let hunkNumber = 0;

  const flush = () => {
    if (current.length > 0) {
      hunks.push({ id: `hunk-${hunkNumber++}`, pairIndices: current });
      current = [];
    }
  };

  for (const pair of pairs) {
    if (isUnchangedPair(pair)) {
      flush();
    } else {
      current.push(pair.index);
    }
  }
  flush();

  return hunks;
}

/**
 * Builds a patch-style ("-"/"+") copy of a hunk's text from the original pairs — used
 * by both the side-by-side and unified views since both derive from the same pairs.
 */
export function buildHunkText(hunk: Hunk, pairs: PairLike[]): string {
  const lines: string[] = [];
  for (const pairIndex of hunk.pairIndices) {
    const pair = pairs[pairIndex];
    if (!pair) continue;
    if (pair.left.type === DiffType.REMOVED || pair.left.type === DiffType.CHANGED || pair.left.type === DiffType.MOVED) {
      lines.push(`- ${pair.left.text}`);
    }
    if (pair.right.type === DiffType.ADDED || pair.right.type === DiffType.CHANGED || pair.right.type === DiffType.MOVED) {
      lines.push(`+ ${pair.right.text}`);
    }
  }
  return lines.join('\n');
}

/** Data-attribute value marking the DOM node(s) for a given pair index, so keyboard/minimap navigation can scroll to it regardless of which view (side-by-side or unified) is active. */
export function hunkAnchorId(pairIndex: number): string {
  return `pair-${pairIndex}`;
}

/** Scrolls the row(s) tagged with `data-hunk-anchor` for the given pair index into view. */
export function scrollToPairIndex(pairIndex: number): void {
  const el = document.querySelector(`[data-hunk-anchor="${hunkAnchorId(pairIndex)}"]`);
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
