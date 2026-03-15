export type NodeShape =
  | 'rect'
  | 'rounded'
  | 'stadium'
  | 'diamond'
  | 'circle'
  | 'hexagon'
  | 'parallelogram'
  | 'subroutine';

export interface GradientStop {
  offset: string;
  color: string;
}

export interface NodeStyleDef {
  gradient: { stops: GradientStop[] };
  textColor: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface FlowchartTheme {
  id: string;
  name: string;
  background: string;
  nodeStyles: Record<NodeShape, NodeStyleDef>;
  edgeColor: string;
  edgeLabelColor: string;
  edgeLabelBg: string;
  shadowColor: string;
  legendTextColor: string;
  subgraphBg: string;
  subgraphBorder: string;
  subgraphTextColor: string;
  previewColors: string[];
}

function makeNodeStyle(
  from: string,
  to: string,
  textColor = '#ffffff',
  strokeColor?: string,
  strokeWidth?: number,
): NodeStyleDef {
  return {
    gradient: {
      stops: [
        { offset: '0%', color: from },
        { offset: '100%', color: to },
      ],
    },
    textColor,
    ...(strokeColor ? { strokeColor } : {}),
    ...(strokeWidth !== undefined ? { strokeWidth } : {}),
  };
}

const vibrantTheme: FlowchartTheme = {
  id: 'vibrant',
  name: 'Vibrant',
  background: '#ffffff',
  nodeStyles: {
    stadium: makeNodeStyle('#7C3AED', '#A855F7'),
    rect: makeNodeStyle('#0EA5E9', '#38BDF8'),
    diamond: makeNodeStyle('#F59E0B', '#FBBF24'),
    rounded: makeNodeStyle('#10B981', '#34D399'),
    circle: makeNodeStyle('#EC4899', '#F472B6'),
    hexagon: makeNodeStyle('#6366F1', '#818CF8'),
    parallelogram: makeNodeStyle('#06B6D4', '#22D3EE'),
    subroutine: makeNodeStyle('#475569', '#64748B'),
  },
  edgeColor: '#94A3B8',
  edgeLabelColor: '#64748B',
  edgeLabelBg: '#ffffff',
  shadowColor: '#00000020',
  legendTextColor: '#334155',
  subgraphBg: '#f8fafc',
  subgraphBorder: '#e2e8f0',
  subgraphTextColor: '#475569',
  previewColors: ['#7C3AED', '#0EA5E9', '#F59E0B', '#10B981'],
};

const oceanTheme: FlowchartTheme = {
  id: 'ocean',
  name: 'Ocean Breeze',
  background: '#f0f9ff',
  nodeStyles: {
    stadium: makeNodeStyle('#1E40AF', '#3B82F6'),
    rect: makeNodeStyle('#0D9488', '#14B8A6'),
    diamond: makeNodeStyle('#0284C7', '#38BDF8'),
    rounded: makeNodeStyle('#0891B2', '#22D3EE'),
    circle: makeNodeStyle('#1E3A5F', '#2563EB'),
    hexagon: makeNodeStyle('#334155', '#475569'),
    parallelogram: makeNodeStyle('#06B6D4', '#67E8F9'),
    subroutine: makeNodeStyle('#1E293B', '#334155'),
  },
  edgeColor: '#64748B',
  edgeLabelColor: '#475569',
  edgeLabelBg: '#f0f9ff',
  shadowColor: '#00000018',
  legendTextColor: '#1E3A5F',
  subgraphBg: '#e0f2fe',
  subgraphBorder: '#bae6fd',
  subgraphTextColor: '#0c4a6e',
  previewColors: ['#1E40AF', '#0D9488', '#0284C7', '#0891B2'],
};

const corporateTheme: FlowchartTheme = {
  id: 'corporate',
  name: 'Corporate',
  background: '#f8fafc',
  nodeStyles: {
    stadium: makeNodeStyle('#1E3A5F', '#2563EB'),
    rect: makeNodeStyle('#3B82F6', '#60A5FA'),
    diamond: makeNodeStyle('#6B7280', '#9CA3AF'),
    rounded: makeNodeStyle('#2563EB', '#60A5FA'),
    circle: makeNodeStyle('#1E293B', '#334155'),
    hexagon: makeNodeStyle('#475569', '#64748B'),
    parallelogram: makeNodeStyle('#4B5563', '#6B7280'),
    subroutine: makeNodeStyle('#374151', '#4B5563'),
  },
  edgeColor: '#9CA3AF',
  edgeLabelColor: '#6B7280',
  edgeLabelBg: '#f8fafc',
  shadowColor: '#00000012',
  legendTextColor: '#374151',
  subgraphBg: '#f1f5f9',
  subgraphBorder: '#cbd5e1',
  subgraphTextColor: '#475569',
  previewColors: ['#1E3A5F', '#3B82F6', '#6B7280'],
};

const darkTheme: FlowchartTheme = {
  id: 'dark',
  name: 'Dark Mode',
  background: '#1e1e2e',
  nodeStyles: {
    stadium: makeNodeStyle('#8B5CF6', '#C084FC'),
    rect: makeNodeStyle('#3B82F6', '#60A5FA'),
    diamond: makeNodeStyle('#F59E0B', '#FCD34D'),
    rounded: makeNodeStyle('#10B981', '#6EE7B7'),
    circle: makeNodeStyle('#EC4899', '#F9A8D4'),
    hexagon: makeNodeStyle('#6366F1', '#A5B4FC'),
    parallelogram: makeNodeStyle('#06B6D4', '#67E8F9'),
    subroutine: makeNodeStyle('#64748B', '#94A3B8'),
  },
  edgeColor: '#64748B',
  edgeLabelColor: '#94A3B8',
  edgeLabelBg: '#1e1e2e',
  shadowColor: '#00000040',
  legendTextColor: '#94A3B8',
  subgraphBg: '#2a2a3e',
  subgraphBorder: '#3a3a5e',
  subgraphTextColor: '#94A3B8',
  previewColors: ['#8B5CF6', '#3B82F6', '#F59E0B', '#10B981'],
};

const forestTheme: FlowchartTheme = {
  id: 'forest',
  name: 'Forest',
  background: '#f0fdf4',
  nodeStyles: {
    stadium: makeNodeStyle('#166534', '#22C55E'),
    rect: makeNodeStyle('#059669', '#34D399'),
    diamond: makeNodeStyle('#92400E', '#F59E0B'),
    rounded: makeNodeStyle('#65A30D', '#A3E635'),
    circle: makeNodeStyle('#14532D', '#166534'),
    hexagon: makeNodeStyle('#3F6212', '#84CC16'),
    parallelogram: makeNodeStyle('#4D7C0F', '#BEF264'),
    subroutine: makeNodeStyle('#44403C', '#78716C'),
  },
  edgeColor: '#6B7280',
  edgeLabelColor: '#4B5563',
  edgeLabelBg: '#f0fdf4',
  shadowColor: '#00000018',
  legendTextColor: '#14532D',
  subgraphBg: '#dcfce7',
  subgraphBorder: '#bbf7d0',
  subgraphTextColor: '#166534',
  previewColors: ['#166534', '#059669', '#92400E', '#65A30D'],
};

const sunsetTheme: FlowchartTheme = {
  id: 'sunset',
  name: 'Sunset Glow',
  background: '#fff7ed',
  nodeStyles: {
    stadium: makeNodeStyle('#EA580C', '#FB923C'),
    rect: makeNodeStyle('#E11D48', '#FB7185'),
    diamond: makeNodeStyle('#7C3AED', '#A78BFA'),
    rounded: makeNodeStyle('#D97706', '#FCD34D'),
    circle: makeNodeStyle('#DC2626', '#F87171'),
    hexagon: makeNodeStyle('#9333EA', '#C084FC'),
    parallelogram: makeNodeStyle('#BE185D', '#F472B6'),
    subroutine: makeNodeStyle('#78350F', '#A16207'),
  },
  edgeColor: '#9CA3AF',
  edgeLabelColor: '#78350F',
  edgeLabelBg: '#fff7ed',
  shadowColor: '#00000018',
  legendTextColor: '#78350F',
  subgraphBg: '#ffedd5',
  subgraphBorder: '#fed7aa',
  subgraphTextColor: '#9a3412',
  previewColors: ['#EA580C', '#E11D48', '#7C3AED', '#D97706'],
};

export const flowchartThemes: FlowchartTheme[] = [
  vibrantTheme,
  oceanTheme,
  corporateTheme,
  darkTheme,
  forestTheme,
  sunsetTheme,
];

export function getFlowchartThemeById(id: string): FlowchartTheme {
  return flowchartThemes.find((t) => t.id === id) || flowchartThemes[0];
}

export function getDefaultFlowchartTheme(): FlowchartTheme {
  return flowchartThemes[0];
}
