import React from 'react';
import { Student, ScorePart } from '../types';
import Card from './Card';
import ReportSettings from './ReportSettings';
import SparklesIcon from './icons/SparklesIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';
import PhotoIcon from './icons/PhotoIcon';

interface FinalizeStepProps {
    students: Student[];
    subjects: string[];
    onStudentChange: (student: Student) => void;
    classInfo: { level: string; arm: string };
    reportSettings: {
        nextTermBegins: string;
        setNextTermBegins: (date: string) => void;
        term: string;
        setTerm: (term: string) => void;
        session: string;
        setSession: (session: string) => void;
        principalName: string;
        setPrincipalName: (name: string) => void;
        totalSchoolDays: string;
        setTotalSchoolDays: (days: string) => void;
    };
    actions: {
        handleGenerateAIRemarks: () => void;
        handleGenerateReports: () => void;
        isGenerating: boolean;
        isGeneratingRemarks: boolean;
    };
}

const FinalizeStep: React.FC<FinalizeStepProps> = ({ students, subjects, onStudentChange, classInfo, reportSettings, actions }) => {

    const formatScoreDisplay = (score: ScorePart) => {
        if (score === null) return '-';
        return String(score);
    }
    
    const handleAttendanceChange = (student: Student, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
        onStudentChange({ ...student, totalAttendance: isNaN(value) ? 0 : value });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card title={`Final Scoresheet for ${classInfo.level} ${classInfo.arm}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                             <thead className="bg-slate-100 text-slate-600 text-xs">
                                <tr>
                                    <th rowSpan={2} className="p-3 text-sm text-left font-semibold sticky left-0 bg-slate-100 z-10 align-middle">Student Name</th>
                                    {subjects.map(subject => (
                                        <th key={subject} colSpan={4} className="p-2 text-center font-semibold border-l border-slate-200 text-sm">{subject}</th>
                                    ))}
                                    <th rowSpan={2} className="p-3 text-sm text-center font-semibold border-l border-slate-200 align-middle">Attendance</th>
                                    <th rowSpan={2} className="p-3 text-sm text-center font-semibold border-l border-slate-200 align-middle">Remark</th>
                                </tr>
                                <tr>
                                    {subjects.map(subject => (
                                        <React.Fragment key={`${subject}-scores`}>
                                            <th className="p-2 text-center font-medium border-l border-slate-200">1st CA</th>
                                            <th className="p-2 text-center font-medium border-l border-slate-200">2nd CA</th>
                                            <th className="p-2 text-center font-medium border-l border-slate-200">Exam</th>
                                            <th className="p-2 text-center font-semibold border-l border-slate-200 bg-slate-200">Total</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => {
                                    return (
                                        <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="p-2 font-medium text-slate-800 sticky left-0 bg-white hover:bg-slate-50 z-10 flex items-center gap-2">
                                                {student.photo ? (
                                                    <img src={student.photo} alt={student.name} className="w-8 h-8 rounded-full object-cover"/>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                                        <PhotoIcon className="w-4 h-4" />
                                                    </div>
                                                )}
                                                {student.name}
                                            </td>
                                            {subjects.map(subject => {
                                                const s = student.scores[subject] || {};
                                                const firstCA = s.firstCA;
                                                const secondCA = s.secondCA;
                                                const exam = s.exam;

                                                const firstCANum = firstCA === 'ABS' || firstCA === null ? 0 : firstCA;
                                                const secondCANum = secondCA === 'ABS' || secondCA === null ? 0 : secondCA;
                                                const examNum = exam === 'ABS' || exam === null ? 0 : exam;
                                                const total = firstCANum + secondCANum + examNum;
                                                
                                                return (
                                                    <React.Fragment key={subject}>
                                                        <td className="p-2 text-center border-l border-slate-200">{formatScoreDisplay(firstCA)}</td>
                                                        <td className="p-2 text-center border-l border-slate-200">{formatScoreDisplay(secondCA)}</td>
                                                        <td className="p-2 text-center border-l border-slate-200">{formatScoreDisplay(exam)}</td>
                                                        <td className="p-2 text-center border-l border-slate-200 font-semibold bg-slate-50 hover:bg-slate-100">{total}</td>
                                                    </React.Fragment>
                                                );
                                            })}
                                            <td className="p-2 border-l border-slate-200">
                                                <input
                                                    type="number"
                                                    value={student.totalAttendance === 0 ? '' : student.totalAttendance}
                                                    onChange={(e) => handleAttendanceChange(student, e)}
                                                    placeholder="Days"
                                                    className="w-20 text-center px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                                />
                                            </td>
                                            <td className="p-2 border-l border-slate-200">
                                                <textarea
                                                    value={student.remark || ''}
                                                    onChange={(e) => onStudentChange({ ...student, remark: e.target.value })}
                                                    placeholder="Enter remark..."
                                                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                                    rows={2}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <aside className="space-y-8">
                <ReportSettings {...reportSettings} />
                <Card title="Actions">
                    <div className="space-y-3">
                        <button
                            onClick={actions.handleGenerateAIRemarks}
                            disabled={actions.isGeneratingRemarks || students.length === 0}
                            className="w-full bg-violet-600 text-white px-4 py-2.5 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {actions.isGeneratingRemarks ? <SpinnerIcon className="mr-2" /> : <SparklesIcon className="mr-2" />}
                            {actions.isGeneratingRemarks ? 'Generating...' : 'Generate AI Remarks'}
                        </button>
                        <button
                            onClick={actions.handleGenerateReports}
                            disabled={actions.isGenerating || students.length === 0}
                            className="w-full bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {actions.isGenerating ? <SpinnerIcon className="mr-2" /> : <DownloadIcon className="mr-2" />}
                            {actions.isGenerating ? 'Generating...' : 'Download Report Cards (PDF)'}
                        </button>
                    </div>
                </Card>
            </aside>
        </div>
    );
};

export default FinalizeStep;