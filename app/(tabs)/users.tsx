
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
// import { useAuth } from '@/context/AuthContext';
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Stack, Redirect } from 'expo-router';
// import { databases } from '@/lib/appwrite';
// import { Query } from 'appwrite';
// import type { User } from '@/types';

// export default function UsersScreen() {
//   const { user: currentUser } = useAuth();
//   const [users, setUsers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const isAdmin = currentUser && ['Chairman', 'Director'].includes(currentUser.role);
//   const isDirector = currentUser?.role === 'Director';

//   const fetchUsers = useCallback(async (): Promise<User[]> => {
//     if (!currentUser?.tenant) return [];
    
//     try {
//       const response = await databases.listDocuments(
//         '6848228c00222dfaf82e',
//         '68597845003de1b5dcc0',
//         [
//           Query.equal('tenant', currentUser.tenant),
//           Query.equal('status', 'Active')
//         ]
//       );

//       return response.documents.map(doc => ({
//         id: doc.$id,
//         authId: doc.authId || doc.$id,
//         fullName: doc.name,
//         email: doc.email,
//         phone: doc.phone,
//         role: doc.role,
//         portfolio: doc.portfolio,
//         status: doc.status,
//         avatarUrl: doc.avatarUrl || '',
//         tenant: doc.tenant
//       }));
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       throw error;
//     }
//   }, [currentUser?.tenant]);

//   const loadUsers = useCallback(async () => {
//     if (!isAdmin) {
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const fetchedUsers = await fetchUsers();
//       setUsers(fetchedUsers);
//     } catch (err) {
//       setError('Failed to load users. Please try again.');
//       console.error('Error loading users:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isAdmin, fetchUsers]);

//   useEffect(() => {
//     loadUsers();
//   }, [loadUsers]);

//   if (!currentUser) {
//     return <Redirect href="/(auth)/login" />;
//   }

//   if (!isAdmin) {
//     return (
//       <View style={globalStyles.centered}>
//         <Icon name="account-lock-outline" size={60} color={colors.muted} />
//         <Text style={[typography.h3, { marginTop: spacing.md }]}>
//           Access Denied
//         </Text>
//         <Text style={typography.muted}>
//           You don't have permission to manage users.
//         </Text>
//       </View>
//     );
//   }

//   const handleToggleStatus = async (user: User) => {
//     if (!isDirector) {
//       Alert.alert('Permission Denied', 'Only Directors can manage users.');
//       return;
//     }

//     if (user.id === currentUser.id) {
//       Alert.alert('Action Denied', 'You cannot modify your own status.');
//       return;
//     }

//     const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
//     try {
//       await databases.updateDocument(
//         '6848228c00222dfaf82e',
//         '68597845003de1b5dcc0',
//         user.id,
//         { status: newStatus }
//       );

//       setUsers(prevUsers => 
//         prevUsers.map(u => 
//           u.id === user.id ? { ...u, status: newStatus } : u
//         )
//       );
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update user status');
//       console.error('Status update error:', error);
//     }
//   };

//   const handleDeleteUser = async (user: User) => {
//     if (!isDirector) {
//       Alert.alert('Permission Denied', 'Only Directors can delete users.');
//       return;
//     }

//     if (user.id === currentUser.id) {
//       Alert.alert('Action Denied', 'You cannot delete your own account.');
//       return;
//     }

//     Alert.alert(
//       'Confirm Delete',
//       `Delete ${user.fullName}? This cannot be undone.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await databases.deleteDocument(
//                 '6848228c00222dfaf82e',
//                 '68597845003de1b5dcc0',
//                 user.id
//               );
//               setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
//             } catch (error) {
//               Alert.alert('Error', 'Failed to delete user');
//               console.error('Delete error:', error);
//             }
//           }
//         }
//       ]
//     );
//   };

//   const getStatusBadge = (status: User['status']) => {
//     const isActive = status === 'Active';
//     return (
//       <View style={[
//         globalStyles.badge,
//         isActive ? globalStyles.badgeDefault : globalStyles.badgeOutline
//       ]}>
//         <Text style={[
//           globalStyles.badgeText,
//           isActive ? globalStyles.badgeDefaultText : globalStyles.badgeOutlineText
//         ]}>
//           {status}
//         </Text>
//       </View>
//     );
//   };

