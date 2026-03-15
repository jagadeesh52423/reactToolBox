'use client';
import React, { useState, useRef, useEffect } from 'react';

interface ThemeDefaults {
  fill?: string;
  stroke?: string;
  color?: string;
}

interface GradientStop {
  offset: string;
  color: string;
}

interface NodeGradientDef {
  nodeId: string;
  property: string;
  stops: GradientStop[];
}

interface NodeStylePanelProps {
  nodes: Array<{
    id: string;
    label: string;
    styles: Record<string, string>;
  }>;
  onStyleChange: (nodeId: string, styleProperty: string, value: string) => void;
  onResetStyles: (nodeIds: string[]) => void;
  onResetAllStyles: () => void;
  themeDefaults?: ThemeDefaults;
  nodeGradients: NodeGradientDef[];
  onGradientChange: (nodeId: string, property: string, stops: GradientStop[]) => void;
  onGradientRemove: (nodeIds: string[]) => void;
  renderMode?: 'standard' | 'gradient';
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

const DEFAULT_GRADIENT_STOPS: GradientStop[] = [
  { offset: '0%', color: '#60a5fa' },
  { offset: '100%', color: '#a78bfa' },
];

type StyleProperty = 'fill' | 'stroke' | 'color' | 'stroke-width';

const NodeStylePanel: React.FC<NodeStylePanelProps> = ({
  nodes, onStyleChange, onResetStyles, onResetAllStyles, themeDefaults,
  nodeGradients, onGradientChange, onGradientRemove,
  renderMode = 'standard',
}) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [activeStyleProperty, setActiveStyleProperty] = useState<StyleProperty | null>(null);
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>('solid');
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [gradientStops, setGradientStops] = useState<GradientStop[]>(DEFAULT_GRADIENT_STOPS);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const nodeListRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const nodeIds = new Set(nodes.map(n => n.id));
    setSelectedNodes(prev => prev.filter(id => nodeIds.has(id)));
  }, [nodes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (toolbarRef.current && toolbarRef.current.contains(target)) return;
      if (nodeListRef.current && nodeListRef.current.contains(target)) return;
      setActiveStyleProperty(null);
    };
    if (activeStyleProperty) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [activeStyleProperty]);

  // Load existing gradient when opening color picker
  useEffect(() => {
    if (activeStyleProperty && activeStyleProperty !== 'stroke-width' && selectedNodes.length > 0) {
      const prop = activeStyleProperty;
      const existingGrad = nodeGradients.find(
        g => g.nodeId === selectedNodes[0] && g.property === prop
      );
      if (existingGrad) {
        setGradientStops(existingGrad.stops);
        setColorMode('gradient');
      } else {
        setGradientStops(DEFAULT_GRADIENT_STOPS);
        // In gradient render mode, default to gradient color mode
        setColorMode(renderMode === 'gradient' ? 'gradient' : 'solid');
      }
    }
  }, [activeStyleProperty, selectedNodes, nodeGradients, renderMode]);

  if (nodes.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 italic">
        No nodes detected in your diagram.
      </div>
    );
  }

  const isValidHexColor = (hex: string): boolean => /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);

  const getCurrentColor = (nodeId: string, property: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    const currentColor = node?.styles[property];
    if (currentColor) return currentColor;
    if (property === 'fill') return themeDefaults?.fill || '#ffffff';
    if (property === 'stroke') return themeDefaults?.stroke || '#000000';
    if (property === 'color') return themeDefaults?.color || '#000000';
    return '#000000';
  };

  const handleNodeToggle = (nodeId: string) => {
    setSelectedNodes(prev => prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]);
  };

  const handleSelectAll = () => { setSelectedNodes(nodes.map(n => n.id)); };
  const handleClearSelection = () => { setSelectedNodes([]); setActiveStyleProperty(null); };

  const handleToolbarStyleClick = (property: StyleProperty) => {
    if (selectedNodes.length === 0) return;
    if (activeStyleProperty === property) { setActiveStyleProperty(null); return; }
    if (property !== 'stroke-width') {
      const currentColor = getCurrentColor(selectedNodes[0], property);
      setCustomHex(currentColor);
      setHexInput(currentColor);
    } else {
      const firstNode = nodes.find(n => n.id === selectedNodes[0]);
      const width = parseInt(firstNode?.styles['stroke-width']?.replace('px', '') || '1');
      setSliderValue(width);
    }
    setActiveStyleProperty(property);
  };

  const applyStyleToSelected = (property: string, value: string) => {
    selectedNodes.forEach(nodeId => { onStyleChange(nodeId, property, value); });
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

  const handleHexKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleHexSubmit(); };

  const handleBorderWidthChange = (value: number) => {
    setSliderValue(value);
    selectedNodes.forEach(nodeId => { onStyleChange(nodeId, 'stroke-width', `${value}px`); });
  };

  // Gradient helpers
  const addGradientStop = () => {
    if (gradientStops.length >= 5) return;
    const lastColor = gradientStops[gradientStops.length - 1]?.color || '#000000';
    const newStops = [...gradientStops, { offset: '100%', color: lastColor }];
    setGradientStops(newStops.map((s, i) => ({ ...s, offset: `${Math.round((i / (newStops.length - 1)) * 100)}%` })));
  };

  const removeGradientStop = (index: number) => {
    if (gradientStops.length <= 2) return;
    const newStops = gradientStops.filter((_, i) => i !== index);
    setGradientStops(newStops.map((s, i) => ({ ...s, offset: `${Math.round((i / (newStops.length - 1)) * 100)}%` })));
  };

  const updateStopColor = (index: number, color: string) => {
    setGradientStops(prev => prev.map((s, i) => i === index ? { ...s, color } : s));
  };

  const applyGradientToSelected = () => {
    if (!activeStyleProperty) return;
    selectedNodes.forEach(nodeId => {
      onGradientChange(nodeId, activeStyleProperty, gradientStops);
    });
  };

  const removeGradientFromSelected = () => {
    onGradientRemove(selectedNodes);
  };

  const getGradientCss = (stops: GradientStop[]) =>
    `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.offset}`).join(', ')})`;

  const hasSelection = selectedNodes.length > 0;
  const isDisabled = !hasSelection;
  const isColorPicker = activeStyleProperty === 'fill' || activeStyleProperty === 'stroke' || activeStyleProperty === 'color';
  const selectedHaveGradients = activeStyleProperty
    ? selectedNodes.some(id => nodeGradients.some(g => g.nodeId === id && g.property === activeStyleProperty))
    : selectedNodes.some(id => nodeGradients.some(g => g.nodeId === id));

  return (
    <div>
      {/* Sticky Style Toolbar */}
      <div ref={toolbarRef} className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-600 pb-3 -mx-4 px-4 pt-0">
        {/* Selection info + actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {hasSelection && (
              <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleSelectAll} className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700">Select All</button>
            <button onClick={handleClearSelection} className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700">Clear</button>
            {(() => {
              const nodesWithStyles = nodes.filter(n => Object.keys(n.styles).length > 0);
              const hasAnyOverrides = nodesWithStyles.length > 0 || nodeGradients.length > 0;
              return (
                <button
                  onClick={() => {
                    onResetAllStyles();
                    setActiveStyleProperty(null);
                  }}
                  className="text-xs px-2 py-1 rounded border text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800/40"
                  title="Remove all manual style overrides (nodes &amp; edges) so theme styles apply"
                >Reset Manual Styles</button>
              );
            })()}
          </div>
        </div>

        {/* Style buttons */}
        <div className="flex gap-2 mb-0">
          <button onClick={() => handleToolbarStyleClick('fill')} disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${activeStyleProperty === 'fill' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Fill Color" aria-label="Fill Color">
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
          <button onClick={() => handleToolbarStyleClick('stroke')} disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${activeStyleProperty === 'stroke' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Stroke Color" aria-label="Stroke Color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Stroke
          </button>
          <button onClick={() => handleToolbarStyleClick('color')} disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${activeStyleProperty === 'color' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Text Color" aria-label="Text Color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.62,12L12,5.67L14.38,12M11,3L5.5,17H7.75L8.87,14H15.13L16.25,17H18.5L13,3H11Z"/>
            </svg>
            Text
          </button>
          <button onClick={() => handleToolbarStyleClick('stroke-width')} disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${activeStyleProperty === 'stroke-width' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Border Width" aria-label="Border Width">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            Width
          </button>
        </div>

        {/* Color picker — mode-aware */}
        {mounted && isColorPicker && (
          <div className="mt-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-600 rounded-b-lg p-3">
            {renderMode === 'standard' ? (
              /* Standard mode: solid color picker only — no tabs */
              <>
                <div className="grid grid-cols-9 gap-1 mb-3">
                  {COLORS.map((color) => (
                    <button key={color.code} title={color.name} style={{ backgroundColor: color.code }}
                      className="w-7 h-7 rounded-full hover:scale-110 transition-transform border border-gray-200 dark:border-slate-600"
                      onClick={() => handlePresetColorClick(color.code)} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={customHex} onChange={(e) => { setCustomHex(e.target.value); setHexInput(e.target.value); }}
                    className="w-9 h-9 rounded border border-gray-300 dark:border-slate-600 cursor-pointer flex-shrink-0" />
                  <input type="text" value={hexInput} onChange={(e) => setHexInput(e.target.value)} onKeyDown={handleHexKeyDown}
                    placeholder="#hex" className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 font-mono" maxLength={7} />
                  <button onClick={() => { if (hexInput) handleHexSubmit(); else handlePickerApply(); }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex-shrink-0">Apply</button>
                </div>
              </>
            ) : (
              /* Gradient mode: 2 color pickers (from/to) — no tabs */
              <>
                {/* Gradient preview bar */}
                <div className="h-5 rounded-lg mb-3 border border-gray-300 dark:border-slate-600"
                  style={{ background: getGradientCss(gradientStops) }} />

                {/* Two color pickers: From and To */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-slate-400 w-10 flex-shrink-0">From</span>
                    <input type="color" value={gradientStops[0]?.color || '#60a5fa'} onChange={(e) => updateStopColor(0, e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-slate-600 cursor-pointer flex-shrink-0" />
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-mono flex-1">{gradientStops[0]?.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-slate-400 w-10 flex-shrink-0">To</span>
                    <input type="color" value={gradientStops[gradientStops.length - 1]?.color || '#a78bfa'} onChange={(e) => updateStopColor(gradientStops.length - 1, e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-slate-600 cursor-pointer flex-shrink-0" />
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-mono flex-1">{gradientStops[gradientStops.length - 1]?.color}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex-1" />
                  {selectedHaveGradients && (
                    <button onClick={removeGradientFromSelected}
                      className="text-xs px-2 py-1 rounded border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      Remove
                    </button>
                  )}
                  <button onClick={applyGradientToSelected}
                    className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                    Apply Gradient
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Border width slider */}
        {mounted && activeStyleProperty === 'stroke-width' && (
          <div className="mt-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-600 rounded-b-lg p-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Border Width: {sliderValue}px</label>
            <input type="range" min="1" max="10" value={sliderValue} onChange={(e) => handleBorderWidthChange(parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600 dark:text-slate-400">1px</span>
              <span className="text-xs text-gray-600 dark:text-slate-400">10px</span>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Node List */}
      <div ref={nodeListRef} className="mt-3">
        {nodes.map((node) => {
          const isSelected = selectedNodes.includes(node.id);
          const fillColor = node.styles.fill;
          const strokeColor = node.styles.stroke;
          const textColor = node.styles.color;
          const fillGrad = nodeGradients.find(g => g.nodeId === node.id && g.property === 'fill');

          return (
            <div key={node.id} onClick={() => handleNodeToggle(node.id)}
              className={`flex items-center gap-2 py-2 px-3 border rounded-lg mb-1 cursor-pointer transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
              <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none" aria-label={`Select ${node.id}`} />
              <span className="font-medium text-sm text-gray-900 dark:text-slate-100 truncate flex-1">{node.id}: {node.label || node.id}</span>
              <div className="flex gap-1.5 items-center ml-auto shrink-0">
                {fillGrad ? (
                  <div className="w-6 h-3 rounded border border-gray-300 dark:border-slate-500" style={{ background: getGradientCss(fillGrad.stops) }} title="Fill gradient" />
                ) : (
                  <div className={`w-3 h-3 rounded-full border ${fillColor ? 'border-gray-300 dark:border-slate-500' : 'border-dashed border-gray-300 dark:border-slate-500'}`}
                    style={{ backgroundColor: fillColor || '#fff' }} title={`Fill: ${fillColor || 'none'}`} />
                )}
                <div className={`w-3 h-3 rounded-full border-2 bg-transparent ${!strokeColor ? 'border-dashed' : ''}`}
                  style={{ borderColor: strokeColor || '#999' }} title={`Stroke: ${strokeColor || 'none'}`} />
                <span className="text-xs font-bold leading-none" style={{ color: textColor || '#000' }} title={`Text: ${textColor || 'none'}`}>A</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NodeStylePanel;
