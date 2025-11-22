
import React, { useState, useEffect, useMemo } from 'react';
import { Student, ScorePart, ScoreBreakdown, User } from '../types';
import Card from './Card';
import ClassSelector from './ClassSelector';
import { getSubjectsForStudent } from '../utils';

interface ScoreEntryRowProps {
    student: Student;
    subject: string;
    onStudentChange: (student: Student) => void;
    isSubjectApplicable: boolean;
}

const ScoreEntryRow: React.FC<ScoreEntryRowProps> = React.memo(({ student, subject, onStudentChange, isSubjectApplicable }) => {
    
    // OPTIMIZATION: Isolate the specific subject scores.
    // We use this specific object as the dependency for the useEffect below.
    // This prevents re-renders if 'student.scores' changes reference but this specific subject didn't change.
    const subjectScores = student.scores[subject];

    const [localScores, setLocalScores] = useState({
        firstCA: subjectScores?.firstCA === null || subjectScores?.firstCA === undefined ? '' : String(subjectScores.firstCA),
        secondCA: subjectScores?.secondCA === null || subjectScores?.secondCA === undefined ? '' : String(subjectScores.secondCA),
        exam: subjectScores?.exam === null || subjectScores?.exam === undefined ? '' : String(subjectScores.exam),
    });

    const [errors, setErrors] = useState({ firstCA: false, secondCA: false, exam: false });

    // OPTIMIZATION: Only sync state if the SPECIFIC subject scores change from the parent.
    useEffect(() => {
        setLocalScores({
            firstCA: subjectScores?.firstCA === null || subjectScores?.firstCA === undefined ? '' : String(subjectScores.firstCA),
            secondCA: subjectScores?.secondCA === null || subjectScores?.secondCA === undefined ? '' : String(subjectScores.secondCA),
            exam: subjectScores?.exam === null || subjectScores?.exam === undefined ? '' : String(subjectScores.exam),
        });
        setErrors({ firstCA: false, secondCA: false, exam: false });
    }, [subjectScores]);

    const validateScore = (part: keyof ScoreBreakdown, value: string): boolean => {
        const upperValue = value.trim().toUpperCase();
        if (upperValue === 'ABS' || upperValue === '') {
            return true;
        }

        if (!/^\d+$/.test(value.trim())) {
            return false;
        }
        
        const num = parseInt(value.trim(), 10);
        if (isNaN(num)) return false;

        if (part === 'firstCA' || part === 'secondCA') {
            return num <= 20;
        }
        
        if (part === 'exam') {
            return num <= 60;
        }

        return false;
    };

    const handleLocalChange = (part: keyof ScoreBreakdown, value: string) => {
        setLocalScores(prev => ({ ...prev, [part]: value }));
        const isValid = validateScore(part, value);
        setErrors(prev => ({ ...prev, [part]: !isValid }));
    };

    const handleBlur = (part: keyof ScoreBreakdown) => {
        const value = localScores[part];
        const isValid = validateScore(part, value);
        setErrors(prev => ({ ...prev, [part]: !isValid }));

        if (isValid) {
            // Deep check to avoid triggering parent update if value hasn't actually changed numerically
            const trimmedValue = value.trim();
            const upperValue = trimmedValue.toUpperCase();
            const numericValue = upperValue === 'ABS' ? 'ABS' : (trimmedValue === '' ? null : parseInt(trimmedValue, 10));
            
            const currentPartValue = subjectScores?.[part] ?? null;

            if (currentPartValue !== numericValue) {
                const newScores = { ...student.scores };
                const newSubjectScores = { ...(newScores[subject] || { firstCA: null, secondCA: null, exam: null }) };
                
                newSubjectScores[part] = numericValue;
                newScores[subject] = newSubjectScores;
                
                onStudentChange({ ...student, scores: newScores });
            }
        }
    };
    
    const getInputClass = (hasError: boolean) => {
        const baseClass = "w-full text-center px-1 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed";
        return hasError 
            ? `${baseClass} border-red-500 ring-red-500`
            : `${baseClass} border-slate-300 focus:ring-sky-500`;
    };

    return (
        <tr className={`border-b border-slate-200 ${isSubjectApplicable ? 'hover:bg-slate-50' : 'bg-slate-50 text-slate-400'}`}>
            <td className="p-3 font-medium">{student.name} {student.stream && `(${student.stream})`}</td>
            <td className="p-3">
                <input
                    type="text"
                    value={isSubjectApplicable ? localScores.firstCA : ''}
                    onChange={(e) => handleLocalChange('firstCA', e.target.value)}
                    onBlur={() => handleBlur('firstCA')}
                    placeholder="-"
                    className={getInputClass(errors.firstCA)}
                    disabled={!isSubjectApplicable}
                />
            </td>
            <td className="p-3">
                <input
                    type="text"
                    value={isSubjectApplicable ? localScores.secondCA : ''}
                    onChange={(e) => handleLocalChange('secondCA', e.target.value)}
                    onBlur={() => handleBlur('secondCA')}
                    placeholder="-"
                    className={getInputClass(errors.secondCA)}
                    disabled={!isSubjectApplicable}
                />
            </td>
            <td className="p-3">
                <input
                    type="text"
                    value={isSubjectApplicable ? localScores.exam : ''}
                    onChange={(e) => handleLocalChange('exam', e.target.value)}
                    onBlur={() => handleBlur('exam')}
                    placeholder="-"
                    className={getInputClass(errors.exam)}
                    disabled={!isSubjectApplicable}
                />
            </td>
        </tr>
    );
}); // End React.memo

