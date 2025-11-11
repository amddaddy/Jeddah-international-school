

import React, { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Student, Result, Payment, FeeItem, Invoice, TemplateSettings, Permissions, Role, Permission, SchoolInfo } from './types';
import { ai } from './lib/ai';
import Header from './components/Header';
import WorkflowTabs from './components/WorkflowTabs';
import ResultsDisplay from './components/ResultsDisplay';
import SubjectWiseReport from './components/SubjectWiseReport';
import BroadsheetReport from './components/BroadsheetReport';
import PaymentReceipt from './components/PaymentReceipt';
import SchoolFeesInvoice from './components/SchoolFeesInvoice';
import { getScoreTotal, getGradeInfo, getSubjectsForStudent, generatePdf, JUNIOR_SUBJECTS, SENIOR_CORE_SUBJECTS, SCIENCE_SUBJECTS, ART_SUBJECTS, COMMERCE_SUBJECTS, ALL_SENIOR_SUBJECTS } from './utils';
import { useAuth } from './hooks/useAuth';
import SpinnerIcon from './components/icons/SpinnerIcon';

const Dashboard = lazy(() => import('./components/Dashboard'));
const SetupStep = lazy(() => import('./components/SetupStep'));
const ScoreEntryStep = lazy(() => import('./components/ScoreEntryStep'));
const FinalizeStep = lazy(() => import('./components/FinalizeStep'));
const PaymentsStep = lazy(() => import('./components/PaymentsStep'));
const InvoicingStep = lazy(() => import('./components/InvoicingStep'));
const TemplatesStep = lazy(() => import('./components/TemplatesStep'));
const SystemGuide = lazy(() => import('./components/SystemGuide'));
const AccessControlStep = lazy(() => import('./components/AccessControlStep'));


const initialPermissions: Permissions = {
    admin: {
        dashboard: true,
        setup: true,
        templates: true,
        scores: true,
        invoicing: true,
        payments: true,
        finalize: true,
        guide: true,
        access_control: true,
    },
    teacher: {
        dashboard: true,
        setup: false,
        templates: false,
        scores: true,
        invoicing: false,
        payments: false,
        finalize: true,
        guide: true,
        access_control: false,
    },
    accountant: {
        dashboard: true,
        setup: false,
        templates: false,
        scores: false,
        invoicing: true,
        payments: true,
        finalize: false,
        guide: true,
        access_control: false,
    },
    student: {
        dashboard: false,
        setup: false,
        templates: false,
        scores: false,
        invoicing: false,
        payments: false,
        finalize: false,
        guide: true,
        access_control: false,
    },
    parent: {
        dashboard: false,
        setup: false,
        templates: false,
        scores: false,
        invoicing: false,
        payments: false,
        finalize: false,
        guide: true,
        access_control: false,
    },
};

const initialStudentsByClass: Record<string, Student[]> = {
    'SS 1-A': [
         { id: '1', name: 'Darius Ekojoka ABAH', scores: {}, totalAttendance: 115, photo: undefined, remark: '', admissionNo: 'WPA0018', gender: 'Male', dob: '2010-05-15', parentName: 'Mr. Patrick Ogwu Abah', stream: 'Science', payments: [], invoices: [], affectiveDomain: {}, psychomotorSkills: {} },
         { id: '2', name: 'Blessing ADAMS', scores: {}, totalAttendance: 118, photo: undefined, remark: '', admissionNo: 'WPA0019', gender: 'Female', dob: '2010-07-22', parentName: 'Mrs. Adams', stream: 'Art', payments: [], invoices: [], affectiveDomain: {}, psychomotorSkills: {} },
         { id: '3', name: 'Charles BINO', scores: {}, totalAttendance: 110, photo: undefined, remark: '', admissionNo: 'WPA0020', gender: 'Male', dob: '2010-03-10', parentName: 'Mr. Bino', stream: 'Commerce', payments: [], invoices: [], affectiveDomain: {}, psychomotorSkills: {} },
         { id: '4', name: 'Zainab MUSA', scores: {}, totalAttendance: 120, photo: undefined, remark: '', admissionNo: 'WPA0021', gender: 'Female', dob: '2010-09-01', parentName: 'Alhaji Musa', stream: 'Science', payments: [], invoices: [], affectiveDomain: {}, psychomotorSkills: {} },
    ]
};

const EMPTY_SUBJECTS: string[] = [];

