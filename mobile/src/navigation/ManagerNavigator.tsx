import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Alert } from 'react-native';
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import ProductManagementScreen from '../screens/manager/ProductManagementScreen';
import ManagerMaterialScreen from '../screens/manager/ManagerMaterialScreen';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { BarChart2, Package, Layers, LogOut } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

function LogoutButton() {
  const { signOut } = useAuthStore();
  const { clearCart } = useCartStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Yakin ingin keluar dari akun Manager?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          clearCart();
          await signOut();
        }
      }
    ]);
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <LogOut size={22} color="#EF4444" />
    </TouchableOpacity>
  );
}

export default function ManagerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: 'bold', color: '#0F172A' },
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6'
        },
      })}
    >
      <Tab.Screen 
        name="Laporan" 
        component={ManagerDashboardScreen} 
        options={{ 
          tabBarLabel: 'Laporan',
          headerTitle: 'Dashboard Manager',
          tabBarIcon: ({ color }) => <BarChart2 size={22} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Produk" 
        component={ProductManagementScreen} 
        options={{ 
          tabBarLabel: 'Produk',
          headerTitle: 'Manajemen Produk',
          tabBarIcon: ({ color }) => <Package size={22} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Material" 
        component={ManagerMaterialScreen} 
        options={{ 
          tabBarLabel: 'Stok',
          headerTitle: 'Stok Material',
          tabBarIcon: ({ color }) => <Layers size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
