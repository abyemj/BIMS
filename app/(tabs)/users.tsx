
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
// import { useAuth } from '@/context/AuthContext'; // Adjust path
// import type { User } from '@/types'; // Adjust path
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles'; // Adjust path
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Stack, Redirect } from 'expo-router';

// const fetchUsers = async (): Promise<User[]> => {
//     await new Promise(resolve => setTimeout(resolve, 1200));
//     return [
//         { id: 'user1', fullName: 'Alice Wonderland', role: 'Chairman', portfolio: 'State Governor', email: 'chairman@gov.ng', status: 'Active' },
//         { id: 'user2', fullName: 'Bob The Builder', role: 'Director', portfolio: 'Ministry of Works', email: 'director.works@gov.ng', status: 'Active' },
//         { id: 'user3', fullName: 'Charlie Chaplin', role: 'Delegate', portfolio: 'Department of Finance', email: 'delegate.finance@gov.ng', status: 'Active' },
//     ];
// };

// export default function UsersScreen() {
//   const { user: currentUser } = useAuth();
//   const [users, setUsers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const canManageUsers = currentUser && ['Chairman', 'Director'].includes(currentUser.role);
//   const isDirector = currentUser?.role === 'Director';

//    const loadUsers = useCallback(async () => {
//     if (!canManageUsers) {
//         setIsLoading(false); return;
//     };
//     setIsLoading(true); setError(null);
//     try {
//       const fetchedUsers = await fetchUsers();
//       setUsers(fetchedUsers);
//     } catch (err) {
//       setError("Could not load users.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [canManageUsers]);

//   useEffect(() => { loadUsers(); }, [loadUsers]);

//   if (!canManageUsers && currentUser) { // If user loaded but not authorized
//     return <Redirect href="/(tabs)/dashboard" />; // Or meetings for delegates
//   }
//   if (!currentUser) { // Should be handled by root layout, but as a fallback
//     return <Redirect href="/(auth)/login" />;
//   }


//   const handleActionPress = (userToAction: User, action: 'Edit' | 'ToggleStatus' | 'Delete') => {
//       if (!isDirector) { Alert.alert('Permission Denied', 'Only Directors can manage users.'); return; }
//       if(action === 'Delete' && userToAction.id === currentUser?.id){ Alert.alert('Action Denied', 'You cannot delete your own account.'); return; }

//       if (action === 'ToggleStatus') {
//           setUsers(prevUsers => prevUsers.map(u => u.id === userToAction.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u ));
//       } else if (action === 'Delete') {
//            Alert.alert('Confirm Delete', `Delete ${userToAction.fullName}?`, [{ text: 'Cancel'}, { text: 'Delete', onPress: () => setUsers(prevUsers => prevUsers.filter(u => u.id !== userToAction.id))}]);
//            return;
//       }
//      Alert.alert('Action', `${action} user: ${userToAction.fullName}`);
//   };

//   const getStatusBadge = (status: User['status']) => {
//         let style = [globalStyles.badge]; let textStyle = [globalStyles.badgeText];
//         switch (status) {
//             case 'Active': style.push(globalStyles.badgeDefault); textStyle.push(globalStyles.badgeDefaultText); break;
//             case 'Inactive': style.push(globalStyles.badgeOutline); textStyle.push(globalStyles.badgeOutlineText); break;
//         }
//         return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
//     };

//   const renderUserItem = ({ item }: { item: User }) => (
//       <View style={globalStyles.card}>
//           <View style={styles.itemHeader}>
//             <Text style={styles.itemTitle}>{item.fullName}</Text>{getStatusBadge(item.status)}
//           </View>
//            <Text style={styles.itemDetail}><Icon name="briefcase-outline" size={14} color={colors.muted} /> {item.portfolio} ({item.role})</Text>
//            <Text style={styles.itemDetail}><Icon name="email-outline" size={14} color={colors.muted} /> {item.email}</Text>
//           {isDirector && (
//              <View style={styles.actionsContainer}>
//                 <TouchableOpacity onPress={() => handleActionPress(item, 'Edit')} style={styles.actionButton}>
//                     <Icon name="pencil-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Edit</Text>
//                 </TouchableOpacity>
//                  <TouchableOpacity onPress={() => handleActionPress(item, 'ToggleStatus')} style={styles.actionButton}>
//                     <Icon name={item.status === 'Active' ? 'account-cancel-outline' : 'account-check-outline'} size={18} color={item.status === 'Active' ? colors.warning : colors.success} />
//                     <Text style={[styles.actionText, {color: item.status === 'Active' ? colors.warning : colors.success}]}>{item.status === 'Active' ? 'Deactivate' : 'Activate'}</Text>
//                 </TouchableOpacity>
//                  <TouchableOpacity onPress={() => handleActionPress(item, 'Delete')} style={[styles.actionButton, item.id === currentUser?.id && styles.disabledButton ]} disabled={item.id === currentUser?.id}>
//                     <Icon name="trash-can-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>Delete</Text>
//                 </TouchableOpacity>
//              </View>
//           )}
//       </View>
//     );

