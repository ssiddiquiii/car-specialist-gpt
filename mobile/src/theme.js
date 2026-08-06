/**
 * DESIGN TOKENS — Car AI Minimalist 2025
 * Single source of truth for all screens.
 *
 * Principles:
 *   - Generous whitespace
 *   - One accent color used sparingly
 *   - Consistent type scale
 *   - Thin borders or no borders
 *   - Animations: subtle, purposeful
 */

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 100,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 52,
};

export const TYPE = {
  hero:    { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, lineHeight: 34 },
  title:   { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, lineHeight: 26 },
  heading: { fontSize: 16, fontWeight: '600', letterSpacing: -0.2, lineHeight: 22 },
  body:    { fontSize: 14, fontWeight: '400', lineHeight: 21 },
  small:   { fontSize: 12, fontWeight: '400', lineHeight: 17 },
  label:   { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, lineHeight: 15 },
};

export const LIGHT = {
  mode: 'light',
  bg:           '#FFFFFF',
  bgSoft:       '#F9FAFB',
  surface:      '#FFFFFF',
  border:       '#F0F0F0',
  borderStrong: '#E5E7EB',
  accent:       '#1C2B4A',      // Deep navy — used sparingly
  accentSoft:   '#EEF1F7',
  accentGreen:  '#059669',
  textPrimary:  '#0D0D0D',
  textSub:      '#6B7280',
  textMuted:    '#B0B0B0',
  userBubble:   '#1C2B4A',
  userText:     '#FFFFFF',
  aiBubble:     '#F5F5F5',
  aiText:       '#0D0D0D',
  skeleton:     '#EFEFEF',
  shadow:       'rgba(0,0,0,0.06)',
};

export const DARK = {
  mode: 'dark',
  bg:           '#0C0C0E',
  bgSoft:       '#111115',
  surface:      '#18181C',
  border:       '#242428',
  borderStrong: '#2E2E35',
  accent:       '#5B8DEF',      // Softer blue in dark
  accentSoft:   'rgba(91,141,239,0.12)',
  accentGreen:  '#34D399',
  textPrimary:  '#F5F5F7',
  textSub:      '#8A8A8E',
  textMuted:    '#555558',
  userBubble:   '#1C2B4A',
  userText:     '#FFFFFF',
  aiBubble:     '#18181C',
  aiText:       '#F5F5F7',
  skeleton:     '#242428',
  shadow:       'rgba(0,0,0,0.35)',
};
