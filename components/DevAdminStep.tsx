
import React, { useState } from 'react';
import { User } from '../types';
import Card from './Card';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationDialog from './ConfirmationDialog';

interface DevAdminStepProps {
    allUsers: User[];
    onAddAdmin: (newUser: Omit<User, 'id' | 'role' | 'permissions'>) => User | null;
    onRemoveAdmin: (userId: string) => void;
}

const DevAdminStep: React.FC<DevAdminStepProps> = ({ allUsers, onAddAdmin, onRemoveAdmin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userToRemove, setUserToRemove] = useState<User | null>(null);

    const admins = allUsers.filter(u => u.role === 'admin');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            alert('Please fill all fields for the new admin.');
            return;
        }
        const newUser = onAddAdmin({ name, email, password, schoolId: 'global' });
        if (newUser) {
            setName('');
            setEmail('');
            setPassword('');
        }
    };

    const handleRequestRemove = (user: User) => {
        setUserToRemove(user);
    };

    const handleConfirmRemove = () => {
        if (userToRemove) {
            onRemoveAdmin(userToRemove.id);
            setUserToRemove(null);
        }
    };
    
    const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Manage Administrators">
                <p className="text-sm text-slate-600 mb-4">
                    As a Developer Admin, you can add or remove Administrator accounts. Administrators have full access to all school management features.
                </p>
                {admins.length > 0 ? (
                    <ul className="space-y-3">
                        {admins.map(admin => (
                            <li key={admin.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md border">
                                <div>
                                    <p className="font-semibold text-slate-800">{admin.name}</p>
                                    <p className="text-sm text-slate-500">{admin.email}</p>
                                </div>
                                <button
                                    onClick={() => handleRequestRemove(admin)}
                                    className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100"
                                    aria-label={`Remove ${admin.name}`}
                                >
                                    <TrashIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-center py-4">No Administrators found.</p>
                )}
            </Card>

            <Card title="Add New Administrator">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="admin-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input id="admin-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                    </div>
                     <div>
                        <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required />
                    </div>
                     <div>
                        <label htmlFor="admin-password"  className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                        <input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-sky-600 text-white px-4 py-2.5 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center justify-center"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" /> Add Administrator
                    </button>
                </form>
            </Card>

             <ConfirmationDialog
                isOpen={!!userToRemove}
                onClose={() => setUserToRemove(null)}
                onConfirm={handleConfirmRemove}
                title="Confirm Administrator Removal"
                message={`Are you sure you want to remove the administrator "${userToRemove?.name}"? This action cannot be undone.`}
                confirmButtonText="Remove"
                confirmButtonVariant="danger"
            />
        </div>
    );
};

export default DevAdminStep;
