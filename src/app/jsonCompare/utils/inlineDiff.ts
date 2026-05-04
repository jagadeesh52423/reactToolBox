export type InlineDiffSegment = {
  text: string;
  changed: boolean;
};

export type InlineDiffResult = {
  left: InlineDiffSegment[];
  right: InlineDiffSegment[];
};

const tokenize = (s: string): string[] =>
  s.split(/(\s+|[^\w\s])/).filter((t) => t.length > 0);

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

export const computeInlineDiff = (left: string, right: string): InlineDiffResult => {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
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

  return { left: mergeSegments(leftOut), right: mergeSegments(rightOut) };
};
