export interface DiffLine {
  text: string;
  type: string; // 'added', 'removed', 'unchanged', 'changed'
  lineNumber: number; // Added line number field
}

export interface DiffResult {
  left: DiffLine[];
  right: DiffLine[];
}

export function computeDiff(leftText: string, rightText: string): DiffResult {
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  
  const result: DiffResult = {
    left: [],
    right: []
  };
  
  let i = 0, j = 0;
  
  while (i < leftLines.length || j < rightLines.length) {
    // Both texts have lines remaining
    if (i < leftLines.length && j < rightLines.length) {
      if (leftLines[i] === rightLines[j]) {
        // Lines are identical
        result.left.push({ text: leftLines[i], type: 'unchanged', lineNumber: i + 1 });
        result.right.push({ text: rightLines[j], type: 'unchanged', lineNumber: j + 1 });
        i++;
        j++;
      } else {
        // Lines are different - check if next line matches
        const lookAhead1 = (i + 1 < leftLines.length) && leftLines[i + 1] === rightLines[j];
        const lookAhead2 = (j + 1 < rightLines.length) && leftLines[i] === rightLines[j + 1];
        
        if (lookAhead1) {
          // Left has added a line
          result.left.push({ text: leftLines[i], type: 'removed', lineNumber: i + 1 });
          result.right.push({ text: '', type: 'placeholder', lineNumber: 0 });
          i++;
        } else if (lookAhead2) {
          // Right has added a line
          result.left.push({ text: '', type: 'placeholder', lineNumber: 0 });
          result.right.push({ text: rightLines[j], type: 'added', lineNumber: j + 1 });
          j++;
        } else {
          // Lines are changed
          result.left.push({ text: leftLines[i], type: 'changed', lineNumber: i + 1 });
          result.right.push({ text: rightLines[j], type: 'changed', lineNumber: j + 1 });
          i++;
          j++;
        }
      }
    } 
    // Only left has lines remaining
    else if (i < leftLines.length) {
      result.left.push({ text: leftLines[i], type: 'removed', lineNumber: i + 1 });
      result.right.push({ text: '', type: 'placeholder', lineNumber: 0 });
      i++;
    } 
    // Only right has lines remaining
    else {
      result.left.push({ text: '', type: 'placeholder', lineNumber: 0 });
      result.right.push({ text: rightLines[j], type: 'added', lineNumber: j + 1 });
      j++;
    }
  }
  
  return result;
}

export interface WordDiff {
  text: string;
  type: 'unchanged' | 'changed';
}

function computeLCS(leftWords: string[], rightWords: string[]): number[][] {
  const m = leftWords.length;
  const n = rightWords.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftWords[i - 1] === rightWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

export function computeWordDiff(leftLine: string, rightLine: string): { left: WordDiff[], right: WordDiff[] } {
  // Split lines into words (including spaces and punctuation as separate tokens)
  const leftWords = leftLine.split(/(\s+|[^\w\s])/).filter(word => word.length > 0);
  const rightWords = rightLine.split(/(\s+|[^\w\s])/).filter(word => word.length > 0);

  // Compute LCS table
  const lcs = computeLCS(leftWords, rightWords);

  const result = {
    left: [] as WordDiff[],
    right: [] as WordDiff[]
  };

  // Backtrack through LCS table to build diff
  let i = leftWords.length;
  let j = rightWords.length;

  const leftResult: WordDiff[] = [];
  const rightResult: WordDiff[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftWords[i - 1] === rightWords[j - 1]) {
      // Words match - part of LCS
      leftResult.unshift({ text: leftWords[i - 1], type: 'unchanged' });
      rightResult.unshift({ text: rightWords[j - 1], type: 'unchanged' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      // Word was added in right
      rightResult.unshift({ text: rightWords[j - 1], type: 'changed' });
      j--;
    } else if (i > 0) {
      // Word was removed from left
      leftResult.unshift({ text: leftWords[i - 1], type: 'changed' });
      i--;
    }
  }

  return {
    left: leftResult,
    right: rightResult
  };
}
