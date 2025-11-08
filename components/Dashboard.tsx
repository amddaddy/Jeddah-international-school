import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import Card from './Card';
import UsersIcon from './icons/UsersIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import SparklesIcon from './icons/SparklesIcon';
import { getScoreTotal } from '../utils';
import { ai } from '../lib/ai';

interface DashboardProps {
    students: Student[];
    subjects: string[];
    classInfo: { level: string; arm: string };
    onNavigate: (step: 'setup' | 'scores' | 'finalize') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ students, subjects, classInfo, onNavigate }) => {
    
    const [announcements, setAnnouncements] = useState<string[]>([]);
    const [announcementPrompt, setAnnouncementPrompt] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);
    
    const stats = useMemo(() => {
        const totalStudents = students.length;
        if (totalStudents === 0) {
            return {
                totalStudents: 0,
                classAverage: 0,
                totalPayments: 0,
                totalBilled: 0,
            };
        }

        let totalAverage = 0;
        students.forEach(student => {
            const totalScore = subjects.reduce((acc, subject) => acc + getScoreTotal(student.scores[subject]), 0);
            const average = subjects.length > 0 ? totalScore / subjects.length : 0;
            totalAverage += average;
        });
        const classAverage = totalAverage / totalStudents;
        
        const totalPayments = students.reduce((sum, s) => sum + (s.payments?.reduce((pSum, p) => pSum + p.amountPaid, 0) || 0), 0);
        const totalBilled = students.reduce((sum, s) => sum + (s.payments?.reduce((pSum, p) => pSum + p.totalBill, 0) || 0), 0);
        
        return { totalStudents, classAverage, totalPayments, totalBilled };
    }, [students, subjects]);
    
    const handleDraftAnnouncement = async () => {
        if (!announcementPrompt.trim()) return;
        setIsDrafting(true);
        try {
            const prompt = `You are a school administrator. Write a professional and clear announcement for parents based on this topic: "${announcementPrompt}". The announcement should be concise and friendly.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAnnouncementPrompt(response.text);
        } catch (error) {
            console.error("Error drafting announcement:", error);
            alert("Failed to draft announcement. Please check your API key or network connection.");
        } finally {
            setIsDrafting(false);
        }
    };

    const handlePostAnnouncement = () => {
        if (!announcementPrompt.trim()) return;
        setAnnouncements(prev => [announcementPrompt, ...prev]);
        setAnnouncementPrompt('');
    };

    const StatCard = ({ icon, title, value, color, description }: { icon: React.ReactNode, title: string, value: string, color: string, description?: string }) => (
        <div className={`p-4 rounded-lg flex items-center ${color}`}>
            <div className="p-3 bg-white/30 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium opacity-80">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
                {description && <p className="text-xs opacity-70">{description}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    icon={<UsersIcon className="w-6 h-6 text-blue-800"/>} 
                    title="Total Students" 
                    value={stats.totalStudents.toString()}
                    color="bg-blue-400 text-white"
                    description={`Class ${classInfo.level}${classInfo.arm}`}
                 />
                 <StatCard 
                    icon={<ChartBarIcon className="w-6 h-6 text-green-800"/>} 
                    title="Class Average" 
                    value={`${stats.classAverage.toFixed(1)}%`}
                    color="bg-green-400 text-white"
                    description="Overall performance"
                 />
                 <StatCard 
                    icon={<CurrencyDollarIcon className="w-6 h-6 text-yellow-800"/>} 
                    title="Total Payments" 
                    value={`₦${stats.totalPayments.toLocaleString()}`}
                    color="bg-yellow-400 text-white"
                    description={`of ₦${stats.totalBilled.toLocaleString()} billed`}
                 />
            </div>
            
            <Card title="Quick Actions">
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => onNavigate('setup')} className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">Manage Students</button>
                    <button onClick={() => onNavigate('scores')} className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">Enter Scores</button>
                    <button onClick={() => onNavigate('finalize')} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Finalize Reports</button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="School Announcements">
                     <div className="flex items-center gap-2 mb-3">
                        <MegaphoneIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold text-slate-800">Create New Announcement</h3>
                     </div>
                     <textarea
                        value={announcementPrompt}
                        onChange={(e) => setAnnouncementPrompt(e.target.value)}
                        placeholder="Type a topic for an announcement (e.g., 'remind parents about PTA meeting on Friday')..."
                        className="w-full h-24 p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={handleDraftAnnouncement}
                            disabled={isDrafting}
                            className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 disabled:bg-slate-400 flex items-center"
                        >
                            {isDrafting ? <SpinnerIcon className="mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                            {isDrafting ? 'Drafting...' : 'Draft with AI'}
                        </button>
                        <button 
                            onClick={handlePostAnnouncement}
                            className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700"
                        >
                            Post
                        </button>
                    </div>
                </Card>
                <Card title="Recent Announcements">
                    {announcements.length > 0 ? (
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {announcements.map((ann, index) => (
                                <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">{ann}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">No announcements yet.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default React.memo(Dashboard);