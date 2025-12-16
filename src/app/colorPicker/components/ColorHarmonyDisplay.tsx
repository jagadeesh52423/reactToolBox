/**
 * Color Harmony Display Component
 *
 * Displays color harmonies based on color theory
 * Follows Single Responsibility Principle
 */

import React from 'react';
import { HarmonyType } from '../models/ColorModels';

interface ColorHarmonyDisplayProps {
  currentColor: string;
  onColorSelect: (color: string) => void;
  getColorHarmony: (type: HarmonyType) => string[];
}

export const ColorHarmonyDisplay: React.FC<ColorHarmonyDisplayProps> = ({
  currentColor,
  onColorSelect,
  getColorHarmony,
}) => {
  const harmonies: { type: HarmonyType; label: string; description: string }[] = [
    {
      type: HarmonyType.COMPLEMENTARY,
      label: 'Complementary',
      description: 'Opposite on the color wheel',
    },
    {
      type: HarmonyType.ANALOGOUS,
      label: 'Analogous',
      description: 'Adjacent colors on the wheel',
    },
    {
      type: HarmonyType.TRIADIC,
      label: 'Triadic',
      description: '120 degrees apart',
    },
    {
      type: HarmonyType.TETRADIC,
      label: 'Tetradic',
      description: 'Square on the color wheel',
    },
    {
      type: HarmonyType.SPLIT_COMPLEMENTARY,
      label: 'Split Complementary',
      description: 'Complement + adjacent',
    },
    {
      type: HarmonyType.MONOCHROMATIC,
      label: 'Monochromatic',
      description: 'Same hue, different saturation',
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Color Harmony</h3>

      {harmonies.map(({ type, label, description }) => {
        const colors = getColorHarmony(type);

        return (
          <div key={type}>
            <div className="mb-2">
              <h4 className="font-medium">{label}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div className="flex gap-2">
              {/* Current color */}
              <div
                className="w-16 h-16 rounded border-2 border-gray-400 cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: currentColor }}
                onClick={() => onColorSelect(currentColor)}
                title={currentColor}
              />
              {/* Harmony colors */}
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="w-16 h-16 rounded border cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
