/**
 * Color Service (Facade Pattern)
 *
 * Main service that coordinates color operations
 * Provides a simplified interface to complex color subsystems
 * Follows Single Responsibility Principle and Facade Pattern
 */

import { IColorConverter } from '../converters/IColorConverter';
import { StandardColorConverter } from '../converters/StandardColorConverter';
import { ColorHarmonyService } from './ColorHarmonyService';
import { ColorState, RGB, HSL, HSV, HarmonyType, PaletteName } from '../models/ColorModels';

export class ColorService {
  private converter: IColorConverter;
  private harmonyService: ColorHarmonyService;

  constructor(converter?: IColorConverter) {
    this.converter = converter || new StandardColorConverter();
    this.harmonyService = new ColorHarmonyService(this.converter);
  }

  /**
   * Get complete color state from hex value
   */
  getColorState(hex: string): ColorState {
    const rgb = this.converter.hexToRgb(hex) || { r: 0, g: 0, b: 0 };
    const hsl = this.converter.hexToHsl(hex) || { h: 0, s: 0, l: 0 };
    const hsv = this.converter.hexToHsv(hex) || { h: 0, s: 0, v: 0 };

    return { hex, rgb, hsl, hsv };
  }

  /**
   * Update hex from RGB values
   */
  updateFromRgb(rgb: RGB): string {
    return this.converter.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  /**
   * Update hex from HSL values
   */
  updateFromHsl(hsl: HSL): string {
    return this.converter.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  /**
   * Update hex from HSV values
   */
  updateFromHsv(hsv: HSV): string {
    return this.converter.hsvToHex(hsv.h, hsv.s, hsv.v);
  }

  /**
   * Generate random color
   */
  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * Validate hex color
   */
  isValidHex(hex: string): boolean {
    return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
  }

  /**
   * Format hex color (ensure # prefix)
   */
  formatHex(hex: string): string {
    return hex.startsWith('#') ? hex : `#${hex}`;
  }

  /**
   * Get formatted color string
   */
  getFormattedColor(
    format: 'hex' | 'rgb' | 'hsl' | 'hsv',
    colorState: ColorState
  ): string {
    switch (format) {
      case 'hex':
        return colorState.hex;
      case 'rgb':
        return `rgb(${colorState.rgb.r}, ${colorState.rgb.g}, ${colorState.rgb.b})`;
      case 'hsl':
        return `hsl(${colorState.hsl.h}, ${colorState.hsl.s}%, ${colorState.hsl.l}%)`;
      case 'hsv':
        return `hsv(${colorState.hsv.h}, ${colorState.hsv.s}%, ${colorState.hsv.v}%)`;
      default:
        return colorState.hex;
    }
  }

  /**
   * Generate color harmony
   */
  generateColorHarmony(hex: string, type: HarmonyType): string[] {
    return this.harmonyService.generateHarmony(hex, type);
  }

  /**
   * Get color palettes
   */
  getColorPalettes(): Record<PaletteName, string[]> {
    return {
      material: [
        '#F44336',
        '#E91E63',
        '#9C27B0',
        '#673AB7',
        '#3F51B5',
        '#2196F3',
        '#03A9F4',
        '#00BCD4',
        '#009688',
        '#4CAF50',
        '#8BC34A',
        '#CDDC39',
        '#FFEB3B',
        '#FFC107',
        '#FF9800',
        '#FF5722',
        '#795548',
        '#9E9E9E',
      ],
      pastel: [
        '#FFB3BA',
        '#FFDFBA',
        '#FFFFBA',
        '#BAFFC9',
        '#BAE1FF',
        '#C9C9FF',
        '#FFBAFF',
        '#D4A5A5',
        '#A5D4D4',
        '#A5A5D4',
        '#D4A5D4',
        '#A5D4A5',
      ],
      vintage: [
        '#8B4513',
        '#CD853F',
        '#DEB887',
        '#F4A460',
        '#D2691E',
        '#A0522D',
        '#B22222',
        '#DC143C',
        '#8B0000',
        '#2F4F4F',
        '#708090',
        '#BC8F8F',
      ],
      neon: [
        '#FF073A',
        '#FF0099',
        '#BF00FF',
        '#8000FF',
        '#4000FF',
        '#0080FF',
        '#00FFFF',
        '#00FF80',
        '#80FF00',
        '#FFFF00',
        '#FF8000',
        '#FF4000',
      ],
    };
  }

  /**
   * Get CSS named colors (sample)
   */
  getCssNamedColors(): string[] {
    return [
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF',
      '#800000',
      '#008000',
      '#000080',
      '#808000',
      '#800080',
      '#008080',
      '#FFA500',
      '#FFC0CB',
      '#A52A2A',
      '#8A2BE2',
      '#D2691E',
      '#5F9EA0',
      '#7FFF00',
      '#D2691E',
      '#FF7F50',
      '#6495ED',
      '#DC143C',
      '#00BFFF',
    ];
  }
}