//    if (!canManageUsers) {
//      return (
//        <View style={globalStyles.centered}>
//          <Icon name="account-lock-outline" size={60} color={colors.muted} />
//          <Text style={[typography.h3, {marginTop: spacing.md}]}>Access Denied</Text>
//        </View>
//      );
//    }

//   return (
//     <View style={globalStyles.container}>
//       <Stack.Screen options={{ title: 'User Management' }} />
//       <Text style={typography.h1}>User Management</Text>
//        {isDirector && (
//             <TouchableOpacity style={[globalStyles.button, styles.addButton]} onPress={() => Alert.alert('Add User', 'Open Add User Modal/Screen')} >
//                 <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}} /><Text style={globalStyles.buttonText}>Add User</Text>
//             </TouchableOpacity>
//        )}
//       {isLoading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
//       : error ? <Text style={styles.errorText}>{error}</Text>
//       : users.length === 0 ? (
//            <View style={styles.emptyContainer}>
//               <Icon name="account-group-outline" size={60} color={colors.muted} />
//               <Text style={typography.h3}>No Users Found</Text>
//            </View>
//       ) : (
//         <FlatList data={users} renderItem={renderUserItem} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingBottom: spacing.md }} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
//   itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm },
//   itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
//   actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
//   actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
//   actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
//   disabledButton: { opacity: 0.5 },
//   addButton: { marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
//   errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
// });



// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ViewStyle, TextStyle } from 'react-native';
// import { useAuth } from '@/context/AuthContext';
// import type { User } from '@/types';
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Stack, Redirect } from 'expo-router';
// import { appwriteUsers } from '@/lib/appwrite'; // For user creation potentially

// export default function UsersScreen() {
//   const { user: currentUser, fetchUsers: fetchUsersFromContext, loading: authLoading } = useAuth();
//   const [users, setUsers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const canManageUsers = currentUser && ['Chairman', 'Director'].includes(currentUser.role);
//   const isDirector = currentUser?.role === 'Director';

//    const loadUsers = useCallback(async () => {
//     if (!canManageUsers) {
//         setIsLoading(false); return;
//     };
//     setIsLoading(true); setError(null);
//     try {
//       const fetchedUsers = await fetchUsersFromContext();
//       setUsers(fetchedUsers);
//     } catch (err: any) {
//       setError(err.message || "Could not load users.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [canManageUsers, fetchUsersFromContext]);

//   useEffect(() => {
//     if (!authLoading && currentUser) {
//         if (canManageUsers) {
//             loadUsers();
//         } else {
//             setIsLoading(false); // Not authorized, stop loading
//         }
//     } else if (!authLoading && !currentUser) {
//         setIsLoading(false); // No user, redirect will handle
//     }
//   }, [authLoading, currentUser, canManageUsers, loadUsers]);

//   if (authLoading || (!currentUser && isLoading)) { // Show loader if auth is loading or initial user fetch is happening
//     return <View style={globalStyles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
//   }

//   if (!currentUser) { // Should be handled by root layout, but as a fallback
//     return <Redirect href="/(auth)/login" />;
//   }

//   if (!canManageUsers) {
//     return ( // Show access denied if user is loaded but not authorized
//        <View style={globalStyles.centered}>
//          <Icon name="account-lock-outline" size={60} color={colors.muted} />
//          <Text style={[typography.h3, {marginTop: spacing.md}]}>Access Denied</Text>
//          <Text style={typography.muted}>You do not have permission to manage users.</Text>
//        </View>
//      );
//   }


