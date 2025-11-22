import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useSchool } from './SchoolContext';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentSchool, isSuperAdminDomain } = useSchool();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            
            // SECURITY: Enforce Tenancy
            // 1. If on Super Admin domain, allow only Super Admins
            if (isSuperAdminDomain) {
                if (userData.role === 'super_admin') {
                    setCurrentUser({ ...userData, id: firebaseUser.uid });
                } else {
                    // Regular users cannot login on root domain
                    alert("Please login via your specific school subdomain.");
                    await firebaseSignOut(auth);
                    setCurrentUser(null);
                }
            } 
            // 2. If on a School Subdomain, allow only users of that school
            else if (currentSchool) {
                if (userData.schoolId === currentSchool.id || userData.role === 'super_admin') {
                    setCurrentUser({ ...userData, id: firebaseUser.uid });
                } else {
                    alert("You are not authorized to access this school.");
                    await firebaseSignOut(auth);
                    setCurrentUser(null);
                }
            }
          } else {
             // User exists in Auth but not in Firestore (data consistency issue)
             console.error("User profile not found in Firestore");
             setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentSchool, isSuperAdminDomain]);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
