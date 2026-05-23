import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';

export interface OrderItem {
  id: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
  sub_total?: number;
  subtotal?: number;
  notes?: string;
  design_file_id?: number;
  design_file_path?: string;
  design_version?: number;
  design_status?: string;
  design_notes?: string;
}

export interface OrderStatusLog {
  id: number;
  order_id: number;
  status: string;
  changed_by: number;
  changed_name: string;
  notes: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id?: number;
  order_code: string;
  total_price: number;
  total_amount?: number;
  status: string;
  created_at: string;
  updated_at?: string;
  estimated_finish_date?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  items?: OrderItem[];
  payment?: {
    transaction_code: string;
    payment_method: string;
    amount: number;
    payment_status: string;
    payment_proof?: string;
    verified_at?: string;
  };
  payment_proof_url?: string;
  payment_id?: number;
  status_logs?: OrderStatusLog[];
  revision_count?: number;
  revision_notes?: string;
  payment_rejected_reason?: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  fetchOrderDetail: (id: number) => Promise<void>;
  checkout: () => Promise<number | null>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.get('/api/orders');
      set({ orders: res.data?.data || [], isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil daftar pesanan", error);
      set({ isLoading: false });
    }
  },

  fetchOrderDetail: async (id: number) => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.get(`/api/orders/${id}`);
      set({ currentOrder: res.data?.data || null, isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil detail pesanan", error);
      set({ isLoading: false });
    }
  },

  checkout: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.post('/api/checkout');
      // res.data.data.order_id
      set({ isLoading: false });
      return res.data?.data?.order_id || null;
    } catch (error) {
      console.error("Checkout gagal", error);
      set({ isLoading: false });
      return null;
    }
  }
}));
