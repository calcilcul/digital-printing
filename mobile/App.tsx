/// <reference path="./app.d.ts" />
// eslint-disable-next-line import/no-unresolved
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import WebSocketHandler from './src/components/WebSocketHandler';

import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <WebSocketHandler />
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}
