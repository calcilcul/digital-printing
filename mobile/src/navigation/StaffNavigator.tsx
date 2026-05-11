import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffOrderVerificationScreen from '../screens/staff/StaffOrderVerificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator untuk flow Staff (dashboard -> verifikasi detail)
function StaffStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
      <Stack.Screen name="StaffVerification" component={StaffOrderVerificationScreen} />
    </Stack.Navigator>
  );
}

export default function StaffNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
        },
      }}
    >
      <Tab.Screen
        name="Verifikasi"
        component={StaffStack}
        options={{ tabBarLabel: 'Pesanan' }}
      />
    </Tab.Navigator>
  );
}
