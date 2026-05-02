import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  SafeAreaView, Platform, Alert
} from 'react-native';
import api from '../api/config';

export default function PaymentScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);

  const handleUploadPayment = async () => {
    setLoading(true);
    try {
      // Panggil API Golang untuk upload bukti bayar
      // await api.post('/api/payments', { order_id: 1, proof: 'base64_or_file' });
      
      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (Platform.OS === 'web') window.alert('Pembayaran berhasil dikonfirmasi! Pesanan Anda sedang diproses.');
      else Alert.alert('Berhasil', 'Pembayaran berhasil dikonfirmasi! Pesanan Anda sedang diproses.');
      
      // Kembali ke beranda setelah sukses
      navigation.replace('Home');
    } catch (error) {
      console.error('Payment error:', error);
      if (Platform.OS === 'web') window.alert('Gagal mengunggah pembayaran.');
      else Alert.alert('Error', 'Gagal mengunggah pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.storeWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pembayaran</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.instructionTitle}>Instruksi Pembayaran</Text>
          <View style={styles.bankCard}>
            <Text style={styles.bankName}>BCA - Digital Printing</Text>
            <Text style={styles.bankAccount}>123-456-7890</Text>
            <Text style={styles.bankDesc}>Silakan transfer ke rekening di atas dan unggah bukti transfer Anda.</Text>
          </View>

          <View style={styles.uploadArea}>
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadText}>Klik untuk Pilih Foto Bukti Transfer</Text>
          </View>

          <TouchableOpacity 
            style={[styles.confirmBtn, loading && styles.disabledBtn]} 
            onPress={handleUploadPayment}
            disabled={loading}
          >
            <Text style={styles.confirmText}>{loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  storeWrapper: { flex: 1, width: '100%', maxWidth: 800, alignSelf: 'center', backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  content: { padding: 24 },
  instructionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  bankCard: { backgroundColor: '#F3F4F6', padding: 20, borderRadius: 12, marginBottom: 32 },
  bankName: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  bankAccount: { fontSize: 24, fontWeight: 'bold', color: '#059669', marginBottom: 8, letterSpacing: 1 },
  bankDesc: { fontSize: 14, color: '#6B7280' },
  uploadArea: { borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, padding: 40, alignItems: 'center', marginBottom: 32, backgroundColor: '#FAFAFA' },
  uploadIcon: { fontSize: 40, marginBottom: 12 },
  uploadText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  confirmBtn: { backgroundColor: '#000000', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#9CA3AF' },
  confirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
