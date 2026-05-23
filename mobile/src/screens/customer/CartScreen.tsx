import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { ChevronLeft, Trash2, Tag, CheckCircle2, Package, Truck, ArrowRight, Home, ShoppingCart } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight, ZoomIn } from 'react-native-reanimated';
import { Swipeable, RectButton } from 'react-native-gesture-handler';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const { items, isLoading, fetchCart, updateQuantity, removeItem, clearCart, getCartTotal } = useCartStore();
  const { checkout, isLoading: isCheckoutLoading } = useOrderStore();
  const { products } = useProductStore();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderIdRef, setOrderIdRef] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartTotal = getCartTotal();
  const FREE_SHIPPING_THRESHOLD = 500000;
  const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 25000;
  const tax = cartTotal * 0.08; // 8% tax
  const finalTotal = cartTotal - discount + shippingCost + tax;
  const progressPercent = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(cartTotal * 0.1);
      Alert.alert('Sukses', 'Promo code applied! 10% discount.');
    } else {
      Alert.alert('Invalid Code', 'Kode promo tidak valid.');
      setDiscount(0);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Kosongkan Keranjang',
      'Yakin ingin menghapus semua item dari keranjang?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Hapus', style: 'destructive', onPress: () => clearCart() }
      ]
    );
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    const orderId = await checkout();
    if (orderId) {
      clearCart();
      navigation.navigate('Payment', { orderId: orderId, amount: finalTotal });
    } else {
      Alert.alert('Checkout Gagal', 'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
    }
  };

  const renderRightActions = (id: number) => {
    return (
      <View className="bg-error w-20 items-center justify-center rounded-2xl mb-4 ml-3">
        <TouchableOpacity onPress={() => removeItem(id)} className="w-full h-full items-center justify-center">
          <Trash2 size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // Cross-sell logic
  const crossSellItems = products.filter(p => !items.find(i => i.productId === p.id)).slice(0, 3);

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-6">
        <Animated.View entering={ZoomIn} className="items-center">
          <View className="w-24 h-24 bg-success/20 rounded-full items-center justify-center mb-6">
            <View className="w-16 h-16 bg-success rounded-full items-center justify-center">
              <CheckCircle2 size={40} color="white" />
            </View>
          </View>
          <Text className="text-3xl font-black text-text mb-2">Order Placed!</Text>
          <Text className="text-text-muted text-center mb-8">Your order #{orderIdRef} has been confirmed and is now being processed.</Text>
          
          <View className="w-full bg-white rounded-3xl p-6 shadow-sm border border-border mb-8">
            <Text className="font-bold text-text mb-4">Order Timeline</Text>
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-success rounded-full items-center justify-center mr-4"><CheckCircle2 size={16} color="white" /></View>
              <Text className="font-bold text-text">Order Confirmed</Text>
            </View>
            <View className="w-0.5 h-6 bg-border ml-4 -my-4 z-[-1]" />
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-surface border-2 border-border rounded-full items-center justify-center mr-4"><Package size={16} color="#94A3B8" /></View>
              <Text className="font-bold text-text-muted">In Production</Text>
            </View>
            <View className="w-0.5 h-6 bg-border ml-4 -my-4 z-[-1]" />
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-surface border-2 border-border rounded-full items-center justify-center mr-4"><Truck size={16} color="#94A3B8" /></View>
              <Text className="font-bold text-text-muted">Out for Delivery</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: orderIdRef })} className="w-full bg-text py-4 rounded-full items-center mb-3">
            <Text className="text-white font-bold text-base">View Order Details</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setIsSuccess(false); navigation.navigate('Home'); }} className="w-full bg-surface py-4 rounded-full items-center border border-border">
            <Text className="text-text font-bold text-base">Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-border shadow-sm z-10">
        <View className="flex-row items-center">
          <Text className="text-text text-2xl font-black">My Cart</Text>
          <View className="bg-primary-light/20 px-2 py-0.5 rounded-full ml-3">
            <Text className="text-primary-light font-bold text-xs">{items.length} items</Text>
          </View>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text className="text-error font-bold text-sm">Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#1E3A8A" />
          </View>
        ) : items.length === 0 ? (
          <View className="py-20 items-center justify-center px-6">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-sm border border-border mb-6">
              <ShoppingCart size={40} color="#94A3B8" />
            </View>
            <Text className="text-xl font-bold text-text mb-2">Your cart is empty</Text>
            <Text className="text-text-muted text-center mb-8">Looks like you haven't added any products to your cart yet.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shop')} className="bg-primary px-8 py-4 rounded-full shadow-lg shadow-primary/30">
              <Text className="text-white font-bold text-base">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 pt-6">
            {/* Shipping Progress */}
            <View className="bg-white p-4 rounded-2xl mb-6 shadow-sm border border-border">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-text text-sm">
                  {cartTotal >= FREE_SHIPPING_THRESHOLD ? 'You got Free Shipping!' : `Add Rp ${(FREE_SHIPPING_THRESHOLD - cartTotal).toLocaleString('id-ID')} for Free Shipping`}
                </Text>
                <Truck size={18} color={cartTotal >= FREE_SHIPPING_THRESHOLD ? '#10B981' : '#1E3A8A'} />
              </View>
              <View className="h-2 bg-surface rounded-full overflow-hidden">
                <Animated.View 
                  style={{ width: `${progressPercent}%` }} 
                  className={`h-full ${cartTotal >= FREE_SHIPPING_THRESHOLD ? 'bg-success' : 'bg-primary'}`} 
                />
              </View>
            </View>

            {/* Cart Items */}
            {items.map((item) => (
              <Swipeable key={item.id} renderRightActions={() => renderRightActions(item.id)}>
                <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-border flex-row">
                  <View className="w-24 h-24 bg-surface rounded-xl mr-4 overflow-hidden">
                    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <View className="flex-1 justify-between">
                    <View>
                      <View className="flex-row justify-between items-start">
                        <Text className="font-bold text-text text-base flex-1" numberOfLines={2}>{item.name}</Text>
                        <TouchableOpacity onPress={() => removeItem(item.id)} className="p-1">
                          <Trash2 size={16} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-text-muted text-xs mt-1">Material: {item.options?.Material || 'Default'}</Text>
                      {item.options?.localDesignName && (
                        <Text className="text-success text-xs font-bold mt-1">✓ {item.options.localDesignName}</Text>
                      )}
                    </View>
                    <View className="flex-row justify-between items-end mt-2">
                      <Text className="font-extrabold text-text text-lg">Rp {item.subtotal?.toLocaleString('id-ID')}</Text>
                      <View className="flex-row items-center bg-surface border border-border rounded-full px-1">
                        <TouchableOpacity onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 items-center justify-center">
                          <Text className="font-bold text-text">-</Text>
                        </TouchableOpacity>
                        <Text className="font-bold text-text w-6 text-center">{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 items-center justify-center">
                          <Text className="font-bold text-text">+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Swipeable>
            ))}

            {/* Cross-Sell */}
            {crossSellItems.length > 0 && (
              <View className="mt-4 mb-6">
                <Text className="font-bold text-text mb-4">You might also like</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
                  {crossSellItems.map(item => (
                    <TouchableOpacity 
                      key={item.id}
                      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                      className="bg-white w-32 p-3 rounded-2xl border border-border shadow-sm mr-4"
                    >
                      <Image source={{ uri: item.image }} className="w-full h-20 bg-surface rounded-xl mb-2" resizeMode="cover" />
                      <Text className="font-bold text-text text-xs" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-primary font-bold text-xs mt-1">Rp {item.base_price.toLocaleString('id-ID')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Promo Code */}
            <View className="flex-row items-center bg-white rounded-2xl border border-border p-2 mb-6 shadow-sm">
              <View className="w-10 h-10 bg-surface rounded-xl items-center justify-center mr-2">
                <Tag size={18} color="#0F172A" />
              </View>
              <TextInput 
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Promo code (e.g. SAVE10)"
                className="flex-1 font-medium text-text h-10"
                autoCapitalize="characters"
              />
              <TouchableOpacity onPress={handleApplyPromo} className="bg-text px-4 py-2.5 rounded-xl">
                <Text className="text-white font-bold text-xs">Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View className="bg-white p-6 rounded-3xl border border-border shadow-sm mb-6">
              <Text className="font-black text-text text-lg mb-4">Order Summary</Text>
              
              <View className="flex-row justify-between mb-3">
                <Text className="text-text-muted">Subtotal</Text>
                <Text className="font-bold text-text">Rp {cartTotal.toLocaleString('id-ID')}</Text>
              </View>
              
              {discount > 0 && (
                <View className="flex-row justify-between mb-3">
                  <Text className="text-success">Discount (SAVE10)</Text>
                  <Text className="font-bold text-success">- Rp {discount.toLocaleString('id-ID')}</Text>
                </View>
              )}

              <View className="flex-row justify-between mb-3">
                <Text className="text-text-muted">Shipping</Text>
                <Text className="font-bold text-text">
                  {shippingCost === 0 ? <Text className="text-success">FREE</Text> : `Rp ${shippingCost.toLocaleString('id-ID')}`}
                </Text>
              </View>

              <View className="flex-row justify-between mb-4 pb-4 border-b border-border">
                <Text className="text-text-muted">Tax (8%)</Text>
                <Text className="font-bold text-text">Rp {tax.toLocaleString('id-ID')}</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="font-black text-text text-xl">Total</Text>
                <Text className="font-black text-primary text-2xl">Rp {finalTotal.toLocaleString('id-ID')}</Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity 
              onPress={handleCheckout}
              disabled={isCheckoutLoading}
              className={`w-full py-4 rounded-full items-center flex-row justify-center shadow-lg mb-10 ${isCheckoutLoading ? 'bg-primary/70' : 'bg-primary shadow-primary/30'}`}
            >
              {isCheckoutLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">Checkout</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