//   const renderUserItem = ({ item }: { item: User }) => (
//     <View style={globalStyles.card}>
//       <View style={styles.itemHeader}>
//         <Text style={styles.itemTitle}>{item.fullName}</Text>
//         {getStatusBadge(item.status)}
//       </View>
//       <Text style={styles.itemDetail}>
//         <Icon name="briefcase-outline" size={14} color={colors.muted} /> 
//         {item.portfolio} ({item.role})
//       </Text>
//       <Text style={styles.itemDetail}>
//         <Icon name="email-outline" size={14} color={colors.muted} /> 
//         {item.email}
//       </Text>
//       <Text style={styles.itemDetail}>
//         <Icon name="phone-outline" size={14} color={colors.muted} /> 
//         {item.phone || 'Not provided'}
//       </Text>

//       {isDirector && (
//         <View style={styles.actionsContainer}>
//           <TouchableOpacity 
//             onPress={() => handleToggleStatus(item)} 
//             style={styles.actionButton}
//           >
//             <Icon 
//               name={item.status === 'Active' ? 'account-cancel-outline' : 'account-check-outline'} 
//               size={18} 
//               color={item.status === 'Active' ? colors.warning : colors.success} 
//             />
//             <Text style={[
//               styles.actionText,
//               { color: item.status === 'Active' ? colors.warning : colors.success }
//             ]}>
//               {item.status === 'Active' ? 'Deactivate' : 'Activate'}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             onPress={() => handleDeleteUser(item)} 
//             style={styles.actionButton}
//             disabled={item.id === currentUser.id}
//           >
//             <Icon name="trash-can-outline" size={18} color={colors.destructive} />
//             <Text style={[styles.actionText, { color: colors.destructive }]}>
//               Delete
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );

//   return (
//     <View style={globalStyles.container}>
//       <Stack.Screen options={{ title: 'User Management' }} />
      
//       <View style={styles.headerContainer}>
//         <Text style={typography.h1}>User Management</Text>
//         {isDirector && (
//           <TouchableOpacity 
//             style={[globalStyles.button, styles.addButton]} 
//             onPress={() => Alert.alert('Coming Soon', 'User creation will be implemented soon')}
//           >
//             <Icon 
//               name="plus-circle-outline" 
//               size={20} 
//               color={colors.white} 
//               style={{ marginRight: spacing.sm }} 
//             />
//             <Text style={globalStyles.buttonText}>Add User</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {isLoading ? (
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
//       ) : error ? (
//         <Text style={styles.errorText}>{error}</Text>
//       ) : users.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Icon name="account-group-outline" size={60} color={colors.muted} />
//           <Text style={typography.h3}>No Users Found</Text>
//           {isDirector && (
//             <Text style={typography.muted}>Click "Add User" to create one</Text>
//           )}
//         </View>
//       ) : (
//         <FlatList 
//           data={users}
//           renderItem={renderUserItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ paddingBottom: spacing.md }}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   headerContainer: {
//     marginBottom: spacing.md,
//   },
//   itemHeader: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     alignItems: 'flex-start', 
//     marginBottom: spacing.sm 
//   },
//   itemTitle: { 
//     fontSize: 18, 
//     fontWeight: 'bold', 
//     flexShrink: 1, 
//     marginRight: spacing.sm 
//   },
//   itemDetail: { 
//     fontSize: 14, 
//     color: colors.muted, 
//     marginBottom: spacing.xs, 
//     flexDirection: 'row', 
//     alignItems: 'center' 
//   },
//   actionsContainer: { 
//     flexDirection: 'row', 
//     justifyContent: 'flex-start', 
//     gap: spacing.md, 
//     marginTop: spacing.sm, 
//     borderTopWidth: StyleSheet.hairlineWidth, 
//     borderTopColor: colors.border, 
//     paddingTop: spacing.sm 
//   },
//   actionButton: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     paddingVertical: spacing.xs 
//   },
//   actionText: { 
//     marginLeft: spacing.xs, 
//     fontWeight: '500' 
//   },
//   addButton: { 
//     marginTop: spacing.md,
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     justifyContent: 'center' 
//   },
//   emptyContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     padding: spacing.lg, 
//     marginTop: 50 
//   },
//   errorText: { 
//     color: colors.destructive, 
//     textAlign: 'center', 
//     marginTop: 20 
//   },
// });






import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, Redirect } from 'expo-router';
import { databases, account } from '@/lib/appwrite';
import { Query } from 'appwrite';
import type { User } from '@/types';
import { AppwriteException, ID } from 'appwrite';




interface AppwriteError extends Error {
  type?: string;
  code?: number;
  response?: {
    message?: string;
    type?: string;
  };
}



