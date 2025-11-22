
import React, { useMemo } from 'react';
import { User } from '../types';

type Step = 'dashboard' | 'setup' | 'staff' | 'templates' | 'scores' | 'invoicing' | 'payments' | 'finalize' | 'guide' | 'access_control' | 'dev_admin_tools';

interface WorkflowTabsProps {
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  currentUser: User | null;
}

const WorkflowTabs: React.FC<WorkflowTabsProps> = ({ currentStep, setCurrentStep, currentUser }) => {

  const allTabs = useMemo(() => [
    { id: 'dashboard', name: 'Dashboard', permission: 'view_dashboard' },
    { id: 'setup', name: 'Students', permission: 'manage_students' },
    { id: 'staff', name: 'Staff', permission: 'manage_staff' },
    { id: 'templates', name: 'Templates', permission: 'customize_templates' },
    { id: 'scores', name: 'Scores', permission: 'enter_scores' },
    { id: 'invoicing', name: 'Invoicing', permission: 'generate_invoices' },
    { id: 'payments', name: 'Payments', permission: 'record_payments' },
    { id: 'finalize', name: 'Reports', permission: 'finalize_reports' },
    { id: 'guide', name: 'System Guide', permission: 'view_guide' },
    { id: 'access_control', name: 'Access Control', permission: 'view_access_control' },
    { id: 'dev_admin_tools', name: 'Dev Admin', permission: 'dev_admin_tools' },
  ], []);

  const visibleTabs = useMemo(() => {
    if (!currentUser) return [];
    return allTabs.filter(tab => currentUser.permissions[tab.permission as keyof User['permissions']]);
  }, [currentUser, allTabs]);

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
