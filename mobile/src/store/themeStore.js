import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@car_specialist_theme_mode_v2';

export const darkColors = {
  mode: 'dark',
  background: '#090D16',       // Deep Plot Space Slate
  headerBg: '#0F172A',         // Slate 900
  cardBg: '#111827',           // Obsidian Surface Card
  cardBorder: '#1E293B',       // Sharp Slate 800 Micro-Border
  cardBorderGlow: '#334155',   // Highlight Border
  subCardBg: '#0D1322',        // Deep Sub-Card Surface
  subCardBorder: '#1E293B',
  textPrimary: '#F8FAFC',      // Crisp White / Slate 50
  textSecondary: '#94A3B8',    // Graphite Silver / Slate 400
  textMuted: '#64748B',        // Muted Slate 500
  accent: '#3B82F6',           // Electric Cobalt Blue
  accentHover: '#2563EB',
  accentCyan: '#06B6D4',       // Telemetry Cyan Glow
  accentOrange: '#F59E0B',     // Amber Telemetry Warning
  userBubble: '#1D4ED8',       // Deep Sapphire User Bubble
  userText: '#FFFFFF',
  aiBubble: '#111827',         // Obsidian AI Bubble Card
  aiText: '#F8FAFC',
  inputBg: '#0F172A',
  inputBorder: '#1E293B',
  inputText: '#F8FAFC',
  inputPlaceholder: '#64748B',
  badgeBg: 'rgba(59, 130, 246, 0.12)',
  badgeBorder: 'rgba(59, 130, 246, 0.3)',
  badgeText: '#60A5FA',
  telemetryCyanBg: 'rgba(6, 182, 212, 0.12)',
  telemetryCyanBorder: 'rgba(6, 182, 212, 0.3)',
  telemetryCyanText: '#22D3EE',
  offlineGreenBg: 'rgba(16, 185, 129, 0.12)',
  offlineGreenBorder: 'rgba(16, 185, 129, 0.3)',
  offlineGreenText: '#34D399',
  skeletonBg: '#1E293B',
  skeletonHighlight: '#334155',
};

export const lightColors = {
  mode: 'light',
  background: '#FAFAFA',       // Pristine Soft Off-White
  headerBg: '#FFFFFF',         // Pure White
  cardBg: '#FFFFFF',           // Pure White Card
  cardBorder: '#E2E8F0',       // Crisp Slate 200 Micro-Border
  cardBorderGlow: '#CBD5E1',
  subCardBg: '#F1F5F9',        // Slate 100
  subCardBorder: '#E2E8F0',
  textPrimary: '#0F172A',      // Deep Slate 900
  textSecondary: '#475569',    // Slate 600
  textMuted: '#94A3B8',        // Slate 400
  accent: '#2563EB',           // Executive Blue
  accentHover: '#1D4ED8',
  accentCyan: '#0891B2',       // Telemetry Cyan
  accentOrange: '#D97706',     // Deep Amber
  userBubble: '#2563EB',       // Executive Blue User Bubble
  userText: '#FFFFFF',
  aiBubble: '#FFFFFF',         // White Card AI Bubble
  aiText: '#0F172A',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputText: '#0F172A',
  inputPlaceholder: '#94A3B8',
  badgeBg: 'rgba(37, 99, 235, 0.08)',
  badgeBorder: 'rgba(37, 99, 235, 0.22)',
  badgeText: '#2563EB',
  telemetryCyanBg: 'rgba(8, 145, 178, 0.08)',
  telemetryCyanBorder: 'rgba(8, 145, 178, 0.22)',
  telemetryCyanText: '#0891B2',
  offlineGreenBg: 'rgba(16, 185, 129, 0.1)',
  offlineGreenBorder: 'rgba(16, 185, 129, 0.25)',
  offlineGreenText: '#059669',
  skeletonBg: '#E2E8F0',
  skeletonHighlight: '#F1F5F9',
};

export const useThemeStore = create((set, get) => ({
  themeMode: 'dark',
  colors: darkColors,

  initTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light') {
        set({ themeMode: 'light', colors: lightColors });
      } else {
        set({ themeMode: 'dark', colors: darkColors });
      }
    } catch (e) {
      console.error("Failed to load theme preference:", e);
    }
  },

  toggleTheme: async () => {
    const current = get().themeMode;
    const nextMode = current === 'dark' ? 'light' : 'dark';
    const nextColors = nextMode === 'dark' ? darkColors : lightColors;

    set({ themeMode: nextMode, colors: nextColors });

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (e) {
      console.error("Failed to save theme preference:", e);
    }
  }
}));
