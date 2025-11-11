

import React, { useState, lazy, Suspense } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import { useAuth } from './hooks/useAuth';
import SpinnerIcon from './components/icons/SpinnerIcon';

const App = lazy(() => import('./App'));

const AuthRouter: React.FC = () => {
    const { currentUser, users, isAuthReady } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);

    const spinner = (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <SpinnerIcon className="w-10 h-10 text-sky-600" />
        </div>
    );

    if (!isAuthReady) {
        return spinner;
    }

    if (users.length === 0) {
        return <AdminRegisterPage />;
    }

    if (currentUser) {
        return (
            <Suspense fallback={spinner}>
                <App />
            </Suspense>
        );
    }
    
    if (isRegistering) {
        return <RegisterPage onSwitchToLogin={() => setIsRegistering(false)} />;
    }

    return <LoginPage onSwitchToRegister={() => setIsRegistering(true)} />;
};

export default AuthRouter;