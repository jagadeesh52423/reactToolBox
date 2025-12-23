'use client';
import React, { useState, useMemo, useCallback } from 'react';
import CodeEditor from '@/components/common/CodeEditor';
import {
  toUpperCase, toLowerCase, toTitleCase, toSentenceCase,
  toCamelCase, toPascalCase, toSnakeCase, toKebabCase,
  toConstantCase, toDotCase, toPathCase, toAlternatingCase, toInverseCase,
  countCharacters, countWords, countLines,
  trimWhitespace, removeExtraSpaces, encodeURL, decodeURL
} from '../utils/textUtils';
import TextStatusBar from './TextStatusBar';
import {
  CopyIcon,
  TrashIcon,
  CheckIcon,
  CaseUpperIcon,
  WandIcon,
  LinkIcon,
  HashIcon,
  SparklesIcon,
  ReplaceIcon
} from './Icons';
import TextReplacer from './TextReplacer';

const DEFAULT_TEXT = `Hello World! This is some sample text.
It has multiple lines and some extra   spaces.
You can transform it using various text utilities.`;

type Category = 'case' | 'format' | 'encoding' | 'counting' | 'replace';

interface TransformOption {
  id: string;
  label: string;
  description: string;
  transform: (text: string) => string;
  category: Category;
}

const TRANSFORM_OPTIONS: TransformOption[] = [
  // Case transformations
  { id: 'uppercase', label: 'UPPERCASE', description: 'Convert all letters to uppercase', transform: toUpperCase, category: 'case' },
  { id: 'lowercase', label: 'lowercase', description: 'Convert all letters to lowercase', transform: toLowerCase, category: 'case' },
  { id: 'titlecase', label: 'Title Case', description: 'Capitalize the first letter of each word', transform: toTitleCase, category: 'case' },
  { id: 'sentencecase', label: 'Sentence case', description: 'Capitalize the first letter of sentence', transform: toSentenceCase, category: 'case' },
  { id: 'camelcase', label: 'camelCase', description: 'Join words with first word lowercase', transform: toCamelCase, category: 'case' },
  { id: 'pascalcase', label: 'PascalCase', description: 'Join words with each word capitalized', transform: toPascalCase, category: 'case' },
  { id: 'snakecase', label: 'snake_case', description: 'Join words with underscores', transform: toSnakeCase, category: 'case' },
  { id: 'kebabcase', label: 'kebab-case', description: 'Join words with hyphens', transform: toKebabCase, category: 'case' },
  { id: 'constantcase', label: 'CONSTANT_CASE', description: 'Uppercase with underscores', transform: toConstantCase, category: 'case' },
  { id: 'dotcase', label: 'dot.case', description: 'Join words with dots', transform: toDotCase, category: 'case' },
  { id: 'pathcase', label: 'path/case', description: 'Join words with forward slashes', transform: toPathCase, category: 'case' },
  { id: 'alternatingcase', label: 'aLtErNaTiNg', description: 'Alternate between lower and upper case', transform: toAlternatingCase, category: 'case' },
  { id: 'inversecase', label: 'Inverse Case', description: 'Swap uppercase and lowercase letters', transform: toInverseCase, category: 'case' },

  // Formatting
  { id: 'trim', label: 'Trim Whitespace', description: 'Remove leading and trailing whitespace', transform: trimWhitespace, category: 'format' },
  { id: 'singlespace', label: 'Remove Extra Spaces', description: 'Replace multiple spaces with single space', transform: removeExtraSpaces, category: 'format' },

  // Encoding
  { id: 'encodeurl', label: 'URL Encode', description: 'Encode special characters for URLs', transform: encodeURL, category: 'encoding' },
  { id: 'decodeurl', label: 'URL Decode', description: 'Decode URL-encoded characters', transform: decodeURL, category: 'encoding' },

  // Counting
  { id: 'countchars', label: 'Count Characters', description: 'Count total characters', transform: (t) => `Characters: ${countCharacters(t)}`, category: 'counting' },
  { id: 'countwords', label: 'Count Words', description: 'Count total words', transform: (t) => `Words: ${countWords(t)}`, category: 'counting' },
  { id: 'countlines', label: 'Count Lines', description: 'Count total lines', transform: (t) => `Lines: ${countLines(t)}`, category: 'counting' },
];

