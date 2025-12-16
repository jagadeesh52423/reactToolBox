import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to Inverse Case (toggle case)
 * Inverts the case of each character
 */
export class InverseCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'Inverse Case',
      'hELLO wORLD',
      'Inverts the case of each character (uppercase becomes lowercase and vice versa)'
    );
  }

  convert(text: string): string {
    return text
      .split('')
      .map(char =>
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
      )
      .join('');
  }
}
