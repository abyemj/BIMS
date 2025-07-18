
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '@/styles/globalStyles';

const CustomSplashScreen = ({ onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main content animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(2000), // Minimum 2 seconds display
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(1000), // Additional time with footer visible
    ]).start(() => onAnimationComplete?.());
  }, []);

  return (
    <LinearGradient
      colors={['#1a237e', '#303f9f']}
      style={[StyleSheet.absoluteFill, styles.container]}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
      <Image
          source={require('../../../assets/images/bims.png')}
          style={styles.logo1}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          Benue Integrated {'\n'}Management System
        </Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: footerAnim }]}>
       
        <Text style={styles.footerText}>Powered by BDIC {''}</Text> 
        <Image
          source={require('../../../assets/images/bdic-white.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 10,
  },
  logo1: {
    marginBottom:10,
    width: 70,
    height: 70,
  },
  logo: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});

export default CustomSplashScreen;