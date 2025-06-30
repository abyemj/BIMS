
// // import React from 'react';
// // import { Redirect } from 'expo-router';
// // import { View, ActivityIndicator } from 'react-native';
// // import { useAuth } from '@/context/AuthContext';
// // import { globalStyles, colors } from '@/styles/globalStyles';

// // export default function Index() {
// //   const { user, loading } = useAuth();

// //   // The redirection logic is primarily handled by useProtectedRoute in _layout.tsx.
// //   // This screen acts as a loading/splash placeholder if needed or a final redirect point.

// //   if (loading) {
// //     return (
// //       <View style={globalStyles.centered}>
// //         <ActivityIndicator size="large" color={colors.primary} />
// //       </View>
// //     );
// //   }
// //   // If not loading, useProtectedRoute will have already handled redirection.
// //   // If for some reason it hasn't, and we land here:
// //   if (!user) {
// //      return <Redirect href="/(auth)/login" />;
// //   }
  
// //   // Determine redirect based on role if user exists (fallback, primarily handled in _layout)
// //   if (user.role === 'Chairman' || user.role === 'Director') {
// //     return <Redirect href="/(tabs)/dashboard" />;
// //   }
// //   return <Redirect href="/(tabs)/meetings" />;
// // }



// import React from 'react';
// import { Redirect } from 'expo-router';
// import { View, ActivityIndicator } from 'react-native';
// import { useAuth } from '@/context/AuthContext';
// import { globalStyles, colors } from '@/styles/globalStyles';
// import CustomSplashScreen from '@/components/splash/CustomSplashScreen'; // Import custom splash
// import 'react-native-url-polyfill/auto';

// export default function Index() {
//   const { user, loading } = useAuth();

//   // if (loading) {
//   //   // Show the custom splash screen component while initial auth check is loading
//   //   return <CustomSplashScreen />;
//   // }
  
//   // If not loading, useProtectedRoute in _layout.tsx will handle redirection.
//   // This section acts as a fallback if needed.
//   if (!user) {
//      return <Redirect href="/(auth)/login" />;
//   }
  
//   // Determine redirect based on role if user exists
//   if (user.role === 'Chairman' || user.role === 'Director') {
//     return <Redirect href="/(tabs)/dashboard" />;
//   }
//   return <Redirect href="/(tabs)/meetings" />;
// }

// import React, { useEffect, useState } from 'react';
// import { Redirect } from 'expo-router';
// import { useAuth } from '@/context/AuthContext';
// import CustomSplashScreen from '@/components/splash/CustomSplashScreen';
// import * as SplashScreen from 'expo-splash-screen';

// // Prevent native splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync();

// export default function Index() {
//   const { user, loading } = useAuth();
//   const [appReady, setAppReady] = useState(false);

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Add any additional async tasks here
//         await new Promise(resolve => setTimeout(resolve, 2000)); // Optional minimum splash time
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         setAppReady(true);
//         await SplashScreen.hideAsync();
//       }
//     }

//     prepare();
//   }, []);

//   if (!appReady || loading) {
//     return <CustomSplashScreen />;
//   }

//   if (!user) {
//     return <Redirect href="/(auth)/login" />;
//   }

//   return user.role === 'Chairman' || user.role === 'Director' 
//     ? <Redirect href="/(tabs)/dashboard" /> 
//     : <Redirect href="/(tabs)/meetings" />;
// }


import React, { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import CustomSplashScreen from '@/components/splash/CustomSplashScreen';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, loading } = useAuth();
  const [splashComplete, setSplashComplete] = useState(false);

  // Combine splash and auth loading states
  const showSplash = !splashComplete || loading;

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (showSplash) {
    return <CustomSplashScreen onAnimationComplete={() => setSplashComplete(true)} />;
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  
  return user.role === 'Chairman' || user.role === 'Director' 
    ? <Redirect href="/(tabs)/dashboard" /> 
    : <Redirect href="/(tabs)/meetings" />;
}