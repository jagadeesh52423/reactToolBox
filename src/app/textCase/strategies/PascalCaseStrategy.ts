import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to PascalCase
 * All words capitalized with no spaces
 */
export class PascalCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'PascalCase',
      'HelloWorld',
      'All words capitalized with no spaces'
    );
  }

  convert(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/[-_./]/g, '');
  }
}
