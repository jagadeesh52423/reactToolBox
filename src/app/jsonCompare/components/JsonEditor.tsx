'use client';
import React, { useRef, useState } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editorHeight, setEditorHeight] = useState(256); // Default height

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure JSON validation
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
      schemaRequest: 'ignore',
      schemaValidation: 'error'
    });

    // Custom JSON validation on blur/focus loss
    editor.onDidBlurEditorText(() => {
      validateAndMarkErrors(editor, monaco);
    });

    // Auto-resize editor based on content
    const updateHeight = () => {
      const contentHeight = Math.min(1000, Math.max(256, editor.getContentHeight()));
      if (contentHeight !== editorHeight) {
        setEditorHeight(contentHeight);
        editor.layout();
      }
    };

    editor.onDidContentSizeChange(updateHeight);
    updateHeight();


    // Initial validation
    setTimeout(() => validateAndMarkErrors(editor, monaco), 100);
  };

  const validateAndMarkErrors = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    const model = editor.getModel();
    if (!model) return;

    const value = model.getValue();
    if (!value.trim()) {
      // Clear markers for empty content
      monaco.editor.setModelMarkers(model, 'json-validation', []);
      return;
    }

    try {
      JSON.parse(value);
      // Valid JSON - clear any existing markers
      monaco.editor.setModelMarkers(model, 'json-validation', []);
    } catch (error) {
      // Parse error - create markers
      const errorMarkers = createErrorMarkers(error as SyntaxError, value, monaco);
      monaco.editor.setModelMarkers(model, 'json-validation', errorMarkers);
    }
  };

  const createErrorMarkers = (error: SyntaxError, jsonText: string, monaco: typeof import('monaco-editor')): monaco.editor.IMarkerData[] => {
    const message = error.message;

    // Extract position from error message
    const positionMatch = message.match(/position (\d+)/);
    const lineColumnMatch = message.match(/line (\d+) column (\d+)/);

    let line = 1;
    let column = 1;

    if (lineColumnMatch) {
      line = parseInt(lineColumnMatch[1]);
      column = parseInt(lineColumnMatch[2]);
    } else if (positionMatch) {
      const position = parseInt(positionMatch[1]);
      const lines = jsonText.substring(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    // Create error marker
    const marker: monaco.editor.IMarkerData = {
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: line,
      startColumn: column,
      endLineNumber: line,
      endColumn: column + 1,
      message: `JSON Syntax Error: ${message}`,
      source: 'json-validation'
    };

    return [marker];
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    language: 'json',
    theme: 'vs',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    automaticLayout: true,
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    renderLineHighlight: 'line',
    renderWhitespace: 'selection',
    mouseWheelZoom: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    contextmenu: true,
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    padding: { top: 10, bottom: 10 },
    scrollbar: {
      vertical: 'hidden', // Hide vertical scrollbar completely
      horizontal: 'hidden', // Hide horizontal scrollbar completely
      verticalScrollbarSize: 0,
      horizontalScrollbarSize: 0,
      alwaysConsumeMouseWheel: false // Don't consume mouse wheel events
    }
  };

  return (
    <div className={`border rounded font-mono ${className}`} style={{ height: `${editorHeight}px` }}>
      <Editor
        height="100%"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
        loading={
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="animate-pulse">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
};

export default JsonEditor;