const checkExistingUser = async (email: string) => {
  try {
    // 1. Check Auth system (Accounts)
    // Note: There's no direct email search in Auth, so we try to create a session
    try {
      await account.createEmailSession(email, 'dummy_password');
      // If succeeds, email exists (we'll delete the failed session)
      await account.deleteSession('current');
      return { existsInAuth: true };
    } catch (authError) {
      if (!(authError instanceof AppwriteException)) throw authError;
      if (authError.code !== 401) throw authError; // Ignore "invalid credentials"
    }

    // 2. Check your database collection
    const response = await databases.listDocuments(
      '6848228c00222dfaf82e', // databaseId
      '68597845003de1b5dcc0', // collectionId
      [Query.equal('email', email)]
    );

    return {
      existsInAuth: false,
      existsInDatabase: response.documents.length > 0
    };
  } catch (error) {
    console.error('Error checking existing user:', error);
    throw error;
  }
};

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Member',
    portfolio: '',
    password: '',
    confirmPassword: ''
  });

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
          Query.orderDesc('$createdAt')
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
      setFilteredUsers(fetchedUsers.filter(user => user.status === 'Active'));
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

  useEffect(() => {
    if (showInactive) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.status === 'Active'));
    }
  }, [showInactive, users]);

  // const handleCreateUser = async () => {
  //   if (newUser.password !== newUser.confirmPassword) {
  //     Alert.alert('Error', 'Passwords do not match');
  //     return;
  //   }

  //   try {
  //     // 1. Create the Auth account
  //     const authUser = await account.create(
  //       'unique()', // Auto-generated ID
  //       newUser.email,
  //       newUser.password,
  //       newUser.fullName
  //     );

  //     // 2. Create the user document in database
  //     const userDoc = await databases.createDocument(
  //       '6848228c00222dfaf82e',
  //       '68597845003de1b5dcc0',
  //       authUser.$id, // Same ID as auth account
  //       {
  //         name: newUser.fullName,
  //         email: newUser.email,
  //         phone: newUser.phone,
  //         role: newUser.role,
  //         portfolio: newUser.portfolio,
  //         status: 'Active',
  //         tenant: currentUser?.tenant,
  //         authId: authUser.$id
  //       }
  //     );

  //     // 3. Update UI
  //     const createdUser = {
  //       id: userDoc.$id,
  //       authId: userDoc.authId || userDoc.$id,
  //       fullName: userDoc.name,
  //       email: userDoc.email,
  //       phone: userDoc.phone,
  //       role: userDoc.role,
  //       portfolio: userDoc.portfolio,
  //       status: userDoc.status,
  //       avatarUrl: userDoc.avatarUrl || '',
  //       tenant: userDoc.tenant
  //     };

  //     setUsers(prev => [createdUser, ...prev]);
  //     setShowCreateModal(false);
  //     setNewUser({
  //       fullName: '',
  //       email: '',
  //       phone: '',
  //       role: 'Member',
  //       portfolio: '',
  //       password: '',
  //       confirmPassword: ''
  //     });

  //     Alert.alert('Success', 'User created successfully');
  //   } catch (error) {
  //     console.error('User creation error:', error);
  //     Alert.alert('Error', 'Failed to create user. Please try again.');
  //   }
  // };


  const handleCreateUser = async () => {
    // Validate passwords match
    if (newUser.password !== newUser.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    
  
    try {
      // 1. First check if email already exists
      try {
        await account.getSession('current'); // Try to get session (will fail if no user)
        const existing = await account.get();
        if (existing.email === newUser.email) {
          throw new Error('Email already exists');
        }
      } catch (checkError) {
        // Expected flow - email doesn't exist yet
      }
  
      // 2. Create the Auth account with auto-generated ID
      const authUser = await account.create(
        ID.unique(), // ← This is the crucial change
        newUser.email,
        newUser.password,
        newUser.fullName
      );

      const { existsInAuth, existsInDatabase } = await checkExistingUser(newUser.email);
  
  if (existsInAuth || existsInDatabase) {
    Alert.alert('Error', 'User with this email already exists');
    return;
  }
  
      // 3. Create the user document with same ID
      const userDoc = await databases.createDocument(
        '6848228c00222dfaf82e',
        '68597845003de1b5dcc0',
        authUser.$id, // Same ID as auth account
        {
          name: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          portfolio: newUser.portfolio,
          status: 'Active',
          tenant: currentUser?.tenant,
          authId: authUser.$id
        }
      );
  
      // 4. Update UI state
      const createdUser = {
        id: userDoc.$id,
        authId: authUser.$id,
        fullName: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        role: userDoc.role,
        portfolio: userDoc.portfolio,
        status: userDoc.status,
        avatarUrl: userDoc.avatarUrl || '',
        tenant: userDoc.tenant
      };
  
      setUsers(prev => [createdUser, ...prev]);
      setShowCreateModal(false);
      resetForm();
      
      Alert.alert('Success', 'User created successfully');
      
      
    } catch (error) {
      console.error('User creation error:', error);
      
      let userFacingMessage = 'Failed to create user. Please try again.';

      if (error instanceof AppwriteException) {
        if (error.type === 'user_already_exists') {
          userFacingMessage = 'A user with this email already exists.';
        } else if (error.message.includes('phone')) {
          userFacingMessage = 'This phone number is already registered.';
        } else {
          // Use the actual error message if it's an AppwriteException
          userFacingMessage = error.message || userFacingMessage;
        }
      } else if (error instanceof Error) {
        userFacingMessage = error.message;
      }
  
      Alert.alert('Error', userFacingMessage);
    }
  };
  
  // Helper function to reset form
  const resetForm = () => {
    setNewUser({
      fullName: '',
      email: '',
      phone: '',
      role: 'Member',
      portfolio: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleToggleStatus = async (user: User) => {
    if (!isDirector) {
      Alert.alert('Permission Denied', 'Only Directors can manage users.');
      return;
    }

    if (user.id === currentUser?.id) {
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

    if (user.id === currentUser?.id) {
      Alert.alert('Action Denied', 'You cannot delete your own account.');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Delete ${user.fullName}? This will permanently remove their account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete both the auth account and document
              await account.deleteIdentity(user.id);
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

  return (
    <View style={globalStyles.container}>
      <Stack.Screen options={{ title: 'User Management' }} />
      
      <View style={styles.headerContainer}>
        <Text style={typography.h1}>User Management</Text>
        {isDirector && (
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[globalStyles.buttonOutline, styles.toggleButton]}
              onPress={() => setShowInactive(!showInactive)}
            >
              <Icon 
                name={showInactive ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color={colors.primary} 
              />
              <Text style={[globalStyles.buttonOutlineText, { marginLeft: spacing.xs }]}>
                {showInactive ? 'Hide Inactive' : 'Show Inactive'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[globalStyles.button, styles.addButton]} 
              onPress={() => setShowCreateModal(true)}
            >
              <Icon 
                name="plus-circle-outline" 
                size={20} 
                color={colors.white} 
                style={{ marginRight: spacing.sm }} 
              />
              <Text style={globalStyles.buttonText}>Add User</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-group-outline" size={60} color={colors.muted} />
          <Text style={typography.h3}>No Users Found</Text>
          {isDirector && (
            <Text style={typography.muted}>Click "Add User" to create one</Text>
          )}
        </View>
      ) : (
        <FlatList 
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.md }}
        />
      )}

      {/* Create User Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={typography.h2}>Create New User</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Icon name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={globalStyles.input}
            placeholder="Full Name"
            value={newUser.fullName}
            onChangeText={(text) => setNewUser({...newUser, fullName: text})}
          />

          <TextInput
            style={globalStyles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={newUser.email}
            onChangeText={(text) => setNewUser({...newUser, email: text})}
          />

          <TextInput
            style={globalStyles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={newUser.phone}
            onChangeText={(text) => setNewUser({...newUser, phone: text})}
          />

          <View style={globalStyles.inputPicker}>
            <Text style={globalStyles.inputLabel}>Role</Text>
            <View style={styles.roleOptions}>
              {['Delegate', 'Chairman', 'Director'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    newUser.role === role && styles.roleButtonActive
                  ]}
                  onPress={() => setNewUser({...newUser, role})}
                >
                  <Text style={newUser.role === role ? styles.roleButtonTextActive : styles.roleButtonText}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={globalStyles.input}
            placeholder="Portfolio/Department"
            value={newUser.portfolio}
            onChangeText={(text) => setNewUser({...newUser, portfolio: text})}
          />

          <TextInput
            style={globalStyles.input}
            placeholder="Password"
            secureTextEntry
            value={newUser.password}
            onChangeText={(text) => setNewUser({...newUser, password: text})}
          />

          <TextInput
            style={globalStyles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={newUser.confirmPassword}
            onChangeText={(text) => setNewUser({...newUser, confirmPassword: text})}
          />

          <TouchableOpacity
            style={[globalStyles.button, styles.createButton]}
            onPress={handleCreateUser}
          >
            <Text style={globalStyles.buttonText}>Create User</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
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
  // addButton: { 
  //   marginTop: spacing.md,
  //   flexDirection: 'row', 
  //   alignItems: 'center', 
  //   justifyContent: 'center' 
  // },

  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  roleOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  roleButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  roleButtonText: {
    color: colors.text
  },
  roleButtonTextActive: {
    color: colors.white
  },
  createButton: {
    marginTop: spacing.lg
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