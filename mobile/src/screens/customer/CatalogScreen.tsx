import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/CustomerTabs';
import { useProductStore, Product } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import {
  Search,
  ShoppingCart,
  Package,
  X,
  SlidersHorizontal,
  Tag,
  Sparkles,
} from 'lucide-react-native';

type CatalogScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'Tabs'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category icon/emoji mapping
const CATEGORY_ICONS: Record<string, string> = {
  'Semua': '🛍️',
  'Brosur': '📄',
  'Banner': '🚩',
  'Poster': '🖼️',
  'Kartu Nama': '💳',
  'Stiker': '✨',
  'Spanduk': '🎌',
  'Undangan': '💌',
  'Kalender': '📅',
  'Nota': '📝',
};

// Skeleton card for loading
const SkeletonCard = ({ delay = 0 }: { delay?: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={{ opacity, width: '48%', marginBottom: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' }}>
        <View style={{ width: '100%', aspectRatio: 1, backgroundColor: '#e2e8f0' }} />
        <View style={{ padding: 12 }}>
          <View style={{ height: 10, backgroundColor: '#e2e8f0', borderRadius: 8, width: '40%', marginBottom: 8 }} />
          <View style={{ height: 14, backgroundColor: '#e2e8f0', borderRadius: 8, width: '90%', marginBottom: 6 }} />
          <View style={{ height: 14, backgroundColor: '#e2e8f0', borderRadius: 8, width: '70%', marginBottom: 10 }} />
          <View style={{ height: 18, backgroundColor: '#e2e8f0', borderRadius: 8, width: '55%' }} />
        </View>
      </View>
    </Animated.View>
  );
};

// Premium Product Card
const ProductCard = ({ item, onPress, index }: { item: Product; onPress: () => void; index: number }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const imageUrl = item.image_url
    ? item.image_url.startsWith('http')
      ? item.image_url
      : `http://localhost:8000${item.image_url}`
    : null;

  const categoryEmoji = CATEGORY_ICONS[item.category] || '🎨';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], width: '48%', marginBottom: 16 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#f1f5f9',
          shadowColor: '#94a3b8',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        {/* Image Section */}
        <View style={{ width: '100%', aspectRatio: 1, backgroundColor: '#f8fafc', position: 'relative' }}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Package size={24} color="#6366f1" />
              </View>
              <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600' }}>NO IMAGE</Text>
            </View>
          )}

          {/* Category Badge Overlay */}
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.55)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 20,
              gap: 3,
            }}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.4 }}>
                {item.category || 'Produk'}
              </Text>
            </View>
          </View>

          {/* Top-right: Sparkle badge */}
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <View style={{ backgroundColor: '#fef3c7', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="#d97706" />
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', lineHeight: 18, marginBottom: 4 }} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', lineHeight: 14, marginBottom: 10 }} numberOfLines={1}>
            {item.description || 'Kualitas cetak premium terbaik'}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 9, color: '#94a3b8', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>
                Mulai dari
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#2563eb' }}>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(item.base_price || 0)}
              </Text>
            </View>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#eff6ff',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#2563eb', fontSize: 16, fontWeight: '700', marginTop: -1 }}>→</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Category Pill
