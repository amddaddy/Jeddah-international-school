
import React, { useState } from 'react';
import { School } from '../types';
import Card from './Card';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import TrashIcon from './icons/TrashIcon';

interface DevSchoolManagerProps {
    schools: School[];
    onToggleStatus: (schoolId: string, status: 'active' | 'suspended') => void;
    onDeleteSchool: (schoolId: string) => void;
}

const DevSchoolManager: React.FC<DevSchoolManagerProps> = ({ schools, onToggleStatus, onDeleteSchool }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSchools = schools.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Registered Schools</h2>
                <div className="w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Search schools..." 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchools.map(school => (
                    <Card key={school.id} className="relative border-t-4 border-t-sky-500">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img src={school.logo} alt={school.name} className="w-12 h-12 rounded-md object-contain bg-slate-100" />
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{school.name}</h3>
                                    <p className="text-xs text-slate-500">Since {new Date(school.dateRegistered).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${school.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {school.status}
                            </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-slate-600 mb-6">
                            <p><span className="font-semibold">Admin:</span> {school.email}</p>
                            <p><span className="font-semibold">Contact:</span> {school.contactInfo}</p>
                            <p><span className="font-semibold">Address:</span> {school.address}</p>
                        </div>

                        <div className="flex justify-between items-center border-t pt-4">
                            {school.status === 'active' ? (
                                <button 
                                    onClick={() => onToggleStatus(school.id, 'suspended')}
                                    className="text-orange-600 hover:text-orange-800 text-sm font-semibold flex items-center gap-1"
                                >
                                    <ShieldCheckIcon className="w-4 h-4" /> Suspend Access
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onToggleStatus(school.id, 'active')}
                                    className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-1"
                                >
                                    <ShieldCheckIcon className="w-4 h-4" /> Reactivate
                                </button>
                            )}

                            <button 
                                onClick={() => onDeleteSchool(school.id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full"
                                title="Delete School Database"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </Card>
                ))}
                
                {filteredSchools.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No schools found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DevSchoolManager;
