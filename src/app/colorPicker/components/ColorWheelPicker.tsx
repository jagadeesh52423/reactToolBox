/**
 * Color Wheel Picker Component
 *
 * Interactive color wheel for selecting hue
 * Follows Single Responsibility Principle
 */

import React from 'react';
import { HSV } from '../models/ColorModels';

interface ColorWheelPickerProps {
  hsv: HSV;
  onHsvChange: (hsv: HSV) => void;
}

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({ hsv, onHsvChange }) => {
  const handleWheelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    const angle = Math.atan2(y, x);
    const hue = Math.round(((angle * 180) / Math.PI + 360) % 360);

    onHsvChange({ ...hsv, h: hue });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">Color Wheel (Interactive)</h3>
        <div
          className="mx-auto w-64 h-64 rounded-full relative border-4 border-gray-300 cursor-crosshair"
          style={{
            background: `conic-gradient(
              hsl(0, 100%, 50%),
              hsl(60, 100%, 50%),
              hsl(120, 100%, 50%),
              hsl(180, 100%, 50%),
              hsl(240, 100%, 50%),
              hsl(300, 100%, 50%),
              hsl(360, 100%, 50%)
            )`,
          }}
          onClick={handleWheelClick}
        >
          <div
            className="absolute w-4 h-4 bg-white border-2 border-black rounded-full transform -translate-x-2 -translate-y-2 pointer-events-none"
            style={{
              left: `${50 + 40 * Math.cos((hsv.h * Math.PI) / 180)}%`,
              top: `${50 + 40 * Math.sin((hsv.h * Math.PI) / 180)}%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">Click on the wheel to select hue</p>
        <p className="text-sm text-gray-700 font-medium mt-1">Current Hue: {hsv.h}°</p>
      </div>
    </div>
  );
};
