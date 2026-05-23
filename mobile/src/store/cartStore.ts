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
  clearCart: () => void;
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
    const previousItems = get().items;
    
    // Optimistic Update
    const productInfo = useProductStore.getState().products.find(p => p.id === productId);
    const variantInfo = productInfo?.variants?.find((v: any) => v.id === variantId);
    const price = variantInfo?.price || productInfo?.base_price || 0;
    
    const tempItem: CartItem = {
      id: Math.random() as any, // Temp ID
      productId,
      name: productInfo?.name || 'Produk',
      price,
      quantity,
      image: productInfo?.image || 'https://placehold.co/400x300?text=Produk',
      options: { Material: variantInfo?.variant_name, ...JSON.parse(notes || "{}") },
      subtotal: price * quantity
    };
    
    set({ items: [...previousItems, tempItem] });

    try {
      await axiosClient.post('/api/cart', {
        product_id: productId,
        variant_id: variantId,
        quantity: quantity,
        notes: notes
      });
      // Ambil keranjang asli dari DB untuk mendapatkan ID sebenarnya
      get().fetchCart();
      return true;
    } catch (e) {
      console.error("Gagal menambah ke keranjang:", e);
      set({ items: previousItems }); // Rollback
      return false;
    }
  },

  removeItem: async (id) => {
    const previousItems = get().items;
    set({ items: previousItems.filter(item => item.id !== id) }); // Optimistic UI

    try {
      await axiosClient.delete('/api/cart', { data: { cart_item_id: id } });
    } catch (e) {
      console.error("Gagal menghapus item:", e);
      set({ items: previousItems }); // Rollback
    }
  },

  updateQuantity: async (id, quantity) => {
    const previousItems = get().items;
    set({
      items: previousItems.map(item => 
        item.id === id ? { ...item, quantity, subtotal: item.price * quantity } : item
      )
    }); // Optimistic UI

    try {
      await axiosClient.put('/api/cart', { cart_item_id: id, quantity });
    } catch (e) {
      console.error("Gagal update quantity:", e);
      set({ items: previousItems }); // Rollback
    }
  },

  clearCart: () => set({ items: [] }),

  getCartTotal: () => get().items.reduce((total, item) => total + item.subtotal, 0),
}));
