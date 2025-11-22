
import React, { lazy, Suspense } from 'react';
import { SchoolProvider, useSchool } from './contexts/SchoolContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SpinnerIcon from './components/icons/SpinnerIcon';
import SuperAdminDashboard from './components/SuperAdminDashboard'; 

// Existing Main App Logic - now wrapped as a component
const SchoolApp = lazy(() => import('./SchoolApp')); 

const AppContent: React.FC = () => {
    const { currentSchool, isSuperAdminDomain, isLoading: schoolLoading } = useSchool();
    const { currentUser, loading: authLoading } = useAuth();

    if (schoolLoading || authLoading) {
         return <div className="h-screen w-full flex items-center justify-center bg-slate-100"><SpinnerIcon className="w-10 h-10 text-sky-600" /></div>;
    }

    if (!currentUser) {
        // Pass context to Login Page to know if we are logging into Super Admin or School
        return <LoginPage isSuperAdmin={isSuperAdminDomain} school={currentSchool} />;
    }

    if (isSuperAdminDomain) {
        return <SuperAdminDashboard currentUser={currentUser} />;
    }

    if (currentSchool) {
        // Check Subscription
        if (currentSchool.status === 'suspended') {
             return (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-red-50 text-center p-6">
                    <h1 className="text-3xl font-bold text-red-700 mb-4">Account Suspended</h1>
                    <p className="text-slate-600">This school's subscription has expired or been suspended.</p>
                    <p className="text-slate-500 mt-2">Please contact Insight Edu support.</p>
                    <button onClick={() => window.location.reload()} className="mt-6 text-sky-600 hover:underline">Refresh</button>
                </div>
             );
        }

        return (
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SpinnerIcon /></div>}>
                <SchoolApp school={currentSchool} user={currentUser} />
            </Suspense>
        );
    }

    return <div>Unexpected State</div>;
};

const App: React.FC = () => {
    return (
        <SchoolProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </SchoolProvider>
    );
};

export default App;
