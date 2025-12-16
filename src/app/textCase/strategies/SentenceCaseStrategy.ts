import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to Sentence case
 * Capitalizes only the first letter
 */
export class SentenceCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'Sentence case',
      'Hello world',
      'Capitalizes only the first letter of the text'
    );
  }

  convert(text: string): string {
    if (text.length === 0) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}
