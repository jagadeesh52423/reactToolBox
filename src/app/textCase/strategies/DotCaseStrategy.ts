import { BaseTextCaseStrategy } from './BaseTextCaseStrategy';

/**
 * Strategy for converting text to dot.case
 * Words separated by dots, all lowercase
 */
export class DotCaseStrategy extends BaseTextCaseStrategy {
  constructor() {
    super(
      'dot.case',
      'hello.world',
      'Words separated by dots in lowercase'
    );
  }

  convert(text: string): string {
    return text
      .replace(/\s+/g, '.')
      .replace(/[A-Z]/g, (match, index) =>
        index > 0 ? `.${match.toLowerCase()}` : match.toLowerCase()
      )
      .replace(/[-_/]/g, '.')
      .replace(/\.+/g, '.')
      .toLowerCase();
  }
}
