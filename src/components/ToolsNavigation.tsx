'use client';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export type ToolCategory = 'Data & JSON' | 'Text' | 'Web & Code' | 'Design & Visual' | 'Utilities';

export interface Tool {
  name: string;
  path: string;
  description: string;
  icon: string;
  category: ToolCategory;
}

export const tools: Tool[] = [
  {
    name: 'JSON Visualizer',
    path: '/jsonVisualizer',
    description: 'Interactive JSON viewer with search and edit capabilities',
    icon: '{ }',
    category: 'Data & JSON',
  },
  {
    name: 'JSON Compare',
    path: '/jsonCompare',
    description: 'Compare two JSON objects and see their differences',
    icon: '⇄',
    category: 'Data & JSON',
  },
  {
    name: 'CSV Converter',
    path: '/csvConverter',
    description: 'Convert between CSV, JSON, and YAML formats',
    icon: ',.;',
    category: 'Data & JSON',
  },
  {
    name: 'Text Compare',
    path: '/textCompare',
    description: 'Compare two text snippets and see their differences',
    icon: '≎',
    category: 'Text',
  },
  {
    name: 'Text Utilities',
    path: '/textUtilities',
    description: 'Text transformations, case conversion, encoding, and more',
    icon: 'Aa',
    category: 'Text',
  },
  {
    name: 'Markdown Preview',
    path: '/markdownPreview',
    description: 'Live markdown editor with rendered preview',
    icon: 'MD',
    category: 'Text',
  },
  {
    name: 'HTML Formatter',
    path: '/htmlFormatter',
    description: 'Format and beautify HTML code with syntax highlighting',
    icon: '</>',
    category: 'Web & Code',
  },
  {
    name: 'Regex Tester',
    path: '/regexTester',
    description: 'Test and debug regular expressions with live matching',
    icon: '.*',
    category: 'Web & Code',
  },
  {
    name: 'Base64 Codec',
    path: '/base64',
    description: 'Encode and decode Base64 text and files',
    icon: 'B64',
    category: 'Web & Code',
  },
  {
    name: 'Color Picker',
    path: '/colorPicker',
    description: 'Advanced color selection tool with format conversion',
    icon: '🎨',
    category: 'Design & Visual',
  },
  {
    name: 'Mermaid Editor',
    path: '/mermaidEditor',
    description: 'Create beautiful diagrams with Mermaid syntax and download as SVG',
    icon: '📊',
    category: 'Design & Visual',
  },
  {
    name: 'Cron Parser',
    path: '/cronParser',
    description: 'Parse cron expressions and see next run times',
    icon: '@:',
    category: 'Utilities',
  },
  {
    name: 'UUID Generator',
    path: '/uuidGenerator',
    description: 'Generate UUIDs, nanoids, and other unique IDs',
    icon: '#!',
    category: 'Utilities',
  },
  {
    name: 'Timestamp Converter',
    path: '/timestampConverter',
    description: 'Convert between Unix timestamps and date formats',
    icon: 'T#',
    category: 'Utilities',
  },
];

export const categoryOrder: ToolCategory[] = [
  'Data & JSON',
  'Text',
  'Web & Code',
  'Design & Visual',
  'Utilities',
];

interface ToolsNavigationProps {
  showTitle?: boolean;
  vertical?: boolean;
}

const ToolsNavigation: React.FC<ToolsNavigationProps> = ({ showTitle = true, vertical = true }) => {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  useKeyboardShortcut('k', focusSearch, { ctrl: true });

  const filteredTools = useMemo(() => {
    if (!search.trim()) return tools;
    const query = search.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <nav className={`${showTitle ? 'p-4' : 'p-0'} rounded-lg`}>
      {showTitle && <h2 className="text-lg font-bold mb-3">Available Tools</h2>}

      {/* Sidebar Search */}
      {vertical && (
        <div className="relative mb-3 px-1">
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools... (Ctrl+K)"
            className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className={vertical ? 'flex flex-col gap-1' : 'grid grid-cols-2 md:grid-cols-3 gap-3'}>
        {filteredTools.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
            No tools found
          </div>
        )}
        {filteredTools.map((tool) => {
          const isActive = pathname === tool.path;
          return (
            <Link
              key={tool.path}
              href={tool.path}
              title={tool.description}
              className={`py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-xl font-mono">{tool.icon}</div>
              <div className="font-medium">{tool.name}</div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default ToolsNavigation;
