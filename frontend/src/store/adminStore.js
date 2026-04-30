import { create } from 'zustand';
import api from '../utils/api';

export const useAdminStore = create((set, get) => ({
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
        api.get('/api/admin/reports/revenue').catch(() => ({ data: { data: [] } })),
        api.get('/api/admin/reports/products').catch(() => ({ data: { data: [] } }))
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
      const res = await api.get('/api/admin/materials');
      set({ materials: res.data.data || [], isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil material", error);
      set({ isLoading: false });
    }
  },

  adjustMaterialStock: async (materialId, amount, type, reason) => {
    try {
      await api.post(`/api/admin/materials/${materialId}/adjust`, {
        adjustment: amount,
        type: type, // 'add' or 'deduct'
        reason: reason
      });
      await get().fetchMaterials();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Gagal update stok material' };
    }
  }
}));
