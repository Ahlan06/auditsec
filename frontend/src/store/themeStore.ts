import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeState = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  initializeTheme: () => void;
};

const applyThemeToDocument = (isDark: boolean) => {
  if (typeof document === 'undefined') return;

  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }
};

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: true,
      toggleTheme: () => {
        const newTheme = !get().isDarkMode;
        set({ isDarkMode: newTheme });
        setTimeout(() => applyThemeToDocument(newTheme), 0);
      },
      initializeTheme: () => {
        applyThemeToDocument(get().isDarkMode);
      },
    }),
    {
      name: 'auditsec-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        setTimeout(() => {
          state.initializeTheme();
        }, 100);
      },
    }
  )
);

if (typeof window !== 'undefined') {
  useThemeStore.getState().initializeTheme();
}

export default useThemeStore;
export { useThemeStore as useTheme };
