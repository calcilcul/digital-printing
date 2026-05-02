import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,
      
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/products');
          const backendProducts = response.data.data || [];
          
          // Map data backend agar sesuai dengan format yang diharapkan frontend
          const mappedProducts = backendProducts.map(p => ({
            ...p,
            price: p.base_price || 0,
            images: p.images || ['https://placehold.co/400x300?text=Produk'],
            category: 'Cetak', // default category
            badges: p.is_active ? ['Tersedia'] : [],
            specs: { Material: 'Standar' },
            stock: p.variants && p.variants.length > 0 ? p.variants[0].stock : 0
          }));

          set({ products: mappedProducts, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          console.error("Gagal mengambil produk:", error);
        }
      },

      addProduct: async (productData) => {
        try {
          const payload = {
            name: productData.name,
            description: productData.description || '',
            base_price: productData.price || 0,
            estimated_days: 1,
            is_active: productData.is_active ?? true,
            variants: [
              {
                sku: `SKU-${Date.now()}`,
                variant_name: "Standar",
                price: productData.price || 0,
                stock: productData.stock || 0,
                is_active: productData.is_active ?? true,
              }
            ]
          };
          await api.post('/api/admin/products', payload);
          await get().fetchProducts();
          return { success: true };
        } catch (error) {
          console.error("Gagal menambah produk:", error);
          return { success: false, error: error.response?.data?.message || 'Gagal menambah produk' };
        }
      },
      
      updateProduct: async (id, updatedData) => {
        try {
          // get existing product to retain variants if needed
          const existing = get().products.find(p => p.id === id);
          const payload = {
            name: updatedData.name || existing?.name,
            description: updatedData.description !== undefined ? updatedData.description : existing?.description,
            base_price: updatedData.price !== undefined ? updatedData.price : existing?.price,
            estimated_days: existing?.estimated_days || 1,
            is_active: updatedData.is_active !== undefined ? updatedData.is_active : (existing?.is_active ?? true),
            variants: [
              {
                id: existing?.variants?.[0]?.id || 0,
                sku: existing?.variants?.[0]?.sku || `SKU-${Date.now()}`,
                variant_name: "Standar",
                price: updatedData.price !== undefined ? updatedData.price : existing?.price,
                stock: updatedData.stock !== undefined ? updatedData.stock : existing?.stock,
                is_active: updatedData.is_active !== undefined ? updatedData.is_active : (existing?.is_active ?? true),
              }
            ]
          };
          await api.put(`/api/admin/products/${id}`, payload);
          await get().fetchProducts();
          return { success: true };
        } catch (error) {
          console.error("Gagal update produk:", error);
          return { success: false, error: error.response?.data?.message || 'Gagal update produk' };
        }
      },
      
      deleteProduct: async (id) => {
        try {
          await api.delete(`/api/admin/products/${id}`);
          await get().fetchProducts();
          return { success: true };
        } catch (error) {
          console.error("Gagal menghapus produk:", error);
          return { success: false, error: error.response?.data?.message || 'Gagal menghapus produk' };
        }
      },
      
      getProductById: (id) => {
        return get().products.find(p => String(p.id) === String(id));
      }
    }),
    {
      name: 'jaya-products-storage',
    }
  )
);
