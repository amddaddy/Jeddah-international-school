
import React, { useState, useEffect } from 'react';
import { User, School } from '../types';
import Card from './Card';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SCHOOL_LOGO_BASE64 } from './assets';
import SpinnerIcon from './icons/SpinnerIcon';

const SuperAdminDashboard: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [schools, setSchools] = useState<School[]>([]);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [newSubdomain, setNewSubdomain] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchSchools = async () => {
            const snap = await getDocs(collection(db, 'schools'));
            setSchools(snap.docs.map(d => ({ ...d.data(), id: d.id } as School)));
        };
        fetchSchools();
    }, []);

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // 1. Create School Doc
            const schoolRef = doc(collection(db, 'schools'));
            const newSchool: School = {
                id: schoolRef.id,
                name: newSchoolName,
                subdomain: newSubdomain.toLowerCase(),
                email: `admin@${newSubdomain}.com`,
                address: 'Address',
                contactInfo: '',
                logo: SCHOOL_LOGO_BASE64,
                status: 'active',
                type: 'secondary',
                studentLimit: 100,
                dateRegistered: new Date().toISOString()
            };
            
            await setDoc(schoolRef, newSchool);

            // 2. Create Initial School Admin (This usually requires a Cloud Function to avoid logging out the super admin)
            // For now, we just update the list to show UI feedback
            setSchools([...schools, newSchool]);
            alert(`School ${newSchoolName} created! Access at http://${newSubdomain}.insightedu.com`);
            
        } catch (error) {
            console.error(error);
            alert("Error creating school.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-800 p-8 text-white">
            <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Create New School" className="text-slate-900">
                    <form onSubmit={handleCreateSchool} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">School Name</label>
                            <input 
                                className="w-full border p-2 rounded" 
                                value={newSchoolName} 
                                onChange={e => {
                                    setNewSchoolName(e.target.value);
                                    // Auto-generate subdomain
                                    setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Subdomain</label>
                            <div className="flex items-center">
                                <input className="w-full border p-2 rounded-l bg-slate-100" value={newSubdomain} readOnly />
                                <span className="bg-slate-200 p-2 border border-l-0 rounded-r text-slate-600">.insightedu.com</span>
                            </div>
                        </div>
                        <button disabled={isCreating} className="bg-blue-600 text-white px-4 py-2 rounded w-full flex justify-center">
                            {isCreating ? <SpinnerIcon /> : 'Create School'}
                        </button>
                    </form>
                </Card>

                <Card title="All Schools" className="text-slate-900">
                    <ul className="space-y-2">
                        {schools.map(school => (
                            <li key={school.id} className="p-3 border rounded flex justify-between items-center hover:bg-slate-50">
                                <div>
                                    <p className="font-bold">{school.name}</p>
                                    <a href={`http://${school.subdomain}.insightedu.com`} target="_blank" className="text-sm text-blue-600 hover:underline">
                                        {school.subdomain}.insightedu.com
                                    </a>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${school.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {school.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
