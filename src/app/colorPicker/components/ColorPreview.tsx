/**
 * Color Preview Component
 *
 * Displays the current color and action buttons
 * Follows Single Responsibility Principle
 */

import React from 'react';
import { ColorFormat } from '../models/ColorModels';

interface ColorPreviewProps {
  hex: string;
  onSaveToHistory: () => void;
  onRandomColor: () => void;
  onEyedropper: () => void;
  onCopyColor: (format: ColorFormat) => void;
  isEyedropperSupported: boolean;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({
  hex,
  onSaveToHistory,
  onRandomColor,
  onEyedropper,
  onCopyColor,
  isEyedropperSupported,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="w-full h-40 rounded-lg shadow-inner border"
        style={{ backgroundColor: hex }}
      ></div>

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={onSaveToHistory}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
          >
            Save to History
          </button>
          <button
            onClick={onRandomColor}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded transition-colors"
          >
            🎲 Random
          </button>
          {isEyedropperSupported && (
            <button
              onClick={onEyedropper}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
            >
              🎯 Eyedropper
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onCopyColor(ColorFormat.HEX)}
            className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-sm transition-colors"
          >
            Copy HEX
          </button>
          <button
            onClick={() => onCopyColor(ColorFormat.RGB)}
            className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-sm transition-colors"
          >
            Copy RGB
          </button>
          <button
            onClick={() => onCopyColor(ColorFormat.HSL)}
            className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-sm transition-colors"
          >
            Copy HSL
          </button>
          <button
            onClick={() => onCopyColor(ColorFormat.HSV)}
            className="bg-gray-200 hover:bg-gray-300 py-2 px-3 rounded text-sm transition-colors"
          >
            Copy HSV
          </button>
        </div>
      </div>
    </div>
  );
};
