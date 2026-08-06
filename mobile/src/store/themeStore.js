import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT, DARK } from '../theme';

const THEME_KEY = '@car_ai_theme_v3';

export const useThemeStore = create((set, get) => ({
  themeMode: 'light',
  colors: LIGHT,

  initTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'dark') set({ themeMode: 'dark', colors: DARK });
      else                  set({ themeMode: 'light', colors: LIGHT });
    } catch (_) {}
  },

  toggleTheme: async () => {
    const next = get().themeMode === 'dark' ? 'light' : 'dark';
    set({ themeMode: next, colors: next === 'dark' ? DARK : LIGHT });
    try { await AsyncStorage.setItem(THEME_KEY, next); } catch (_) {}
  },
}));
