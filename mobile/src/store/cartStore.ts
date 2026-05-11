import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';
import { useProductStore } from './productStore';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options: any;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, variantId: number, quantity: number, notes?: string) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.get('/api/cart');
      const backendItems = res.data?.data || [];
      const products = useProductStore.getState().products;

      const mappedItems = backendItems.map((item: any) => {
        const productInfo = products.find(p => p.id === item.product_id);
        
        let options = { Material: item.variant_name };
        try {
           if (item.notes) options = JSON.parse(item.notes);
        } catch(e) {}

        return {
          id: item.cart_item_id,
          productId: item.product_id,
          name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          image: productInfo?.image || 'https://placehold.co/400x300?text=Produk',
          options: options,
          subtotal: item.subtotal
        };
      });

      set({ items: mappedItems, isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil keranjang", error);
      set({ isLoading: false });
    }
  },

  addItem: async (productId, variantId, quantity, notes = "{}") => {
    try {
      await axiosClient.post('/api/cart', {
        product_id: productId,
        variant_id: variantId,
        quantity: quantity,
        notes: notes
      });
      await get().fetchCart();
      return true;
    } catch (e) {
      console.error("Gagal menambah ke keranjang:", e);
      return false;
    }
  },

  removeItem: async (id) => {
    try {
      await axiosClient.delete('/api/cart', {
        data: { cart_item_id: id }
      });
      await get().fetchCart();
    } catch (e) {
      console.error("Gagal menghapus item:", e);
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      await axiosClient.put('/api/cart', {
        cart_item_id: id,
        quantity: quantity
      });
      await get().fetchCart();
    } catch (e) {
      console.error("Gagal update quantity:", e);
    }
  },

  getCartTotal: () => get().items.reduce((total, item) => total + item.subtotal, 0),
}));
