// import React from 'react';
// import { Tabs, Redirect } from 'expo-router';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useAuth } from '@/context/AuthContext';
// import { colors } from '@/styles/globalStyles';

// export default function TabLayout() {
//   const { user } = useAuth();

//   if (!user) {
//     return <Redirect href="/(auth)/login" />;
//   }

//   const isAdmin = ['Chairman', 'Director'].includes(user.role);
//   const canManageUsers = isAdmin;

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: colors.primary,
//         tabBarInactiveTintColor: colors.muted,
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: colors.card,
//           borderTopColor: colors.border,
//         },
//       }}
//     >
//       {/* Dashboard - Only for Admins */}
//       {isAdmin && (
//         <Tabs.Screen
//           name="dashboard"
//           options={{
//             title: 'Dashboard',
//             tabBarIcon: ({ color, size, focused }) => (
//               <Icon 
//                 name={focused ? "view-dashboard" : "view-dashboard-outline"} 
//                 size={size} 
//                 color={color} 
//               />
//             ),
//           }}
//         />
//       )}

//       {/* Meetings - For everyone */}
//       <Tabs.Screen
//         name="meetings"
//         options={{
//           title: 'Meetings',
//           tabBarIcon: ({ color, size, focused }) => (
//             <Icon 
//               name={focused ? "calendar-clock" : "calendar-clock-outline"} 
//               size={size} 
//               color={color} 
//             />
//           ),
//         }}
//       />

//       {/* Documents - For everyone */}
//       <Tabs.Screen
//         name="documents"
//         options={{
//           title: 'Documents',
//           tabBarIcon: ({ color, size, focused }) => (
//             <Icon 
//               name={focused ? "file-document-multiple" : "file-document-multiple-outline"} 
//               size={size} 
//               color={color} 
//             />
//           ),
//         }}
//       />

//       {/* Users - Only for Admins */}
//       {canManageUsers && (
//         <Tabs.Screen
//           name="users"
//           options={{
//             title: 'Users',
//             tabBarIcon: ({ color, size, focused }) => (
//               <Icon 
//                 name={focused ? "account-group" : "account-group-outline"} 
//                 size={size} 
//                 color={color} 
//               />
//             ),
//           }}
//         />
//       )}

//       {/* Reports - Only for Admins */}
//       {isAdmin && (
//         <Tabs.Screen
//           name="reports"
//           options={{
//             title: 'Reports',
//             tabBarIcon: ({ color, size, focused }) => (
//               <Icon 
//                 name={focused ? "chart-bar" : "chart-bar"} 
//                 size={size} 
//                 color={color} 
//               />
//             ),
//           }}
//         />
//       )}

//       {/* Profile - For everyone */}
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color, size, focused }) => (
//             <Icon 
//               name={focused ? "account-circle" : "account-circle-outline"} 
//               size={size} 
//               color={color} 
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }



import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/styles/globalStyles';

// Define all possible tabs
const ALL_TABS = [
  { 
    name: 'dashboard', 
    title: 'Dashboard',
    icon: { active: "view-dashboard", inactive: "view-dashboard-outline" },
    roles: ['Chairman', 'Director']
  },
  { 
    name: 'meetings', 
    title: 'Meetings',
    icon: { active: "calendar-clock", inactive: "calendar-clock-outline" },
    roles: ['Chairman', 'Director', 'Delegate']
  },
  { 
    name: 'documents', 
    title: 'Documents',
    icon: { active: "file-document-multiple", inactive: "file-document-multiple-outline" },
    roles: ['Chairman', 'Director', 'Delegate']
  },
  { 
    name: 'users', 
    title: 'Users',
    icon: { active: "account-group", inactive: "account-group-outline" },
    roles: ['Chairman', 'Director']
  },
  { 
    name: 'reports', 
    title: 'Reports',
    icon: { active: "chart-bar", inactive: "chart-bar" },
    roles: ['Chairman', 'Director']
  },
  { 
    name: 'profile', 
    title: 'Profile',
    icon: { active: "account-circle", inactive: "account-circle-outline" },
    roles: ['Chairman', 'Director', 'Delegate']
  }
];

export default function TabLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      {ALL_TABS.map((tab) => {
        // Check if user has access to this tab
        const hasAccess = tab.roles.includes(user.role);
        
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, size, focused }) => (
                <Icon 
                  name={focused ? tab.icon.active : tab.icon.inactive} 
                  size={size} 
                  color={hasAccess ? color : 'transparent'} 
                />
              ),
              // This completely hides the tab if no access
              tabBarButton: hasAccess ? undefined : () => null,
            }}
          />
        );
      })}
    </Tabs>
  );
}