
import React, { useState, useEffect } from 'react';
import { Student, ScorePart, ScoreBreakdown } from '../types';
import Card from './Card';
import ReportSettings from './ReportSettings';
import SparklesIcon from './icons/SparklesIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';
import PhotoIcon from './icons/PhotoIcon';
import { getScoreTotal } from '../utils';
import ConfirmationDialog from './ConfirmationDialog';
import BehavioralRatingsManager from './BehavioralRatingsManager';

interface FinalizeRowProps {
    student: Student;
    subjects: string[];
    onStudentChange: (student: Student) => void;
}

const formatScoreDisplay = (score: ScorePart) => {
    if (score === null) return '-';
    return String(score);
}

const FinalizeRow: React.FC<FinalizeRowProps> = React.memo(({ student, subjects, onStudentChange }) => {
    const [localAttendance, setLocalAttendance] = useState(student.totalAttendance);
    const [localRemark, setLocalRemark] = useState(student.remark || '');

    useEffect(() => {
        setLocalAttendance(student.totalAttendance);
        setLocalRemark(student.remark || '');
    }, [student.totalAttendance, student.remark]);

    const handleAttendanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalAttendance(e.target.value === '' ? 0 : parseInt(e.target.value, 10));
    };
    
    const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalRemark(e.target.value);
    };

    const handleBlur = () => {
        const newAttendance = isNaN(localAttendance) ? 0 : localAttendance;
        if (newAttendance !== student.totalAttendance || localRemark !== (student.remark || '')) {
            onStudentChange({ ...student, totalAttendance: newAttendance, remark: localRemark });
        }
    };
    
    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
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
                const scoreBreakdown = student.scores[subject];
                const total = getScoreTotal(scoreBreakdown);
                const s = scoreBreakdown || { firstCA: null, secondCA: null, exam: null };
                
                return (
                    <React.Fragment key={subject}>
                        <td className="p-2 text-center border-l border-slate-200">{formatScoreDisplay(s.firstCA)}</td>
                        <td className="p-2 text-center border-l border-slate-200">{formatScoreDisplay(s.secondCA)}</td>
                        <td className="p-2 text-center border-l border-slate-200">{formatScoreDisplay(s.exam)}</td>
                        <td className="p-2 text-center border-l border-slate-200 font-semibold bg-slate-50 hover:bg-slate-100">{total}</td>
                    </React.Fragment>
                );
            })}
            <td className="p-2 border-l border-slate-200">
                <input
                    type="number"
                    value={localAttendance === 0 ? '' : localAttendance}
                    onChange={handleAttendanceChange}
                    onBlur={handleBlur}
                    placeholder="Days"
                    className="w-20 text-center px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
            </td>
            <td className="p-2 border-l border-slate-200 min-w-[250px]">
                <textarea
                    value={localRemark}
                    onChange={handleRemarkChange}
                    onBlur={handleBlur}
                    placeholder="Enter remark..."
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    rows={2}
                />
            </td>
        </tr>
    );
});


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
        principalRemark: string;
        setPrincipalRemark: (remark: string) => void;
        totalSchoolDays: string;
        setTotalSchoolDays: (days: string) => void;
    };
    actions: {
        handleGenerateAIRemarks: () => void;
        handleGenerateReports: () => void;
        isGenerating: boolean;
        isGeneratingRemarks: boolean;
        handleGenerateSubjectReport: () => void;
        isGeneratingSubjectReport: boolean;
        selectedSubjectForReport: string;
        setSelectedSubjectForReport: (subject: string) => void;
        handleGenerateBroadsheet: () => void;
        isGeneratingBroadsheet: boolean;
    };
}

