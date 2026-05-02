import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      toggleItem: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item.id === product.id);
        
        if (exists) {
          set({ items: currentItems.filter((item) => item.id !== product.id) });
          toast.success('Dihapus dari wishlist', { icon: '💔' });
        } else {
          set({ items: [...currentItems, product] });
          toast.success('Ditambahkan ke wishlist', { icon: '❤️' });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'jaya-wishlist-storage',
    }
  )
);
