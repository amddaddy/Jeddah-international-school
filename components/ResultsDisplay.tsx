
import React, { forwardRef } from 'react';
import { Result, Student, ReportCardTemplateSettings } from '../types';
import { getScoreTotal, getGradeInfo, getOrdinalSuffix, getSubjectsForStudent, generateQrCodeUrl } from '../utils';
import { AFFECTIVE_DOMAIN_SKILLS, PSYCHOMOTOR_SKILLS, RATING_SCALE } from './BehavioralRatingsManager';
import PhotoIcon from './icons/PhotoIcon';

interface ResultsDisplayProps {
  results: Result[];
  studentData: Student[];
  allSubjects: string[];
  subjectStreamMap: Record<string, string>;
  classInfo: { level: string; arm: string; term: string; session: string; section: string };
  nextTermBegins: string;
  principalRemark: string;
  totalSchoolDays: string;
  templateSettings: ReportCardTemplateSettings;
  logo: string;
  principalSignature?: string;
}

const getGradeColor = (grade: string) => {
    if (grade === 'F9') return 'text-red-600 font-bold';
    return 'text-slate-800 font-bold'; 
};

const ResultsDisplay = forwardRef<HTMLDivElement, ResultsDisplayProps>(({ results, studentData, allSubjects, subjectStreamMap, classInfo, nextTermBegins, principalRemark, totalSchoolDays, templateSettings, logo, principalSignature }, ref) => {

    if (results.length === 0) return null;

    return (
        <div ref={ref} className="bg-slate-100 p-8">
            {results.map(result => {
                const student = studentData.find(s => s.id === result.studentId);
                if (!student) return null;

                const promotionStatus = result.average >= 40 ? 'Promoted' : 'To Repeat';
                const studentSubjects = getSubjectsForStudent(student, classInfo.section.startsWith('Junior') ? 'Junior' : 'Senior', allSubjects, subjectStreamMap);
                
                const qrCodeUrl = generateQrCodeUrl({
                    docType: 'Report Card',
                    studentName: student.name,
                    admissionNo: student.admissionNo,
                    class: `${classInfo.level}`,
                    average: result.average.toFixed(2),
                    school: templateSettings.schoolName,
                });

                return (
                    <div key={result.studentId} className="report-card-page relative bg-white mx-auto mb-8 p-8 text-slate-900 font-sans" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
                        
                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                            <img src={logo} alt="" className="w-[500px] h-[500px] object-contain opacity-5" />
                        </div>

                        {/* Content Wrapper */}
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                {/* Header Section: Logo Left, Text Center, Student Photo Right */}
                                <div className="flex justify-between items-start mb-2 border-b-4 border-blue-900 pb-4">
                                    {/* Left: School Logo */}
                                    <div className="w-28 h-28 flex items-center justify-center shrink-0">
                                        <img src={logo} alt="School Logo" className="max-w-full max-h-full object-contain" />
                                    </div>

                                    {/* Center: School Details */}
                                    <div className="flex-grow text-center px-4 pt-2">
                                        <h1 className="text-3xl font-extrabold text-slate-800 uppercase tracking-wide leading-tight">{templateSettings.schoolName}</h1>
                                        <p className="text-sm font-bold text-slate-600 mt-1 uppercase tracking-wide">{templateSettings.schoolAddress}</p>
                                        <p className="text-sm font-bold text-slate-600">{templateSettings.contactInfo}</p>
                                        <h2 className="text-xl font-bold text-blue-900 uppercase underline decoration-2 underline-offset-4 mt-4">{templateSettings.reportTitle || "STUDENT'S REPORT SHEET"}</h2>
                                    </div>

                                    {/* Right: Student Photo */}
                                    <div className="w-28 h-28 border border-slate-300 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                                        {student.photo ? (
                                            <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-slate-300 flex flex-col items-center">
                                                <PhotoIcon className="w-10 h-10 mb-1" />
                                                <span className="text-[10px] uppercase font-bold">Passport</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Student Details */}
                                <div className="bg-slate-50 p-3 border border-slate-300 mb-6 text-sm shadow-sm">
                                    <div className="grid grid-cols-12 gap-y-2 gap-x-4 items-center">
                                        <div className="col-span-6 flex border-b border-dotted border-slate-300 pb-1">
                                            <span className="font-bold text-slate-700 w-28 shrink-0 uppercase text-xs">Student's Name:</span>
                                            <span className="font-bold text-slate-900 text-base">{student.name}</span>
                                        </div>
                                        <div className="col-span-3 flex border-b border-dotted border-slate-300 pb-1">
                                            <span className="font-bold text-slate-700 w-24 shrink-0 uppercase text-xs">Admission No:</span>
                                            <span className="font-semibold text-slate-900">{student.admissionNo || 'N/A'}</span>
                                        </div>
                                        <div className="col-span-3 flex border-b border-dotted border-slate-300 pb-1">
                                            <span className="font-bold text-slate-700 w-12 shrink-0 uppercase text-xs">Class:</span>
                                            <span className="font-semibold text-slate-900">{classInfo.level} {classInfo.arm}</span>
                                        </div>

                                        <div className="col-span-6 flex border-b border-dotted border-slate-300 pb-1">
                                            <span className="font-bold text-slate-700 w-28 shrink-0 uppercase text-xs">Section:</span>
                                            <span className="font-semibold text-slate-900">{classInfo.section}</span>
                                        </div>
                                        <div className="col-span-3 flex border-b border-dotted border-slate-300 pb-1">
                                            <span className="font-bold text-slate-700 w-24 shrink-0 uppercase text-xs">Stream:</span>
                                            <span className="font-semibold text-slate-900">{student.stream || 'N/A'}</span>
                                        </div>
                                        <div className="col-span-3 flex border-b border-dotted border-slate-300 pb-1">
                                            <span className="font-bold text-slate-700 w-16 shrink-0 uppercase text-xs">Session:</span>
                                            <span className="font-semibold text-slate-900">{classInfo.session}</span>
                                        </div>

                                        <div className="col-span-6 flex pb-1">
                                            <span className="font-bold text-slate-700 w-28 shrink-0 uppercase text-xs">Term:</span>
                                            <span className="font-semibold text-slate-900">{classInfo.term}</span>
                                        </div>
                                        <div className="col-span-6 flex pb-1">
                                            <span className="font-bold text-slate-700 w-24 shrink-0 uppercase text-xs">Attendance:</span>
                                            <span className="font-semibold text-slate-900">{student.totalAttendance} out of {totalSchoolDays} days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-12 gap-6">
                                    
                                    {/* Left Column: Academic Records */}
                                    <div className="col-span-7">
                                        <div className="border border-slate-800">
                                            <div className="bg-slate-200 text-center font-bold py-2 border-b border-slate-800 uppercase text-sm">ACADEMIC RECORDS</div>
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-100 text-slate-800 text-[11px] uppercase font-bold tracking-tight">
                                                        <th className="border-r border-b border-slate-400 py-2 px-2 text-left">Subject</th>
                                                        <th className="border-r border-b border-slate-400 py-2 px-1 text-center w-10">1st CA</th>
                                                        <th className="border-r border-b border-slate-400 py-2 px-1 text-center w-10">2nd CA</th>
                                                        <th className="border-r border-b border-slate-400 py-2 px-1 text-center w-10">Exam</th>
                                                        <th className="border-r border-b border-slate-400 py-2 px-1 text-center w-10 bg-slate-200">Total</th>
                                                        <th className="border-r border-b border-slate-400 py-2 px-1 text-center w-10">Grd</th>
                                                        <th className="border-b border-slate-400 py-2 px-1 text-center text-[10px]">Remark</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentSubjects.map((subject, idx) => {
                                                        const score = student.scores[subject] || { firstCA: null, secondCA: null, exam: null };
                                                        const total = getScoreTotal(score);
                                                        const { grade, remark } = getGradeInfo(total);
                                                        const isEven = idx % 2 === 0;
                                                        return (
                                                            <tr key={subject} className={`${isEven ? 'bg-white/80' : 'bg-slate-50/80'} border-b border-slate-300 last:border-b-0 text-xs`}>
                                                                <td className="border-r border-slate-300 py-1.5 px-2 font-bold text-slate-800">{subject}</td>
                                                                <td className="border-r border-slate-300 py-1.5 px-1 text-center text-slate-600">{score.firstCA ?? '-'}</td>
                                                                <td className="border-r border-slate-300 py-1.5 px-1 text-center text-slate-600">{score.secondCA ?? '-'}</td>
                                                                <td className="border-r border-slate-300 py-1.5 px-1 text-center text-slate-600">{score.exam ?? '-'}</td>
                                                                <td className="border-r border-slate-300 py-1.5 px-1 text-center font-bold text-slate-900 bg-slate-100">{total}</td>
                                                                <td className={`border-r border-slate-300 py-1.5 px-1 text-center ${getGradeColor(grade)}`}>{grade}</td>
                                                                <td className="py-1.5 px-1 text-center text-[10px] font-medium text-slate-600">{remark}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Right Column: Sidebar */}
                                    <div className="col-span-5 space-y-6">
                                        
                                        {/* Affective Domain */}
                                        <div className="border border-slate-800 bg-white/90">
                                            <div className="bg-slate-200 text-center font-bold py-2 border-b border-slate-800 uppercase text-sm">AFFECTIVE DOMAIN</div>
                                            <table className="w-full text-xs">
                                                <tbody>
                                                    {AFFECTIVE_DOMAIN_SKILLS.map((skill, i) => (
                                                        <tr key={skill} className="border-b border-slate-300 last:border-b-0">
                                                            <td className="py-1 px-3 text-slate-700 font-medium">{skill}</td>
                                                            <td className="py-1 px-3 text-right font-bold text-slate-900">
                                                                {student.affectiveDomain?.[skill] ? RATING_SCALE[student.affectiveDomain[skill]!].split('(')[0].trim() : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Psychomotor */}
                                        <div className="border border-slate-800 bg-white/90">
                                            <div className="bg-slate-200 text-center font-bold py-2 border-b border-slate-800 uppercase text-sm">PSYCHOMOTOR SKILLS</div>
                                            <table className="w-full text-xs">
                                                <tbody>
                                                    {PSYCHOMOTOR_SKILLS.map((skill, i) => (
                                                        <tr key={skill} className="border-b border-slate-300 last:border-b-0">
                                                            <td className="py-1 px-3 text-slate-700 font-medium">{skill}</td>
                                                            <td className="py-1 px-3 text-right font-bold text-slate-900">
                                                                {student.psychomotorSkills?.[skill] ? RATING_SCALE[student.psychomotorSkills[skill]!].split('(')[0].trim() : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Grade Scale */}
                                        {templateSettings.showGradeAnalysis && (
                                            <div className="border border-slate-800 bg-white/90 p-2 text-center">
                                                <div className="font-bold text-slate-800 uppercase text-xs border-b border-slate-300 pb-1 mb-1">GRADE SCALE</div>
                                                <div className="text-[9px] leading-relaxed text-slate-600 grid grid-cols-3 gap-1 text-left px-2">
                                                    <span>A1: 75-100</span>
                                                    <span>B2: 70-74</span>
                                                    <span>B3: 65-69</span>
                                                    <span>C4: 60-64</span>
                                                    <span>C5: 55-59</span>
                                                    <span>C6: 50-54</span>
                                                    <span>D7: 45-49</span>
                                                    <span>E8: 40-44</span>
                                                    <span className="font-bold text-red-600">F9: 0-39</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Performance Summary */}
                                        <div className="border border-slate-800 bg-white/90">
                                            <div className="bg-slate-200 text-center font-bold py-2 border-b border-slate-800 uppercase text-sm">PERFORMANCE SUMMARY</div>
                                            <div className="p-3 space-y-2 text-sm">
                                                <div className="flex justify-between border-b border-slate-200 pb-1">
                                                    <span className="font-bold text-slate-700">Total Score:</span>
                                                    <span className="font-bold text-slate-900">{result.total.toFixed(0)} / {studentSubjects.length * 100}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-200 pb-1">
                                                    <span className="font-bold text-slate-700">Average:</span>
                                                    <span className="font-bold text-slate-900">{result.average.toFixed(2)}%</span>
                                                </div>
                                                {templateSettings.showClassPosition && (
                                                    <div className="flex justify-between border-b border-slate-200 pb-1">
                                                        <span className="font-bold text-slate-700">Position in Class:</span>
                                                        <span className="font-bold text-slate-900">{getOrdinalSuffix(result.position)}</span>
                                                    </div>
                                                )}
                                                {templateSettings.showPromotionStatus && (
                                                    <div className="flex justify-between pt-1">
                                                        <span className="font-bold text-slate-700">Promotion Status:</span>
                                                        <span className={`font-bold uppercase ${promotionStatus === 'Promoted' ? 'text-green-700' : 'text-red-600'}`}>
                                                            {promotionStatus}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold text-slate-800 text-sm uppercase shrink-0 w-40">Form Master's Remark:</span>
                                        <div className="border-b border-dotted border-slate-500 flex-grow pb-1 min-h-[1.5rem]">
                                            <p className="text-sm italic text-slate-800 font-medium">
                                                {student.remark || ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold text-slate-800 text-sm uppercase shrink-0 w-40">Principal's Remark:</span>
                                        <div className="border-b border-dotted border-slate-500 flex-grow pb-1 min-h-[1.5rem]">
                                            <p className="text-sm italic text-slate-800 font-medium">
                                                {principalRemark}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Signatures and Date */}
                                <div className="mt-8 flex items-end justify-between pt-4 border-t-2 border-slate-800">
                                    <div className="text-xs font-bold text-slate-700">
                                        Next Term Begins: <span className="text-slate-900 border-b border-slate-400 px-2">{new Date(nextTermBegins).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>

                                    <div className="flex flex-col items-center -mt-8">
                                        {principalSignature ? (
                                            <img src={principalSignature} alt="Signature" className="h-16 object-contain mb-[-10px] z-10" />
                                        ) : (
                                            <div className="h-12"></div>
                                        )}
                                        <div className="text-sm font-bold text-slate-800 border-t border-slate-800 pt-1 px-8">Principal's Signature</div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center">
                                        <img src={qrCodeUrl} alt="QR" className="w-20 h-20 mb-1" crossOrigin="anonymous" />
                                        <div className="text-[9px] text-slate-500 uppercase tracking-wider">Scan to verify</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

export default ResultsDisplay;