interface AttendanceEntryRowProps {
    student: Student;
    totalSchoolDays: number;
    onStudentChange: (student: Student) => void;
}

const AttendanceEntryRow: React.FC<AttendanceEntryRowProps> = React.memo(({ student, totalSchoolDays, onStudentChange }) => {
    const [attendance, setAttendance] = useState(String(student.totalAttendance || ''));

    useEffect(() => {
        setAttendance(String(student.totalAttendance || ''));
    }, [student.totalAttendance]);

    const handleChange = (val: string) => {
        if (val === '' || /^\d+$/.test(val)) {
            setAttendance(val);
        }
    };

    const handleBlur = () => {
        const num = parseInt(attendance, 10);
        const validNum = isNaN(num) ? 0 : num;
        
        if (totalSchoolDays > 0 && validNum > totalSchoolDays) {
            alert(`Attendance cannot exceed total school days (${totalSchoolDays}).`);
            setAttendance(String(student.totalAttendance || ''));
            return;
        }

        if (validNum !== student.totalAttendance) {
            onStudentChange({ ...student, totalAttendance: validNum });
        }
    };

    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            <td className="p-3 font-medium text-slate-800">{student.name}</td>
            <td className="p-3 flex items-center justify-center">
                <input
                    type="text"
                    value={attendance}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    className="w-24 text-center px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder={`Max ${totalSchoolDays}`}
                />
            </td>
             <td className="p-3 text-center text-sm text-slate-600">
                {attendance && totalSchoolDays > 0 ? `${Math.round((parseInt(attendance || '0') / totalSchoolDays) * 100)}%` : '-'}
            </td>
        </tr>
    );
});


interface ScoreEntryStepProps {
    students: Student[];
    subjects: string[];
    subjectStreamMap: Record<string, string>;
    selectedSubject: string | null;
    onSelectSubject: (subject: string | null) => void;
    onStudentChange: (student: Student) => void;
    classInfo: { level: string; arm: string };
    selectedSection: 'Nursery' | 'Primary' | 'Junior' | 'Senior';
    totalSchoolDays: number;
    currentUser: User;
    levels: string[];
    arms: string[];
    selectedLevel: string;
    selectedArm: string;
    onLevelChange: (level: string) => void;
    onArmChange: (arm: string) => void;
    onSectionChange: (section: 'Nursery' | 'Primary' | 'Junior' | 'Senior') => void;
    selectedStream: 'All' | 'Science' | 'Art' | 'Commerce';
    onStreamChange: (stream: 'All' | 'Science' | 'Art' | 'Commerce') => void;
    allowedSections: string[];
}

