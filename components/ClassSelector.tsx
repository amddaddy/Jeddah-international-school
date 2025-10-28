import React from 'react';
import Card from './Card';

interface ClassSelectorProps {
  levels: string[];
  arms: string[];
  selectedLevel: string;
  selectedArm: string;
  onLevelChange: (level: string) => void;
  onArmChange: (arm: string) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  levels,
  arms,
  selectedLevel,
  selectedArm,
  onLevelChange,
  onArmChange,
}) => {
  return (
    <Card title="Select Class">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="class-level" className="block text-sm font-medium text-slate-700 mb-1">
            Class Level
          </label>
          <select
            id="class-level"
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="class-arm" className="block text-sm font-medium text-slate-700 mb-1">
            Class Arm
          </label>
          <select
            id="class-arm"
            value={selectedArm}
            onChange={(e) => onArmChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          >
            {arms.map((arm) => (
              <option key={arm} value={arm}>
                {arm}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};

export default ClassSelector;
