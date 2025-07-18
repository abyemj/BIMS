
// // import React from 'react';
// // import { Slot, SplashScreen } from 'expo-router';
// // import { AuthProvider, useProtectedRoute } from '@/context/AuthContext'; // Adjust path as needed
// // import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // import { SafeAreaProvider } from 'react-native-safe-area-context';

// // // Keep the splash screen visible until the DMs from the AI are ready to be sent to the client.
// // // SplashScreen.preventAutoHideAsync(); // It's often better to manage this within AuthProvider or a specific loading screen

// // function RootLayoutNav() {
// //   useProtectedRoute(); // Apply protected route logic globally

// //   return (
// //     <Slot />
// //   );
// // }

// // export default function RootLayout() {
// //   return (
// //     <GestureHandlerRootView style={{ flex: 1 }}>
// //       <SafeAreaProvider>
// //         <AuthProvider>
// //           <RootLayoutNav />
// //         </AuthProvider>
// //       </SafeAreaProvider>
// //     </GestureHandlerRootView>
// //   );
// // }



// import React, { useEffect, useState } from 'react';
// import { View, Image, Text, StyleSheet, Platform } from 'react-native';
// import { Slot, SplashScreen } from 'expo-router';
// import { AuthProvider, useProtectedRoute } from '@/context/AuthContext';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// // import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// // const queryClient = new QueryClient({
// //   defaultOptions: {
// //     queries: {
// //       staleTime: 5 * 60 * 1000, // 5 minutes cache
// //     },
// //   },
// // });

// SplashScreen.preventAutoHideAsync();

// function RootLayoutNav() {
//   useProtectedRoute();
//   return <Slot />;
// }

// export default function RootLayout() {
//   const [appIsReady, setAppIsReady] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Optional: Preload other assets here if needed
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         setAppIsReady(true);
//         await SplashScreen.hideAsync();
//       }
//     }

//     prepare();
//   }, []);

//   if (!appIsReady) {
//     return (
//       // <QueryClientProvider client={queryClient}>
//       <View style={styles.splashContainer}>
//         {!imageError ? (
//           <Image 
//             source={require('../assets/images/benuelogo2.png')} 
//             style={styles.splashImage}
//             onError={() => {
//               console.log("Failed to load splash image");
//               setImageError(true);
//             }}
//           />
//         ) : (
//           <Text style={styles.errorText}>App Logo</Text>
//         )}
//         <Text style={styles.splashText}>Benue Integrated Management System</Text>
//       </View>
//       // </QueryClientProvider>
//     );
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <SafeAreaProvider>
//         <AuthProvider>
//           <RootLayoutNav />
//         </AuthProvider>
//       </SafeAreaProvider>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   splashContainer: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   splashImage: {
//     width: 150,
//     height: 150,
//     resizeMode: 'contain',
//     marginBottom: 20,
//   },
//   splashText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 20,
//     textAlign: 'center',
//     color: '#000000', // Ensure text is visible
//   },
//   errorText: {
//     fontSize: 24,
//     color: 'red',
//     marginBottom: 20,
//   },
// });


import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider, useProtectedRoute} from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  useProtectedRoute();
  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}