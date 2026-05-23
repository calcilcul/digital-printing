import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut, runOnJS } from 'react-native-reanimated';

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Simulasi loading 2 detik sebelum berpindah
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn.duration(1000)} 
        exiting={FadeOut.duration(500)}
        style={styles.content}
      >
        {/* Placeholder logo, bisa diganti Image native */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>JM</Text>
        </View>
        <Text style={styles.brandName}>Jaya Mandiri</Text>
        <Text style={styles.tagline}>Digital Printing & Advertising</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A', // Dark Blue Primary
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#93C5FD', // Blue 300
    marginTop: 8,
    fontWeight: '500',
  }
});
