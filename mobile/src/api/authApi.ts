import { axiosClient } from './axiosClient';

export const authApi = {
  login: (data: any) => axiosClient.post('/login', data),
  register: (data: any) => axiosClient.post('/register', data),
  getProfile: () => axiosClient.get('/api/profile'),
  logout: () => axiosClient.post('/api/logout'),
};
