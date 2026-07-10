export type InlineDiffSegment = {
  text: string;
  changed: boolean;
};

export type InlineDiffResult = {
  left: InlineDiffSegment[];
  right: InlineDiffSegment[];
};

// Cap on the LCS DP table size (tokensLeft * tokensRight). Beyond this the O(n*m) table
// becomes multi-second/OOM on large primitive values diffed synchronously on the render thread.
const MAX_LCS_CELLS = 1_000_000;

const tokenize = (s: string): string[] =>
  s.split(/(\s+|[^\w\s])/).filter((t) => t.length > 0);

const commonPrefixLength = (a: string[], b: string[]): number => {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i++;
  return i;
};

const commonSuffixLength = (a: string[], b: string[], prefixLength: number): number => {
  const max = Math.min(a.length, b.length) - prefixLength;
  let i = 0;
  while (i < max && a[a.length - 1 - i] === b[b.length - 1 - i]) i++;
  return i;
};

const computeLCS = (a: string[], b: string[]): number[][] => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
};

const mergeSegments = (segments: InlineDiffSegment[]): InlineDiffSegment[] => {
  const merged: InlineDiffSegment[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && last.changed === seg.changed) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
};

const toUnchangedSegments = (tokens: string[]): InlineDiffSegment[] =>
  tokens.map((text) => ({ text, changed: false }));

const diffTokenArrays = (
  leftTokens: string[],
  rightTokens: string[]
): { left: InlineDiffSegment[]; right: InlineDiffSegment[] } => {
  const dp = computeLCS(leftTokens, rightTokens);

  const leftOut: InlineDiffSegment[] = [];
  const rightOut: InlineDiffSegment[] = [];

  let i = leftTokens.length;
  let j = rightTokens.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftTokens[i - 1] === rightTokens[j - 1]) {
      leftOut.unshift({ text: leftTokens[i - 1], changed: false });
      rightOut.unshift({ text: rightTokens[j - 1], changed: false });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightOut.unshift({ text: rightTokens[j - 1], changed: true });
      j--;
    } else if (i > 0) {
      leftOut.unshift({ text: leftTokens[i - 1], changed: true });
      i--;
    }
  }

  return { left: leftOut, right: rightOut };
};

export const computeInlineDiff = (left: string, right: string): InlineDiffResult => {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);

  const prefixLength = commonPrefixLength(leftTokens, rightTokens);
  const suffixLength = commonSuffixLength(leftTokens, rightTokens, prefixLength);

  const prefixTokens = leftTokens.slice(0, prefixLength);
  const suffixTokens = leftTokens.slice(leftTokens.length - suffixLength);

  const leftMiddle = leftTokens.slice(prefixLength, leftTokens.length - suffixLength);
  const rightMiddle = rightTokens.slice(prefixLength, rightTokens.length - suffixLength);

  let leftMiddleOut: InlineDiffSegment[];
  let rightMiddleOut: InlineDiffSegment[];

  if (leftMiddle.length === 0 && rightMiddle.length === 0) {
    leftMiddleOut = [];
    rightMiddleOut = [];
  } else if (leftMiddle.length * rightMiddle.length > MAX_LCS_CELLS) {
    leftMiddleOut = leftMiddle.length > 0 ? [{ text: leftMiddle.join(''), changed: true }] : [];
    rightMiddleOut = rightMiddle.length > 0 ? [{ text: rightMiddle.join(''), changed: true }] : [];
  } else {
    const middleDiff = diffTokenArrays(leftMiddle, rightMiddle);
    leftMiddleOut = middleDiff.left;
    rightMiddleOut = middleDiff.right;
  }

  const leftOut = [...toUnchangedSegments(prefixTokens), ...leftMiddleOut, ...toUnchangedSegments(suffixTokens)];
  const rightOut = [...toUnchangedSegments(prefixTokens), ...rightMiddleOut, ...toUnchangedSegments(suffixTokens)];

  return { left: mergeSegments(leftOut), right: mergeSegments(rightOut) };
};
