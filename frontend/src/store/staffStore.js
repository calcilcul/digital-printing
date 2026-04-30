import { create } from 'zustand';
import api from '../utils/api';

export const useStaffStore = create((set, get) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      // Endpoint ini akan mengambil semua order untuk dikelola oleh staff
      const res = await api.get('/api/staff/orders');
      set({ orders: res.data.data || [], isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil daftar pesanan staff", error);
      set({ isLoading: false });
    }
  },

  approvePayment: async (paymentId) => {
    try {
      await api.put(`/api/staff/payments/${paymentId}/approve`);
      await get().fetchOrders();
      return { success: true };
    } catch (error) {
      console.error("Gagal menyetujui pembayaran", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menyetujui pembayaran' };
    }
  },

  rejectPayment: async (paymentId) => {
    try {
      await api.put(`/api/staff/payments/${paymentId}/reject`);
      await get().fetchOrders();
      return { success: true };
    } catch (error) {
      console.error("Gagal menolak pembayaran", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menolak pembayaran' };
    }
  },

  startProduction: async (orderId, notes = '') => {
    try {
      await api.put(`/api/staff/production/${orderId}/start`, { notes });
      await get().fetchOrders();
      return { success: true };
    } catch (error) {
      console.error("Gagal memulai produksi", error);
      return { success: false, error: error.response?.data?.message || 'Gagal memulai produksi' };
    }
  },

  finishProduction: async (orderId, notes = '') => {
    try {
      await api.put(`/api/staff/production/${orderId}/finish`, { notes });
      await get().fetchOrders();
      return { success: true };
    } catch (error) {
      console.error("Gagal menyelesaikan produksi", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menyelesaikan produksi' };
    }
  },
}));
