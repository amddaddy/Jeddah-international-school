
import React, { useState, useEffect } from 'react';
import { Student, ScorePart, ScoreBreakdown } from '../types';
import Card from './Card';

interface ScoreEntryRowProps {
    student: Student;
    subject: string;
    onStudentChange: (student: Student) => void;
}

const ScoreEntryRow: React.FC<ScoreEntryRowProps> = ({ student, subject, onStudentChange }) => {
    
    const currentScores = student.scores[subject] || { firstCA: null, secondCA: null, exam: null };
    const [localScores, setLocalScores] = useState({
        firstCA: currentScores.firstCA === null ? '' : String(currentScores.firstCA),
        secondCA: currentScores.secondCA === null ? '' : String(currentScores.secondCA),
        exam: currentScores.exam === null ? '' : String(currentScores.exam),
    });

    const [errors, setErrors] = useState({ firstCA: false, secondCA: false, exam: false });

    useEffect(() => {
        setLocalScores({
            firstCA: currentScores.firstCA === null ? '' : String(currentScores.firstCA),
            secondCA: currentScores.secondCA === null ? '' : String(currentScores.secondCA),
            exam: currentScores.exam === null ? '' : String(currentScores.exam),
        });
    }, [student.scores, subject]);

    const validateScore = (part: keyof ScoreBreakdown, value: string): boolean => {
        if (value.toUpperCase() === 'ABS' || value === '') return true;
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0) return false;
        if (part === 'firstCA' || part === 'secondCA') return num <= 20;
        if (part === 'exam') return num <= 60;
        return true;
    };

    const handleLocalChange = (part: keyof ScoreBreakdown, value: string) => {
        setLocalScores(prev => ({ ...prev, [part]: value }));
    };

    const handleBlur = (part: keyof ScoreBreakdown) => {
        const value = localScores[part];
        const isValid = validateScore(part, value);
        setErrors(prev => ({ ...prev, [part]: !isValid }));

        if (isValid) {
            const newScores = { ...student.scores };
            const subjectScores = newScores[subject] || { firstCA: null, secondCA: null, exam: null };
            const numericValue = value.toUpperCase() === 'ABS' ? 'ABS' : (value === '' ? null : parseInt(value, 10));
            
            if(subjectScores[part] !== numericValue) {
                subjectScores[part] = numericValue;
                newScores[subject] = subjectScores;
                onStudentChange({ ...student, scores: newScores });
            }
        }
    };
    
    const getInputClass = (hasError: boolean) => {
        const baseClass = "w-full text-center px-1 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent";
        return hasError 
            ? `${baseClass} border-red-500 ring-red-500`
            : `${baseClass} border-slate-300 focus:ring-sky-500`;
    };


    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            <td className="p-3 font-medium text-slate-700">{student.name}</td>
            <td className="p-3">
                <input
                    type="text"
                    value={localScores.firstCA}
                    onChange={(e) => handleLocalChange('firstCA', e.target.value)}
                    onBlur={() => handleBlur('firstCA')}
                    placeholder="1st CA"
                    className={getInputClass(errors.firstCA)}
                />
            </td>
            <td className="p-3">
                <input
                    type="text"
                    value={localScores.secondCA}
                    onChange={(e) => handleLocalChange('secondCA', e.target.value)}
                    onBlur={() => handleBlur('secondCA')}
                    placeholder="2nd CA"
                    className={getInputClass(errors.secondCA)}
                />
            </td>
            <td className="p-3">
                <input
                    type="text"
                    value={localScores.exam}
                    onChange={(e) => handleLocalChange('exam', e.target.value)}
                    onBlur={() => handleBlur('exam')}
                    placeholder="Exam"
                    className={getInputClass(errors.exam)}
                />
            </td>
        </tr>
    );
};


interface ScoreEntryStepProps {
    students: Student[];
    subjects: string[];
    selectedSubject: string | null;
    onSelectSubject: (subject: string | null) => void;
    onStudentChange: (student: Student) => void;
    classInfo: { level: string; arm: string };
}

const ScoreEntryStep: React.FC<ScoreEntryStepProps> = ({
    students, subjects, selectedSubject, onSelectSubject, onStudentChange, classInfo
}) => {
    
    if (subjects.length === 0) {
        return (
             <Card title="Enter Subject Scores">
                <p className="text-slate-600">Please add subjects in 'Step 1: Class Setup' before entering scores.</p>
            </Card>
        )
    }

    return (
        <Card title={`Enter Scores for ${classInfo.level} ${classInfo.arm}`}>
            <div className="mb-6">
                <label htmlFor="subject-select" className="block text-sm font-medium text-slate-700 mb-1">
                    Select Subject to Enter Scores For:
                </label>
                <select
                    id="subject-select"
                    value={selectedSubject || ''}
                    onChange={(e) => onSelectSubject(e.target.value)}
                    className="w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                >
                    {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                    ))}
                </select>
            </div>

            {selectedSubject && (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="p-3 text-left font-semibold">Student Name</th>
                                <th className="p-3 text-center font-semibold">1st CA (20)</th>
                                <th className="p-3 text-center font-semibold">2nd CA (20)</th>
                                <th className="p-3 text-center font-semibold">Exam (60)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <ScoreEntryRow
                                    key={student.id}
                                    student={student}
                                    subject={selectedSubject}
                                    onStudentChange={onStudentChange}
                                />
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}
        </Card>
    );
};

export default React.memo(ScoreEntryStep);