import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Platform } from 'react-native';
import { Home, CreditCard, Palette, Printer, User } from 'lucide-react-native';

// Import Screens
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffPaymentVerificationScreen from '../screens/staff/StaffPaymentVerificationScreen';
import StaffDesignReviewScreen from '../screens/staff/StaffDesignReviewScreen';
import StaffProductionScreen from '../screens/staff/StaffProductionScreen';
import StaffProfileScreen from '../screens/staff/StaffProfileScreen';
import StaffOrderVerificationScreen from '../screens/staff/StaffOrderVerificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StaffTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2563eb', // Indigo Blue Primary
        tabBarInactiveTintColor: '#94a3b8', // Slate 400
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          backgroundColor: '#ffffff',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }: any) => {
          let IconComponent;

          if (route.name === 'DashboardTab') IconComponent = Home;
          else if (route.name === 'PaymentTab') IconComponent = CreditCard;
          else if (route.name === 'DesignTab') IconComponent = Palette;
          else if (route.name === 'ProductionTab') IconComponent = Printer;
          else if (route.name === 'ProfileTab') IconComponent = User;

          const iconColor = focused ? '#ffffff' : color;

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                position: 'absolute',
                top: -10,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: focused ? '#2563eb' : 'transparent',
              }} />
              {IconComponent && <IconComponent size={22} color={iconColor} strokeWidth={focused ? 2.5 : 2} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={StaffDashboardScreen} options={{ title: 'Ringkasan' }} />
      <Tab.Screen name="PaymentTab" component={StaffPaymentVerificationScreen} options={{ title: 'Bayar' }} />
      <Tab.Screen name="DesignTab" component={StaffDesignReviewScreen} options={{ title: 'Desain' }} />
      <Tab.Screen name="ProductionTab" component={StaffProductionScreen} options={{ title: 'Cetak' }} />
      <Tab.Screen name="ProfileTab" component={StaffProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function StaffNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="StaffTabs" component={StaffTabNavigator} />
      <Stack.Screen name="StaffVerification" component={StaffOrderVerificationScreen} />
    </Stack.Navigator>
  );
}
