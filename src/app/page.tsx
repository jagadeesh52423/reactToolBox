'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { tools, categoryOrder, type ToolCategory } from '@/components/ToolsNavigation';

const categoryIcons: Record<ToolCategory, string> = {
  'Data & JSON': '{ }',
  'Text': 'Aa',
  'Web & Code': '</>',
  'Design & Visual': '🎨',
  'Utilities': '⚙',
};

export default function Home() {
  const [search, setSearch] = useState('');

  const filteredTools = useMemo(() => {
    if (!search.trim()) return tools;
    const query = search.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }, [search]);

  const toolsByCategory = useMemo(() => {
    const map = new Map<ToolCategory, typeof tools>();
    for (const cat of categoryOrder) {
      const catTools = filteredTools.filter((t) => t.category === cat);
      if (catTools.length > 0) {
        map.set(cat, catTools);
      }
    }
    return map;
  }, [filteredTools]);

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">React ToolBox</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
          A collection of useful developer tools built with React and Next.js
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {toolsByCategory.size === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No tools match your search.
        </div>
      )}

      <div className="space-y-8">
        {Array.from(toolsByCategory.entries()).map(([category, catTools]) => (
          <section key={category}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <span className="font-mono text-base">{categoryIcons[category]}</span>
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catTools.map((tool) => (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-mono text-blue-600 dark:text-blue-400">
                      {tool.icon}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
