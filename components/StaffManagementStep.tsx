
import React, { useState } from 'react';
import { User } from '../types';
import Card from './Card';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationDialog from './ConfirmationDialog';
import AcademicCapIcon from './icons/AcademicCapIcon';

interface StaffManagementStepProps {
    staff: User[];
    onAddTeacher: (teacher: Omit<User, 'id' | 'role' | 'permissions' | 'schoolId'>) => boolean;
    onRemoveUser: (userId: string) => void;
    allLevels: string[];
    allArms: string[];
    allSubjects: string[];
}

const StaffManagementStep: React.FC<StaffManagementStepProps> = ({ staff, onAddTeacher, onRemoveUser, allLevels, allArms, allSubjects }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Form Master State
    const [isFormMaster, setIsFormMaster] = useState(false);
    const [assignedLevel, setAssignedLevel] = useState(allLevels[0] || 'SS 1');
    const [assignedArm, setAssignedArm] = useState(allArms[0] || 'A');

    // Subject Assignment State
    const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);

    const [userToRemove, setUserToRemove] = useState<User | null>(null);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            alert('Please fill all fields.');
            return;
        }

        const teacherData: any = { name, email, password, assignedSubjects };
        
        if (isFormMaster) {
            teacherData.assignedClass = {
                level: assignedLevel,
                arm: assignedArm
            };
        }

        const success = onAddTeacher(teacherData);
        if (success) {
            setName('');
            setEmail('');
            setPassword('');
            setIsFormMaster(false);
            setAssignedSubjects([]);
        }
    };

    const handleSubjectToggle = (subject: string) => {
        setAssignedSubjects(prev => 
            prev.includes(subject) 
                ? prev.filter(s => s !== subject) 
                : [...prev, subject]
        );
    };

    const handleRequestRemove = (user: User) => {
        setUserToRemove(user);
    };

    const handleConfirmRemove = () => {
        if (userToRemove) {
            onRemoveUser(userToRemove.id);
            setUserToRemove(null);
        }
    };
    
    const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Staff List (Teachers)">
                <p className="text-sm text-slate-600 mb-4">
                    Below is a list of teachers registered to your school. Form Masters have access to manage students in their assigned class.
                </p>
                {staff.length > 0 ? (
                    <ul className="space-y-3">
                        {staff.map(user => (
                            <li key={user.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md border">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-slate-800">{user.name}</p>
                                        {user.assignedClass && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                <AcademicCapIcon className="w-3 h-3 mr-1" />
                                                {user.assignedClass.level} {user.assignedClass.arm}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                    {user.assignedSubjects && user.assignedSubjects.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {user.assignedSubjects.map(s => (
                                                <span key={s} className="text-[10px] bg-slate-200 text-slate-700 px-1.5 rounded">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleRequestRemove(user)}
                                    className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100"
                                    aria-label={`Remove ${user.name}`}
                                >
                                    <TrashIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-center py-4">No teachers registered yet.</p>
                )}
            </Card>

            <Card title="Register New Teacher">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="teacher-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input id="teacher-name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required placeholder="e.g. Mr. John Doe" />
                    </div>
                     <div>
                        <label htmlFor="teacher-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input id="teacher-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} required placeholder="e.g. teacher@school.com" />
                    </div>
                     <div>
                        <label htmlFor="teacher-password"  className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
                        <input id="teacher-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} required />
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="flex items-center mb-2">
                            <input
                                id="is-form-master"
                                type="checkbox"
                                checked={isFormMaster}
                                onChange={(e) => setIsFormMaster(e.target.checked)}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is-form-master" className="ml-2 block text-sm text-slate-900 font-medium">
                                Assign as Form Master?
                            </label>
                        </div>
                        
                        {isFormMaster && (
                            <div className="grid grid-cols-2 gap-3 mt-3 pl-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Level</label>
                                    <select value={assignedLevel} onChange={(e) => setAssignedLevel(e.target.value)} className={inputClass}>
                                        {allLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Arm</label>
                                     <select value={assignedArm} onChange={(e) => setAssignedArm(e.target.value)} className={inputClass}>
                                        {allArms.map(arm => <option key={arm} value={arm}>{arm}</option>)}
                                    </select>
                                </div>
                                <p className="col-span-2 text-xs text-slate-500 italic mt-1">
                                    * Form Masters can add/edit students for this class.
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="block text-sm font-medium text-slate-900 mb-2">Assign Subjects (Optional)</p>
                        <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {allSubjects.length > 0 ? allSubjects.map(subject => (
                                <label key={subject} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={assignedSubjects.includes(subject)}
                                        onChange={() => handleSubjectToggle(subject)}
                                        className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                    />
                                    <span className="text-xs text-slate-700">{subject}</span>
                                </label>
                            )) : <p className="text-xs text-slate-400 italic">No subjects available. Add some in setup.</p>}
                        </div>
                        <p className="text-xs text-slate-500 italic mt-2">
                            * Teacher will only be able to enter scores for selected subjects.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-sky-600 text-white px-4 py-2.5 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center justify-center"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" /> Register Teacher
                    </button>
                </form>
            </Card>

             <ConfirmationDialog
                isOpen={!!userToRemove}
                onClose={() => setUserToRemove(null)}
                onConfirm={handleConfirmRemove}
                title="Remove Teacher Account"
                message={`Are you sure you want to remove "${userToRemove?.name}"? They will no longer be able to log in.`}
                confirmButtonText="Remove"
                confirmButtonVariant="danger"
            />
        </div>
    );
};

export default StaffManagementStep;
