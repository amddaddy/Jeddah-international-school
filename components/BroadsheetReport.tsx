import React, { forwardRef, useMemo } from 'react';
import { Student, Result, BroadsheetTemplateSettings } from '../types';
import { getScoreTotal, getGradeInfo } from '../utils';

interface BroadsheetReportProps {
    students: Student[];
    subjects: string[];
    results: Result[];
    classInfo: { level: string; arm: string; session: string; term: string };
    aiAnalysis: string;
    templateSettings: BroadsheetTemplateSettings;
    schoolName: string;
}

const BroadsheetReport = forwardRef<HTMLDivElement, BroadsheetReportProps>(({ students, subjects, results, classInfo, aiAnalysis, templateSettings, schoolName }, ref) => {
    
    const subjectStats = useMemo(() => {
        const stats: Record<string, { highest: number; lowest: number; average: number }> = {};
        subjects.forEach(subject => {
            const scores = students.map(s => getScoreTotal(s.scores[subject])).filter(score => score !== null) as number[];
            if (scores.length > 0) {
                stats[subject] = {
                    highest: Math.max(...scores),
                    lowest: Math.min(...scores),
                    average: scores.reduce((a, b) => a + b, 0) / scores.length,
                };
            } else {
                 stats[subject] = { highest: 0, lowest: 0, average: 0 };
            }
        });
        return stats;
    }, [students, subjects]);

    const summaryStats = useMemo(() => {
        const totalStudents = results.length;
        if (totalStudents === 0) return null;

        const passedStudents = results.filter(r => r.average >= 40).length;
        const failedStudents = totalStudents - passedStudents;
        
        const performanceBands = {
            exceptional: results.filter(r => r.average >= 80).length,
            veryGood: results.filter(r => r.average >= 70 && r.average < 80).length,
            good: results.filter(r => r.average >= 60 && r.average < 70).length,
            fair: results.filter(r => r.average >= 50 && r.average < 60).length,
            poor: results.filter(r => r.average < 50).length,
        };

        return { totalStudents, passedStudents, failedStudents, ...performanceBands };
    }, [results]);

    if (results.length === 0) return null;

    return (
        <div ref={ref}>
            {/* Page 1: Broadsheet Table */}
            <div className="broadsheet-page p-4 bg-white text-black font-['Arial']" style={{ width: '297mm', minHeight: '210mm', boxSizing: 'border-box' }}>
                <div className="text-center mb-2">
                    <h1 className="text-xl font-bold uppercase">{schoolName}</h1>
                    <h2 className="text-lg font-semibold">Broadsheet Result</h2>
                    <p className="text-sm">Class: {classInfo.level} {classInfo.arm} | Session: {classInfo.session} | Term: {classInfo.term}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] border-collapse border border-black">
                        <thead className="bg-gray-200 font-bold">
                            <tr>
                                <th className="p-1.5 border border-black">S/N</th>
                                <th className="p-1.5 border border-black">Student Details</th>
                                {subjects.map(s => <th key={s} className="p-1.5 border border-black">{s.split(' ').map(w=>w[0]).join('')}</th>)}
                                <th className="p-1.5 border border-black">Total Score</th>
                                <th className="p-1.5 border border-black">Average Score</th>
                                <th className="p-1.5 border border-black">Position</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result, index) => {
                                const student = students.find(s => s.id === result.studentId);
                                return (
                                    <tr key={result.studentId}>
                                        <td className="p-1.5 border border-black text-center">{index + 1}</td>
                                        <td className="p-1.5 border border-black text-left font-semibold">
                                            <div>{student?.name}</div>
                                            <div className="font-normal text-gray-600">{student?.admissionNo}</div>
                                        </td>
                                        {subjects.map(subject => {
                                            const total = getScoreTotal(student?.scores[subject]);
                                            const { grade } = getGradeInfo(total);
                                            return (
                                                <td key={subject} className="p-1.5 border border-black text-center">
                                                    <div>{total}</div>
                                                    <div className="text-gray-500">({grade})</div>
                                                </td>
                                            );
                                        })}
                                        <td className="p-1.5 border border-black text-center font-bold">{result.total}</td>
                                        <td className="p-1.5 border border-black text-center font-bold">{result.average.toFixed(2)}</td>
                                        <td className="p-1.5 border border-black text-center font-bold">{result.position}</td>
                                    </tr>
                                );
                            })}
                            {/* Summary Rows */}
                            {templateSettings.showSubjectAverage && <tr className="bg-gray-200 font-bold">
                                <td colSpan={2} className="p-1.5 border border-black text-right">Subject Average</td>
                                {subjects.map(s => <td key={s} className="p-1.5 border border-black text-center">{subjectStats[s]?.average.toFixed(2)}</td>)}
                                <td colSpan={3} className="p-1.5 border border-black"></td>
                            </tr>}
                            {templateSettings.showHighestScore && <tr className="bg-gray-200 font-bold">
                                <td colSpan={2} className="p-1.5 border border-black text-right">Highest Score</td>
                                {subjects.map(s => <td key={s} className="p-1.5 border border-black text-center">{subjectStats[s]?.highest}</td>)}
                                 <td colSpan={3} className="p-1.5 border border-black"></td>
                            </tr>}
                            {templateSettings.showLowestScore && <tr className="bg-gray-200 font-bold">
                                <td colSpan={2} className="p-1.5 border border-black text-right">Lowest Score</td>
                                {subjects.map(s => <td key={s} className="p-1.5 border border-black text-center">{subjectStats[s]?.lowest}</td>)}
                                <td colSpan={3} className="p-1.5 border border-black"></td>
                            </tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Page 2: Analysis */}
            {summaryStats && (
                 <div className="broadsheet-page p-8 bg-white text-black font-['Arial']" style={{ width: '297mm', minHeight: '210mm', boxSizing: 'border-box' }}>
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <table className="w-full border-collapse border border-gray-400">
                                <tbody>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Total Students</td><td className="p-2 border border-gray-400 text-center">{summaryStats.totalStudents}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Passed Students</td><td className="p-2 border border-gray-400 text-center">{summaryStats.passedStudents}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Failed Students</td><td className="p-2 border border-gray-400 text-center">{summaryStats.failedStudents}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <table className="w-full border-collapse border border-gray-400">
                               <tbody>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Exceptional Performance (80% and above)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.exceptional}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Very Good Performance (70% - 79%)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.veryGood}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Good Performance (60% - 69%)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.good}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Fair Performance (50% - 59%)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.fair}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Poor Performance (Below 50%)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.poor}</td></tr>
                               </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-8 border border-blue-300 bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-center text-lg font-bold mb-4 text-blue-800">Comprehensive Performance Analysis</h3>
                        <div className="text-xs space-y-2 leading-relaxed whitespace-pre-wrap">
                            {aiAnalysis.split('\n\n').map((paragraph, index) => {
                                const parts = paragraph.split(/(\*\*.+?\*\*)/g);
                                return (
                                <p key={index}>
                                    {parts.map((part, i) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={i} className="font-bold text-blue-700 block mt-2 mb-1">{part.slice(2, -2)}</strong>;
                                    }
                                    return part;
                                    })}
                                </p>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BroadsheetReport;