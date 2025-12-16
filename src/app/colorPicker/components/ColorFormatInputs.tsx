/**
 * Color Format Inputs Component
 *
 * Displays inputs for different color formats (HEX, RGB, HSL, HSV)
 * Follows Single Responsibility Principle
 */

import React from 'react';
import { ColorFormat, RGB, HSL, HSV } from '../models/ColorModels';

interface ColorFormatInputsProps {
  activeTab: ColorFormat;
  onTabChange: (tab: ColorFormat) => void;
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  onHexChange: (hex: string) => void;
  onRgbChange: (color: 'r' | 'g' | 'b', value: number) => void;
  onHslChange: (param: 'h' | 's' | 'l', value: number) => void;
  onHsvChange: (param: 'h' | 's' | 'v', value: number) => void;
}

export const ColorFormatInputs: React.FC<ColorFormatInputsProps> = ({
  activeTab,
  onTabChange,
  hex,
  rgb,
  hsl,
  hsv,
  onHexChange,
  onRgbChange,
  onHslChange,
  onHsvChange,
}) => {
  return (
    <div className="border rounded overflow-hidden">
      {/* Format Tabs */}
      <div className="flex">
        <button
          className={`flex-1 py-2 transition-colors ${
            activeTab === ColorFormat.HEX ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
          onClick={() => onTabChange(ColorFormat.HEX)}
        >
          HEX
        </button>
        <button
          className={`flex-1 py-2 transition-colors ${
            activeTab === ColorFormat.RGB ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
          onClick={() => onTabChange(ColorFormat.RGB)}
        >
          RGB
        </button>
        <button
          className={`flex-1 py-2 transition-colors ${
            activeTab === ColorFormat.HSL ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
          onClick={() => onTabChange(ColorFormat.HSL)}
        >
          HSL
        </button>
        <button
          className={`flex-1 py-2 transition-colors ${
            activeTab === ColorFormat.HSV ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
          onClick={() => onTabChange(ColorFormat.HSV)}
        >
          HSV
        </button>
      </div>

      {/* Format Input Fields */}
      <div className="p-4">
        {activeTab === ColorFormat.HEX && (
          <div>
            <label className="block mb-2 text-sm font-medium">Hexadecimal</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={hex}
              onChange={(e) => onHexChange(e.target.value)}
              placeholder="#000000"
            />
          </div>
        )}

        {activeTab === ColorFormat.RGB && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">R</label>
              <input
                type="number"
                min="0"
                max="255"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rgb.r}
                onChange={(e) => onRgbChange('r', parseInt(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">G</label>
              <input
                type="number"
                min="0"
                max="255"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rgb.g}
                onChange={(e) => onRgbChange('g', parseInt(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">B</label>
              <input
                type="number"
                min="0"
                max="255"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rgb.b}
                onChange={(e) => onRgbChange('b', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}

        {activeTab === ColorFormat.HSL && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">H</label>
              <input
                type="number"
                min="0"
                max="360"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hsl.h}
                onChange={(e) => onHslChange('h', parseInt(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">S%</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hsl.s}
                onChange={(e) => onHslChange('s', parseInt(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">L%</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hsl.l}
                onChange={(e) => onHslChange('l', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}

        {activeTab === ColorFormat.HSV && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">H</label>
              <input
                type="number"
                min="0"
                max="360"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hsv.h}
                onChange={(e) => onHsvChange('h', parseInt(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">S%</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hsv.s}
                onChange={(e) => onHsvChange('s', parseInt(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">V%</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hsv.v}
                onChange={(e) => onHsvChange('v', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
