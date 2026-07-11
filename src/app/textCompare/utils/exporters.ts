import { DiffResult, DiffStatistics, DiffType } from '../models/DiffModels';
import { buildUnifiedDiffRows, UnifiedDiffRow } from './unifiedDiffRows';

// Word-diff is irrelevant to line-oriented exports (markdown/html/patch all work at
// line granularity) — a stub comparer skips that computation while reusing the same
// tested left/right alignment logic the app's unified view already relies on.
const NO_WORD_DIFF_COMPARER = {
  compareWords: () => ({ left: [], right: [] }),
};

function getUnifiedRows(diffResult: DiffResult): UnifiedDiffRow[] {
  return buildUnifiedDiffRows(diffResult, NO_WORD_DIFF_COMPARER);
}

const DIFF_FENCE_PREFIX: Record<UnifiedDiffRow['type'], string> = {
  [DiffType.UNCHANGED]: ' ',
  [DiffType.REMOVED]: '-',
  [DiffType.ADDED]: '+',
};

/**
 * A Markdown fence must be at least one backtick longer than any backtick run inside
 * the fenced content, or the content's own backticks close it early. Compared content
 * is arbitrary user text, so this can't be assumed away.
 */
function pickMarkdownFence(lines: string[]): string {
  let longestRun = 2;
  for (const line of lines) {
    for (const run of line.match(/`+/g) ?? []) {
      if (run.length > longestRun) longestRun = run.length;
    }
  }
  return '`'.repeat(longestRun + 1);
}

/**
 * Builds a Markdown report: summary stats + the full unified diff in a fenced ```diff
 * block (GitHub-flavored Markdown renders +/- lines with color automatically).
 */
export function buildMarkdownReport(diffResult: DiffResult, statistics: DiffStatistics, now: Date = new Date()): string {
  const diffLines = getUnifiedRows(diffResult).map((row) => `${DIFF_FENCE_PREFIX[row.type]}${row.text}`);
  const fence = pickMarkdownFence(diffLines);

  const lines = [
    '# Text Compare Report',
    '',
    `- **Date:** ${now.toISOString()}`,
    `- **Similarity:** ${statistics.similarity.toFixed(1)}%`,
    `- **Added:** ${statistics.changes.added} · **Removed:** ${statistics.changes.removed} · **Modified:** ${statistics.changes.modified}`,
  ];
  if (diffResult.notice) {
    lines.push('', `> Note: ${diffResult.notice}`);
  }
  lines.push('', `${fence}diff`, ...diffLines, fence);

  return lines.join('\n');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const HTML_ROW_CLASS: Record<UnifiedDiffRow['type'], string> = {
  [DiffType.UNCHANGED]: 'ctx',
  [DiffType.REMOVED]: 'del',
  [DiffType.ADDED]: 'add',
};

/**
 * Builds a standalone HTML report (inline CSS, no external assets) viewable by opening
 * the downloaded file directly in a browser.
 */
export function buildHtmlReport(diffResult: DiffResult, statistics: DiffStatistics, now: Date = new Date()): string {
  const bodyLines = getUnifiedRows(diffResult)
    .map((row) => `<div class="line ${HTML_ROW_CLASS[row.type]}">${escapeHtml(`${DIFF_FENCE_PREFIX[row.type]}${row.text}`)}</div>`)
    .join('\n');
  const notice = diffResult.notice ? `<p class="notice">Note: ${escapeHtml(diffResult.notice)}</p>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Text Compare Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
  h1 { font-size: 1.25rem; margin: 0 0 4px; }
  .meta { color: #64748b; font-size: 0.875rem; margin: 0 0 16px; }
  .notice { color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 12px; font-size: 0.875rem; }
  .diff { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; overflow-x: auto; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.8125rem; line-height: 1.5; }
  .line { white-space: pre-wrap; }
  .line.add { background: #dcfce7; color: #166534; }
  .line.del { background: #fee2e2; color: #991b1b; }
  .line.ctx { color: #475569; }
</style>
</head>
<body>
  <h1>Text Compare Report</h1>
  <p class="meta">Date: ${now.toISOString()} | Similarity: ${statistics.similarity.toFixed(1)}% | Added: ${statistics.changes.added} | Removed: ${statistics.changes.removed} | Modified: ${statistics.changes.modified}</p>
  ${notice}
  <div class="diff">
${bodyLines}
  </div>
</body>
</html>`;
}

interface PatchLine {
  type: 'context' | 'removed' | 'added';
  text: string;
}

interface PatchHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: PatchLine[];
}

const PATCH_LINE_PREFIX: Record<PatchLine['type'], string> = {
  context: ' ',
  removed: '-',
  added: '+',
};

/**
 * Groups unified rows into standard unified-diff hunks: contiguous runs of changed
 * rows expanded by `contextLines` unchanged rows on each side, merging where windows
 * overlap. old/new line cursors are tracked across the FULL row list (not just hunk
 * rows) so hunk headers stay correct even when a hunk starts at the very first row.
 */
function buildPatchHunks(rows: UnifiedDiffRow[], contextLines: number): PatchHunk[] {
  const total = rows.length;
  const included = new Array<boolean>(total).fill(false);
  for (let index = 0; index < total; index++) {
    if (rows[index].type === DiffType.UNCHANGED) continue;
    const start = Math.max(0, index - contextLines);
    const end = Math.min(total - 1, index + contextLines);
    for (let j = start; j <= end; j++) included[j] = true;
  }

  const ranges: Array<[number, number]> = [];
  let rangeStart = -1;
  for (let index = 0; index < total; index++) {
    if (included[index] && rangeStart === -1) rangeStart = index;
    if (!included[index] && rangeStart !== -1) {
      ranges.push([rangeStart, index - 1]);
      rangeStart = -1;
    }
  }
  if (rangeStart !== -1) ranges.push([rangeStart, total - 1]);

  const hunks: PatchHunk[] = [];
  let oldCursor = 1;
  let newCursor = 1;
  let rangeIndex = 0;

  for (let index = 0; index < total; index++) {
    const currentRange = ranges[rangeIndex];
    if (currentRange && index === currentRange[0]) {
      const [start, end] = currentRange;
      const capturedOldCursor = oldCursor;
      const capturedNewCursor = newCursor;
      const lines: PatchLine[] = [];
      let oldCount = 0;
      let newCount = 0;

      for (let k = start; k <= end; k++) {
        const row = rows[k];
        if (row.type === DiffType.UNCHANGED) {
          lines.push({ type: 'context', text: row.text });
          oldCount++;
          newCount++;
          oldCursor++;
          newCursor++;
        } else if (row.type === DiffType.REMOVED) {
          lines.push({ type: 'removed', text: row.text });
          oldCount++;
          oldCursor++;
        } else {
          lines.push({ type: 'added', text: row.text });
          newCount++;
          newCursor++;
        }
      }

      // A pure insertion/deletion has a zero-length side; convention is to report the
      // line *after which* it occurs rather than a start that would imply a line exists.
      hunks.push({
        oldStart: oldCount > 0 ? capturedOldCursor : Math.max(0, capturedOldCursor - 1),
        oldCount,
        newStart: newCount > 0 ? capturedNewCursor : Math.max(0, capturedNewCursor - 1),
        newCount,
        lines,
      });

      index = end;
      rangeIndex++;
      continue;
    }

    const row = rows[index];
    if (row.type === DiffType.UNCHANGED) {
      oldCursor++;
      newCursor++;
    } else if (row.type === DiffType.REMOVED) {
      oldCursor++;
    } else {
      newCursor++;
    }
  }

  return hunks;
}

export interface UnifiedPatchFileNames {
  original: string;
  modified: string;
}

const DEFAULT_PATCH_FILE_NAMES: UnifiedPatchFileNames = { original: 'original.txt', modified: 'modified.txt' };

/**
 * Builds a standard git-style unified diff patch (`--- a/…` / `+++ b/…` / `@@ … @@`
 * hunks), consumable by `git apply` / `patch`. Unlike the other exports this contains
 * only the patch itself — no report metadata — to stay a valid patch file.
 */
export function buildUnifiedPatch(
  diffResult: DiffResult,
  contextLines: number = 3,
  fileNames: UnifiedPatchFileNames = DEFAULT_PATCH_FILE_NAMES
): string {
  const hunks = buildPatchHunks(getUnifiedRows(diffResult), Math.max(0, contextLines));

  const header = [`--- a/${fileNames.original}`, `+++ b/${fileNames.modified}`];
  if (hunks.length === 0) {
    return `${header.join('\n')}\n`;
  }

  const body = hunks.flatMap((hunk) => [
    `@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`,
    ...hunk.lines.map((line) => `${PATCH_LINE_PREFIX[line.type]}${line.text}`),
  ]);

  return `${[...header, ...body].join('\n')}\n`;
}
