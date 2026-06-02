import { axiosClient } from './axiosClient';

export const staffApi = {
  getOrders: () => axiosClient.get('/api/staff/orders'),
  approvePayment: (orderId: number) => axiosClient.put(`/api/staff/orders/${orderId}/payment/approve`),
  rejectPayment: (orderId: number, reason: string) => axiosClient.put(`/api/staff/orders/${orderId}/payment/reject`, { reason }),
  approveDesign: (orderId: number, itemId: number) => axiosClient.put(`/api/staff/orders/${orderId}/design/approve`, { item_id: itemId }),
  requestRevision: (orderId: number, itemId: number, notes: string) => axiosClient.put(`/api/staff/orders/${orderId}/design/revision`, { item_id: itemId, notes }),
  startProduction: (orderId: number) => axiosClient.put(`/api/staff/production/${orderId}/start`),
  finishProduction: (orderId: number, notes?: string) => axiosClient.put(`/api/staff/production/${orderId}/finish`, { notes }),
};
