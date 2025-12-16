/**
 * Color Harmony Service
 *
 * Generates color harmonies based on color theory
 * Uses Strategy Pattern for different harmony algorithms
 * Follows Single Responsibility Principle
 */

import { IColorConverter } from '../converters/IColorConverter';
import { HarmonyType } from '../models/ColorModels';

export class ColorHarmonyService {
  constructor(private converter: IColorConverter) {}

  /**
   * Generate color harmony based on type
   */
  generateHarmony(hex: string, type: HarmonyType): string[] {
    switch (type) {
      case HarmonyType.COMPLEMENTARY:
        return this.getComplementary(hex);
      case HarmonyType.ANALOGOUS:
        return this.getAnalogous(hex);
      case HarmonyType.TRIADIC:
        return this.getTriadic(hex);
      case HarmonyType.TETRADIC:
        return this.getTetradic(hex);
      case HarmonyType.SPLIT_COMPLEMENTARY:
        return this.getSplitComplementary(hex);
      case HarmonyType.MONOCHROMATIC:
        return this.getMonochromatic(hex);
      default:
        return [hex];
    }
  }

  /**
   * Get complementary color (opposite on color wheel)
   */
  private getComplementary(hex: string): string[] {
    const rgb = this.converter.hexToRgb(hex);
    if (!rgb) return [hex];

    const complementary = this.converter.rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
    return [complementary];
  }

  /**
   * Get analogous colors (adjacent on color wheel)
   */
  private getAnalogous(hex: string): string[] {
    const hsv = this.converter.hexToHsv(hex);
    if (!hsv) return [hex];

    const analogous = [];
    for (let i = -30; i <= 30; i += 15) {
      if (i === 0) continue;
      const newH = (hsv.h + i + 360) % 360;
      analogous.push(this.converter.hsvToHex(newH, hsv.s, hsv.v));
    }

    return analogous;
  }

  /**
   * Get triadic colors (120 degrees apart)
   */
  private getTriadic(hex: string): string[] {
    const hsv = this.converter.hexToHsv(hex);
    if (!hsv) return [hex];

    return [
      this.converter.hsvToHex((hsv.h + 120) % 360, hsv.s, hsv.v),
      this.converter.hsvToHex((hsv.h + 240) % 360, hsv.s, hsv.v),
    ];
  }

  /**
   * Get tetradic colors (square on color wheel)
   */
  private getTetradic(hex: string): string[] {
    const hsv = this.converter.hexToHsv(hex);
    if (!hsv) return [hex];

    return [
      this.converter.hsvToHex((hsv.h + 90) % 360, hsv.s, hsv.v),
      this.converter.hsvToHex((hsv.h + 180) % 360, hsv.s, hsv.v),
      this.converter.hsvToHex((hsv.h + 270) % 360, hsv.s, hsv.v),
    ];
  }

  /**
   * Get split complementary colors
   */
  private getSplitComplementary(hex: string): string[] {
    const hsv = this.converter.hexToHsv(hex);
    if (!hsv) return [hex];

    const complementaryH = (hsv.h + 180) % 360;
    return [
      this.converter.hsvToHex((complementaryH - 30 + 360) % 360, hsv.s, hsv.v),
      this.converter.hsvToHex((complementaryH + 30) % 360, hsv.s, hsv.v),
    ];
  }

  /**
   * Get monochromatic colors (same hue, different saturation/value)
   */
  private getMonochromatic(hex: string): string[] {
    const hsv = this.converter.hexToHsv(hex);
    if (!hsv) return [hex];

    const variations = [];
    // Vary saturation and value
    for (let i = 20; i <= 80; i += 20) {
      if (i === hsv.s) continue;
      variations.push(this.converter.hsvToHex(hsv.h, i, hsv.v));
    }

    return variations.slice(0, 4);
  }
}
