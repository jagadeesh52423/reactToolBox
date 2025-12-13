interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

// Convert hex color to RGB
export function hexToRgb(hex: string): RGB | null {
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

// Convert RGB to hex color
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

// Helper to convert a single RGB component to hex
function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

// Convert hex color to HSL
export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lightness = Math.round(l * 100);
  
  return { h, s, l: lightness };
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
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
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Convert RGB to HSV
export function rgbToHsv(r: number, g: number, b: number): HSV {
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
      case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
      case g: h = (b - r) / diff + 2; break;
      case b: h = (r - g) / diff + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

// Convert HSV to RGB
export function hsvToRgb(h: number, s: number, v: number): RGB {
  h /= 360;
  s /= 100;
  v /= 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 1/6) {
    r = c; g = x; b = 0;
  } else if (h >= 1/6 && h < 2/6) {
    r = x; g = c; b = 0;
  } else if (h >= 2/6 && h < 3/6) {
    r = 0; g = c; b = x;
  } else if (h >= 3/6 && h < 4/6) {
    r = 0; g = x; b = c;
  } else if (h >= 4/6 && h < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

// Convert hex to HSV
export function hexToHsv(hex: string): HSV | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

// Convert HSV to hex
export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

// Generate random color
export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// CSS Named Colors
export const CSS_NAMED_COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
  '#FFA500', '#FFC0CB', '#A52A2A', '#8A2BE2', '#D2691E', '#5F9EA0',
  '#7FFF00', '#D2691E', '#FF7F50', '#6495ED', '#DC143C', '#00BFFF',
  '#696969', '#FF1493', '#00CED1', '#FFD700', '#ADFF2F', '#FF69B4',
  '#CD5C5C', '#4B0082', '#F0E68C', '#E6E6FA', '#90EE90', '#FFB6C1',
  '#20B2AA', '#87CEFA', '#778899', '#B0C4DE', '#FFFFE0', '#00FF00',
  '#32CD32', '#FAF0E6', '#FF00FF', '#66CDAA', '#0000CD', '#BA55D3',
  '#9370DB', '#3CB371', '#7B68EE', '#00FA9A', '#48D1CC', '#C71585',
  '#191970', '#F5FFFA', '#FFE4E1', '#FFDEAD', '#000000', '#FFFFFF'
];

// Popular color palettes
export const COLOR_PALETTES = {
  material: [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
    '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E'
  ],
  pastel: [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#C9C9FF',
    '#FFBAFF', '#D4A5A5', '#A5D4D4', '#A5A5D4', '#D4A5D4', '#A5D4A5'
  ],
  vintage: [
    '#8B4513', '#CD853F', '#DEB887', '#F4A460', '#D2691E', '#A0522D',
    '#B22222', '#DC143C', '#8B0000', '#2F4F4F', '#708090', '#BC8F8F'
  ],
  neon: [
    '#FF073A', '#FF0099', '#BF00FF', '#8000FF', '#4000FF', '#0080FF',
    '#00FFFF', '#00FF80', '#80FF00', '#FFFF00', '#FF8000', '#FF4000'
  ]
};

// Get complementary color
export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

// Get analogous colors
export function getAnalogousColors(hex: string): string[] {
  const hsv = hexToHsv(hex);
  if (!hsv) return [hex];

  const analogous = [];
  for (let i = -30; i <= 30; i += 15) {
    if (i === 0) continue;
    const newH = (hsv.h + i + 360) % 360;
    analogous.push(hsvToHex(newH, hsv.s, hsv.v));
  }

  return analogous;
}

// Get triadic colors
export function getTriadicColors(hex: string): string[] {
  const hsv = hexToHsv(hex);
  if (!hsv) return [hex];

  return [
    hsvToHex((hsv.h + 120) % 360, hsv.s, hsv.v),
    hsvToHex((hsv.h + 240) % 360, hsv.s, hsv.v)
  ];
}
