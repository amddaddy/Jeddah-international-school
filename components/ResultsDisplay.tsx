import React, { forwardRef } from 'react';
import { Result, Student } from '../types';
import PhotoIcon from './icons/PhotoIcon';

// Base64 encoded school logo
const SCHOOL_LOGO_BASE64 = 'data:image/png;base64,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p6emVlZVVVVUJCQmUlZVlZWVlZWXl5eUFBQUVFRVFRUVRUVEJCQmUlZWlpaXV1dX19fWlpSVJSUnp6emUlZVVVVWVlZVVVVXJycnp6elJSUnp6enx8fFFRUVFRUV5eXllZWVlZWVlZWVlZWUZGRkpKSkpKSkpKSkJCQm5ubm5ubm5ubmpqampqampqampqampqampqampqYlJSUnp6enx8fFFRUVFRUV5eXllZWVlZWVlZWVlZWUZGRkpKSkpKSkpKSkJCQm5ubm5ubm5ubmpqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampqampq-';

interface ResultsDisplayProps {
  results: Result[];
  studentData: Student[];
  subjects: string[];
  classInfo: { level: string; arm: string; term: string; session: string };
  nextTermBegins: string;
  principalName: string;
  totalSchoolDays: string;
}

const ResultsDisplay = forwardRef<HTMLDivElement, ResultsDisplayProps>(({ results, studentData, subjects, classInfo, nextTermBegins, principalName, totalSchoolDays }, ref) => {
    if (results.length === 0) return null;
    
    const getGradeAndRemark = (score: number) => {
        if (score >= 80) return { grade: 'A', remark: 'Excellent' };
        if (score >= 70) return { grade: 'B2', remark: 'Very Good' };
        if (score >= 60) return { grade: 'B3', remark: 'Good' };
        if (score >= 50) return { grade: 'C', remark: 'Credit' };
        if (score >= 45) return { grade: 'D', remark: 'Pass' };
        if (score >= 40) return { grade: 'E', remark: 'Average' };
        return { grade: 'F', remark: 'Fail' };
    };

    return (
        <div ref={ref}>
            {results.map(result => {
                const student = studentData.find(s => s.id === result.studentId);
                if (!student) return null;

                return (
                    <div key={result.studentId} className="report-card-page relative p-8 border-b-2 border-dashed last:border-b-0 break-inside-avoid bg-white text-black" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box'}}>
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <img src={SCHOOL_LOGO_BASE64} alt="School Watermark" className="w-3/4 h-3/4 object-contain opacity-10" />
                        </div>
                        <div className="relative z-10">
                            <header className="text-center mb-6 border-b-4 border-sky-700 pb-4">
                                <img src={SCHOOL_LOGO_BASE64} alt="School Logo" className="h-24 w-24 mx-auto object-contain" />
                                <h1 className="text-4xl font-bold mt-2 text-sky-800">Jeddah International School</h1>
                                <p className="text-lg text-slate-600 font-medium">End of Term Report</p>
                            </header>

                            <div className="flex justify-between items-start mb-6">
                                <div className="text-sm space-y-1">
                                    <p><strong>Student Name:</strong> {student.name}</p>
                                    <p><strong>Class:</strong> {classInfo.level} {classInfo.arm}</p>
                                    <p><strong>Term:</strong> {classInfo.term}</p>
                                    <p><strong>Session:</strong> {classInfo.session}</p>
                                    <p><strong>Total Attendance:</strong> {student.totalAttendance} / {totalSchoolDays} days</p>
                                </div>
                                {student.photo ? (
                                    <img src={student.photo} alt={student.name} className="w-28 h-32 rounded-lg object-cover border-2 border-slate-200 shadow-sm" />
                                ) : (
                                    <div className="w-28 h-32 rounded-lg bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                                        <PhotoIcon className="w-10 h-10 text-slate-400" />
                                    </div>
                                )}
                            </div>

                            <table className="w-full text-sm border-collapse border border-slate-400 mb-4">
                                <thead className="bg-slate-100 font-semibold">
                                    <tr>
                                        <th className="p-2 border border-slate-300 text-left">Subject</th>
                                        <th className="p-2 border border-slate-300">1st CA (20)</th>
                                        <th className="p-2 border border-slate-300">2nd CA (20)</th>
                                        <th className="p-2 border border-slate-300">Exam (60)</th>
                                        <th className="p-2 border border-slate-300">Total (100)</th>
                                        <th className="p-2 border border-slate-300">Grade</th>
                                        <th className="p-2 border border-slate-300">Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map(subject => {
                                        const s = student.scores[subject] || {};
                                        const firstCA = s.firstCA ?? 'N/A';
                                        const secondCA = s.secondCA ?? 'N/A';
                                        const exam = s.exam ?? 'N/A';
                                        const total = (firstCA === 'ABS' || firstCA === 'N/A' ? 0 : firstCA) + 
                                                      (secondCA === 'ABS' || secondCA === 'N/A' ? 0 : secondCA) + 
                                                      (exam === 'ABS' || exam === 'N/A' ? 0 : exam);
                                        const { grade, remark } = getGradeAndRemark(total);
                                        
                                        return (
                                            <tr key={subject} className="even:bg-slate-50">
                                                <td className="p-2 border border-slate-300">{subject}</td>
                                                <td className="p-2 border border-slate-300 text-center font-bold text-black">{String(firstCA)}</td>
                                                <td className="p-2 border border-slate-300 text-center font-bold text-black">{String(secondCA)}</td>
                                                <td className="p-2 border border-slate-300 text-center font-bold text-black">{String(exam)}</td>
                                                <td className="p-2 border border-slate-300 text-center font-bold text-black">{total}</td>
                                                <td className="p-2 border border-slate-300 text-center font-bold">{grade}</td>
                                                <td className="p-2 border border-slate-300 text-center">{remark}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            
                            <div className="grid grid-cols-3 gap-4 mb-4 text-sm bg-slate-100 p-2 rounded-lg">
                                <p><strong>Total Score:</strong> <span className="font-bold text-sky-700">{result.total}</span></p>
                                <p><strong>Average:</strong> <span className="font-bold text-sky-700">{result.average.toFixed(2)}%</span></p>
                                <p><strong>Position in Class:</strong> <span className="font-bold text-sky-700">{result.position} / {results.length}</span></p>
                            </div>
                            
                            <div className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-bold">Class Teacher's Remark:</h4>
                                    <p className="italic pl-2 border-l-2 border-slate-200">{student.remark || 'N/A'}</p>
                                </div>
                            </div>

                            <footer className="mt-8 pt-4 border-t text-sm">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p><strong>Next Term Begins:</strong> {new Date(nextTermBegins).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-48 h-12"></div>
                                        <p className="w-48 border-t border-slate-500 pt-1 font-semibold">{principalName}</p>
                                        <p className="text-xs text-slate-600">Principal</p>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </div>
                )
            })}
        </div>
    );
});

export default ResultsDisplay;