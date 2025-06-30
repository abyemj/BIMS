
// import React from 'react';
// import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
// import { colors, typography, spacing } from '@/styles/globalStyles';

// const CustomSplashScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Image
//         // Ensure you have an image at this path, or replace with a valid source
//         // For example, if your splash image is in 'react-native-prototype/assets/splash.png'
//         source={require('../../../assets/images/benuelogo2.png')}
//         style={styles.logo}
//         resizeMode="contain"
//       />
//       <Text style={styles.title}>Benue Integrated Management System</Text>
//       <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.background, // Or your preferred splash background
//   },
//   logo: {
//     width: 120, // Adjusted to be "small"
//     height: 120, // Adjusted to be "small"
//     marginBottom: spacing.lg,
//   },
//   title: {
//     ...typography.h3, // Using h3 for a slightly smaller title than h2
//     color: colors.primary, // Or colors.text
//     textAlign: 'center',
//     paddingHorizontal: spacing.md,
//     marginBottom: spacing.xl,
//   },
//   loader: {
//     marginTop: spacing.md,
//   },
// });

// export default CustomSplashScreen;



// import React, { useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { colors, typography, spacing } from '@/styles/globalStyles';

// const CustomSplashScreen = () => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;

//   useEffect(() => {
//     // Parallel animations
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1500,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(scaleAnim, {
//             toValue: 1.05,
//             duration: 1000,
//             easing: Easing.inOut(Easing.ease),
//             useNativeDriver: true,
//           }),
//           Animated.timing(scaleAnim, {
//             toValue: 1,
//             duration: 1000,
//             easing: Easing.inOut(Easing.ease),
//             useNativeDriver: true,
//           }),
//         ])
//       ),
//     ]).start();
//   }, []);

//   return (
//     <LinearGradient
//       colors={['#1a237e', '#303f9f', '#7986cb']}
//       style={styles.container}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//     >
//       <Animated.View
//         style={[
//           styles.content,
//           {
//             opacity: fadeAnim,
//             transform: [{ scale: scaleAnim }],
//           },
//         ]}
//       >
//         <Text style={styles.title}>Benue</Text>
//         <Text style={styles.subtitle}>Integrated Management System</Text>
        
//         {/* Subtle animated dots */}
//         <View style={styles.dotsContainer}>
//           {[...Array(3)].map((_, i) => (
//             <Animated.View
//               key={i}
//               style={[
//                 styles.dot,
//                 {
//                   opacity: fadeAnim.interpolate({
//                     inputRange: [0, 0.5, 1],
//                     outputRange: [0, 0.3, 1],
//                   }),
//                   transform: [
//                     {
//                       translateY: fadeAnim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [10, 0],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             />
//           ))}
//         </View>
//       </Animated.View>
//     </LinearGradient>
//   );
// };



// import React, { useEffect, useState,useRef } from 'react';
// import { View, Text, StyleSheet, Animated } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { colors, typography, spacing } from '@/styles/globalStyles';

// const MIN_SPLASH_DURATION = 3000; // 3 seconds minimum

// const CustomSplashScreen = ({ onAnimationComplete }) => {
//   const [showSplash, setShowSplash] = useState(true);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Start fade-in animation
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start();

//     // Set minimum display time
//     const timer = setTimeout(() => {
//       setShowSplash(false);
//       onAnimationComplete?.();
//     }, MIN_SPLASH_DURATION);

//     return () => clearTimeout(timer);
//   }, []);

//   if (!showSplash) return null;

//   return (
//     <LinearGradient
//       colors={['#1a237e', '#303f9f']}
//       style={[StyleSheet.absoluteFill, styles.container]}
//     >
//       <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
//         <Text style={styles.title}>Benue</Text>
//         <Text style={styles.subtitle}>Benue Integrated Management System</Text>
//       </Animated.View>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     alignItems: 'center',
//   },
//   title: {
//     ...typography.h1,
//     fontSize: 42,
//     color: 'white',
//     fontWeight: '700',
//     letterSpacing: 1.5,
//     textShadowColor: 'rgba(0,0,0,0.2)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 5,
//     marginBottom: spacing.xs,
//   },
//   subtitle: {
//     ...typography.h3,
//     fontSize: 18,
//     color: 'rgba(255,255,255,0.9)',
//     letterSpacing: 4,
//     textTransform: 'uppercase',
//     marginBottom: spacing.xxl,
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     marginTop: spacing.md,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     marginHorizontal: 5,
//   },
// });

// export default CustomSplashScreen;


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
        <Text style={styles.title}>
          Benue Integrated {'\n'}Management System
        </Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: footerAnim }]}>
        {/* <Image
          source={require('../../../assets/images/bdic-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        /> */}
        <Text style={styles.footerText}>Powered by BDIC</Text>
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
  logo: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});

export default CustomSplashScreen;