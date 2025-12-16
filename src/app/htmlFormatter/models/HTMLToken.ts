/**
 * Enum representing different types of HTML tokens
 */
export enum TokenType {
  TAG_OPEN = 'TAG_OPEN',
  TAG_CLOSE = 'TAG_CLOSE',
  TAG_SELF_CLOSING = 'TAG_SELF_CLOSING',
  TEXT = 'TEXT',
  COMMENT = 'COMMENT',
  DOCTYPE = 'DOCTYPE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Enum representing tag display types
 */
export enum TagDisplayType {
  BLOCK = 'BLOCK',
  INLINE = 'INLINE',
  SELF_CLOSING = 'SELF_CLOSING',
}

/**
 * Model representing an HTML token
 */
export interface HTMLToken {
  type: TokenType;
  content: string;
  tagName?: string;
  attributes?: string;
  displayType?: TagDisplayType;
}

/**
 * Model representing formatting options
 */
export interface FormatOptions {
  indentSize: number;
  preserveInlineContent: boolean;
  maxLineLength?: number;
}
