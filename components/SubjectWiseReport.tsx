
import React, { forwardRef, useMemo } from 'react';
import { Student, SubjectReportTemplateSettings } from '../types';
import { getScoreTotal, getGradeInfo, generateQrCodeUrl } from '../utils';

interface SubjectWiseReportProps {
  students: Student[];
  subject: string | null;
  classInfo: { level: string; arm: string; session: string };
  aiComment: string;
  templateSettings: SubjectReportTemplateSettings;
  schoolName: string;
}

const SubjectWiseReport = forwardRef<HTMLDivElement, SubjectWiseReportProps>(({ students, subject, classInfo, aiComment, templateSettings, schoolName }, ref) => {
    
    const subjectData = useMemo(() => {
        if (!subject) return [];
        return students.map(student => {
            const scoreBreakdown = student.scores[subject!];
            const total = getScoreTotal(scoreBreakdown);
            const { grade, remark } = getGradeInfo(total);
            const comment = grade.startsWith('A') || grade.startsWith('B') ? 'Good performance. Keep it up.' : grade.startsWith('F') || grade.startsWith('E') ? 'Needs improvement.' : 'Excellent performance.';
            return {
                name: student.name,
                firstCA: scoreBreakdown?.firstCA ?? '-',
                secondCA: scoreBreakdown?.secondCA ?? '-',
                exam: scoreBreakdown?.exam ?? '-',
                total,
                grade,
                remark,
                comment,
            };
        });
    }, [students, subject]);

    const performanceStats = useMemo(() => {
        if (subjectData.length === 0) return null;
        const totalStudents = subjectData.length;
        const totalScore = subjectData.reduce((acc, s) => acc + s.total, 0);
        const classAverage = totalStudents > 0 ? totalScore / totalStudents : 0;
        const passingStudents = subjectData.filter(s => s.grade !== 'F9').length;
        const passRate = totalStudents > 0 ? (passingStudents / totalStudents) * 100 : 0;

        const gradeCounts = subjectData.reduce((acc, s) => {
            acc[s.grade] = (acc[s.grade] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const excellentStudents = (gradeCounts['A1'] || 0) + (gradeCounts['B2'] || 0);
        const goodStudents = (gradeCounts['B3'] || 0) + (gradeCounts['C4'] || 0) + (gradeCounts['C5'] || 0);
        const averageStudents = (gradeCounts['C6'] || 0) + (gradeCounts['D7'] || 0);
        const belowAverageStudents = (gradeCounts['E8'] || 0);
        const needsImprovement = (gradeCounts['F9'] || 0);

        return {
            totalStudents,
            classAverage,
            passRate,
            gradeCounts: { A1:0, B2:0, B3:0, C4:0, C5:0, C6:0, D7:0, E8:0, F9:0, ...gradeCounts },
            performanceCategories: {
                excellent: { count: excellentStudents, percent: totalStudents > 0 ? (excellentStudents / totalStudents) * 100 : 0 },
                good: { count: goodStudents, percent: totalStudents > 0 ? (goodStudents / totalStudents) * 100 : 0 },
                average: { count: averageStudents, percent: totalStudents > 0 ? (averageStudents / totalStudents) * 100 : 0 },
                belowAverage: { count: belowAverageStudents, percent: totalStudents > 0 ? (belowAverageStudents / totalStudents) * 100 : 0 },
                needsImprovement: { count: needsImprovement, percent: totalStudents > 0 ? (needsImprovement / totalStudents) * 100 : 0 },
            }
        };
    }, [subjectData]);

    if (!subject || !performanceStats) return null;

    const qrCodeUrl = generateQrCodeUrl({
        docType: 'Subject-Wise Report',
        subject: subject,
        class: `${classInfo.level}-${classInfo.arm}`,
        session: classInfo.session,
        classAverage: performanceStats.classAverage.toFixed(2),
        school: schoolName
    });

    const STUDENTS_PER_PAGE = 18;
    const studentPages = [];
    for (let i = 0; i < subjectData.length; i += STUDENTS_PER_PAGE) {
        studentPages.push(subjectData.slice(i, i + STUDENTS_PER_PAGE));
    }

    const performanceBar = [
        { percent: performanceStats.performanceCategories.excellent.percent, color: 'bg-green-500' },
        { percent: performanceStats.performanceCategories.good.percent, color: 'bg-blue-500' },
        { percent: performanceStats.performanceCategories.average.percent, color: 'bg-yellow-500' },
        { percent: performanceStats.performanceCategories.belowAverage.percent, color: 'bg-orange-500' },
        { percent: performanceStats.performanceCategories.needsImprovement.percent, color: 'bg-red-500' },
    ];


    return (
        <div ref={ref}>
            {studentPages.map((pageData, pageIndex) => (
                <div key={`student-page-${pageIndex}`} className="subject-report-page p-8 bg-white text-black font-['Arial']" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold uppercase">{schoolName}</h1>
                        <h2 className="text-xl">Subject-Wise Report for {subject}</h2>
                        <p>Class Population: {performanceStats.totalStudents}</p>
                    </div>
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                {['Student Name', 'CA 1', 'CA 2', 'Exams', 'Total', 'Grade', 'Remarks', 'Comments'].map(h => 
                                    <th key={h} className="py-2 px-3 border border-slate-300">{h}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.map((student, index) => (
                                <tr key={index} className="bg-white hover:bg-slate-50 even:bg-slate-100">
                                    <td className="py-2 px-3 border border-slate-300 text-left">{student.name}</td>
                                    <td className="py-2 px-3 border border-slate-300 text-center">{student.firstCA}</td>
                                    <td className="py-2 px-3 border border-slate-300 text-center">{student.secondCA}</td>
                                    <td className="py-2 px-3 border border-slate-300 text-center">{student.exam}</td>
                                    <td className="py-2 px-3 border border-slate-300 text-center font-bold">{student.total}</td>
                                    <td className="py-2 px-3 border border-slate-300 text-center font-bold">{student.grade}</td>
                                    <td className="py-2 px-3 border border-slate-300 text-center">{student.remark}</td>
                                    <td className="py-2 px-3 border border-slate-300 text-left">{student.comment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
            
            <div className="subject-report-page p-8 bg-white text-black font-['Arial']" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                 {templateSettings.showSummary && <div className="mb-8 p-4 border rounded">
                    <h3 className="text-xl font-bold text-center mb-4">Summary</h3>
                    <p>Total Students: {performanceStats.totalStudents}</p>
                    <ul className="list-disc list-inside grid grid-cols-3 gap-2">
                        {Object.entries(performanceStats.gradeCounts).map(([grade, count]) => {
                             const percentage = performanceStats.totalStudents > 0 ? ((Number(count) / performanceStats.totalStudents) * 100).toFixed(1) : '0.0';
                             return (
                                <li key={grade}><span className="font-bold text-blue-600">{grade}:</span> {count} ({percentage}%)</li>
                             );
                        })}
                    </ul>
                 </div>}
                 {templateSettings.showPerformanceIndicators && <div className="p-4 border rounded">
                    <h3 className="text-xl font-bold text-center mb-4">Performance Indicators</h3>
                    <div className="space-y-2">
                        <p><strong>Class Average Score:</strong> {performanceStats.classAverage.toFixed(1)}</p>
                        <p><strong>Pass Rate:</strong> {performanceStats.passRate.toFixed(1)}%</p>
                        <p><strong>Excellent Students (A1/B2):</strong> {performanceStats.performanceCategories.excellent.count} ({performanceStats.performanceCategories.excellent.percent.toFixed(1)}%)</p>
                        <p><strong>Good Students (B3/C4/C5):</strong> {performanceStats.performanceCategories.good.count} ({performanceStats.performanceCategories.good.percent.toFixed(1)}%)</p>
                        <p><strong>Average Students (C6/D7):</strong> {performanceStats.performanceCategories.average.count} ({performanceStats.performanceCategories.average.percent.toFixed(1)}%)</p>
                        <p><strong>Below Average Students (E8):</strong> {performanceStats.performanceCategories.belowAverage.count} ({performanceStats.performanceCategories.belowAverage.percent.toFixed(1)}%)</p>
                    </div>
                </div>}
            </div>

            <div className="subject-report-page p-8 bg-white text-black font-['Arial']" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                {templateSettings.showPerformanceBar && <div className="mb-8 p-4 border rounded">
                    <p className="mb-2"><strong>Students Needing Significant Improvement (F9):</strong> {performanceStats.performanceCategories.needsImprovement.count} ({performanceStats.performanceCategories.needsImprovement.percent.toFixed(1)}%)</p>
                    <div className="w-full h-8 bg-gray-200 flex rounded overflow-hidden">
                        {performanceBar.map((bar, i) => (
                           bar.percent > 0 && <div key={i} style={{ width: `${bar.percent}%` }} className={`${bar.color} h-full`}></div>
                        ))}
                    </div>
                </div>}
                 <div className="flex items-start gap-8">
                    <div className="flex-grow p-4 border rounded">
                        <h3 className="text-xl font-bold text-center mb-4">General Comments</h3>
                        <p className="text-sm leading-relaxed">{aiComment || 'Generating comment...'}</p>
                    </div>
                    <div className="flex-shrink-0 text-center">
                        <img src={qrCodeUrl} alt="QR Code for Verification" className="w-32 h-32" crossOrigin="anonymous" />
                        <p className="text-xs mt-1 text-slate-600">Scan to verify document</p>
                    </div>
                 </div>
            </div>
        </div>
    );
});

export default SubjectWiseReport;