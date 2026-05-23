import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';
import { Search, ShoppingCart, User, Plus, ChevronRight, ChevronLeft, Truck, Clock, CreditCard, Flag, FileText, Image as ImageIcon, Shirt, Sticker } from 'lucide-react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolateColor, interpolate, Extrapolation, runOnJS } from 'react-native-reanimated';
import { useCartStore } from '../../store/cartStore';

const { width } = Dimensions.get('window');

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1598301257982-0cf014dff316?q=80&w=1000&auto=format&fit=crop', // Printing press
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000&auto=format&fit=crop', // Graphic design
];

export default function HomeScreen() {
  const { user, token } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { items, addItem, fetchCart } = useCartStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const isScrolledAnim = useSharedValue(false);
  const [activeHero, setActiveHero] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const categoryScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchProducts();
    if (token) {
      fetchCart();
    }
  }, [fetchProducts, token, fetchCart]);

  // Auto-slide hero carousel
  useEffect(() => {
    heroTimerRef.current = setInterval(() => {
      setActiveHero(prev => (prev + 1) % HERO_IMAGES.length);
    }, 3500);
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, []);

  const handleSearchSubmit = () => {
    if (searchInput.trim()) {
      navigation.navigate('Shop', { initialSearch: searchInput.trim() });
      setSearchInput('');
    }
  };

  const handleCustomQuote = () => {
    const phone = '6281234567890'; // Ganti dengan nomor WA Jaya Mandiri
    const message = 'Halo, saya ingin mendapatkan penawaran harga custom untuk kebutuhan percetakan saya.';
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const shouldBeScrolled = event.contentOffset.y > 50;
      if (shouldBeScrolled !== isScrolledAnim.value) {
        isScrolledAnim.value = shouldBeScrolled;
        runOnJS(setIsScrolled)(shouldBeScrolled);
      }
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 100],
      ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']
    );
    const shadowOpacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 0.1],
      Extrapolation.CLAMP
    );
    return {
      backgroundColor,
      shadowOpacity,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 10,
      elevation: scrollY.value > 50 ? 5 : 0,
    };
  });

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  const userInitials = (user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleQuickAdd = async (product: any) => {
    if (!token) {
      Alert.alert(
        'Login Diperlukan',
        'Silakan masuk ke akun Anda terlebih dahulu untuk menambahkan produk ke keranjang.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Masuk', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    if (product.variants && product.variants.length > 0) {
      const success = await addItem(product.id, product.variants[0].id, 1);
      if (success) {
        Alert.alert('Sukses', 'Produk berhasil ditambahkan ke keranjang!');
      } else {
        Alert.alert('Gagal', 'Gagal menambahkan produk ke keranjang.');
      }
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Sticky Header */}
      <Animated.View 
        style={[{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 10,
          paddingBottom: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }, headerStyle]}
      >
        <View className={`flex-1 flex-row items-center rounded-full px-4 py-2 mr-4 border ${isScrolled ? 'bg-gray-100 border-gray-200' : 'bg-black/20 border-white/20'}`}>
          <Search size={18} color={isScrolled ? '#64748B' : '#ffffff'} style={{ opacity: 0.8 }} />
          <TextInput 
            placeholder="Search products..." 
            placeholderTextColor={isScrolled ? '#94A3B8' : 'rgba(255,255,255,0.7)'}
            className={`ml-2 flex-1 py-0 ${isScrolled ? 'text-text' : 'text-white'}`}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>
        <View className="flex-row space-x-4 items-center">
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} className="relative mr-2">
            <ShoppingCart size={24} color={isScrolled ? '#1E3A8A' : '#ffffff'} />
            {cartItemCount > 0 && (
              <View className="absolute -top-2 -right-2 bg-error w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-[10px] font-bold">{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {!token ? (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              className="bg-primary px-4 py-2 rounded-full border border-white/20 shadow-md"
            >
              <Text className="text-white font-bold text-[11px]">Login / Register</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              className="w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-white/80 shadow-sm"
            >
              <Text className="text-white font-bold text-[11px]">{userInitials}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Section */}
        <View className="h-[450px] w-full relative bg-gray-900">
          {/* Crossfade Animation Images */}
          {HERO_IMAGES.map((img, idx) => (
            <Animated.View 
              key={idx} 
              className="absolute inset-0"
              style={[{ opacity: activeHero === idx ? 1 : 0, transition: 'opacity 0.8s ease-in-out' as any }]}
            >
              <Image source={{ uri: img }} className="w-full h-full" resizeMode="cover" />
            </Animated.View>
          ))}
          
          {/* Dark Overlay overall + Scrim for Navbar */}
          <View className="absolute inset-0 bg-black/40" />
          <View className="absolute top-0 left-0 right-0 h-32" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
          
          <View className="absolute bottom-12 left-0 right-0 items-center px-6">
            <View className="bg-primary-light/20 px-3 py-1 rounded-full border border-primary-light/50 mb-4">
              <Text className="text-white text-xs font-bold uppercase tracking-wider">Premium Quality</Text>
            </View>
            <Text className="text-white text-4xl font-extrabold mb-2 leading-tight text-center">Print Your Vision{"\n"}Into Reality.</Text>
            <Text className="text-white/80 text-base mb-6 text-center">High-quality offset & digital printing delivered fast to your door.</Text>
            
            <TouchableOpacity onPress={() => navigation.navigate('Shop')} className="bg-primary-light px-8 py-4 rounded-full shadow-lg shadow-primary-light/30 flex-row items-center justify-center">
              <Text className="text-white font-bold text-lg mr-2">Shop Now</Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Dot Indicators — Clickable */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2">
            {HERO_IMAGES.map((_, idx) => (
              <TouchableOpacity key={idx} onPress={() => setActiveHero(idx)}>
                <View className={`h-1.5 rounded-full ${activeHero === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo Pills */}
        <View className="flex-row px-6 py-6 justify-between">
          <View className="flex-row items-center bg-white px-4 py-3 rounded-2xl flex-1 mr-2 shadow-sm border border-border">
            <View className="bg-success/10 p-2 rounded-full mr-3">
              <Truck size={20} color="#10B981" />
            </View>
            <View>
              <Text className="font-bold text-text text-sm">Free Shipping</Text>
              <Text className="text-text-muted text-xs">Orders {'>'} Rp 500k</Text>
            </View>
          </View>
          <View className="flex-row items-center bg-white px-4 py-3 rounded-2xl flex-1 ml-2 shadow-sm border border-border">
            <View className="bg-warning/10 p-2 rounded-full mr-3">
              <Clock size={20} color="#F59E0B" />
            </View>
            <View>
              <Text className="font-bold text-text text-sm">24h Delivery</Text>
              <Text className="text-text-muted text-xs">On selected items</Text>
            </View>
          </View>
        </View>

        {/* Categories Horizontal */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text className="text-lg font-bold text-text">Category</Text>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => navigation.navigate('Shop')} className="mr-3">
                <Text className="text-primary-light font-bold text-sm">See all</Text>
              </TouchableOpacity>
              <View className="flex-row space-x-1">
                <TouchableOpacity onPress={() => categoryScrollRef.current?.scrollTo({ x: 0, animated: true })} className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
                  <ChevronLeft size={16} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => categoryScrollRef.current?.scrollTo({ x: 200, animated: true })} className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
                  <ChevronRight size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <ScrollView 
            ref={categoryScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 20 }} 
            className="space-x-4"
          >
            {[
              { name: 'Business Cards', Icon: CreditCard },
              { name: 'Banners', Icon: Flag },
              { name: 'Flyers', Icon: FileText },
              { name: 'Posters', Icon: ImageIcon },
              { name: 'Apparel', Icon: Shirt },
              { name: 'Stickers', Icon: Sticker },
            ].map((cat, i) => (
              <TouchableOpacity key={i} className="items-center mr-4 w-[72px]" onPress={() => navigation.navigate('Shop', { initialCategory: cat.name })}>
                <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center shadow-sm border border-border mb-2">
                  <cat.Icon size={26} color="#1E3A8A" strokeWidth={1.5} />
                </View>
                <Text className="text-text-muted text-[10px] font-bold text-center leading-tight">{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Grid */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-xl font-extrabold text-text">Trending Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
              <Text className="text-primary-light font-bold text-sm">See All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {products.slice(0, 4).map((product) => (
              <View key={product.id} className="w-[48%] bg-white rounded-3xl mb-4 shadow-sm border border-border overflow-hidden">
                <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}>
                  <View className="h-40 bg-gray-100 relative">
                    <Image source={{ uri: product.image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <View className="p-4">
                    <Text className="text-xs text-primary font-bold mb-1 uppercase">Printing</Text>
                    <Text className="text-text font-bold text-sm mb-2" numberOfLines={2}>{product.name}</Text>
                    <View className="flex-row justify-between items-center mt-1">
                      <Text className="text-text font-extrabold">Rp {product.base_price.toLocaleString('id-ID')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleQuickAdd(product)}
                  className="absolute bottom-3 right-3 w-8 h-8 bg-primary rounded-full items-center justify-center shadow-sm shadow-primary/40"
                >
                  <Plus size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works (Dark Mode Card) */}
        <View className="px-6 mb-10">
          <View className="bg-text rounded-[32px] p-8 shadow-xl">
            <Text className="text-white text-xl font-bold mb-6">How It Works</Text>
            
            <View className="flex-row mb-6">
              <View className="w-8 h-8 bg-primary-light rounded-full items-center justify-center mr-4">
                <Text className="text-white font-bold">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">Select Product</Text>
                <Text className="text-white/60 text-sm">Choose from our wide range of printing materials and options.</Text>
              </View>
            </View>
            
            <View className="flex-row mb-6">
              <View className="w-8 h-8 bg-primary-light rounded-full items-center justify-center mr-4">
                <Text className="text-white font-bold">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">Upload Design</Text>
                <Text className="text-white/60 text-sm">Upload your ready-to-print artwork in PDF, AI, or high-res JPG.</Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="w-8 h-8 bg-success rounded-full items-center justify-center mr-4">
                <Text className="text-white font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1">Delivered Fast</Text>
                <Text className="text-white/60 text-sm">We print it with high quality and ship it directly to your door.</Text>
              </View>
            </View>
          </View>
        </View>

      </Animated.ScrollView>
    </View>
  );
}
