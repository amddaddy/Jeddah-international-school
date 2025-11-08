import React from 'react';
import Card from './Card';

interface ReportSettingsProps {
    nextTermBegins: string;
    setNextTermBegins: (date: string) => void;
    term: string;
    setTerm: (term: string) => void;
    session: string;
    setSession: (session: string) => void;
    principalRemark: string;
    setPrincipalRemark: (name: string) => void;
    totalSchoolDays: string;
    setTotalSchoolDays: (days: string) => void;
}

const ReportSettings: React.FC<ReportSettingsProps> = ({ 
    nextTermBegins, setNextTermBegins,
    term, setTerm,
    session, setSession,
    principalRemark, setPrincipalRemark,
    totalSchoolDays, setTotalSchoolDays
}) => {
    return (
        <Card title="Report Card Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="session" className="block text-sm font-medium text-slate-700 mb-1">
                        Session (e.g., 2024/2025)
                    </label>
                    <input
                        type="text"
                        id="session"
                        value={session}
                        onChange={(e) => setSession(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                 <div>
                    <label htmlFor="term" className="block text-sm font-medium text-slate-700 mb-1">
                        Term
                    </label>
                    <select
                        id="term"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    >
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="total-school-days" className="block text-sm font-medium text-slate-700 mb-1">
                        Total School Days in Session
                    </label>
                    <input
                        type="number"
                        id="total-school-days"
                        value={totalSchoolDays}
                        onChange={(e) => setTotalSchoolDays(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        placeholder="e.g., 120"
                    />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="next-term-begins" className="block text-sm font-medium text-slate-700 mb-1">
                        Next Term Begins
                    </label>
                    <input
                        type="date"
                        id="next-term-begins"
                        value={nextTermBegins}
                        onChange={(e) => setNextTermBegins(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <div className="md:col-span-2">
                     <label htmlFor="principal-remark" className="block text-sm font-medium text-slate-700 mb-1">
                        Principal's Remark
                    </label>
                    <textarea
                        id="principal-remark"
                        value={principalRemark}
                        onChange={(e) => setPrincipalRemark(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        rows={4}
                        placeholder="Enter the principal's general remark for all students..."
                    />
                </div>
            </div>
        </Card>
    );
};

export default ReportSettings;