import DiffMatchPatch from 'diff-match-patch';
import { DiffGranularity, WordDiff, WordDiffResult } from '../models/DiffModels';

type Diff = [number, string];

const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

// Matches an astral-plane character encoded as a UTF-16 surrogate pair (e.g. most emoji).
const SURROGATE_PAIR_RE = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

/**
 * Processor for computing word- or character-level inline differences, backed by
 * Google's diff-match-patch — the same engine diffchecker.com uses — for conformance
 * with its char/word-level highlighting behavior (see CHAR_WORD_DIFF_CONFORMANCE.md).
 */
export class WordDiffProcessor {
  private readonly dmp = new DiffMatchPatch();

  /**
   * Computes inline diff between two lines at word or character granularity.
   *
   * A line containing an astral-plane character (surrogate pair) never gets inline
   * highlighting — dmp diffs by UTF-16 unit and could otherwise split a surrogate pair
   * across a diff boundary, rendering a broken half-emoji. diffchecker.com's own
   * observable behavior for such lines is whole-line color only (no inline spans),
   * which this replicates.
   */
  public computeWordDiff(leftLine: string, rightLine: string, granularity: DiffGranularity = 'word'): WordDiffResult {
    if (SURROGATE_PAIR_RE.test(leftLine) || SURROGATE_PAIR_RE.test(rightLine)) {
      return {
        left: [{ text: leftLine, type: 'changed' }],
        right: [{ text: rightLine, type: 'changed' }],
      };
    }

    const diffs = granularity === 'char' ? this.diffChars(leftLine, rightLine) : this.diffWords(leftLine, rightLine);
    return buildSpansFromDiffs(diffs);
  }

  private diffChars(leftLine: string, rightLine: string): Diff[] {
    const diffs = this.dmp.diff_main(leftLine, rightLine, false);
    this.dmp.diff_cleanupSemantic(diffs);
    return diffs;
  }

  /**
   * Word-level diff via dmp's "linesToChars" trick, adapted to whitespace-run tokens
   * instead of lines: each distinct token maps to one synthetic character, dmp diffs
   * the two encoded strings, and the result is expanded back to real text (so
   * `diff_cleanupSemantic`'s length comparisons operate on real characters, not token
   * counts). Whitespace is its own token — not swallowed — so pure whitespace
   * differences stay visible, and punctuation stays glued to its word (no split inside
   * "a,b") to match diffchecker's word-mode tokenization.
   */
  private diffWords(leftLine: string, rightLine: string): Diff[] {
    const { chars1, chars2, tokenArray } = tokensToChars(leftLine, rightLine);
    const diffs = this.dmp.diff_main(chars1, chars2, false);
    charsToTokens(diffs, tokenArray);
    this.dmp.diff_cleanupSemantic(diffs);
    return diffs;
  }
}

function tokenize(line: string): string[] {
  return line.split(/(\s+)/).filter((token) => token.length > 0);
}

/**
 * Encodes both lines' whitespace-run tokens as one synthetic UTF-16 character per
 * distinct token, so dmp's char-level `diff_main` effectively diffs at token
 * granularity. Mirrors dmp's own (line-scoped) `diff_linesToChars_` trick.
 */
function tokensToChars(text1: string, text2: string): { chars1: string; chars2: string; tokenArray: string[] } {
  const tokenArray: string[] = [];
  const tokenHash = new Map<string, number>();

  const encode = (text: string): string => {
    let chars = '';
    for (const token of tokenize(text)) {
      let code = tokenHash.get(token);
      if (code === undefined) {
        tokenArray.push(token);
        code = tokenArray.length - 1;
        tokenHash.set(token, code);
      }
      chars += String.fromCharCode(code);
    }
    return chars;
  };

  const chars1 = encode(text1);
  const chars2 = encode(text2);
  return { chars1, chars2, tokenArray };
}

/** Expands each diff's encoded chars back into its original token text, in place. */
function charsToTokens(diffs: Diff[], tokenArray: string[]): void {
  for (const diff of diffs) {
    let text = '';
    for (let i = 0; i < diff[1].length; i++) {
      text += tokenArray[diff[1].charCodeAt(i)];
    }
    diff[1] = text;
  }
}

/**
 * Maps dmp's op list ([-1 delete, 0 equal, 1 insert]) to our per-side span model: the
 * left/old side is built from equal+delete ops, the right/new side from equal+insert
 * ops — the same reconstruction dmp's own `diff_text1`/`diff_text2` use — so joining a
 * side's span texts always reproduces that side's original line exactly.
 */
function buildSpansFromDiffs(diffs: Diff[]): WordDiffResult {
  const left: WordDiff[] = [];
  const right: WordDiff[] = [];

  for (const [op, text] of diffs) {
    if (op === DIFF_EQUAL) {
      left.push({ text, type: 'unchanged' });
      right.push({ text, type: 'unchanged' });
    } else if (op === DIFF_DELETE) {
      left.push({ text, type: 'changed' });
    } else if (op === DIFF_INSERT) {
      right.push({ text, type: 'changed' });
    }
  }

  return { left, right };
}
