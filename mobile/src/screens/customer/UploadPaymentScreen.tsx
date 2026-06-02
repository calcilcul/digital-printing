import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Upload, File as FileIcon, Copy } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { axiosClient } from '../../api/axiosClient';

export default function UploadPaymentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId, totalAmount } = route.params;

  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await axiosClient.get('/api/payment-methods');
        setPaymentMethods(res.data.payment_methods || []);
      } catch (error) {
        console.error('Failed to fetch payment methods', error);
      }
    };
    fetchMethods();
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedMethod) {
      Toast.show({
        type: 'error',
        text1: 'Perhatian',
        text2: 'Silakan pilih metode pembayaran terlebih dahulu',
      });
      return;
    }

    if (!file) {
      Toast.show({
        type: 'error',
        text1: 'Perhatian',
        text2: 'Silakan pilih file bukti pembayaran',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('order_id', orderId.toString());
      formData.append('payment_method_id', selectedMethod.toString());
      formData.append('amount', totalAmount.toString());
      formData.append('payment_proof', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      await axiosClient.post('/api/payments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Toast.show({
        type: 'success',
        text1: 'Bukti pembayaran terkirim!',
        text2: 'Menunggu verifikasi admin.',
      });
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Gagal',
        text2: error?.response?.data?.error || error?.response?.data?.message || 'Gagal mengirim bukti bayar. Coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="pt-12 pb-4 px-4 bg-white border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800 flex-1">Pembayaran</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        
        <View className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6 items-center">
          <Text className="text-slate-500 mb-2">Total Tagihan</Text>
          <Text className="text-3xl font-bold text-blue-600">Rp {totalAmount?.toLocaleString('id-ID')}</Text>
        </View>

        <Text className="font-bold text-lg text-slate-800 mb-3">Pilih Metode Pembayaran</Text>
        <View className="mb-6">
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-xl border mb-3 flex-row items-center ${
                selectedMethod === method.id 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-slate-200 bg-white'
              }`}
            >
              <View className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                selectedMethod === method.id ? 'border-blue-600' : 'border-slate-300'
              }`}>
                {selectedMethod === method.id && <View className="w-3 h-3 bg-blue-600 rounded-full" />}
              </View>
              <Text className={`font-bold ${selectedMethod === method.id ? 'text-blue-700' : 'text-slate-700'}`}>
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="font-bold text-lg text-slate-800 mb-3">Upload Bukti Transfer</Text>
        <TouchableOpacity 
          onPress={pickDocument}
          className="border-2 border-dashed border-slate-300 rounded-3xl h-48 items-center justify-center bg-white mb-6"
        >
          {file ? (
            <View className="items-center">
              {file.mimeType?.includes('image') ? (
                <Image source={{ uri: file.uri }} className="w-20 h-20 rounded-xl mb-2" />
              ) : (
                <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-2">
                  <FileIcon size={24} color="#2563eb" />
                </View>
              )}
              <Text className="font-bold text-slate-800 px-4 text-center">{file.name}</Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-3">
                <Upload size={24} color="#2563eb" />
              </View>
              <Text className="font-bold text-slate-800">Pilih File Bukti Bayar</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleUpload}
          disabled={loading || !file || !selectedMethod}
          className={`w-full py-4 rounded-xl items-center justify-center ${loading || !file || !selectedMethod ? 'bg-slate-300' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Kirim Pembayaran</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