const ScoreEntryStep: React.FC<ScoreEntryStepProps> = ({
    students, subjects, subjectStreamMap, selectedSubject, onSelectSubject, onStudentChange, classInfo, selectedSection, totalSchoolDays, currentUser,
    levels, arms, selectedLevel, selectedArm, onLevelChange, onArmChange, onSectionChange, selectedStream, onStreamChange, allowedSections
}) => {
    
    const canRegisterAttendance = currentUser.role === 'admin' || currentUser.role === 'dev_admin' || (currentUser.role === 'teacher' && !!currentUser.assignedClass);

    // Prepare props for ScoreEntryRow outside the map to ensure referential stability where possible
    // Though standard props here are mostly primitives or stable functions
    
    return (
        <div className="space-y-6">
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
        
            <Card title={selectedSubject === 'ATTENDANCE_REGISTRY' ? `Register Attendance` : `Enter Scores`}>
                {subjects.length === 0 ? (
                     <div className="text-center py-8">
                        <p className="text-slate-600 mb-2">
                            {currentUser.role === 'teacher' 
                                ? "No assigned subjects found for this class." 
                                : "No subjects have been added for this class yet."}
                        </p>
                        {currentUser.role === 'teacher' && (
                            <p className="text-xs text-slate-500">Switch to a different class above if you teach subjects elsewhere.</p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <label htmlFor="subject-select" className="block text-sm font-medium text-slate-700 mb-1">
                                Select Subject or Activity:
                            </label>
                            <select
                                id="subject-select"
                                value={selectedSubject || ''}
                                onChange={(e) => onSelectSubject(e.target.value)}
                                className="w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 font-medium text-slate-700"
                            >
                                <option value="">-- Select Subject --</option>
                                {canRegisterAttendance && (
                                    <optgroup label="Administrative">
                                        <option value="ATTENDANCE_REGISTRY">📝 Register Attendance</option>
                                    </optgroup>
                                )}
                                <optgroup label="Subjects">
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {selectedSubject === 'ATTENDANCE_REGISTRY' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            <th className="p-3 text-left font-semibold w-1/2">Student Name</th>
                                            <th className="p-3 text-center font-semibold">Days Present (Out of {totalSchoolDays})</th>
                                            <th className="p-3 text-center font-semibold">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length > 0 ? students.map(student => (
                                            <AttendanceEntryRow
                                                key={student.id}
                                                student={student}
                                                totalSchoolDays={totalSchoolDays}
                                                onStudentChange={onStudentChange}
                                            />
                                        )) : (
                                            <tr><td colSpan={3} className="text-center py-4 text-slate-500">No students found in this class.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : selectedSubject ? (
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
                                        {students.length > 0 ? students.map(student => {
                                            // Calculate subject applicability once here to pass down
                                            const studentSubjects = getSubjectsForStudent(student, selectedSection, subjects, subjectStreamMap);
                                            const isSubjectApplicable = studentSubjects.includes(selectedSubject);
                                            
                                            return (
                                                <ScoreEntryRow
                                                    key={student.id}
                                                    student={student}
                                                    subject={selectedSubject}
                                                    onStudentChange={onStudentChange}
                                                    isSubjectApplicable={isSubjectApplicable}
                                                />
                                            );
                                        }) : (
                                            <tr><td colSpan={4} className="text-center py-4 text-slate-500">No students found in this class.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 italic">
                                Select a subject or 'Register Attendance' from the dropdown above to begin.
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default React.memo(ScoreEntryStep);