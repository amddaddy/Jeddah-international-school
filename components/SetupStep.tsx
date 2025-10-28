import React from 'react';
import { Student } from '../types';
import Card from './Card';
import ClassSelector from './ClassSelector';
import SubjectsManager from './SubjectsManager';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import PhotoIcon from './icons/PhotoIcon';
import XIcon from './icons/XIcon';

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
}

const SetupStep: React.FC<SetupStepProps> = ({
    levels, arms, selectedLevel, selectedArm, onLevelChange, onArmChange,
    subjects, setSubjects,
    students, onAddStudent, onRemoveStudent, onStudentChange
}) => {

  const handlePhotoChange = (student: Student, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            onStudentChange({ ...student, photo: event.target?.result as string });
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card title="Student Roster">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="p-3 text-left font-semibold w-full">Student Name</th>
                            <th className="p-3 text-center font-semibold">Photo</th>
                            <th className="p-3 text-center font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-3">
                                    <input
                                        type="text"
                                        value={student.name}
                                        onChange={(e) => onStudentChange({ ...student, name: e.target.value })}
                                        placeholder="Enter Student Name"
                                        className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    />
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center justify-center space-x-2">
                                        <label htmlFor={`photo-upload-${student.id}`} className="cursor-pointer group">
                                            {student.photo ? (
                                                <img src={student.photo} alt={student.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 group-hover:opacity-75" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 group-hover:text-slate-500">
                                                    <PhotoIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </label>
                                        <input id={`photo-upload-${student.id}`} type="file" accept="image/*" onChange={(e) => handlePhotoChange(student, e)} className="hidden" />
                                        {student.photo && (
                                        <button
                                            onClick={() => onStudentChange({ ...student, photo: undefined })}
                                            className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                                            aria-label="Remove photo"
                                        >
                                            <XIcon />
                                        </button>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <button
                                    onClick={() => onRemoveStudent(student.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-full hover:bg-red-100"
                                    aria-label="Remove student"
                                    >
                                    <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6">
                <button
                    onClick={onAddStudent}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-1" /> Add Student
                </button>
            </div>
        </Card>
      </div>
      <aside className="space-y-8">
        <ClassSelector
          levels={levels}
          arms={arms}
          selectedLevel={selectedLevel}
          selectedArm={selectedArm}
          onLevelChange={onLevelChange}
          onArmChange={onArmChange}
        />
        <SubjectsManager subjects={subjects} setSubjects={setSubjects} />
      </aside>
    </div>
  );
};

export default SetupStep;
