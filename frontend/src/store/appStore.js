import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Admin mode toggle
  isAdminMode: false,
  adminToken: null,

  // Terminal state
  terminalCommands: [],
  currentCommand: '',

  // Loading states
  isLoading: false,
  loadingMessage: '',

  // Products
  products: [],
  categories: [],
  featuredProducts: [],

  // Filters
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',

  // Admin functions
  toggleAdminMode: () => {
    set({ isAdminMode: !get().isAdminMode });
  },

  setAdminToken: (token) => {
    set({ adminToken: token, isAdminMode: !!token });
  },

  // Terminal functions
  addCommand: (command, output) => {
    const commands = get().terminalCommands;
    set({
      terminalCommands: [...commands, { command, output, timestamp: Date.now() }]
    });
  },

  setCurrentCommand: (command) => {
    set({ currentCommand: command });
  },

  clearTerminal: () => {
    set({ terminalCommands: [] });
  },

  // Loading functions
  setLoading: (isLoading, message = '') => {
    set({ isLoading, loadingMessage: message });
  },

  // Product functions
  setProducts: (products) => {
    set({ products });
  },

  setCategories: (categories) => {
    set({ categories });
  },

  setFeaturedProducts: (featuredProducts) => {
    set({ featuredProducts });
  },

  // Filter functions
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  // Get filtered products
  getFilteredProducts: () => {
    const { products, selectedCategory, searchQuery, sortBy } = get();
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  },

  // Reset filters
  resetFilters: () => {
    set({
      selectedCategory: 'all',
      searchQuery: '',
      sortBy: 'newest'
    });
  }
}));

export default useAppStore;