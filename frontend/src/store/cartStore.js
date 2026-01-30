import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      total: 0,

      // Add item to cart
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
          });
        }
        
        get().calculateTotal();
      },

      // Remove item from cart
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        });
        get().calculateTotal();
      },

      // Update item quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
        });
        get().calculateTotal();
      },

      // Clear cart
      clearCart: () => {
        set({ items: [], total: 0 });
      },

      // Calculate total
      calculateTotal: () => {
        const total = get().items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 
          0
        );
        set({ total });
      },

      // Toggle cart visibility
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      // Open cart
      openCart: () => {
        set({ isOpen: true });
      },

      // Close cart
      closeCart: () => {
        set({ isOpen: false });
      },

      // Get cart item count
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'auditsec-cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        total: state.total 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateTotal();
        }
      }
    }
  )
);

export default useCartStore;