const FinalizeStep: React.FC<FinalizeStepProps> = ({ students, subjects, onStudentChange, classInfo, reportSettings, actions }) => {
    type ConfirmableAction = 'generateAIRemarks' | 'generateReports' | 'generateSubjectReport' | 'generateBroadsheet';
    const [confirmingAction, setConfirmingAction] = useState<ConfirmableAction | null>(null);

    const actionDetails: Record<ConfirmableAction, { title: string; message: string; action: () => void }> = {
        generateAIRemarks: {
            title: 'Confirm AI Remark Generation',
            message: 'This will use AI to generate remarks for all students without one. This may consume API credits. Proceed?',
            action: actions.handleGenerateAIRemarks
        },
        generateReports: {
            title: 'Confirm Report Card Generation',
            message: 'This will generate and download PDF report cards for all students. This can be a resource-intensive process. Are you ready to proceed?',
            action: actions.handleGenerateReports
        },
        generateSubjectReport: {
            title: 'Confirm Subject-Wise Report Generation',
            message: `This will generate and download a detailed PDF report for the selected subject: "${actions.selectedSubjectForReport}". Continue?`,
            action: actions.handleGenerateSubjectReport
        },
        generateBroadsheet: {
            title: 'Confirm Broadsheet Generation',
            message: 'This will generate and download a PDF broadsheet for the entire class. Are you sure?',
            action: actions.handleGenerateBroadsheet
        }
    };

    const handleConfirm = () => {
        if (confirmingAction) {
            actionDetails[confirmingAction].action();
            setConfirmingAction(null);
        }
    };

    const handleCancel = () => {
        setConfirmingAction(null);
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
                                    <th rowSpan={2} className="p-3 text-sm text-center font-semibold border-l border-slate-200 align-middle">Form Master's Remark</th>
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
                                {students.map(student => (
                                    <FinalizeRow 
                                        key={student.id} 
                                        student={student} 
                                        subjects={subjects} 
                                        onStudentChange={onStudentChange} 
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <BehavioralRatingsManager students={students} onStudentChange={onStudentChange} />
            </div>
            <aside className="space-y-8">
                <ReportSettings {...reportSettings} />
                <Card title="Actions">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-md font-semibold text-slate-700 mb-2 border-b pb-2">Student Reports</h3>
                             <div className="space-y-3">
                                <button
                                    onClick={() => setConfirmingAction('generateAIRemarks')}
                                    disabled={actions.isGeneratingRemarks || students.length === 0}
                                    className="w-full bg-violet-600 text-white px-4 py-2.5 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    {actions.isGeneratingRemarks ? <SpinnerIcon className="mr-2" /> : <SparklesIcon className="mr-2" />}
                                    {actions.isGeneratingRemarks ? 'Generating...' : 'Generate AI Remarks'}
                                </button>
                                <button
                                    onClick={() => setConfirmingAction('generateReports')}
                                    disabled={actions.isGenerating || students.length === 0}
                                    className="w-full bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    {actions.isGenerating ? <SpinnerIcon className="mr-2" /> : <DownloadIcon className="mr-2" />}
                                    {actions.isGenerating ? 'Generating...' : 'Download Report Cards (PDF)'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-slate-700 mb-2 border-b pb-2">Class-wide Reports</h3>
                             <div className="space-y-3">
                                 <div>
                                    <label htmlFor="subject-report-select" className="block text-sm font-medium text-slate-700 mb-1">
                                        Select Subject for Subject-Wise Report
                                    </label>
                                    <select
                                        id="subject-report-select"
                                        value={actions.selectedSubjectForReport}
                                        onChange={(e) => actions.setSelectedSubjectForReport(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        {subjects.map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => setConfirmingAction('generateSubjectReport')}
                                    disabled={actions.isGeneratingSubjectReport || students.length === 0 || subjects.length === 0}
                                    className="w-full bg-sky-600 text-white px-4 py-2.5 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    {actions.isGeneratingSubjectReport ? <SpinnerIcon className="mr-2" /> : <DownloadIcon className="mr-2" />}
                                    {actions.isGeneratingSubjectReport ? 'Generating...' : 'Download Subject-Wise Report'}
                                </button>
                                <button
                                    onClick={() => setConfirmingAction('generateBroadsheet')}
                                    disabled={actions.isGeneratingBroadsheet || students.length === 0}
                                    className="w-full bg-teal-600 text-white px-4 py-2.5 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    {actions.isGeneratingBroadsheet ? <SpinnerIcon className="mr-2" /> : <DownloadIcon className="mr-2" />}
                                    {actions.isGeneratingBroadsheet ? 'Generating...' : 'Download Broadsheet Result'}
                                </button>
                            </div>
                        </div>

                    </div>
                </Card>
            </aside>
            {confirmingAction && (
                <ConfirmationDialog
                    isOpen={!!confirmingAction}
                    onClose={handleCancel}
                    onConfirm={handleConfirm}
                    title={actionDetails[confirmingAction].title}
                    message={actionDetails[confirmingAction].message}
                    confirmButtonText="Proceed"
                />
            )}
        </div>
    );
};

export default React.memo(FinalizeStep);
