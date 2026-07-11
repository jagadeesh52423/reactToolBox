export interface FoldEntry {
  kind: 'fold';
  id: string;
  hiddenCount: number;
}

export interface RowEntry<T> {
  kind: 'row';
  row: T;
}

export type CollapsedEntry<T> = RowEntry<T> | FoldEntry;

export interface CollapseResult<T> {
  entries: CollapsedEntry<T>[];
  foldIds: string[];
}

/**
 * Folds runs of "unchanged" rows longer than `2 * contextLines` into a single
 * expandable fold entry, keeping `contextLines` rows of context on each side of the
 * run (git/diffchecker-style). A run of `contextLines * 2` or fewer rows is left as-is
 * — folding it would hide less than it costs to render the fold control.
 *
 * Generic over the row shape so the same logic drives both the side-by-side paired
 * rows and the unified row list. Fold ids in `expandedFoldIds` are rendered as their
 * full run of rows instead of a fold entry.
 */
export function collapseUnchangedRuns<T>(
  rows: T[],
  isUnchanged: (row: T) => boolean,
  contextLines: number,
  expandedFoldIds: ReadonlySet<string> = new Set()
): CollapseResult<T> {
  const entries: CollapsedEntry<T>[] = [];
  const foldIds: string[] = [];
  const context = Math.max(0, contextLines);

  let i = 0;
  let foldIndex = 0;
  while (i < rows.length) {
    if (!isUnchanged(rows[i])) {
      entries.push({ kind: 'row', row: rows[i] });
      i++;
      continue;
    }

    let j = i;
    while (j < rows.length && isUnchanged(rows[j])) j++;
    const runLength = j - i;

    if (runLength <= context * 2) {
      for (let k = i; k < j; k++) entries.push({ kind: 'row', row: rows[k] });
    } else {
      const foldId = `fold-${foldIndex++}`;
      foldIds.push(foldId);

      for (let k = i; k < i + context; k++) entries.push({ kind: 'row', row: rows[k] });

      if (expandedFoldIds.has(foldId)) {
        for (let k = i + context; k < j - context; k++) entries.push({ kind: 'row', row: rows[k] });
      } else {
        entries.push({ kind: 'fold', id: foldId, hiddenCount: runLength - context * 2 });
      }

      for (let k = j - context; k < j; k++) entries.push({ kind: 'row', row: rows[k] });
    }

    i = j;
  }

  return { entries, foldIds };
}
