import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import adminApi from '../../services/adminApi';
import { useAdminStore } from '../../store/adminStore';
import { axiosClient } from '../../api/axiosClient';
// No external Picker needed for web

export default function ProductFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { fetchProducts, materials, fetchMaterials } = useAdminStore();
  
  const editingProduct = route.params?.product;

  const [name, setName] = useState(editingProduct?.name || '');
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [basePrice, setBasePrice] = useState(editingProduct?.base_price?.toString() || '');
  const [estimatedDays, setEstimatedDays] = useState(editingProduct?.estimated_days?.toString() || '');
  const [isActive, setIsActive] = useState(editingProduct ? editingProduct.is_active : true);
  
  // Kategori List
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(editingProduct?.category_id || null);
  const [catLoading, setCatLoading] = useState(true);

  // Varian
  const [variants, setVariants] = useState<any[]>(editingProduct?.variants || []);
  
  const [isLoading, setIsLoading] = useState(false);

  // File State
  const [fileName, setFileName] = useState('');
  const [imageFile, setImageFile] = useState<any>(null);

  useEffect(() => {
    fetchMaterials();
    axiosClient.get('/categories')
      .then(res => {
        const cats = res.data.data || res.data;
        setCategories(cats);
        // Default category
        if (!categoryId && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setCatLoading(false));
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !basePrice) {
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Nama dan Harga Dasar wajib diisi' });
      else Alert.alert('Error', 'Nama dan Harga Dasar wajib diisi');
      return;
    }

    if (variants.length === 0) {
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Minimal harus ada 1 varian' });
      else Alert.alert('Error', 'Minimal harus ada 1 varian');
      return;
    }

    // Validate Variants
    for (let v of variants) {
      if (!v.variant_name || !v.price) {
        if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Nama dan Harga Varian wajib diisi' });
        else Alert.alert('Error', 'Nama dan Harga Varian wajib diisi');
        return;
      }
    }

    setIsLoading(true);
    
    const payload = {
      category_id: categoryId,
      name,
      description,
      base_price: parseFloat(basePrice) || 0,
      estimated_days: parseInt(estimatedDays, 10) || 1,
      is_active: isActive,
      variants: variants.map((v, i) => ({
        id: v.id || 0,
        sku: v.sku || `SKU-${Date.now()}-${i}`,
        variant_name: v.variant_name,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock, 10) || 0,
        is_active: v.is_active !== undefined ? v.is_active : true,
        material_id: v.material_id,
        material_usage: parseFloat(v.material_usage) || 0
      }))
    };

    try {
      let savedProductId = editingProduct?.id;
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        if (Platform.OS === 'web') Toast.show({ type: 'success', text1: 'Produk berhasil diubah' });
      } else {
        const res = await adminApi.createProduct(payload);
        savedProductId = res.data.product_id;
        if (Platform.OS === 'web') Toast.show({ type: 'success', text1: 'Produk berhasil ditambahkan' });
      }

      if (imageFile && savedProductId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await adminApi.uploadProductImage(savedProductId, formData);
      }
      
      await fetchProducts();
      navigation.goBack();
    } catch (error: any) {
      console.error('Save product error:', error);
      const msg = error.response?.data?.message || 'Gagal menyimpan produk';
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: msg });
      else Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, {
      id: 0,
      sku: '',
      variant_name: '',
      price: '',
      stock: '0',
      material_id: null,
      material_usage: '0',
      is_active: true
    }]);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const renderDropdown = (value: any, onValueChange: (val: any) => void, items: any[], placeholder: string) => {
    if (Platform.OS === 'web') {
      return (
        <select
          value={value === null ? '' : value}
          onChange={(e) => {
            const val = e.target.value;
            onValueChange(val === '' ? null : Number(val));
          }}
          style={{
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#e2e8f0',
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 48,
            color: '#1e293b',
            outlineStyle: 'none',
            fontSize: 14,
            width: '100%'
          }}
        >
          <option value="">{placeholder}</option>
          {items.map((item, idx) => (
            <option key={idx} value={item.id}>{item.name}</option>
          ))}
        </select>
      );
    }
    
    // For Native, fallback to simple UI (Admin is mostly web)
    const selectedItem = items.find(i => i.id === value);
    return (
      <View className="border border-slate-200 rounded-lg h-12 justify-center bg-white px-4">
        <Text className={value ? "text-slate-800" : "text-slate-400"}>
          {value ? selectedItem?.name : placeholder}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white p-5 pt-12 border-b border-slate-200 flex-row items-center justify-between z-10 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <ArrowLeft color="#334155" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-800">
            {editingProduct ? 'Ubah Produk' : 'Tambah Produk'}
          </Text>
        </View>

        <View className="flex-row items-center">
          <View className="flex-row items-center mr-6">
            <Text className="text-slate-600 font-medium mr-2">Status Produk (Aktif)</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={isActive ? '#2563eb' : '#f8fafc'}
            />
          </View>
          <TouchableOpacity 
            className="bg-blue-600 px-6 py-2.5 rounded-lg flex-row items-center shadow-sm"
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator size="small" color="white" /> : (
              <>
                <Save color="white" size={18} />
                <Text className="text-white font-bold ml-2 text-base">Simpan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Main Card */}
        <View className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          
          {/* Row 1: Nama & Kategori */}
          <View className="flex-row flex-wrap -mx-3 mb-5">
            <View className="w-full md:w-1/2 px-3 mb-5 md:mb-0">
              <Text className="text-slate-700 font-bold mb-2">Nama Produk</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-lg px-4 h-12 text-slate-800"
                placeholder="Misal: Brosur A4 Premium"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="w-full md:w-1/2 px-3">
              <Text className="text-slate-700 font-bold mb-2">Kategori</Text>
              {catLoading ? <ActivityIndicator size="small" /> : renderDropdown(categoryId, setCategoryId, categories, "-- Pilih Kategori --")}
            </View>
          </View>

          {/* Row 2: Deskripsi */}
          <View className="mb-5">
            <Text className="text-slate-700 font-bold mb-2">Deskripsi</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800"
              placeholder="Cetak brosur full color kertas tebal..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              style={{ minHeight: 100 }}
            />
          </View>

          {/* Row 3: Harga & Pengerjaan */}
          <View className="flex-row flex-wrap -mx-3 mb-8">
            <View className="w-full md:w-1/2 px-3 mb-5 md:mb-0">
              <Text className="text-slate-700 font-bold mb-2">Harga Dasar (Rp)</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-lg px-4 h-12 text-slate-800 font-semibold text-blue-600"
                placeholder="50000"
                keyboardType="numeric"
                value={basePrice}
                onChangeText={setBasePrice}
              />
            </View>
            <View className="w-full md:w-1/2 px-3">
              <Text className="text-slate-700 font-bold mb-2">Estimasi Pengerjaan (Hari)</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-lg px-4 h-12 text-slate-800"
                placeholder="2"
                keyboardType="numeric"
                value={estimatedDays}
                onChangeText={setEstimatedDays}
              />
            </View>
          </View>

          {/* Variasi Produk */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-slate-800">Varian Produk</Text>
              <TouchableOpacity 
                className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
                onPress={addVariant}
              >
                <Plus color="#2563eb" size={16} />
                <Text className="text-blue-700 font-bold ml-1">Tambah Varian</Text>
              </TouchableOpacity>
            </View>

            {variants.length === 0 ? (
              <View className="bg-slate-50 p-6 rounded-lg border border-slate-200 items-center justify-center border-dashed">
                <Text className="text-slate-500">Belum ada varian produk. Klik "Tambah Varian".</Text>
              </View>
            ) : (
              <View>
                {/* Headers (Web only view) */}
                {Platform.OS === 'web' && (
                  <View className="flex-row mb-2 px-1">
                    <Text className="w-[25%] text-xs font-bold text-slate-400 uppercase">Nama Varian</Text>
                    <Text className="w-[20%] text-xs font-bold text-slate-400 uppercase">Harga (Rp)</Text>
                    <Text className="w-[15%] text-xs font-bold text-slate-400 uppercase">Stok</Text>
                    <Text className="w-[25%] text-xs font-bold text-slate-400 uppercase">Bahan Baku Gudang</Text>
                    <Text className="w-[10%] text-xs font-bold text-slate-400 uppercase">Konsumsi</Text>
                    <Text className="w-[5%]"></Text>
                  </View>
                )}

                {/* Variant Rows */}
                {variants.map((v, index) => (
                  <View key={index} className={`flex-row flex-wrap md:flex-nowrap items-center mb-3 ${Platform.OS !== 'web' ? 'bg-slate-50 p-3 rounded-lg border border-slate-200' : ''}`}>
                    
                    {Platform.OS !== 'web' && <Text className="w-full text-xs font-bold text-slate-400 mb-1">Nama Varian</Text>}
                    <View className="w-full md:w-[25%] md:pr-2 mb-2 md:mb-0">
                      <TextInput
                        className="bg-white border border-slate-200 rounded-lg px-3 h-11 text-slate-800"
                        placeholder="Glossy 150gsm"
                        value={v.variant_name}
                        onChangeText={(txt) => updateVariant(index, 'variant_name', txt)}
                      />
                    </View>

                    {Platform.OS !== 'web' && <Text className="w-full text-xs font-bold text-slate-400 mb-1">Harga (Rp)</Text>}
                    <View className="w-full md:w-[20%] md:pr-2 mb-2 md:mb-0">
                      <TextInput
                        className="bg-white border border-slate-200 rounded-lg px-3 h-11 text-slate-800"
                        placeholder="50000"
                        keyboardType="numeric"
                        value={v.price?.toString()}
                        onChangeText={(txt) => updateVariant(index, 'price', txt)}
                      />
                    </View>

                    {Platform.OS !== 'web' && <Text className="w-full text-xs font-bold text-slate-400 mb-1">Stok</Text>}
                    <View className="w-full md:w-[15%] md:pr-2 mb-2 md:mb-0">
                      <TextInput
                        className="bg-white border border-slate-200 rounded-lg px-3 h-11 text-slate-800"
                        placeholder="0"
                        keyboardType="numeric"
                        value={v.stock?.toString()}
                        onChangeText={(txt) => updateVariant(index, 'stock', txt)}
                      />
                    </View>

                    {Platform.OS !== 'web' && <Text className="w-full text-xs font-bold text-slate-400 mb-1">Bahan Baku Gudang</Text>}
                    <View className="w-full md:w-[25%] md:pr-2 mb-2 md:mb-0">
                      {renderDropdown(v.material_id, (val) => updateVariant(index, 'material_id', val), materials, "-- Tanpa Bahan --")}
                    </View>

                    {Platform.OS !== 'web' && <Text className="w-full text-xs font-bold text-slate-400 mb-1">Konsumsi</Text>}
                    <View className="w-full md:w-[10%] md:pr-2 mb-2 md:mb-0">
                      <TextInput
                        className="bg-white border border-slate-200 rounded-lg px-3 h-11 text-slate-800"
                        placeholder="0"
                        keyboardType="numeric"
                        value={v.material_usage?.toString()}
                        onChangeText={(txt) => updateVariant(index, 'material_usage', txt)}
                        editable={v.material_id !== null}
                      />
                    </View>

                    <View className="w-full md:w-[5%] items-center justify-center mt-2 md:mt-0">
                      <TouchableOpacity onPress={() => removeVariant(index)} className="p-2">
                        <X color="#ef4444" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <Text className="text-slate-400 text-xs mt-1">Kosongkan kolom harga untuk menggunakan harga dasar.</Text>
              </View>
            )}
          </View>

          {/* Foto Produk */}
          <View>
            <Text className="text-slate-700 font-bold mb-2">Foto Produk (JPG/PNG)</Text>
            
            <TouchableOpacity 
              className="flex-row items-center border border-slate-200 rounded-lg px-4 h-12 bg-white overflow-hidden"
              onPress={() => {
                // Dummy file picker behavior
                if (Platform.OS === 'web') {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/png, image/jpeg';
                  input.onchange = (e: any) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setFileName(file.name);
                      setImageFile(file);
                    }
                  };
                  input.click();
                } else {
                  Alert.alert("Info", "Pilih gambar (Simulasi)");
                  setFileName("gambar_produk.jpg");
                }
              }}
            >
              <View className="bg-slate-100 h-full justify-center px-4 border-r border-slate-200 -ml-4 mr-3">
                <Text className="text-slate-600 font-medium text-sm">Choose File</Text>
              </View>
              <Text className="text-slate-500 text-sm flex-1 truncate">
                {fileName || "No file chosen"}
              </Text>
            </TouchableOpacity>
            <Text className="text-slate-400 text-xs mt-2">* Kosongkan jika tidak ingin mengubah foto</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