//   const handleAddUser = () => {
//     // TODO: Implement a proper modal for adding users, similar to the web version.
//     // This modal would collect fullName, email, password, role, portfolio.
//     // For now, this is a placeholder.
//     Alert.prompt(
//         "Add New User (Prototype)",
//         "Enter email for new user (password will be 'password123', role 'Delegate', status 'Active' for now):",
//         async (email) => {
//             if (email && isDirector && currentUser) {
//                 try {
//                     const newUser = await appwriteUsers.create('unique()', email, undefined, 'password123', 'New User (Edit Me)');
//                     await appwriteUsers.updatePrefs(newUser.$id, {
//                         role: 'Delegate',
//                         portfolio: 'Default Portfolio (Edit Me)',
//                         status: 'Active',
//                     });
//                     Alert.alert('User Created (Simulated)', `User ${email} created. Please refresh to see them or edit details.`);
//                     loadUsers(); // Refresh list
//                 } catch (e: any) {
//                     Alert.alert('Error', `Could not create user: ${e.message}`);
//                 }
//             }
//         }
//     );
//   };

//   const handleToggleStatus = async (userToAction: User) => {
//       if (!isDirector) { Alert.alert('Permission Denied', 'Only Directors can manage users.'); return; }
//       if(userToAction.id === currentUser?.id && userToAction.status === 'Active'){ Alert.alert('Action Denied', 'You cannot deactivate your own account.'); return; }

//       const newStatus = userToAction.status === 'Active' ? 'Inactive' : 'Active';
//       try {
//         // SIMULATED: Updating other users' prefs (like status) securely requires an Appwrite Function.
//         await appwriteUsers.updatePrefs(userToAction.id, { ...userToAction.prefs, status: newStatus });
//         setUsers(prevUsers => prevUsers.map(u => u.id === userToAction.id ? { ...u, status: newStatus, prefs: {...u.prefs, status: newStatus} } : u ));
//         Alert.alert('Status Updated', `${userToAction.fullName}'s status changed to ${newStatus}.`);
//       } catch (e: any) {
//         Alert.alert('Error', `Failed to update status: ${e.message}`);
//       }
//   };

//   const handleDeleteUser = (userToAction: User) => {
//       if (!isDirector) { Alert.alert('Permission Denied', 'Only Directors can manage users.'); return; }
//       if(userToAction.id === currentUser?.id){ Alert.alert('Action Denied', 'You cannot delete your own account.'); return; }
      
//       Alert.alert('Confirm Delete', `Are you sure you want to delete ${userToAction.fullName}? This action cannot be undone.`, [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Delete', style: 'destructive', onPress: async () => {
//               try {
//                 // SIMULATED: Deleting other users securely requires an Appwrite Function or Admin API key.
//                 // await appwriteUsers.delete(userToAction.id);
//                 setUsers(prevUsers => prevUsers.filter(u => u.id !== userToAction.id));
//                 Alert.alert('User Deleted (Simulated)', `${userToAction.fullName} has been removed.`);
//               } catch (e: any) {
//                 Alert.alert('Error', `Failed to delete user: ${e.message}`);
//               }
//           }}
//       ]);
//   };

//   const handleEditUser = (userToEdit: User) => {
//     if (!isDirector) { Alert.alert('Permission Denied', 'Only Directors can edit users.'); return; }
//     // TODO: Implement a proper modal for editing users.
//     Alert.alert('Edit User (Prototype)', `Implement edit modal for ${userToEdit.fullName}`);
//   };


//   const getStatusBadge = (status: User['status']) => {
//         let style: ViewStyle[] = [globalStyles.badge];
//         let textStyle: TextStyle[] = [globalStyles.badgeText];
//         switch (status) {
//             case 'Active': style.push(globalStyles.badgeDefault as ViewStyle); textStyle.push(globalStyles.badgeDefaultText as TextStyle); break;
//             case 'Inactive': style.push(globalStyles.badgeOutline as ViewStyle); textStyle.push(globalStyles.badgeOutlineText as TextStyle); break;
//         }
//         return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
//     };

