import React, { forwardRef, useMemo } from 'react';
import { Student, Result, BroadsheetTemplateSettings } from '../types';
import { getScoreTotal, getGradeInfo, getSubjectsForStudent, SUBJECT_ABBREVIATIONS, generateQrCodeUrl } from '../utils';

interface BroadsheetReportProps {
    students: Student[];
    subjects: string[];
    results: Result[];
    classInfo: { level: string; arm: string; session:string; term: string };
    aiAnalysis: string;
    templateSettings: BroadsheetTemplateSettings;
    schoolName: string;
}

const BroadsheetReport = forwardRef<HTMLDivElement, BroadsheetReportProps>(({ students, subjects, results, classInfo, aiAnalysis, templateSettings, schoolName }, ref) => {
    
    const isSeniorClass = classInfo.level.startsWith('SS');

    const subjectStats = useMemo(() => {
        const stats: Record<string, { highest: number; lowest: number; average: number }> = {};
        subjects.forEach(subject => {
            const scores = students
                .filter(s => {
                    if (!isSeniorClass) return true;
                    return getSubjectsForStudent(s, 'Senior').includes(subject);
                })
                .map(s => getScoreTotal(s.scores[subject]))
                .filter(score => score !== null) as number[];

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
    }, [students, subjects, isSeniorClass]);

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
    
    const qrCodeUrl = generateQrCodeUrl({
        docType: 'Broadsheet',
        class: `${classInfo.level}-${classInfo.arm}`,
        session: classInfo.session,
        term: classInfo.term,
        totalStudents: results.length,
        school: schoolName
    });

    if (results.length === 0) return null;

    const displayedSubjects = subjects.filter(subject => {
        // Only show subjects that at least one student in the results is taking
        return results.some(result => {
            const student = students.find(s => s.id === result.studentId);
            if (!student) return false;
            return getSubjectsForStudent(student, isSeniorClass ? 'Senior' : 'Junior').includes(subject);
        });
    });


    return (
        <div ref={ref}>
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
                                <th className="p-1.5 border border-black align-bottom" rowSpan={2}>S/N</th>
                                <th className="p-1.5 border border-black align-bottom" rowSpan={2}>Student Details</th>
                                {displayedSubjects.map(s => <th key={s} className="p-1.5 border border-black" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{s}</th>)}
                                <th className="p-1.5 border border-black align-bottom" rowSpan={2}>Total</th>
                                <th className="p-1.5 border border-black align-bottom" rowSpan={2}>Avg.</th>
                                <th className="p-1.5 border border-black align-bottom" rowSpan={2}>Pos.</th>
                            </tr>
                            <tr>
                                {displayedSubjects.map(s => <th key={`${s}-abbr`} className="p-1.5 border border-black">{SUBJECT_ABBREVIATIONS[s] || s.substring(0,3).toUpperCase()}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result, index) => {
                                const student = students.find(s => s.id === result.studentId);
                                const studentSubjects = student ? getSubjectsForStudent(student, isSeniorClass ? 'Senior' : 'Junior') : [];
                                return (
                                    <tr key={result.studentId} className="even:bg-slate-50">
                                        <td className="p-1.5 border border-black text-center">{index + 1}</td>
                                        <td className="p-1.5 border border-black text-left font-semibold">
                                            <div>{student?.name}</div>
                                            <div className="font-normal text-gray-600">{student?.admissionNo}</div>
                                        </td>
                                        {displayedSubjects.map(subject => {
                                            if (!studentSubjects.includes(subject)) {
                                                return <td key={subject} className="p-1.5 border border-black text-center bg-gray-100">-</td>
                                            }
                                            const total = getScoreTotal(student?.scores[subject]);
                                            const { grade } = getGradeInfo(total);
                                            return (
                                                <td key={subject} className="p-1.5 border border-black text-center">
                                                    <div className="font-bold text-black">{total}</div>
                                                    <div className="text-gray-700">({grade})</div>
                                                </td>
                                            );
                                        })}
                                        <td className="p-1.5 border border-black text-center font-bold">{result.total.toFixed(0)}</td>
                                        <td className="p-1.5 border border-black text-center font-bold">{result.average.toFixed(2)}</td>
                                        <td className="p-1.5 border border-black text-center font-bold">{result.position}</td>
                                    </tr>
                                );
                            })}
                            {templateSettings.showSubjectAverage && <tr className="bg-gray-200 font-bold">
                                <td colSpan={2} className="p-1.5 border border-black text-right">Subject Average</td>
                                {displayedSubjects.map(s => <td key={s} className="p-1.5 border border-black text-center">{subjectStats[s]?.average.toFixed(1)}</td>)}
                                <td colSpan={3} className="p-1.5 border border-black bg-gray-200"></td>
                            </tr>}
                            {templateSettings.showHighestScore && <tr className="bg-gray-200 font-bold">
                                <td colSpan={2} className="p-1.5 border border-black text-right">Highest Score</td>
                                {displayedSubjects.map(s => <td key={s} className="p-1.5 border border-black text-center">{subjectStats[s]?.highest}</td>)}
                                 <td colSpan={3} className="p-1.5 border border-black bg-gray-200"></td>
                            </tr>}
                            {templateSettings.showLowestScore && <tr className="bg-gray-200 font-bold">
                                <td colSpan={2} className="p-1.5 border border-black text-right">Lowest Score</td>
                                {displayedSubjects.map(s => <td key={s} className="p-1.5 border border-black text-center">{subjectStats[s]?.lowest}</td>)}
                                <td colSpan={3} className="p-1.5 border border-black bg-gray-200"></td>
                            </tr>}
                        </tbody>
                    </table>
                </div>
                 <div className="mt-4 text-[9px] p-2 border border-gray-300 rounded">
                    <h4 className="font-bold mb-1">Subject Key:</h4>
                    <div className="grid grid-cols-6 gap-x-4 gap-y-1">
                        {displayedSubjects.map(s => (
                            <div key={s}><b>{SUBJECT_ABBREVIATIONS[s] || s.substring(0,3).toUpperCase()}:</b> {s}</div>
                        ))}
                    </div>
                </div>
            </div>

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
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Exceptional Performance (80%+)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.exceptional}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Very Good Performance (70% - 79%)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.veryGood}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Good Performance (60% - 69%)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.good}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Fair Performance (50% - 59%)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.fair}</td></tr>
                                    <tr><td className="p-2 border border-gray-400 font-semibold bg-gray-100">Poor Performance (&lt;50%)</td><td className="p-2 border border-gray-400 text-center">{summaryStats.poor}</td></tr>
                               </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-8 flex items-start gap-8">
                        <div className="flex-grow border border-blue-300 bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-center text-lg font-bold mb-4 text-blue-800">Comprehensive Performance Analysis</h3>
                            <div className="text-sm space-y-2 leading-relaxed whitespace-pre-wrap">
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
                        <div className="flex-shrink-0 text-center">
                            <img src={qrCodeUrl} alt="QR Code for Verification" className="w-32 h-32" crossOrigin="anonymous" />
                            <p className="text-xs mt-1 text-slate-600">Scan to verify document</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BroadsheetReport;