
import React, { useState } from 'react';
import Card from './Card';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import ConfirmationDialog from './ConfirmationDialog';

interface SubjectsManagerProps {
  subjects: string[];
  setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
  onAddSubject: (name: string, category: 'Nursery' | 'Primary' | 'Junior' | 'Senior' | 'All', stream?: 'General' | 'Science' | 'Art' | 'Commerce') => void;
}

const SubjectsManager: React.FC<SubjectsManagerProps> = ({ subjects, setSubjects, onAddSubject }) => {
  const [newSubject, setNewSubject] = useState('');
  const [category, setCategory] = useState<'Nursery' | 'Primary' | 'Junior' | 'Senior' | 'All'>('All');
  const [stream, setStream] = useState<'General' | 'Science' | 'Art' | 'Commerce'>('General');
  const [subjectToRemove, setSubjectToRemove] = useState<string | null>(null);

  const handleAddSubject = () => {
    if (newSubject.trim()) {
        onAddSubject(newSubject.trim(), category, stream);
        setNewSubject('');
    }
  };

  const handleRequestRemove = (subjectToRemove: string) => {
    setSubjectToRemove(subjectToRemove);
  };

  const handleConfirmRemove = () => {
    if (subjectToRemove) {
      setSubjects(subjects.filter((subject) => subject !== subjectToRemove));
      setSubjectToRemove(null);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubject();
    }
  };

  const showStreamSelect = category === 'Senior';

  return (
     <Card title="Manage Subjects">
      <div className="mb-4 flex flex-wrap gap-2">
        {subjects.length > 0 ? subjects.map((subject) => (
          <div key={subject} className="flex items-center bg-sky-100 text-sky-800 rounded-full px-3 py-1 text-sm font-medium">
            <span>{subject}</span>
            <button onClick={() => handleRequestRemove(subject)} className="ml-2 text-sky-600 hover:text-sky-800">
              <XIcon />
            </button>
          </div>
        )) : (
            <p className="text-sm text-slate-500 italic">No subjects found for this section.</p>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New Subject Name"
          className="w-full md:flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
        />
        <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
        >
            <option value="All">All Sections</option>
            <option value="Nursery">Nursery Only</option>
            <option value="Primary">Primary Only</option>
            <option value="Junior">Junior Only</option>
            <option value="Senior">Senior Only</option>
        </select>
        
        {showStreamSelect && (
             <select 
                value={stream} 
                onChange={(e) => setStream(e.target.value as any)}
                className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
            >
                <option value="General">General (All Students)</option>
                <option value="Science">Science Only</option>
                <option value="Art">Art Only</option>
                <option value="Commerce">Commerce Only</option>
            </select>
        )}

        <button
          onClick={handleAddSubject}
          className="w-full md:w-auto bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center justify-center whitespace-nowrap"
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Add
        </button>
      </div>
      <ConfirmationDialog
        isOpen={!!subjectToRemove}
        onClose={() => setSubjectToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Confirm Subject Deletion"
        message={`Are you sure you want to delete the subject "${subjectToRemove}" from the CURRENT list? All scores entered for this subject will be lost.`}
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
      />
    </Card>
  );
};

export default SubjectsManager;
