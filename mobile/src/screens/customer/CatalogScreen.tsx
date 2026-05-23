import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProductStore } from '../../store/productStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Search, X, SlidersHorizontal, LayoutGrid, List as ListIcon, Heart, Plus } from 'lucide-react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = ['All', 'Business Cards', 'Banners', 'Flyers', 'Stickers', 'Apparel', 'Mugs', 'Posters'];

export default function CatalogScreen() {
  const { products } = useProductStore();
  const { addItem } = useCartStore();
  const { token } = useAuthStore();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isGridMode, setIsGridMode] = useState(true);
  const [activeSort, setActiveSort] = useState('Featured');
  
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Sync with route params from HomeScreen
  useEffect(() => {
    if (route.params?.initialSearch !== undefined) {
      setSearchQuery(route.params.initialSearch);
    }
    if (route.params?.initialCategory !== undefined) {
      // Map category name from Home if needed
      const categoryMap: Record<string, string> = {
        'Business Cards': 'Business Cards',
        'Banners': 'Banners',
        'Flyers': 'Flyers',
        'Posters': 'Posters',
        'Apparel': 'Apparel',
        'Stickers': 'Stickers'
      };
      const mappedCat = categoryMap[route.params.initialCategory] || 'All';
      setActiveCategory(mappedCat);
    }
  }, [route.params]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (activeCategory !== 'All') {
        const nameLower = p.name.toLowerCase();
        if (activeCategory === 'Banners') {
          matchesCategory = nameLower.includes('banner') || nameLower.includes('spanduk');
        } else if (activeCategory === 'Posters') {
          matchesCategory = nameLower.includes('poster');
        } else if (activeCategory === 'Flyers') {
          matchesCategory = nameLower.includes('brosur') || nameLower.includes('flyer');
        } else if (activeCategory === 'Business Cards') {
          matchesCategory = nameLower.includes('kartu nama') || nameLower.includes('card');
        } else if (activeCategory === 'Stickers') {
          matchesCategory = nameLower.includes('stiker') || nameLower.includes('sticker');
        } else if (activeCategory === 'Apparel') {
          matchesCategory = nameLower.includes('kaos') || nameLower.includes('baju') || nameLower.includes('tote bag');
        } else if (activeCategory === 'Mugs') {
          matchesCategory = nameLower.includes('mug');
        } else {
          matchesCategory = false;
        }
      }
      
      return matchesSearch && matchesCategory;
    });
    // Sort logic
    if (activeSort === 'Price L-H') result = [...result].sort((a, b) => a.base_price - b.base_price);
    else if (activeSort === 'Price H-L') result = [...result].sort((a, b) => b.base_price - a.base_price);
    else if (activeSort === 'Newest') result = [...result].sort((a, b) => b.id - a.id);
    return result;
  }, [products, searchQuery, activeCategory, activeSort]);

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

  const renderProductGrid = ({ item }: { item: any }) => (
    <View className="w-[48%] bg-white rounded-3xl mb-4 shadow-sm border border-border overflow-hidden">
      <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
        <View className="h-40 bg-gray-100 relative">
          <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
          <TouchableOpacity className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full items-center justify-center">
            <Heart size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
        <View className="p-4">
          <Text className="text-xs text-primary font-bold mb-1 uppercase">Printing</Text>
          <Text className="text-text font-bold text-sm mb-2" numberOfLines={2}>{item.name}</Text>
          <Text className="text-text font-extrabold">Rp {item.base_price.toLocaleString('id-ID')}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => handleQuickAdd(item)}
        className="absolute bottom-3 right-3 w-8 h-8 bg-primary rounded-full items-center justify-center shadow-sm"
      >
        <Plus size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderProductList = ({ item }: { item: any }) => (
    <View className="bg-white rounded-2xl mb-3 shadow-sm border border-border overflow-hidden flex-row p-3">
      <TouchableOpacity 
        className="flex-row flex-1"
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View className="w-24 h-24 bg-gray-100 rounded-xl relative overflow-hidden">
          <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
        </View>
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-xs text-primary font-bold mb-1 uppercase">Printing</Text>
          <Text className="text-text font-bold text-base mb-1" numberOfLines={2}>{item.name}</Text>
          <Text className="text-text-muted text-xs mb-2">24h Turnaround</Text>
          <Text className="text-text font-extrabold text-lg">Rp {item.base_price.toLocaleString('id-ID')}</Text>
        </View>
      </TouchableOpacity>
      <View className="justify-between items-end">
        <TouchableOpacity className="w-8 h-8 bg-surface rounded-full items-center justify-center border border-border">
          <Heart size={16} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleQuickAdd(item)}
          className="bg-primary px-4 py-2 rounded-full shadow-sm"
        >
          <Text className="text-white font-bold text-xs">Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Sticky Header */}
      <View className="px-6 py-4 bg-white shadow-sm shadow-black/5 z-10 border-b border-border">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-text text-2xl font-black">Shop</Text>
            <Text className="text-text-muted text-xs">Explore our premium materials</Text>
          </View>
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={() => setIsGridMode(!isGridMode)}
              className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border"
            >
              {isGridMode ? <ListIcon size={20} color="#0F172A" /> : <LayoutGrid size={20} color="#0F172A" />}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => bottomSheetRef.current?.expand()}
              className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border relative"
            >
              <SlidersHorizontal size={20} color="#0F172A" />
              {/* Badge for active filters */}
              <View className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-surface rounded-full px-4 py-2 border border-border">
          <Search size={18} color="#64748B" />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for business cards, flyers..." 
            placeholderTextColor="#94A3B8"
            className="ml-2 flex-1 text-text py-1"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <View className="bg-white pb-3 pt-3 border-b border-border shadow-sm shadow-black/5 z-10">
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setActiveCategory(item)}
              className={`px-5 py-2 rounded-full mr-2 ${activeCategory === item ? 'bg-primary' : 'bg-surface border border-border'}`}
            >
              <Text className={`font-bold text-sm ${activeCategory === item ? 'text-white' : 'text-text-muted'}`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
        
        {/* Results Meta */}
        <View className="px-6 pt-3 flex-row items-center">
          <Text className="text-text-muted text-xs font-bold">{filteredProducts.length} products found</Text>
        </View>
      </View>

      {/* Product List */}
      <FlatList
        key={isGridMode ? 'grid' : 'list'} // Force re-render when switching layouts
        data={filteredProducts}
        numColumns={isGridMode ? 2 : 1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        columnWrapperStyle={isGridMode ? { justifyContent: 'space-between' } : undefined}
        renderItem={isGridMode ? renderProductGrid : renderProductList}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-text text-lg font-bold mb-2">No products found</Text>
            <Text className="text-text-muted text-center mb-6">Try adjusting your search or filters.</Text>
            <TouchableOpacity onPress={() => setSearchQuery('')} className="bg-primary px-6 py-3 rounded-full">
              <Text className="text-white font-bold">Clear Search</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Sort & Filter Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['60%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#ffffff', borderRadius: 32 }}
      >
        <BottomSheetView className="flex-1 px-6 pt-4 pb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-text">Sort & Filter</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <X size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <Text className="font-bold text-text mb-3">Sort By</Text>
          <View className="flex-row flex-wrap mb-6">
            {['Featured', 'Newest', 'Price L-H', 'Price H-L'].map((sort, i) => (
              <TouchableOpacity 
                key={i} 
                onPress={() => setActiveSort(sort)}
                className={`px-4 py-2 rounded-full border mr-2 mb-2 ${activeSort === sort ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-sm font-bold ${activeSort === sort ? 'text-white' : 'text-text-muted'}`}>{sort}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="font-bold text-text mb-3">Price Range</Text>
          <View className="flex-row flex-wrap mb-6">
            {['Any', '<$15', '$15–$30', '$30–$50', '$50+'].map((price, i) => (
              <TouchableOpacity key={i} className={`px-4 py-2 rounded-full border mr-2 mb-2 ${i === 0 ? 'bg-primary border-primary' : 'bg-surface border-border'}`}>
                <Text className={`text-sm font-bold ${i === 0 ? 'text-white' : 'text-text-muted'}`}>{price}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            onPress={() => bottomSheetRef.current?.close()}
            className="w-full bg-primary py-4 rounded-full items-center mt-auto shadow-lg shadow-primary/30"
          >
            <Text className="text-white font-bold text-lg">Apply Filters</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
