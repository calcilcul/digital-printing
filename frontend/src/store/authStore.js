import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import { useCartStore } from './cartStore';
import { useOrderStore } from './orderStore';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Dapatkan token dari endpoint login
          const resLogin = await api.post('/login', { email, password });
          const token = resLogin.data.token;

          // 2. Gunakan token untuk mendapatkan profil user
          const resProfile = await api.get('/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const userData = {
            id: resProfile.data.user_id,
            email: email,
            role: resProfile.data.role
          };

          set({
            user: userData,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { success: true };
        } catch (error) {
          const errMsg = error.response?.data?.message || 'Gagal login';
          set({ isLoading: false, error: errMsg });
          return { success: false, error: errMsg };
        }
      },

      logout: async () => {
        try {
            await api.post('/api/logout');
        } catch(e) {
            console.error("Logout API failed:", e);
        }
        set({ user: null, token: null, isAuthenticated: false });
        useCartStore.getState().clearCart();
        useOrderStore.getState().orders = [];
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'auth-storage', // Menyimpan state ke localStorage
    }
  )
);
