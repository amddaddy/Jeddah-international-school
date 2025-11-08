
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Student, Result, Payment, FeeItem, Invoice, TemplateSettings, Permissions, Role, Permission } from './types';
import { Type } from '@google/genai';
import { ai } from './lib/ai';
import Header from './components/Header';
import WorkflowTabs from './components/WorkflowTabs';
import Dashboard from './components/Dashboard';
import SetupStep from './components/SetupStep';
import ScoreEntryStep from './components/ScoreEntryStep';
import FinalizeStep from './components/FinalizeStep';
import PaymentsStep from './components/PaymentsStep';
import InvoicingStep from './components/InvoicingStep';
import TemplatesStep from './components/TemplatesStep';
import ResultsDisplay from './components/ResultsDisplay';
import SubjectWiseReport from './components/SubjectWiseReport';
import BroadsheetReport from './components/BroadsheetReport';
import PaymentReceipt from './components/PaymentReceipt';
import SchoolFeesInvoice from './components/SchoolFeesInvoice';
import SystemGuide from './components/SystemGuide';
import AccessControlStep from './components/AccessControlStep';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getScoreTotal, getGradeInfo } from './utils';
import { useAuth } from './hooks/useAuth';

const initialPermissions: Permissions = {
    admin: {
        dashboard: true,
        setup: true,
        templates: true,
        scores: true,
        invoicing: true,
        payments: true,
        reports: true,
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
        reports: true,
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
        reports: false,
        guide: true,
        access_control: false,
    },
    parent: {
        dashboard: false,
        setup: false,
        templates: false,
        scores: false,
        invoicing: true,
        payments: true,
        reports: false,
        guide: true,
        access_control: false,
    },
};

