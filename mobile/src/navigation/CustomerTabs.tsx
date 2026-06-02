import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, LayoutGrid, User, ClipboardList } from 'lucide-react-native';

import HomeScreen from '../screens/customer/HomeScreen';
import CatalogScreen from '../screens/customer/CatalogScreen';
import CartScreen from '../screens/customer/CartScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import OrderDetailScreen from '../screens/customer/OrderDetailScreen';
import UploadDesignScreen from '../screens/customer/UploadDesignScreen';
import UploadPaymentScreen from '../screens/customer/UploadPaymentScreen';
import InvoiceDetailScreen from '../screens/customer/InvoiceDetailScreen';

export type CustomerTabParamList = {
  HomeTab: undefined;
  CatalogTab: { searchQuery?: string };
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type CustomerStackParamList = {
  Tabs: undefined;
  ProductDetail: { productId: number };
  OrderDetail: { orderId: number };
  UploadDesign: { orderId: number, orderItemId: number };
  UploadPayment: { orderId: number, totalAmount: number };
  Cart: undefined; // Cart is now a regular screen
  InvoiceDetail: { orderId: number };
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

function CustomerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb', // blue-600
        tabBarInactiveTintColor: '#64748b', // slate-500
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9', // slate-100
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeTab') return <Home color={color} size={size} />;
          if (route.name === 'CatalogTab') return <LayoutGrid color={color} size={size} />;
          if (route.name === 'OrdersTab') return <ClipboardList color={color} size={size} />;
          if (route.name === 'ProfileTab') return <User color={color} size={size} />;
          return null;
        },
        tabBarLabel: route.name === 'HomeTab' ? 'Beranda' : 
                     route.name === 'CatalogTab' ? 'Katalog' : 
                     route.name === 'OrdersTab' ? 'Pesanan' : 'Profil'
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="CatalogTab" component={CatalogScreen} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={CustomerTabNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="UploadDesign" component={UploadDesignScreen} />
      <Stack.Screen name="UploadPayment" component={UploadPaymentScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    </Stack.Navigator>
  );
}

