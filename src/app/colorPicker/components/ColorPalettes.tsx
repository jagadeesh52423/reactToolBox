/**
 * Color Palettes Component
 *
 * Displays predefined color palettes and CSS named colors
 * Follows Single Responsibility Principle
 */

import React from 'react';
import { PaletteName } from '../models/ColorModels';
import { ColorService } from '../services/ColorService';

interface ColorPalettesProps {
  selectedPalette: PaletteName;
  onPaletteChange: (palette: PaletteName) => void;
  onColorSelect: (color: string) => void;
  colorService: ColorService;
}

export const ColorPalettes: React.FC<ColorPalettesProps> = ({
  selectedPalette,
  onPaletteChange,
  onColorSelect,
  colorService,
}) => {
  const palettes = colorService.getColorPalettes();
  const cssColors = colorService.getCssNamedColors();

  return (
    <div className="space-y-6">
      <div>
        <label className="block mb-3 text-lg font-medium">Color Palettes</label>
        <div className="flex gap-2 mb-4 flex-wrap">
          {(Object.keys(palettes) as PaletteName[]).map((paletteName) => (
            <button
              key={paletteName}
              className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                selectedPalette === paletteName
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => onPaletteChange(paletteName)}
            >
              {paletteName}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
          {palettes[selectedPalette].map((color, index) => (
            <button
              key={index}
              className="w-full aspect-square rounded border-2 border-gray-300 hover:border-gray-500 hover:scale-105 transition-all"
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-3 text-lg font-medium">CSS Named Colors (Sample)</label>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {cssColors.map((color, index) => (
            <button
              key={index}
              className="w-full aspect-square rounded border-2 border-gray-300 hover:border-gray-500 hover:scale-105 transition-all"
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
