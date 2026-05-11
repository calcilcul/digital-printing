import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  initialized: boolean;
  setSession: (token: string, user: User) => Promise<void>;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

const TOKEN_KEY = 'jayamandiri_jwt_token';
const USER_KEY = 'jayamandiri_user';

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  initialized: false,

  setSession: async (token, user) => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.log('Error saving token', e);
    }
    set({ token, user, initialized: true });
  },

  initializeAuth: async () => {
    try {
      let token = null;
      let userStr = null;
      
      if (Platform.OS !== 'web') {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
        userStr = await SecureStore.getItemAsync(USER_KEY);
      } else {
        token = localStorage.getItem(TOKEN_KEY);
        userStr = localStorage.getItem(USER_KEY);
      }

      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), initialized: true });
      } else {
        set({ token: null, user: null, initialized: true });
      }
    } catch (e) {
      set({ token: null, user: null, initialized: true });
    }
  },

  signOut: async () => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.log('Error deleting token', e);
    }
    set({ token: null, user: null });
  },
}));
