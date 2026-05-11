import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { axiosClient } from '../../api/axiosClient';

export default function UploadDesignScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderItemId } = route.params || {};

  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'application/postscript', 'application/illustrator'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setFile(result.assets[0]);
        setUploadProgress(0);
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      Alert.alert('Peringatan', 'Silakan pilih file desain terlebih dahulu');
      return;
    }

    if (!orderItemId) {
      Alert.alert('Peringatan', 'ID Item Pesanan tidak ditemukan');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    
    formData.append('design_file', {
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      type: file.mimeType || 'application/octet-stream',
      name: file.name,
    } as any);

    try {
      await axiosClient.post(`/api/orders/items/${orderItemId}/design`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      Alert.alert('Sukses', 'File desain berhasil diunggah!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setFile(null);
    } catch (error: any) {
      console.log('Upload error:', error);
      Alert.alert('Upload Gagal', error.response?.data?.message || 'Terjadi kesalahan saat mengunggah file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 bg-white flex-row items-center shadow-sm shadow-gray-200 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-xl font-bold text-gray-700">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center font-bold text-lg text-gray-900 mr-10">Upload Desain</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <View className="bg-white p-4 rounded-2xl mb-6 shadow-sm shadow-gray-100">
          <Text className="text-gray-500 text-sm">Upload desain untuk item pesanan:</Text>
          <Text className="text-gray-900 font-bold">ID Item: {orderItemId}</Text>
        </View>

        <View 
          className={`border-2 border-dashed rounded-3xl p-8 items-center justify-center mb-6 ${
            file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
          }`}
        >
          {file ? (
            <View className="items-center w-full">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Text className="text-2xl">📄</Text>
              </View>
              <Text className="text-gray-900 font-bold text-center mb-1">{file.name}</Text>
              <Text className="text-gray-500 text-sm text-center">
                {(file.size ? file.size / (1024 * 1024) : 0).toFixed(2)} MB
              </Text>
              
              <TouchableOpacity 
                onPress={() => setFile(null)} 
                className="mt-4 px-4 py-2 bg-red-50 rounded-xl"
                disabled={isUploading}
              >
                <Text className="text-red-600 font-semibold text-sm">Hapus File</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl text-gray-400">📤</Text>
              </View>
              <Text className="text-gray-600 font-semibold mb-2">Pilih file dari perangkat Anda</Text>
              <Text className="text-gray-400 text-sm text-center mb-6">Ukuran maksimal 50MB</Text>
              
              <TouchableOpacity 
                onPress={pickDocument}
                className="bg-gray-900 px-6 py-3 rounded-xl shadow-sm"
              >
                <Text className="text-white font-bold">Cari File</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isUploading && (
          <View className="mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700 font-semibold text-sm">Mengunggah...</Text>
              <Text className="text-blue-600 font-bold text-sm">{uploadProgress}%</Text>
            </View>
            <View className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${uploadProgress}%` }} 
              />
            </View>
          </View>
        )}

        <TouchableOpacity 
          className={`w-full py-4 rounded-xl items-center shadow-sm mb-10 ${
            !file || isUploading ? 'bg-gray-300' : 'bg-blue-600 shadow-blue-500/30'
          }`}
          onPress={uploadFile}
          disabled={!file || isUploading}
        >
          <Text className={`font-bold text-lg tracking-wide ${!file || isUploading ? 'text-gray-500' : 'text-white'}`}>
            {isUploading ? 'MEMPROSES...' : 'UNGGAH DESAIN'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
