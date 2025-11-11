import React from 'react';
import { Student, Rating } from '../types';
import Card from './Card';

// Define and export the skills and rating scale so they can be used across components
export const AFFECTIVE_DOMAIN_SKILLS = ['Punctuality', 'Honesty', 'Self-Control', 'Neatness', 'Relationship with others'];
export const PSYCHOMOTOR_SKILLS = ['Handwriting', 'Sports & Games', 'Drawing & Painting', 'Musical Skills', 'Crafts'];
export const RATING_SCALE: Record<string, string> = { A: 'Excellent (A)', B: 'Good (B)', C: 'Fair (C)', D: 'Needs Improvement (D)', E: 'Poor (E)' };

interface BehavioralRatingsManagerProps {
    students: Student[];
    onStudentChange: (student: Student) => void;
}

const SkillRatingSelector: React.FC<{
    student: Student;
    skill: string;
    type: 'affective' | 'psychomotor';
    onStudentChange: (student: Student) => void;
}> = ({ student, skill, type, onStudentChange }) => {
    
    const domain = type === 'affective' ? 'affectiveDomain' : 'psychomotorSkills';
    const currentRating = student[domain]?.[skill] || '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRating = e.target.value as Rating;
        const updatedStudent = {
            ...student,
            [domain]: {
                ...(student[domain] || {}),
                [skill]: newRating
            }
        };
        onStudentChange(updatedStudent);
    };

    return (
        <select value={currentRating} onChange={handleChange} className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm">
            <option value="">- Select -</option>
            {Object.entries(RATING_SCALE).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
            ))}
        </select>
    );
};


const BehavioralRatingsManager: React.FC<BehavioralRatingsManagerProps> = ({ students, onStudentChange }) => {
    return (
        <Card title="Behavioral & Skill Ratings">
             <p className="text-sm text-slate-600 mb-4">Set the affective and psychomotor ratings for each student. These will appear on their report cards.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="p-3 text-left font-semibold sticky left-0 bg-slate-100 z-10">Student Name</th>
                            {AFFECTIVE_DOMAIN_SKILLS.map(skill => (
                                <th key={skill} className="p-3 text-center font-semibold">{skill}</th>
                            ))}
                            {PSYCHOMOTOR_SKILLS.map(skill => (
                                <th key={skill} className="p-3 text-center font-semibold">{skill}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-2 font-medium text-slate-800 sticky left-0 bg-white hover:bg-slate-50 z-10 whitespace-nowrap">{student.name}</td>
                                {AFFECTIVE_DOMAIN_SKILLS.map(skill => (
                                    <td key={skill} className="p-2 min-w-[150px]">
                                        <SkillRatingSelector student={student} skill={skill} type="affective" onStudentChange={onStudentChange} />
                                    </td>
                                ))}
                                {PSYCHOMOTOR_SKILLS.map(skill => (
                                    <td key={skill} className="p-2 min-w-[150px]">
                                        <SkillRatingSelector student={student} skill={skill} type="psychomotor" onStudentChange={onStudentChange} />
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

export default BehavioralRatingsManager;