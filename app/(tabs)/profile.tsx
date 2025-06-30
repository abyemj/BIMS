


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput, Switch } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, Redirect } from 'expo-router';
import { account, databases } from '@/lib/appwrite';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    
    try {
      // Update name in Auth
      await account.updateName(fullName);
      
      // Update phone in database (replace with your actual DB/collection IDs)
      await databases.updateDocument(
        '6848228c00222dfaf82e', // Your database ID
        '68597845003de1b5dcc0', // Your collection ID
        user.id,
        { phone }
      );

      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Could not save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      // First verify current password by creating a session
      await account.createEmailSession(user.email, currentPassword);
      
      // Update password
      await account.updatePassword(newPassword, currentPassword);
      
      // Delete the temporary session
      await account.deleteSession('current');
      
      Alert.alert('Success', 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Password Change Failed', error.message || 'Could not change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Basic 2FA toggle (Appwrite Web SDK doesn't have direct 2FA methods)
  const toggle2FA = async () => {
    Alert.alert(
      'Two-Factor Authentication',
      'For security reasons, please contact your administrator to enable two-factor authentication.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message || 'An error occurred during logout.');
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      
      <Stack.Screen options={{ title: 'My Profile' }} />
      
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="account-circle" size={80} color={colors.muted} />
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.detail}>
          <Icon name="email-outline" size={16} color={colors.muted}/> {user.email}
        </Text>
        {user.phone && (
          <Text style={styles.detail}>
            <Icon name="phone-outline" size={16} color={colors.muted}/> {user.phone}
          </Text>
        )}
        <Text style={styles.detail}>
          <Icon name="briefcase-outline" size={16} color={colors.muted}/> {user.portfolio} ({user.role})
        </Text>
      </View>

      {/* Edit Profile Section */}
      <View style={globalStyles.card}>
        <Text style={typography.h3}>Edit Profile</Text>
        <TextInput 
          style={[globalStyles.input, styles.inputMargin]} 
          placeholder="Full Name" 
          value={fullName} 
          onChangeText={setFullName} 
        />
        <TextInput 
          style={globalStyles.input} 
          placeholder="Phone Number" 
          value={phone} 
          onChangeText={setPhone} 
          keyboardType="phone-pad" 
        />
        <TouchableOpacity 
          style={[globalStyles.button, {marginTop: spacing.md}]} 
          onPress={handleProfileUpdate} 
          disabled={isSavingProfile}
        >
          {isSavingProfile ? (
            <ActivityIndicator color={colors.white}/>
          ) : (
            <Text style={globalStyles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Change Password Section */}
      <View style={globalStyles.card}>
        <Text style={typography.h3}>Change Password</Text>
        <TextInput 
          style={[globalStyles.input, styles.inputMargin]} 
          placeholder="Current Password" 
          value={currentPassword} 
          onChangeText={setCurrentPassword} 
          secureTextEntry 
        />
        <TextInput 
          style={[globalStyles.input, styles.inputMargin]} 
          placeholder="New Password" 
          value={newPassword} 
          onChangeText={setNewPassword} 
          secureTextEntry 
        />
        <TextInput 
          style={globalStyles.input} 
          placeholder="Confirm New Password" 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry 
        />
        <TouchableOpacity 
          style={[globalStyles.button, globalStyles.buttonOutline, {marginTop: spacing.md}]} 
          onPress={handlePasswordChange} 
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
            <ActivityIndicator color={colors.primary}/>
          ) : (
            <Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Simplified 2FA Section */}
      <View style={globalStyles.card}>
        <View style={styles.twoFactorRow}>
          <View>
            <Text style={typography.h3}>Two-Factor Authentication</Text>
            <Text style={styles.twoFactorDescription}>
              Contact administrator to enable
            </Text>
          </View>
          <Switch
            value={is2FAEnabled}
            onValueChange={toggle2FA}
            disabled={true}
            trackColor={{ true: colors.primary, false: colors.muted }}
            thumbColor={colors.white}
          />
        </View>
      </View>

       {/* Logout Button */}
       <TouchableOpacity 
        style={[globalStyles.button, globalStyles.buttonDestructive, styles.logoutButton]} 
        onPress={handleLogout} 
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={globalStyles.buttonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { 
    paddingBottom: spacing.lg 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: spacing.lg, 
    padding: spacing.md, 
    backgroundColor: colors.secondary, 
    borderRadius: 8 
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: colors.muted, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: spacing.md 
  },
  name: { 
    ...typography.h2, 
    marginBottom: spacing.xs 
  },
  detail: { 
    ...typography.body, 
    color: colors.muted, 
    marginBottom: spacing.xs, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  logoutButton: { 
    marginTop: spacing.xl, 
    marginHorizontal: spacing.md 
  },
  inputMargin: { 
    marginBottom: spacing.sm 
  },
  twoFactorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  twoFactorDescription: {
    ...typography.muted,
    color: colors.muted,
    marginTop: spacing.xs
  }
});
