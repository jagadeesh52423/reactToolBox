'use client';
import React, { useState, useRef, useEffect } from 'react';

interface ThemeDefaults {
  stroke?: string;
}

interface GradientStop {
  offset: string;
  color: string;
}

interface EdgeGradientDef {
  edgeIndex: number;
  property: string;
  stops: GradientStop[];
}

interface EdgeStylePanelProps {
  edges: Array<{
    index: number;
    from: string;
    to: string;
    label: string;
    styles: Record<string, string>;
  }>;
  onStyleChange: (edgeIndex: number, styleProperty: string, value: string) => void;
  onLabelChange: (edgeIndex: number, newLabel: string) => void;
  onResetStyles: (edgeIndices: number[]) => void;
  themeDefaults?: ThemeDefaults;
  edgeGradients: EdgeGradientDef[];
  onGradientChange: (edgeIndex: number, property: string, stops: GradientStop[]) => void;
  onGradientRemove: (edgeIndices: number[]) => void;
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

type StyleProperty = 'stroke' | 'color' | 'stroke-width';

const EdgeStylePanel: React.FC<EdgeStylePanelProps> = ({
  edges, onStyleChange, onLabelChange, onResetStyles, themeDefaults,
  edgeGradients, onGradientChange, onGradientRemove,
  renderMode = 'standard',
}) => {
  const [selectedEdges, setSelectedEdges] = useState<number[]>([]);
  const [activeStyleProperty, setActiveStyleProperty] = useState<StyleProperty | null>(null);
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>('solid');
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [gradientStops, setGradientStops] = useState<GradientStop[]>(DEFAULT_GRADIENT_STOPS);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const edgeListRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const edgeIndices = new Set(edges.map(e => e.index));
    setSelectedEdges(prev => prev.filter(idx => edgeIndices.has(idx)));
  }, [edges]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (toolbarRef.current && toolbarRef.current.contains(target)) return;
      if (edgeListRef.current && edgeListRef.current.contains(target)) return;
      setActiveStyleProperty(null);
    };
    if (activeStyleProperty) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [activeStyleProperty]);

  // Load existing gradient when opening color picker
  useEffect(() => {
    if (activeStyleProperty && activeStyleProperty !== 'stroke-width' && selectedEdges.length > 0) {
      const prop = activeStyleProperty;
      const existingGrad = edgeGradients.find(
        g => g.edgeIndex === selectedEdges[0] && g.property === prop
      );
      if (existingGrad) {
        setGradientStops(existingGrad.stops);
        setColorMode('gradient');
      } else {
        setGradientStops(DEFAULT_GRADIENT_STOPS);
        setColorMode(renderMode === 'gradient' ? 'gradient' : 'solid');
      }
    }
  }, [activeStyleProperty, selectedEdges, edgeGradients, renderMode]);

  if (edges.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 italic">
        No edges detected in your diagram.
      </div>
    );
  }

  const isValidHexColor = (hex: string): boolean => /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);

  const getCurrentColor = (edgeIndex: number, property: string): string => {
    const edge = edges.find(e => e.index === edgeIndex);
    const currentColor = edge?.styles[property];
    if (currentColor) return currentColor;
    if (property === 'stroke') return themeDefaults?.stroke || '#000000';
    return '#000000';
  };

  const handleEdgeToggle = (edgeIndex: number) => {
    setSelectedEdges(prev =>
      prev.includes(edgeIndex) ? prev.filter(idx => idx !== edgeIndex) : [...prev, edgeIndex]
    );
  };

  const handleSelectAll = () => { setSelectedEdges(edges.map(e => e.index)); };
  const handleClearSelection = () => { setSelectedEdges([]); setActiveStyleProperty(null); };

  const handleToolbarStyleClick = (property: StyleProperty) => {
    if (selectedEdges.length === 0) return;
    if (activeStyleProperty === property) { setActiveStyleProperty(null); return; }
    if (property === 'stroke' || property === 'color') {
      const currentColor = getCurrentColor(selectedEdges[0], property);
      setCustomHex(currentColor);
      setHexInput(currentColor);
    } else if (property === 'stroke-width') {
      const firstEdge = edges.find(e => e.index === selectedEdges[0]);
      const width = parseInt(firstEdge?.styles['stroke-width']?.replace('px', '') || '1');
      setSliderValue(width);
    }
    setActiveStyleProperty(property);
  };

  const applyStyleToSelected = (property: string, value: string) => {
    selectedEdges.forEach(edgeIndex => { onStyleChange(edgeIndex, property, value); });
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
    const hex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (!isValidHexColor(hex)) { alert('Please enter a valid hex color (e.g., #FF5733 or FF5733)'); return; }
    if (!activeStyleProperty || activeStyleProperty === 'stroke-width') return;
    setCustomHex(hex);
    setHexInput('');
    applyStyleToSelected(activeStyleProperty, hex);
  };

  const handleHexKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleHexSubmit(); };

  const handleBorderWidthChange = (value: number) => {
    setSliderValue(value);
    selectedEdges.forEach(edgeIndex => { onStyleChange(edgeIndex, 'stroke-width', `${value}px`); });
  };

  const startEditingLabel = (edgeIndex: number, currentLabel: string) => {
    setEditingLabel(edgeIndex);
    setLabelInput(currentLabel);
  };

  const saveLabel = () => {
    if (editingLabel !== null) { onLabelChange(editingLabel, labelInput); setEditingLabel(null); setLabelInput(''); }
  };

  const cancelEditingLabel = () => { setEditingLabel(null); setLabelInput(''); };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveLabel();
    else if (e.key === 'Escape') cancelEditingLabel();
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
    selectedEdges.forEach(edgeIndex => {
      onGradientChange(edgeIndex, activeStyleProperty, gradientStops);
    });
  };

  const removeGradientFromSelected = () => {
    onGradientRemove(selectedEdges);
  };

  const getGradientCss = (stops: GradientStop[]) =>
    `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.offset}`).join(', ')})`;

  const hasSelection = selectedEdges.length > 0;
  const isDisabled = !hasSelection;
  const isColorPicker = activeStyleProperty === 'stroke' || activeStyleProperty === 'color';
  const selectedHaveGradients = activeStyleProperty
    ? selectedEdges.some(idx => edgeGradients.some(g => g.edgeIndex === idx && g.property === activeStyleProperty))
    : selectedEdges.some(idx => edgeGradients.some(g => g.edgeIndex === idx));

  return (
    <div>
      {/* Sticky Style Toolbar */}
      <div ref={toolbarRef} className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-600 pb-3 -mx-4 px-4 pt-0">
        {/* Selection info + actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {hasSelection && (
              <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                {selectedEdges.length} edge{selectedEdges.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleSelectAll} className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700">Select All</button>
            <button onClick={handleClearSelection} className="text-xs text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700">Clear</button>
            {(() => {
              const edgesWithStyles = edges.filter(e => Object.keys(e.styles).length > 0);
              const hasAnyOverrides = edgesWithStyles.length > 0 || edgeGradients.length > 0;
              return (
                <button
                  onClick={() => {
                    const targetIndices = hasSelection
                      ? selectedEdges.filter(idx => edgesWithStyles.some(e => e.index === idx) || edgeGradients.some(g => g.edgeIndex === idx))
                      : [...new Set([...edgesWithStyles.map(e => e.index), ...edgeGradients.map(g => g.edgeIndex)])];
                    if (targetIndices.length > 0) { onResetStyles(targetIndices); setActiveStyleProperty(null); }
                  }}
                  disabled={!hasAnyOverrides}
                  className={`text-xs px-2 py-1 rounded border ${hasAnyOverrides ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800/40' : 'text-gray-400 dark:text-slate-600 border-gray-200 dark:border-slate-700 cursor-not-allowed opacity-50'}`}
                  title="Remove manual style overrides so theme styles apply"
                >Reset Styles</button>
              );
            })()}
          </div>
        </div>

        {/* Style buttons */}
        <div className="flex gap-2 mb-0 flex-wrap">
          <button onClick={() => handleToolbarStyleClick('stroke')} disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${activeStyleProperty === 'stroke' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Line Color" aria-label="Line Color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            Color
          </button>
          <button onClick={() => handleToolbarStyleClick('color')} disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${activeStyleProperty === 'color' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Text Color" aria-label="Text Color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21V14.5L18 2l3 3L8.5 19H4z" /><path d="M14.5 5.5l3 3" /></svg>
            Text
          </button>
          <button onClick={() => handleToolbarStyleClick('stroke-width')} disabled={isDisabled}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-all ${activeStyleProperty === 'stroke-width' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300' : isDisabled ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Line Width" aria-label="Line Width">
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
              /* Gradient mode: solid color picker for edges */
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
            )}
          </div>
        )}

        {/* Border width slider */}
        {mounted && activeStyleProperty === 'stroke-width' && (
          <div className="mt-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-600 rounded-b-lg p-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Line Width: {sliderValue}px</label>
            <input type="range" min="1" max="10" value={sliderValue} onChange={(e) => handleBorderWidthChange(parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600 dark:text-slate-400">1px</span>
              <span className="text-xs text-gray-600 dark:text-slate-400">10px</span>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Edge List */}
      <div ref={edgeListRef} className="mt-3">
        {edges.map((edge) => {
          const isSelected = selectedEdges.includes(edge.index);
          const strokeColor = edge.styles.stroke;
          const gradient = edgeGradients.find(g => g.edgeIndex === edge.index && g.property === 'stroke');

          return (
            <div key={edge.index}
              className={`border rounded-lg mb-1 transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
              <div onClick={() => handleEdgeToggle(edge.index)} className="flex items-center gap-2 py-2 px-3 cursor-pointer">
                <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none" aria-label={`Select edge ${edge.index}`} />
                <span className="font-medium text-sm text-gray-900 dark:text-slate-100 truncate flex-1">{edge.from} → {edge.to}</span>
                {gradient ? (
                  <div className="w-10 h-3 rounded-full border border-gray-300 dark:border-slate-500" style={{ background: getGradientCss(gradient.stops) }} title="Gradient applied" />
                ) : (
                  <div className={`w-3 h-3 rounded-full border-2 bg-transparent ${!strokeColor ? 'border-dashed' : ''}`} style={{ borderColor: strokeColor || '#999' }} title={`Stroke: ${strokeColor || 'default'}`} />
                )}
              </div>
              <div className="px-3 pb-2 flex items-center gap-2">
                {editingLabel === edge.index ? (
                  <>
                    <input type="text" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} onKeyDown={handleLabelKeyDown} onBlur={saveLabel} autoFocus
                      className="flex-1 px-2 py-1 text-sm border border-blue-400 dark:border-blue-500 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100" placeholder="Edge label" />
                    <button onClick={saveLabel} className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300" title="Save">✓</button>
                    <button onClick={cancelEditingLabel} className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" title="Cancel">✕</button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-gray-600 dark:text-slate-400 flex-1">Label: {edge.label || '(none)'}</span>
                    <button onClick={(e) => { e.stopPropagation(); startEditingLabel(edge.index, edge.label); }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit label">Edit</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EdgeStylePanel;
