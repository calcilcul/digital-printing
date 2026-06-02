import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerTabs';
import StaffNavigator from './StaffTabs';
import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isLoading, token, user, checkAuth, activeRoleMode } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token && user ? (
        user.role?.toLowerCase() === 'owner' ? (
          activeRoleMode === 'admin' ? (
            <Stack.Screen name="Admin" component={AdminNavigator} />
          ) : (
            <Stack.Screen name="Staff" component={StaffNavigator} />
          )
        ) : user.role?.toLowerCase() === 'staff' ? (
          <Stack.Screen name="Staff" component={StaffNavigator} />
        ) : (
          <Stack.Screen name="Customer" component={CustomerNavigator} />
        )
      ) : (
        <>
          <Stack.Screen name="Customer" component={CustomerNavigator} />
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator} 
            options={{ animationTypeForReplace: 'pop', presentation: 'fullScreenModal' }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}
