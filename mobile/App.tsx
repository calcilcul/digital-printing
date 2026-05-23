import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
import UploadPaymentScreen from './src/screens/customer/UploadPaymentScreen';
import SplashScreen from './src/screens/SplashScreen';
import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const { token, user, initialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!initialized) {
    // Basic fallback if initialize takes a split second
    return null;
  }

  // Render navigator berdasarkan role (Guest default)
  const getRoleNavigator = () => {
    if (!user || !token) return MainNavigator; // GUEST OR CUSTOMER
    
    const role = user.role?.toLowerCase() || '';
    if (role === 'staff') return StaffNavigator;
    if (role === 'owner' || role === 'manager') return ManagerNavigator;
    
    return MainNavigator; // Default Customer
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade' }}>
              {/* Splash Screen */}
              <Stack.Screen name="Splash" component={SplashScreen} />
              
              {/* Main App (Always accessible, role-based) */}
              <Stack.Screen 
                key={token && user ? `${user.role}_navigator` : 'guest_navigator'}
                name="Main" 
                component={getRoleNavigator()} 
                options={{ animation: 'fade' }} 
              />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="UploadDesign" component={UploadDesignScreen} options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="UploadPayment" component={UploadPaymentScreen} options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="Payment" component={PaymentScreen} options={{ animation: 'slide_from_bottom' }} />

              {/* Auth Screens (Accessed via modal or stack) */}
              <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
