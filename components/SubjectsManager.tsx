
import React, { useState } from 'react';
import Card from './Card';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import ConfirmationDialog from './ConfirmationDialog';

interface SubjectsManagerProps {
  subjects: string[];
  setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
}

const SubjectsManager: React.FC<SubjectsManagerProps> = ({ subjects, setSubjects }) => {
  const [newSubject, setNewSubject] = useState('');
  const [subjectToRemove, setSubjectToRemove] = useState<string | null>(null);

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
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

  return (
     <Card title="Manage Subjects">
      <div className="mb-4 flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <div key={subject} className="flex items-center bg-sky-100 text-sky-800 rounded-full px-3 py-1 text-sm font-medium">
            <span>{subject}</span>
            <button onClick={() => handleRequestRemove(subject)} className="ml-2 text-sky-600 hover:text-sky-800">
              <XIcon />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New Subject Name"
          className="flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
        />
        <button
          onClick={handleAddSubject}
          className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Add
        </button>
      </div>
      <ConfirmationDialog
        isOpen={!!subjectToRemove}
        onClose={() => setSubjectToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Confirm Subject Deletion"
        message={`Are you sure you want to delete the subject "${subjectToRemove}"? All scores entered for this subject will be lost.`}
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
      />
    </Card>
  );
};

export default SubjectsManager;
