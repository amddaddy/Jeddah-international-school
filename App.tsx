
import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Student, Result, Payment, FeeItem, Invoice, TemplateSettings, School, User } from './types';
import { ai } from './lib/ai';
import { Type } from '@google/genai';
import Header from './components/Header';
import WorkflowTabs from './components/WorkflowTabs';
import ResultsDisplay from './components/ResultsDisplay';
import SubjectWiseReport from './components/SubjectWiseReport';
import BroadsheetReport from './components/BroadsheetReport';
import PaymentReceipt from './components/PaymentReceipt';
import SchoolFeesInvoice from './components/SchoolFeesInvoice';
import { getScoreTotal, getGradeInfo, getSubjectsForStudent, JUNIOR_SUBJECTS, SENIOR_CORE_SUBJECTS, SCIENCE_SUBJECTS, ART_SUBJECTS, COMMERCE_SUBJECTS, ALL_SENIOR_SUBJECTS } from './utils';
import SpinnerIcon from './components/icons/SpinnerIcon';
import PrintPreviewModal from './components/PrintPreviewModal';
import { ALL_PERMISSIONS } from './components/AccessControlStep';
import LoginPage from './pages/LoginPage';
import { SCHOOL_LOGO_BASE64 } from './components/assets';
import DevSchoolManager from './components/DevSchoolManager';

const Dashboard = lazy(() => import('./components/Dashboard'));
const SetupStep = lazy(() => import('./components/SetupStep'));
const ScoreEntryStep = lazy(() => import('./components/ScoreEntryStep'));
const FinalizeStep = lazy(() => import('./components/FinalizeStep'));
const PaymentsStep = lazy(() => import('./components/PaymentsStep'));
const InvoicingStep = lazy(() => import('./components/InvoicingStep'));
const TemplatesStep = lazy(() => import('./components/TemplatesStep'));
const SystemGuide = lazy(() => import('./components/SystemGuide'));
const AccessControlStep = lazy(() => import('./components/AccessControlStep'));


// --- DEFAULT DATA ---

const initialSchools: School[] = [
    { 
        id: 'school-1', 
        name: 'Insight Academy', 
        email: 'admin@insight.com', 
        address: '123 Education Lane, Knowledge City', 
        contactInfo: 'Tel: 123-456-7890', 
        logo: SCHOOL_LOGO_BASE64, 
        status: 'active', 
        dateRegistered: '2024-01-01' 
    }
];

const initialStudents: Student[] = [
     { id: '1', schoolId: 'school-1', classId: 'SS 1-A', name: 'Darius Ekojoka ABAH', scores: {}, totalAttendance: 115, photo: undefined, remark: '', admissionNo: 'WPA0018', gender: 'Male', dob: '2010-05-15', parentName: 'Mr. Patrick Ogwu Abah', stream: 'Science', payments: [], invoices: [], affectiveDomain: {}, psychomotorSkills: {} },
     { id: '2', schoolId: 'school-1', classId: 'SS 1-A', name: 'Blessing ADAMS', scores: {}, totalAttendance: 118, photo: undefined, remark: '', admissionNo: 'WPA0019', gender: 'Female', dob: '2010-07-22', parentName: 'Mrs. Adams', stream: 'Art', payments: [], invoices: [], affectiveDomain: {}, psychomotorSkills: {} },
     { id: '3', schoolId: 'school-1', classId: 'SS 1-A', name: 'Charles BINO', scores: {}, totalAttendance: 110, photo: undefined, remark: '', admissionNo: 'WPA0020', gender: 'Male', dob: '2010-03-10', parentName: 'Mr. Bino', stream: 'Commerce', payments: [], invoices: [], affectiveDomain: {}, psychomotorSkills: {} },
     { id: '4', schoolId: 'school-1', classId: 'SS 1-A', name: 'Zainab MUSA', scores: {}, totalAttendance: 120, photo: undefined, remark: '', admissionNo: 'WPA0021', gender: 'Female', dob: '2010-09-01', parentName: 'Alhaji Musa', stream: 'Science', payments: [], invoices: [], affectiveDomain: {}, psychomotorSkills: {} },
];

