import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';

interface StaffState {
  orders: any[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  approvePayment: (paymentId: number) => Promise<{ success: boolean; error?: string }>;
  rejectPayment: (paymentId: number) => Promise<{ success: boolean; error?: string }>;
  startProduction: (orderId: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
  finishProduction: (orderId: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.get('/api/staff/orders');
      set({ orders: res.data.data || [], isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil daftar pesanan staff", error);
      set({ isLoading: false });
    }
  },

  approvePayment: async (paymentId) => {
    try {
      await axiosClient.put(`/api/staff/payments/${paymentId}/approve`);
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal menyetujui pembayaran", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menyetujui pembayaran' };
    }
  },

  rejectPayment: async (paymentId) => {
    try {
      await axiosClient.put(`/api/staff/payments/${paymentId}/reject`);
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal menolak pembayaran", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menolak pembayaran' };
    }
  },

  startProduction: async (orderId, notes = '') => {
    try {
      await axiosClient.put(`/api/staff/production/${orderId}/start`, { notes });
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal memulai produksi", error);
      return { success: false, error: error.response?.data?.message || 'Gagal memulai produksi' };
    }
  },

  finishProduction: async (orderId, notes = '') => {
    try {
      await axiosClient.put(`/api/staff/production/${orderId}/finish`, { notes });
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal menyelesaikan produksi", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menyelesaikan produksi' };
    }
  },
}));
