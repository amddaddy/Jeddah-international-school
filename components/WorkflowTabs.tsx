import React from 'react';

interface WorkflowTabsProps {
  currentStep: 'setup' | 'scores' | 'finalize';
  setCurrentStep: (step: 'setup' | 'scores' | 'finalize') => void;
}

const WorkflowTabs: React.FC<WorkflowTabsProps> = ({ currentStep, setCurrentStep }) => {
  const tabs = [
    { id: 'setup', name: 'Step 1: Class Setup' },
    { id: 'scores', name: 'Step 2: Score Entry' },
    { id: 'finalize', name: 'Step 3: Finalize Reports' },
  ];

  const getTabClass = (tabId: 'setup' | 'scores' | 'finalize') => {
    const baseClass = "px-4 py-3 text-sm font-semibold rounded-t-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors";
    if (tabId === currentStep) {
      return `${baseClass} bg-white text-sky-600 border-b-2 border-sky-600`;
    }
    return `${baseClass} text-slate-500 hover:bg-slate-100 hover:text-slate-700`;
  };

  return (
    <nav className="border-b border-slate-200">
      <ul className="flex -mb-px">
        {tabs.map(tab => (
          <li key={tab.id}>
            <button
              onClick={() => setCurrentStep(tab.id as 'setup' | 'scores' | 'finalize')}
              className={getTabClass(tab.id as 'setup' | 'scores' | 'finalize')}
              aria-current={currentStep === tab.id ? 'page' : undefined}
            >
              {tab.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default WorkflowTabs;
