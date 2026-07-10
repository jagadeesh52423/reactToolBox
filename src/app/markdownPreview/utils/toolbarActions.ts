export interface InsertionResult {
  newValue: string;
  replaceStart: number;
  replaceEnd: number;
  insertedText: string;
  selectionStart: number;
  selectionEnd: number;
}

interface WrapConfig {
  kind: 'wrap';
  before: string;
  after: string;
  placeholder: string;
}

interface LinePrefixConfig {
  kind: 'linePrefix';
  prefix: string;
}

export type ToolbarActionConfig = WrapConfig | LinePrefixConfig;

export type ToolbarActionId =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'link'
  | 'code'
  | 'codeBlock'
  | 'list'
  | 'quote';

export const TOOLBAR_ACTIONS: Record<ToolbarActionId, { title: string; config: ToolbarActionConfig }> = {
  bold: { title: 'Bold', config: { kind: 'wrap', before: '**', after: '**', placeholder: 'bold text' } },
  italic: { title: 'Italic', config: { kind: 'wrap', before: '*', after: '*', placeholder: 'italic text' } },
  heading: { title: 'Heading', config: { kind: 'linePrefix', prefix: '## ' } },
  link: { title: 'Link', config: { kind: 'wrap', before: '[', after: '](https://)', placeholder: 'link text' } },
  code: { title: 'Inline Code', config: { kind: 'wrap', before: '`', after: '`', placeholder: 'code' } },
  codeBlock: { title: 'Code Block', config: { kind: 'wrap', before: '```\n', after: '\n```', placeholder: 'code' } },
  list: { title: 'Bulleted List', config: { kind: 'linePrefix', prefix: '- ' } },
  quote: { title: 'Quote', config: { kind: 'linePrefix', prefix: '> ' } },
};

function computeWrapInsertion(value: string, start: number, end: number, config: WrapConfig): InsertionResult {
  const { before, after, placeholder } = config;
  const selected = value.slice(start, end);
  const core = selected || placeholder;
  const insertedText = `${before}${core}${after}`;

  return {
    newValue: value.slice(0, start) + insertedText + value.slice(end),
    replaceStart: start,
    replaceEnd: end,
    insertedText,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + core.length,
  };
}

function computeLinePrefixInsertion(value: string, start: number, end: number, config: LinePrefixConfig): InsertionResult {
  const { prefix } = config;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const nextNewline = value.indexOf('\n', end);
  const lineEnd = nextNewline === -1 ? value.length : nextNewline;

  const segment = value.slice(lineStart, lineEnd);
  const insertedText = segment
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');

  return {
    newValue: value.slice(0, lineStart) + insertedText + value.slice(lineEnd),
    replaceStart: lineStart,
    replaceEnd: lineEnd,
    insertedText,
    selectionStart: lineStart,
    selectionEnd: lineStart + insertedText.length,
  };
}

/**
 * Pure computation of a toolbar edit: given the current value and selection, returns
 * the new value plus the range that was replaced (for driving a native text insertion)
 * and the selection to apply afterwards (to highlight the inserted "core" text).
 */
export function computeToolbarInsertion(
  value: string,
  start: number,
  end: number,
  config: ToolbarActionConfig
): InsertionResult {
  return config.kind === 'wrap'
    ? computeWrapInsertion(value, start, end, config)
    : computeLinePrefixInsertion(value, start, end, config);
}

/**
 * Applies a toolbar action to a live textarea. Uses execCommand('insertText', ...) when
 * available so the browser's native undo stack records the edit; falls back to a direct
 * value replacement (which does not preserve undo) when execCommand is unsupported.
 */
export function applyToolbarAction(
  textarea: HTMLTextAreaElement,
  onChange: (value: string) => void,
  config: ToolbarActionConfig
): void {
  const { value } = textarea;
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  const result = computeToolbarInsertion(value, start, end, config);

  textarea.focus();
  textarea.setSelectionRange(result.replaceStart, result.replaceEnd);

  const insertedNatively =
    typeof document.execCommand === 'function' && document.execCommand('insertText', false, result.insertedText);

  if (!insertedNatively) {
    onChange(result.newValue);
  }

  requestAnimationFrame(() => {
    textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
  });
}