//   const renderUserItem = ({ item }: { item: User }) => (
//       <View style={globalStyles.card}>
//           <View style={styles.itemHeader}>
//             <Text style={styles.itemTitle}>{item.fullName}</Text>{getStatusBadge(item.status)}
//           </View>
//            <Text style={styles.itemDetail}><Icon name="briefcase-outline" size={14} color={colors.muted} /> {item.portfolio} ({item.role})</Text>
//            <Text style={styles.itemDetail}><Icon name="email-outline" size={14} color={colors.muted} /> {item.email}</Text>
//           {isDirector && (
//              <View style={styles.actionsContainer}>
//                 <TouchableOpacity onPress={() => handleEditUser(item)} style={styles.actionButton}>
//                     <Icon name="pencil-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Edit</Text>
//                 </TouchableOpacity>
//                  <TouchableOpacity onPress={() => handleToggleStatus(item)} style={styles.actionButton}>
//                     <Icon name={item.status === 'Active' ? 'account-cancel-outline' : 'account-check-outline'} size={18} color={item.status === 'Active' ? colors.warning : colors.success} />
//                     <Text style={[styles.actionText, {color: item.status === 'Active' ? colors.warning : colors.success}]}>{item.status === 'Active' ? 'Deactivate' : 'Activate'}</Text>
//                 </TouchableOpacity>
//                  <TouchableOpacity onPress={() => handleDeleteUser(item)} style={[styles.actionButton, item.id === currentUser?.id && styles.disabledButton ]} disabled={item.id === currentUser?.id}>
//                     <Icon name="trash-can-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>Delete</Text>
//                 </TouchableOpacity>
//              </View>
//           )}
//       </View>
//     );


