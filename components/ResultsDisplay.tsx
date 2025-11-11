import React, { forwardRef } from 'react';
import { Result, Student, ReportCardTemplateSettings } from '../types';
import PhotoIcon from './icons/PhotoIcon';
import { getScoreTotal, getGradeInfo, getOrdinalSuffix, getSubjectsForStudent, generateQrCodeUrl } from '../utils';
import { SCHOOL_LOGO_BASE64 } from './assets';
import { AFFECTIVE_DOMAIN_SKILLS, PSYCHOMOTOR_SKILLS, RATING_SCALE } from './BehavioralRatingsManager';

interface ResultsDisplayProps {
  results: Result[];
  studentData: Student[];
  allSubjects: string[]; // This will contain all possible subjects for the section
  classInfo: { level: string; arm: string; term: string; session: string; section: string };
  nextTermBegins: string;
  principalRemark: string;
  totalSchoolDays: string;
  templateSettings: ReportCardTemplateSettings;
}

const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 font-bold';
    if (grade.startsWith('B')) return 'text-blue-600 font-bold';
    if (grade.startsWith('C')) return 'text-yellow-700 font-bold';
    if (grade.startsWith('D')) return 'text-orange-600 font-bold';
    if (grade.startsWith('E')) return 'text-amber-600 font-bold';
    return 'text-red-600 font-bold';
};

