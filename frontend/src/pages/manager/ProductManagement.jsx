import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FadeIn } from '../../components/animations/FadeIn';
import { AnimatePresence, m } from 'framer-motion';
import { useProductStore } from '../../store/productStore';
import toast from 'react-hot-toast';

export default function ProductManagement() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      const result = await deleteProduct(id);
      if (result.success) {
        toast.success('Produk berhasil dihapus');
      } else {
        toast.error(result.error || 'Gagal menghapus produk');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const newProduct = {
      name: formData.get('name'),
      category: formData.get('category'),
      price: parseInt(formData.get('price')),
      stock: parseInt(formData.get('stock')),
      description: formData.get('description'),
      is_active: true
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, newProduct);
    } else {
      result = await addProduct(newProduct);
    }
    
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Produk berhasil ${editingProduct ? 'diperbarui' : 'ditambahkan'}`);
      setIsModalOpen(false);
    } else {
      toast.error(result.error || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Produk</h1>
          <p className="text-sm text-slate-500 mt-1">Tambah, ubah, atau hapus katalog produk.</p>
        </div>
        <Button className="shrink-0 bg-purple-600 hover:bg-purple-700" onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Tambah Produk
        </Button>
      </div>

      <FadeIn className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama produk atau kategori..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter size={16} className="mr-2" /> Filter
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Produk</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Harga Dasar</th>
                <th className="px-6 py-4 font-medium">Stok</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-medium text-slate-900 line-clamp-2 max-w-[200px]">
                          {product.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 text-slate-600">{product.stock}</td>
                    <td className="px-6 py-4">
                      {product.stock > 10 ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="warning">Stok Menipis</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" onClick={() => handleOpenModal(product)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Produk tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
          <div>Menampilkan {filteredProducts.length} produk</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50" disabled>Seb</button>
            <button className="px-3 py-1 border border-slate-200 rounded bg-purple-50 text-purple-600 font-medium border-purple-200">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50" disabled>Sel</button>
          </div>
        </div>

      </FadeIn>

      {/* Modal Tambah/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <m.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            <m.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h2>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  &times;
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
                      <input name="name" required defaultValue={editingProduct?.name} type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                      <select name="category" required defaultValue={editingProduct?.category} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none bg-white">
                        <option value="Banner Outdoor">Banner Outdoor</option>
                        <option value="Spanduk">Spanduk</option>
                        <option value="Sticker Custom">Sticker Custom</option>
                        <option value="Kartu Nama">Kartu Nama</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Harga Dasar (Rp)</label>
                      <input name="price" required defaultValue={editingProduct?.price} type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal</label>
                      <input name="stock" required defaultValue={editingProduct?.stock || 100} type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Produk</label>
                    <textarea name="description" required defaultValue={editingProduct?.description} rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select name="status" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none bg-white">
                      <option value="Normal">Aktif (Normal)</option>
                      <option value="Promo">Promo</option>
                    </select>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <Button variant="outline" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" form="productForm" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
