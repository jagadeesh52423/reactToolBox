/**
 * Color Picker Tool (Refactored)
 *
 * Main component for the Color Picker tool
 * Refactored following SOLID principles and design patterns:
 *
 * - Single Responsibility: Component only orchestrates sub-components
 * - Open/Closed: Easy to extend with new converters or harmony types
 * - Dependency Inversion: Depends on abstractions (hook, services)
 * - Strategy Pattern: Different color converters and harmony generators
 * - Service Layer: Business logic separated from UI
 * - Separation of Concerns: Converters, Services, Hooks, Components are separate
 *
 * Architecture:
 * - Converters: StandardColorConverter (implements IColorConverter)
 * - Services: ColorService (facade), ColorHarmonyService
 * - Hook: useColorPicker manages state and business logic
 * - Components: Focused UI components with single responsibilities
 */

'use client';
import React, { useState, useEffect } from 'react';
import { useColorPicker } from '../hooks/useColorPicker';
import { ColorPreview } from './ColorPreview';
import { ColorFormatInputs } from './ColorFormatInputs';
import { ColorSliders } from './ColorSliders';
import { ColorPalettes } from './ColorPalettes';
import { ColorWheelPicker } from './ColorWheelPicker';
import { ColorHarmonyDisplay } from './ColorHarmonyDisplay';
import ColorHistory from './ColorHistory';
import { Notification } from './Notification';
import { PickerTab } from '../models/ColorModels';

const ColorPickerToolRefactored: React.FC = () => {
  const {
    hex,
    rgb,
    hsl,
    hsv,
    updateHex,
    updateRgb,
    updateHsl,
    updateHsv,
    setHsv,
    generateRandom,
    useEyedropper,
    saveToHistory,
    clearHistory,
    copyToClipboard,
    getColorHarmony,
    colorHistory,
    activeFormatTab,
    setActiveFormatTab,
    activePickerTab,
    setActivePickerTab,
    selectedPalette,
    setSelectedPalette,
    notification,
    colorService,
  } = useColorPicker('#3498db');

  // Check for EyeDropper support after mount to avoid hydration mismatch
  const [isEyedropperSupported, setIsEyedropperSupported] = useState(false);
  useEffect(() => {
    setIsEyedropperSupported('EyeDropper' in window);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Notification notification={notification} />

      <div className="w-full lg:w-2/3 space-y-6">
        {/* Color Preview */}
        <ColorPreview
          hex={hex}
          onSaveToHistory={saveToHistory}
          onRandomColor={generateRandom}
          onEyedropper={useEyedropper}
          onCopyColor={copyToClipboard}
          isEyedropperSupported={isEyedropperSupported}
        />

        {/* Picker Method Tabs */}
        <div className="border rounded overflow-hidden">
          <div className="flex bg-gray-50">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activePickerTab === PickerTab.INPUTS
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActivePickerTab(PickerTab.INPUTS)}
            >
              📝 Inputs
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activePickerTab === PickerTab.PALETTES
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActivePickerTab(PickerTab.PALETTES)}
            >
              🎨 Palettes
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activePickerTab === PickerTab.WHEEL
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActivePickerTab(PickerTab.WHEEL)}
            >
              🎡 Wheel
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activePickerTab === PickerTab.HARMONY
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActivePickerTab(PickerTab.HARMONY)}
            >
              🎵 Harmony
            </button>
          </div>
        </div>

        {/* Picker Content */}
        <div className="border rounded p-4 bg-white">
          {activePickerTab === PickerTab.INPUTS && (
            <div className="space-y-6">
              <ColorFormatInputs
                activeTab={activeFormatTab}
                onTabChange={setActiveFormatTab}
                hex={hex}
                rgb={rgb}
                hsl={hsl}
                hsv={hsv}
                onHexChange={updateHex}
                onRgbChange={updateRgb}
                onHslChange={updateHsl}
                onHsvChange={updateHsv}
              />

              <ColorSliders rgb={rgb} onRgbChange={updateRgb} />
            </div>
          )}

          {activePickerTab === PickerTab.PALETTES && (
            <ColorPalettes
              selectedPalette={selectedPalette}
              onPaletteChange={setSelectedPalette}
              onColorSelect={updateHex}
              colorService={colorService}
            />
          )}

          {activePickerTab === PickerTab.WHEEL && (
            <ColorWheelPicker hsv={hsv} onHsvChange={setHsv} />
          )}

          {activePickerTab === PickerTab.HARMONY && (
            <ColorHarmonyDisplay
              currentColor={hex}
              onColorSelect={updateHex}
              getColorHarmony={getColorHarmony}
            />
          )}
        </div>
      </div>

      <div className="w-full lg:w-1/3">
        <ColorHistory
          colors={colorHistory}
          onColorSelect={updateHex}
          onClearHistory={clearHistory}
        />
      </div>
    </div>
  );
};

export default ColorPickerToolRefactored;
