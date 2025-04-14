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
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

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

  // Handler for color selection
  const handleColorSelect = (nodeId: string, property: string, colorCode: string) => {
    onStyleChange(nodeId, property, colorCode);
    setActiveControl(null);
  };

  // Handler for border width selection
  const handleBorderWidthChange = (nodeId: string, value: number) => {
    onStyleChange(nodeId, 'stroke-width', `${value}px`);
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Node Styles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((node) => (
          <div key={node.id} className="border rounded bg-white p-3 relative">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{node.id}: {node.label || node.id}</div>
            </div>
            
            <div className="flex space-x-2">
              {/* Fill Color Button */}
              <button
                className="w-8 h-8 rounded flex items-center justify-center border hover:bg-gray-100"
                style={{
                  backgroundColor: node.styles.fill || 'white'
                }}
                title="Fill Color"
                onClick={() => setActiveControl({nodeId: node.id, property: 'fill'})}
              >
                <span className="sr-only">Fill</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3-3 3 3 3-3 3 3 3-3 3 3V4a2 2 0 00-2-2H5zm4 6a1 1 0 011-1h2a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Border Color Button */}
              <button
                className="w-8 h-8 rounded flex items-center justify-center border hover:bg-gray-100"
                title="Border Color"
                style={{
                  borderColor: node.styles.stroke || '#000',
                  borderWidth: '2px'
                }}
                onClick={() => setActiveControl({nodeId: node.id, property: 'stroke'})}
              >
                <span className="sr-only">Border</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Text Color Button */}
              <button
                className="w-8 h-8 rounded flex items-center justify-center border hover:bg-gray-100"
                title="Text Color"
                style={{
                  color: node.styles.color || '#000'
                }}
                onClick={() => setActiveControl({nodeId: node.id, property: 'color'})}
              >
                <span className="sr-only">Text</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1h3a1 1 0 110 2h-.17l-1.86 9.87a2 2 0 01-1.96 1.63H6.99a2 2 0 01-1.96-1.63L3.17 6H3a1 1 0 010-2h3V3a1 1 0 011-1h3z" clipRule="evenodd" />
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
            
            {/* Color Picker Popup */}
            {activeControl && activeControl.nodeId === node.id && 
             (activeControl.property === 'fill' || 
              activeControl.property === 'stroke' || 
              activeControl.property === 'color') && (
              <div 
                ref={colorPickerRef}
                className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-30"
                style={{ width: '180px' }}
              >
                <div className="grid grid-cols-6 gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={color.code}
                      title={color.name}
                      style={{ backgroundColor: color.code }}
                      className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                      onClick={() => handleColorSelect(node.id, activeControl.property, color.code)}
                    />
                  ))}
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
