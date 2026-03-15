export interface GradientStop {
  offset: string;
  color: string;
}

export interface GradientDef {
  id: string;
  type: 'linear' | 'radial';
  stops: GradientStop[];
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  cx?: string;
  cy?: string;
  r?: string;
}

export type GradientTarget = 'node' | 'cluster' | 'edgePath';

export interface CustomTheme {
  id: string;
  name: string;
  category: 'built-in' | 'professional' | 'gradient' | 'dark';

  // For built-in Mermaid themes
  mermaidTheme?: 'default' | 'dark' | 'forest' | 'neutral' | 'base';

  // For custom themes with themeVariables
  themeVariables?: Record<string, string>;

  // For gradient themes
  gradients?: GradientDef[];
  gradientTargets?: GradientTarget[];

  // Suggested background color (auto-set when theme selected)
  suggestedBgColor?: string;

  // Preview colors (for theme selector swatches)
  previewColors: string[];
}

export const CUSTOM_THEMES: CustomTheme[] = [
  // ===== BUILT-IN MERMAID THEMES =====
  {
    id: 'built-in-default',
    name: 'Default',
    category: 'built-in',
    mermaidTheme: 'default',
    previewColors: ['#66b3ff', '#ffcc99', '#99ff99'],
  },
  {
    id: 'built-in-dark',
    name: 'Dark',
    category: 'built-in',
    mermaidTheme: 'dark',
    suggestedBgColor: '#1e1e1e',
    previewColors: ['#4d4d4d', '#666666', '#808080'],
  },
  {
    id: 'built-in-forest',
    name: 'Forest',
    category: 'built-in',
    mermaidTheme: 'forest',
    previewColors: ['#2e7d32', '#66bb6a', '#a5d6a7'],
  },
  {
    id: 'built-in-neutral',
    name: 'Neutral',
    category: 'built-in',
    mermaidTheme: 'neutral',
    previewColors: ['#b8b8b8', '#d0d0d0', '#e8e8e8'],
  },
  {
    id: 'built-in-base',
    name: 'Base',
    category: 'built-in',
    mermaidTheme: 'base',
    previewColors: ['#f4f4f4', '#d9d9d9', '#a6a6a6'],
  },

  // ===== PROFESSIONAL THEMES =====
  {
    id: 'professional-corporate-blue',
    name: 'Corporate Blue',
    category: 'professional',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#1565C0',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#0D47A1',
      lineColor: '#42A5F5',
      secondaryColor: '#E3F2FD',
      tertiaryColor: '#BBDEFB',
    },
    previewColors: ['#1565C0', '#42A5F5', '#E3F2FD'],
  },
  {
    id: 'professional-warm-earth',
    name: 'Warm Earth',
    category: 'professional',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#8D6E63',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#5D4037',
      lineColor: '#A1887F',
      secondaryColor: '#EFEBE9',
      tertiaryColor: '#D7CCC8',
    },
    previewColors: ['#8D6E63', '#A1887F', '#EFEBE9'],
  },
  {
    id: 'professional-minimalist-gray',
    name: 'Minimalist Gray',
    category: 'professional',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#546E7A',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#37474F',
      lineColor: '#78909C',
      secondaryColor: '#ECEFF1',
      tertiaryColor: '#CFD8DC',
    },
    previewColors: ['#546E7A', '#78909C', '#ECEFF1'],
  },
  {
    id: 'professional-coral-reef',
    name: 'Coral Reef',
    category: 'professional',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#FF7043',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#D84315',
      lineColor: '#FFAB91',
      secondaryColor: '#FBE9E7',
      tertiaryColor: '#FFCCBC',
    },
    previewColors: ['#FF7043', '#FFAB91', '#FBE9E7'],
  },

  // ===== GRADIENT THEMES =====
  {
    id: 'gradient-ocean-breeze',
    name: 'Ocean Breeze',
    category: 'gradient',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#0288D1',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#01579B',
      lineColor: '#4FC3F7',
      secondaryColor: '#E1F5FE',
      tertiaryColor: '#B3E5FC',
    },
    gradients: [
      {
        id: 'oceanGradient',
        type: 'linear',
        x1: '0%',
        y1: '0%',
        x2: '0%',
        y2: '100%',
        stops: [
          { offset: '0%', color: '#4FC3F7' },
          { offset: '50%', color: '#0288D1' },
          { offset: '100%', color: '#01579B' },
        ],
      },
    ],
    gradientTargets: ['node'],
    previewColors: ['#4FC3F7', '#0288D1', '#01579B'],
  },
  {
    id: 'gradient-sunset-glow',
    name: 'Sunset Glow',
    category: 'gradient',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#FF6F00',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#E65100',
      lineColor: '#FFB74D',
      secondaryColor: '#FFF3E0',
      tertiaryColor: '#FFE0B2',
    },
    gradients: [
      {
        id: 'sunsetGradient',
        type: 'linear',
        x1: '0%',
        y1: '0%',
        x2: '100%',
        y2: '100%',
        stops: [
          { offset: '0%', color: '#FF6F00' },
          { offset: '50%', color: '#FF5722' },
          { offset: '100%', color: '#E91E63' },
        ],
      },
    ],
    gradientTargets: ['node'],
    previewColors: ['#FF6F00', '#FF5722', '#E91E63'],
  },
  {
    id: 'gradient-emerald-forest',
    name: 'Emerald Forest',
    category: 'gradient',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#2E7D32',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#1B5E20',
      lineColor: '#66BB6A',
      secondaryColor: '#E8F5E9',
      tertiaryColor: '#C8E6C9',
    },
    gradients: [
      {
        id: 'forestGradient',
        type: 'linear',
        x1: '0%',
        y1: '0%',
        x2: '0%',
        y2: '100%',
        stops: [
          { offset: '0%', color: '#81C784' },
          { offset: '50%', color: '#4CAF50' },
          { offset: '100%', color: '#2E7D32' },
        ],
      },
    ],
    gradientTargets: ['node'],
    previewColors: ['#81C784', '#4CAF50', '#2E7D32'],
  },
  {
    id: 'gradient-royal-purple',
    name: 'Royal Purple',
    category: 'gradient',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#6A1B9A',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#4A148C',
      lineColor: '#AB47BC',
      secondaryColor: '#F3E5F5',
      tertiaryColor: '#E1BEE7',
    },
    gradients: [
      {
        id: 'purpleGradient',
        type: 'linear',
        x1: '0%',
        y1: '0%',
        x2: '100%',
        y2: '100%',
        stops: [
          { offset: '0%', color: '#9C27B0' },
          { offset: '50%', color: '#7B1FA2' },
          { offset: '100%', color: '#4A148C' },
        ],
      },
    ],
    gradientTargets: ['node'],
    previewColors: ['#9C27B0', '#7B1FA2', '#4A148C'],
  },
  {
    id: 'gradient-rose-gold',
    name: 'Rose Gold',
    category: 'gradient',
    mermaidTheme: 'base',
    themeVariables: {
      primaryColor: '#C2185B',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#880E4F',
      lineColor: '#F06292',
      secondaryColor: '#FCE4EC',
      tertiaryColor: '#F8BBD0',
    },
    gradients: [
      {
        id: 'roseGoldGradient',
        type: 'radial',
        cx: '50%',
        cy: '50%',
        r: '50%',
        stops: [
          { offset: '0%', color: '#F8BBD0' },
          { offset: '50%', color: '#EC407A' },
          { offset: '100%', color: '#C2185B' },
        ],
      },
    ],
    gradientTargets: ['node'],
    previewColors: ['#F8BBD0', '#EC407A', '#C2185B'],
  },

  // ===== DARK THEMES =====
  {
    id: 'dark-midnight',
    name: 'Midnight',
    category: 'dark',
    mermaidTheme: 'base',
    suggestedBgColor: '#0d1117',
    themeVariables: {
      primaryColor: '#161b22',
      primaryTextColor: '#c9d1d9',
      primaryBorderColor: '#30363d',
      lineColor: '#58a6ff',
      secondaryColor: '#21262d',
      tertiaryColor: '#30363d',
      background: '#0d1117',
      mainBkg: '#161b22',
      secondBkg: '#21262d',
      tertiaryBkg: '#30363d',
    },
    previewColors: ['#161b22', '#30363d', '#58a6ff'],
  },
  {
    id: 'dark-dracula',
    name: 'Dracula',
    category: 'dark',
    mermaidTheme: 'base',
    suggestedBgColor: '#282a36',
    themeVariables: {
      primaryColor: '#44475a',
      primaryTextColor: '#f8f8f2',
      primaryBorderColor: '#6272a4',
      lineColor: '#8be9fd',
      secondaryColor: '#282a36',
      tertiaryColor: '#44475a',
      background: '#282a36',
      mainBkg: '#44475a',
      secondBkg: '#44475a',
      tertiaryBkg: '#6272a4',
    },
    previewColors: ['#44475a', '#8be9fd', '#ff79c6'],
  },
  {
    id: 'dark-monokai',
    name: 'Monokai',
    category: 'dark',
    mermaidTheme: 'base',
    suggestedBgColor: '#272822',
    themeVariables: {
      primaryColor: '#3E3D32',
      primaryTextColor: '#F8F8F2',
      primaryBorderColor: '#75715E',
      lineColor: '#66D9EF',
      secondaryColor: '#272822',
      tertiaryColor: '#49483E',
      background: '#272822',
      mainBkg: '#3E3D32',
      secondBkg: '#49483E',
      tertiaryBkg: '#75715E',
    },
    previewColors: ['#3E3D32', '#66D9EF', '#A6E22E'],
  },
];

export function getThemeById(id: string): CustomTheme | undefined {
  return CUSTOM_THEMES.find(theme => theme.id === id);
}

export function getThemeCategories(): Record<string, CustomTheme[]> {
  const categories: Record<string, CustomTheme[]> = {
    'built-in': [],
    'professional': [],
    'gradient': [],
    'dark': [],
  };

  CUSTOM_THEMES.forEach(theme => {
    categories[theme.category].push(theme);
  });

  return categories;
}

export function isBuiltInTheme(theme: CustomTheme): boolean {
  return theme.category === 'built-in';
}
