import React, { forwardRef, useMemo } from 'react';
import { Result, Student, ScorePart, ReportCardTemplateSettings } from '../types';
import PhotoIcon from './icons/PhotoIcon';
import { getScoreTotal, getGradeInfo, getOrdinalSuffix } from '../utils';
// FIX: Corrected typo in imported constant name.
import { SCHOOL_LOGO_BASE64 } from './assets';

interface ResultsDisplayProps {
  results: Result[];
  studentData: Student[];
  subjects: string[];
  classInfo: { level: string; arm: string; term: string; session: string };
  nextTermBegins: string;
  principalRemark: string;
  totalSchoolDays: string;
  templateSettings: ReportCardTemplateSettings;
}

const ResultsDisplay = forwardRef<HTMLDivElement, ResultsDisplayProps>(({ results, studentData, subjects, classInfo, nextTermBegins, principalRemark, totalSchoolDays, templateSettings }, ref) => {
    
    const subjectStats = useMemo(() => {
        const stats: Record<string, { highest: number; lowest: number; average: number; scores: number[] }> = {};
        subjects.forEach(subject => {
            const scores = studentData.map(s => getScoreTotal(s.scores[subject])).filter(score => score !== null) as number[];
            if (scores.length > 0) {
                stats[subject] = {
                    highest: Math.max(...scores),
                    lowest: Math.min(...scores),
                    average: scores.reduce((a, b) => a + b, 0) / scores.length,
                    scores: scores.sort((a, b) => b - a)
                };
            } else {
                 stats[subject] = { highest: 0, lowest: 0, average: 0, scores: [] };
            }
        });
        return stats;
    }, [studentData, subjects]);

    if (results.length === 0) return null;

    const reportTitle = `${classInfo.term} Performance Report`;
    const cognitiveDomainTitle = `Cognitive Domain - ${classInfo.term} Report`;
    const summaryTitle = `${classInfo.term} Performance Summary`;
    const gradeAnalysisTitle = `${classInfo.term} Grade Analysis`;
    const averageScoreLabel = `${classInfo.term} Average Score`;
    const averageGradeLabel = `${classInfo.term} Average Grade`;
    
    const formatScore = (score: ScorePart) => score === null ? '-' : String(score);

    return (
        <div ref={ref}>
            {results.map(result => {
                const student = studentData.find(s => s.id === result.studentId);
                if (!student) return null;

                const gradeAnalysis = { A1: 0, B2: 0, B3: 0, C4: 0, C5: 0, C6: 0, D7: 0, E8: 0, F9: 0 };
                subjects.forEach(subject => {
                    const total = getScoreTotal(student.scores[subject]);
                    const { grade } = getGradeInfo(total);
                    if (grade in gradeAnalysis) {
                        gradeAnalysis[grade as keyof typeof gradeAnalysis]++;
                    }
                });

                const totalMarksObtainable = subjects.length * 100;
                const overallGradeInfo = getGradeInfo(result.average);
                const promotionStatus = result.average >= 40 ? 'Promoted' : 'Repeated';
                
                const daysPresent = student.totalAttendance || 0;
                const totalDays = parseInt(totalSchoolDays, 10) || 0;
                const daysAbsent = totalDays > 0 ? totalDays - daysPresent : 0;

                return (
                    <div key={result.studentId} className="report-card-page relative p-4 bg-white text-black" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', fontFamily: templateSettings.fontFamily }}>
                       <div className="border-2 border-black p-2">
                            <header className="text-center mb-2">
                                <div className="flex justify-between items-center">
                                    <img src={SCHOOL_LOGO_BASE64} alt="School Logo" className="h-20 w-20 object-contain" />
                                    <div className="flex-grow">
                                        <h1 className="text-3xl font-bold text-black uppercase">{templateSettings.schoolName}</h1>
                                        <p className="text-sm font-semibold">{templateSettings.schoolAddress}</p>
                                        <p className="text-sm font-semibold">{templateSettings.contactInfo}</p>
                                    </div>
                                    <div className="w-20"></div>
                                </div>
                                <p className="text-lg font-bold mt-1 bg-sky-800 text-white py-1">{reportTitle}</p>
                            </header>

                            <div className="grid grid-cols-5 gap-2 items-start mb-2 text-sm">
                                <div className="col-span-2 space-y-0.5 text-gray-800">
                                    <p><strong className="text-black">Name:</strong> {student.name}</p>
                                    <p><strong className="text-black">Class:</strong> {classInfo.level} {classInfo.arm}</p>
                                    <p><strong className="text-black">Session:</strong> {classInfo.session}</p>
                                    <p><strong className="text-black">Term:</strong> {classInfo.term}</p>
                                </div>
                                <div className="col-span-2 space-y-0.5 text-gray-800">
                                    <p><strong className="text-black">Gender:</strong> {student.gender}</p>
                                    <p><strong className="text-black">Admission No:</strong> {student.admissionNo}</p>
                                    <p><strong className="text-black">D.O.B:</strong> {student.dob}</p>
                                    <p><strong className="text-black">Parent(s):</strong> {student.parentName}</p>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                {student.photo ? (
                                    <img src={student.photo} alt={student.name} className="w-24 h-28 rounded-sm object-cover border-2 border-black" />
                                ) : (
                                    <div className="w-24 h-28 rounded-sm bg-slate-100 flex items-center justify-center border-2 border-black">
                                        <PhotoIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                <div>
                                    <p className="text-sm font-bold bg-sky-800 text-white text-center py-0.5 mb-1">Attendance Summary</p>
                                    <table className="w-full border-collapse border border-black">
                                        <tbody>
                                            <tr className="bg-white"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Days School Opened</td><td className="py-1 px-2 border border-black text-center">{totalDays > 0 ? totalDays : '-'}</td></tr>
                                            <tr className="bg-gray-50"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Days Present</td><td className="py-1 px-2 border border-black text-center">{daysPresent > 0 ? daysPresent : '-'}</td></tr>
                                            <tr className="bg-white"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Days Absent</td><td className="py-1 px-2 border border-black text-center">{daysAbsent >= 0 && totalDays > 0 ? daysAbsent : '-'}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div>
                                    <p className="text-sm font-bold bg-sky-800 text-white text-center py-0.5 mb-1">{summaryTitle}</p>
                                    <table className="w-full border-collapse border border-black">
                                        <tbody>
                                            <tr className="bg-white"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Total Marks Obtained</td><td className="py-1 px-2 border border-black text-center text-gray-800">{result.total}</td></tr>
                                            <tr className="bg-gray-50"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Total Marks Obtainable</td><td className="py-1 px-2 border border-black text-center text-gray-800">{totalMarksObtainable}</td></tr>
                                            <tr className="bg-white"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Class Population</td><td className="py-1 px-2 border border-black text-center text-gray-800">{studentData.length}</td></tr>
                                            <tr className="bg-gray-50"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">{averageScoreLabel}</td><td className="py-1 px-2 border border-black text-center font-bold text-black">{result.average.toFixed(2)}</td></tr>
                                            <tr className="bg-white"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">{averageGradeLabel}</td><td className="py-1 px-2 border border-black text-center font-bold text-black">{overallGradeInfo.grade}</td></tr>
                                            <tr className="bg-gray-50"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Performance Remarks</td><td className="py-1 px-2 border border-black text-center text-gray-800">{overallGradeInfo.remark}</td></tr>
                                            {templateSettings.showClassPosition && <tr className="bg-white"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Class Position</td><td className="py-1 px-2 border border-black text-center font-bold text-black">{getOrdinalSuffix(result.position)}</td></tr>}
                                            {templateSettings.showPromotionStatus && <tr className="bg-gray-50"><td className="py-1 px-2 border border-black font-semibold text-black whitespace-nowrap">Promotion Status</td><td className="py-1 px-2 border border-black text-center font-bold text-black">{promotionStatus}</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <p className="text-sm font-bold bg-sky-800 text-white text-center py-0.5 mb-1">{cognitiveDomainTitle}</p>
                            <table className="w-full text-xs border-collapse border border-black mb-1">
                                <thead className="font-bold bg-gray-200 text-black">
                                    <tr>
                                        {['Subjects', '1st CA (20)', '2nd CA (20)', 'Exam (60)', 'Total (100)', 'Grade', 'Remarks', 'Rank', 'Class Average'].map(h => <th key={h} className="py-1.5 px-2 border border-black">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((subject, index) => {
                                        const scoreBreakdown = student.scores[subject] || { firstCA: null, secondCA: null, exam: null };
                                        const total = getScoreTotal(scoreBreakdown);
                                        const { grade, remark } = getGradeInfo(total);
                                        const stats = subjectStats[subject];
                                        const rank = stats.scores.indexOf(total) + 1;
                                        
                                        return (
                                            <tr key={subject} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="py-1.5 px-2 border border-black font-semibold text-left text-black align-middle">{subject}</td>
                                                <td className="py-1.5 px-2 border border-black text-center text-gray-800 align-middle">{formatScore(scoreBreakdown.firstCA)}</td>
                                                <td className="py-1.5 px-2 border border-black text-center text-gray-800 align-middle">{formatScore(scoreBreakdown.secondCA)}</td>
                                                <td className="py-1.5 px-2 border border-black text-center text-gray-800 align-middle">{formatScore(scoreBreakdown.exam)}</td>
                                                <td className="py-1.5 px-2 border border-black text-center font-bold text-black align-middle">{total}</td>
                                                <td className="py-1.5 px-2 border border-black text-center font-bold text-black align-middle">{grade}</td>
                                                <td className="py-1.5 px-2 border border-black text-center text-gray-800 align-middle">{remark}</td>
                                                <td className="py-1.5 px-2 border border-black text-center text-gray-800 align-middle">{rank > 0 ? rank : '-'}</td>
                                                <td className="py-1.5 px-2 border border-black text-center text-gray-800 align-middle">{stats.average.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            
                            {templateSettings.showGradeAnalysis && <>
                                <p className="text-sm font-bold bg-sky-800 text-white text-center py-0.5 mb-1">{gradeAnalysisTitle}</p>
                                <table className="w-full text-xs border-collapse border border-black mb-1">
                                    <thead className="font-bold bg-gray-200 text-black">
                                        <tr>
                                            {['Grade', ...Object.keys(gradeAnalysis)].map(g => <th key={g} className="py-1 px-2 border border-black">{g}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-1 px-2 border border-black font-semibold text-black align-middle">No. of Subjects</td>
                                            {Object.values(gradeAnalysis).map((count, i) => <td key={i} className="py-1 px-2 border border-black text-center text-gray-800 align-middle">{count}</td>)}
                                        </tr>
                                    </tbody>
                                </table>
                            </>}
                             
                            <div className="flex justify-between items-start mb-1">
                                <div className="w-1/2 pr-2">
                                    <p className="font-bold text-black text-sm">Grade Scale</p>
                                    <p className="text-[10px] text-gray-700">75 - 100: A1 (Excellent), 70 - 74: B2 (Very Good), 65 - 69: B3 (Good), 60 - 64: C4 (Credit), 55 - 59: C5 (Credit), 50 - 54: C6 (Credit), 45 - 49: D7 (Pass), 40 - 44: E8 (Pass), 0 - 39: F9 (Fail)</p>
                                </div>
                                {templateSettings.showQRCode &&
                                    <div className="w-1/2 flex justify-end">
                                        <div className="text-center">
                                           <div className="w-20 h-20 bg-gray-200 border border-black flex items-center justify-center text-[8px] p-1">QR CODE</div>
                                            <p className="text-[10px] text-gray-700">Scan the QR code to Verify</p>
                                        </div>
                                    </div>
                                }
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-bold underline text-black">Form Master's Remark</h4>
                                    <p className="text-gray-800">{student.remark || 'N/A'}</p>
                                </div>
                                 <div>
                                    <h4 className="font-bold underline text-black">Principal's Remark</h4>
                                    <p className="text-gray-800">{principalRemark}</p>
                                </div>
                            </div>
                            
                            <p className="font-bold text-sm mt-2 text-center">Next Term Begins: <span className="text-red-800">{new Date(nextTermBegins + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></p>

                       </div>
                    </div>
                )
            })}
        </div>
    );
});

export default ResultsDisplay;