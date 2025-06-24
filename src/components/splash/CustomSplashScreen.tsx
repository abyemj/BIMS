
import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '@/styles/globalStyles';

const CustomSplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        // Ensure you have an image at this path, or replace with a valid source
        // For example, if your splash image is in 'react-native-prototype/assets/splash.png'
        source={require('../../../assets/images/benuelogo2.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Benue Integrated Management System</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background, // Or your preferred splash background
  },
  logo: {
    width: 120, // Adjusted to be "small"
    height: 120, // Adjusted to be "small"
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3, // Using h3 for a slightly smaller title than h2
    color: colors.primary, // Or colors.text
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.md,
  },
});

export default CustomSplashScreen;
