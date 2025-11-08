import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SCHOOL_LOGO_BASE64 } from '../components/assets';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { Role } from '../types';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('teacher');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        if(password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }
        try {
            await register(name, email, password, role);
            setSuccess('Registration successful! You can now log in.');
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <img src={SCHOOL_LOGO_BASE64} alt="Insight ED Logo" className="w-24 h-24 mx-auto" />
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Create an Account</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Join the Insight ED platform.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="email-register" className="block text-sm font-medium text-slate-700">Email address</label>
                        <input id="email-register" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="password-register" className="block text-sm font-medium text-slate-700">Password</label>
                        <input id="password-register" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">Your Role</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white">
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                            <option value="parent">Parent</option>
                        </select>
                         <p className="text-xs text-slate-500 mt-1">Admin accounts must be created by the system administrator.</p>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400">
                            {isLoading ? <SpinnerIcon /> : 'Register'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-sky-600 hover:text-sky-500">
                        Sign in here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
