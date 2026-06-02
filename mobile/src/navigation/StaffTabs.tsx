import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, ClipboardList, Printer, User } from 'lucide-react-native';

// Placeholder imports for screens (will create these next)
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffOrderListScreen from '../screens/staff/StaffOrderListScreen';
import StaffOrderDetailScreen from '../screens/staff/StaffOrderDetailScreen';
import StaffProductionScreen from '../screens/staff/StaffProductionScreen';
import StaffProfileScreen from '../screens/staff/StaffProfileScreen';

import { useStaffStore } from '../store/staffStore';

export type StaffTabParamList = {
  DashboardTab: undefined;
  OrdersTab: { filter?: string };
  ProductionTab: undefined;
  ProfileTab: undefined;
};

export type StaffStackParamList = {
  Tabs: undefined;
  OrderDetail: { orderId: number };
};

const Tab = createBottomTabNavigator<StaffTabParamList>();
const Stack = createNativeStackNavigator<StaffStackParamList>();

function StaffTabNavigator() {
  const { pendingCount } = useStaffStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1e40af', // blue-800
        tabBarInactiveTintColor: '#64748b', // slate-500
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'DashboardTab') return <LayoutDashboard color={color} size={size} />;
          if (route.name === 'OrdersTab') return <ClipboardList color={color} size={size} />;
          if (route.name === 'ProductionTab') return <Printer color={color} size={size} />;
          if (route.name === 'ProfileTab') return <User color={color} size={size} />;
          return null;
        },
        tabBarLabel: route.name === 'DashboardTab' ? 'Dashboard' : 
                     route.name === 'OrdersTab' ? 'Pesanan' : 
                     route.name === 'ProductionTab' ? 'Produksi' : 'Profil'
      })}
    >
      <Tab.Screen name="DashboardTab" component={StaffDashboardScreen} />
      <Tab.Screen 
        name="OrdersTab" 
        component={StaffOrderListScreen} 
        options={{
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444', color: 'white' }
        }}
      />
      <Tab.Screen name="ProductionTab" component={StaffProductionScreen} />
      <Tab.Screen name="ProfileTab" component={StaffProfileScreen} />
    </Tab.Navigator>
  );
}

export default function StaffNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={StaffTabNavigator} />
      <Stack.Screen name="OrderDetail" component={StaffOrderDetailScreen} />
    </Stack.Navigator>
  );
}
