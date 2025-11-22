
import React from 'react';
import Card from './Card';
import { User } from '../types';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface ClassSelectorProps {
  levels: string[];
  arms: string[];
  selectedLevel: string;
  selectedArm: string;
  onLevelChange: (level: string) => void;
  onArmChange: (arm: string) => void;
  selectedSection: 'Nursery' | 'Primary' | 'Junior' | 'Senior';
  onSectionChange: (section: 'Nursery' | 'Primary' | 'Junior' | 'Senior') => void;
  selectedStream: 'All' | 'Science' | 'Art' | 'Commerce';
  onStreamChange: (stream: 'All' | 'Science' | 'Art' | 'Commerce') => void;
  currentUser?: User; // Added currentUser prop
  allowedSections?: string[]; // New prop for filtering
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  levels,
  arms,
  selectedLevel,
  selectedArm,
  onLevelChange,
  onArmChange,
  selectedSection,
  onSectionChange,
  selectedStream,
  onStreamChange,
  currentUser,
  allowedSections = ['Nursery', 'Primary', 'Junior', 'Senior']
}) => {
  const commonSelectClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500";
  const commonLabelClass = "block text-sm font-medium text-slate-700 mb-1";
  const disabledSelectClass = "w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-md shadow-sm cursor-not-allowed";

  // Determine if the selector should be locked.
  // Locked if: User is teacher, has assigned class, AND has NO subjects assigned to teach elsewhere.
  // If they have subjects, they need to be able to switch classes to enter scores.
  const isStrictlyFormMaster = currentUser?.role === 'teacher' && 
                               !!currentUser?.assignedClass && 
                               (!currentUser?.assignedSubjects || currentUser.assignedSubjects.length === 0);

  return (
    <Card title="Select Class">
        {isStrictlyFormMaster && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Form Master View: Locked to your assigned class.</span>
            </div>
        )}
      <div className={`grid grid-cols-2 ${selectedSection === 'Senior' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        <div>
          <label htmlFor="class-section" className={commonLabelClass}>
            Section
          </label>
          <select
            id="class-section"
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value as any)}
            className={isStrictlyFormMaster ? disabledSelectClass : commonSelectClass}
            disabled={isStrictlyFormMaster}
          >
            {allowedSections.includes('Nursery') && <option value="Nursery">Nursery</option>}
            {allowedSections.includes('Primary') && <option value="Primary">Primary</option>}
            {allowedSections.includes('Junior') && <option value="Junior">Junior Secondary</option>}
            {allowedSections.includes('Senior') && <option value="Senior">Senior Secondary</option>}
          </select>
        </div>
        <div>
          <label htmlFor="class-level" className={commonLabelClass}>
            Class Level
          </label>
          <select
            id="class-level"
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className={isStrictlyFormMaster ? disabledSelectClass : commonSelectClass}
            disabled={isStrictlyFormMaster}
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="class-arm" className={commonLabelClass}>
            Class Arm
          </label>
          <select
            id="class-arm"
            value={selectedArm}
            onChange={(e) => onArmChange(e.target.value)}
            className={isStrictlyFormMaster ? disabledSelectClass : commonSelectClass}
            disabled={isStrictlyFormMaster}
          >
            {arms.map((arm) => (
              <option key={arm} value={arm}>
                {arm}
              </option>
            ))}
          </select>
        </div>
        {selectedSection === 'Senior' && (
          <div>
            <label htmlFor="class-stream" className={commonLabelClass}>
              Stream
            </label>
            <select
              id="class-stream"
              value={selectedStream}
              onChange={(e) => onStreamChange(e.target.value as 'All' | 'Science' | 'Art' | 'Commerce')}
              className={commonSelectClass} // Stream usually remains filterable even for form masters to see specific students
            >
              <option value="All">All Streams</option>
              <option value="Science">Science</option>
              <option value="Art">Art</option>
              <option value="Commerce">Commerce</option>
            </select>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClassSelector;