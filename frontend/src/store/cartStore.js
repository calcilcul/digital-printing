import { create } from 'zustand';
import api from '../utils/api';
import { useProductStore } from './productStore';

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/api/cart');
      const backendItems = res.data.items || [];
      const products = useProductStore.getState().products;

      const mappedItems = backendItems.map(item => {
        const productInfo = products.find(p => p.id === item.product_id) || {};
        
        // Parse notes if it's JSON
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
          image: productInfo.images?.[0] || 'https://placehold.co/400x300?text=Produk',
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

  addItem: async (item) => {
    try {
      const products = useProductStore.getState().products;
      const product = products.find(p => p.id === item.productId);
      
      // Gunakan variant_id pertama yang tersedia sebagai default jika tidak ada yg cocok
      let variantId = product?.variants?.[0]?.id || 0; 

      await api.post('/api/cart', {
        product_id: item.productId,
        variant_id: variantId,
        quantity: item.quantity,
        notes: JSON.stringify(item.options || {})
      });

      // Refresh cart from backend
      await get().fetchCart();
    } catch (e) {
      console.error("Gagal menambah ke keranjang:", e);
    }
  },

  removeItem: async (id) => {
    try {
      await api.request({
        url: '/api/cart',
        method: 'DELETE',
        data: { cart_item_id: id }
      });
      await get().fetchCart();
    } catch (e) {
      console.error("Gagal menghapus item:", e);
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      await api.put('/api/cart', {
        cart_item_id: id,
        quantity: quantity
      });
      await get().fetchCart();
    } catch (e) {
      console.error("Gagal update quantity:", e);
    }
  },

  clearCart: () => set({ items: [] }),

  getCartTotal: () => get().items.reduce((total, item) => total + item.subtotal, 0),
}));
