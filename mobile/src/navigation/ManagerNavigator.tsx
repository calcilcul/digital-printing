import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import ProductManagementScreen from '../screens/manager/ProductManagementScreen';
import ManagerMaterialScreen from '../screens/manager/ManagerMaterialScreen';

const Tab = createBottomTabNavigator();

export default function ManagerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669', // Emerald
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6'
        },
      }}
    >
      <Tab.Screen 
        name="Laporan" 
        component={ManagerDashboardScreen} 
        options={{ tabBarLabel: 'Laporan' }}
      />
      <Tab.Screen 
        name="Produk" 
        component={ProductManagementScreen} 
        options={{ tabBarLabel: 'Produk' }}
      />
      <Tab.Screen 
        name="Material" 
        component={ManagerMaterialScreen} 
        options={{ tabBarLabel: 'Stok' }}
      />
    </Tab.Navigator>
  );
}
