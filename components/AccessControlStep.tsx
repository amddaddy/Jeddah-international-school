
import React from 'react';
import { Permissions, Role, Permission } from '../types';
import Card from './Card';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import UserIcon from './icons/UserIcon';
import UserGroupIcon from './icons/UserGroupIcon';

interface AccessControlStepProps {
    permissions: Permissions;
    setPermissions: React.Dispatch<React.SetStateAction<Permissions>>;
}

const roleDetails: Record<Role, { name: string; icon: React.ReactNode }> = {
    admin: { name: 'Admin', icon: <ShieldCheckIcon className="w-6 h-6 text-slate-500" /> },
    teacher: { name: 'Teacher', icon: <AcademicCapIcon className="w-6 h-6 text-slate-500" /> },
    student: { name: 'Student', icon: <UserIcon className="w-6 h-6 text-slate-500" /> },
    parent: { name: 'Parent', icon: <UserGroupIcon className="w-6 h-6 text-slate-500" /> },
};

const permissionDetails: Record<Permission, { name: string }> = {
    dashboard: { name: 'Dashboard' },
    setup: { name: 'Setup (Class & Students)' },
    templates: { name: 'Templates' },
    scores: { name: 'Score Entry' },
    invoicing: { name: 'Invoicing' },
    payments: { name: 'Payments' },
    reports: { name: 'Report Generation' },
    guide: { name: 'System Guide' },
    access_control: { name: 'Access Control' },
};

const AccessControlStep: React.FC<AccessControlStepProps> = ({ permissions, setPermissions }) => {

    const handlePermissionChange = (role: Role, permission: Permission, value: boolean) => {
        if (role === 'admin') return; // Admins permissions cannot be changed
        setPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [permission]: value,
            },
        }));
    };

    const Toggle = ({ checked, onChange, disabled }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }) => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
            <div className={`w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}></div>
        </label>
    );

    return (
        <Card title="User Role & Access Management">
            <p className="mb-6 text-slate-600">
                Define permissions for each user role to ensure users only have access to necessary features.
                Admins have full access by default.
            </p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="p-4 font-semibold rounded-tl-lg">Role</th>
                            {Object.values(permissionDetails).map(p => (
                                <th key={p.name} className="p-4 font-semibold text-center">{p.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(Object.keys(permissions) as Role[]).map((role, roleIndex) => (
                            <tr key={role} className="border-b border-slate-200 last:border-b-0">
                                <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        {roleDetails[role].icon}
                                        <span>{roleDetails[role].name}</span>
                                    </div>
                                </td>
                                {(Object.keys(permissionDetails) as Permission[]).map(permission => (
                                    <td key={permission} className="p-4 text-center">
                                        <Toggle
                                            checked={permissions[role][permission]}
                                            onChange={(e) => handlePermissionChange(role, permission, e.target.checked)}
                                            disabled={role === 'admin'}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default AccessControlStep;
