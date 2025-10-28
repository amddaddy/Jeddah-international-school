import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Student, Result } from './types';
import { GoogleGenAI } from '@google/genai';
import Header from './components/Header';
import WorkflowTabs from './components/WorkflowTabs';
import SetupStep from './components/SetupStep';
import ScoreEntryStep from './components/ScoreEntryStep';
import FinalizeStep from './components/FinalizeStep';
import ResultsDisplay from './components/ResultsDisplay';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([
        { id: '1', name: 'John Doe', scores: {}, totalAttendance: 0, photo: undefined, remark: '' }
    ]);
    const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'English Language', 'Basic Science']);
    const [currentStep, setCurrentStep] = useState<'setup' | 'scores' | 'finalize'>('setup');

    const secondaryLevels = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
    const [levels] = useState(secondaryLevels);
    const [arms] = useState(['A', 'B', 'C']);
    const [selectedLevel, setSelectedLevel] = useState('JSS 1');
    const [selectedArm, setSelectedArm] = useState('A');

    const [results, setResults] = useState<Result[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingRemarks, setIsGeneratingRemarks] = useState(false);
    
    const [nextTermBegins, setNextTermBegins] = useState(new Date().toISOString().split('T')[0]);
    const [term, setTerm] = useState('Second Term');
    const [session, setSession] = useState('2023/2024');
    const [principalName, setPrincipalName] = useState('Dr. Amina Al-Farsi');
    const [totalSchoolDays, setTotalSchoolDays] = useState('100');
    
    const [selectedSubjectForEntry, setSelectedSubjectForEntry] = useState<string | null>(null);

    useEffect(() => {
        if (subjects.length > 0 && !selectedSubjectForEntry) {
            setSelectedSubjectForEntry(subjects[0]);
        } else if (subjects.length > 0 && selectedSubjectForEntry && !subjects.includes(selectedSubjectForEntry)) {
            setSelectedSubjectForEntry(subjects[0]);
        } else if (subjects.length === 0) {
            setSelectedSubjectForEntry(null);
        }
    }, [subjects, selectedSubjectForEntry]);


    const reportRef = useRef<HTMLDivElement>(null);

    const handleAddStudent = () => {
        setStudents([...students, { id: Date.now().toString(), name: '', scores: {}, totalAttendance: 0, photo: undefined, remark: '' }]);
    };

    const handleRemoveStudent = (id: string) => {
        setStudents(students.filter((s) => s.id !== id));
    };

    const handleStudentChange = (updatedStudent: Student) => {
        setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    };
    
    const calculateResults = useCallback((studentData: Student[]): Omit<Result, 'remark'>[] => {
        const studentTotals = studentData.map(student => {
            const total = subjects.reduce((acc, subject) => {
                const s = student.scores[subject];
                if (!s) return acc;
                const firstCA = s.firstCA === 'ABS' || s.firstCA === null ? 0 : s.firstCA;
                const secondCA = s.secondCA === 'ABS' || s.secondCA === null ? 0 : s.secondCA;
                const exam = s.exam === 'ABS' || s.exam === null ? 0 : s.exam;
                return acc + firstCA + secondCA + exam;
            }, 0);
            const average = subjects.length > 0 ? total / subjects.length : 0;
            return { studentId: student.id, name: student.name, total, average };
        });

        studentTotals.sort((a, b) => b.total - a.total);

        return studentTotals.map((studentResult, index) => ({
            ...studentResult,
            position: index + 1,
        }));
    }, [subjects]);


    const handleGenerateAIRemarks = async (): Promise<Student[]> => {
        setIsGeneratingRemarks(true);
        let updatedStudents = [...students];

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const calculatedResults = calculateResults(students);

            for (let i = 0; i < students.length; i++) {
                const student = students[i];
                const result = calculatedResults.find(r => r.studentId === student.id);
                if (!result) continue;

                const scoresSummary = subjects.map(subject => {
                    const s = student.scores[subject];
                    if (!s) return `${subject}: N/A`;
                    const firstCA = s.firstCA ?? 0;
                    const secondCA = s.secondCA ?? 0;
                    const exam = s.exam ?? 0;
                    const total = (firstCA === 'ABS' ? 0 : firstCA) + (secondCA === 'ABS' ? 0 : secondCA) + (exam === 'ABS' ? 0 : exam);
                    return `${subject}: ${total}/100`;
                }).join(', ');
                
                const prompt = `You are a thoughtful and encouraging class teacher writing a report card remark for a student in ${selectedLevel}.
                Student's Name: ${student.name}
                Academic Performance:
                - Position in Class: ${result.position} out of ${calculatedResults.length}
                - Average Score: ${result.average.toFixed(2)}%
                - Scores: ${scoresSummary}
                Attendance: ${student.totalAttendance} out of ${totalSchoolDays} days attended.

                Based on this data, write a personalized and constructive remark of about 2-3 sentences. Focus on their strengths and areas for improvement. Be positive and motivating.`;

                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                    });
                    updatedStudents = updatedStudents.map(s => s.id === student.id ? { ...s, remark: response.text } : s);
                } catch (err) {
                    console.error(`Failed to generate remark for ${student.name}`, err);
                    const fallbackRemark = result.average >= 70 ? 'Excellent' : result.average >= 60 ? 'Very Good' : result.average >= 50 ? 'Good' : result.average >= 40 ? 'Fair' : 'Needs Improvement';
                    updatedStudents = updatedStudents.map(s => s.id === student.id ? { ...s, remark: fallbackRemark } : s);
                }
            }
            setStudents(updatedStudents);
        } catch (error) {
            console.error("Error setting up AI for remarks:", error);
            alert("Failed to generate AI remarks. Please check your API key or network connection.");
        } finally {
            setIsGeneratingRemarks(false);
        }
        return updatedStudents;
    };


    const handleGenerateReports = async () => {
        setIsGenerating(true);
        
        const remarksMissing = students.some(s => !s.remark || s.remark.trim() === '');
        let studentsForReport = students;

        if (remarksMissing) {
            studentsForReport = await handleGenerateAIRemarks();
        }

        const calculated = calculateResults(studentsForReport);
        const finalResults = calculated.map(res => {
            const student = studentsForReport.find(s => s.id === res.studentId);
            return {
                ...res,
                remark: student?.remark || 'N/A',
            };
        });
        setResults(finalResults);

        setTimeout(async () => {
            if (reportRef.current) {
                try {
                    const reportElements = reportRef.current.querySelectorAll('.report-card-page');
                     if (reportElements.length === 0) {
                        alert("No students to generate reports for.");
                        setIsGenerating(false);
                        return;
                    }
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    for (let i = 0; i < reportElements.length; i++) {
                        const element = reportElements[i] as HTMLElement;
                        const canvas = await html2canvas(element, { scale: 2 });
                        const imgData = canvas.toDataURL('image/png');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = pdf.internal.pageSize.getHeight();
                        
                        if (i > 0) {
                            pdf.addPage();
                        }
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    }
                    
                    pdf.save(`report-cards-${selectedLevel}-${selectedArm}.pdf`);
                } catch (error) {
                    console.error("Error generating PDF:", error);
                    alert("There was an error generating the PDF. Please check the console for details.");
                }
            }
            setIsGenerating(false);
        }, 1000);
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <Header studentsCount={students.length} />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WorkflowTabs currentStep={currentStep} setCurrentStep={setCurrentStep} />
                
                <div className="mt-8">
                    {currentStep === 'setup' && (
                        <SetupStep
                            levels={levels}
                            arms={arms}
                            selectedLevel={selectedLevel}
                            selectedArm={selectedArm}
                            onLevelChange={setSelectedLevel}
                            onArmChange={setSelectedArm}
                            subjects={subjects}
                            setSubjects={setSubjects}
                            students={students}
                            onAddStudent={handleAddStudent}
                            onRemoveStudent={handleRemoveStudent}
                            onStudentChange={handleStudentChange}
                        />
                    )}

                    {currentStep === 'scores' && (
                        <ScoreEntryStep
                            students={students}
                            subjects={subjects}
                            selectedSubject={selectedSubjectForEntry}
                            onSelectSubject={setSelectedSubjectForEntry}
                            onStudentChange={handleStudentChange}
                            classInfo={{ level: selectedLevel, arm: selectedArm }}
                        />
                    )}

                    {currentStep === 'finalize' && (
                        <FinalizeStep
                            students={students}
                            subjects={subjects}
                            onStudentChange={handleStudentChange}
                            classInfo={{ level: selectedLevel, arm: selectedArm }}
                            reportSettings={{
                                nextTermBegins, setNextTermBegins,
                                term, setTerm,
                                session, setSession,
                                principalName, setPrincipalName,
                                totalSchoolDays, setTotalSchoolDays
                            }}
                            actions={{
                                handleGenerateAIRemarks,
                                handleGenerateReports,
                                isGenerating,
                                isGeneratingRemarks
                            }}
                        />
                    )}
                </div>

                <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                  <ResultsDisplay 
                      ref={reportRef}
                      results={results}
                      studentData={students}
                      subjects={subjects}
                      classInfo={{ level: selectedLevel, arm: selectedArm, term, session }}
                      nextTermBegins={nextTermBegins}
                      principalName={principalName}
                      totalSchoolDays={totalSchoolDays}
                  />
                </div>
            </main>
        </div>
    );
};

export default App;