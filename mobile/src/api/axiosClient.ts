import axios from 'axios';
import { getItemAsync } from '../utils/storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://localhost:8000';
};

export const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

// Interceptor to inject token
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getItemAsync('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized (can be used to trigger logout later)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We will handle 401 globally if needed, or let individual requests handle it.
    return Promise.reject(error);
  }
);
