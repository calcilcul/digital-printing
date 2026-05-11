import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import Navigators & Screens
import MainNavigator from './src/navigation/MainNavigator';
import StaffNavigator from './src/navigation/StaffNavigator';
import ManagerNavigator from './src/navigation/ManagerNavigator';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import PaymentScreen from './src/screens/customer/PaymentScreen';
import ProductDetailScreen from './src/screens/customer/ProductDetailScreen';
import OrderDetailScreen from './src/screens/customer/OrderDetailScreen';
import UploadDesignScreen from './src/screens/customer/UploadDesignScreen';
import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const { token, user, initialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  const isAuthenticated = !!token;
  
  // Render navigator berdasarkan role
  const getRoleNavigator = () => {
    if (!user) return MainNavigator;
    
    const role = user.role?.toLowerCase() || '';
    if (role === 'staff') {
      return StaffNavigator;
    } else if (role === 'owner' || role === 'manager') {
      return ManagerNavigator;
    }
    return MainNavigator; // Default Customer
  };

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            {isAuthenticated ? (
              <>
                {/* Dynamically assign the main screen based on role */}
                <Stack.Screen name="Main" component={getRoleNavigator()} />
                
                {/* Global Screens that anyone can access if needed, though mostly for Customer */}
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
                <Stack.Screen name="UploadDesign" component={UploadDesignScreen} />
                <Stack.Screen name="Payment" component={PaymentScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
