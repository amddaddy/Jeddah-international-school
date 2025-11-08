import React from 'react';
import { Role, Permissions } from '../types';

type Step = 'dashboard' | 'setup' | 'templates' | 'scores' | 'invoicing' | 'payments' | 'finalize' | 'guide' | 'access_control';

interface WorkflowTabsProps {
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  userRole: Role;
  permissions: Permissions;
}

const WorkflowTabs: React.FC<WorkflowTabsProps> = ({ currentStep, setCurrentStep, userRole, permissions }) => {
  const allTabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'setup', name: 'Setup' },
    { id: 'templates', name: 'Templates' },
    { id: 'scores', name: 'Scores' },
    { id: 'invoicing', name: 'Invoicing' },
    { id: 'payments', name: 'Payments' },
    { id: 'finalize', name: 'Reports' },
    { id: 'guide', name: 'System Guide' },
    { id: 'access_control', name: 'Access Control' },
  ];

  const userPermissions = permissions[userRole] || {};
  const visibleTabs = allTabs.filter(tab => userPermissions[tab.id as keyof typeof userPermissions]);

  const getTabClass = (tabId: Step) => {
    const baseClass = "px-4 py-3 text-sm font-semibold rounded-t-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors whitespace-nowrap";
    if (tabId === currentStep) {
      return `${baseClass} bg-white text-sky-600 border-b-2 border-sky-600`;
    }
    return `${baseClass} text-slate-500 hover:bg-slate-100 hover:text-slate-700`;
  };

  return (
    <nav className="border-b border-slate-200 overflow-x-auto">
      <ul className="flex -mb-px">
        {visibleTabs.map(tab => (
          <li key={tab.id}>
            <button
              onClick={() => setCurrentStep(tab.id as Step)}
              className={getTabClass(tab.id as Step)}
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
