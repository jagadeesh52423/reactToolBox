import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to UPPERCASE
 */
export class UpperCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'UPPERCASE',
      'HELLO WORLD',
      'Converts all characters to uppercase'
    );
  }

  convert(text: string): string {
    return text.toUpperCase();
  }
}
