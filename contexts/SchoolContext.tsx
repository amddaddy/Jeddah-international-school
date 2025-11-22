import React, { createContext, useContext, useEffect, useState } from 'react';
import { School } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import SpinnerIcon from '../components/icons/SpinnerIcon';

interface SchoolContextType {
  currentSchool: School | null;
  isSuperAdminDomain: boolean;
  isLoading: boolean;
  error: string | null;
}

const SchoolContext = createContext<SchoolContextType>({
  currentSchool: null,
  isSuperAdminDomain: false,
  isLoading: true,
  error: null
});

export const useSchool = () => useContext(SchoolContext);

// Domains that point to the Super Admin Dashboard
const ROOT_DOMAINS = ['localhost', 'insightedu.com', 'app.insightedu.com', 'www.insightedu.com'];

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [isSuperAdminDomain, setIsSuperAdminDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveSchool = async () => {
      const hostname = window.location.hostname;
      
      // 1. Check if we are on the root domain (Super Admin)
      // If localhost, we treat it as root unless a subdomain is manually simulated
      if (ROOT_DOMAINS.includes(hostname)) {
        setIsSuperAdminDomain(true);
        setIsLoading(false);
        return;
      }

      // 2. Extract Subdomain
      // Assumes structure: subdomain.domain.com
      const parts = hostname.split('.');
      if (parts.length < 3 && !hostname.includes('localhost')) {
          // Handle custom domain edge cases if necessary
          setIsSuperAdminDomain(true);
          setIsLoading(false);
          return;
      }

      // For localhost testing, you might use sub.localhost:3000
      const subdomain = parts[0];

      if (subdomain === 'www' || subdomain === 'app') {
          setIsSuperAdminDomain(true);
          setIsLoading(false);
          return;
      }

      try {
        const q = query(collection(db, 'schools'), where('subdomain', '==', subdomain.toLowerCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError(`School with ID '${subdomain}' not found.`);
        } else {
          const schoolData = snapshot.docs[0].data() as School;
          // Inject Firestore ID
          setCurrentSchool({ ...schoolData, id: snapshot.docs[0].id });
        }
      } catch (err) {
        console.error("Error resolving school:", err);
        setError("Failed to load school data. Please check connection.");
      } finally {
        setIsLoading(false);
      }
    };

    resolveSchool();
  }, []);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-100"><SpinnerIcon className="w-10 h-10 text-sky-600" /></div>;
  }

  if (error) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">404</h1>
            <p className="text-xl text-slate-600">{error}</p>
            <p className="text-sm text-slate-500 mt-4">If you believe this is an error, contact support.</p>
        </div>
    );
  }

  return (
    <SchoolContext.Provider value={{ currentSchool, isSuperAdminDomain, isLoading, error }}>
      {children}
    </SchoolContext.Provider>
  );
};
