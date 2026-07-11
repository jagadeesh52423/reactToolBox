import { WhitespaceMode } from '../models/DiffModels';

/**
 * Applies the selected whitespace-normalization mode to a single line, ahead of
 * comparison. 'leadingAndTrailing' reproduces the old boolean `ignoreWhitespace`
 * (which used `.trim()`) for backward compatibility; 'leading'/'trailing' isolate one
 * side only; 'all' additionally collapses internal whitespace runs to a single space.
 */
export function applyWhitespaceMode(line: string, mode: WhitespaceMode): string {
  switch (mode) {
    case 'leading':
      return line.replace(/^\s+/, '');
    case 'trailing':
      return line.replace(/\s+$/, '');
    case 'leadingAndTrailing':
      return line.trim();
    case 'all':
      return line.trim().replace(/\s+/g, ' ');
    case 'none':
    default:
      return line;
  }
}
