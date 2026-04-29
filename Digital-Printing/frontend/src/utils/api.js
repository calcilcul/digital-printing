import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token JWT di setiap request
api.interceptors.request.use(
  (config) => {
    // Ambil state langsung dari localStorage atau zustand
    const authState = localStorage.getItem('auth-storage');
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        const token = parsedState?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error parsing auth state:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response (misal token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired atau tidak valid
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
