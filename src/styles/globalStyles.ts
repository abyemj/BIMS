
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#0D47A1', // Darker Blue
  secondary: '#E3F2FD', // Lighter Blue
  background: '#F5F5F5', // Off-white background
  card: '#FFFFFF', // White cards
  text: '#212121', // Dark Gray text
  muted: '#757575', // Medium Gray for muted text
  destructive: '#D32F2F', // Red for destructive actions
  border: '#E0E0E0', // Light Gray Border
  success: '#388E3C', // Green for success
  warning: '#FBC02D', // Yellow/Orange for warning
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600', // Semi-bold for h3
    color: colors.text,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24, // Improved readability
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
  caption: {
    fontSize: 12,
    color: colors.muted,
  }
});

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12, // More rounded corners
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  input: {
    height: 50, // Taller input fields
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md, // More padding
    marginBottom: spacing.md, // Increased margin
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14, // Taller buttons
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
   buttonOutline: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1.5, // Slightly thicker border
  },
  buttonOutlineText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  buttonDestructive: {
     backgroundColor: colors.destructive,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Badge styles
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12, // Pill-shaped badges
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeDefault: { backgroundColor: colors.primary },
  badgeDefaultText: { color: colors.white },
  badgeOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.muted },
  badgeOutlineText: { color: colors.muted },
  badgeDestructive: { backgroundColor: colors.destructive },
  badgeDestructiveText: { color: colors.white },
  badgeSecondary: { backgroundColor: colors.secondary },
  badgeSecondaryText: { color: colors.primary }, // Primary text on secondary badge for contrast
  badgeSuccess: { backgroundColor: colors.success},
  badgeSuccessText: { color: colors.white},
  badgeWarning: { backgroundColor: colors.warning},
  badgeWarningText: { color: colors.black}, // Black text for better readability on yellow
});

// Ensure your types/index.ts has these interfaces
// export interface User { ... }
// export interface Meeting { ... }
// export interface DocumentItem { ... }
