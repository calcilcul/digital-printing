import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { LayoutDashboard, Settings, BarChart2, User } from 'lucide-react-native';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminManageScreen from '../screens/admin/AdminManageScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import UserDetailScreen from '../screens/admin/UserDetailScreen';
import StaffFormScreen from '../screens/admin/StaffFormScreen';
import ProductManagementScreen from '../screens/admin/ProductManagementScreen';
import ProductFormScreen from '../screens/admin/ProductFormScreen';
import MaterialManagementScreen from '../screens/admin/MaterialManagementScreen';
import AdminReportScreen from '../screens/admin/AdminReportScreen';
import AdminLogScreen from '../screens/admin/AdminLogScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import AdminOrderListScreen from '../screens/admin/AdminOrderListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A56E8',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F1F5F9',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AdminManageTab"
        component={AdminManageScreen}
        options={{
          tabBarLabel: 'Kelola',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AdminReportsTab"
        component={AdminReportScreen}
        options={{
          tabBarLabel: 'Laporan',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AdminProfileTab"
        component={AdminProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminMain" component={AdminTabs} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
      <Stack.Screen name="StaffForm" component={StaffFormScreen} />
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} />
      <Stack.Screen name="MaterialManagement" component={MaterialManagementScreen} />
      <Stack.Screen name="AdminLogs" component={AdminLogScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrderListScreen} />
    </Stack.Navigator>
  );
}
