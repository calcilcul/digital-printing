import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Golang API berjalan di port 8080
// Android emulator: 10.0.2.2 = localhost mesin host
// iOS simulator / device fisik: pakai IP lokal mesin kamu
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api'
    : 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: otomatis tambah JWT token ke setiap request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle error global (401 = logout otomatis)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
