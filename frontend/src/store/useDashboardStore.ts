import { create } from 'zustand';
import { apiFetch } from '../utils/apiClient';

// Types pour les données du dashboard
export interface DashboardData {
  user?: {
    id: string;
    email: string;
    name?: string;
    plan?: string;
    role?: string;
  };
  stats?: {
    totalAudits?: number;
    activeAudits?: number;
    completedAudits?: number;
    failedAudits?: number;
  };
  recentAudits?: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: string;
  }>;
  alerts?: Array<{
    id: string;
    type: string;
    message: string;
    severity: string;
  }>;
}

// Types pour le state du store
export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchDashboard: (force?: boolean) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Configuration
const CACHE_DURATION = 30 * 1000; // 30 secondes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

// Fonction helper pour delay avec retry
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour effectuer la requête avec retry
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Si la réponse est OK, on retourne
    if (response.ok) {
      return response;
    }
    
    // Si c'est une erreur 401/403, pas de retry (auth error)
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Authentication error: ${response.status}`);
    }
    
    // Si c'est une erreur serveur et qu'il reste des retries
    if (response.status >= 500 && retries > 0) {
      console.warn(`Server error ${response.status}, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    
    // Autres erreurs
    throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    if (retries > 0 && error instanceof TypeError) {
      // Erreur réseau (Network error), on retry
      console.warn(`Network error, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// Création du store Zustand
export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  lastFetch: null,

  fetchDashboard: async (force = false) => {
    const state = get();
    const now = Date.now();

    // Vérifier le cache (30 secondes)
    if (!force && state.lastFetch && (now - state.lastFetch < CACHE_DURATION)) {
      console.log('Using cached dashboard data');
      return;
    }

    // Si déjà en cours de chargement, on évite les requêtes multiples
    if (state.loading) {
      console.log('Dashboard fetch already in progress');
      return;
    }

    // Démarrer le chargement
    set({ loading: true, error: null });

    try {
      // Effectuer la requête avec retry et gestion automatique des erreurs 401/403
      const data: DashboardData = await apiFetch('/api/dashboard');

      // Mettre à jour le state avec succès
      set({
        data,
        loading: false,
        error: null,
        lastFetch: Date.now(),
      });

      console.log('Dashboard data fetched successfully');
    } catch (error) {
      // Gérer les erreurs
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      set({
        loading: false,
        error: errorMessage,
        // On garde les données précédentes en cas d'erreur (si elles existent)
      });

      console.error('Failed to fetch dashboard data:', errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      data: null,
      loading: false,
      error: null,
      lastFetch: null,
    });
  },
}));

// Export du hook avec des selectors utiles
export const useDashboardData = () => useDashboardStore((state) => state.data);
export const useDashboardLoading = () => useDashboardStore((state) => state.loading);
export const useDashboardError = () => useDashboardStore((state) => state.error);

// Hook personnalisé avec auto-fetch
export const useAutoFetchDashboard = (autoFetch = true) => {
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const data = useDashboardStore((state) => state.data);

  // Auto-fetch au montage du composant
  React.useEffect(() => {
    if (autoFetch) {
      fetchDashboard();
    }
  }, [autoFetch, fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
};

// Export par défaut
export default useDashboardStore;
