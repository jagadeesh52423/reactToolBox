/**
 * Color Sliders Component
 *
 * Displays RGB color adjustment sliders with visual gradients
 * Follows Single Responsibility Principle
 */

import React from 'react';
import { RGB } from '../models/ColorModels';

interface ColorSlidersProps {
  rgb: RGB;
  onRgbChange: (color: 'r' | 'g' | 'b', value: number) => void;
}

export const ColorSliders: React.FC<ColorSlidersProps> = ({ rgb, onRgbChange }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Adjust Color</h3>

      <div>
        <label className="text-sm font-medium">Red: {rgb.r}</label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgb.r}
          onChange={(e) => onRgbChange('r', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))`,
          }}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Green: {rgb.g}</label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgb.g}
          onChange={(e) => onRgbChange('g', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))`,
          }}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Blue: {rgb.b}</label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgb.b}
          onChange={(e) => onRgbChange('b', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))`,
          }}
        />
      </div>
    </div>
  );
};
