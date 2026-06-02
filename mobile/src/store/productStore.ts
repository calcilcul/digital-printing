import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  material_id: number;
  material_usage: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  category_id: number;
  description: string;
  base_price: number;
  estimated_days: number;
  image_url: string;
  is_active: boolean;
  variants: ProductVariant[];
}

interface ProductState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosClient.get('/products');
      
      // Backend response: { status, message, data: { products: [...] } }
      // or { status, message, data: [...] }
      const raw = response.data;
      let products: Product[] = [];

      if (raw?.data?.products) {
        products = raw.data.products;
      } else if (Array.isArray(raw?.data)) {
        products = raw.data;
      } else if (Array.isArray(raw?.products)) {
        products = raw.products;
      } else if (Array.isArray(raw)) {
        products = raw;
      }

      set({ products, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      set({ 
        error: error?.response?.data?.message || 'Gagal memuat produk', 
        isLoading: false 
      });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await axiosClient.get('/categories');
      const raw = response.data;
      let categories: string[] = [];
      if (raw && Array.isArray(raw.data)) {
        categories = raw.data.map((c: any) => c.name || c);
      }
      set({ categories });
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
    }
  },
}));
