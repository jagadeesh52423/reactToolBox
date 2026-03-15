'use client';
import React, { useState, useRef, useEffect } from 'react';

interface NodeStylePanelProps {
  nodes: Array<{
    id: string;
    label: string;
    styles: Record<string, string>;
  }>;
  onStyleChange: (nodeId: string, styleProperty: string, value: string) => void;
}

const COLORS = [
  { name: 'Red', code: '#f87171' },
  { name: 'Orange', code: '#fb923c' },
  { name: 'Amber', code: '#fbbf24' },
  { name: 'Yellow', code: '#fde047' },
  { name: 'Lime', code: '#a3e635' },
  { name: 'Green', code: '#4ade80' },
  { name: 'Emerald', code: '#34d399' },
  { name: 'Teal', code: '#2dd4bf' },
  { name: 'Cyan', code: '#22d3ee' },
  { name: 'Sky', code: '#38bdf8' },
  { name: 'Blue', code: '#60a5fa' },
  { name: 'Indigo', code: '#818cf8' },
  { name: 'Violet', code: '#a78bfa' },
  { name: 'Purple', code: '#c084fc' },
  { name: 'Fuchsia', code: '#e879f9' },
  { name: 'Pink', code: '#f472b6' },
  { name: 'Rose', code: '#fb7185' },
];

type StyleProperty = 'fill' | 'stroke' | 'color' | 'stroke-width';

