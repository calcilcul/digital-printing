import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Upload, File as FileIcon } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { axiosClient } from '../../api/axiosClient';

export default function UploadDesignScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId, orderItemId } = route.params;

  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'application/postscript'],
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
    if (!file) {
      Toast.show({
        type: 'error',
        text1: 'Perhatian',
        text2: 'Silakan pilih file desain terlebih dahulu',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('order_item_id', orderItemId.toString());
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      await axiosClient.post('/api/design-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Toast.show({
        type: 'success',
        text1: 'Desain berhasil diunggah!',
        text2: 'AI kami sedang memprosesnya.',
      });
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Gagal',
        text2: error?.response?.data?.error || error?.response?.data?.message || 'Gagal mengunggah desain. Pastikan format JPG/PNG dan ukuran maks 10MB.',
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
        <Text className="text-xl font-bold text-slate-800 flex-1">Upload Desain</Text>
      </View>

      <View className="p-6">
        <Text className="text-slate-600 mb-6 leading-relaxed">
          Silakan upload file desain untuk item pesanan ini. Format yang didukung: JPG, PNG, PDF, atau CDR/AI (maksimal 20MB).
        </Text>

        <TouchableOpacity 
          onPress={pickDocument}
          className="border-2 border-dashed border-slate-300 rounded-3xl h-64 items-center justify-center bg-white mb-6"
        >
          {file ? (
            <View className="items-center">
              {file.mimeType?.includes('image') ? (
                <Image source={{ uri: file.uri }} className="w-32 h-32 rounded-xl mb-4" />
              ) : (
                <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                  <FileIcon size={32} color="#2563eb" />
                </View>
              )}
              <Text className="font-bold text-slate-800 px-4 text-center">{file.name}</Text>
              <Text className="text-blue-600 font-bold mt-4">Ganti File</Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Upload size={32} color="#2563eb" />
              </View>
              <Text className="font-bold text-slate-800 text-lg">Pilih File Desain</Text>
              <Text className="text-slate-500 text-sm mt-1">Tap di sini untuk memilih</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleUpload}
          disabled={loading || !file}
          className={`w-full py-4 rounded-xl items-center justify-center ${loading || !file ? 'bg-slate-300' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Upload Sekarang</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
