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
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'picker' | 'hex'>('presets');
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Validate hex color format
  const isValidHexColor = (hex: string) => {
    return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
  };

  // Handle color picker change
  const handleColorPickerChange = (color: string) => {
    setCustomHex(color);
    const syntaxWithColor = selectedTarget.syntax.replace(/#COLOR#/g, color);
    onColorSelect(syntaxWithColor, `Custom Color (${selectedTarget.name})`);
    setIsOpen(false);
  };

  // Handle hex input submission
  const handleHexSubmit = () => {
    const hex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (isValidHexColor(hex)) {
      const syntaxWithColor = selectedTarget.syntax.replace(/#COLOR#/g, hex);
      onColorSelect(syntaxWithColor, `Hex ${hex} (${selectedTarget.name})`);
      setCustomHex(hex);
      setHexInput('');
      setIsOpen(false);
    } else {
      alert('Please enter a valid hex color (e.g., #FF5733 or FF5733)');
    }
  };

  // Handle enter key in hex input
  const handleHexKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHexSubmit();
    }
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

      {mounted && isOpen && (
        <div className="absolute left-0 top-full mt-1 p-3 bg-white border rounded-lg shadow-lg z-20 w-80">
          {/* Apply to selector */}
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

          {/* Tab buttons */}
          <div className="flex mb-3 border-b">
            <button
              className={`px-3 py-1 text-sm ${activeTab === 'presets' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('presets')}
            >
              Presets
            </button>
            <button
              className={`px-3 py-1 text-sm ${activeTab === 'picker' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('picker')}
            >
              Color Picker
            </button>
            <button
              className={`px-3 py-1 text-sm ${activeTab === 'hex' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}
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
                    onClick={() => handleColorClick(color.code, color.name)}
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
                {mounted ? (
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                ) : (
                  <div className="w-16 h-10 rounded border border-gray-300 bg-gray-200"></div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{customHex}</div>
                  <button
                    onClick={() => handleColorPickerChange(customHex)}
                    className="mt-1 px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
                    disabled={!mounted}
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
                    onKeyPress={handleHexKeyPress}
                    placeholder="Enter hex color (e.g., FF5733)"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    maxLength={7}
                  />
                  <button
                    onClick={handleHexSubmit}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                  >
                    Apply
                  </button>
                </div>
                {mounted && hexInput && (
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

          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            <p>💡 Select a node in the editor first, then choose a color</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
