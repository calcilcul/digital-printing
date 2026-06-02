import { axiosClient } from '../api/axiosClient';

const adminApi = {
  // Orders
  getOrders: () => axiosClient.get('/api/admin/orders'),
  getStaffOrders: () => axiosClient.get('/api/staff/orders'),

  // Users
  getUsers: () => axiosClient.get('/api/admin/users'),
  updateUserStatus: (id: number, isActive: boolean) =>
    axiosClient.put(`/api/admin/users/${id}/status`, { is_active: isActive }),
  createStaff: (data: any) => axiosClient.post('/api/admin/staff', data),

  // Products
  getProducts: () => axiosClient.get('/api/admin/products'),
  createProduct: (data: any) => axiosClient.post('/api/admin/products', data),
  updateProduct: (id: number, data: any) => axiosClient.put(`/api/admin/products/${id}`, data),
  uploadProductImage: (id: number, data: FormData) => axiosClient.post(`/api/admin/products/${id}/image`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id: number) => axiosClient.delete(`/api/admin/products/${id}`),

  // Materials
  getMaterials: () => axiosClient.get('/api/admin/materials'),
  createMaterial: (data: any) => axiosClient.post('/api/admin/materials', data),
  adjustMaterial: (id: number, data: any) => axiosClient.post(`/api/admin/materials/${id}/adjust`, data),

  // Reports
  getRevenue: (params?: any) => axiosClient.get('/api/admin/reports/revenue', { params }),
  getTopProducts: (params?: any) => axiosClient.get('/api/admin/reports/products', { params }),

  // Logs
  getAuditLogs: (params?: any) => axiosClient.get('/api/admin/logs/audit', { params }),
  getLoginLogs: (params?: any) => axiosClient.get('/api/admin/logs/login', { params }),
  getProductionLogs: (params?: any) => axiosClient.get('/api/admin/logs/production', { params }),

  // Staff actions (owner bisa lakukan semua aksi staff)
  approvePayment: (orderId: number) => axiosClient.put(`/api/staff/orders/${orderId}/payment/approve`),
  rejectPayment: (orderId: number, reason: string) =>
    axiosClient.put(`/api/staff/orders/${orderId}/payment/reject`, { reason }),
  approveDesign: (orderId: number, itemId: number) =>
    axiosClient.put(`/api/staff/orders/${orderId}/design/approve`, { item_id: itemId }),
  requestRevision: (orderId: number, itemId: number, notes: string) =>
    axiosClient.put(`/api/staff/orders/${orderId}/design/revision`, { item_id: itemId, notes }),
  startProduction: (orderId: number) => axiosClient.put(`/api/staff/production/${orderId}/start`),
  finishProduction: (orderId: number, notes?: string) =>
    axiosClient.put(`/api/staff/production/${orderId}/finish`, { notes }),
};

export default adminApi;
