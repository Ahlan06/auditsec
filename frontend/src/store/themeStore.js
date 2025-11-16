import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      // Theme state
      isDarkMode: true, // Par défaut en mode sombre (cyberpunk)
      
      // Theme toggle
      toggleTheme: () => {
        const newTheme = !get().isDarkMode;
        set({ isDarkMode: newTheme });
        
        // Appliquer le thème au document immédiatement
        setTimeout(() => {
          if (newTheme) {
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
        }, 0);
      },
      
      // Initialize theme
      initializeTheme: () => {
        const isDark = get().isDarkMode;
        // Force immediate application
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
      }
    }),
    {
      name: 'auditsec-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Initialiser le thème après la rehydratation
        if (state) {
          setTimeout(() => {
            state.initializeTheme();
          }, 100);
        }
      }
    }
  )
);

// Forcer l'initialisation immédiate
if (typeof window !== 'undefined') {
  const store = useThemeStore.getState();
  store.initializeTheme();
};

export default useThemeStore;
export { useThemeStore as useTheme };