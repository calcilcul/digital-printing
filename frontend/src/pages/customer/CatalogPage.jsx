import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/ui/Button';
import { useDebounce } from '../../hooks/useDebounce';
import { FadeIn } from '../../components/animations/FadeIn';
import { useProductStore } from '../../store/productStore';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const activeCategory = searchParams.get('category') || 'Semua';

  const setActiveCategory = (cat) => {
    setSearchParams({ category: cat });
  };
  
  const { products: mockProducts } = useProductStore();
  const debouncedSearch = useDebounce(searchTerm, 300);

  const categories = ['Semua', 'Banner Outdoor', 'Spanduk', 'Sticker Custom', 'Kartu Nama', 'Display Promo'];

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      // Filter by search term
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                            product.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      // Filter by category
      let matchesCategory = true;
      if (activeCategory === 'Terlaris') {
        matchesCategory = product.badges?.includes('Terlaris');
      } else if (activeCategory !== 'Semua') {
        matchesCategory = product.category === activeCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearch, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Breadcrumb */}
        <div className="mb-8">
          <div className="text-sm text-slate-500 mb-2">
            Beranda <span className="mx-2">/</span> <span className="text-slate-900 font-medium">Katalog Produk</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Katalog Produk</h1>
        </div>

        {/* Search & Filter Top Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari produk (contoh: Banner, Kartu Nama)..."
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="shrink-0 md:hidden w-full">
            <SlidersHorizontal size={18} className="mr-2" />
            Filter
          </Button>
        </div>

        {/* Filtering Chips */}
        <div className="flex overflow-x-auto pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                activeCategory === category
                  ? 'bg-primary-600 text-white border border-primary-600 shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid Layout with Framer Motion layout animations */}
        <m.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <m.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={product.id}
              >
                <ProductCard product={product} />
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <FadeIn className="text-center py-20">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Produk Tidak Ditemukan</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Maaf, kami tidak dapat menemukan produk yang sesuai dengan pencarian atau filter Anda. Coba kata kunci lain.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('Semua');
              }}
            >
              Reset Pencarian
            </Button>
          </FadeIn>
        )}

        {/* Pagination / Load More */}
        {filteredProducts.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline" className="px-8 py-3 bg-white">
              Muat Lebih Banyak
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
