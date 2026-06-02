import { create } from 'zustand';
import { setItemAsync, getItemAsync, deleteItemAsync } from '../utils/storage';
import { authApi } from '../api/authApi';
import { axiosClient } from '../api/axiosClient';
import { useCartStore } from './cartStore';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignout: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  activeRoleMode: 'admin' | 'staff' | null;
  switchRoleMode: (mode: 'admin' | 'staff') => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isSignout: false,
  activeRoleMode: null,

  switchRoleMode: (mode: 'admin' | 'staff') => set({ activeRoleMode: mode }),
  setUser: (user: User | null) => set({ user }),
  login: async (data: any) => {
    try {
      const response = await authApi.login(data);
      // Response structure: { status, message, data: { token, user } }
      const token = response.data.data?.token;
      const userFromLogin = response.data.data?.user;

      if (!token) throw new Error('Token tidak ditemukan di respons login');

      // Save token first
      await setItemAsync('jwt_token', token);

      // Fetch profile passing token directly
      const profileResponse = await axiosClient.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Profile response: { status, message, data: { user_id, name, ... } }
      const profileData = profileResponse.data.data || profileResponse.data;

      const userData = {
        id: profileData.user_id || userFromLogin?.id,
        name: profileData.name || userFromLogin?.name,
        email: profileData.email || userFromLogin?.email,
        phone: profileData.phone || userFromLogin?.phone,
        role: profileData.role || userFromLogin?.role,
      };

      const initialRoleMode = userData.role?.toLowerCase() === 'owner' ? 'admin' : null;

      set({ token, user: userData, isSignout: false, activeRoleMode: initialRoleMode });
    } catch (error) {
      throw error;
    }
  },

  register: async (data: any) => {
    try {
      await authApi.register(data);
      await get().login({ email: data.email, password: data.password });
    } catch (error) {
      throw error;
    }
  },

    logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
    } finally {
      await deleteItemAsync('jwt_token');
      useCartStore.getState().clearCart();
      set({ token: null, user: null, isSignout: true });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    let token = null;
    let user = null;
    try {
      token = await getItemAsync('jwt_token');
      if (token) {
        const profileResponse = await authApi.getProfile();
        const profileData = profileResponse.data.data || profileResponse.data;
        user = {
          id: profileData.user_id,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          role: profileData.role,
        };
      }
    } catch (e) {
      token = null;
      await deleteItemAsync('jwt_token');
    }
    
    let initialRoleMode = null;
    if (user?.role?.toLowerCase() === 'owner') {
      initialRoleMode = 'admin';
    }

    set({ token, user, isLoading: false, activeRoleMode: initialRoleMode });
  },
}));
