import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@car_specialist_theme_mode_v1';

export const darkColors = {
  mode: 'dark',
  background: '#0F172A',      // Slate 900
  headerBg: '#1E293B',        // Slate 800
  cardBg: '#1E293B',          // Slate 800
  cardBorder: '#334155',      // Slate 700
  subCardBg: '#0F172A',       // Slate 900
  subCardBorder: '#334155',
  textPrimary: '#F8FAFC',     // Slate 50
  textSecondary: '#94A3B8',   // Slate 400
  textMuted: '#64748B',       // Slate 500
  accent: '#3B82F6',          // Sapphire Cobalt Blue
  accentSecondary: '#F97316', // Amber Terracotta
  userBubble: '#2563EB',      // Rich Blue
  userText: '#FFFFFF',
  aiBubble: '#1E293B',        // Slate 800
  aiText: '#F8FAFC',
  inputBg: '#0F172A',
  inputBorder: '#334155',
  inputText: '#F8FAFC',
  inputPlaceholder: '#64748B',
  badgeBg: 'rgba(59, 130, 246, 0.15)',
  badgeBorder: 'rgba(59, 130, 246, 0.35)',
  badgeText: '#60A5FA',
  offlineGreenBg: 'rgba(16, 185, 129, 0.15)',
  offlineGreenBorder: 'rgba(16, 185, 129, 0.35)',
  offlineGreenText: '#34D399',
  skeletonBg: '#1E293B',
  skeletonHighlight: '#334155',
};

export const lightColors = {
  mode: 'light',
  background: '#F8FAFC',      // Warm Off-White / Slate 50
  headerBg: '#FFFFFF',        // Pure White
  cardBg: '#FFFFFF',          // Pure White
  cardBorder: '#E2E8F0',      // Slate 200
  subCardBg: '#F1F5F9',       // Slate 100
  subCardBorder: '#CBD5E1',   // Slate 300
  textPrimary: '#0F172A',     // Slate 900
  textSecondary: '#475569',   // Slate 600
  textMuted: '#94A3B8',       // Slate 400
  accent: '#2563EB',          // Executive Blue
  accentSecondary: '#EA580C', // Deep Terracotta
  userBubble: '#2563EB',      // Executive Blue
  userText: '#FFFFFF',
  aiBubble: '#FFFFFF',        // White card
  aiText: '#0F172A',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputText: '#0F172A',
  inputPlaceholder: '#94A3B8',
  badgeBg: 'rgba(37, 99, 235, 0.1)',
  badgeBorder: 'rgba(37, 99, 235, 0.25)',
  badgeText: '#2563EB',
  offlineGreenBg: 'rgba(16, 185, 129, 0.12)',
  offlineGreenBorder: 'rgba(16, 185, 129, 0.3)',
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
