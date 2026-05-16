// Design tokens for CreativeForge AI Studio
// Dark theme with glassmorphism accents — inspired by RunwayML, Linear, Figma

export const theme = {
  colors: {
    background: {
      primary: '#0a0a0f',
      secondary: '#12121a',
      tertiary: '#1a1a25',
      hover: '#222233',
    },
    glass: {
      light: 'rgba(255,255,255,0.03)',
      medium: 'rgba(255,255,255,0.07)',
      strong: 'rgba(255,255,255,0.12)',
      border: 'rgba(255,255,255,0.1)',
      borderHover: 'rgba(255,255,255,0.2)',
    },
    accent: {
      primary: '#6366f1',
      primaryHover: '#818cf8',
      secondary: '#8b5cf6',
      tertiary: '#a78bfa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      muted: '#64748b',
      inverse: '#0a0a0f',
    },
    node: {
      text: '#2196F3',
      image: '#FF9800',
      canvas: '#9C27B0',
      output: '#6366f1',
      start: '#10b981',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  breakpoints: {
    mobile: 360,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
  animation: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
    lg: '0 8px 24px rgba(0,0,0,0.5)',
    glow: '0 0 20px rgba(99,102,241,0.3)',
  },
  sidebar: {
    width: 240,
    collapsedWidth: 64,
  },
  topbar: {
    height: 56,
  },
} as const;

export type Theme = typeof theme;
