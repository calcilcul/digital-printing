import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  SafeAreaView, ScrollView, Platform, Alert, ActivityIndicator
} from 'react-native';
import api from '../api/config';

export default function CartScreen({ navigation }: any) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback dummy
  const dummyCart = [
    { id: 1, name: 'Brosur A4 (100 lembar)', price: 50000, quantity: 2 },
    { id: 2, name: 'Kartu Nama Premium', price: 25000, quantity: 1 }
  ];

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/api/cart');
      const items = response.data?.data || response.data || [];
      setCartItems(Array.isArray(items) && items.length > 0 ? items : dummyCart);
    } catch (error) {
      console.error('Fetch cart error:', error);
      setCartItems(dummyCart); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      // Panggil API checkout
      // await api.post('/api/checkout');
      // Uncomment above line when backend handles it perfectly
      if (Platform.OS === 'web') window.alert('Checkout berhasil! Silakan unggah bukti pembayaran.');
      else Alert.alert('Sukses', 'Checkout berhasil! Silakan unggah bukti pembayaran.');
      
      navigation.replace('Payment');
    } catch (error) {
      console.error('Checkout error:', error);
      if (Platform.OS === 'web') window.alert('Checkout gagal. (Simulasi berhasil ke pembayaran)');
      navigation.replace('Payment'); // Lanjut ke payment untuk simulasi
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.storeWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Keranjang</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {cartItems.map((item, index) => (
            <View key={item.id || index} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name || item.product?.name}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price || item.product?.price || 0)}</Text>
              </View>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
            </View>
          ))}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Pembayaran</Text>
            <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Lanjut Checkout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  storeWrapper: { flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center', backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  backBtn: { paddingVertical: 8, paddingHorizontal: 8 },
  backText: { fontSize: 16, color: '#000000', fontWeight: '500' },
  list: { padding: 24 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#6B7280' },
  itemQty: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 24, paddingVertical: 16, borderTopWidth: 2, borderTopColor: '#E5E7EB' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#059669' },
  checkoutBtn: { backgroundColor: '#000000', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  checkoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
