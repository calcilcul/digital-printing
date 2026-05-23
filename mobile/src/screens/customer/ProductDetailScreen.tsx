import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { axiosClient } from '../../api/axiosClient';
import { ChevronLeft, Heart, ShieldCheck, Truck, Star, UploadCloud, File, Trash, CheckCircle2, Clock } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { productId } = route.params || {};
  
  const { getProductById, isLoading: isProductLoading } = useProductStore();
  const { addItem, isLoading: isCartLoading } = useCartStore();
  
  const product = getProductById(productId);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  
  // Design Upload State
  const [designFile, setDesignFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLater, setUploadLater] = useState(false);

  const [showAddedFlash, setShowAddedFlash] = useState(false);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDesignFile(result.assets[0]);
        setUploadLater(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Gagal memilih file');
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const success = await addItem(
      product.id,
      selectedVariant ? selectedVariant.id : product.variants[0]?.id || 0,
      quantity,
      selectedVariant?.variant_name || ''
    );
    if (success) {
      setShowAddedFlash(true);
      setTimeout(() => setShowAddedFlash(false), 2000);
    }
  };

  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const handleBuyNow = async () => {
    if (!product || !selectedVariant) {
      Alert.alert('Pilih Varian', 'Silakan pilih varian produk terlebih dahulu');
      return;
    }
    setIsBuyingNow(true);
    try {
      const res = await axiosClient.post('/api/buy-now', {
        product_id: product.id,
        variant_id: selectedVariant.id,
        quantity,
        notes: selectedVariant.variant_name || '',
      });
      const { order_id, order_code, total_price } = res.data;
      // Navigate to upload design with order info
      navigation.navigate('UploadDesign', {
        orderId: order_id,
        orderItems: [{
          id: res.data.item_id || 0, // will be fetched from order detail if needed
          product_name: product.name,
          variant_name: selectedVariant.variant_name || '',
          quantity,
          notes: selectedVariant.variant_name || '',
        }],
        totalPrice: total_price,
      });
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat membuat pesanan');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const isAddToCartDisabled = false; // Cart tidak perlu design dulu
  const totalPrice = (selectedVariant?.price || product.base_price) * quantity;

  return (
    <View className="flex-1 bg-surface">
      {/* Header Overlays */}
      <View className="absolute top-0 left-0 right-0 z-50 flex-row justify-between px-4" style={{ paddingTop: insets.top + 10 }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white/80 rounded-full items-center justify-center backdrop-blur-md"
        >
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 bg-white/80 rounded-full items-center justify-center backdrop-blur-md">
          <Heart size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gallery */}
        <View className="w-full h-80 bg-gray-100">
          <Image source={{ uri: product.image }} className="w-full h-full" resizeMode="cover" />
        </View>

        {/* Product Info */}
        <View className="bg-white px-6 pt-6 pb-4 rounded-t-3xl -mt-6">
          <Text className="text-primary-light font-bold text-xs uppercase mb-1">Printing Materials</Text>
          <Text className="text-text text-2xl font-black mb-2 leading-tight">{product.name}</Text>
          
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center bg-warning/10 px-2 py-1 rounded-md mr-3">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-warning font-bold text-xs ml-1">4.8 (124)</Text>
            </View>
            <Text className="text-text font-extrabold text-xl">Rp {product.base_price.toLocaleString('id-ID')}</Text>
          </View>

          {/* Trust Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row items-center bg-surface border border-border px-3 py-1.5 rounded-full mr-2">
              <ShieldCheck size={14} color="#1E3A8A" />
              <Text className="text-text-muted text-xs font-bold ml-1.5">Quality Guarantee</Text>
            </View>
            <View className="flex-row items-center bg-surface border border-border px-3 py-1.5 rounded-full mr-2">
              <Truck size={14} color="#10B981" />
              <Text className="text-text-muted text-xs font-bold ml-1.5">Fast Delivery</Text>
            </View>
          </ScrollView>
        </View>

        {/* 3-Tab System */}
        <View className="bg-white mt-2">
          <View className="flex-row border-b border-border">
            {['overview', 'specs', 'reviews'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-4 items-center border-b-2 ${activeTab === tab ? 'border-primary' : 'border-transparent'}`}
              >
                <Text className={`font-bold capitalize ${activeTab === tab ? 'text-primary' : 'text-text-muted'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="p-6">
            {activeTab === 'overview' && (
              <Animated.View entering={FadeIn}>
                <Text className="text-text-muted text-sm mb-6 leading-relaxed">
                  {product.description || "High-quality custom printing tailored for your business needs. Outstanding color accuracy and premium paper stock."}
                </Text>

                {/* Options Selector */}
                <Text className="font-bold text-text mb-3">Material & Finish</Text>
                <View className="flex-row flex-wrap mb-6">
                  {product.variants?.map((v: any) => (
                    <TouchableOpacity 
                      key={v.id}
                      onPress={() => setSelectedVariant(v)}
                      className={`px-4 py-3 rounded-xl border mr-3 mb-3 ${selectedVariant?.id === v.id ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                    >
                      <Text className={`font-bold ${selectedVariant?.id === v.id ? 'text-white' : 'text-text'}`}>{v.variant_name}</Text>
                      <Text className={`text-xs mt-1 ${selectedVariant?.id === v.id ? 'text-white/80' : 'text-text-muted'}`}>+ Rp {v.price.toLocaleString('id-ID')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Upload Zone */}
                <Text className="font-bold text-text mb-3">Your Design</Text>
                
                {designFile ? (
                  <View className="bg-success/5 border border-success/20 rounded-2xl p-4 flex-row items-center mb-6">
                    <View className="w-12 h-12 bg-success/10 rounded-xl items-center justify-center mr-4">
                      {designFile.mimeType?.includes('pdf') ? <File size={24} color="#10B981" /> : <Image source={{ uri: designFile.uri }} className="w-full h-full rounded-xl" />}
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-text" numberOfLines={1}>{designFile.name}</Text>
                      <Text className="text-success font-bold text-xs mt-1">Ready to print ✓</Text>
                    </View>
                    <TouchableOpacity onPress={() => setDesignFile(null)} className="p-2">
                      <Trash size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="mb-6">
                    <TouchableOpacity 
                      onPress={handlePickFile}
                      className="border-2 border-dashed border-border rounded-2xl p-6 items-center justify-center bg-surface mb-3"
                    >
                      <UploadCloud size={32} color="#94A3B8" className="mb-3" />
                      <Text className="font-bold text-text mb-1">Tap to Upload Design</Text>
                      <Text className="text-text-muted text-xs">PDF, AI, PSD, or High-res JPG (Max 10MB)</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center bg-warning/10 px-3 py-2 rounded-lg flex-1 mr-3">
                        <Text className="text-warning text-[10px] font-bold">Ensure 300 DPI and correct bleed lines.</Text>
                      </View>
                      <TouchableOpacity onPress={() => setUploadLater(!uploadLater)} className={`px-4 py-2 rounded-lg border ${uploadLater ? 'bg-primary-light border-primary-light' : 'border-border'}`}>
                        <Text className={`font-bold text-xs ${uploadLater ? 'text-white' : 'text-text-muted'}`}>Upload later</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              </Animated.View>
            )}

            {activeTab === 'specs' && (
              <Animated.View entering={FadeIn}>
                <View className="bg-surface rounded-2xl p-4 border border-border mb-4 flex-row items-center">
                  <Clock size={20} color="#1E3A8A" />
                  <View className="ml-3">
                    <Text className="font-bold text-text text-sm">Turnaround Time</Text>
                    <Text className="text-text-muted text-xs">{product.estimated_days} Business Days</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {activeTab === 'reviews' && (
              <Animated.View entering={FadeIn} className="items-center py-6">
                <Text className="text-text-muted">No reviews yet for this product.</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Add to Cart Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-6 pt-4 pb-8 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
        {showAddedFlash && (
          <Animated.View entering={SlideInDown} exiting={FadeOut} className="absolute -top-12 left-6 right-6 bg-success rounded-xl px-4 py-3 flex-row items-center justify-between shadow-lg">
            <View className="flex-row items-center">
              <CheckCircle2 size={18} color="white" />
              <Text className="text-white font-bold ml-2">Added to Cart!</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
              <Text className="text-white font-black underline">View Cart</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View className="flex-row items-center mb-4">
          <Text className="text-text-muted text-xs mr-2">Status:</Text>
          {designFile ? (
            <Text className="text-success font-bold text-xs">Ready ✓</Text>
          ) : uploadLater ? (
            <Text className="text-warning font-bold text-xs">Pending Upload</Text>
          ) : (
            <Text className="text-text-muted text-xs">No design attached · Required</Text>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-surface border border-border rounded-full">
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 items-center justify-center">
              <Text className="text-text text-lg font-bold">-</Text>
            </TouchableOpacity>
            <Text className="font-bold text-text w-6 text-center">{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} className="w-10 h-10 items-center justify-center">
              <Text className="text-text text-lg font-bold">+</Text>
            </TouchableOpacity>
          </View>

          {/* Tombol aksi */}
          <View style={{ flex: 1, marginLeft: 12, flexDirection: 'row', gap: 8 }}>
            {/* Add to Cart */}
            <TouchableOpacity
              onPress={handleAddToCart}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 50, alignItems: 'center', borderWidth: 1.5, borderColor: '#0F172A' }}
            >
              {isCartLoading ? (
                <ActivityIndicator color="#333" size="small" />
              ) : (
                <Text style={{ fontWeight: '700', fontSize: 13, color: '#0F172A' }}>+ Keranjang</Text>
              )}
            </TouchableOpacity>

            {/* Beli Sekarang */}
            <TouchableOpacity
              onPress={handleBuyNow}
              disabled={isBuyingNow}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 50, alignItems: 'center', backgroundColor: '#0F172A' }}
            >
              {isBuyingNow ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={{ fontWeight: '700', fontSize: 13, color: '#fff' }}>Beli Sekarang</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}
