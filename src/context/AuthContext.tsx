
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter, useSegments, SplashScreen } from 'expo-router';
import { client, account, databases} from '@/lib/appwrite';
import { Query } from "appwrite";
import type { User } from '@/types';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  fetchUsers: () => Promise<User[]>;
  getChairman: () => Promise<User | undefined>;
  refreshSession: () => Promise<void>;
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserDocument = async (userId: string) => {
  try {
    const response = await databases.getDocument(
      '6848228c00222dfaf82e',
      '68597845003de1b5dcc0',
      userId
    );
    return {
      id: response.$id,
      email: response.email,
      // other fields...
    };
  } catch (error) {
    console.error("Failed to fetch user document:", error);
    return null;
  }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Map Appwrite user to our User type
  const mapUser = (userData: any): User => {
    return {
      id: userData?.$id || '',
      fullName: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.prefs?.phone || '',
      role: userData?.prefs?.role || 'Delegate',
      portfolio: userData?.prefs?.portfolio || 'N/A',
      status: userData?.prefs?.status || 'Active',
      avatarUrl: userData?.prefs?.avatarUrl || '',
      tenant: userData?.prefs?.tenant || '',
    };
  };

  // Check existing session on app start
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await AsyncStorage.getItem('session');
        
        if (session) {
          // Correct session setting for Appwrite v14
          const parsedSession = JSON.parse(session);
          client.headers['X-Fallback-Cookies'] = parsedSession.secret;
          const currentUser = await account.get();
          setUser(mapUser(currentUser));
        }
      } catch (error) {
        console.error('Session load error:', error);
        await AsyncStorage.removeItem('session');
      } finally {
        setLoading(false);
        SplashScreen.hideAsync();
      }
    };

    loadSession();
  }, []);

  // Refresh session token periodically
  const refreshSession = async () => {
    try {
      const sessions = await account.listSessions();
      if (sessions.sessions.length > 0) {
        await AsyncStorage.setItem('session', JSON.stringify(sessions.sessions[0]));
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const session = await account.createEmailSession(email, password);
      await AsyncStorage.setItem('session', JSON.stringify(session));
      
      const currentUser = await account.get();
      const userDocument = await fetchUserDocument(currentUser.$id);
      setUser({ ...mapUser(currentUser), ...userDocument });
      
      // Refresh session every 30 minutes
      setInterval(refreshSession, 30 * 60 * 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      await logout();
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const logout = async () => {
    try {
      const sessions = await account.listSessions();
      if (sessions.sessions.length > 0) {
        await account.deleteSession(sessions.sessions[0].$id);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('session');
      setUser(null);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('Not authenticated');

    try {
      // Update name if changed
      if (data.fullName && data.fullName !== user.fullName) {
        await account.updateName(data.fullName);
      }

      // Update preferences
      const updatedPrefs = {
        ...(user as any).prefs, // Temporary type assertion
        phone: data.phone ?? user.phone,
        role: data.role ?? user.role,
        portfolio: data.portfolio ?? user.portfolio,
        status: data.status ?? user.status
      };

      await account.updatePrefs(updatedPrefs);
      const currentUser = await account.get();
      setUser(mapUser(currentUser));
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const changeUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
      await account.updatePassword(newPassword, currentPassword);
    } catch (error: any) {
      console.error('Password change error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const fetchUsers = async (): Promise<User[]> => {
    try {
      // Alternative implementation using your database
      // Example: Query from your users collection
      const response = await databases.listDocuments(
        '6848228c00222dfaf82e', 
      '68597845003de1b5dcc0',
      );
      return response.documents.map(doc => mapUser(doc));
    } catch (error) {
      console.error('Fetch users error:', error);
      Alert.alert('Error', 'Failed to load users');
      return [];
    }
  };

  const getChairman = async (): Promise<User | undefined> => {
    try {
      const response = await databases.listDocuments(
        'your-database-id',
        'users-collection-id',
        [Query.equal('role', 'Chairman')]
      );
      return response.documents.length > 0 ? mapUser(response.documents[0]) : undefined;
    } catch (error) {
      console.error('Fetch chairman error:', error);
      return undefined;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUserProfile,
        changeUserPassword,
        fetchUsers,
        getChairman,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace(user.role === 'Delegate' ? '/(tabs)/meetings' : '/(tabs)/dashboard');
    }
  }, [user, loading, segments]);
}