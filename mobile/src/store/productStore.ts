import { create } from 'zustand';
import { axiosClient } from '../api/axiosClient';

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  variant_name: string;
  price: number;
  stock: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  category_id?: number | null;
  name: string;
  description: string;
  base_price: number;
  estimated_days: number;
  is_active: boolean;
  variants: ProductVariant[];
  created_at: string;
  // Tambahan untuk UI mobile
  image?: string;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProductById: (id: number) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosClient.get('/products');
      const data = response.data?.data || [];
      
      const mappedProducts = data.map((p: any) => ({
        ...p,
        image: 'https://placehold.co/400x300?text=' + encodeURIComponent(p.name),
      }));

      set({ products: mappedProducts, isLoading: false });
    } catch (error: any) {
      console.error('Gagal mengambil produk:', error);
      set({ error: error.message || 'Terjadi kesalahan', isLoading: false });
    }
  },

  getProductById: (id: number) => {
    return get().products.find(p => p.id === id);
  }
}));
