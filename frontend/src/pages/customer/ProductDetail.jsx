import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Star, AlertCircle } from 'lucide-react';
import { m } from 'framer-motion';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FadeIn } from '../../components/animations/FadeIn';
import { SlideUp } from '../../components/animations/SlideUp';
import { useCartStore } from '../../store/cartStore';
import BackButton from '../../components/ui/BackButton';
import { useProductStore } from '../../store/productStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { getProductById } = useProductStore();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('deskripsi');

  // Calculator states
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState('');

  // Derived price calculation (mock logic)
  const isCustomSize = product?.category === 'Banner Outdoor' || product?.category === 'Spanduk' || product?.category === 'Sticker Custom';
  
  const basePrice = product?.price || 0;
  let calculatedPrice = basePrice;
  let area = 1;

  if (isCustomSize) {
    area = width * height;
    // Mock material pricing modifier
    let materialMultiplier = 1;
    if (selectedMaterial.includes('Korea')) materialMultiplier = 1.5;
    if (selectedMaterial.includes('Vinyl')) materialMultiplier = 1.8;
    
    calculatedPrice = basePrice * area * materialMultiplier;
  }

  const total = calculatedPrice * quantity;

  useEffect(() => {
    const found = getProductById(id);
    if (found) {
      setProduct(found);
      if (found.specs && found.specs['Material']) {
        setSelectedMaterial(found.specs['Material']);
      }
    }
  }, [id, getProductById]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: calculatedPrice,
      quantity: quantity,
      image: product.images[0],
      options: isCustomSize ? {
        Material: selectedMaterial,
        Ukuran: `${width}m x ${height}m`
      } : {
        Material: selectedMaterial || 'Standar'
      }
    });

    toast.success('Berhasil ditambahkan ke keranjang!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/keranjang');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Mock Materials for dropdown
  const mockMaterials = [
    product.specs['Material'] || 'Standar',
    product.category.includes('Banner') ? 'Flexi Korea 440gr' : null,
    product.category.includes('Sticker') ? 'Vinyl Transparan' : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Breadcrumb */}
        <FadeIn className="text-sm text-slate-500 mb-8">
          Beranda <span className="mx-2">/</span> Katalog <span className="mx-2">/</span> <span className="text-slate-900 font-medium">{product.name}</span>
        </FadeIn>

        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          
          {/* Left: Images */}
          <SlideUp className="w-full lg:w-1/2 space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
              <img 
                src={product.images[activeImage] || 'https://placehold.co/800x600'} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-primary-600' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </SlideUp>

          {/* Right: Info & Actions */}
          <SlideUp delay={0.1} className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-2 text-primary-600 font-medium text-sm">{product.category}</div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                <Star className="fill-yellow-400 w-5 h-5" />
                <span className="text-slate-700 font-bold ml-1">4.8</span>
                <span className="text-slate-500 font-normal ml-1 text-sm">(120 ulasan)</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              {product.stock > 10 ? (
                <Badge variant="success">Tersedia</Badge>
              ) : (
                <Badge variant="warning">Stok Terbatas</Badge>
              )}
            </div>

            <div className="text-4xl font-bold text-primary-600 mb-8">
              {formatPrice(calculatedPrice)}
              {isCustomSize && <span className="text-lg font-normal text-slate-500"> / pcs</span>}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8 space-y-6">
              {/* Material Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Material</label>
                <select 
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-3 outline-none"
                >
                  {mockMaterials.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              {/* Calculator for Custom Size */}
              {isCustomSize && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lebar (Meter)</label>
                    <input 
                      type="number" 
                      min="0.5" 
                      step="0.5" 
                      value={width} 
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tinggi (Meter)</label>
                    <input 
                      type="number" 
                      min="0.5" 
                      step="0.5" 
                      value={height} 
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="col-span-2 text-sm text-slate-600 flex items-center gap-2 mt-2">
                    <AlertCircle size={16} className="text-primary-500" />
                    Total Luas: <span className="font-bold">{area} m²</span>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-l-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-10 border-y border-slate-200 text-center font-semibold text-slate-900 outline-none focus:ring-0"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-r-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Total & Buttons */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-2xl font-bold text-slate-900">{formatPrice(total)}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleAddToCart} variant="outline" className="flex-1 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 text-lg py-3">
                  <ShoppingCart size={20} className="mr-2" /> Tambah Keranjang
                </Button>
                <Button onClick={handleBuyNow} className="flex-1 text-lg py-3">
                  Beli Sekarang
                </Button>
              </div>
            </div>
          </SlideUp>
        </div>

        {/* Tabs section */}
        <SlideUp delay={0.2} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
            {['deskripsi', 'spesifikasi', 'ulasan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors relative ${
                  activeTab === tab ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <m.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
            ))}
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'deskripsi' && (
                <m.div
                  key="deskripsi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose max-w-none text-slate-600"
                >
                  <p>{product.description}</p>
                </m.div>
              )}
              {activeTab === 'spesifikasi' && (
                <m.div
                  key="spesifikasi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {Object.entries(product.specs || {}).map(([key, value]) => (
                      <div key={key} className="flex flex-col py-3 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-900 mb-1">{key}</span>
                        <span className="text-slate-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </m.div>
              )}
              {activeTab === 'ulasan' && (
                <m.div
                  key="ulasan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-12"
                >
                  <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Belum ada ulasan untuk produk ini</h3>
                  <p className="text-slate-500">Jadilah yang pertama memberikan ulasan setelah membeli produk ini.</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </SlideUp>

      </div>
    </div>
  );
}