const App: React.FC = () => {
    const { currentUser, logout, schoolInfo, setupSchool, clearAllData } = useAuth();
    
    const userPermissions = currentUser ? initialPermissions[currentUser.role] : ({} as Record<Permission, boolean>);
    const defaultStep = userPermissions.dashboard ? 'dashboard' : 'guide';

    const [currentStep, setCurrentStep] = useState<'dashboard' | 'setup' | 'templates' | 'scores' | 'invoicing' | 'payments' | 'finalize' | 'guide' | 'access_control'>(defaultStep);

    const juniorLevels = ['JSS 1', 'JSS 2', 'JSS 3'];
    const seniorLevels = ['SS 1', 'SS 2', 'SS 3'];
    const allArms = ['A', 'B', 'C'];
    
    const [selectedSection, setSelectedSection] = useState<'Junior' | 'Senior'>('Senior');
    const [selectedStream, setSelectedStream] = useState<'All' | 'Science' | 'Art' | 'Commerce'>('All');

    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedArm, setSelectedArm] = useState('');

    const availableLevelsKey = useMemo(() => {
        const levelsForSection = selectedSection === 'Junior' ? juniorLevels : seniorLevels;
        if (currentUser?.role === 'teacher' && currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
            const assignedLevels = new Set(currentUser.assignedClasses.map(ac => ac.classKey.split('-')[0]));
            return levelsForSection.filter(level => assignedLevels.has(level)).join(',');
        }
        return levelsForSection.join(',');
    }, [currentUser, selectedSection]);

    const availableLevels = useMemo(() => {
        return availableLevelsKey ? availableLevelsKey.split(',') : [];
    }, [availableLevelsKey]);

    const validLevel = useMemo(() => {
        if (availableLevels.includes(selectedLevel)) {
            return selectedLevel;
        }
        return availableLevels[0] || '';
    }, [availableLevels, selectedLevel]);

    const availableArmsKey = useMemo(() => {
        if (currentUser?.role === 'teacher' && currentUser.assignedClasses) {
            const arms = Array.from(new Set(
                currentUser.assignedClasses
                    .filter(ac => ac.classKey.startsWith(validLevel))
                    .map(ac => ac.classKey.split('-')[1])
                    .filter(Boolean) as string[]
            ));
            return arms.join(',');
        }
        return allArms.join(',');
    }, [currentUser, validLevel]);

    const availableArms = useMemo(() => {
        if (availableArmsKey === '') return [];
        return availableArmsKey.split(',');
    }, [availableArmsKey]);
    
    const validArm = useMemo(() => {
        if (availableArms.includes(selectedArm)) {
            return selectedArm;
        }
        return availableArms[0] || '';
    }, [availableArms, selectedArm]);

    useEffect(() => {
      if (selectedSection === 'Junior') {
        setSelectedStream('All');
      }
    }, [selectedSection]);
    
    const [studentsByClass, setStudentsByClass] = useState(initialStudentsByClass);
    const classKey = useMemo(() => `${validLevel}-${validArm}`, [validLevel, validArm]);
    
    const studentsForClass = useMemo(() => studentsByClass[classKey] || [], [studentsByClass, classKey]);

    const students = useMemo(() => {
        if (selectedStream === 'All') {
            return studentsForClass;
        }
        return studentsForClass.filter(s => s.stream === selectedStream);
    }, [studentsForClass, selectedStream]);


     const sectionName = useMemo(() => {
        return validLevel.startsWith('JSS') ? 'Junior Secondary School' : 'Senior Secondary School';
    }, [validLevel]);

    const subjectsForClass = useMemo(() => {
        return selectedSection === 'Junior' ? JUNIOR_SUBJECTS : ALL_SENIOR_SUBJECTS;
    }, [selectedSection]);

    const teacherSubjectsForSelectedClass = useMemo(() => {
        if (currentUser?.role === 'teacher' && currentUser.assignedClasses) {
            const assignment = currentUser.assignedClasses.find(ac => ac.classKey === classKey);
            return assignment ? assignment.subjects : EMPTY_SUBJECTS;
        }
        return subjectsForClass;
    }, [currentUser, classKey, subjectsForClass]);


    const [results, setResults] = useState<Result[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingRemarks, setIsGeneratingRemarks] = useState(false);
    
    const [nextTermBegins, setNextTermBegins] = useState('2025-09-15');
    const [term, setTerm] = useState('Third Term');
    const [session, setSession] = useState('2024/2025');
    const [principalRemark, setPrincipalRemark] = useState("We encourage every student to continue to apply themselves diligently to their studies. We are here to support their growth and look forward to their continued progress next term.");
    const [totalSchoolDays, setTotalSchoolDays] = useState('120');
    
    const [selectedSubjectForEntry, setSelectedSubjectForEntry] = useState<string | null>(null);

    const [selectedSubjectForReport, setSelectedSubjectForReport] = useState<string>('');
    const [subjectWiseAIComment, setSubjectWiseAIComment] = useState('');
    const [isGeneratingSubjectReport, setIsGeneratingSubjectReport] = useState(false);

    const [broadsheetAIAnalysis, setBroadsheetAIAnalysis] = useState('');
    const [isGeneratingBroadsheet, setIsGeneratingBroadsheet] = useState(false);
    const [broadsheetResults, setBroadsheetResults] = useState<Result[]>([]);

    const [studentForReceipt, setStudentForReceipt] = useState<Student | null>(null);
    const [paymentForReceipt, setPaymentForReceipt] = useState<Payment | null>(null);
    const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

    const [feeItems, setFeeItems] = useState<FeeItem[]>([
        { id: '1', name: 'Registration Fee', amount: 1000, type: 'required' },
        { id: '2', name: 'Library Fee', amount: 50000, type: 'required' },
        { id: '3', name: 'ICT Fee', amount: 6000, type: 'required' },
        { id: '4', name: 'Uniforms', amount: 300, type: 'optional' },
    ]);
    const [studentForInvoice, setStudentForInvoice] = useState<Student | null>(null);
    const [invoiceForPrinting, setInvoiceForPrinting] = useState<Invoice | null>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    
    // START: Refactored Template Settings State Management
    const [templateUiSettings, setTemplateUiSettings] = useState({
        reportCard: {
            fontFamily: 'Arial' as 'Arial' | 'Times New Roman' | 'Verdana',
            showGradeAnalysis: true,
            showQRCode: true,
            showClassPosition: true,
            showPromotionStatus: true,
        },
        subjectWise: {
            showSummary: true,
            showPerformanceIndicators: true,
            showPerformanceBar: true,
        },
        broadsheet: {
            showSubjectAverage: true,
            showHighestScore: true,
            showLowestScore: true,
        }
    });

    const templateSettings: TemplateSettings = useMemo(() => ({
        ...templateUiSettings,
        reportCard: {
            ...templateUiSettings.reportCard,
            schoolName: schoolInfo?.schoolName || 'Your School Name',
            schoolAddress: schoolInfo?.schoolAddress || '123 Education Lane, Knowledge City, 12345',
            contactInfo: schoolInfo?.contactInfo || 'Tel: (123) 456-7890, Email: contact@yourschool.com',
        }
    }), [templateUiSettings, schoolInfo]);

    const handleSettingsChange = useCallback((newSettings: TemplateSettings | ((prev: TemplateSettings) => TemplateSettings)) => {
        const finalNewSettings = typeof newSettings === 'function' ? newSettings(templateSettings) : newSettings;

        setTemplateUiSettings({
            reportCard: {
                fontFamily: finalNewSettings.reportCard.fontFamily,
                showGradeAnalysis: finalNewSettings.reportCard.showGradeAnalysis,
                showQRCode: finalNewSettings.reportCard.showQRCode,
                showClassPosition: finalNewSettings.reportCard.showClassPosition,
                showPromotionStatus: finalNewSettings.reportCard.showPromotionStatus,
            },
            subjectWise: finalNewSettings.subjectWise,
            broadsheet: finalNewSettings.broadsheet,
        });

        if (currentUser?.role === 'admin' && setupSchool) {
            const newSchoolInfo: SchoolInfo = {
                schoolName: finalNewSettings.reportCard.schoolName,
                schoolAddress: finalNewSettings.reportCard.schoolAddress,
                contactInfo: finalNewSettings.reportCard.contactInfo,
            };

            const hasChanged = !schoolInfo || 
                newSchoolInfo.schoolName !== schoolInfo.schoolName ||
                newSchoolInfo.schoolAddress !== schoolInfo.schoolAddress ||
                newSchoolInfo.contactInfo !== schoolInfo.contactInfo;

            if (hasChanged) {
                setupSchool(newSchoolInfo);
            }
        }
    }, [currentUser, schoolInfo, setupSchool, templateSettings]);
    // END: Refactored Template Settings State Management

    const [permissions, setPermissions] = useState<Permissions>(initialPermissions);
    
    const [documentToRender, setDocumentToRender] = useState<string | null>(null);

    useEffect(() => {
        const firstAvailableSubject = teacherSubjectsForSelectedClass.length > 0 ? teacherSubjectsForSelectedClass[0] : null;
    
        setSelectedSubjectForEntry(current => {
            if (!current || !teacherSubjectsForSelectedClass.includes(current)) {
                return firstAvailableSubject;
            }
            return current;
        });
    
        setSelectedSubjectForReport(current => {
            if (!current || !teacherSubjectsForSelectedClass.includes(current)) {
                return firstAvailableSubject || '';
            }
            return current;
        });
    }, [teacherSubjectsForSelectedClass.join(',')]);


    const reportRef = React.useRef<HTMLDivElement>(null);
    const subjectReportRef = React.useRef<HTMLDivElement>(null);
    const broadsheetRef = React.useRef<HTMLDivElement>(null);
    const receiptRef = React.useRef<HTMLDivElement>(null);
    const invoiceRef = React.useRef<HTMLDivElement>(null);


    const handleAddStudent = useCallback(() => {
        const newStudent = {
            id: Date.now().toString(),
            name: '',
            scores: {},
            totalAttendance: 0,
            photo: undefined,
            remark: '',
            admissionNo: '',
            gender: '' as const,
            dob: '',
            parentName: '',
            payments: [] as Payment[],
            invoices: [] as Invoice[],
            stream: undefined,
            affectiveDomain: {},
            psychomotorSkills: {},
        };
        setStudentsByClass(prev => {
            const currentClassStudents = prev[classKey] || [];
            return { ...prev, [classKey]: [...currentClassStudents, newStudent] };
        });
    }, [classKey]);

    const handleRemoveStudent = useCallback((id: string) => {
        setStudentsByClass(prev => {
            const currentClassStudents = prev[classKey] || [];
            return { ...prev, [classKey]: currentClassStudents.filter((s) => s.id !== id) };
        });
    }, [classKey]);

    const handleStudentChange = useCallback((updatedStudent: Student) => {
        setStudentsByClass(prev => {
            const currentClassStudents = prev[classKey] || [];
            return { ...prev, [classKey]: currentClassStudents.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)) };
        });
    }, [classKey]);
    
    const calculateResults = useCallback((studentData: Student[]): Result[] => {
        const studentTotals = studentData.map(student => {
            const studentSubjects = getSubjectsForStudent(student, selectedSection);
            const total = studentSubjects.reduce((acc, subject) => acc + getScoreTotal(student.scores[subject]), 0);
            const average = studentSubjects.length > 0 ? total / studentSubjects.length : 0;
            return { studentId: student.id, name: student.name, total, average, stream: student.stream };
        });

        studentTotals.sort((a, b) => b.total - a.total);

        return studentTotals.map((studentResult, index) => ({
            ...studentResult,
            position: index + 1,
        }));
    }, [selectedSection]);


    const handleGenerateAIRemarks = useCallback(async (): Promise<Student[]> => {
        setIsGeneratingRemarks(true);
        let updatedStudents = [...studentsForClass];

        try {
            const calculatedResults = calculateResults(studentsForClass);

            const studentDataForPrompt = studentsForClass.map(student => {
                const result = calculatedResults.find(r => r.studentId === student.id);
                if (!result) return null;
                const studentSubjects = getSubjectsForStudent(student, selectedSection);
                const scoresSummary = studentSubjects.map(subject => {
                    const total = getScoreTotal(student.scores[subject]);
                    return `${subject}: ${total}/100`;
                }).join(', ');

                return {
                    id: student.id, name: student.name,
                    position: `${result.position} out of ${studentsForClass.length}`,
                    average: `${result.average.toFixed(2)}%`,
                    attendance: `${student.totalAttendance} out of ${totalSchoolDays} days`,
                    scores: scoresSummary
                };
            }).filter(Boolean);

            if (studentDataForPrompt.length === 0) {
                setIsGeneratingRemarks(false);
                return studentsForClass;
            }
            
            const prompt = `You are a thoughtful and encouraging Form Master writing report card remarks for a class of students.
            Here is the data for multiple students: ${JSON.stringify(studentDataForPrompt, null, 2)}
            Based on this data, for each student, write a personalized and constructive "Form Master's Remark" of about 2-4 sentences.
            Mention their overall performance. Highlight 2-3 strong subjects. If attendance is low, gently mention its importance. The tone must be positive, encouraging, and professional.
            Return the result as a JSON array of objects, where each object has "studentId" and "remark".`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT', properties: { studentId: { type: 'STRING' }, remark: { type: 'STRING' } }, required: ["studentId", "remark"],
                        },
                    },
                },
            });
            
            const remarksData: { studentId: string, remark: string }[] = JSON.parse(response.text.trim());
            updatedStudents = studentsForClass.map(student => {
                const remarkData = remarksData.find(r => r.studentId === student.id);
                return remarkData ? { ...student, remark: remarkData.remark } : student;
            });
            setStudentsByClass(prev => ({ ...prev, [classKey]: updatedStudents }));

        } catch (error) {
            console.error("Error generating AI remarks:", error);
            alert("Failed to generate AI remarks. Please check your API key or network connection. Falling back to simple remarks.");
            const calculatedResults = calculateResults(studentsForClass);
            updatedStudents = studentsForClass.map(student => {
                const result = calculatedResults.find(r => r.studentId === student.id);
                const fallbackRemark = result ? (result.average >= 75 ? 'Excellent performance.' : result.average >= 50 ? 'Good effort.' : 'Needs improvement.') : 'N/A';
                return { ...student, remark: fallbackRemark };
            });
            setStudentsByClass(prev => ({ ...prev, [classKey]: updatedStudents }));
        } finally {
            setIsGeneratingRemarks(false);
        }
        return updatedStudents;
    }, [studentsForClass, calculateResults, totalSchoolDays, selectedSection, classKey]);

    const handleGenerateReports = useCallback(async () => {
        setIsGenerating(true);
        const remarksMissing = studentsForClass.some(s => !s.remark || s.remark.trim() === '');
        let studentsForReport = studentsForClass;
        if (remarksMissing) {
            studentsForReport = await handleGenerateAIRemarks();
        }
        const calculated = calculateResults(studentsForReport);
        const finalResults = calculated.map(res => ({
            ...res, remark: studentsForReport.find(s => s.id === res.studentId)?.remark || 'N/A',
        }));
        setResults(finalResults);
        setDocumentToRender('reportCard');
    }, [studentsForClass, calculateResults, handleGenerateAIRemarks]);

    const handleGenerateSubjectWiseAIComment = useCallback(async (subject: string) => {
        setSubjectWiseAIComment('Generating comment...');
        const totalStudents = studentsForClass.length;
        if (totalStudents === 0) {
            setSubjectWiseAIComment('No students in the class.');
            return;
        }
        const subjectScores = studentsForClass.map(s => getScoreTotal(s.scores[subject]));
        const classAverage = subjectScores.reduce((a, b) => a + b, 0) / totalStudents;
        const gradeCounts = subjectScores.reduce((acc, score) => {
            const { grade } = getGradeInfo(score);
            acc[grade] = (acc[grade] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const gradeDistributionString = Object.entries(gradeCounts).map(([grade, count]) => `${grade}: ${count}`).join(', ');

        const prompt = `You are an experienced head of department writing a summary for a subject-wise performance report.
        Subject: ${subject}, Class: ${classKey}, Total Students: ${totalStudents}, Class Average Score: ${classAverage.toFixed(1)}%, Grade Distribution: ${gradeDistributionString}.
        Based on this data, write a professional and insightful "General Comments" paragraph. Summarize the overall performance, mention high-achievers and struggling students, and conclude with a recommendation.`;

         try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setSubjectWiseAIComment(response.text);
        } catch (error) {
            console.error("Error generating subject-wise AI comment:", error);
            setSubjectWiseAIComment("Failed to generate AI comment. Please check your connection or API key.");
        }
    }, [studentsForClass, classKey]);
    
    const handleGenerateSubjectReport = useCallback(async () => {
        if (!selectedSubjectForReport) {
            alert("Please select a subject to generate a report for.");
            return;
        }
        setIsGeneratingSubjectReport(true);
        await handleGenerateSubjectWiseAIComment(selectedSubjectForReport);
        setDocumentToRender('subjectReport');
    }, [selectedSubjectForReport, handleGenerateSubjectWiseAIComment]);

     const handleGenerateBroadsheetAIAnalysis = useCallback(async (results: Result[], subjectStats: any) => {
        setBroadsheetAIAnalysis('Generating analysis...');
        const totalStudents = studentsForClass.length;
        const passCount = results.filter(r => r.average >= 40).length;
        const passRate = (passCount / totalStudents) * 100;
        const performanceDistribution = {
            exceptional: results.filter(r => r.average >= 80).length,
            good: results.filter(r => r.average >= 60 && r.average < 80).length,
            fair: results.filter(r => r.average >= 50 && r.average < 60).length,
            poor: results.filter(r => r.average < 50).length,
        };
        const prompt = `You are a school principal writing a "Comprehensive Performance Analysis" for a class broadsheet.
        Class: ${classKey}, Session: ${session}, Term: ${term}, Total Students: ${totalStudents}, Pass Rate: ${passRate.toFixed(2)}%.
        Performance Distribution: ${performanceDistribution.exceptional} exceptional, ${performanceDistribution.good} good, ${performanceDistribution.fair} fair, ${performanceDistribution.poor} poor.
        Provide a detailed analysis covering: Overall Assessment, Subject Performance, Distribution Insights, and actionable Recommendations.`;
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setBroadsheetAIAnalysis(response.text);
        } catch (error) {
            console.error("Error generating broadsheet AI analysis:", error);
            setBroadsheetAIAnalysis("Failed to generate AI analysis. Please check your connection or API key.");
        }
    }, [studentsForClass.length, classKey, session, term]);
    
    const handleGenerateBroadsheet = useCallback(async () => {
        setIsGeneratingBroadsheet(true);
        const calculatedResults = calculateResults(studentsForClass);
        setBroadsheetResults(calculatedResults);
        const subjectStats = subjectsForClass.reduce((acc, subject) => {
            const scores = studentsForClass.map(s => getScoreTotal(s.scores[subject])).filter(s => typeof s === 'number');
            if (scores.length > 0) {
                acc[subject] = {
                    average: scores.reduce((a, b) => a + b, 0) / scores.length,
                    highest: Math.max(...scores),
                    lowest: Math.min(...scores)
                };
            }
            return acc;
        }, {} as any);
        await handleGenerateBroadsheetAIAnalysis(calculatedResults, subjectStats);
        setDocumentToRender('broadsheet');
    }, [calculateResults, studentsForClass, subjectsForClass, handleGenerateBroadsheetAIAnalysis]);

    const handleAddPayment = useCallback((studentId: string, payment: Omit<Payment, 'id' | 'receiptNo' | 'invoiceNo' | 'date'>) => {
        const timestamp = Date.now();
        const fullPayment: Payment = {
            id: `PAY-${timestamp}`, receiptNo: `PMT-${timestamp.toString(36).toUpperCase()}`,
            invoiceNo: `INV-${timestamp.toString(36).toUpperCase()}`, date: new Date().toISOString(), ...payment,
        };
        handleStudentChange({ ...studentsForClass.find(s => s.id === studentId)!, payments: [...(studentsForClass.find(s => s.id === studentId)?.payments || []), fullPayment] });
    }, [studentsForClass, handleStudentChange]);

    const handlePrintReceipt = useCallback((studentId: string, paymentId: string) => {
        const student = studentsForClass.find(s => s.id === studentId);
        const payment = student?.payments?.find(p => p.id === paymentId);
        if (student && payment) {
            setIsGeneratingReceipt(true);
            setStudentForReceipt(student);
            setPaymentForReceipt(payment);
            setDocumentToRender('receipt');
        }
    }, [studentsForClass]);
    
    const handleGenerateInvoice = useCallback((studentId: string) => {
        const timestamp = Date.now();
        const totalRequired = feeItems.filter(f => f.type === 'required').reduce((sum, f) => sum + f.amount, 0);
        const totalOptional = feeItems.filter(f => f.type === 'optional').reduce((sum, f) => sum + f.amount, 0);
        const newInvoice: Invoice = {
            id: `INV-${timestamp}`, invoiceNo: `INV-${timestamp.toString(36).toUpperCase()}`,
            date: new Date().toISOString(), studentId, feeItems, totalRequired, totalOptional,
            totalAmount: totalRequired + totalOptional,
        };
        handleStudentChange({ ...studentsForClass.find(s => s.id === studentId)!, invoices: [...(studentsForClass.find(s => s.id === studentId)?.invoices || []), newInvoice] });
    }, [feeItems, studentsForClass, handleStudentChange]);
    
    const handlePrintInvoice = useCallback((studentId: string, invoiceId: string) => {
        const student = studentsForClass.find(s => s.id === studentId);
        const invoice = student?.invoices?.find(i => i.id === invoiceId);
        if (student && invoice) {
            setIsGeneratingInvoice(true);
            setStudentForInvoice(student);
            setInvoiceForPrinting(invoice);
            setDocumentToRender('invoice');
        }
    }, [studentsForClass]);


    useEffect(() => {
        if (!documentToRender) return;

        const generate = async () => {
            // A short delay to allow React to render the component off-screen
            await new Promise(resolve => setTimeout(resolve, 100));
            
            try {
                switch (documentToRender) {
                    case 'reportCard':
                        await generatePdf(reportRef, `report-cards-${classKey}.pdf`, 'p');
                        break;
                    case 'subjectReport':
                        await generatePdf(subjectReportRef, `subject-report-${selectedSubjectForReport.replace(/\s+/g, '-')}-${classKey}.pdf`, 'p');
                        setSubjectWiseAIComment('');
                        break;
                    case 'broadsheet':
                        await generatePdf(broadsheetRef, `broadsheet-${classKey}.pdf`, 'l');
                        setBroadsheetAIAnalysis('');
                        break;
                    case 'receipt':
                        if (studentForReceipt && paymentForReceipt) {
                            await generatePdf(receiptRef, `receipt-${studentForReceipt.name.replace(/\s/g, '_')}-${paymentForReceipt.receiptNo}.pdf`, 'p', [80, 160]);
                        }
                        setStudentForReceipt(null);
                        setPaymentForReceipt(null);
                        break;
                    case 'invoice':
                        if (studentForInvoice && invoiceForPrinting) {
                            await generatePdf(invoiceRef, `invoice-${studentForInvoice.name.replace(/\s/g, '_')}-${invoiceForPrinting.invoiceNo}.pdf`, 'p');
                        }
                        setStudentForInvoice(null);
                        setInvoiceForPrinting(null);
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error(`Error generating PDF for ${documentToRender}:`, error);
                alert("An error occurred while generating the PDF.");
            } finally {
                // Reset all generating states
                setIsGenerating(false);
                setIsGeneratingSubjectReport(false);
                setIsGeneratingBroadsheet(false);
                setIsGeneratingReceipt(false);
                setIsGeneratingInvoice(false);
                // Unmount the component
                setDocumentToRender(null);
            }
        };

        generate();
    }, [documentToRender, classKey, selectedSubjectForReport, studentForReceipt, paymentForReceipt, studentForInvoice, invoiceForPrinting]);


    if (!currentUser) return null;

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <Header 
                schoolName={templateSettings.reportCard.schoolName} 
                user={currentUser}
                onLogout={logout}
            />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WorkflowTabs 
                    currentStep={currentStep} 
                    setCurrentStep={setCurrentStep}
                    userRole={currentUser.role}
                    permissions={permissions}
                />
                
                <div className="mt-8">
                    <Suspense fallback={
                        <div className="flex justify-center items-center py-20">
                            <SpinnerIcon className="w-10 h-10 text-sky-600" />
                        </div>
                    }>
                        {currentStep === 'dashboard' && (
                            <Dashboard
                                students={studentsForClass}
                                subjects={teacherSubjectsForSelectedClass}
                                classInfo={{ level: validLevel, arm: validArm }}
                                onNavigate={(step) => setCurrentStep(step)}
                            />
                        )}

                        {currentStep === 'setup' && (
                            <SetupStep
                                levels={availableLevels}
                                arms={availableArms}
                                selectedLevel={validLevel}
                                selectedArm={validArm}
                                onLevelChange={setSelectedLevel}
                                onArmChange={setSelectedArm}
                                subjects={subjectsForClass}
                                students={studentsForClass}
                                onAddStudent={handleAddStudent}
                                onRemoveStudent={handleRemoveStudent}
                                onStudentChange={handleStudentChange}
                                feeItems={feeItems}
                                setFeeItems={setFeeItems}
                                currentUser={currentUser}
                                clearAllData={clearAllData}
                                selectedSection={selectedSection}
                                onSectionChange={setSelectedSection}
                                selectedStream={selectedStream}
                                onStreamChange={setSelectedStream}
                            />
                        )}

                        {currentStep === 'templates' && (
                            <TemplatesStep
                                settings={templateSettings}
                                setSettings={handleSettingsChange}
                            />
                        )}

                        {currentStep === 'scores' && (
                            <ScoreEntryStep
                                students={students}
                                subjects={teacherSubjectsForSelectedClass}
                                selectedSubject={selectedSubjectForEntry}
                                onSelectSubject={setSelectedSubjectForEntry}
                                onStudentChange={handleStudentChange}
                                classInfo={{ level: validLevel, arm: validArm }}
                                selectedSection={selectedSection}
                            />
                        )}

                        {currentStep === 'invoicing' && (
                            <InvoicingStep
                                students={studentsForClass}
                                classInfo={{ level: validLevel, arm: validArm, session, term }}
                                onGenerateInvoice={handleGenerateInvoice}
                                onPrintInvoice={handlePrintInvoice}
                                isGeneratingInvoice={isGeneratingInvoice}
                            />
                        )}

                        {currentStep === 'payments' && (
                            <PaymentsStep
                                students={studentsForClass}
                                classInfo={{ level: validLevel, arm: validArm, session, term }}
                                onAddPayment={handleAddPayment}
                                onPrintReceipt={handlePrintReceipt}
                                isGeneratingReceipt={isGeneratingReceipt}
                            />
                        )}

                        {currentStep === 'finalize' && (
                            <FinalizeStep
                                students={studentsForClass}
                                subjects={subjectsForClass}
                                onStudentChange={handleStudentChange}
                                classInfo={{ level: validLevel, arm: validArm }}
                                reportSettings={{
                                    nextTermBegins, setNextTermBegins,
                                    term, setTerm,
                                    session, setSession,
                                    principalRemark, setPrincipalRemark,
                                    totalSchoolDays, setTotalSchoolDays
                                }}
                                actions={{
                                    handleGenerateAIRemarks,
                                    handleGenerateReports,
                                    isGenerating,
                                    isGeneratingRemarks,
                                    handleGenerateSubjectReport,
                                    isGeneratingSubjectReport,
                                    selectedSubjectForReport,
                                    setSelectedSubjectForReport,
                                    handleGenerateBroadsheet,
                                    isGeneratingBroadsheet,
                                }}
                            />
                        )}
                        
                        {currentStep === 'guide' && <SystemGuide />}

                        {currentStep === 'access_control' && (
                            <AccessControlStep
                                permissions={permissions}
                                setPermissions={setPermissions}
                            />
                        )}
                    </Suspense>
                </div>

                <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                  {documentToRender === 'reportCard' && <ResultsDisplay 
                      ref={reportRef}
                      results={results}
                      studentData={studentsForClass}
                      allSubjects={subjectsForClass}
                      classInfo={{ level: validLevel, arm: validArm, term, session, section: sectionName }}
                      nextTermBegins={nextTermBegins}
                      principalRemark={principalRemark}
                      totalSchoolDays={totalSchoolDays}
                      templateSettings={templateSettings.reportCard}
                  />}
                  {documentToRender === 'subjectReport' && <SubjectWiseReport
                      ref={subjectReportRef}
                      students={studentsForClass}
                      subject={selectedSubjectForReport}
                      classInfo={{ level: validLevel, arm: validArm, session }}
                      aiComment={subjectWiseAIComment}
                      templateSettings={templateSettings.subjectWise}
                      schoolName={templateSettings.reportCard.schoolName}
                  />}
                  {documentToRender === 'broadsheet' && <BroadsheetReport
                        ref={broadsheetRef}
                        students={studentsForClass}
                        subjects={subjectsForClass}
                        results={broadsheetResults}
                        classInfo={{ level: validLevel, arm: validArm, session, term: term }}
                        aiAnalysis={broadsheetAIAnalysis}
                        templateSettings={templateSettings.broadsheet}
                        schoolName={templateSettings.reportCard.schoolName}
                    />}
                    {documentToRender === 'receipt' && <PaymentReceipt
                        ref={receiptRef}
                        student={studentForReceipt}
                        payment={paymentForReceipt}
                        classInfo={{ level: validLevel, arm: validArm, session, term }}
                        schoolInfo={templateSettings.reportCard}
                    />}
                    {documentToRender === 'invoice' && <SchoolFeesInvoice
                        ref={invoiceRef}
                        student={studentForInvoice}
                        invoice={invoiceForPrinting}
                        classInfo={{ level: validLevel, arm: validArm, session, term }}
                        schoolInfo={templateSettings.reportCard}
                    />}
                </div>
            </main>
        </div>
    );
};

export default App;