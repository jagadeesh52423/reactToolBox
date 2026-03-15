'use client';
import React, { useState, useRef, useEffect } from 'react';
import { CUSTOM_THEMES, type CustomTheme, getThemeCategories, GradientDef } from '../themes';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (theme: CustomTheme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedThemeId, onSelectTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const categories = getThemeCategories();
  const selectedTheme = CUSTOM_THEMES.find(t => t.id === selectedThemeId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectTheme = (theme: CustomTheme) => {
    onSelectTheme(theme);
    setIsOpen(false);
  };

  const categoryLabels: Record<string, string> = {
    'built-in': 'Built-in Themes',
    'professional': 'Professional',
    'gradient': 'Gradient Themes',
    'dark': 'Dark Themes',
  };

  // Render a gradient preview circle for gradient themes
  const renderGradientPreview = (gradient: GradientDef) => {
    if (gradient.type === 'linear') {
      const gradientStr = `linear-gradient(to bottom, ${gradient.stops.map(s => `${s.color} ${s.offset}`).join(', ')})`;
      return (
        <div
          className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
          style={{ background: gradientStr }}
        />
      );
    } else {
      // radial gradient
      const gradientStr = `radial-gradient(circle, ${gradient.stops.map(s => `${s.color} ${s.offset}`).join(', ')})`;
      return (
        <div
          className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
          style={{ background: gradientStr }}
        />
      );
    }
  };

  // Render color preview for theme (either gradient or color swatches)
  const renderColorPreview = (theme: CustomTheme) => {
    if (theme.gradients && theme.gradients.length > 0) {
      return renderGradientPreview(theme.gradients[0]);
    }

    return (
      <div className="flex gap-0.5">
        {theme.previewColors.slice(0, 3).map((color, idx) => (
          <div
            key={idx}
            className="w-4 h-4 rounded border border-gray-300 dark:border-slate-600"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-xs" ref={containerRef}>
      {/* Dropdown trigger button with color preview */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        <div className="flex items-center gap-2">
          {/* Color swatches preview */}
          {selectedTheme && renderColorPreview(selectedTheme)}
          <span>{selectedTheme?.name || 'Select theme'}</span>
        </div>
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-96 overflow-auto">
          {Object.entries(categories).map(([category, themes]) => {
            if (themes.length === 0) return null;

            return (
              <div key={category} className="py-2">
                {/* Category header */}
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {categoryLabels[category]}
                </div>

                {/* Theme options */}
                <ul>
                  {themes.map((theme) => (
                    <li key={theme.id}>
                      <button
                        onClick={() => handleSelectTheme(theme)}
                        className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none ${
                          theme.id === selectedThemeId ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        {/* Color preview */}
                        <div className="flex-shrink-0">
                          {renderColorPreview(theme)}
                        </div>

                        {/* Theme name */}
                        <span className="text-gray-900 dark:text-slate-100">
                          {theme.name}
                        </span>

                        {/* Selected indicator */}
                        {theme.id === selectedThemeId && (
                          <svg
                            className="ml-auto w-4 h-4 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
