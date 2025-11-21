
import React, { useState } from 'react';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { Role } from '../types';
import { SCHOOL_LOGO_BASE64 } from '../components/assets';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => boolean;
  onRegister: (schoolName: string, address: string, schoolEmail: string, phone: string, email: string, pass: string) => boolean;
  logo?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, logo }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // School Details
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Admin Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const displayLogo = logo || SCHOOL_LOGO_BASE64;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      let success = false;
      if (isRegistering) {
          success = onRegister(schoolName, address, schoolEmail, phone, email, password);
      } else {
          success = onLogin(email, password);
      }

      if (!success) {
        setError(isRegistering ? 'Registration failed. Email might be in use.' : 'Invalid email or password, or account suspended.');
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError('');
      setEmail('');
      setPassword('');
      setSchoolName('');
      setAddress('');
      setSchoolEmail('');
      setPhone('');
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="px-8 py-10 md:px-10">
            <div className="text-center mb-6">
              <img src={displayLogo} alt="Logo" className="h-20 w-20 mx-auto mb-4 object-contain" />
              <h1 className="text-3xl font-bold text-slate-800">Insight Edu</h1>
              <p className="text-slate-500 mt-1">{isRegistering ? 'Register Your School' : 'School Management Portal'}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                    <div>
                        <label htmlFor="schoolName" className="block text-sm font-medium text-slate-700 mb-1">
                        School Name
                        </label>
                        <input
                        id="schoolName"
                        name="schoolName"
                        type="text"
                        required={isRegistering}
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g., Spring Valley High"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                        School Address
                        </label>
                        <textarea
                        id="address"
                        name="address"
                        required={isRegistering}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Full physical address"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="schoolEmail" className="block text-sm font-medium text-slate-700 mb-1">
                        School Official Email
                        </label>
                        <input
                        id="schoolEmail"
                        name="schoolEmail"
                        type="email"
                        required={isRegistering}
                        value={schoolEmail}
                        onChange={(e) => setSchoolEmail(e.target.value)}
                        placeholder="info@school.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                        Mobile Number(s)
                        </label>
                        <input
                        id="phone"
                        name="phone"
                        type="text"
                        required={isRegistering}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+123 456 7890"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                    </div>
                    <div className="border-t border-slate-200 pt-4 mt-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-2">Administrator Account</h3>
                    </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  {isRegistering ? 'Admin Login Email' : 'Email Address'}
                </label>
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
              
              <div>
                <label htmlFor="password"  className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
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
              
              {isRegistering && (
                  <p className="text-xs text-slate-500">
                      By registering, a new School Administrator account will be created linked to the school details above.
                  </p>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon className="mr-2" />
                      {isRegistering ? 'Registering School...' : 'Signing in...'}
                    </>
                  ) : (isRegistering ? 'Register School' : 'Sign In')}
                </button>
              </div>
              
              <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={toggleMode}
                    className="text-sm text-sky-600 hover:text-sky-800"
                  >
                      {isRegistering ? 'Already have an account? Sign In' : "Register a new School"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
