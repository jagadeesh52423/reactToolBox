/**
 * Color Wheel Picker Component
 *
 * Interactive color wheel for selecting hue
 * Follows Single Responsibility Principle
 */

import React, { useRef, useCallback } from 'react';
import { HSV } from '../models/ColorModels';

interface ColorWheelPickerProps {
  hsv: HSV;
  onHsvChange: (hsv: HSV) => void;
}

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({ hsv, onHsvChange }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const calculateHueAndSaturation = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return null;

    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = clientX - rect.left - centerX;
    const y = clientY - rect.top - centerY;

    // Calculate distance from center (0 to 1)
    const maxRadius = Math.min(centerX, centerY);
    const distance = Math.sqrt(x * x + y * y);
    const saturation = Math.min(100, Math.round((distance / maxRadius) * 100));

    // atan2 gives angle from positive x-axis (3 o'clock)
    // We need to adjust so 0° is at the top (12 o'clock) and increases clockwise
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    // Rotate by 90° to start from top, and normalize to 0-360
    let hue = (angle + 90 + 360) % 360;

    return { hue: Math.round(hue), saturation };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    const result = calculateHueAndSaturation(e.clientX, e.clientY);
    if (result !== null) {
      onHsvChange({ ...hsv, h: result.hue, s: result.saturation });
    }
  }, [hsv, onHsvChange, calculateHueAndSaturation]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const result = calculateHueAndSaturation(e.clientX, e.clientY);
    if (result !== null) {
      onHsvChange({ ...hsv, h: result.hue, s: result.saturation });
    }
  }, [hsv, onHsvChange, calculateHueAndSaturation]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Calculate indicator position - align with the gradient (0° at top, clockwise)
  const indicatorAngle = (hsv.h - 90) * (Math.PI / 180);
  const indicatorRadius = (hsv.s / 100) * 46; // percentage from center based on saturation
  const indicatorX = 50 + indicatorRadius * Math.cos(indicatorAngle);
  const indicatorY = 50 + indicatorRadius * Math.sin(indicatorAngle);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Color Wheel</h3>
        <div
          ref={wheelRef}
          className="mx-auto w-64 h-64 rounded-full relative border-4 border-gray-300 dark:border-gray-600 cursor-crosshair shadow-lg overflow-hidden"
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
            )`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
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
              left: `${indicatorX}%`,
              top: `${indicatorY}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: `hsl(${hsv.h}, ${hsv.s}%, 50%)`,
              boxShadow: '0 0 0 2px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)',
            }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          Drag to select hue (angle) and saturation (distance from center)
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
  );
};
