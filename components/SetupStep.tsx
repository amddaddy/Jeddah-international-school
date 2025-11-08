
import React, { useState, useEffect, useMemo } from 'react';
import { Student, FeeItem } from '../types';
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
}

const StudentRow: React.FC<StudentRowProps> = ({ student, onStudentChange, onRemoveStudent }) => {
    const [localStudent, setLocalStudent] = useState(student);
    const commonInputClass = "w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent";

    useEffect(() => {
        setLocalStudent(student);
    }, [student]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLocalStudent(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBlur = () => {
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
                <input type="text" name="admissionNo" value={localStudent.admissionNo} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. WPA0018" className={commonInputClass} />
            </td>
            <td className="p-2 min-w-[120px]">
                <select name="gender" value={localStudent.gender} onChange={handleChange} onBlur={handleBlur} className={commonInputClass}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </td>
            <td className="p-2 min-w-[150px]">
                <input type="date" name="dob" value={localStudent.dob} onChange={handleChange} onBlur={handleBlur} className={commonInputClass} />
            </td>
             <td className="p-2 min-w-[200px]">
                <input type="text" name="parentName" value={localStudent.parentName} onChange={handleChange} onBlur={handleBlur} placeholder="Parent's Name" className={commonInputClass} />
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
};

interface SetupStepProps {
    levels: string[];
    arms: string[];
    selectedLevel: string;
    selectedArm: string;
    onLevelChange: (level: string) => void;
    onArmChange: (arm: string) => void;
    subjects: string[];
    setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
    students: Student[];
    onAddStudent: () => void;
    onRemoveStudent: (id: string) => void;
    onStudentChange: (student: Student) => void;
    feeItems: FeeItem[];
    setFeeItems: React.Dispatch<React.SetStateAction<FeeItem[]>>;
}

const SetupStep: React.FC<SetupStepProps> = ({
    levels, arms, selectedLevel, selectedArm, onLevelChange, onArmChange,
    subjects, setSubjects,
    students, onAddStudent, onRemoveStudent, onStudentChange,
    feeItems, setFeeItems
}) => {
    const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female' | ''>('All');
    const [photoFilter, setPhotoFilter] = useState<'All' | 'Have Photo' | 'No Photo'>('All');


    const handleRequestRemove = (id: string) => {
        setStudentToRemove(id);
    };

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

            const genderMatch = genderFilter === 'All' || student.gender === genderFilter;

            const photoMatch = photoFilter === 'All' ||
                (photoFilter === 'Have Photo' && !!student.photo) ||
                (photoFilter === 'No Photo' && !student.photo);
                
            return (nameMatch || admissionNoMatch) && genderMatch && photoMatch;
        });
    }, [students, searchQuery, genderFilter, photoFilter]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <Card title="Student Roster">
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow w-full md:w-auto">
                    <label htmlFor="student-search" className="sr-only">Search Students</label>
                    <input
                        id="student-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or admission no..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-grow">
                        <label htmlFor="gender-filter" className="sr-only">Filter by Gender</label>
                        <select
                            id="gender-filter"
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="All">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div className="flex-grow">
                        <label htmlFor="photo-filter" className="sr-only">Filter by Photo</label>
                        <select
                            id="photo-filter"
                            value={photoFilter}
                            onChange={(e) => setPhotoFilter(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="All">All Photos</option>
                            <option value="Have Photo">Have Photo</option>
                            <option value="No Photo">No Photo</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="p-3 text-left font-semibold">Student Name</th>
                            <th className="p-3 text-left font-semibold">Admission No.</th>
                            <th className="p-3 text-left font-semibold">Gender</th>
                            <th className="p-3 text-left font-semibold">D.O.B</th>
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
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-slate-500">
                                    No students match your search criteria.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <ClassSelector
              levels={levels}
              arms={arms}
              selectedLevel={selectedLevel}
              selectedArm={selectedArm}
              onLevelChange={onLevelChange}
              onArmChange={onArmChange}
            />
            <SubjectsManager subjects={subjects} setSubjects={setSubjects} />
        </div>
        <FeeStructureManager feeItems={feeItems} setFeeItems={setFeeItems} />
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
