
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Student, School, User, TemplateSettings, FeeItem } from './types';
import Header from './components/Header';
import WorkflowTabs from './components/WorkflowTabs';
import SpinnerIcon from './components/icons/SpinnerIcon';
import PrintPreviewModal from './components/PrintPreviewModal';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase/firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';

// Lazy load components...
const Dashboard = lazy(() => import('./components/Dashboard'));
const SetupStep = lazy(() => import('./components/SetupStep'));
const ScoreEntryStep = lazy(() => import('./components/ScoreEntryStep'));
const FinalizeStep = lazy(() => import('./components/FinalizeStep'));
const StaffManagementStep = lazy(() => import('./components/StaffManagementStep'));
// ... (Import other components as needed)

interface SchoolAppProps {
    school: School;
    user: User;
}

const SchoolApp: React.FC<SchoolAppProps> = ({ school, user }) => {
    const { logout } = useAuth();
    
    // State - Loaded from Firestore now
    const [students, setStudents] = useState<Student[]>([]);
    const [staff, setStaff] = useState<User[]>([]);
    const [currentStep, setCurrentStep] = useState<any>('dashboard');
    const [previewContent, setPreviewContent] = useState<any>(null);

    // Initial constants
    const [nurserySubjects, setNurserySubjects] = useState<string[]>([]); // Load these from school config in Firestore later
    // ... Initialize other subjects similarly

    // FIRESTORE LISTENERS
    useEffect(() => {
        // Listen to Students
        const q = collection(db, 'schools', school.id, 'students');
        const unsubStudents = onSnapshot(q, (snapshot) => {
            const loadedStudents = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
            setStudents(loadedStudents);
        });
        
        return () => {
            unsubStudents();
        };
    }, [school.id]);

    // Derived Logic (Same as before)
    // ...

    // Handlers need to use Firestore write functions instead of setState/localStorage
    const handleAddStudent = async () => {
        // Implement addDoc to Firestore
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            <Header 
                schoolName={school.name} 
                currentUser={user} 
                onLogout={logout} 
                logo={school.logo} 
            />
            
            <main className="container mx-auto px-6 py-8">
                <WorkflowTabs currentStep={currentStep} setCurrentStep={setCurrentStep} currentUser={user} />
                
                <div className="mt-6">
                    <Suspense fallback={<div className="flex justify-center py-10"><SpinnerIcon className="w-8 h-8 text-sky-600" /></div>}>
                         {/* Pass students and handlers as props to components */}
                         {currentStep === 'dashboard' && <Dashboard students={students} subjects={[]} subjectStreamMap={{}} classInfo={{level:'SS 1', arm:'A'}} onNavigate={setCurrentStep} />}
                         {/* Other steps... */}
                    </Suspense>
                </div>
            </main>

            {previewContent && (
                <PrintPreviewModal 
                    content={previewContent} 
                    onClose={() => setPreviewContent(null)} 
                />
            )}
        </div>
    );
};

export default SchoolApp;
