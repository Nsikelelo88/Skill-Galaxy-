import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled in Firebase. Enable Email/Password under Authentication > Sign-in method in the Firebase console.';
    case 'auth/email-already-in-use':
      return 'That email address is already registered.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Use a stronger password with at least 6 characters.';
    case 'auth/invalid-credential':
      return 'The email or password is incorrect.';
    default:
      return error?.message || 'Authentication failed.';
  }
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const register = async (email, password, userData) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (userData?.name) {
        await updateProfile(result.user, {
          displayName: userData.name,
        });
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, login, register, logout };
};