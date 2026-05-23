import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, Platform,
  ActivityIndicator, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { axiosClient } from '../../api/axiosClient';

// Rekening statis Jaya Mandiri
const BANK_INFO = {
  bank: 'BCA',
  account: '1234567890',
  name: 'Jaya Mandiri Percetakan',
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function UploadPaymentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId, totalPrice, isReupload } = route.params as {
    orderId: number;
    totalPrice: number;
    isReupload?: boolean;
  };

  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [amount, setAmount] = useState(totalPrice?.toString() || '');

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        setFile(result.assets[0]);
        setProgress(0);
      }
    } catch (err) {
      console.log('Error picking file:', err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Peringatan', 'Pilih bukti transfer terlebih dahulu');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('payment_proof', {
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      type: file.mimeType || 'image/jpeg',
      name: file.name,
    } as any);
    formData.append('amount', amount || totalPrice?.toString() || '0');

    try {
      const endpoint = isReupload
        ? `/api/orders/${orderId}/payment/reupload`
        : `/api/orders/${orderId}/payment`;

      await axiosClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const p = e.total ? Math.round((e.loaded * 100) / e.total) : 50;
          setProgress(p);
        },
      });

      Alert.alert(
        '🎉 Berhasil Dikirim!',
        'Bukti pembayaran Anda sudah diterima. Staf akan memverifikasi dalam waktu 1x24 jam.',
        [{ text: 'Lihat Pesanan', onPress: () => navigation.navigate('Orders') }]
      );
    } catch (error: any) {
      Alert.alert('Upload Gagal', error.response?.data?.message || 'Terjadi kesalahan saat upload bukti bayar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F12' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E1E24' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1C1C22', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>
            {isReupload ? 'Upload Ulang Bukti Bayar' : 'Pembayaran'}
          </Text>
          <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>Order #{orderId}</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center' }}>
        <StepDot num={1} done label="Desain" />
        <View style={{ flex: 1, height: 1, backgroundColor: '#F59E0B', marginHorizontal: 6 }} />
        <StepDot num={2} active label="Bayar" />
        <View style={{ flex: 1, height: 1, backgroundColor: '#222', marginHorizontal: 6 }} />
        <StepDot num={3} active={false} done={false} label="Selesai" />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}>

        {/* Total Tagihan */}
        <View style={{ backgroundColor: '#1A1508', borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F59E0B33' }}>
          <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 }}>TOTAL TAGIHAN</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 }}>
            {formatRupiah(totalPrice || 0)}
          </Text>
          <Text style={{ color: '#888', fontSize: 12, marginTop: 6 }}>
            Transfer tepat sesuai nominal di atas untuk verifikasi otomatis
          </Text>
        </View>

        {/* Info rekening */}
        <View style={{ backgroundColor: '#16161E', borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A3A' }}>
          <Text style={{ color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 14 }}>TRANSFER KE REKENING</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#888', fontSize: 13 }}>Bank</Text>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{BANK_INFO.bank}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#888', fontSize: 13 }}>No. Rekening</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 15, letterSpacing: 2, marginRight: 6 }}>
                {BANK_INFO.account}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#888', fontSize: 13 }}>Atas Nama</Text>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{BANK_INFO.name}</Text>
          </View>
        </View>

        {/* Upload bukti bayar */}
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Upload Bukti Transfer</Text>

        <TouchableOpacity
          onPress={pickFile}
          disabled={isUploading}
          style={{
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: file ? '#F59E0B' : '#333',
            borderRadius: 14,
            padding: 20,
            alignItems: 'center',
            backgroundColor: file ? '#1A1508' : '#111118',
            marginBottom: 12,
          }}
        >
          {file ? (
            <>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🧾</Text>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' }}>{file.name}</Text>
              <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                {((file.size || 0) / (1024 * 1024)).toFixed(2)} MB · Tap untuk ganti
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 36, marginBottom: 10, color: '#555' }}>📤</Text>
              <Text style={{ color: '#888', fontSize: 14, fontWeight: '600' }}>Pilih bukti transfer</Text>
              <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>JPG · PNG · PDF</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Upload progress */}
        {isUploading && (
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: '#888', fontSize: 12 }}>Mengunggah...</Text>
              <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '700' }}>{progress}%</Text>
            </View>
            <View style={{ height: 4, backgroundColor: '#222', borderRadius: 4 }}>
              <View style={{ height: 4, backgroundColor: '#F59E0B', borderRadius: 4, width: `${progress}%` }} />
            </View>
          </View>
        )}

        {/* Info catatan */}
        <View style={{ backgroundColor: '#0D1117', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1E2430' }}>
          <Text style={{ color: '#60A5FA', fontWeight: '700', fontSize: 12, marginBottom: 6 }}>💡 Catatan Penting</Text>
          <Text style={{ color: '#666', fontSize: 12, lineHeight: 18 }}>
            • Foto bukti transfer harus jelas dan terbaca{'\n'}
            • Pastikan nominal sesuai dengan total tagihan{'\n'}
            • Verifikasi biasanya selesai dalam 1x24 jam hari kerja{'\n'}
            • Hubungi kami jika lebih dari 24 jam belum terverifikasi
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0F0F12', borderTopWidth: 1, borderTopColor: '#1E1E24' }}>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={!file || isUploading}
          style={{
            backgroundColor: (!file || isUploading) ? '#1C1C22' : '#F59E0B',
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          {isUploading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={{ color: (!file || isUploading) ? '#555' : '#000', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 }}>
              {file ? 'Kirim Bukti Transfer 🚀' : 'Pilih file bukti transfer dulu'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Step dot component
function StepDot({ num, active, done, label }: { num: number; active?: boolean; done?: boolean; label: string }) {
  const bg = done ? '#F59E0B' : active ? '#F59E0B' : '#1C1C22';
  const textColor = (done || active) ? '#000' : '#555';
  const labelColor = (done || active) ? '#F59E0B' : '#555';
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: (!done && !active) ? 1 : 0, borderColor: '#333' }}>
        <Text style={{ color: textColor, fontSize: 12, fontWeight: '700' }}>{done ? '✓' : num}</Text>
      </View>
      <Text style={{ color: labelColor, fontSize: 10, marginTop: 4, fontWeight: (done || active) ? '700' : '400' }}>{label}</Text>
    </View>
  );
}
