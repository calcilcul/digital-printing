import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  SafeAreaView, ScrollView, Image, Platform, Alert, useWindowDimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';

// Fallback data if API fails
const DUMMY_PRODUCTS = [
  { id: 1, name: 'Brosur A4 (100 lembar)', price: 50000, stock: 100 },
  { id: 2, name: 'Kartu Nama Premium', price: 25000, stock: 100 },
  { id: 3, name: 'Spanduk Outdoor 2x1m', price: 100000, stock: 50 },
  { id: 4, name: 'Stiker Vinyl (A3+)', price: 15000, stock: 200 },
];

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const { width } = useWindowDimensions();

  // Menentukan lebar kartu secara dinamis (Responsif)
  let cardWidth: any = '48%'; // Default iPhone XR (2 kolom)
  if (width >= 900) {
    cardWidth = '23%'; // Desktop (4 kolom)
  } else if (width >= 600) {
    cardWidth = '31%'; // iPad / Tablet (3 kolom)
  } else if (width < 350) {
    cardWidth = '100%'; // HP layar sangat sempit (1 kolom)
  }

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUserData(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      // Fallback to dummy data
      setProducts(DUMMY_PRODUCTS);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/api/cart');
      const cartItems = response.data?.data || response.data || [];
      if (Array.isArray(cartItems)) {
        // Calculate total quantity
        const total = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      }
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');
  };

  const handleAddToCart = async (product: any) => {
    try {
      // Panggil API Golang untuk tambah ke keranjang
      await api.post('/api/cart', {
        product_id: product.id,
        quantity: 1,
      });
      setCartCount(prev => prev + 1);
      
      if (Platform.OS === 'web') window.alert(`${product.name} ditambahkan!`);
      else Alert.alert("Sukses", `${product.name} ditambahkan ke keranjang!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      // Fallback simulation
      setCartCount(prev => prev + 1);
      if (Platform.OS === 'web') window.alert(`${product.name} ditambahkan! (Mode Simulasi)`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.storeWrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Digital Printing</Text>
            {userData?.formatted_id && (
              <Text style={styles.userIdText}>ID: {userData.formatted_id}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.cartContainer} onPress={() => navigation.navigate('Cart')}>
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.productList}>
          <Text style={styles.sectionTitle}>Produk Populer</Text>
          <View style={styles.grid}>
            {products.map(product => (
              <View key={product.id} style={[styles.card, { width: cardWidth }]}>
                <Image 
                  source={{ uri: `https://picsum.photos/seed/${product.id}/200` }} 
                  style={styles.cardImage} 
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.cardPrice}>{formatPrice(product.price || 0)}</Text>
                  <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => handleAddToCart(product)}
                  >
                    <Text style={styles.addButtonText}>+ Keranjang</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  storeWrapper: { flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  userIdText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  cartContainer: { position: 'relative', marginRight: 16, padding: 4 },
  cartIcon: { fontSize: 24 },
  badge: { position: 'absolute', top: -2, right: -4, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#F3F4F6', borderRadius: 8 },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  productList: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#000000' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  cardImage: { width: '100%', height: 120, backgroundColor: '#E5E7EB' },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4, height: 40 },
  cardPrice: { fontSize: 14, fontWeight: 'bold', color: '#059669', marginBottom: 12 },
  addButton: { backgroundColor: '#000000', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});
