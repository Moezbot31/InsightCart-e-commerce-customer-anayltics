import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, cleanFirestoreData, handleFirestoreError, OperationType, signInAsGuest } from '../firebase';

export type UserRole = 'analyst' | 'executive';

export interface DashboardPreferences {
  theme?: 'light' | 'dark';
  compactMode: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  organization?: string;
  role: UserRole;
  lastLogin?: any;
  createdAt: any;
  dashboardPreferences?: DashboardPreferences;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAnalyst: boolean;
  isExecutive: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      
      try {
        // Fetch or create profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const existingProfile = userDoc.data() as UserProfile;
          // Update last login
          const updatedProfile = {
            ...existingProfile,
            lastLogin: new Date()
          };
          await setDoc(userRef, cleanFirestoreData(updatedProfile), { merge: true });
          setProfile(updatedProfile);
        } else {
          // Get pending role from localStorage or default to analyst
          const pendingRole = localStorage.getItem('pending_role') as UserRole || 'analyst';
          localStorage.removeItem('pending_role');

          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'guest@insightcart.ai',
            displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest User' : 'User'),
            role: pendingRole,
            organization: '',
            createdAt: new Date(),
            lastLogin: new Date(),
            dashboardPreferences: {
              theme: 'light',
              compactMode: false
            }
          };
          
          await setDoc(userRef, cleanFirestoreData(newProfile));
          setProfile(newProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await auth.signOut();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const cleanedData = cleanFirestoreData(data);
      await setDoc(userRef, cleanedData, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      throw error;
    }
  };

  const isAnalyst = profile?.role === 'analyst';
  const isExecutive = profile?.role === 'executive';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAnalyst, isExecutive, signOut, updateProfile }}>
      {children}
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
