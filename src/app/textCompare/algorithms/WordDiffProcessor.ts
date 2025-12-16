import { WordDiff, WordDiffResult } from '../models/DiffModels';

/**
 * Processor for computing word-level differences using LCS algorithm
 * Separated as a dedicated class for single responsibility
 */
export class WordDiffProcessor {
  /**
   * Computes word-level diff between two lines
   */
  public computeWordDiff(leftLine: string, rightLine: string): WordDiffResult {
    // Split lines into words (including spaces and punctuation as separate tokens)
    const leftWords = this.tokenize(leftLine);
    const rightWords = this.tokenize(rightLine);

    // Compute LCS table
    const lcs = this.computeLCS(leftWords, rightWords);

    // Backtrack through LCS to build diff
    return this.backtrackLCS(leftWords, rightWords, lcs);
  }

  /**
   * Tokenizes a line into words, spaces, and punctuation
   */
  private tokenize(line: string): string[] {
    return line.split(/(\s+|[^\w\s])/).filter((word) => word.length > 0);
  }

  /**
   * Computes Longest Common Subsequence table using dynamic programming
   * Time Complexity: O(m * n)
   * Space Complexity: O(m * n)
   */
  private computeLCS(leftWords: string[], rightWords: string[]): number[][] {
    const m = leftWords.length;
    const n = rightWords.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

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

  /**
   * Backtracks through the LCS table to build word-level diff
   */
  private backtrackLCS(
    leftWords: string[],
    rightWords: string[],
    lcs: number[][]
  ): WordDiffResult {
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
      right: rightResult,
    };
  }
}