const NodeStylePanel: React.FC<NodeStylePanelProps> = ({ nodes, onStyleChange }) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [activeStyleProperty, setActiveStyleProperty] = useState<StyleProperty | null>(null);
  const [activeTab, setActiveTab] = useState<'presets' | 'picker' | 'hex'>('presets');
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const nodeListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clean up stale selections when nodes change
  useEffect(() => {
    const nodeIds = new Set(nodes.map(n => n.id));
    setSelectedNodes(prev => prev.filter(id => nodeIds.has(id)));
  }, [nodes]);

  // Close picker when clicking outside the toolbar zone
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Don't close picker when clicking inside toolbar or node list
      if (toolbarRef.current && toolbarRef.current.contains(target)) return;
      if (nodeListRef.current && nodeListRef.current.contains(target)) return;
      setActiveStyleProperty(null);
    };

    if (activeStyleProperty) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeStyleProperty]);

  if (nodes.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 italic">
        No nodes detected in your diagram.
      </div>
    );
  }

  const isValidHexColor = (hex: string): boolean => {
    return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
  };

  const getCurrentColor = (nodeId: string, property: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    const currentColor = node?.styles[property];
    return currentColor || (property === 'fill' ? '#ffffff' : '#000000');
  };

  // Toggle node selection without deselecting others
  const handleNodeToggle = (nodeId: string) => {
    setSelectedNodes(prev =>
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedNodes(nodes.map(n => n.id));
  };

  const handleClearSelection = () => {
    setSelectedNodes([]);
    setActiveStyleProperty(null);
  };

  // Open/toggle a style property in the toolbar
  const handleToolbarStyleClick = (property: StyleProperty) => {
    if (selectedNodes.length === 0) return;

    if (activeStyleProperty === property) {
      // Toggle off
      setActiveStyleProperty(null);
      return;
    }

    // Initialize picker state from first selected node's current value
    if (property !== 'stroke-width') {
      const currentColor = getCurrentColor(selectedNodes[0], property);
      setCustomHex(currentColor);
      setHexInput(currentColor);
    } else {
      // Initialize slider from first selected node's stroke-width
      const firstNode = nodes.find(n => n.id === selectedNodes[0]);
      const width = parseInt(firstNode?.styles['stroke-width']?.replace('px', '') || '1');
      setSliderValue(width);
    }

    setActiveStyleProperty(property);
  };

  // Apply a style value to all selected nodes, then close picker
  const applyStyleToSelected = (property: string, value: string) => {
    selectedNodes.forEach(nodeId => {
      onStyleChange(nodeId, property, value);
    });
    setActiveStyleProperty(null);
  };

  const handlePresetColorClick = (colorCode: string) => {
    if (!activeStyleProperty || activeStyleProperty === 'stroke-width') return;
    applyStyleToSelected(activeStyleProperty, colorCode);
  };

  const handlePickerApply = () => {
    if (!activeStyleProperty || activeStyleProperty === 'stroke-width') return;
    applyStyleToSelected(activeStyleProperty, customHex);
  };

  const handleHexSubmit = () => {
    if (!activeStyleProperty || activeStyleProperty === 'stroke-width') return;
    const hex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (isValidHexColor(hex)) {
      setCustomHex(hex);
      setHexInput('');
      applyStyleToSelected(activeStyleProperty, hex);
    } else {
      alert('Please enter a valid hex color (e.g., #FF5733 or FF5733)');
    }
  };

  const handleHexKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHexSubmit();
    }
  };

  const handleBorderWidthChange = (value: number) => {
    setSliderValue(value);
    selectedNodes.forEach(nodeId => {
      onStyleChange(nodeId, 'stroke-width', `${value}px`);
    });
    // Do NOT close slider -- allow dragging
  };

  const hasSelection = selectedNodes.length > 0;
  const isDisabled = !hasSelection;

  return (
    <div>
      {/* Zone 1: Sticky Style Toolbar */}
      <div
        ref={toolbarRef}
        className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-600 pb-3 -mx-4 px-4 pt-0"
      >
        {/* Row 1: Selection info + actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {hasSelection && (
              <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSelectAll}
              className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Select All
            </button>
            <button
              onClick={handleClearSelection}
              className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Row 2: Style buttons */}
        <div className="flex gap-2 mb-0">
          {/* Fill button */}
          <button
            onClick={() => handleToolbarStyleClick('fill')}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${
              activeStyleProperty === 'fill'
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300'
                : isDisabled
                  ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500'
                  : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
            title="Fill Color"
            aria-label="Fill Color"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a10 10 0 0 1 7.07 2.93l-4.24 4.24A4 4 0 0 0 12 8V2z" className="fill-amber-400"/>
              <path d="M19.07 4.93A10 10 0 0 1 22 12h-6a4 4 0 0 0-1.17-2.83l4.24-4.24z" className="fill-orange-500"/>
              <path d="M22 12a10 10 0 0 1-2.93 7.07l-4.24-4.24A4 4 0 0 0 16 12h6z" className="fill-red-500"/>
              <path d="M19.07 19.07A10 10 0 0 1 12 22v-6a4 4 0 0 0 2.83-1.17l4.24 4.24z" className="fill-pink-500"/>
              <path d="M12 22a10 10 0 0 1-7.07-2.93l4.24-4.24A4 4 0 0 0 12 16v6z" className="fill-purple-500"/>
              <path d="M4.93 19.07A10 10 0 0 1 2 12h6a4 4 0 0 0 1.17 2.83l-4.24 4.24z" className="fill-blue-500"/>
              <path d="M2 12a10 10 0 0 1 2.93-7.07l4.24 4.24A4 4 0 0 0 8 12H2z" className="fill-cyan-500"/>
              <path d="M4.93 4.93A10 10 0 0 1 12 2v6a4 4 0 0 0-2.83 1.17L4.93 4.93z" className="fill-green-500"/>
              <circle cx="12" cy="12" r="3" className="fill-white dark:fill-slate-700 stroke-gray-300 dark:stroke-slate-500" strokeWidth="0.5"/>
            </svg>
            Fill
          </button>

          {/* Stroke button */}
          <button
            onClick={() => handleToolbarStyleClick('stroke')}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${
              activeStyleProperty === 'stroke'
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300'
                : isDisabled
                  ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500'
                  : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
            title="Stroke Color"
            aria-label="Stroke Color"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Stroke
          </button>

          {/* Text Color button */}
          <button
            onClick={() => handleToolbarStyleClick('color')}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${
              activeStyleProperty === 'color'
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300'
                : isDisabled
                  ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500'
                  : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
            title="Text Color"
            aria-label="Text Color"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.62,12L12,5.67L14.38,12M11,3L5.5,17H7.75L8.87,14H15.13L16.25,17H18.5L13,3H11Z"/>
            </svg>
            Text
          </button>

          {/* Border Width button */}
          <button
            onClick={() => handleToolbarStyleClick('stroke-width')}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${
              activeStyleProperty === 'stroke-width'
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300'
                : isDisabled
                  ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500'
                  : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
            title="Border Width"
            aria-label="Border Width"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Width
          </button>
        </div>

        {/* Row 3: Expandable picker area */}
        {mounted && activeStyleProperty && activeStyleProperty !== 'stroke-width' && (
          <div className="mt-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-600 rounded-b-lg p-3">
            {/* Tab buttons */}
            <div className="flex mb-3 border-b border-gray-200 dark:border-slate-600">
              <button
                className={`px-3 py-1 text-sm ${activeTab === 'presets' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}
                onClick={() => setActiveTab('presets')}
              >
                Presets
              </button>
              <button
                className={`px-3 py-1 text-sm ${activeTab === 'picker' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}
                onClick={() => setActiveTab('picker')}
              >
                Color Picker
              </button>
              <button
                className={`px-3 py-1 text-sm ${activeTab === 'hex' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}
                onClick={() => setActiveTab('hex')}
              >
                Hex Input
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'presets' && (
              <div>
                <div className="grid grid-cols-8 gap-1 mb-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.code}
                      title={color.name}
                      style={{ backgroundColor: color.code }}
                      className="w-7 h-7 rounded-full hover:scale-110 transition-transform border border-gray-200 dark:border-slate-600"
                      onClick={() => handlePresetColorClick(color.code)}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  <p>Click any preset color to apply to {selectedNodes.length} selected node{selectedNodes.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {activeTab === 'picker' && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-slate-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-slate-300">{customHex}</div>
                    <button
                      onClick={handlePickerApply}
                      className="mt-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    >
                      Apply Color
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  <p>Click the color square to open the color picker</p>
                </div>
              </div>
            )}

            {activeTab === 'hex' && (
              <div>
                <div className="mb-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => setHexInput(e.target.value)}
                      onKeyDown={handleHexKeyDown}
                      placeholder="Enter hex color (e.g., FF5733)"
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      maxLength={7}
                    />
                    <button
                      onClick={handleHexSubmit}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    >
                      Apply
                    </button>
                  </div>
                  {hexInput && (
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300 dark:border-slate-600"
                        style={{
                          backgroundColor: (() => {
                            const normalizedHex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
                            return isValidHexColor(normalizedHex) ? normalizedHex : '#ffffff';
                          })()
                        }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        {(() => {
                          const normalizedHex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
                          return isValidHexColor(normalizedHex) ? 'Valid color' : 'Invalid format';
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  <p>Enter with or without # (e.g., FF5733 or #FF5733)</p>
                  <p>Press Enter or click Apply</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Border width slider in toolbar */}
        {mounted && activeStyleProperty === 'stroke-width' && (
          <div className="mt-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-600 rounded-b-lg p-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Border Width: {sliderValue}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={sliderValue}
              onChange={(e) => handleBorderWidthChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600 dark:text-slate-400">1px</span>
              <span className="text-xs text-gray-600 dark:text-slate-400">10px</span>
            </div>
          </div>
        )}
      </div>

      {/* Zone 2: Scrollable Node List */}
      <div ref={nodeListRef} className="mt-3">
        {nodes.map((node) => {
          const isSelected = selectedNodes.includes(node.id);
          const fillColor = node.styles.fill;
          const strokeColor = node.styles.stroke;
          const textColor = node.styles.color;

          return (
            <div
              key={node.id}
              onClick={() => handleNodeToggle(node.id)}
              className={`flex items-center gap-2 py-2 px-3 border rounded-lg mb-1 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                aria-label={`Select ${node.id}`}
              />

              {/* Node label */}
              <span className="font-medium text-sm text-gray-900 dark:text-slate-100 truncate flex-1">
                {node.id}: {node.label || node.id}
              </span>

              {/* Color preview dots */}
              <div className="flex gap-1.5 items-center ml-auto shrink-0">
                {/* Fill dot */}
                <div
                  className={`w-3 h-3 rounded-full border ${fillColor ? 'border-gray-300 dark:border-slate-500' : 'border-dashed border-gray-300 dark:border-slate-500'}`}
                  style={{ backgroundColor: fillColor || '#fff' }}
                  title={`Fill: ${fillColor || 'none'}`}
                />
                {/* Stroke ring */}
                <div
                  className={`w-3 h-3 rounded-full border-2 bg-transparent ${!strokeColor ? 'border-dashed' : ''}`}
                  style={{ borderColor: strokeColor || '#999' }}
                  title={`Stroke: ${strokeColor || 'none'}`}
                />
                {/* Text color "A" */}
                <span
                  className="text-xs font-bold leading-none"
                  style={{ color: textColor || '#000' }}
                  title={`Text: ${textColor || 'none'}`}
                >
                  A
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NodeStylePanel;
