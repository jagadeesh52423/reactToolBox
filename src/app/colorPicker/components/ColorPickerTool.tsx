'use client';
import React, { useState, useEffect } from 'react';
import { hexToRgb, hexToHsl, rgbToHex, hslToHex } from '../utils/colorUtils';
import ColorHistory from './ColorHistory';

const ColorPickerTool: React.FC = () => {
  const [hex, setHex] = useState('#3498db');
  const [rgb, setRgb] = useState({ r: 52, g: 152, b: 219 });
  const [hsl, setHsl] = useState({ h: 204, s: 70, l: 53 });
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  
  // Update all color formats when hex changes
  useEffect(() => {
    const rgbColor = hexToRgb(hex);
    const hslColor = hexToHsl(hex);
    
    if (rgbColor) setRgb(rgbColor);
    if (hslColor) setHsl(hslColor);
  }, [hex]);

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newHex)) {
      setHex(newHex.startsWith('#') ? newHex : `#${newHex}`);
    }
  };
  
  // Handle RGB input changes
  const handleRgbChange = (color: 'r' | 'g' | 'b', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 255) {
      const newRgb = { ...rgb, [color]: numValue };
      setRgb(newRgb);
      setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
  };
  
  // Handle HSL input changes
  const handleHslChange = (param: 'h' | 's' | 'l', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const maxValue = param === 'h' ? 360 : 100;
      if (numValue >= 0 && numValue <= maxValue) {
        const newHsl = { ...hsl, [param]: numValue };
        setHsl(newHsl);
        setHex(hslToHex(newHsl.h, newHsl.s, newHsl.l));
      }
    }
  };
  
  // Save current color to history
  const saveToHistory = () => {
    if (!colorHistory.includes(hex)) {
      setColorHistory(prev => [hex, ...prev].slice(0, 20));
    }
  };
  
  // Copy color to clipboard
  const copyToClipboard = (format: 'hex' | 'rgb' | 'hsl') => {
    let textToCopy = '';
    
    switch (format) {
      case 'hex':
        textToCopy = hex;
        break;
      case 'rgb':
        textToCopy = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        break;
      case 'hsl':
        textToCopy = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        break;
    }
    
    navigator.clipboard.writeText(textToCopy);
    alert(`Copied ${format.toUpperCase()} color to clipboard!`);
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-2/3 space-y-6">
        {/* Color Preview */}
        <div className="flex flex-col gap-4">
          <div 
            className="w-full h-40 rounded-lg shadow-inner border"
            style={{ backgroundColor: hex }}
          ></div>
          
          <div className="flex justify-between">
            <button
              onClick={() => saveToHistory()}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Save to History
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard('hex')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded text-sm"
              >
                Copy HEX
              </button>
              <button
                onClick={() => copyToClipboard('rgb')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded text-sm"
              >
                Copy RGB
              </button>
              <button
                onClick={() => copyToClipboard('hsl')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded text-sm"
              >
                Copy HSL
              </button>
            </div>
          </div>
        </div>
        
        {/* Color Format Tabs */}
        <div className="border rounded overflow-hidden">
          <div className="flex">
            <button
              className={`flex-1 py-2 ${activeTab === 'hex' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setActiveTab('hex')}
            >
              HEX
            </button>
            <button
              className={`flex-1 py-2 ${activeTab === 'rgb' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setActiveTab('rgb')}
            >
              RGB
            </button>
            <button
              className={`flex-1 py-2 ${activeTab === 'hsl' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setActiveTab('hsl')}
            >
              HSL
            </button>
          </div>
          
          <div className="p-4">
            {activeTab === 'hex' && (
              <div>
                <label className="block mb-2 text-sm font-medium">Hexadecimal</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={hex}
                  onChange={handleHexChange}
                />
              </div>
            )}
            
            {activeTab === 'rgb' && (
              <div className="flex gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">R</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    className="w-full p-2 border rounded"
                    value={rgb.r}
                    onChange={(e) => handleRgbChange('r', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">G</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    className="w-full p-2 border rounded"
                    value={rgb.g}
                    onChange={(e) => handleRgbChange('g', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">B</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    className="w-full p-2 border rounded"
                    value={rgb.b}
                    onChange={(e) => handleRgbChange('b', e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'hsl' && (
              <div className="flex gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">H</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    className="w-full p-2 border rounded"
                    value={hsl.h}
                    onChange={(e) => handleHslChange('h', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">S%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border rounded"
                    value={hsl.s}
                    onChange={(e) => handleHslChange('s', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">L%</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border rounded"
                    value={hsl.l}
                    onChange={(e) => handleHslChange('l', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Color sliders */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Adjust Color</h3>
          
          <div>
            <label className="text-sm font-medium">Red</label>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgb.r} 
              onChange={(e) => handleRgbChange('r', e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))`
              }}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Green</label>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgb.g} 
              onChange={(e) => handleRgbChange('g', e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))`
              }}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Blue</label>
            <input 
              type="range" 
              min="0" 
              max="255" 
              value={rgb.b} 
              onChange={(e) => handleRgbChange('b', e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))`
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-1/3">
        <ColorHistory 
          colors={colorHistory} 
          onColorSelect={(color) => setHex(color)}
          onClearHistory={() => setColorHistory([])} 
        />
      </div>
    </div>
  );
};

export default ColorPickerTool;