const CategoryPill = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 50,
          marginRight: 8,
          borderWidth: 1.5,
          gap: 5,
          backgroundColor: active ? '#2563eb' : '#fff',
          borderColor: active ? '#2563eb' : '#e2e8f0',
          shadowColor: active ? '#2563eb' : '#000',
          shadowOffset: { width: 0, height: active ? 4 : 1 },
          shadowOpacity: active ? 0.25 : 0.05,
          shadowRadius: active ? 8 : 3,
          elevation: active ? 4 : 1,
        }}
      >
        <Text style={{
          fontSize: 12,
          fontWeight: '700',
          color: active ? '#fff' : '#475569',
          letterSpacing: 0.2,
        }}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CatalogScreen() {
  const navigation = useNavigation<CatalogScreenNavigationProp>();
  const route = useRoute<any>();
  const initialSearchQuery = route.params?.searchQuery || '';

  const { products, categories, isLoading, fetchProducts, fetchCategories } = useProductStore();
  const { totalItems, fetchCart } = useCartStore();

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCart();
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fetchProducts, fetchCategories, fetchCart]);

  useEffect(() => {
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  const dynamicCategories = ['Semua', ...categories];

  const filteredProducts = products
    .filter((p) =>
      activeCategory === 'Semua'
        ? true
        : p.category?.toLowerCase() === activeCategory.toLowerCase()
    )
    .filter((p) =>
      searchQuery.trim() === ''
        ? true
        : p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

      {/* ── Premium Header ── */}
      <Animated.View style={{ opacity: headerFade }}>
        <View style={{
          backgroundColor: '#1e40af',
          paddingTop: 52,
          paddingBottom: 0,
          paddingHorizontal: 20,
        }}>
          {/* Top Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ color: '#93c5fd', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }}>
                JAYA MANDIRI DIGITAL
              </Text>
              <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '800', marginTop: 2 }}>
                Katalog Produk
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart' as any)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <ShoppingCart size={20} color="#ffffff" />
              {totalItems > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: '#ef4444',
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#1e40af',
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 11,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 5,
            borderWidth: isSearchFocused ? 2 : 1,
            borderColor: isSearchFocused ? '#3b82f6' : 'transparent',
          }}>
            <Search size={17} color={isSearchFocused ? '#2563eb' : '#94a3b8'} />
            <TextInput
              style={{ outlineStyle: 'none', flex: 1, marginLeft: 10, color: '#1e293b', fontSize: 14, fontWeight: '500' } as any}
              placeholder="Cari banner, brosur, sticker..."
              placeholderTextColor="#a1a1aa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <View style={{ width: 22, height: 22, backgroundColor: '#e2e8f0', borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
                  <X size={12} color="#64748b" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Rounded bottom cap for header */}
        <View style={{
          backgroundColor: '#1e40af',
          height: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          marginBottom: -1,
        }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Category Filter ── */}
        <View style={{ paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }}>
            <Tag size={13} color="#64748b" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b', marginLeft: 5, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Filter Kategori
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {dynamicCategories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onPress={() => setActiveCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Results Info Bar ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 10,
          marginBottom: 4,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569' }}>
              {filteredProducts.length} Produk Tersedia
            </Text>
          </View>
          {activeCategory !== 'Semua' && (
            <TouchableOpacity onPress={() => setActiveCategory('Semua')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, color: '#2563eb', fontWeight: '700', marginRight: 4 }}>Reset</Text>
                <X size={10} color="#2563eb" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Product Grid ── */}
        <View style={{ paddingHorizontal: 16 }}>
          {isLoading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} delay={i * 100} />
              ))}
            </View>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 36,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#f1f5f9',
              marginTop: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <View style={{ width: 80, height: 80, backgroundColor: '#f1f5f9', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Search size={34} color="#cbd5e1" />
              </View>
              <Text style={{ fontWeight: '800', color: '#334155', fontSize: 16, marginBottom: 6 }}>
                Produk Tidak Ditemukan
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 220 }}>
                {searchQuery
                  ? `Tidak ada produk untuk "${searchQuery}". Coba kata kunci lain.`
                  : `Tidak ada produk dalam kategori "${activeCategory}".`}
              </Text>
              <TouchableOpacity
                onPress={() => { setSearchQuery(''); setActiveCategory('Semua'); }}
                style={{
                  marginTop: 20,
                  backgroundColor: '#2563eb',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 50,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Lihat Semua Produk</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredProducts.map((item, index) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  index={index}
                  onPress={() => (navigation as any).navigate('ProductDetail', { productId: item.id })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
