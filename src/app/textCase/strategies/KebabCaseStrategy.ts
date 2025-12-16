import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to kebab-case
 * Words separated by hyphens, all lowercase
 */
export class KebabCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'kebab-case',
      'hello-world',
      'Words separated by hyphens in lowercase'
    );
  }

  convert(text: string): string {
    return text
      .replace(/\s+/g, '-')
      .replace(/[A-Z]/g, (match, index) =>
        index > 0 ? `-${match.toLowerCase()}` : match.toLowerCase()
      )
      .replace(/[_./]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }
}
