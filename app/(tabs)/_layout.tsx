
import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/context/AuthContext'; // Adjust path
import { colors } from '@/styles/globalStyles'; // Adjust path

export default function TabLayout() {
  const { user } = useAuth();

  if (!user) {
    // This should ideally be handled by the root layout's useProtectedRoute,
    // but as a fallback.
    return <Redirect href="/(auth)/login" />;
  }

  const canManageUsers = user && ['Chairman', 'Director'].includes(user.role);
  const isAdmin = user && ['Chairman', 'Director'].includes(user.role);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false, // Using Stack.Screen options in individual screens if needed
        tabBarStyle: {
          backgroundColor: colors.card, // Or colors.background
          borderTopColor: colors.border,
        },
      }}>
      {isAdmin ? (
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size, focused }) => (
              <Icon name={focused ? "view-dashboard" : "view-dashboard-outline"} size={size} color={color} />
            ),
          }}
        />
      ) : (
        // If not admin, redirect from a potential dashboard tab or don't render it.
        // For simplicity, we ensure non-admins start at 'meetings'.
        // If a non-admin somehow lands on a route that would imply dashboard,
        // they should be redirected by the dashboard screen itself or this layout.
        // Expo Router handles initial route based on file structure.
        // We hide this tab for non-admins by not rendering it.
        null
      )}

      <Tabs.Screen
        name="meetings"
        options={{
          title: 'Meetings',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? "calendar-clock" : "calendar-clock-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? "file-document-multiple" : "file-document-multiple-outline"} size={size} color={color} />
          ),
        }}
      />
      {canManageUsers && (
        <Tabs.Screen
          name="users"
          options={{
            title: 'Users',
            tabBarIcon: ({ color, size, focused }) => (
              <Icon name={focused ? "account-group" : "account-group-outline"} size={size} color={color} />
            ),
          }}
        />
      )}
       {isAdmin && (
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color, size, focused }) => (
              <Icon name={focused ? "chart-bar" : "chart-bar"} size={size} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? "account-circle" : "account-circle-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
