import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  // Jika di emulator Android, gunakan 10.0.2.2
  if (Platform.OS === 'android' && !Platform.isTV) {
    // Note: isTV hanya contoh pengecekan, yang penting deteksi host
    // Kita bisa pakai __DEV__ juga jika perlu
  }
  
  return 'http://10.39.51.242:8080';
};

const API_URL = getBaseURL();
const TOKEN_KEY = 'jayamandiri_jwt_token';

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper ambil token lintas platform
async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

// Request Interceptor: Otomatis menyematkan JWT
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized - token expired or invalid');
    }
    return Promise.reject(error);
  }
);
