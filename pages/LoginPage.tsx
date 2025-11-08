
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SCHOOL_LOGO_BASE64 } from '../components/assets';
import SpinnerIcon from '../components/icons/SpinnerIcon';

interface LoginPageProps {
    onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(email, password);
            if (!user) {
                setError('Invalid email or password. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <img src={SCHOOL_LOGO_BASE64} alt="Insight ED Logo" className="w-24 h-24 mx-auto" />
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Sign in to Insight ED</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Enter your credentials to access your dashboard.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <SpinnerIcon /> : 'Sign In'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToRegister} className="font-medium text-sky-600 hover:text-sky-500">
                        Register here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
