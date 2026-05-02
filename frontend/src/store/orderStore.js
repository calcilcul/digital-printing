import { create } from 'zustand';
import api from '../utils/api';

export const useOrderStore = create((set, get) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/api/orders');
      set({ orders: res.data.data || [], isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil daftar pesanan", error);
      set({ isLoading: false });
    }
  },

  checkout: async () => {
    try {
      const res = await api.post('/api/checkout');
      // Refresh daftar pesanan setelah checkout
      await get().fetchOrders();
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Checkout gagal", error);
      return { success: false, error: error.response?.data?.message || 'Gagal melakukan checkout' };
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    // Di sisi customer, status diupdate secara otomatis oleh sistem (atau saat 'complete')
    // Untuk demo atau jika diperlukan:
    if (newStatus === 'completed') {
       try {
         await api.put(`/api/orders/${orderId}/complete`);
         await get().fetchOrders();
       } catch (e) {
         console.error(e);
       }
    } else if (newStatus === 'cancelled') {
       try {
         await api.put(`/api/orders/${orderId}/cancel`);
         await get().fetchOrders();
       } catch (e) {
         console.error(e);
       }
    }
  },

  getOrderById: (orderId) => {
    // Karena ID dari URL adalah string, dan ID di db int, kita bandingkan dengan konversi string
    return get().orders.find((o) => String(o.id) === String(orderId));
  }
}));
