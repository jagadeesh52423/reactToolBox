import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to camelCase
 * First word lowercase, subsequent words capitalized, no spaces
 */
export class CamelCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'camelCase',
      'helloWorld',
      'First word lowercase, subsequent words capitalized with no spaces'
    );
  }

  convert(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '')
      .replace(/[-_./]/g, '');
  }
}
