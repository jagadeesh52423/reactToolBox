'use client';

import { useCallback, useRef } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useTheme } from '@/contexts/ThemeContext';

interface MonacoJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

let jsonThemesRegistered = false;

const handleEditorWillMount: BeforeMount = (monaco) => {
  if (jsonThemesRegistered) return;
  jsonThemesRegistered = true;

  monaco.editor.defineTheme('jv-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '7dd3fc', fontStyle: 'bold' },
      { token: 'string.value.json', foreground: 'a3e635' },
      { token: 'number', foreground: 'fbbf24' },
      { token: 'keyword.json', foreground: 'f472b6' },
      { token: 'delimiter.bracket.json', foreground: 'cbd5e1' },
      { token: 'delimiter.array.json', foreground: 'cbd5e1' },
      { token: 'delimiter.colon.json', foreground: '64748b' },
      { token: 'delimiter.comma.json', foreground: '64748b' },
    ],
    colors: {
      'editor.background': '#0b1220',
      'editor.foreground': '#e2e8f0',
      'editor.lineHighlightBackground': '#1e293b',
      'editor.lineHighlightBorder': '#1e293b00',
      'editor.selectionBackground': '#1e40af66',
      'editor.selectionHighlightBackground': '#1e40af33',
      'editor.wordHighlightBackground': '#1e40af33',
      'editor.findMatchBackground': '#fbbf2466',
      'editor.findMatchHighlightBackground': '#fbbf2433',
      'editorLineNumber.foreground': '#475569',
      'editorLineNumber.activeForeground': '#94a3b8',
      'editorCursor.foreground': '#7dd3fc',
      'editor.inactiveSelectionBackground': '#1e293b',
      'editorBracketMatch.background': '#1e3a8a66',
      'editorBracketMatch.border': '#60a5fa',
      'editorBracketHighlight.foreground1': '#fbbf24',
      'editorBracketHighlight.foreground2': '#c084fc',
      'editorBracketHighlight.foreground3': '#34d399',
      'editorBracketHighlight.foreground4': '#f472b6',
      'editorBracketHighlight.foreground5': '#60a5fa',
      'editorBracketHighlight.foreground6': '#fb923c',
      'editorIndentGuide.background': '#1e293b',
      'editorIndentGuide.activeBackground': '#475569',
      'editorGutter.background': '#0b1220',
      'editorWhitespace.foreground': '#1e293b',
      'scrollbarSlider.background': '#33415566',
      'scrollbarSlider.hoverBackground': '#475569aa',
      'scrollbarSlider.activeBackground': '#64748bcc',
      'scrollbar.shadow': '#00000000',
      'editorOverviewRuler.border': '#00000000',
    },
  });

  monaco.editor.defineTheme('jv-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '1d4ed8', fontStyle: 'bold' },
      { token: 'string.value.json', foreground: '15803d' },
      { token: 'number', foreground: 'b45309' },
      { token: 'keyword.json', foreground: 'be185d' },
      { token: 'delimiter.bracket.json', foreground: '475569' },
      { token: 'delimiter.array.json', foreground: '475569' },
      { token: 'delimiter.colon.json', foreground: '94a3b8' },
      { token: 'delimiter.comma.json', foreground: '94a3b8' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#0f172a',
      'editor.lineHighlightBackground': '#f1f5f9',
      'editor.lineHighlightBorder': '#f1f5f900',
      'editor.selectionBackground': '#bfdbfe',
      'editor.selectionHighlightBackground': '#dbeafe',
      'editor.wordHighlightBackground': '#dbeafe',
      'editor.findMatchBackground': '#fde68a',
      'editor.findMatchHighlightBackground': '#fef3c7',
      'editorLineNumber.foreground': '#cbd5e1',
      'editorLineNumber.activeForeground': '#475569',
      'editorCursor.foreground': '#2563eb',
      'editor.inactiveSelectionBackground': '#e2e8f0',
      'editorBracketMatch.background': '#dbeafe',
      'editorBracketMatch.border': '#2563eb',
      'editorBracketHighlight.foreground1': '#b45309',
      'editorBracketHighlight.foreground2': '#7c3aed',
      'editorBracketHighlight.foreground3': '#15803d',
      'editorBracketHighlight.foreground4': '#be185d',
      'editorBracketHighlight.foreground5': '#1d4ed8',
      'editorBracketHighlight.foreground6': '#c2410c',
      'editorIndentGuide.background': '#f1f5f9',
      'editorIndentGuide.activeBackground': '#cbd5e1',
      'editorGutter.background': '#ffffff',
      'editorWhitespace.foreground': '#e2e8f0',
      'scrollbarSlider.background': '#cbd5e166',
      'scrollbarSlider.hoverBackground': '#94a3b8aa',
      'scrollbarSlider.activeBackground': '#64748bcc',
      'scrollbar.shadow': '#00000000',
      'editorOverviewRuler.border': '#00000000',
    },
  });
};

export default function MonacoJsonEditor({ value, onChange }: MonacoJsonEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { resolvedTheme } = useTheme();

  const handleEditorMount: OnMount = useCallback((editorInstance) => {
    editorRef.current = editorInstance;

    editorInstance.updateOptions({
      'bracketPairColorization.enabled': true,
    } as editor.IEditorOptions);
  }, []);

  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange(val ?? '');
    },
    [onChange],
  );

  return (
    <div className="flex-1 min-h-0 relative">
      <div className="absolute inset-0">
      <Editor
        height="100%"
        language="json"
        value={value}
        onChange={handleChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorMount}
        theme={resolvedTheme === 'dark' ? 'jv-dark' : 'jv-light'}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'line',
          bracketPairColorization: { enabled: true },
          matchBrackets: 'always',
          guides: {
            bracketPairs: true,
            bracketPairsHorizontal: true,
            indentation: true,
            highlightActiveBracketPair: true,
            highlightActiveIndentation: true,
          },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          contextmenu: true,
          formatOnPaste: true,
        }}
      />
      </div>
    </div>
  );
}
