import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';

export interface StaffOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
  sub_total: number;
  image?: string;
  design_file_id?: number;
  design_file_path?: string;
  design_version?: number;
  design_status?: string;
  design_notes?: string;
}

export interface StaffOrder {
  id: number;
  order_code: string;
  total_price: number;
  status: string;
  created_at: string;
  user_name: string;
  payment_id?: number;
  payment_proof_url?: string;
  design_file_url?: string;
  items?: StaffOrderItem[];
}

interface StaffState {
  orders: StaffOrder[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  approvePayment: (orderId: number) => Promise<{ success: boolean; error?: string }>;
  rejectPayment: (orderId: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  approveDesign: (orderId: number) => Promise<{ success: boolean; error?: string }>;
  requestRevision: (orderId: number, notes: string) => Promise<{ success: boolean; error?: string }>;
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

  approvePayment: async (orderId) => {
    try {
      await axiosClient.put(`/api/staff/orders/${orderId}/payment/approve`);
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal menyetujui pembayaran", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menyetujui pembayaran' };
    }
  },

  rejectPayment: async (orderId, reason) => {
    try {
      await axiosClient.put(`/api/staff/orders/${orderId}/payment/reject`, { reason });
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal menolak pembayaran", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menolak pembayaran' };
    }
  },

  approveDesign: async (orderId) => {
    try {
      await axiosClient.put(`/api/staff/orders/${orderId}/design/approve`);
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal menyetujui desain", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menyetujui desain' };
    }
  },

  requestRevision: async (orderId, notes) => {
    try {
      await axiosClient.put(`/api/staff/orders/${orderId}/design/revision`, { notes });
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal meminta revisi desain", error);
      return { success: false, error: error.response?.data?.message || 'Gagal meminta revisi desain' };
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
      // Use the redesigned finish route
      await axiosClient.put(`/api/staff/orders/${orderId}/printing/finish`, { notes });
      await get().fetchOrders();
      return { success: true };
    } catch (error: any) {
      console.error("Gagal menyelesaikan produksi", error);
      return { success: false, error: error.response?.data?.message || 'Gagal menyelesaikan produksi' };
    }
  },
}));
