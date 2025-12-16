/**
 * useColorPicker Hook
 *
 * Custom React hook for managing color picker state and business logic
 * Follows Separation of Concerns and Single Responsibility principles
 */

import { useState, useEffect, useCallback } from 'react';
import { ColorService } from '../services/ColorService';
import {
  ColorState,
  ColorFormat,
  PickerTab,
  HarmonyType,
  PaletteName,
  RGB,
  HSL,
  HSV,
  Notification,
} from '../models/ColorModels';

export const useColorPicker = (initialColor: string = '#3498db') => {
  const [colorService] = useState(() => new ColorService());
  const [colorState, setColorState] = useState<ColorState>(() =>
    colorService.getColorState(initialColor)
  );
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [activeFormatTab, setActiveFormatTab] = useState<ColorFormat>(ColorFormat.HEX);
  const [activePickerTab, setActivePickerTab] = useState<PickerTab>(PickerTab.INPUTS);
  const [selectedPalette, setSelectedPalette] = useState<PaletteName>('material');
  const [notification, setNotification] = useState<Notification | null>(null);

  /**
   * Update all color formats when hex changes
   */
  useEffect(() => {
    const newColorState = colorService.getColorState(colorState.hex);
    setColorState(newColorState);
  }, [colorState.hex, colorService]);

  /**
   * Update hex color
   */
  const updateHex = useCallback(
    (newHex: string) => {
      if (colorService.isValidHex(newHex)) {
        const formattedHex = colorService.formatHex(newHex);
        setColorState((prev) => ({ ...prev, hex: formattedHex }));
      }
    },
    [colorService]
  );

  /**
   * Update RGB color
   */
  const updateRgb = useCallback(
    (color: 'r' | 'g' | 'b', value: number) => {
      if (value >= 0 && value <= 255) {
        const newRgb = { ...colorState.rgb, [color]: value };
        const newHex = colorService.updateFromRgb(newRgb);
        setColorState((prev) => ({ ...prev, hex: newHex, rgb: newRgb }));
      }
    },
    [colorState.rgb, colorService]
  );

  /**
   * Update HSL color
   */
  const updateHsl = useCallback(
    (param: 'h' | 's' | 'l', value: number) => {
      const maxValue = param === 'h' ? 360 : 100;
      if (value >= 0 && value <= maxValue) {
        const newHsl = { ...colorState.hsl, [param]: value };
        const newHex = colorService.updateFromHsl(newHsl);
        setColorState((prev) => ({ ...prev, hex: newHex, hsl: newHsl }));
      }
    },
    [colorState.hsl, colorService]
  );

  /**
   * Update HSV color
   */
  const updateHsv = useCallback(
    (param: 'h' | 's' | 'v', value: number) => {
      const maxValue = param === 'h' ? 360 : 100;
      if (value >= 0 && value <= maxValue) {
        const newHsv = { ...colorState.hsv, [param]: value };
        const newHex = colorService.updateFromHsv(newHsv);
        setColorState((prev) => ({ ...prev, hex: newHex, hsv: newHsv }));
      }
    },
    [colorState.hsv, colorService]
  );

  /**
   * Set RGB object
   */
  const setRgb = useCallback(
    (rgb: RGB) => {
      const newHex = colorService.updateFromRgb(rgb);
      setColorState((prev) => ({ ...prev, hex: newHex, rgb }));
    },
    [colorService]
  );

  /**
   * Set HSL object
   */
  const setHsl = useCallback(
    (hsl: HSL) => {
      const newHex = colorService.updateFromHsl(hsl);
      setColorState((prev) => ({ ...prev, hex: newHex, hsl }));
    },
    [colorService]
  );

  /**
   * Set HSV object
   */
  const setHsv = useCallback(
    (hsv: HSV) => {
      const newHex = colorService.updateFromHsv(hsv);
      setColorState((prev) => ({ ...prev, hex: newHex, hsv }));
    },
    [colorService]
  );

  /**
   * Generate random color
   */
  const generateRandom = useCallback(() => {
    const randomHex = colorService.generateRandomColor();
    updateHex(randomHex);
  }, [colorService, updateHex]);

  /**
   * Use eyedropper API
   */
  const useEyedropper = useCallback(async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // @ts-ignore - EyeDropper is experimental
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        updateHex(result.sRGBHex);
      } catch (error) {
        showNotification('Eyedropper cancelled', 'info');
      }
    } else {
      showNotification('Eyedropper API is not supported in this browser', 'error');
    }
  }, [updateHex]);

  /**
   * Save color to history
   */
  const saveToHistory = useCallback(() => {
    if (!colorHistory.includes(colorState.hex)) {
      setColorHistory((prev) => [colorState.hex, ...prev].slice(0, 20));
      showNotification('Color saved to history', 'success');
    } else {
      showNotification('Color already in history', 'info');
    }
  }, [colorState.hex, colorHistory]);

  /**
   * Clear color history
   */
  const clearHistory = useCallback(() => {
    setColorHistory([]);
    showNotification('History cleared', 'success');
  }, []);

  /**
   * Copy color to clipboard
   */
  const copyToClipboard = useCallback(
    async (format: ColorFormat) => {
      const textToCopy = colorService.getFormattedColor(format, colorState);

      try {
        await navigator.clipboard.writeText(textToCopy);
        showNotification(`Copied ${format.toUpperCase()} color to clipboard`, 'success');
      } catch (error) {
        showNotification('Failed to copy to clipboard', 'error');
      }
    },
    [colorService, colorState]
  );

  /**
   * Show notification
   */
  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'info') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  /**
   * Get color harmony
   */
  const getColorHarmony = useCallback(
    (type: HarmonyType) => {
      return colorService.generateColorHarmony(colorState.hex, type);
    },
    [colorService, colorState.hex]
  );

  return {
    // Color state
    colorState,
    hex: colorState.hex,
    rgb: colorState.rgb,
    hsl: colorState.hsl,
    hsv: colorState.hsv,

    // Update functions
    updateHex,
    updateRgb,
    updateHsl,
    updateHsv,
    setRgb,
    setHsl,
    setHsv,

    // Actions
    generateRandom,
    useEyedropper,
    saveToHistory,
    clearHistory,
    copyToClipboard,
    getColorHarmony,

    // History
    colorHistory,

    // Tabs
    activeFormatTab,
    setActiveFormatTab,
    activePickerTab,
    setActivePickerTab,

    // Palettes
    selectedPalette,
    setSelectedPalette,

    // Notification
    notification,
    showNotification,

    // Service
    colorService,
  };
};
