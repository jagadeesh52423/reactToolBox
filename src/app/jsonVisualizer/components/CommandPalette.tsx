'use client';

import { useRef, useEffect } from 'react';
import { CommandPaletteProps, JsonValueType, TYPE_STYLES } from '../models/JsonModels';
import { SearchIcon, XIcon } from '@/components/shared/Icons';

const TYPE_DOT_COLORS: Record<JsonValueType, string> = {
  [JsonValueType.STRING]: 'var(--jv-type-string, #16a34a)',
  [JsonValueType.NUMBER]: 'var(--jv-type-number, #2563eb)',
  [JsonValueType.BOOLEAN]: 'var(--jv-type-boolean, #9333ea)',
  [JsonValueType.NULL]: 'var(--jv-type-null, #6b7280)',
  [JsonValueType.ARRAY]: 'var(--jv-type-array, #d97706)',
  [JsonValueType.OBJECT]: 'var(--jv-type-object, #0891b2)',
  [JsonValueType.UNKNOWN]: 'var(--jv-text-muted)',
};

export default function CommandPalette({
  isOpen,
  onClose,
  searchText,
  onSearchTextChange,
  mode,
  onModeChange,
  matchCount,
  searchOptions,
  onSearchOptionsChange,
  navigateText,
  suggestions,
  selectedSuggestionIndex,
  onNavigateTextChange,
  onSuggestionSelect,
  onSuggestionIndexChange,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (mode === 'navigate' && listRef.current && selectedSuggestionIndex !== undefined) {
      const selected = listRef.current.children[selectedSuggestionIndex] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedSuggestionIndex, mode]);

  if (!isOpen) return null;

  const isNavigate = mode === 'navigate';
  const currentInput = isNavigate ? (navigateText ?? '') : searchText;
  const handleInputChange = isNavigate
    ? (text: string) => onNavigateTextChange?.(text)
    : onSearchTextChange;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isNavigate || !suggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = ((selectedSuggestionIndex ?? 0) + 1) % suggestions.length;
      onSuggestionIndexChange?.(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = ((selectedSuggestionIndex ?? 0) - 1 + suggestions.length) % suggestions.length;
      onSuggestionIndexChange?.(prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = selectedSuggestionIndex ?? 0;
      if (suggestions[idx]) {
        onSuggestionSelect?.(suggestions[idx].path);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const idx = selectedSuggestionIndex ?? 0;
      if (suggestions[idx]) {
        onNavigateTextChange?.(suggestions[idx].pathString + '.');
      }
    }
  };

  const modes = [
    { key: 'search' as const, label: 'Search' },
    { key: 'filter' as const, label: 'Filter' },
    { key: 'navigate' as const, label: 'Navigate' },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] jv-animate-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-xl rounded-xl shadow-2xl border overflow-hidden jv-animate-scale-in"
        style={{
          background: 'var(--jv-bg-panel)',
          borderColor: 'var(--jv-border)',
        }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--jv-border)' }}>
          <span className="flex-shrink-0" style={{ color: 'var(--jv-accent)' }}><SearchIcon size={20} /></span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isNavigate ? 'Navigate to path (e.g. author.name)...'
              : mode === 'search' ? 'Search keys and values...'
              : 'Filter visible nodes...'
            }
            className="flex-1 bg-transparent text-lg focus:outline-none"
            style={{
              color: 'var(--jv-text-primary)',
              fontFamily: 'var(--jv-font-sans)',
            }}
          />
          {currentInput && (
            <button
              onClick={() => handleInputChange('')}
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--jv-text-muted)' }}
            >
              <XIcon size={16} />
            </button>
          )}
          <kbd
            className="px-2 py-0.5 rounded text-xs border"
            style={{
              background: 'var(--jv-bg-secondary)',
              borderColor: 'var(--jv-border)',
              color: 'var(--jv-text-muted)',
              fontFamily: 'var(--jv-font-mono)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Mode Pills */}
        <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--jv-border)' }}>
          {modes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: mode === key ? 'var(--jv-accent)' : 'var(--jv-bg-secondary)',
                color: mode === key ? '#ffffff' : 'var(--jv-text-secondary)',
                fontFamily: 'var(--jv-font-sans)',
              }}
            >
              {label}
            </button>
          ))}

          {/* Search option toggles — hidden in navigate mode */}
          {!isNavigate && (
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => onSearchOptionsChange({ isCaseSensitive: !searchOptions.isCaseSensitive })}
                className="px-2 py-0.5 rounded text-xs font-mono border transition-all"
                style={{
                  background: searchOptions.isCaseSensitive ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                  borderColor: searchOptions.isCaseSensitive ? 'var(--jv-accent)' : 'var(--jv-border)',
                  color: searchOptions.isCaseSensitive ? 'var(--jv-accent)' : 'var(--jv-text-muted)',
                }}
                title="Match Case"
              >
                Aa
              </button>
              <button
                onClick={() => onSearchOptionsChange({ isRegexEnabled: !searchOptions.isRegexEnabled })}
                className="px-2 py-0.5 rounded text-xs font-mono border transition-all"
                style={{
                  background: searchOptions.isRegexEnabled ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                  borderColor: searchOptions.isRegexEnabled ? 'var(--jv-accent)' : 'var(--jv-border)',
                  color: searchOptions.isRegexEnabled ? 'var(--jv-accent)' : 'var(--jv-text-muted)',
                }}
                title="Regex"
              >
                .*
              </button>
              <button
                onClick={() => onSearchOptionsChange({ isFuzzyEnabled: !searchOptions.isFuzzyEnabled })}
                className="px-2 py-0.5 rounded text-xs font-mono border transition-all"
                style={{
                  background: searchOptions.isFuzzyEnabled ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                  borderColor: searchOptions.isFuzzyEnabled ? 'var(--jv-accent)' : 'var(--jv-border)',
                  color: searchOptions.isFuzzyEnabled ? 'var(--jv-accent)' : 'var(--jv-text-muted)',
                }}
                title="Fuzzy"
              >
                ~
              </button>
              <button
                onClick={() => onSearchOptionsChange({ isKeysOnly: !searchOptions.isKeysOnly })}
                className="px-2 py-0.5 rounded text-xs font-mono border transition-all"
                style={{
                  background: searchOptions.isKeysOnly ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                  borderColor: searchOptions.isKeysOnly ? 'var(--jv-accent)' : 'var(--jv-border)',
                  color: searchOptions.isKeysOnly ? 'var(--jv-accent)' : 'var(--jv-text-muted)',
                }}
                title="Keys Only"
              >
                {'{k}'}
              </button>
            </div>
          )}
        </div>

        {/* Navigate mode: Suggestion list */}
        {isNavigate && suggestions && suggestions.length > 0 && (
          <div
            ref={listRef}
            className="max-h-64 overflow-y-auto"
            style={{ borderBottom: '1px solid var(--jv-border)' }}
          >
            {suggestions.slice(0, 50).map((suggestion, idx) => {
              const isSelected = idx === (selectedSuggestionIndex ?? 0);
              const dotColor = TYPE_DOT_COLORS[suggestion.type] || 'var(--jv-text-muted)';
              const typeLabel = TYPE_STYLES[suggestion.type]?.label || suggestion.type;

              return (
                <div
                  key={suggestion.pathString}
                  className="flex items-center gap-2 px-4 py-1.5 cursor-pointer transition-colors"
                  style={{
                    background: isSelected ? 'var(--jv-bg-active)' : undefined,
                  }}
                  onMouseEnter={() => onSuggestionIndexChange?.(idx)}
                  onClick={() => onSuggestionSelect?.(suggestion.path)}
                >
                  {/* Type-colored dot */}
                  <span
                    className="flex-shrink-0 w-2 h-2 rounded-full"
                    style={{ background: dotColor }}
                  />

                  {/* Path string with bold matched segments */}
                  <span
                    className="flex-1 text-sm truncate"
                    style={{
                      color: 'var(--jv-text-primary)',
                      fontFamily: 'var(--jv-font-mono)',
                    }}
                  >
                    {renderHighlightedPath(suggestion.pathString, navigateText ?? '')}
                  </span>

                  {/* Type badge */}
                  <span
                    className="flex-shrink-0 px-1.5 py-0 text-xs rounded"
                    style={{
                      background: `${dotColor}22`,
                      color: dotColor,
                      border: `1px solid ${dotColor}44`,
                    }}
                  >
                    {typeLabel}
                  </span>

                  {/* Value preview */}
                  {suggestion.preview && (
                    <span
                      className="flex-shrink-0 text-xs truncate max-w-[120px]"
                      style={{ color: 'var(--jv-text-muted)', fontFamily: 'var(--jv-font-mono)' }}
                    >
                      {suggestion.preview}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Navigate mode: empty state */}
        {isNavigate && suggestions && suggestions.length === 0 && navigateText && (
          <div className="px-4 py-4 text-center">
            <span className="text-sm" style={{ color: 'var(--jv-text-muted)' }}>
              No matching paths found
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: 'var(--jv-bg-secondary)' }}>
          <span className="text-xs" style={{ color: 'var(--jv-text-muted)', fontFamily: 'var(--jv-font-sans)' }}>
            {isNavigate ? (
              suggestions && suggestions.length > 0 ? (
                <><span style={{ color: 'var(--jv-text-primary)' }}>{suggestions.length}</span> path{suggestions.length !== 1 ? 's' : ''}</>
              ) : navigateText ? 'No matches' : 'Type a path to navigate...'
            ) : searchText ? (
              <><span style={{ color: 'var(--jv-text-primary)' }}>{matchCount}</span> match{matchCount !== 1 ? 'es' : ''}</>
            ) : (
              'Type to search...'
            )}
          </span>
          <span className="text-xs" style={{ color: 'var(--jv-text-muted)', fontFamily: 'var(--jv-font-mono)' }}>
            {isNavigate ? '↑↓ Navigate  Tab Drill  ⏎ Go' : '⌘K to toggle'}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Highlight matched segments in the path string */
function renderHighlightedPath(pathString: string, input: string) {
  if (!input) return pathString;

  const pathParts = pathString.split('.');
  const inputParts = input.replace(/\.$/, '').split('.');

  return pathParts.map((part, i) => {
    const segment = inputParts[i] || '';
    const isMatched = i < inputParts.length && segment.length > 0;

    return (
      <span key={i}>
        {i > 0 && <span style={{ color: 'var(--jv-text-muted)' }}>.</span>}
        {isMatched ? <b>{part}</b> : part}
      </span>
    );
  });
}
