/**
 * Color Picker - Type Definitions and Models
 *
 * Contains all interfaces, types, and enums used throughout the Color Picker module
 */

// RGB Color Model
export interface RGB {
  r: number;
  g: number;
  b: number;
}

// HSL Color Model
export interface HSL {
  h: number;
  s: number;
  l: number;
}

// HSV Color Model
export interface HSV {
  h: number;
  s: number;
  v: number;
}

// Color Format Enum
export enum ColorFormat {
  HEX = 'hex',
  RGB = 'rgb',
  HSL = 'hsl',
  HSV = 'hsv',
}

// Picker Tab Types
export enum PickerTab {
  INPUTS = 'inputs',
  PALETTES = 'palettes',
  WHEEL = 'wheel',
  HARMONY = 'harmony',
}

// Color Harmony Types
export enum HarmonyType {
  COMPLEMENTARY = 'complementary',
  ANALOGOUS = 'analogous',
  TRIADIC = 'triadic',
  TETRADIC = 'tetradic',
  SPLIT_COMPLEMENTARY = 'split_complementary',
  MONOCHROMATIC = 'monochromatic',
}

// Palette Names
export type PaletteName = 'material' | 'pastel' | 'vintage' | 'neon';

// Color State Interface
export interface ColorState {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
}

// Color History Item
export interface ColorHistoryItem {
  color: string;
  timestamp: number;
}

// Notification Type
export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}
