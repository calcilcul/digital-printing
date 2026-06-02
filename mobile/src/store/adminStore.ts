import { create } from 'zustand';
import adminApi from '../services/adminApi';

interface AdminStore {
  // Orders
  orders: any[];
  ordersLoading: boolean;
  ordersError: string | null;
  pendingCount: number;

  // Users
  users: any[];
  usersLoading: boolean;

  // Products
  products: any[];
  productsLoading: boolean;

  // Materials
  materials: any[];
  materialsLoading: boolean;

  // Reports
  revenueData: any | null;
  topProducts: any[];
  reportsLoading: boolean;

  // Logs
  auditLogs: any[];
  loginLogs: any[];
  productionLogs: any[];
  logsLoading: boolean;

  // Actions
  fetchOrders: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchMaterials: () => Promise<void>;
  fetchRevenueReport: (params?: any) => Promise<void>;
  fetchTopProducts: (params?: any) => Promise<void>;
  fetchAuditLogs: (params?: any) => Promise<void>;
  fetchLoginLogs: (params?: any) => Promise<void>;
  fetchProductionLogs: (params?: any) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  // Initial state
  orders: [],
  ordersLoading: false,
  ordersError: null,
  pendingCount: 0,

  users: [],
  usersLoading: false,

  products: [],
  productsLoading: false,

  materials: [],
  materialsLoading: false,

  revenueData: null,
  topProducts: [],
  reportsLoading: false,

  auditLogs: [],
  loginLogs: [],
  productionLogs: [],
  logsLoading: false,

  // Actions
  fetchOrders: async () => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const res = await adminApi.getOrders();
      const data = res.data.data || res.data;
      const pendingCount = data.filter((o: any) => 
        o.status === 'payment_verification' || o.status === 'design_review'
      ).length;
      set({ orders: data, pendingCount, ordersLoading: false });
    } catch (error: any) {
      set({ ordersError: error.message, ordersLoading: false });
    }
  },

  fetchUsers: async () => {
    set({ usersLoading: true });
    try {
      const res = await adminApi.getUsers();
      set({ users: res.data.data || res.data, usersLoading: false });
    } catch (error) {
      set({ usersLoading: false });
    }
  },

  fetchProducts: async () => {
    set({ productsLoading: true });
    try {
      const res = await adminApi.getProducts();
      set({ products: res.data.data || res.data, productsLoading: false });
    } catch (error) {
      set({ productsLoading: false });
    }
  },

  fetchMaterials: async () => {
    set({ materialsLoading: true });
    try {
      const res = await adminApi.getMaterials();
      set({ materials: res.data.data || res.data, materialsLoading: false });
    } catch (error) {
      set({ materialsLoading: false });
    }
  },

  fetchRevenueReport: async (params?: any) => {
    set({ reportsLoading: true });
    try {
      const res = await adminApi.getRevenue(params);
      set({ revenueData: res.data.data || res.data, reportsLoading: false });
    } catch (error) {
      set({ reportsLoading: false });
    }
  },

  fetchTopProducts: async (params?: any) => {
    set({ reportsLoading: true });
    try {
      const res = await adminApi.getTopProducts(params);
      set({ topProducts: res.data.data || res.data, reportsLoading: false });
    } catch (error) {
      set({ reportsLoading: false });
    }
  },

  fetchAuditLogs: async (params?: any) => {
    set({ logsLoading: true });
    try {
      const res = await adminApi.getAuditLogs(params);
      set({ auditLogs: res.data.data || res.data, logsLoading: false });
    } catch (error) {
      set({ logsLoading: false });
    }
  },

  fetchLoginLogs: async (params?: any) => {
    set({ logsLoading: true });
    try {
      const res = await adminApi.getLoginLogs(params);
      set({ loginLogs: res.data.data || res.data, logsLoading: false });
    } catch (error) {
      set({ logsLoading: false });
    }
  },

  fetchProductionLogs: async (params?: any) => {
    set({ logsLoading: true });
    try {
      const res = await adminApi.getProductionLogs(params);
      set({ productionLogs: res.data.data || res.data, logsLoading: false });
    } catch (error) {
      set({ logsLoading: false });
    }
  },
}));
