import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';

interface AdminState {
  reports: {
    revenue: any[];
    topProducts: any[];
  };
  materials: any[];
  isLoading: boolean;
  fetchReports: () => Promise<void>;
  fetchMaterials: () => Promise<void>;
  adjustMaterialStock: (materialId: number, amount: number, type: 'add' | 'deduct', reason: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  reports: {
    revenue: [],
    topProducts: []
  },
  materials: [],
  isLoading: false,

  fetchReports: async () => {
    set({ isLoading: true });
    try {
      const [revRes, prodRes] = await Promise.all([
        axiosClient.get('/api/admin/reports/revenue').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/api/admin/reports/products').catch(() => ({ data: { data: [] } }))
      ]);
      set({ 
        reports: {
          revenue: revRes.data.data || [],
          topProducts: prodRes.data.data || []
        },
        isLoading: false 
      });
    } catch (error) {
      console.error("Gagal mengambil laporan", error);
      set({ isLoading: false });
    }
  },

  fetchMaterials: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.get('/api/admin/materials');
      set({ materials: res.data.data || [], isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil material", error);
      set({ isLoading: false });
    }
  },

  adjustMaterialStock: async (materialId, amount, type, reason) => {
    try {
      await axiosClient.post(`/api/admin/materials/${materialId}/adjust`, {
        adjustment: amount,
        type: type, // 'add' or 'deduct'
        reason: reason
      });
      await get().fetchMaterials();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Gagal update stok material' };
    }
  }
}));