const ResultsDisplay = forwardRef<HTMLDivElement, ResultsDisplayProps>(({ results, studentData, allSubjects, classInfo, nextTermBegins, principalRemark, totalSchoolDays, templateSettings }, ref) => {

    if (results.length === 0) return null;

    return (
        <div ref={ref}>
            {results.map(result => {
                const student = studentData.find(s => s.id === result.studentId);
                if (!student) return null;

                const promotionStatus = result.average >= 40 ? 'Promoted' : 'To Repeat';
                const studentSubjects = getSubjectsForStudent(student, classInfo.section.startsWith('Junior') ? 'Junior' : 'Senior');
                
                const qrCodeUrl = generateQrCodeUrl({
                    docType: 'Report Card',
                    studentName: student.name,
                    admissionNo: student.admissionNo,
                    class: `${classInfo.level}-${classInfo.arm}`,
                    session: classInfo.session,
                    term: classInfo.term,
                    average: result.average.toFixed(2),
                    school: templateSettings.schoolName,
                });

                return (
                    <div key={result.studentId} className="report-card-page bg-white p-2 text-slate-800" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', fontFamily: templateSettings.fontFamily }}>
                        <div className="border-2 border-slate-700 p-3 min-h-[290mm] flex flex-col">
                            <header className="flex items-center justify-between border-b-2 border-slate-700 pb-2">
                                <img src={SCHOOL_LOGO_BASE64} alt="School Logo" className="h-24 w-24 object-contain" />
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold uppercase text-slate-800">{templateSettings.schoolName}</h1>
                                    <p className="text-base font-medium">{templateSettings.schoolAddress}</p>
                                    <p className="text-base font-medium">{templateSettings.contactInfo}</p>
                                    <h2 className="text-xl font-semibold uppercase mt-2 text-slate-700">Student's Report Sheet</h2>
                                </div>
                                <div className="w-24 h-28 flex justify-center items-center">
                                     {student.photo ? (
                                        <img src={student.photo} alt={student.name} className="w-24 h-28 object-cover border-2 border-slate-400" />
                                    ) : (
                                        <div className="w-24 h-28 bg-slate-100 flex items-center justify-center border border-slate-400">
                                            <PhotoIcon className="w-10 h-10 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            </header>

                            <section className="text-base my-2">
                                <div className="grid grid-cols-12 gap-x-4 gap-y-1">
                                    <div className="col-span-5"><strong>Student's Name:</strong> <span className="font-normal">{student.name}</span></div>
                                    <div className="col-span-3"><strong>Admission No:</strong> <span className="font-normal">{student.admissionNo}</span></div>
                                    <div className="col-span-4"><strong>Class:</strong> <span className="font-normal">{classInfo.level} {classInfo.arm}</span></div>
                                    <div className="col-span-5"><strong>Section:</strong> <span className="font-normal">{classInfo.section}</span></div>
                                    {student.stream && <div className="col-span-3"><strong>Stream:</strong> <span className="font-normal">{student.stream}</span></div>}
                                    <div className="col-span-4"><strong>Session:</strong> <span className="font-normal">{classInfo.session}</span></div>
                                    <div className="col-span-5"><strong>Term:</strong> <span className="font-normal">{classInfo.term}</span></div>
                                    <div className="col-span-7"><strong>Attendance:</strong> <span className="font-normal">{student.totalAttendance} out of {totalSchoolDays} days</span></div>
                                </div>
                            </section>
                            
                            <div className="grid grid-cols-12 gap-x-4 flex-grow text-sm">
                                <main className="col-span-8">
                                    <h3 className="text-center font-bold bg-slate-200 text-slate-800 py-1.5 mb-1 text-base">ACADEMIC RECORDS</h3>
                                    <table className="w-full border-collapse border border-slate-400">
                                        <thead className="bg-slate-100 text-slate-800 font-bold text-center">
                                            <tr>
                                                <th className="py-1.5 px-2 border border-slate-400 text-left">SUBJECT</th>
                                                <th className="py-1.5 px-2 border border-slate-400">1st CA</th>
                                                <th className="py-1.5 px-2 border border-slate-400">2nd CA</th>
                                                <th className="py-1.5 px-2 border border-slate-400">Exam</th>
                                                <th className="py-1.5 px-2 border border-slate-400">Total</th>
                                                <th className="py-1.5 px-2 border border-slate-400">GRADE</th>
                                                <th className="py-1.5 px-2 border border-slate-400">REMARK</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects.map(subject => {
                                                const score = student.scores[subject] || { firstCA: null, secondCA: null, exam: null };
                                                const total = getScoreTotal(score);
                                                const { grade, remark } = getGradeInfo(total);
                                                return (
                                                    <tr key={subject} className="even:bg-slate-50 align-top">
                                                        <td className="py-1.5 px-2 border border-slate-400 font-semibold text-black">{subject}</td>
                                                        <td className="py-1.5 px-2 border border-slate-400 text-center text-black">{score.firstCA ?? '-'}</td>
                                                        <td className="py-1.5 px-2 border border-slate-400 text-center text-black">{score.secondCA ?? '-'}</td>
                                                        <td className="py-1.5 px-2 border border-slate-400 text-center text-black">{score.exam ?? '-'}</td>
                                                        <td className="py-1.5 px-2 border border-slate-400 text-center font-bold text-black">{total}</td>
                                                        <td className={`py-1.5 px-2 border border-slate-400 text-center ${getGradeColor(grade)}`}>{grade}</td>
                                                        <td className="py-1.5 px-2 border border-slate-400 text-center text-black">{remark}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </main>
                                <aside className="col-span-4 space-y-3">
                                    <div>
                                        <h3 className="text-center font-bold bg-slate-200 text-slate-800 py-1.5 mb-1 text-base">AFFECTIVE DOMAIN</h3>
                                        <table className="w-full border-collapse border border-slate-400">
                                            <tbody>
                                                {AFFECTIVE_DOMAIN_SKILLS.map(skill => {
                                                    const rating = student.affectiveDomain?.[skill] || '';
                                                    const ratingText = rating ? RATING_SCALE[rating].replace(/\s\(.\)/, '') : '-';
                                                    return (
                                                        <tr key={skill} className="even:bg-slate-50 align-top">
                                                            <td className="py-1.5 px-2 border-r border-slate-400 text-black">{skill}</td>
                                                            <td className="py-1.5 px-2 text-center text-black">{ratingText}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <h3 className="text-center font-bold bg-slate-200 text-slate-800 py-1.5 mb-1 text-base">PSYCHOMOTOR SKILLS</h3>
                                        <table className="w-full border-collapse border border-slate-400">
                                            <tbody>
                                                {PSYCHOMOTOR_SKILLS.map(skill => {
                                                    const rating = student.psychomotorSkills?.[skill] || '';
                                                    const ratingText = rating ? RATING_SCALE[rating].replace(/\s\(.\)/, '') : '-';
                                                    return (
                                                        <tr key={skill} className="even:bg-slate-50 align-top">
                                                            <td className="py-1.5 px-2 border-r border-slate-400 text-black">{skill}</td>
                                                            <td className="py-1.5 px-2 text-center text-black">{ratingText}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {templateSettings.showGradeAnalysis && 
                                        <div>
                                            <h3 className="text-center font-bold bg-slate-200 text-slate-800 py-1.5 mb-1 text-base">GRADE SCALE</h3>
                                            <div className="border border-slate-400 p-1.5 text-center text-xs leading-tight">
                                                A1 (75-100) | B2 (70-74) | B3 (65-69) | C4 (60-64) | C5 (55-59) | C6 (50-54) | D7 (45-49) | E8 (40-44) | F9 (0-39)
                                            </div>
                                        </div>
                                    }
                                     <div>
                                        <h3 className="text-center font-bold bg-slate-200 text-slate-800 py-1.5 mb-1 text-base">PERFORMANCE SUMMARY</h3>
                                        <div className="border border-slate-400 p-2 space-y-1.5 text-slate-800">
                                            <div><strong>Total Score:</strong> <span className="float-right font-bold">{result.total.toFixed(2)} / {studentSubjects.length * 100}</span></div>
                                            <div><strong>Average:</strong> <span className="float-right font-bold">{result.average.toFixed(2)}%</span></div>
                                            {templateSettings.showClassPosition && <div><strong>Position in Class:</strong> <span className="float-right font-bold">{getOrdinalSuffix(result.position)}</span></div>}
                                            {templateSettings.showPromotionStatus && <div><strong>Promotion Status:</strong> <span className="float-right font-bold">{promotionStatus}</span></div>}
                                        </div>
                                    </div>
                                </aside>
                            </div>

                            <section className="mt-2 text-base">
                                <div className="mt-2">
                                    <h4 className="font-bold text-slate-800">Form Master's Remark:</h4>
                                    <p className="italic border-b border-dotted border-slate-500 pb-1 min-h-[28px]">{student.remark}</p>
                                </div>
                                <div className="mt-2">
                                    <h4 className="font-bold text-slate-800">Principal's Remark:</h4>
                                    <p className="italic border-b border-dotted border-slate-500 pb-1 min-h-[28px]">{principalRemark}</p>
                                </div>
                            </section>

                            <footer className="mt-auto pt-2 flex justify-between items-end text-base">
                                <p className="font-bold text-slate-800">Next Term Begins: <span className="font-normal">{new Date(nextTermBegins + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
                                <div className="text-center">
                                    <p className="border-t-2 border-slate-600 px-8 pt-1 font-bold text-slate-800">Principal's Signature</p>
                                </div>
                                 {templateSettings.showQRCode &&
                                    <div className="text-center">
                                        <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" crossOrigin="anonymous" />
                                        <p className="text-sm text-slate-500">Scan to verify</p>
                                    </div>
                                }
                            </footer>
                        </div>
                    </div>
                )
            })}
        </div>
    );
});

export default ResultsDisplay;