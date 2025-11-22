
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Student, FeeItem, User } from '../types';
import Card from './Card';
import ClassSelector from './ClassSelector';
import SubjectsManager from './SubjectsManager';
import FeeStructureManager from './FeeStructureManager';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import PhotoIcon from './icons/PhotoIcon';
import XIcon from './icons/XIcon';
import ConfirmationDialog from './ConfirmationDialog';

interface StudentRowProps {
    student: Student;
    onStudentChange: (student: Student) => void;
    onRemoveStudent: (id: string) => void;
    isSeniorClass: boolean;
}

const StudentRow: React.FC<StudentRowProps> = React.memo(({ student, onStudentChange, onRemoveStudent, isSeniorClass }) => {
    const [localStudent, setLocalStudent] = useState(student);
    const commonInputClass = "w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent";

    useEffect(() => {
        if (student !== localStudent) {
             setLocalStudent(student);
        }
    }, [student]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let updatedValue: any = value;
        if (name === 'totalAttendance') {
            updatedValue = value === '' ? 0 : parseInt(value, 10);
        } else if (value === '') {
            updatedValue = undefined;
        }

        setLocalStudent(prev => ({ ...prev, [name]: updatedValue }));
    };

    const handleBlur = () => {
        // Only trigger update if something actually changed to avoid unnecessary re-renders
        if (JSON.stringify(localStudent) !== JSON.stringify(student)) {
            onStudentChange(localStudent);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const updatedStudent = { ...localStudent, photo: event.target?.result as string };
                setLocalStudent(updatedStudent);
                onStudentChange(updatedStudent);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleRemovePhoto = () => {
        const updatedStudent = { ...localStudent, photo: undefined };
        setLocalStudent(updatedStudent);
        onStudentChange(updatedStudent);
    };

    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            <td className="p-2 min-w-[200px]">
                <input type="text" name="name" value={localStudent.name} onChange={handleChange} onBlur={handleBlur} placeholder="Student Name" className={commonInputClass} />
            </td>
            <td className="p-2 min-w-[120px]">
                <input type="text" name="admissionNo" value={localStudent.admissionNo || ''} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. WPA0018" className={commonInputClass} />
            </td>
            <td className="p-2 min-w-[120px]">
                <select name="gender" value={localStudent.gender || ''} onChange={handleChange} onBlur={handleBlur} className={commonInputClass}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </td>
            {isSeniorClass && (
                <td className="p-2 min-w-[130px]">
                    <select name="stream" value={localStudent.stream || ''} onChange={handleChange} onBlur={handleBlur} className={commonInputClass}>
                        <option value="">Select Stream</option>
                        <option value="Science">Science</option>
                        <option value="Art">Art</option>
                        <option value="Commerce">Commerce</option>
                    </select>
                </td>
            )}
            <td className="p-2 min-w-[100px]">
                <input type="number" name="totalAttendance" value={localStudent.totalAttendance || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Days" className={commonInputClass} />
            </td>
            <td className="p-2 min-w-[200px]">
                <input type="text" name="parentName" value={localStudent.parentName || ''} onChange={handleChange} onBlur={handleBlur} placeholder="Parent's Name" className={commonInputClass} />
            </td>
            <td className="p-2">
                <div className="flex items-center justify-center space-x-2">
                    <label htmlFor={`photo-upload-${student.id}`} className="cursor-pointer group">
                        {localStudent.photo ? (
                            <img src={localStudent.photo} alt={localStudent.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 group-hover:opacity-75" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 group-hover:text-slate-500">
                                <PhotoIcon className="w-6 h-6" />
                            </div>
                        )}
                    </label>
                    <input id={`photo-upload-${student.id}`} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    {localStudent.photo && (
                    <button onClick={handleRemovePhoto} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50" aria-label="Remove photo">
                        <XIcon />
                    </button>
                    )}
                </div>
            </td>
            <td className="p-2 text-center">
                <button onClick={() => onRemoveStudent(student.id)} className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-full hover:bg-red-100" aria-label="Remove student">
                  <TrashIcon />
                </button>
            </td>
        </tr>
    );
});

interface SetupStepProps {
    levels: string[];
    arms: string[];
    selectedLevel: string;
    selectedArm: string;
    onLevelChange: (level: string) => void;
    onArmChange: (arm: string) => void;
    subjects: string[];
    setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
    onAddGlobalSubject: (name: string, category: 'Nursery' | 'Primary' | 'Junior' | 'Senior' | 'All', stream?: 'General' | 'Science' | 'Art' | 'Commerce') => void;
    students: Student[];
    onAddStudent: () => void;
    onRemoveStudent: (id: string) => void;
    onStudentChange: (student: Student) => void;
    feeItems: FeeItem[];
    setFeeItems: React.Dispatch<React.SetStateAction<FeeItem[]>>;
    selectedSection: 'Nursery' | 'Primary' | 'Junior' | 'Senior';
    onSectionChange: (section: 'Nursery' | 'Primary' | 'Junior' | 'Senior') => void;
    selectedStream: 'All' | 'Science' | 'Art' | 'Commerce';
    onStreamChange: (stream: 'All' | 'Science' | 'Art' | 'Commerce') => void;
    currentUser: User;
    totalSchoolDays: number;
    allowedSections: string[];
}

const SetupStep: React.FC<SetupStepProps> = ({
    levels, arms, selectedLevel, selectedArm, onLevelChange, onArmChange,
    subjects, setSubjects, onAddGlobalSubject,
    students, onAddStudent, onRemoveStudent, onStudentChange,
    feeItems, setFeeItems,
    selectedSection, onSectionChange, selectedStream, onStreamChange,
    currentUser,
    totalSchoolDays,
    allowedSections
}) => {
    const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const isSeniorClass = selectedSection === 'Senior';

    // Permission Checks
    const canManageSubjects = currentUser.permissions.manage_subjects;
    const canManageFees = currentUser.permissions.manage_fees;

    const handleRequestRemove = useCallback((id: string) => {
        setStudentToRemove(id);
    }, []);

    const handleConfirmRemove = () => {
        if (studentToRemove) {
            onRemoveStudent(studentToRemove);
            setStudentToRemove(null);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const searchLower = searchQuery.toLowerCase();
            const nameMatch = student.name.toLowerCase().includes(searchLower);
            const admissionNoMatch = student.admissionNo?.toLowerCase().includes(searchLower) ?? false;
            return nameMatch || admissionNoMatch;
        });
    }, [students, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <ClassSelector
            levels={levels}
            arms={arms}
            selectedLevel={selectedLevel}
            selectedArm={selectedArm}
            onLevelChange={onLevelChange}
            onArmChange={onArmChange}
            selectedSection={selectedSection}
            onSectionChange={onSectionChange}
            selectedStream={selectedStream}
            onStreamChange={onStreamChange}
            currentUser={currentUser}
            allowedSections={allowedSections}
        />
        <Card title="Student Roster">
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="student-search" className="sr-only">Search Students</label>
                    <input
                        id="student-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${students.length} students in this class...`}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                {totalSchoolDays > 0 && (
                     <div className="text-sm text-slate-500 font-medium bg-white px-3 py-2 rounded border">
                        Total School Days: <span className="font-bold text-slate-800">{totalSchoolDays}</span>
                     </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="p-3 text-left font-semibold">Student Name</th>
                            <th className="p-3 text-left font-semibold">Admission No.</th>
                            <th className="p-3 text-left font-semibold">Gender</th>
                            {isSeniorClass && <th className="p-3 text-left font-semibold">Stream</th>}
                            <th className="p-3 text-left font-semibold">Attendance</th>
                            <th className="p-3 text-left font-semibold">Parent's Name</th>
                            <th className="p-3 text-center font-semibold">Photo</th>
                            <th className="p-3 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <StudentRow 
                                    key={student.id}
                                    student={student}
                                    onStudentChange={onStudentChange}
                                    onRemoveStudent={handleRequestRemove}
                                    isSeniorClass={isSeniorClass}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isSeniorClass ? 8 : 7} className="text-center py-10 text-slate-500">
                                    No students in this class yet, or none match your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-between items-start">
                 <button onClick={onAddStudent} className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Student
                </button>
            </div>
        </Card>
        
        {(canManageSubjects || canManageFees) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {canManageSubjects && (
                    <SubjectsManager subjects={subjects} setSubjects={setSubjects} onAddSubject={onAddGlobalSubject} />
                )}
                {canManageFees && (
                    <FeeStructureManager feeItems={feeItems} setFeeItems={setFeeItems} />
                )}
            </div>
        )}
      </div>
       <ConfirmationDialog
            isOpen={!!studentToRemove}
            onClose={() => setStudentToRemove(null)}
            onConfirm={handleConfirmRemove}
            title="Confirm Student Removal"
            message={`Are you sure you want to remove the student "${students.find(s => s.id === studentToRemove)?.name}"? This action cannot be undone.`}
            confirmButtonText="Remove"
            confirmButtonVariant="danger"
        />
    </div>
  );
};

export default React.memo(SetupStep);