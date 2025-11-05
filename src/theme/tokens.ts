/**
 * Design tokens for Boxing Timer
 * WCAG AA compliant colors
 */

export const COLORS = {
  // Primary lights
  green: '#00D26A', // Work interval
  yellow: '#FFD84D', // Final seconds (yellow threshold)
  red: '#FF4D4F', // Rest interval

  // Background
  background: '#0B0B0C',
  surface: '#1A1A1B',

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    muted: '#666666',
  },

  // UI
  border: '#333333',
  divider: '#2A2A2B',
  disabled: '#555555',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 56,
    '5xl': 72,
  },
  lineHeights: {
    tight: 1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00D26A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
};

export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
};
