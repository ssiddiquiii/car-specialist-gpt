import { create } from "zustand";

/* Apply theme to <html> element */
function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

/* Read saved preference or default to LIGHT */
const savedTheme = localStorage.getItem("csg-theme");
const initialDark = savedTheme ? savedTheme === "dark" : false;
applyTheme(initialDark);

export const useThemeStore = create((set) => ({
  isDark: initialDark,
  toggle: () =>
    set((state) => {
      const next = !state.isDark;
      applyTheme(next);
      localStorage.setItem("csg-theme", next ? "dark" : "light");
      return { isDark: next };
    }),
  setDark: (val) =>
    set(() => {
      applyTheme(val);
      localStorage.setItem("csg-theme", val ? "dark" : "light");
      return { isDark: val };
    }),
}));
