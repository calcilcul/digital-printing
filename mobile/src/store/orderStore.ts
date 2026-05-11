import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  invoice_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
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
