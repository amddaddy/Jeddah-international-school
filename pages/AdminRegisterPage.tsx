
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SCHOOL_LOGO_BASE64 } from '../components/assets';
import SpinnerIcon from '../components/icons/SpinnerIcon';

const AdminRegisterPage: React.FC = () => {
    const [adminName, setAdminName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [schoolName, setSchoolName] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, setupSchool } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }
        if (!adminName || !schoolName || !schoolAddress || !contactInfo) {
             setError('Please fill all fields.');
            setIsLoading(false);
            return;
        }

        try {
            await register(adminName, email, password, 'admin');
            setupSchool({ schoolName, schoolAddress, contactInfo });
            setSuccess('Setup complete! The application will now reload to apply your settings. Please log in with the credentials you just created.');
            
            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClass = "mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500";
    const labelClass = "block text-sm font-medium text-slate-700";

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <img src={SCHOOL_LOGO_BASE64} alt="Insight ED Logo" className="w-24 h-24 mx-auto" />
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Welcome to Insight ED</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Let's set up your school and administrator account.
                    </p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">School Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="schoolName" className={labelClass}>School Name</label>
                                <input id="schoolName" type="text" required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className={inputClass} />
                            </div>
                             <div>
                                <label htmlFor="contactInfo" className={labelClass}>Contact Info (Phone, Email)</label>
                                <input id="contactInfo" type="text" required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className={inputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="schoolAddress" className={labelClass}>School Address</label>
                                <input id="schoolAddress" type="text" required value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} className={inputClass} />
                            </div>
                        </div>
                    </div>
                    
                     <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Administrator Account</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="adminName" className={labelClass}>Your Full Name</label>
                                <input id="adminName" type="text" required value={adminName} onChange={(e) => setAdminName(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="email-register" className={labelClass}>Your Email Address</label>
                                <input id="email-register" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="password-register" className={labelClass}>Password</label>
                                <input id="password-register" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                            </div>
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}

                    <div>
                        <button type="submit" disabled={isLoading || !!success} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400">
                            {isLoading ? <SpinnerIcon /> : 'Complete Setup'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminRegisterPage;
