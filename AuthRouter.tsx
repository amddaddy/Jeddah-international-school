
import React, { useState } from 'react';
import App from './App';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import { useAuth } from './hooks/useAuth';
import SpinnerIcon from './components/icons/SpinnerIcon';

const AuthRouter: React.FC = () => {
    const { currentUser, users, isAuthReady } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);

    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <SpinnerIcon className="w-10 h-10 text-sky-600" />
            </div>
        );
    }

    if (users.length === 0) {
        return <AdminRegisterPage />;
    }

    if (currentUser) {
        return <App />;
    }
    
    if (isRegistering) {
        return <RegisterPage onSwitchToLogin={() => setIsRegistering(false)} />;
    }

    return <LoginPage onSwitchToRegister={() => setIsRegistering(true)} />;
};

export default AuthRouter;
