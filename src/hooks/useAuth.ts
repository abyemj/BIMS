
// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Adjust path if needed

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
