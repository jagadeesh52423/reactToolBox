/**
 * Standard Color Converter Implementation
 *
 * Implements IColorConverter interface with standard color conversion algorithms
 * Follows Single Responsibility Principle - only handles color conversions
 */

import { IColorConverter } from './IColorConverter';
import { RGB, HSL, HSV } from '../models/ColorModels';

export class StandardColorConverter implements IColorConverter {
  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): RGB | null {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle both 3-digit and 6-digit formats
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }

    return { r, g, b };
  }

  /**
   * Convert RGB to hex color
   */
  rgbToHex(r: number, g: number, b: number): string {
    return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
  }

  /**
   * Helper to convert a single RGB component to hex
   */
  private componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  /**
   * Convert RGB to HSL
   */
  rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    // Convert to degrees and percentages
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    const lightness = Math.round(l * 100);

    return { h, s, l: lightness };
  }

  /**
   * Convert HSL to RGB
   */
  hslToRgb(h: number, s: number, l: number): RGB {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * Convert RGB to HSV
   */
  rgbToHsv(r: number, g: number, b: number): HSV {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    if (diff !== 0) {
      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  }

  /**
   * Convert HSV to RGB
   */
  hsvToRgb(h: number, s: number, v: number): RGB {
    h /= 360;
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;

    if (h >= 0 && h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 1 / 6 && h < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 2 / 6 && h < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 3 / 6 && h < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 4 / 6 && h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  /**
   * Convert hex to HSL
   */
  hexToHsl(hex: string): HSL | null {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;
    return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
  }

  /**
   * Convert HSL to hex
   */
  hslToHex(h: number, s: number, l: number): string {
    const { r, g, b } = this.hslToRgb(h, s, l);
    return this.rgbToHex(r, g, b);
  }

  /**
   * Convert hex to HSV
   */
  hexToHsv(hex: string): HSV | null {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;
    return this.rgbToHsv(rgb.r, rgb.g, rgb.b);
  }

  /**
   * Convert HSV to hex
   */
  hsvToHex(h: number, s: number, v: number): string {
    const { r, g, b } = this.hsvToRgb(h, s, v);
    return this.rgbToHex(r, g, b);
  }
}