const CATEGORY_CONFIG: Record<Category, { label: string; icon: React.ReactNode; gradient: string }> = {
  case: { label: 'Case Conversion', icon: <CaseUpperIcon size={16} />, gradient: 'from-indigo-500 to-purple-500' },
  format: { label: 'Formatting', icon: <WandIcon size={16} />, gradient: 'from-emerald-500 to-teal-500' },
  encoding: { label: 'Encoding', icon: <LinkIcon size={16} />, gradient: 'from-amber-500 to-orange-500' },
  counting: { label: 'Counting', icon: <HashIcon size={16} />, gradient: 'from-rose-500 to-pink-500' },
  replace: { label: 'Find & Replace', icon: <ReplaceIcon size={16} />, gradient: 'from-cyan-500 to-blue-500' },
};

const TextTransformer: React.FC = () => {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [outputText, setOutputText] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('case');
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [lastTransform, setLastTransform] = useState<string | null>(null);

  // Calculate text statistics
  const calculateStats = useCallback((text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    return {
      characters: countCharacters(text),
      words: countWords(text),
      lines: countLines(text),
      sentences,
    };
  }, []);

  const inputStats = useMemo(() => calculateStats(inputText), [inputText, calculateStats]);
  const outputStats = useMemo(() => calculateStats(outputText), [outputText, calculateStats]);

  const handleTransform = useCallback((option: TransformOption) => {
    setOutputText(option.transform(inputText));
    setLastTransform(option.label);
  }, [inputText]);

  const handleCopyInput = useCallback(async () => {
    await navigator.clipboard.writeText(inputText);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  }, [inputText]);

  const handleCopyOutput = useCallback(async () => {
    await navigator.clipboard.writeText(outputText);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  }, [outputText]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setInputText(text);
  }, []);

  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
    setLastTransform(null);
  }, []);

  const filteredOptions = useMemo(
    () => TRANSFORM_OPTIONS.filter(option => option.category === activeCategory),
    [activeCategory]
  );

  // Panel header component
  const PanelHeader = ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-sm font-medium text-gray-600 dark:text-slate-300">
          {title}
        </span>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="w-full">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200/50 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  {config.icon}
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conditional Rendering based on category */}
          {activeCategory === 'replace' ? (
            <TextReplacer inputText={inputText} onInputChange={setInputText} />
          ) : (
            <>
              {/* Editor Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Input Panel */}
                <div className="flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                  <PanelHeader
                    title="Input Text"
                    actions={
                      <>
                        <button
                          onClick={handlePaste}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-600/30 border border-gray-200/50 dark:border-slate-600/30 transition-all duration-200 text-xs font-medium"
                        >
                          <SparklesIcon size={14} />
                          <span>Paste</span>
                        </button>
                        <button
                          onClick={handleCopyInput}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-600/30 border border-gray-200/50 dark:border-slate-600/30 transition-all duration-200 text-xs font-medium"
                        >
                          {copiedInput ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                          <span>{copiedInput ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={handleClear}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100/50 dark:hover:bg-red-900/30 border border-red-200/50 dark:border-red-500/30 transition-all duration-200 text-xs font-medium"
                        >
                          <TrashIcon size={14} />
                          <span>Clear</span>
                        </button>
                      </>
                    }
                  />
                  <div className="h-64">
                    <CodeEditor
                      value={inputText}
                      onChange={setInputText}
                      placeholder="Enter or paste your text here..."
                    />
                  </div>
                </div>

                {/* Output Panel */}
                <div className="flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                  <PanelHeader
                    title={lastTransform ? `Output - ${lastTransform}` : 'Output'}
                    actions={
                      outputText && (
                        <button
                          onClick={handleCopyOutput}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-500/30 transition-all duration-200 text-xs font-medium"
                        >
                          {copiedOutput ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                          <span>{copiedOutput ? 'Copied!' : 'Copy'}</span>
                        </button>
                      )
                    }
                  />
                  <div className="h-64">
                    <CodeEditor
                      value={outputText}
                      onChange={() => {}}
                      placeholder="Transformed output will appear here..."
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Transformation Options */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                <PanelHeader title={`${CATEGORY_CONFIG[activeCategory].label} Options`} />
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {filteredOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleTransform(option)}
                        className="group flex flex-col items-start p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-200 text-left"
                      >
                        <span className="font-medium text-sm text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-slate-500 mt-1 line-clamp-2">
                          {option.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Status Bar - only show for non-replace categories */}
      {activeCategory !== 'replace' && (
        <TextStatusBar
          inputStats={inputStats}
          outputStats={outputStats}
          hasOutput={!!outputText}
        />
      )}
    </div>
  );
};

export default TextTransformer;
