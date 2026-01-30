export type ThemeState = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  initializeTheme: () => void;
};

declare const useThemeStore: import('zustand').UseBoundStore<import('zustand').StoreApi<ThemeState>>;

export default useThemeStore;
export { useThemeStore as useTheme };
