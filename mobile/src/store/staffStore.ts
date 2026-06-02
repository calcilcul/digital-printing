import { create } from 'zustand';
import { staffApi } from '../api/staffApi';

export interface StaffOrder {
  id: number;
  user_id: number;
  order_code: string;
  total_price: number;
  status: string;
  created_at: string;
  items: any[];
  payment_proof_url?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  customer_name?: string;
  production_logs?: any[];
  status_logs?: any[];
}

interface StaffState {
  orders: StaffOrder[];
  pendingCount: number;
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  resetPendingCount: () => void;
  incrementPendingCount: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  orders: [],
  pendingCount: 0,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await staffApi.getOrders();
      const rawData = response.data;
      
      let orders: StaffOrder[] = [];
      if (rawData?.data) {
        orders = rawData.data;
      } else if (Array.isArray(rawData)) {
        orders = rawData;
      }
      
      // Calculate pending count (from DB directly, but we can double check)
      const pendingCount = orders.filter(
        (o) => o.status === 'payment_verification' || o.status === 'design_review'
      ).length;

      set({ orders, pendingCount, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch staff orders:', error);
      set({ 
        error: error?.response?.data?.message || 'Gagal memuat pesanan', 
        isLoading: false 
      });
    }
  },

  resetPendingCount: () => set({ pendingCount: 0 }),
  incrementPendingCount: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
}));
