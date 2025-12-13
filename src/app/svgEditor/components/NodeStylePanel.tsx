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

const NodeStylePanel: React.FC<NodeStylePanelProps> = ({ nodes, onStyleChange }) => {
  const [activeControl, setActiveControl] = useState<{nodeId: string, property: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'presets' | 'picker' | 'hex'>('presets');
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('');
  const [mounted, setMounted] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close controls when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) &&
        (sliderRef.current && !sliderRef.current.contains(event.target as Node))
      ) {
        setActiveControl(null);
      }
    };

    if (activeControl) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeControl]);

  if (nodes.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 italic">
        No nodes detected in your diagram.
      </div>
    );
  }

  // Validate hex color format
  const isValidHexColor = (hex: string) => {
    return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
  };

  // Get current color value for a node property
  const getCurrentColor = (nodeId: string, property: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    const currentColor = node?.styles[property];
    return currentColor || (property === 'fill' ? '#ffffff' : '#000000');
  };

  // Handler for opening/toggling color control (set current values)
  const handleColorControlOpen = (nodeId: string, property: string) => {
    // If clicking the same button that's already active, close it
    if (activeControl?.nodeId === nodeId && activeControl?.property === property) {
      setActiveControl(null);
      return;
    }

    // Otherwise, open the color picker with current values
    const currentColor = getCurrentColor(nodeId, property);
    setCustomHex(currentColor);
    setHexInput(currentColor);
    setActiveControl({nodeId, property});
  };

  // Handler for color selection
  const handleColorSelect = (nodeId: string, property: string, colorCode: string) => {
    onStyleChange(nodeId, property, colorCode);
    setActiveControl(null);
  };

  // Handle color picker change
  const handleColorPickerChange = (nodeId: string, property: string, color: string) => {
    setCustomHex(color);
    onStyleChange(nodeId, property, color);
    setActiveControl(null);
  };

  // Handle hex input submission
  const handleHexSubmit = (nodeId: string, property: string) => {
    const hex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (isValidHexColor(hex)) {
      onStyleChange(nodeId, property, hex);
      setCustomHex(hex);
      setHexInput('');
      setActiveControl(null);
    } else {
      alert('Please enter a valid hex color (e.g., #FF5733 or FF5733)');
    }
  };

  // Handle enter key in hex input
  const handleHexKeyPress = (e: React.KeyboardEvent, nodeId: string, property: string) => {
    if (e.key === 'Enter') {
      handleHexSubmit(nodeId, property);
    }
  };

  // Handler for border width selection
  const handleBorderWidthChange = (nodeId: string, value: number) => {
    onStyleChange(nodeId, 'stroke-width', `${value}px`);
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Node Styles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" style={{ overflow: 'visible' }}>
        {nodes.map((node) => (
          <div key={node.id} className="border rounded bg-white p-3 relative overflow-visible">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{node.id}: {node.label || node.id}</div>
            </div>
            
            <div className="flex space-x-2">
              {/* Fill Color Button */}
              <button
                className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${
                  activeControl?.nodeId === node.id && activeControl?.property === 'fill'
                    ? 'border-blue-400 border-2 shadow-md'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: node.styles.fill || 'white'
                }}
                title="Background Fill Color"
                onClick={() => handleColorControlOpen(node.id, 'fill')}
              >
                <span className="sr-only">Fill</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.5,17.15 10.47,17.15 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"/>
                </svg>
              </button>
              
              {/* Border Color Button */}
              <button
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                  activeControl?.nodeId === node.id && activeControl?.property === 'stroke'
                    ? 'border-blue-400 border-2 shadow-md bg-blue-50'
                    : 'hover:bg-gray-100'
                }`}
                title="Border Color"
                style={{
                  borderColor: activeControl?.nodeId === node.id && activeControl?.property === 'stroke'
                    ? '#60a5fa'
                    : node.styles.stroke || '#000',
                  borderWidth: '2px'
                }}
                onClick={() => handleColorControlOpen(node.id, 'stroke')}
              >
                <span className="sr-only">Border</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Text Color Button */}
              <button
                className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${
                  activeControl?.nodeId === node.id && activeControl?.property === 'color'
                    ? 'border-blue-400 border-2 shadow-md bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                title="Text Color"
                style={{
                  color: node.styles.color || '#000'
                }}
                onClick={() => handleColorControlOpen(node.id, 'color')}
              >
                <span className="sr-only">Text</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.62,12L12,5.67L14.38,12M11,3L5.5,17H7.75L8.87,14H15.13L16.25,17H18.5L13,3H11Z"/>
                </svg>
              </button>
              
              {/* Border Width Button */}
              <button
                className="w-8 h-8 rounded flex items-center justify-center border hover:bg-gray-100"
                title="Border Width"
                onClick={() => setActiveControl({nodeId: node.id, property: 'stroke-width'})}
              >
                <span className="sr-only">Width</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            
            {/* Enhanced Color Picker Popup */}
            {mounted && activeControl && activeControl.nodeId === node.id &&
             (activeControl.property === 'fill' ||
              activeControl.property === 'stroke' ||
              activeControl.property === 'color') && (
              <div
                ref={colorPickerRef}
                className="absolute bg-white border rounded-lg shadow-xl z-50"
                style={{
                  width: '320px',
                  top: '100%',
                  left: '0',
                  marginTop: '12px',
                  transform: 'translateX(0)'
                }}
              >
                {/* Chat bubble arrow pointing up to the button */}
                <div
                  className="absolute -top-2 w-4 h-4 bg-white border-l border-t transform rotate-45 z-10"
                  style={{
                    left: activeControl.property === 'fill' ? '20px' :
                          activeControl.property === 'stroke' ? '60px' :
                          activeControl.property === 'color' ? '100px' : '20px'
                  }}
                ></div>

                {/* Header showing what we're changing */}
                <div className="bg-blue-50 px-4 py-2 rounded-t-lg border-b">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                      {activeControl.property === 'fill' && (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.5,17.15 10.47,17.15 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"/>
                          </svg>
                          <span>Background Fill Color</span>
                        </>
                      )}
                      {activeControl.property === 'stroke' && (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span>Border Color</span>
                        </>
                      )}
                      {activeControl.property === 'color' && (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9.62,12L12,5.67L14.38,12M11,3L5.5,17H7.75L8.87,14H15.13L16.25,17H18.5L13,3H11Z"/>
                          </svg>
                          <span>Text Color</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {node.id}
                    </div>
                  </div>
                </div>

                <div className="p-3">
                {/* Tab buttons */}
                <div className="flex mb-3 border-b">
                  <button
                    className={`px-3 py-1 text-sm ${activeTab === 'presets' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('presets')}
                  >
                    Presets
                  </button>
                  <button
                    className={`px-3 py-1 text-sm ${activeTab === 'picker' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('picker')}
                  >
                    Color Picker
                  </button>
                  <button
                    className={`px-3 py-1 text-sm ${activeTab === 'hex' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
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
                          className="w-7 h-7 rounded-full hover:scale-110 transition-transform border border-gray-200"
                          onClick={() => handleColorSelect(node.id, activeControl.property, color.code)}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Click any preset color to apply</p>
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
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">{customHex}</div>
                        <button
                          onClick={() => handleColorPickerChange(node.id, activeControl.property, customHex)}
                          className="mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          Apply Color
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
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
                          onKeyPress={(e) => handleHexKeyPress(e, node.id, activeControl.property)}
                          placeholder="Enter hex color (e.g., FF5733)"
                          className="flex-1 px-2 py-1 border rounded text-sm"
                          maxLength={7}
                        />
                        <button
                          onClick={() => handleHexSubmit(node.id, activeControl.property)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          Apply
                        </button>
                      </div>
                      {hexInput && (
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{
                              backgroundColor: (() => {
                                const normalizedHex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
                                return isValidHexColor(normalizedHex) ? normalizedHex : '#ffffff';
                              })()
                            }}
                          ></div>
                          <span className="text-sm text-gray-600">
                            {(() => {
                              const normalizedHex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
                              return isValidHexColor(normalizedHex) ? 'Valid color' : 'Invalid format';
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Enter with or without # (e.g., FF5733 or #FF5733)</p>
                      <p>Press Enter or click Apply</p>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
            
            {/* Border Width Slider */}
            {activeControl && activeControl.nodeId === node.id && 
             activeControl.property === 'stroke-width' && (
              <div 
                ref={sliderRef}
                className="absolute top-full left-0 mt-1 p-3 bg-white border rounded-lg shadow-lg z-30"
                style={{ width: '200px' }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Width: {node.styles['stroke-width']?.replace('px', '') || '1'} px
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={parseInt(node.styles['stroke-width']?.replace('px', '') || '1')}
                  onChange={(e) => handleBorderWidthChange(node.id, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs">1px</span>
                  <span className="text-xs">10px</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeStylePanel;
