
import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { globalStyles, typography, colors, spacing } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Icon name="alert-circle-outline" size={80} color={colors.destructive} style={styles.icon} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>Sorry, the page you are looking for does not exist or has been moved.</Text>
        <Link href="/(tabs)/dashboard" style={styles.link}>
          <Text style={styles.linkText}>Go to Home Screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.centered,
    padding: spacing.lg,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  linkText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
});
