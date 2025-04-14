'use client';
import React, { useState, useEffect, useRef } from 'react';

interface ColorPaletteProps {
  onColorSelect: (colorCode: string, colorName: string) => void;
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

const COLOR_TARGETS = [
  { name: 'Node Fill', syntax: 'fill:#COLOR#' },
  { name: 'Node Border', syntax: 'stroke:#COLOR#' },
  { name: 'Border Width', syntax: 'stroke-width:2px' },
  { name: 'Text Color', syntax: 'color:#COLOR#' },
  { name: 'Fill + Border', syntax: 'fill:#COLOR#,stroke:#333,stroke-width:1px' },
];

const ColorPalette: React.FC<ColorPaletteProps> = ({ onColorSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(COLOR_TARGETS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorClick = (colorCode: string, colorName: string) => {
    const syntaxWithColor = selectedTarget.syntax.replace(/#COLOR#/g, colorCode);
    onColorSelect(syntaxWithColor, `${colorName} (${selectedTarget.name})`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
      >
        <span className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
        Colors
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 p-3 bg-white border rounded-lg shadow-lg z-20 w-72">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Apply to:</label>
            <select 
              className="w-full rounded border p-1 text-sm"
              value={selectedTarget.name}
              onChange={(e) => {
                const target = COLOR_TARGETS.find(t => t.name === e.target.value);
                if (target) setSelectedTarget(target);
              }}
            >
              {COLOR_TARGETS.map((target) => (
                <option key={target.name} value={target.name}>
                  {target.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-8 gap-1">
            {COLORS.map((color) => (
              <button
                key={color.code}
                title={color.name}
                style={{ backgroundColor: color.code }}
                className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                onClick={() => handleColorClick(color.code, color.name)}
              />
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Select a node in the editor first, then click a color</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
