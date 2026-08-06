import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@car_specialist_theme_mode_v2';

// Tesla meets Uber — clean light with dark navy accent
export const lightColors = {
  mode: 'light',
  background: '#F8F9FA',
  headerBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  subCardBg: '#F3F4F6',
  subCardBorder: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  accent: '#1E3A5F',           // Dark Navy — Tesla meets Uber
  accentHover: '#162D49',
  accentCyan: '#0369A1',
  accentOrange: '#D97706',
  userBubble: '#1E3A5F',
  userText: '#FFFFFF',
  aiBubble: '#FFFFFF',
  aiText: '#111827',
  aiBubbleBorder: '#E5E7EB',
  inputBg: '#FFFFFF',
  inputBorder: '#E5E7EB',
  inputText: '#111827',
  inputPlaceholder: '#9CA3AF',
  badgeBg: 'rgba(30, 58, 95, 0.07)',
  badgeBorder: 'rgba(30, 58, 95, 0.18)',
  badgeText: '#1E3A5F',
  offlineGreenBg: 'rgba(16, 185, 129, 0.08)',
  offlineGreenBorder: 'rgba(16, 185, 129, 0.2)',
  offlineGreenText: '#059669',
  skeletonBg: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
  shadow: 'rgba(0,0,0,0.08)',
};

// Dark mode — refined dark navy
export const darkColors = {
  mode: 'dark',
  background: '#0F111A',
  headerBg: '#161922',
  cardBg: '#1C1F2E',
  cardBorder: '#252836',
  subCardBg: '#13151F',
  subCardBorder: '#252836',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  accent: '#3B82F6',
  accentHover: '#2563EB',
  accentCyan: '#06B6D4',
  accentOrange: '#F59E0B',
  userBubble: '#1E3A5F',
  userText: '#FFFFFF',
  aiBubble: '#1C1F2E',
  aiText: '#F9FAFB',
  aiBubbleBorder: '#252836',
  inputBg: '#161922',
  inputBorder: '#252836',
  inputText: '#F9FAFB',
  inputPlaceholder: '#6B7280',
  badgeBg: 'rgba(59, 130, 246, 0.1)',
  badgeBorder: 'rgba(59, 130, 246, 0.25)',
  badgeText: '#60A5FA',
  offlineGreenBg: 'rgba(16, 185, 129, 0.1)',
  offlineGreenBorder: 'rgba(16, 185, 129, 0.25)',
  offlineGreenText: '#34D399',
  skeletonBg: '#252836',
  skeletonHighlight: '#2E3347',
  shadow: 'rgba(0,0,0,0.3)',
};

export const useThemeStore = create((set, get) => ({
  themeMode: 'light',
  colors: lightColors,

  initTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark') {
        set({ themeMode: 'dark', colors: darkColors });
      } else {
        set({ themeMode: 'light', colors: lightColors });
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