const createPermissions = (role: User['role']): User['permissions'] => {
  const allFalse = Object.fromEntries(ALL_PERMISSIONS.map(p => [p.id, false])) as User['permissions'];
  allFalse.view_dashboard = true;
  allFalse.view_guide = true;

  switch (role) {
    case 'dev_admin':
      return { ...Object.fromEntries(ALL_PERMISSIONS.map(p => [p.id, true])) as User['permissions'] };
    case 'admin':
      return { ...Object.fromEntries(ALL_PERMISSIONS.map(p => [p.id, p.id !== 'dev_admin_tools' ? true : false])) as User['permissions'] };
    case 'teacher':
      return {
        ...allFalse,
        enter_scores: true,
        view_dashboard: true,
      };
    default:
      return allFalse;
  }
};

const initialUsers: User[] = [
    { id: 'dev1', schoolId: 'global', name: 'Developer Admin', email: 'dev@platform.com', password: 'password', role: 'dev_admin', permissions: createPermissions('dev_admin') },
    { id: 'admin1', schoolId: 'school-1', name: 'Principal', email: 'admin@insight.com', password: 'password', role: 'admin', permissions: createPermissions('admin') },
    { id: 'teacher1', schoolId: 'school-1', name: 'Mr. Smith', email: 'teacher@insight.com', password: 'password', role: 'teacher', permissions: createPermissions('teacher') },
];


type Step = 'dashboard' | 'setup' | 'templates' | 'scores' | 'invoicing' | 'payments' | 'finalize' | 'guide' | 'access_control' | 'dev_admin_tools';

