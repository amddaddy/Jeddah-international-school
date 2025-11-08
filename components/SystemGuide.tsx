
import React from 'react';
import Card from './Card';
import UsersIcon from './icons/UsersIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';

const SystemGuide: React.FC = () => {

    const StepCard = ({ icon, title, description, features }: { icon: React.ReactNode, title: string, description: string, features: string[] }) => (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full flex flex-col">
            <div className="flex items-center mb-4">
                <div className="p-3 bg-sky-100 text-sky-600 rounded-full mr-4">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
            <ul className="space-y-2 text-slate-600 list-disc list-inside flex-grow">
                {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
        </div>
    );

    const Arrow = () => (
        <div className="flex-col items-center justify-center hidden lg:flex">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
        </div>
    );
    
    const DownArrow = () => (
        <div className="flex items-center justify-center lg:hidden my-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
        </div>
    );


    return (
        <div className="bg-slate-50 p-4 sm:p-6 md:p-8 rounded-2xl border-4 border-slate-200">
            <header className="text-center mb-8 border-b-2 border-slate-300 pb-6">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">System Workflow</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-3xl mx-auto">
                    An AI-Powered, End-to-End Solution for Academic and Financial Management.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-stretch">
                <div className="lg:col-span-2">
                    <StepCard
                        icon={<UsersIcon />}
                        title="1. Setup"
                        description="Configure class & students"
                        features={["Add/Edit Students", "Manage Subjects", "Set Fee Structure"]}
                    />
                </div>
                <Arrow />
                <div className="lg:col-span-2">
                    <DownArrow />
                    <StepCard
                        icon={<ChartBarIcon />}
                        title="2. Scores"
                        description="Enter academic records"
                        features={["Input CA & Exam Scores", "Subject-by-subject Entry", "Handles Absentees ('ABS')"]}
                    />
                </div>
                <Arrow />
                <div className="lg:col-span-2">
                    <DownArrow />
                    <StepCard
                        icon={<CurrencyDollarIcon />}
                        title="3. Financials"
                        description="Invoicing & Payments"
                        features={["Generate Fee Invoices", "Record Student Payments", "Print Receipts"]}
                    />
                </div>
                <Arrow />
                <div className="lg:col-span-3">
                    <DownArrow />
                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-sky-500 h-full flex flex-col">
                        <div className="flex items-center mb-4">
                             <div className="p-3 bg-sky-100 text-sky-600 rounded-full mr-4">
                                <DownloadIcon />
                            </div>
                            <div>
                               <h3 className="text-xl font-bold text-slate-800">4. Reports</h3>
                               <p className="text-sm text-slate-500">Finalize & Generate</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-slate-600 list-disc list-inside flex-grow">
                            <li>Final review of all scores & attendance.</li>
                            <li className="flex items-start"><SparklesIcon className="w-5 h-5 text-violet-500 mr-2 mt-0.5 flex-shrink-0" /> <span>Generate personalized student remarks with AI.</span></li>
                            <li className="flex items-start"><SparklesIcon className="w-5 h-5 text-violet-500 mr-2 mt-0.5 flex-shrink-0" /> <span>Create insightful class analysis with AI.</span></li>
                            <li>Download PDF Report Cards, Subject Reports, and Broadsheets.</li>
                        </div>
                    </div>
                </div>
            </div>
            
             <footer className="text-center mt-10 pt-6 border-t-2 border-slate-300">
                <div className="flex items-center justify-center space-x-2 text-slate-500">
                    <BookOpenIcon className="w-5 h-5" />
                    <p className="text-md font-semibold">Insight ED</p>
                </div>
            </footer>
        </div>
    );
};

export default SystemGuide;