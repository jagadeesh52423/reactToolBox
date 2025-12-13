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
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  // Handle node selection (with multi-select support)
  const handleNodeSelection = (nodeId: string, event: React.MouseEvent) => {
    const isMultiSelect = event.ctrlKey || event.metaKey;

    if (isMultiSelect) {
      // Toggle selection for this node
      setSelectedNodes(prev =>
        prev.includes(nodeId)
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    } else {
      // Single select (clear others)
      setSelectedNodes([nodeId]);
    }
  };

  // Handler for opening/toggling color control (set current values)
  const handleColorControlOpen = (nodeId: string, property: string, event?: React.MouseEvent) => {
    // Handle node selection if event is provided
    if (event) {
      const isMultiSelect = event.ctrlKey || event.metaKey;

      // Always allow toggle behavior when Ctrl/Cmd is held
      if (isMultiSelect) {
        handleNodeSelection(nodeId, event);
      } else {
        // For regular clicks, preserve multi-selection if this node is already selected
        if (selectedNodes.length > 1 && selectedNodes.includes(nodeId)) {
          // Keep existing selection for bulk operation
        } else {
          // Handle single selection
          handleNodeSelection(nodeId, event);
        }
      }
    }

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

  // Apply color to selected nodes (bulk operation)
  const applyColorToSelected = (property: string, colorCode: string) => {
    const targetNodes = selectedNodes.length > 0 ? selectedNodes : [activeControl?.nodeId].filter(Boolean);

    targetNodes.forEach(nodeId => {
      if (nodeId) {
        onStyleChange(nodeId, property, colorCode);
      }
    });
  };

  // Handler for color selection
  const handleColorSelect = (nodeId: string, property: string, colorCode: string) => {
    if (selectedNodes.length > 1) {
      // Bulk operation: apply to all selected nodes
      applyColorToSelected(property, colorCode);
    } else {
      // Single node operation
      onStyleChange(nodeId, property, colorCode);
    }
    setActiveControl(null);
  };

  // Handle color picker change
  const handleColorPickerChange = (nodeId: string, property: string, color: string) => {
    setCustomHex(color);

    if (selectedNodes.length > 1) {
      // Bulk operation: apply to all selected nodes
      applyColorToSelected(property, color);
    } else {
      // Single node operation
      onStyleChange(nodeId, property, color);
    }
    setActiveControl(null);
  };

  // Handle hex input submission
  const handleHexSubmit = (nodeId: string, property: string) => {
    const hex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (isValidHexColor(hex)) {
      if (selectedNodes.length > 1) {
        // Bulk operation: apply to all selected nodes
        applyColorToSelected(property, hex);
      } else {
        // Single node operation
        onStyleChange(nodeId, property, hex);
      }
      setCustomHex(hex);
      setHexInput('');
      setActiveControl(null);
    } else {
      alert('Please enter a valid hex color (e.g., #FF5733 or FF5733)');
    }
  };

  // Handle enter key in hex input
  const handleHexKeyDown = (e: React.KeyboardEvent, nodeId: string, property: string) => {
    if (e.key === 'Enter') {
      handleHexSubmit(nodeId, property);
    }
  };

  // Handler for border width selection
  const handleBorderWidthChange = (nodeId: string, value: number) => {
    if (selectedNodes.length > 1) {
      // Bulk operation: apply to all selected nodes
      selectedNodes.forEach(id => {
        onStyleChange(id, 'stroke-width', `${value}px`);
      });
    } else {
      onStyleChange(nodeId, 'stroke-width', `${value}px`);
    }
  };


  return (
    <div className="bg-gray-50 border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Node Styles</h3>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              List
            </button>
          </div>

          {selectedNodes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {selectedNodes.length} selected
              </span>
              <button
                onClick={() => setSelectedNodes([])}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-3">
        💡 Hold <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl</kbd>/<kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Cmd</kbd> while clicking to select multiple nodes
      </div>

      <div className={viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          : "space-y-3"
        } style={{ overflow: 'visible' }}>
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`border rounded relative overflow-visible transition-all ${
              viewMode === 'grid' ? 'p-3' : 'p-2'
            } ${
              selectedNodes.includes(node.id)
                ? 'border-blue-400 border-2 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {viewMode === 'grid' ? (
              // Grid View Layout
              <>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">{node.id}: {node.label || node.id}</div>
                </div>

                {/* Colors Section */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Colors</div>
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
                      title="Background Fill Color (Hold Ctrl/Cmd for multi-select)"
                      onClick={(e) => handleColorControlOpen(node.id, 'fill', e)}
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
                      title="Border Color (Hold Ctrl/Cmd for multi-select)"
                      style={{
                        borderColor: activeControl?.nodeId === node.id && activeControl?.property === 'stroke'
                          ? '#60a5fa'
                          : node.styles.stroke || '#000',
                        borderWidth: '2px'
                      }}
                      onClick={(e) => handleColorControlOpen(node.id, 'stroke', e)}
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
                      title="Text Color (Hold Ctrl/Cmd for multi-select)"
                      style={{
                        color: node.styles.color || '#000'
                      }}
                      onClick={(e) => handleColorControlOpen(node.id, 'color', e)}
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
                </div>
              </>
            ) : (
              // List View Layout
              <div className="flex items-center justify-between">
                <div className="font-medium">{node.id}: {node.label || node.id}</div>
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
                    title="Background Fill Color (Hold Ctrl/Cmd for multi-select)"
                    onClick={(e) => handleColorControlOpen(node.id, 'fill', e)}
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
                    title="Border Color (Hold Ctrl/Cmd for multi-select)"
                    style={{
                      borderColor: activeControl?.nodeId === node.id && activeControl?.property === 'stroke'
                        ? '#60a5fa'
                        : node.styles.stroke || '#000',
                      borderWidth: '2px'
                    }}
                    onClick={(e) => handleColorControlOpen(node.id, 'stroke', e)}
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
                    title="Text Color (Hold Ctrl/Cmd for multi-select)"
                    style={{
                      color: node.styles.color || '#000'
                    }}
                    onClick={(e) => handleColorControlOpen(node.id, 'color', e)}
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
              </div>
            )}


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
                    <div className="flex items-center gap-2">
                      {selectedNodes.length > 1 ? (
                        <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                          </svg>
                          Bulk: {selectedNodes.length} nodes
                        </div>
                      ) : (
                        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {node.id}
                        </div>
                      )}
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
                          onKeyDown={(e) => handleHexKeyDown(e, node.id, activeControl.property)}
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
