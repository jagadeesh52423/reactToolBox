/**
 * Color Converter Interface (Strategy Pattern)
 *
 * Defines the contract for all color format converters
 */

import { RGB, HSL, HSV } from '../models/ColorModels';

export interface IColorConverter {
  /**
   * Convert HEX to RGB
   */
  hexToRgb(hex: string): RGB | null;

  /**
   * Convert RGB to HEX
   */
  rgbToHex(r: number, g: number, b: number): string;

  /**
   * Convert RGB to HSL
   */
  rgbToHsl(r: number, g: number, b: number): HSL;

  /**
   * Convert HSL to RGB
   */
  hslToRgb(h: number, s: number, l: number): RGB;

  /**
   * Convert RGB to HSV
   */
  rgbToHsv(r: number, g: number, b: number): HSV;

  /**
   * Convert HSV to RGB
   */
  hsvToRgb(h: number, s: number, v: number): RGB;

  /**
   * Convert HEX to HSL
   */
  hexToHsl(hex: string): HSL | null;

  /**
   * Convert HSL to HEX
   */
  hslToHex(h: number, s: number, l: number): string;

  /**
   * Convert HEX to HSV
   */
  hexToHsv(hex: string): HSV | null;

  /**
   * Convert HSV to HEX
   */
  hsvToHex(h: number, s: number, v: number): string;
}
