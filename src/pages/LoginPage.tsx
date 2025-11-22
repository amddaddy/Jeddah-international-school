
import React, { useState } from 'react';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { School, Permissions } from '../types';
import { auth, db } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ALL_PERMISSIONS } from '../components/AccessControlStep';

interface LoginPageProps {
  isSuperAdmin: boolean;
  school: School | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ isSuperAdmin, school }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // New state for name
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering && isSuperAdmin) {
        // --- REGISTRATION LOGIC (Super Admin Only) ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Grant all permissions to Super Admin
        const fullPermissions = ALL_PERMISSIONS.reduce((acc, p) => {
            acc[p.id] = true;
            return acc;
        }, {} as Permissions);

        // Create User Profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            name: name,
            email: email,
            role: 'super_admin',
            schoolId: 'global', // Distinct ID for super admins
            permissions: fullPermissions
        });

      } else {
        // --- LOGIN LOGIC ---
        await signInWithEmailAndPassword(auth, email, password);
        // AuthProvider will detect the change and handle redirection/context updates
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
          setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
          setError("This email is already registered.");
      } else if (err.code === 'permission-denied') {
          setError("Permission denied. Check database rules.");
      } else {
          setError("Authentication failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const title = isSuperAdmin ? "Insight Edu Super Admin" : school?.name || "Insight Edu";
  const logo = school?.logo;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-6">
          {logo && <img src={logo} alt="Logo" className="h-20 w-20 mx-auto mb-4 object-contain" />}
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-500">
             {isRegistering ? 'Create New Account' : (isSuperAdmin ? 'Platform Management' : 'Staff Portal')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
                <div>
                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-md" 
                        required 
                        placeholder="e.g. System Administrator"
                    />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-md" 
                    required 
                    placeholder="name@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-md" 
                    required 
                    placeholder="••••••••"
                    minLength={6}
                />
            </div>
            
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button disabled={isLoading} className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 flex justify-center font-semibold transition-colors">
                {isLoading ? <SpinnerIcon /> : (isRegistering ? 'Create Account' : 'Login')}
            </button>
        </form>

        {isSuperAdmin && (
            <div className="mt-6 text-center pt-4 border-t border-slate-100">
                <button 
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                        setName('');
                        setEmail('');
                        setPassword('');
                    }}
                    className="text-sm text-sky-600 hover:text-sky-800 hover:underline"
                >
                    {isRegistering ? "Back to Login" : "Create Super Admin Account"}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
