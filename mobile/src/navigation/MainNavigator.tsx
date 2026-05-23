import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react-native';
import HomeScreen from '../screens/customer/HomeScreen';
import CatalogScreen from '../screens/customer/CatalogScreen';
import CartScreen from '../screens/customer/CartScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { items } = useCartStore();
  const { token } = useAuthStore();
  const navigation = useNavigation<any>();
  
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#1E3A8A', // Dark Blue Primary
        tabBarInactiveTintColor: '#94A3B8', // Slate 400
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
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }: any) => {
          let IconComponent;
          let badge = 0;

          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'Shop') IconComponent = LayoutGrid;
          else if (route.name === 'Cart') {
            IconComponent = ShoppingCart;
            badge = cartItemCount;
          }
          else if (route.name === 'Profile') IconComponent = User;

          // Kontras maksimal: aktif = putih di atas biru tua
          const iconColor = focused ? '#ffffff' : color;

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                position: 'absolute',
                top: -10,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused ? '#1E3A8A' : 'transparent', // Dark Blue background active indicator
              }} />
              {IconComponent && <IconComponent size={24} color={iconColor} strokeWidth={focused ? 2.5 : 2} />}
              
              {/* Real-time Cart Badge */}
              {badge > 0 && (
                <Animated.View 
                  entering={FadeIn} exiting={FadeOut}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    backgroundColor: '#EF4444',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: '#ffffff',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 2 }}>{badge > 99 ? '99+' : badge}</Text>
                </Animated.View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Shop" component={CatalogScreen} options={{ title: 'Shop' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
