
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SCHOOL_LOGO_BASE64 } from '../components/assets';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { Role } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

const availableLevels = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
const availableArms = ['A', 'B', 'C', 'D', 'E'];
const availableSubjects = ['English Studies', 'Mathematics', 'Basic Science', 'Basic Technology', 'Computer Studies', 'PHE', 'Social Studies', 'Civic Education', 'Security Education', 'Agricultural Science', 'Home Economics', 'Business Studies', 'Keyboarding', 'CCA', 'History', 'CRS'];

interface Assignment {
    classKey: string;
    subjects: string[];
}

interface AssignmentRowProps {
    assignment: Assignment;
    index: number;
    onUpdate: (index: number, updatedAssignment: Assignment) => void;
    onRemove: (index: number) => void;
}

const AssignmentRow: React.FC<AssignmentRowProps> = ({ assignment, index, onUpdate, onRemove }) => {
    const [level, arm] = assignment.classKey.split('-');
    const [subjectsOpen, setSubjectsOpen] = useState(false);

    const handleClassChange = (newLevel: string, newArm: string) => {
        onUpdate(index, { ...assignment, classKey: `${newLevel}-${newArm}` });
    };

    const handleSubjectChange = (subject: string, isChecked: boolean) => {
        const newSubjects = isChecked
            ? [...assignment.subjects, subject]
            : assignment.subjects.filter(s => s !== subject);
        onUpdate(index, { ...assignment, subjects: newSubjects });
    };

    return (
        <div className="p-3 bg-slate-50 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
                <select value={level} onChange={e => handleClassChange(e.target.value, arm)} className="w-full px-2 py-1.5 border border-slate-300 rounded-md">
                    {availableLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={arm} onChange={e => handleClassChange(level, e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded-md">
                    {availableArms.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100">
                    <TrashIcon />
                </button>
            </div>
            <div>
                <button type="button" onClick={() => setSubjectsOpen(!subjectsOpen)} className="text-sm font-medium text-sky-600 hover:text-sky-800 w-full text-left p-1">
                    {assignment.subjects.length > 0 ? `${assignment.subjects.length} subjects selected` : 'Select Subjects'}
                </button>
                {subjectsOpen && (
                    <div className="mt-1 p-2 border rounded-md max-h-40 overflow-y-auto grid grid-cols-2 gap-1 bg-white">
                        {availableSubjects.map(subject => (
                            <label key={subject} className="flex items-center text-sm space-x-2 p-1 rounded hover:bg-slate-100">
                                <input
                                    type="checkbox"
                                    checked={assignment.subjects.includes(subject)}
                                    onChange={e => handleSubjectChange(subject, e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                <span>{subject}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('teacher');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    
    const [assignedClasses, setAssignedClasses] = useState<Assignment[]>([{ classKey: 'JSS 1-A', subjects: [] }]);

    const handleUpdateAssignment = (index: number, updatedAssignment: Assignment) => {
        const newAssignments = [...assignedClasses];
        newAssignments[index] = updatedAssignment;
        setAssignedClasses(newAssignments);
    };

    const handleAddAssignment = () => {
        setAssignedClasses([...assignedClasses, { classKey: 'JSS 1-A', subjects: [] }]);
    };

    const handleRemoveAssignment = (index: number) => {
        setAssignedClasses(assignedClasses.filter((_, i) => i !== index));
    };

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
        if (role === 'teacher' && assignedClasses.some(ac => ac.subjects.length === 0)) {
            setError('Each assigned class must have at least one subject selected.');
            setIsLoading(false);
            return;
        }

        try {
            const teacherAssignments = role === 'teacher' ? assignedClasses : undefined;
            await register(name, email, password, role, teacherAssignments);
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
                            <option value="accountant">Accountant</option>
                            <option value="student">Student</option>
                            <option value="parent">Parent</option>
                        </select>
                         <p className="text-xs text-slate-500 mt-1">Admin accounts must be created by the system administrator.</p>
                    </div>

                    {role === 'teacher' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Class & Subject Assignments</label>
                            <div className="space-y-3">
                                {assignedClasses.map((assignment, index) => (
                                    <AssignmentRow 
                                        key={index}
                                        assignment={assignment}
                                        index={index}
                                        onUpdate={handleUpdateAssignment}
                                        onRemove={handleRemoveAssignment}
                                    />
                                ))}
                            </div>
                            <button type="button" onClick={handleAddAssignment} className="mt-2 text-sm text-sky-600 hover:text-sky-800 font-medium flex items-center">
                                <PlusIcon className="w-4 h-4 mr-1" /> Add another class
                            </button>
                        </div>
                    )}
                    
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