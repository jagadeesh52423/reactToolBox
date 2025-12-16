/**
 * Enumeration of all available text case types
 */
export enum TextCaseType {
  UPPERCASE = 'uppercase',
  LOWERCASE = 'lowercase',
  TITLE_CASE = 'titleCase',
  SENTENCE_CASE = 'sentenceCase',
  CAMEL_CASE = 'camelCase',
  PASCAL_CASE = 'pascalCase',
  SNAKE_CASE = 'snakeCase',
  KEBAB_CASE = 'kebabCase',
  CONSTANT_CASE = 'constantCase',
  DOT_CASE = 'dotCase',
  PATH_CASE = 'pathCase',
  ALTERNATING_CASE = 'alternatingCase',
  INVERSE_CASE = 'inverseCase',
}

/**
 * Model representing a text case option for the UI
 */
export interface TextCaseOption {
  type: TextCaseType;
  label: string;
  example: string;
  description: string;
}

/**
 * Model for text statistics
 */
export interface TextStats {
  characterCount: number;
  wordCount: number;
  lineCount: number;
}
