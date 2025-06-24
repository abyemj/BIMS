
// import React from 'react';
// import { Redirect } from 'expo-router';
// import { View, ActivityIndicator } from 'react-native';
// import { useAuth } from '@/context/AuthContext';
// import { globalStyles, colors } from '@/styles/globalStyles';

// export default function Index() {
//   const { user, loading } = useAuth();

//   // The redirection logic is primarily handled by useProtectedRoute in _layout.tsx.
//   // This screen acts as a loading/splash placeholder if needed or a final redirect point.

//   if (loading) {
//     return (
//       <View style={globalStyles.centered}>
//         <ActivityIndicator size="large" color={colors.primary} />
//       </View>
//     );
//   }
//   // If not loading, useProtectedRoute will have already handled redirection.
//   // If for some reason it hasn't, and we land here:
//   if (!user) {
//      return <Redirect href="/(auth)/login" />;
//   }
  
//   // Determine redirect based on role if user exists (fallback, primarily handled in _layout)
//   if (user.role === 'Chairman' || user.role === 'Director') {
//     return <Redirect href="/(tabs)/dashboard" />;
//   }
//   return <Redirect href="/(tabs)/meetings" />;
// }



import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors } from '@/styles/globalStyles';
import CustomSplashScreen from '@/components/splash/CustomSplashScreen'; // Import custom splash
import 'react-native-url-polyfill/auto';

export default function Index() {
  const { user, loading } = useAuth();

  // if (loading) {
  //   // Show the custom splash screen component while initial auth check is loading
  //   return <CustomSplashScreen />;
  // }
  
  // If not loading, useProtectedRoute in _layout.tsx will handle redirection.
  // This section acts as a fallback if needed.
  if (!user) {
     return <Redirect href="/(auth)/login" />;
  }
  
  // Determine redirect based on role if user exists
  if (user.role === 'Chairman' || user.role === 'Director') {
    return <Redirect href="/(tabs)/dashboard" />;
  }
  return <Redirect href="/(tabs)/meetings" />;
}

