import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const getBaseURL = () => {
  // 1. Jika ada di .env, prioritaskan
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  // 2. Jika jalan di web (localhost browser), gunakan localhost langsung 
  // untuk menghindari pemblokiran Private Network Access dari Chrome
  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }

  // 3. Deteksi IP komputer secara otomatis (Bebas pindah Wi-Fi!)
  // Constants.expoConfig?.hostUri biasanya berisi "192.168.x.x:8081"
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    // Jika Anda memakai mode Tunnel (--tunnel), hostUri akan berisi ngrok/exp.direct
    // Kita tidak bisa menembak port 8080 ke domain tunnel tersebut
    if (debuggerHost.includes('exp.direct') || debuggerHost.includes('ngrok')) {
      return 'http://10.39.51.114:8080'; // Ganti dengan IP komputer Anda secara manual 
    }
    const computerIp = debuggerHost.split(':')[0];
    return `http://${computerIp}:8080`;
  }

  // Fallback terakhir jika semua gagal
  return 'http://10.39.51.114:8080'; // Ganti dengan IP komputer Anda secara manual
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
    if (!config.headers.Authorization) {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
