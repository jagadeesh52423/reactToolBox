import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to lowercase
 */
export class LowerCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'lowercase',
      'hello world',
      'Converts all characters to lowercase'
    );
  }

  convert(text: string): string {
    return text.toLowerCase();
  }
}
