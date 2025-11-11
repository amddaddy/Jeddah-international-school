import React from 'react';
import Card from './Card';

interface ClassSelectorProps {
  levels: string[];
  arms: string[];
  selectedLevel: string;
  selectedArm: string;
  onLevelChange: (level: string) => void;
  onArmChange: (arm: string) => void;
  selectedSection: 'Junior' | 'Senior';
  onSectionChange: (section: 'Junior' | 'Senior') => void;
  selectedStream: 'All' | 'Science' | 'Art' | 'Commerce';
  onStreamChange: (stream: 'All' | 'Science' | 'Art' | 'Commerce') => void;
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
}) => {
  const commonSelectClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500";
  const commonLabelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <Card title="Select Class">
      <div className={`grid grid-cols-2 ${selectedSection === 'Senior' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        <div>
          <label htmlFor="class-section" className={commonLabelClass}>
            Section
          </label>
          <select
            id="class-section"
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value as 'Junior' | 'Senior')}
            className={commonSelectClass}
          >
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
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
            className={commonSelectClass}
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
            className={commonSelectClass}
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
              className={commonSelectClass}
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
