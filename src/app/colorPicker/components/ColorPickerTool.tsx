'use client';
import React, { useState, useEffect } from 'react';
import {
  hexToRgb, hexToHsl, rgbToHex, hslToHex, hexToHsv, hsvToHex,
  generateRandomColor, CSS_NAMED_COLORS, COLOR_PALETTES,
  getComplementaryColor, getAnalogousColors, getTriadicColors, rgbToHsv, hsvToRgb
} from '../utils/colorUtils';
import ColorHistory from './ColorHistory';

const ColorPickerTool: React.FC = () => {
  const [hex, setHex] = useState('#3498db');
  const [rgb, setRgb] = useState({ r: 52, g: 152, b: 219 });
  const [hsl, setHsl] = useState({ h: 204, s: 70, l: 53 });
  const [hsv, setHsv] = useState({ h: 204, s: 76, v: 86 });
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'hex' | 'rgb' | 'hsl' | 'hsv'>('hex');
  const [activePickerTab, setActivePickerTab] = useState<'inputs' | 'palettes' | 'wheel' | 'harmony'>('inputs');
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof COLOR_PALETTES>('material');
  const [isEyedropperSupported, setIsEyedropperSupported] = useState(false);

  // Check for EyeDropper support after mount to avoid hydration mismatch
  useEffect(() => {
    setIsEyedropperSupported('EyeDropper' in window);
  }, []);
  
  // Update all color formats when hex changes
  useEffect(() => {
    const rgbColor = hexToRgb(hex);
    const hslColor = hexToHsl(hex);
    const hsvColor = hexToHsv(hex);

    if (rgbColor) setRgb(rgbColor);
    if (hslColor) setHsl(hslColor);
    if (hsvColor) setHsv(hsvColor);
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

  // Handle HSV input changes
  const handleHsvChange = (param: 'h' | 's' | 'v', value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const maxValue = param === 'h' ? 360 : 100;
      if (numValue >= 0 && numValue <= maxValue) {
        const newHsv = { ...hsv, [param]: numValue };
        setHsv(newHsv);
        setHex(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
      }
    }
  };

  // Generate random color
  const handleRandomColor = () => {
    setHex(generateRandomColor());
  };

  // Use eyedropper API if available
  const handleEyedropper = async () => {
    if (!isEyedropperSupported) return;
    try {
      // @ts-ignore - EyeDropper is experimental
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      setHex(result.sRGBHex);
    } catch (error) {
      console.log('Eyedropper cancelled or failed');
    }
  };
  
  // Save current color to history
  const saveToHistory = () => {
    if (!colorHistory.includes(hex)) {
      setColorHistory(prev => [hex, ...prev].slice(0, 20));
    }
  };
  
  // Copy color to clipboard
  const copyToClipboard = (format: 'hex' | 'rgb' | 'hsl' | 'hsv') => {
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
      case 'hsv':
        textToCopy = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
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

          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => saveToHistory()}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Save to History
              </button>
              <button
                onClick={handleRandomColor}
                className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
              >
                🎲 Random
              </button>
              {isEyedropperSupported && (
                <button
                  onClick={handleEyedropper}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                >
                  🎯 Eyedropper
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => copyToClipboard('hex')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-sm"
              >
                Copy HEX
              </button>
              <button
                onClick={() => copyToClipboard('rgb')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-sm"
              >
                Copy RGB
              </button>
              <button
                onClick={() => copyToClipboard('hsl')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-sm"
              >
                Copy HSL
              </button>
              <button
                onClick={() => copyToClipboard('hsv')}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-sm"
              >
                Copy HSV
              </button>
            </div>
          </div>
        </div>

        {/* Picker Method Tabs */}
        <div className="border rounded overflow-hidden">
          <div className="flex bg-gray-50">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium ${activePickerTab === 'inputs' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActivePickerTab('inputs')}
            >
              📝 Inputs
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium ${activePickerTab === 'palettes' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActivePickerTab('palettes')}
            >
              🎨 Palettes
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium ${activePickerTab === 'wheel' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActivePickerTab('wheel')}
            >
              🎡 Wheel
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium ${activePickerTab === 'harmony' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActivePickerTab('harmony')}
            >
              🎵 Harmony
            </button>
          </div>
        </div>

        {/* Picker Content */}
        <div className="border rounded p-4 bg-white">
          {activePickerTab === 'inputs' && (
            <div className="space-y-6">
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
                  <button
                    className={`flex-1 py-2 ${activeTab === 'hsv' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setActiveTab('hsv')}
                  >
                    HSV
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

                  {activeTab === 'hsv' && (
                    <div className="flex gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium">H</label>
                        <input
                          type="number"
                          min="0"
                          max="360"
                          className="w-full p-2 border rounded"
                          value={hsv.h}
                          onChange={(e) => handleHsvChange('h', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium">S%</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-full p-2 border rounded"
                          value={hsv.s}
                          onChange={(e) => handleHsvChange('s', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium">V%</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-full p-2 border rounded"
                          value={hsv.v}
                          onChange={(e) => handleHsvChange('v', e.target.value)}
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
          )}

          {activePickerTab === 'palettes' && (
            <div className="space-y-6">
              <div>
                <label className="block mb-3 text-lg font-medium">Color Palettes</label>
                <div className="flex gap-2 mb-4">
                  {Object.keys(COLOR_PALETTES).map((paleteName) => (
                    <button
                      key={paleteName}
                      className={`px-3 py-1 rounded text-sm capitalize ${
                        selectedPalette === paleteName
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() => setSelectedPalette(paleteName as keyof typeof COLOR_PALETTES)}
                    >
                      {paleteName}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                  {COLOR_PALETTES[selectedPalette].map((color, index) => (
                    <button
                      key={index}
                      className="w-full aspect-square rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => setHex(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-3 text-lg font-medium">CSS Named Colors (Sample)</label>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {CSS_NAMED_COLORS.slice(0, 24).map((color, index) => (
                    <button
                      key={index}
                      className="w-full aspect-square rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => setHex(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePickerTab === 'wheel' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Color Wheel</h3>
                <div className="mx-auto w-64 h-64 rounded-full relative border-4 border-gray-300 dark:border-gray-600 cursor-crosshair shadow-lg overflow-hidden"
                     style={{
                       background: `conic-gradient(from 0deg at 50% 50%,
                         hsl(0, 100%, 50%),
                         hsl(30, 100%, 50%),
                         hsl(60, 100%, 50%),
                         hsl(90, 100%, 50%),
                         hsl(120, 100%, 50%),
                         hsl(150, 100%, 50%),
                         hsl(180, 100%, 50%),
                         hsl(210, 100%, 50%),
                         hsl(240, 100%, 50%),
                         hsl(270, 100%, 50%),
                         hsl(300, 100%, 50%),
                         hsl(330, 100%, 50%),
                         hsl(360, 100%, 50%)
                       )`
                     }}
                     onMouseDown={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const centerX = rect.width / 2;
                       const centerY = rect.height / 2;
                       const x = e.clientX - rect.left - centerX;
                       const y = e.clientY - rect.top - centerY;

                       const maxRadius = Math.min(centerX, centerY);
                       const distance = Math.sqrt(x * x + y * y);
                       const saturation = Math.min(100, Math.round((distance / maxRadius) * 100));

                       let angle = Math.atan2(y, x) * (180 / Math.PI);
                       const hue = Math.round((angle + 90 + 360) % 360);

                       const newHsv = { ...hsv, h: hue, s: saturation };
                       setHsv(newHsv);
                       setHex(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
                     }}
                >
                  {/* White center fade for saturation visualization */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, white 0%, transparent 70%)'
                    }}
                  />
                  {/* Color indicator */}
                  <div
                    className="absolute w-5 h-5 rounded-full shadow-lg pointer-events-none border-2 border-white"
                    style={{
                      left: `${50 + (hsv.s / 100) * 46 * Math.cos((hsv.h - 90) * Math.PI / 180)}%`,
                      top: `${50 + (hsv.s / 100) * 46 * Math.sin((hsv.h - 90) * Math.PI / 180)}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: `hsl(${hsv.h}, ${hsv.s}%, 50%)`,
                      boxShadow: '0 0 0 2px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  Click to select hue (angle) and saturation (distance)
                </p>
                <div className="flex justify-center gap-4 mt-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Hue: <span className="font-mono">{hsv.h}°</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Saturation: <span className="font-mono">{hsv.s}%</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePickerTab === 'harmony' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Color Harmony</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Complementary</h4>
                    <div className="flex gap-2">
                      <div
                        className="w-16 h-16 rounded border cursor-pointer"
                        style={{ backgroundColor: hex }}
                        onClick={() => setHex(hex)}
                        title={hex}
                      />
                      <div
                        className="w-16 h-16 rounded border cursor-pointer"
                        style={{ backgroundColor: getComplementaryColor(hex) }}
                        onClick={() => setHex(getComplementaryColor(hex))}
                        title={getComplementaryColor(hex)}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Analogous</h4>
                    <div className="flex gap-2">
                      <div
                        className="w-16 h-16 rounded border cursor-pointer"
                        style={{ backgroundColor: hex }}
                        onClick={() => setHex(hex)}
                        title={hex}
                      />
                      {getAnalogousColors(hex).map((color, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 rounded border cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => setHex(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Triadic</h4>
                    <div className="flex gap-2">
                      <div
                        className="w-16 h-16 rounded border cursor-pointer"
                        style={{ backgroundColor: hex }}
                        onClick={() => setHex(hex)}
                        title={hex}
                      />
                      {getTriadicColors(hex).map((color, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 rounded border cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => setHex(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