//   return (
//     <View style={globalStyles.container}>
//       <Stack.Screen options={{ title: 'User Management' }} />
//       <Text style={typography.h1}>User Management</Text>
//        {isDirector && (
//             <TouchableOpacity style={[globalStyles.button, styles.addButton]} onPress={handleAddUser} >
//                 <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}} /><Text style={globalStyles.buttonText}>Add User</Text>
//             </TouchableOpacity>
//        )}
//       {isLoading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
//       : error ? <Text style={styles.errorText}>{error}</Text>
//       : users.length === 0 ? (
//            <View style={styles.emptyContainer}>
//               <Icon name="account-group-outline" size={60} color={colors.muted} />
//               <Text style={typography.h3}>No Users Found</Text>
//               {isDirector && <Text style={typography.muted}>Click "Add User" to create one.</Text>}
//            </View>
//       ) : (
//         <FlatList data={users} renderItem={renderUserItem} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingBottom: spacing.md }} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
//   itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm },
//   itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
//   actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
//   actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
//   actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
//   disabledButton: { opacity: 0.5 },
//   addButton: { marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
//   errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
// });

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, Redirect } from 'expo-router';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import type { User } from '@/types';

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser && ['Chairman', 'Director'].includes(currentUser.role);
  const isDirector = currentUser?.role === 'Director';

  const fetchUsers = useCallback(async (): Promise<User[]> => {
    if (!currentUser?.tenant) return [];
    
    try {
      const response = await databases.listDocuments(
        '6848228c00222dfaf82e',
        '68597845003de1b5dcc0',
        [
          Query.equal('tenant', currentUser.tenant),
          Query.equal('status', 'Active')
        ]
      );

      return response.documents.map(doc => ({
        id: doc.$id,
        authId: doc.authId || doc.$id,
        fullName: doc.name,
        email: doc.email,
        phone: doc.phone,
        role: doc.role,
        portfolio: doc.portfolio,
        status: doc.status,
        avatarUrl: doc.avatarUrl || '',
        tenant: doc.tenant
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }, [currentUser?.tenant]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isAdmin) {
    return (
      <View style={globalStyles.centered}>
        <Icon name="account-lock-outline" size={60} color={colors.muted} />
        <Text style={[typography.h3, { marginTop: spacing.md }]}>
          Access Denied
        </Text>
        <Text style={typography.muted}>
          You don't have permission to manage users.
        </Text>
      </View>
    );
  }

  const handleToggleStatus = async (user: User) => {
    if (!isDirector) {
      Alert.alert('Permission Denied', 'Only Directors can manage users.');
      return;
    }

    if (user.id === currentUser.id) {
      Alert.alert('Action Denied', 'You cannot modify your own status.');
      return;
    }

    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
    try {
      await databases.updateDocument(
        '6848228c00222dfaf82e',
        '68597845003de1b5dcc0',
        user.id,
        { status: newStatus }
      );

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
      console.error('Status update error:', error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!isDirector) {
      Alert.alert('Permission Denied', 'Only Directors can delete users.');
      return;
    }

    if (user.id === currentUser.id) {
      Alert.alert('Action Denied', 'You cannot delete your own account.');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Delete ${user.fullName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databases.deleteDocument(
                '6848228c00222dfaf82e',
                '68597845003de1b5dcc0',
                user.id
              );
              setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
              console.error('Delete error:', error);
            }
          }
        }
      ]
    );
  };

  const getStatusBadge = (status: User['status']) => {
    const isActive = status === 'Active';
    return (
      <View style={[
        globalStyles.badge,
        isActive ? globalStyles.badgeDefault : globalStyles.badgeOutline
      ]}>
        <Text style={[
          globalStyles.badgeText,
          isActive ? globalStyles.badgeDefaultText : globalStyles.badgeOutlineText
        ]}>
          {status}
        </Text>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={globalStyles.card}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.fullName}</Text>
        {getStatusBadge(item.status)}
      </View>
      <Text style={styles.itemDetail}>
        <Icon name="briefcase-outline" size={14} color={colors.muted} /> 
        {item.portfolio} ({item.role})
      </Text>
      <Text style={styles.itemDetail}>
        <Icon name="email-outline" size={14} color={colors.muted} /> 
        {item.email}
      </Text>
      <Text style={styles.itemDetail}>
        <Icon name="phone-outline" size={14} color={colors.muted} /> 
        {item.phone || 'Not provided'}
      </Text>

      {isDirector && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            onPress={() => handleToggleStatus(item)} 
            style={styles.actionButton}
          >
            <Icon 
              name={item.status === 'Active' ? 'account-cancel-outline' : 'account-check-outline'} 
              size={18} 
              color={item.status === 'Active' ? colors.warning : colors.success} 
            />
            <Text style={[
              styles.actionText,
              { color: item.status === 'Active' ? colors.warning : colors.success }
            ]}>
              {item.status === 'Active' ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleDeleteUser(item)} 
            style={styles.actionButton}
            disabled={item.id === currentUser.id}
          >
            <Icon name="trash-can-outline" size={18} color={colors.destructive} />
            <Text style={[styles.actionText, { color: colors.destructive }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Stack.Screen options={{ title: 'User Management' }} />
      
      <View style={styles.headerContainer}>
        <Text style={typography.h1}>User Management</Text>
        {isDirector && (
          <TouchableOpacity 
            style={[globalStyles.button, styles.addButton]} 
            onPress={() => Alert.alert('Coming Soon', 'User creation will be implemented soon')}
          >
            <Icon 
              name="plus-circle-outline" 
              size={20} 
              color={colors.white} 
              style={{ marginRight: spacing.sm }} 
            />
            <Text style={globalStyles.buttonText}>Add User</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-group-outline" size={60} color={colors.muted} />
          <Text style={typography.h3}>No Users Found</Text>
          {isDirector && (
            <Text style={typography.muted}>Click "Add User" to create one</Text>
          )}
        </View>
      ) : (
        <FlatList 
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.md }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: spacing.md,
  },
  itemHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: spacing.sm 
  },
  itemTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    flexShrink: 1, 
    marginRight: spacing.sm 
  },
  itemDetail: { 
    fontSize: 14, 
    color: colors.muted, 
    marginBottom: spacing.xs, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  actionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    gap: spacing.md, 
    marginTop: spacing.sm, 
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: colors.border, 
    paddingTop: spacing.sm 
  },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: spacing.xs 
  },
  actionText: { 
    marginLeft: spacing.xs, 
    fontWeight: '500' 
  },
  addButton: { 
    marginTop: spacing.md,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: spacing.lg, 
    marginTop: 50 
  },
  errorText: { 
    color: colors.destructive, 
    textAlign: 'center', 
    marginTop: 20 
  },
});