const App: React.FC = () => {
    // --- GLOBAL STATE (Persisted) ---
    const [schools, setSchools] = useState<School[]>(() => {
        const saved = localStorage.getItem('platform_schools');
        return saved ? JSON.parse(saved) : initialSchools;
    });

    const [allUsers, setAllUsers] = useState<User[]>(() => {
        const saved = localStorage.getItem('platform_users');
        return saved ? JSON.parse(saved) : initialUsers;
    });

    const [allStudents, setAllStudents] = useState<Student[]>(() => {
         const saved = localStorage.getItem('platform_students');
         return saved ? JSON.parse(saved) : initialStudents;
    });

    // --- SESSION STATE ---
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<Step>('dashboard');

    // --- PERSISTENCE EFFECTS ---
    useEffect(() => { localStorage.setItem('platform_schools', JSON.stringify(schools)); }, [schools]);
    useEffect(() => { localStorage.setItem('platform_users', JSON.stringify(allUsers)); }, [allUsers]);
    useEffect(() => { localStorage.setItem('platform_students', JSON.stringify(allStudents)); }, [allStudents]);

    // --- DERIVED STATE FOR CURRENT SESSION ---
    const currentSchool = useMemo(() => {
        if (!currentUser || currentUser.role === 'dev_admin') return null;
        return schools.find(s => s.id === currentUser.schoolId) || null;
    }, [currentUser, schools]);

    // --- SESSION RESTORATION ---
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('current_user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                // Validate user exists and school is active (security check on reload)
                const validUser = allUsers.find(u => u.id === user.id);
                if (validUser) {
                     if (validUser.role !== 'dev_admin') {
                         const school = schools.find(s => s.id === validUser.schoolId);
                         if (school && school.status === 'active') {
                             setCurrentUser(validUser);
                         } else {
                             localStorage.removeItem('current_user'); // Force logout if suspended
                         }
                     } else {
                         setCurrentUser(validUser);
                     }
                }
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('current_user');
        } finally {
            setIsLoading(false);
        }
    }, [schools, allUsers]);


    // --- AUTH HANDLERS ---
    const handleLogin = (email: string, pass: string): boolean => {
        const user = allUsers.find(u => u.email === email && u.password === pass);
        if (user) {
            if (user.role === 'dev_admin') {
                setCurrentUser(user);
                localStorage.setItem('current_user', JSON.stringify(user));
                return true;
            }
            
            // Check School Status
            const school = schools.find(s => s.id === user.schoolId);
            if (!school) {
                alert("Error: School data not found.");
                return false;
            }
            if (school.status === 'suspended') {
                alert("Access Denied: Your school's account has been suspended. Please contact the platform administrator.");
                return false;
            }

            setCurrentUser(user);
            localStorage.setItem('current_user', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const handleRegisterSchool = (schoolName: string, address: string, schoolEmail: string, phone: string, email: string, pass: string) => {
        if (allUsers.some(u => u.email === email)) {
            alert("This admin email is already registered.");
            return false;
        }
        if (schools.some(s => s.email === schoolEmail)) {
             alert("This school email is already registered.");
             return false;
        }

        const newSchoolId = `school-${Date.now()}`;
        const newSchool: School = {
            id: newSchoolId,
            name: schoolName,
            email: schoolEmail,
            address: address,
            contactInfo: phone,
            logo: SCHOOL_LOGO_BASE64,
            status: 'active',
            dateRegistered: new Date().toISOString()
        };

        const newAdmin: User = {
            id: `admin-${Date.now()}`,
            schoolId: newSchoolId,
            name: 'School Administrator',
            email: email,
            password: pass,
            role: 'admin',
            permissions: createPermissions('admin')
        };

        setSchools(prev => [...prev, newSchool]);
        setAllUsers(prev => [...prev, newAdmin]);
        
        // Auto login
        setCurrentUser(newAdmin);
        localStorage.setItem('current_user', JSON.stringify(newAdmin));
        return true;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('current_user');
        setCurrentStep('dashboard');
    };

    // --- DEV ADMIN ACTIONS ---
    const handleToggleSchoolStatus = (schoolId: string, status: 'active' | 'suspended') => {
        setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, status } : s));
    };

    const handleDeleteSchool = (schoolId: string) => {
         if (confirm("Are you sure? This will delete the school and all its data permanently.")) {
             setSchools(prev => prev.filter(s => s.id !== schoolId));
             setAllUsers(prev => prev.filter(u => u.schoolId !== schoolId));
             setAllStudents(prev => prev.filter(s => s.schoolId !== schoolId));
         }
    };

    // --- CLASS & STUDENT MANAGEMENT ---
    const juniorLevels = ['JSS 1', 'JSS 2', 'JSS 3'];
    const seniorLevels = ['SS 1', 'SS 2', 'SS 3'];
    const allArms = ['A', 'B', 'C'];
    
    const [selectedSection, setSelectedSection] = useState<'Junior' | 'Senior'>('Senior');
    const [selectedStream, setSelectedStream] = useState<'All' | 'Science' | 'Art' | 'Commerce'>('All');
    const [selectedLevel, setSelectedLevel] = useState('SS 1');
    const [selectedArm, setSelectedArm] = useState('A');

    const availableLevels = useMemo(() => selectedSection === 'Junior' ? juniorLevels : seniorLevels, [selectedSection]);
    const validLevel = useMemo(() => availableLevels.includes(selectedLevel) ? selectedLevel : availableLevels[0], [availableLevels, selectedLevel]);
    const validArm = useMemo(() => allArms.includes(selectedArm) ? selectedArm : allArms[0], [allArms, selectedArm]);
    const classKey = useMemo(() => `${validLevel}-${validArm}`, [validLevel, validArm]);
    
    // Filter students for the CURRENT SCHOOL and CURRENT CLASS
    const studentsForClass = useMemo(() => {
        if (!currentUser || !currentSchool) return [];
        return allStudents.filter(s => s.schoolId === currentSchool.id && s.classId === classKey);
    }, [allStudents, currentSchool, classKey, currentUser]);

    const students = useMemo(() => {
        if (selectedStream === 'All') return studentsForClass;
        return studentsForClass.filter(s => s.stream === selectedStream);
    }, [studentsForClass, selectedStream]);

    const sectionName = useMemo(() => validLevel.startsWith('JSS') ? 'Junior Secondary School' : 'Senior Secondary School', [validLevel]);
    
    // --- SUBJECT MANAGEMENT ---
    const [juniorSubjects, setJuniorSubjects] = useState(JUNIOR_SUBJECTS);
    const [seniorSubjects, setSeniorSubjects] = useState(ALL_SENIOR_SUBJECTS);
    
    const subjectsForClass = useMemo(() => selectedSection === 'Junior' ? juniorSubjects : seniorSubjects, [selectedSection, juniorSubjects, seniorSubjects]);

    const handleSetSubjects = (newSubjects: string[] | ((prev: string[]) => string[])) => {
        if (selectedSection === 'Junior') {
            // If newSubjects is a function, call it with current state, otherwise use value
             setJuniorSubjects(prev => typeof newSubjects === 'function' ? newSubjects(prev) : newSubjects);
        } else {
             setSeniorSubjects(prev => typeof newSubjects === 'function' ? newSubjects(prev) : newSubjects);
        }
    };

    // --- DATA MUTATION HANDLERS (Wrapped to update global state) ---
    const handleAddStudent = useCallback(() => {
        if (!currentUser || !currentSchool) return;
        const newStudent: Student = {
            id: Date.now().toString(),
            schoolId: currentSchool.id,
            classId: classKey,
            name: '',
            scores: {},
            totalAttendance: 0,
            photo: undefined,
            remark: '',
            admissionNo: '',
            gender: '' as const,
            dob: '',
            parentName: '',
            payments: [],
            invoices: [],
            stream: undefined,
            affectiveDomain: {},
            psychomotorSkills: {},
        };
        setAllStudents(prev => [...prev, newStudent]);
    }, [classKey, currentSchool, currentUser]);

    const handleRemoveStudent = useCallback((id: string) => {
        setAllStudents(prev => prev.filter(s => s.id !== id));
    }, []);

    const handleStudentChange = useCallback((updatedStudent: Student) => {
        setAllStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    }, []);
    
    // --- BRANDING ---
    const handleLogoChange = (newLogo: string) => {
        if (currentSchool) {
            setSchools(prev => prev.map(s => s.id === currentSchool.id ? { ...s, logo: newLogo } : s));
        }
    };
    
    const handleSignatureChange = (newSignature: string) => {
        if (currentSchool) {
             setSchools(prev => prev.map(s => s.id === currentSchool.id ? { ...s, principalSignature: newSignature } : s));
        }
    };

    // --- TEMPLATE SETTINGS ---
    // In a real app, these would be stored in the School object or separate table.
    // For now, we retain local state but initialized from defaults.
    const [templateUiSettings, setTemplateUiSettings] = useState({
        reportCard: { reportTitle: "STUDENT'S REPORT SHEET", fontFamily: 'Arial' as any, showGradeAnalysis: true, showQRCode: true, showClassPosition: true, showPromotionStatus: true },
        subjectWise: { showSummary: true, showPerformanceIndicators: true, showPerformanceBar: true },
        broadsheet: { showSubjectAverage: true, showHighestScore: true, showLowestScore: true }
    });

    const templateSettings: TemplateSettings = useMemo(() => ({
        ...templateUiSettings,
        reportCard: {
            ...templateUiSettings.reportCard,
            schoolName: currentSchool?.name || 'School Name',
            schoolAddress: currentSchool?.address || '',
            contactInfo: currentSchool?.contactInfo || '',
        }
    }), [templateUiSettings, currentSchool]);
    
    // --- OTHER STATES (Report Generation, Fees, etc) ---
    const [results, setResults] = useState<Result[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingRemarks, setIsGeneratingRemarks] = useState(false);
    const [nextTermBegins, setNextTermBegins] = useState('2025-09-15');
    const [term, setTerm] = useState('Third Term');
    const [session, setSession] = useState('2024/2025');
    const [principalRemark, setPrincipalRemark] = useState("We encourage every student to continue to apply themselves diligently.");
    const [totalSchoolDays, setTotalSchoolDays] = useState('120');
    const [selectedSubjectForEntry, setSelectedSubjectForEntry] = useState<string | null>(null);
    const [selectedSubjectForReport, setSelectedSubjectForReport] = useState<string>('');
    const [subjectWiseAIComment, setSubjectWiseAIComment] = useState('');
    const [isGeneratingSubjectReport, setIsGeneratingSubjectReport] = useState(false);
    const [broadsheetAIAnalysis, setBroadsheetAIAnalysis] = useState('');
    const [isGeneratingBroadsheet, setIsGeneratingBroadsheet] = useState(false);
    const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
    const [feeItems, setFeeItems] = useState<FeeItem[]>([
        { id: '1', name: 'Registration Fee', amount: 1000, type: 'required' },
        { id: '2', name: 'Tuition Fee', amount: 50000, type: 'required' },
    ]);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [previewContent, setPreviewContent] = useState<{ title: string; component: React.ReactNode; orientation?: 'p' | 'l'; format?: string | number[] } | null>(null);


    // --- GENERATION HANDLERS ---
     const calculateResults = useCallback((studentData: Student[]): Result[] => {
        const studentTotals = studentData.map(student => {
            const studentSubjects = getSubjectsForStudent(student, selectedSection, subjectsForClass);
            const total = studentSubjects.reduce((acc, subject) => acc + getScoreTotal(student.scores[subject]), 0);
            const average = studentSubjects.length > 0 ? total / studentSubjects.length : 0;
            return { studentId: student.id, name: student.name, total, average, stream: student.stream };
        });
        studentTotals.sort((a, b) => b.total - a.total);
        return studentTotals.map((res, idx) => ({ ...res, position: idx + 1 }));
    }, [selectedSection, subjectsForClass]);

    const handleGenerateAIRemarks = useCallback(async () => {
        if (!currentUser || !currentSchool) return;
        setIsGeneratingRemarks(true);
        
        try {
            const calculated = calculateResults(studentsForClass);
            
             const studentDataForPrompt = studentsForClass.map(student => {
                const result = calculated.find(r => r.studentId === student.id);
                if (!result) return null;
                return { 
                    studentId: student.id, 
                    name: student.name, 
                    average: Math.round(result.average), 
                    position: result.position 
                };
            }).filter(Boolean);
            
             const prompt = `
                Role: School Principal / Form Master.
                Task: Generate short, distinct, and specific remarks for students based on their academic performance (Average score out of 100).
                
                Guidelines:
                - 80-100: Excellent! An outstanding performance.
                - 70-79: Very Good. Keep up the momentum.
                - 60-69: Good. More effort will yield better results.
                - 50-59: Average performance. You need to work harder.
                - Below 50: Below expectation. Please sit up and study harder.

                Input Data: ${JSON.stringify(studentDataForPrompt)}
             `;

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
                                remark: { type: Type.STRING }
                            },
                            required: ["studentId", "remark"]
                        }
                    }
                }
            });
            
             const text = response.text;
             if (!text) throw new Error("No response from AI");

             const remarksData = JSON.parse(text); 
             
             const updatedStudentsLocal = studentsForClass.map(s => {
                 const r = remarksData.find((rd: any) => rd.studentId === s.id);
                 return r ? { ...s, remark: r.remark } : s;
             });
             
             setAllStudents(prev => {
                 const newAll = [...prev];
                 updatedStudentsLocal.forEach(us => {
                     const idx = newAll.findIndex(s => s.id === us.id);
                     if (idx !== -1) newAll[idx] = us;
                 });
                 return newAll;
             });

        } catch (e) {
            console.error("AI Remark Generation Error:", e);
            alert("Failed to generate remarks. Please try again.");
        } finally {
            setIsGeneratingRemarks(false);
        }
    }, [studentsForClass, calculateResults, currentUser, currentSchool]);

    const handleGenerateReports = useCallback(async () => {
        setIsGenerating(true);
        // Logic to create report cards...
        const calculated = calculateResults(studentsForClass);
        const finalResults = calculated.map(res => ({ ...res, remark: studentsForClass.find(s => s.id === res.studentId)?.remark || '' }));
        
        setPreviewContent({
            title: `Report Cards - ${classKey}`,
            component: <ResultsDisplay 
                results={finalResults} 
                studentData={studentsForClass} 
                allSubjects={subjectsForClass} 
                classInfo={{ level: validLevel, arm: validArm, term, session, section: sectionName }}
                nextTermBegins={nextTermBegins}
                principalRemark={principalRemark}
                totalSchoolDays={totalSchoolDays}
                templateSettings={templateSettings.reportCard}
                logo={currentSchool?.logo || SCHOOL_LOGO_BASE64}
                principalSignature={currentSchool?.principalSignature}
            />,
            orientation: 'p'
        });
        setIsGenerating(false);
    }, [studentsForClass, calculateResults, classKey, subjectsForClass, validLevel, validArm, term, session, sectionName, nextTermBegins, principalRemark, totalSchoolDays, templateSettings, currentSchool]);


    const handleGenerateSubjectReport = useCallback(async () => {
        if (!selectedSubjectForReport) {
            alert("Please select a subject first.");
            return;
        }
        setIsGeneratingSubjectReport(true);
        try {
            // 1. Prepare Data
            const subjectData = studentsForClass.map(s => {
                const sc = s.scores[selectedSubjectForReport];
                return sc ? getScoreTotal(sc) : null;
            }).filter(s => s !== null) as number[];

            if (subjectData.length === 0) throw new Error("No scores found for this subject.");

            const average = subjectData.reduce((a,b) => a+b, 0) / subjectData.length;
            const passRate = (subjectData.filter(s => s >= 40).length / subjectData.length) * 100;

            // 2. AI Call
            const prompt = `
                Analyze the class performance for the subject: ${selectedSubjectForReport}.
                - Class Average: ${average.toFixed(1)}
                - Pass Rate: ${passRate.toFixed(1)}%
                - Total Students: ${subjectData.length}
                
                Write a professional summary (approx 50 words) for the subject teacher's report. 
                Focus on the general performance trend.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const comment = response.text || "No comment generated.";
            setSubjectWiseAIComment(comment);

            // 3. Generate PDF (Preview)
            setPreviewContent({
                title: `Subject Report - ${selectedSubjectForReport}`,
                component: <SubjectWiseReport 
                    students={studentsForClass} 
                    subject={selectedSubjectForReport} 
                    classInfo={{ level: validLevel, arm: validArm, session }} 
                    aiComment={comment}
                    templateSettings={templateUiSettings.subjectWise}
                    schoolName={currentSchool?.name || 'School Name'}
                />,
                orientation: 'p'
            });

        } catch (e) {
            console.error(e);
            alert("Failed to generate subject report.");
        } finally {
            setIsGeneratingSubjectReport(false);
        }
    }, [selectedSubjectForReport, studentsForClass, validLevel, validArm, session, templateUiSettings, currentSchool]);


    const handleGenerateBroadsheet = useCallback(async () => {
        setIsGeneratingBroadsheet(true);
        try {
            const calculated = calculateResults(studentsForClass);
            if (calculated.length === 0) throw new Error("No results to analyze.");

            const topStudent = calculated[0];
            const classAvg = calculated.reduce((a, b) => a + b.average, 0) / calculated.length;

            const prompt = `
                Analyze the broadsheet results for ${validLevel} ${validArm}.
                - Top Student: ${topStudent.name} (${topStudent.average.toFixed(1)}%)
                - Class Average: ${classAvg.toFixed(1)}%
                - Total Students: ${calculated.length}
                
                Write a comprehensive performance analysis (3 paragraphs). 
                1. Overview of general performance.
                2. Highlights of top performers.
                3. Recommendations for improvement.
                Use bolding (Markdown **text**) for key terms.
            `;
             
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const analysis = response.text || "No analysis generated.";
            setBroadsheetAIAnalysis(analysis);

            setPreviewContent({
                title: `Broadsheet - ${classKey}`,
                component: <BroadsheetReport 
                    students={studentsForClass} 
                    subjects={subjectsForClass}
                    results={calculated}
                    classInfo={{ level: validLevel, arm: validArm, session, term }}
                    aiAnalysis={analysis}
                    templateSettings={templateUiSettings.broadsheet}
                    schoolName={currentSchool?.name || 'School Name'}
                />,
                orientation: 'l',
                format: 'a3'
            });

        } catch (e) {
            console.error(e);
            alert("Failed to generate broadsheet.");
        } finally {
            setIsGeneratingBroadsheet(false);
        }
    }, [studentsForClass, calculateResults, validLevel, validArm, classKey, subjectsForClass, session, term, templateUiSettings, currentSchool]);


    const handleAddPayment = (studentId: string, payment: any) => {
         // Simplified
         const newP: Payment = { ...payment, id: Date.now().toString(), receiptNo: `RCPT-${Date.now()}`, date: new Date().toISOString(), invoiceNo: 'INV-001' };
         const student = studentsForClass.find(s => s.id === studentId);
         if (student) handleStudentChange({ ...student, payments: [...(student.payments || []), newP] });
    };
    
    const handlePrintReceipt = (sId: string, pId: string) => {
        const s = studentsForClass.find(x => x.id === sId);
        const p = s?.payments?.find(x => x.id === pId);
        if(s && p) setPreviewContent({
            title: "Receipt", 
            component: <PaymentReceipt student={s} payment={p} classInfo={{level: validLevel, arm: validArm, session, term}} schoolInfo={templateSettings.reportCard} logo={currentSchool?.logo || SCHOOL_LOGO_BASE64} />,
            format: [80, 200]
        })
    };

    const handleGenerateInvoice = (sId: string) => {
        const s = studentsForClass.find(x => x.id === sId);
        if(s) {
             const inv: Invoice = {
                 id: Date.now().toString(), invoiceNo: `INV-${Date.now()}`, date: new Date().toISOString(), studentId: sId, feeItems,
                 totalRequired: feeItems.filter(f=>f.type==='required').reduce((a,b)=>a+b.amount,0),
                 totalOptional: feeItems.filter(f=>f.type==='optional').reduce((a,b)=>a+b.amount,0),
                 totalAmount: feeItems.reduce((a,b)=>a+b.amount,0)
             };
             handleStudentChange({...s, invoices: [...(s.invoices||[]), inv]});
        }
    };

    const handlePrintInvoice = (sId: string, iId: string) => {
         const s = studentsForClass.find(x => x.id === sId);
         const i = s?.invoices?.find(x => x.id === iId);
         if(s && i) setPreviewContent({
             title: "Invoice",
             component: <SchoolFeesInvoice student={s} invoice={i} classInfo={{level: validLevel, arm: validArm, session, term}} schoolInfo={templateSettings.reportCard} logo={currentSchool?.logo || SCHOOL_LOGO_BASE64} />,
             orientation: 'p'
         })
    }


    // --- RENDER ---

    if (isLoading) return <div className="flex justify-center items-center h-screen"><SpinnerIcon className="w-10 h-10 text-sky-600" /></div>;

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} onRegister={handleRegisterSchool} logo={SCHOOL_LOGO_BASE64} />;
    }

    // School Admin / Teacher View
    const renderStep = () => {
        const props = {
            levels: availableLevels,
            arms: allArms,
            selectedLevel: validLevel,
            selectedArm: validArm,
            onLevelChange: setSelectedLevel,
            onArmChange: setSelectedArm,
            selectedSection,
            onSectionChange: setSelectedSection,
            selectedStream,
            onStreamChange: setSelectedStream,
            students: students,
            onStudentChange: handleStudentChange,
            classInfo: { level: validLevel, arm: validArm, session, term },
            currentUser
        };

        switch (currentStep) {
            case 'dashboard': return <Dashboard {...props} subjects={subjectsForClass} onNavigate={setCurrentStep as any} />;
            case 'setup': return <SetupStep {...props} subjects={subjectsForClass} setSubjects={handleSetSubjects} onAddStudent={handleAddStudent} onRemoveStudent={handleRemoveStudent} feeItems={feeItems} setFeeItems={setFeeItems} totalSchoolDays={parseInt(totalSchoolDays) || 0} />;
            case 'scores': return <ScoreEntryStep {...props} subjects={subjectsForClass} selectedSubject={selectedSubjectForEntry} onSelectSubject={setSelectedSubjectForEntry} totalSchoolDays={parseInt(totalSchoolDays) || 0} />;
            case 'invoicing': return <InvoicingStep {...props} onGenerateInvoice={handleGenerateInvoice} onPrintInvoice={handlePrintInvoice} isGeneratingInvoice={isGeneratingInvoice} />;
            case 'payments': return <PaymentsStep {...props} onAddPayment={handleAddPayment} onPrintReceipt={handlePrintReceipt} isGeneratingReceipt={isGeneratingReceipt} />;
            case 'finalize': return <FinalizeStep 
                    students={students} subjects={subjectsForClass} onStudentChange={handleStudentChange} 
                    classInfo={{ level: validLevel, arm: validArm }} 
                    reportSettings={{ nextTermBegins, setNextTermBegins, term, setTerm, session, setSession, principalRemark, setPrincipalRemark, totalSchoolDays, setTotalSchoolDays }}
                    actions={{ 
                        handleGenerateAIRemarks, isGeneratingRemarks, 
                        handleGenerateReports, isGenerating,
                        handleGenerateSubjectReport, isGeneratingSubjectReport, selectedSubjectForReport, setSelectedSubjectForReport,
                        handleGenerateBroadsheet, isGeneratingBroadsheet
                    }} 
                />;
            case 'templates': return <TemplatesStep 
                settings={{ reportCard: templateSettings.reportCard, subjectWise: templateUiSettings.subjectWise, broadsheet: templateUiSettings.broadsheet }} 
                setSettings={setTemplateUiSettings as any} 
                logo={currentSchool?.logo || ''} 
                onLogoChange={handleLogoChange}
                signature={currentSchool?.principalSignature || ''}
                onSignatureChange={handleSignatureChange}
                sessionData={{
                    session, setSession,
                    term, setTerm,
                    totalDays: totalSchoolDays, setTotalDays: setTotalSchoolDays,
                    nextTerm: nextTermBegins, setNextTerm: setNextTermBegins
                }}
            />;
            case 'guide': return <SystemGuide />;
            case 'access_control': return <AccessControlStep currentUser={currentUser} />;
            case 'dev_admin_tools': return <DevSchoolManager schools={schools} onToggleStatus={handleToggleSchoolStatus} onDeleteSchool={handleDeleteSchool} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Header schoolName={currentSchool?.name || 'School System'} currentUser={currentUser} onLogout={handleLogout} logo={currentSchool?.logo || SCHOOL_LOGO_BASE64} />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-lg">
                    <WorkflowTabs currentStep={currentStep} setCurrentStep={setCurrentStep} currentUser={currentUser} />
                    <div className="p-4 sm:p-6 lg:p-8">
                        <Suspense fallback={<div className="flex justify-center items-center h-64"><SpinnerIcon className="w-8 h-8 text-sky-600" /></div>}>
                           {renderStep()}
                        </Suspense>
                    </div>
                </div>
            </main>
            {previewContent && <PrintPreviewModal content={previewContent} onClose={() => setPreviewContent(null)} />}
        </div>
    );
};

export default App;
