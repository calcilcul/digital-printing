import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';

interface CartItem {
  cart_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  variant_name: string;
  notes: string;
  subtotal: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.get('/api/cart');
      const cartData = res.data;
      
      const items = cartData?.items || [];
      const totalItems = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
      const calculatedTotalPrice = items.reduce((acc: number, item: any) => acc + item.subtotal, 0);
      
      set({ 
        items, 
        totalItems,
        totalPrice: cartData?.total_price || calculatedTotalPrice,
      });
    } catch (error) {
      // If error (e.g. 401 unauthenticated or empty cart), clear cart
      set({ items: [], totalItems: 0, totalPrice: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: () => {
    set({ items: [], totalItems: 0, totalPrice: 0 });
  }
}));
