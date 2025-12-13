'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tool {
  name: string;
  path: string;
  description: string;
  icon: string;
}

const tools: Tool[] = [
  {
    name: 'JSON Visualizer',
    path: '/jsonVisualizer',
    description: 'Interactive JSON viewer with search and edit capabilities',
    icon: '{ }',
  },
  {
    name: 'JSON Compare',
    path: '/jsonCompare',
    description: 'Compare two JSON objects and see their differences',
    icon: '⇄',
  },
  {
    name: 'Text Compare',
    path: '/textCompare',
    description: 'Compare two text snippets and see their differences',
    icon: '≎',
  },
  {
    name: 'HTML Formatter',
    path: '/htmlFormatter',
    description: 'Format and beautify HTML code with syntax highlighting',
    icon: '</>',
  },
  {
    name: 'Color Picker',
    path: '/colorPicker',
    description: 'Advanced color selection tool with format conversion',
    icon: '🎨',
  },
  {
    name: 'Text Utilities',
    path: '/textUtilities',
    description: 'Collection of text transformation tools',
    icon: 'Aa',
  },
  {
    name: 'Mermaid Editor',
    path: '/svgEditor',
    description: 'Create beautiful diagrams with Mermaid syntax and download as SVG',
    icon: '📊',
  },
  {
    name: 'Text Case',
    path: '/textCase',
    description: 'Convert text between different case formats',
    icon: 'Tt',
  }
];

interface ToolsNavigationProps {
  showTitle?: boolean;
  vertical?: boolean;
}

const ToolsNavigation: React.FC<ToolsNavigationProps> = ({ showTitle = true, vertical = true }) => {
  const pathname = usePathname();
  
  return (
    <nav className={`${showTitle ? 'p-4' : 'p-0'} rounded-lg`}>
      {showTitle && <h2 className="text-lg font-bold mb-4">Available Tools</h2>}
      
      <div className={vertical ? "flex flex-col gap-2" : "grid grid-cols-2 md:grid-cols-3 gap-3"}>
        {tools.map((tool) => {
          const isActive = pathname === tool.path;
          return (
            <Link 
              key={tool.path}
              href={tool.path}
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