const App: React.FC = () => {
    const { currentUser, logout, schoolInfo, setupSchool } = useAuth();
    const [students, setStudents] = useState<Student[]>([
        { id: '1', name: 'Darius Ekojoka ABAH', scores: {}, totalAttendance: 115, photo: undefined, remark: '', admissionNo: 'WPA0018', gender: 'Male', dob: '2013-05-15', parentName: 'Mr. Patrick Ogwu Abah (Guardian)', payments: [], invoices: [] }
    ]);
    const [subjects, setSubjects] = useState<string[]>(['English Studies', 'Mathematics', 'Basic Science', 'Basic Technology', 'Computer Studies', 'PHE', 'Social Studies', 'Civic Education', 'Security Education', 'Agricultural Science', 'Home Economics', 'Business Studies', 'Keyboarding', 'CCA', 'History', 'CRS']);
    
    const userPermissions = currentUser ? initialPermissions[currentUser.role] : ({} as Record<Permission, boolean>);
    const defaultStep = userPermissions.dashboard ? 'dashboard' : 'guide';

    const [currentStep, setCurrentStep] = useState<'dashboard' | 'setup' | 'templates' | 'scores' | 'invoicing' | 'payments' | 'finalize' | 'guide' | 'access_control'>(defaultStep);

    const secondaryLevels = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
    const [levels] = useState(secondaryLevels);
    const [arms] = useState(['A', 'B', 'C']);
    const [selectedLevel, setSelectedLevel] = useState('JSS 2');
    const [selectedArm, setSelectedArm] = useState('A');

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
    
    const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
      reportCard: {
        schoolName: 'Your School Name',
        schoolAddress: '123 Education Lane, Knowledge City, 12345',
        contactInfo: 'Tel: (123) 456-7890, Email: contact@yourschool.com',
        fontFamily: 'Arial',
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

    const [permissions, setPermissions] = useState<Permissions>(initialPermissions);
    
    useEffect(() => {
        if (schoolInfo) {
            setTemplateSettings(prev => ({
                ...prev,
                reportCard: {
                    ...prev.reportCard,
                    ...schoolInfo,
                }
            }));
        }
    }, [schoolInfo]);


    const handleTemplateSettingsChange = (newSettings: TemplateSettings) => {
        setTemplateSettings(newSettings);
        if (currentUser?.role === 'admin' && setupSchool) {
            const { schoolName, schoolAddress, contactInfo } = newSettings.reportCard;
            setupSchool({ schoolName, schoolAddress, contactInfo });
        }
    };


    useEffect(() => {
        if (subjects.length > 0) {
            if (!selectedSubjectForEntry) {
                setSelectedSubjectForEntry(subjects[0]);
            }
            if (!selectedSubjectForReport) {
                setSelectedSubjectForReport(subjects[0]);
            }
        } else {
            setSelectedSubjectForEntry(null);
            setSelectedSubjectForReport('');
        }
    }, [subjects, selectedSubjectForEntry, selectedSubjectForReport]);


    const reportRef = useRef<HTMLDivElement>(null);
    const subjectReportRef = useRef<HTMLDivElement>(null);
    const broadsheetRef = useRef<HTMLDivElement>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);


    const handleAddStudent = () => {
        setStudents([...students, { id: Date.now().toString(), name: '', scores: {}, totalAttendance: 0, photo: undefined, remark: '', admissionNo: '', gender: '', dob: '', parentName: '', payments: [], invoices: [] }]);
    };

    const handleRemoveStudent = (id: string) => {
        setStudents(students.filter((s) => s.id !== id));
    };

    const handleStudentChange = (updatedStudent: Student) => {
        setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    };
    
    const calculateResults = useCallback((studentData: Student[]): Omit<Result, 'remark'>[] => {
        const studentTotals = studentData.map(student => {
            const total = subjects.reduce((acc, subject) => acc + getScoreTotal(student.scores[subject]), 0);
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
            const calculatedResults = calculateResults(students);

            const studentDataForPrompt = students.map(student => {
                const result = calculatedResults.find(r => r.studentId === student.id);
                if (!result) return null;
                const scoresSummary = subjects.map(subject => {
                    const total = getScoreTotal(student.scores[subject]);
                    return `${subject}: ${total}/100`;
                }).join(', ');

                return {
                    id: student.id,
                    name: student.name,
                    admissionNo: student.admissionNo,
                    position: `${result.position} out of ${students.length}`,
                    average: `${result.average.toFixed(2)}%`,
                    scores: scoresSummary
                };
            }).filter(Boolean);

            if (studentDataForPrompt.length === 0) {
                setIsGeneratingRemarks(false);
                return students;
            }
            
            const prompt = `You are a thoughtful and encouraging Form Master writing report card remarks for a class of students.
            Here is the data for multiple students:
            ${JSON.stringify(studentDataForPrompt, null, 2)}
            
            Based on this data, for each student, write a personalized and constructive "Form Master's Remark" of about 2-4 sentences. Mention their overall performance (e.g., "excellent," "good," " commendable," "steady academic development"), their rank, and highlight a few subjects where they showed strong performance. Be positive, encouraging, and professional.
            
            Return the result as a JSON array of objects, where each object has "studentId" (use the "id" from the input data) and "remark".
            Example for one student: { "studentId": "1", "remark": "Maintained excellent standards throughout the session, achieving 85.3%. Placed 1st in class ranking. Showed strong performance in Security Education, History, Social Studies and English Studies." }`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                studentId: { type: Type.STRING },
                                remark: { type: Type.STRING },
                            },
                            required: ["studentId", "remark"],
                        },
                    },
                },
            });
            
            const remarksData: { studentId: string, remark: string }[] = JSON.parse(response.text.trim());

            updatedStudents = students.map(student => {
                const remarkData = remarksData.find(r => r.studentId === student.id);
                return remarkData ? { ...student, remark: remarkData.remark } : student;
            });

            setStudents(updatedStudents);

        } catch (error) {
            console.error("Error generating AI remarks:", error);
            alert("Failed to generate AI remarks. Please check your API key or network connection. Falling back to simple remarks.");
            const calculatedResults = calculateResults(students);
            updatedStudents = students.map(student => {
                const result = calculatedResults.find(r => r.studentId === student.id);
                if (result) {
                    const fallbackRemark = result.average >= 75 ? 'Excellent academic performance.' : result.average >= 65 ? 'Very good academic progress.' : result.average >= 50 ? 'Good effort this term.' : 'Shows potential for improvement with more focus.';
                    return { ...student, remark: fallbackRemark };
                }
                return student;
            });
            setStudents(updatedStudents);
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
                        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                        const imgData = canvas.toDataURL('image/png');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        
                        if (i > 0) {
                            pdf.addPage();
                        }
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    }
                    
                    pdf.save(`report-cards-${selectedLevel}${selectedArm}-${session.replace('/', '-')}.pdf`);
                } catch (error) {
                    console.error("Error generating PDF:", error);
                    alert("There was an error generating the PDF. Please check the console for details.");
                }
            }
            setIsGenerating(false);
        }, 1000);
    };

    const handleGenerateSubjectWiseAIComment = async (subject: string) => {
        setSubjectWiseAIComment('Generating comment...');
        const totalStudents = students.length;
        if (totalStudents === 0) {
            setSubjectWiseAIComment('No students in the class.');
            return;
        }

        const subjectScores = students.map(s => getScoreTotal(s.scores[subject]));
        const classAverage = subjectScores.reduce((a, b) => a + b, 0) / totalStudents;
        
        const gradeCounts = subjectScores.reduce((acc, score) => {
            const { grade } = getGradeInfo(score);
            acc[grade] = (acc[grade] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const failingCount = gradeCounts['F9'] || 0;
        const passRate = ((totalStudents - failingCount) / totalStudents) * 100;
        
        const gradeDistributionString = Object.entries(gradeCounts).map(([grade, count]) => `${grade}: ${count}`).join(', ');

        const prompt = `You are an experienced head of department writing a summary for a subject-wise performance report.
        Subject: ${subject}
        Class: ${selectedLevel}${selectedArm}
        Total Students: ${totalStudents}
        
        Performance Summary:
        - Class Average Score: ${classAverage.toFixed(1)}%
        - Pass Rate: ${passRate.toFixed(1)}%
        - Grade Distribution: ${gradeDistributionString}
        
        Based on this detailed statistical data, write a professional and insightful "General Comments" paragraph of about 4-5 sentences.
        Summarize the overall class performance in ${subject}. Mention the number of high-achievers and the number of students who are struggling.
        Conclude with a recommendation for the class, such as suggesting targeted interventions for struggling students and continued support for high achievers to enhance overall class performance.
        The tone should be formal, analytical, and encouraging.
        
        Example Comment: "The class has shown a diverse range of performance in English Studies. 31 students (88.6%) have performed well, achieving grades of B or higher. However, 2 students (5.7%) are struggling and need significant support. The overall pass rate of 94.3% indicates that while many students are meeting the basic requirements, there is room for improvement. Targeted interventions for struggling students and continued support for high achievers are recommended to enhance overall class performance."`;

         try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setSubjectWiseAIComment(response.text);
        } catch (error) {
            console.error("Error generating subject-wise AI comment:", error);
            setSubjectWiseAIComment("Failed to generate AI comment. Please check your connection or API key.");
        }
    };
    
    const handleGenerateSubjectReport = async () => {
        if (!selectedSubjectForReport) {
            alert("Please select a subject to generate a report for.");
            return;
        }
        setIsGeneratingSubjectReport(true);
        await handleGenerateSubjectWiseAIComment(selectedSubjectForReport);

        setTimeout(async () => {
            if (subjectReportRef.current) {
                try {
                    const pageElements = subjectReportRef.current.querySelectorAll('.subject-report-page');
                    if (pageElements.length === 0) {
                        alert("No data to generate report.");
                        setIsGeneratingSubjectReport(false);
                        return;
                    }
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    for (let i = 0; i < pageElements.length; i++) {
                        const element = pageElements[i] as HTMLElement;
                        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                        const imgData = canvas.toDataURL('image/jpeg', 0.9);
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = pdf.internal.pageSize.getHeight();
                        const canvasWidth = canvas.width;
                        const canvasHeight = canvas.height;
                        const ratio = canvasWidth / canvasHeight;
                        const pdfRatio = pdfWidth / pdfHeight;

                        let finalWidth, finalHeight;
                        if (ratio > pdfRatio) {
                          finalWidth = pdfWidth;
                          finalHeight = pdfWidth / ratio;
                        } else {
                          finalHeight = pdfHeight;
                          finalWidth = pdfHeight * ratio;
                        }
                        
                        if (i > 0) pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, 0, finalWidth, finalHeight);
                    }
                    pdf.save(`subject-report-${selectedSubjectForReport.replace(/\s+/g, '-')}-${selectedLevel}${selectedArm}.pdf`);
                } catch (error) {
                    console.error("Error generating subject-wise PDF:", error);
                    alert("There was an error generating the subject-wise PDF.");
                }
            }
            setIsGeneratingSubjectReport(false);
            setSubjectWiseAIComment('');
        }, 1500); 
    };

     const handleGenerateBroadsheetAIAnalysis = async (results: Result[], subjectStats: any) => {
        setBroadsheetAIAnalysis('Generating analysis...');
        const totalStudents = students.length;
        const passCount = results.filter(r => r.average >= 40).length;
        const passRate = (passCount / totalStudents) * 100;
        const performanceDistribution = {
            exceptional: results.filter(r => r.average >= 80).length,
            veryGood: results.filter(r => r.average >= 70 && r.average < 80).length,
            good: results.filter(r => r.average >= 60 && r.average < 70).length,
            fair: results.filter(r => r.average >= 50 && r.average < 60).length,
            poor: results.filter(r => r.average < 50).length,
        };

        const highPerformingSubjects = Object.entries(subjectStats).filter(([, stats]: [string, any]) => stats.average >= 70).map(([sub]) => sub);
        const lowPerformingSubjects = Object.entries(subjectStats).filter(([, stats]: [string, any]) => stats.average < 50).map(([sub]) => sub);

        const prompt = `You are a school principal writing a "Comprehensive Performance Analysis" for a class broadsheet.
        Class: ${selectedLevel}${selectedArm}
        Session: ${session}, Term: ${term}
        Total Students: ${totalStudents}

        Overall Class Performance Assessment:
        - Pass Rate: ${passRate.toFixed(2)}%
        - Performance Distribution: ${performanceDistribution.exceptional} students achieved exceptional results (80%+), ${performanceDistribution.veryGood} demonstrated very good performance (70-79%), ${performanceDistribution.good} showed good performance (60-69%), ${performanceDistribution.fair} had fair results (50-59%), and ${performanceDistribution.poor} struggled academically (<50%).

        Subject Performance Analysis:
        - High-performing subjects (average > 70%): ${highPerformingSubjects.join(', ') || 'None'}
        - Subjects requiring immediate intervention (average < 50%): ${lowPerformingSubjects.join(', ') || 'None'}
        
        Performance Distribution Insights:
        - ${((performanceDistribution.exceptional + performanceDistribution.veryGood) / totalStudents * 100).toFixed(2)}% of students are top performers.
        - ${((performanceDistribution.fair + performanceDistribution.poor) / totalStudents * 100).toFixed(2)}% require additional academic support.
        
        Based on this data, provide a detailed analysis.
        1. Start with an "Overall Class Performance Assessment".
        2. Follow with "Subject Performance Analysis", highlighting strong and weak subjects.
        3. Give "Performance Distribution Insights".
        4. Identify any "Performance Patterns and Potential Issues", like multiple subject failures.
        5. Conclude with concrete "Recommendations" such as targeted remedial programs, personalized learning, reviewing teaching methodologies, and encouraging peer learning.
        The tone should be formal, analytical, and actionable.`;

        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setBroadsheetAIAnalysis(response.text);
        } catch (error) {
            console.error("Error generating broadsheet AI analysis:", error);
            setBroadsheetAIAnalysis("Failed to generate AI analysis. Please check your connection or API key.");
        }
    };
    
    const handleGenerateBroadsheet = async () => {
        setIsGeneratingBroadsheet(true);
        const calculatedResults = calculateResults(students);
        setBroadsheetResults(calculatedResults);

        const subjectStats = subjects.reduce((acc, subject) => {
            const scores = students.map(s => getScoreTotal(s.scores[subject])).filter(s => typeof s === 'number');
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

        setTimeout(async () => {
            if (broadsheetRef.current) {
                try {
                    const pageElements = broadsheetRef.current.querySelectorAll('.broadsheet-page');
                    const pdf = new jsPDF('l', 'mm', 'a4');
                    
                    for (let i = 0; i < pageElements.length; i++) {
                        const element = pageElements[i] as HTMLElement;
                        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                        const imgData = canvas.toDataURL('image/png', 0.95);
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        if (i > 0) pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    }
                    pdf.save(`broadsheet-${selectedLevel}${selectedArm}-${session.replace('/', '-')}.pdf`);
                } catch (error) {
                    console.error("Error generating broadsheet PDF:", error);
                    alert("There was an error generating the broadsheet PDF.");
                }
            }
            setIsGeneratingBroadsheet(false);
            setBroadsheetAIAnalysis('');
        }, 1500);
    };

    const handleAddPayment = (studentId: string, payment: Omit<Payment, 'id' | 'receiptNo' | 'invoiceNo' | 'date'>) => {
        const timestamp = Date.now();
        const fullPayment: Payment = {
            id: `PAY-${timestamp}`,
            receiptNo: `PMT-${timestamp.toString(36).toUpperCase()}`,
            invoiceNo: `INV-${timestamp.toString(36).toUpperCase()}`,
            date: new Date().toISOString(),
            ...payment,
        };
        const updatedStudents = students.map(s => {
            if (s.id === studentId) {
                return { ...s, payments: [...(s.payments || []), fullPayment] };
            }
            return s;
        });
        setStudents(updatedStudents);
    };

    const handlePrintReceipt = (studentId: string, paymentId: string) => {
        const student = students.find(s => s.id === studentId);
        const payment = student?.payments?.find(p => p.id === paymentId);

        if (student && payment) {
            setIsGeneratingReceipt(true);
            setStudentForReceipt(student);
            setPaymentForReceipt(payment);
            
            setTimeout(async () => {
                if(receiptRef.current) {
                    try {
                        const canvas = await html2canvas(receiptRef.current, { scale: 3, useCORS: true });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('p', 'mm', [80, 160]); // Custom size for receipt
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`receipt-${student.name.replace(/\s/g, '_')}-${payment.receiptNo}.pdf`);
                    } catch (error) {
                        console.error("Error generating receipt PDF:", error);
                        alert("Could not generate receipt PDF.");
                    } finally {
                        setIsGeneratingReceipt(false);
                        setStudentForReceipt(null);
                        setPaymentForReceipt(null);
                    }
                }
            }, 500);
        }
    };
    
    const handleGenerateInvoice = (studentId: string) => {
        const timestamp = Date.now();
        const totalRequired = feeItems.filter(f => f.type === 'required').reduce((sum, f) => sum + f.amount, 0);
        const totalOptional = feeItems.filter(f => f.type === 'optional').reduce((sum, f) => sum + f.amount, 0);
        const newInvoice: Invoice = {
            id: `INV-${timestamp}`,
            invoiceNo: `INV-${timestamp.toString(36).toUpperCase()}`,
            date: new Date().toISOString(),
            studentId,
            feeItems,
            totalRequired,
            totalOptional,
            totalAmount: totalRequired + totalOptional,
        };
        const updatedStudents = students.map(s => {
            if (s.id === studentId) {
                return { ...s, invoices: [...(s.invoices || []), newInvoice] };
            }
            return s;
        });
        setStudents(updatedStudents);
    };
    
    const handlePrintInvoice = (studentId: string, invoiceId: string) => {
        const student = students.find(s => s.id === studentId);
        const invoice = student?.invoices?.find(i => i.id === invoiceId);

        if (student && invoice) {
            setIsGeneratingInvoice(true);
            setStudentForInvoice(student);
            setInvoiceForPrinting(invoice);
            
            setTimeout(async () => {
                if (invoiceRef.current) {
                    try {
                        const canvas = await html2canvas(invoiceRef.current, { scale: 3, useCORS: true });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
                        pdf.save(`invoice-${student.name.replace(/\s/g, '_')}-${invoice.invoiceNo}.pdf`);
                    } catch (error) {
                        console.error("Error generating invoice PDF:", error);
                        alert("Could not generate invoice PDF.");
                    } finally {
                        setIsGeneratingInvoice(false);
                        setStudentForInvoice(null);
                        setInvoiceForPrinting(null);
                    }
                }
            }, 500);
        }
    };

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
                    {currentStep === 'dashboard' && (
                        <Dashboard
                            students={students}
                            subjects={subjects}
                            classInfo={{ level: selectedLevel, arm: selectedArm }}
                            onNavigate={(step) => setCurrentStep(step)}
                        />
                    )}

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
                            feeItems={feeItems}
                            setFeeItems={setFeeItems}
                        />
                    )}

                    {currentStep === 'templates' && (
                        <TemplatesStep
                            settings={templateSettings}
                            setSettings={handleTemplateSettingsChange}
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

                    {currentStep === 'invoicing' && (
                        <InvoicingStep
                            students={students}
                            classInfo={{ level: selectedLevel, arm: selectedArm, session, term }}
                            onGenerateInvoice={handleGenerateInvoice}
                            onPrintInvoice={handlePrintInvoice}
                            isGeneratingInvoice={isGeneratingInvoice}
                        />
                    )}

                    {currentStep === 'payments' && (
                        <PaymentsStep
                            students={students}
                            classInfo={{ level: selectedLevel, arm: selectedArm, session, term }}
                            onAddPayment={handleAddPayment}
                            onPrintReceipt={handlePrintReceipt}
                            isGeneratingReceipt={isGeneratingReceipt}
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
                    
                    {currentStep === 'guide' && (
                        <SystemGuide />
                    )}

                    {currentStep === 'access_control' && (
                        <AccessControlStep
                            permissions={permissions}
                            setPermissions={setPermissions}
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
                      principalRemark={principalRemark}
                      totalSchoolDays={totalSchoolDays}
                      templateSettings={templateSettings.reportCard}
                  />
                  <SubjectWiseReport
                      ref={subjectReportRef}
                      students={students}
                      subject={selectedSubjectForReport}
                      classInfo={{ level: selectedLevel, arm: selectedArm, session }}
                      aiComment={subjectWiseAIComment}
                      templateSettings={templateSettings.subjectWise}
                      schoolName={templateSettings.reportCard.schoolName}
                  />
                  <BroadsheetReport
                        ref={broadsheetRef}
                        students={students}
                        subjects={subjects}
                        results={broadsheetResults}
                        classInfo={{ level: selectedLevel, arm: selectedArm, session, term: term }}
                        aiAnalysis={broadsheetAIAnalysis}
                        templateSettings={templateSettings.broadsheet}
                        schoolName={templateSettings.reportCard.schoolName}
                    />
                    <PaymentReceipt
                        ref={receiptRef}
                        student={studentForReceipt}
                        payment={paymentForReceipt}
                        classInfo={{ level: selectedLevel, arm: selectedArm, session, term }}
                        schoolInfo={templateSettings.reportCard}
                    />
                    <SchoolFeesInvoice
                        ref={invoiceRef}
                        student={studentForInvoice}
                        invoice={invoiceForPrinting}
                        classInfo={{ level: selectedLevel, arm: selectedArm, session, term }}
                        schoolInfo={templateSettings.reportCard}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;
