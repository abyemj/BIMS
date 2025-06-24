
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, Redirect, useRouter } from 'expo-router';

export default function ReportsScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdmin = user && ['Chairman', 'Director'].includes(user.role);

  React.useEffect(() => {
    if (!loading && user && !isAdmin) {
      // Redirect non-admins if they somehow land here
      router.replace('/(tabs)/meetings');
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isAdmin) {
    // Fallback or show a message, though redirect should handle it
    return (
      <View style={globalStyles.centered}>
        <Icon name="alert-circle-outline" size={60} color={colors.warning} />
        <Text style={[typography.h3, { marginTop: spacing.md, textAlign: 'center' }]}>
          Access Denied
        </Text>
        <Text style={[typography.body, { color: colors.muted, textAlign: 'center', marginTop: spacing.xs }]}>
          You do not have permission to view reports.
        </Text>
      </View>
    );
  }

  // Placeholder content for Reports
  return (
    <View style={globalStyles.container}>
      <Stack.Screen options={{ title: 'Reports' }} />
      <Text style={typography.h1}>Reports Dashboard</Text>
      <View style={styles.placeholderContainer}>
        <Icon name="chart-areaspline" size={80} color={colors.muted} />
        <Text style={styles.placeholderText}>
          Advanced reports and analytics will be available here.
        </Text>
        <Text style={styles.placeholderSubText}>
          (Feature under development)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  placeholderText: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  placeholderSubText: {
    ...typography.muted,
    textAlign: 'center',
  },
});
