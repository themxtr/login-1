import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
  getIdToken
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  mockRole: string;
  setMockRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockRole, _setMockRole] = useState<string>(() => localStorage.getItem('mockRole') || 'ADMIN');

  const setMockRole = (role: string) => {
    localStorage.setItem('mockRole', role);
    _setMockRole(role);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass).then(() => {});
  const signup = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass).then(() => {});
  const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider()).then(() => {});
  const logout = () => signOut(auth);
  const getToken = async () => {
    if (!user) return null;
    return await getIdToken(user);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    getToken,
    mockRole,
    setMockRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
