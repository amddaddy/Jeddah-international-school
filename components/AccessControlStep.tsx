import React from 'react';
import { User, Permission } from '../types';
import Card from './Card';
import UsersIcon from './icons/UsersIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import UserGroupIcon from './icons/UserGroupIcon';

export const ALL_PERMISSIONS: { id: Permission; name: string; description: string }[] = [
    { id: 'view_dashboard', name: 'View Dashboard', description: 'Can see the main dashboard with stats and actions.' },
    { id: 'manage_students', name: 'Manage Students', description: 'Can add, edit, and remove students from the roster.' },
    { id: 'manage_subjects', name: 'Manage Subjects', description: 'Can add and remove subjects for the school.' },
    { id: 'manage_fees', name: 'Manage Fees', description: 'Can set and update the school fee structure.' },
    { id: 'enter_scores', name: 'Enter Scores', description: 'Can input and modify student scores for tests and exams.' },
    { id: 'generate_invoices', name: 'Generate Invoices', description: 'Can create and issue school fee invoices.' },
    { id: 'record_payments', name: 'Record Payments', description: 'Can record payments made by students and print receipts.' },
    { id: 'finalize_reports', name: 'Finalize & Generate Reports', description: 'Can finalize data, generate AI remarks, and download all reports.' },
    { id: 'customize_templates', name: 'Customize Templates', description: 'Can modify the appearance and content of report templates.' },
    { id: 'view_guide', name: 'View System Guide', description: 'Can access the system workflow guide.' },
    { id: 'view_access_control', name: 'View Access Control', description: 'Can view this permissions table.' },
    { id: 'dev_admin_tools', name: 'Developer Admin Tools', description: 'Can create, view, and remove Administrator accounts.' },
];

const ROLE_DETAILS = {
    dev_admin: { name: 'Developer Admin', icon: <ShieldCheckIcon className="w-6 h-6 text-violet-600" />, description: "Full system access, including managing other administrators. This role is for technical oversight." },
    admin: { name: 'Administrator', icon: <AcademicCapIcon className="w-6 h-6 text-sky-600" />, description: "Full access to all school management features, from student setup to financial records and report generation." },
    teacher: { name: 'Teacher', icon: <UserGroupIcon className="w-6 h-6 text-green-600" />, description: "Limited access primarily for academic tasks, such as viewing the dashboard and entering student scores." }
};


const AccessControlStep: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const isDevAdmin = currentUser.role === 'dev_admin';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-8">
      <Card title="Role-Based Access Control">
        <p className="text-slate-600 mb-6">
          This system uses role-based permissions to ensure data security and appropriate access levels. Below is a breakdown of what each role can do. Permissions for Admins and Teachers are read-only and cannot be changed.
        </p>
        <div className="space-y-6">
          {Object.entries(ROLE_DETAILS).map(([roleId, details]) => (
            <div key={roleId} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-slate-100 rounded-full mr-3">{details.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{details.name}</h3>
                  <p className="text-sm text-slate-500">{details.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card title="Permissions Details">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 text-left font-semibold">Permission</th>
                <th className="p-3 text-center font-semibold">Developer Admin</th>
                <th className="p-3 text-center font-semibold">Administrator</th>
                <th className="p-3 text-center font-semibold">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {ALL_PERMISSIONS.map(permission => (
                <tr key={permission.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-3">
                    <p className="font-medium text-slate-800">{permission.name}</p>
                    <p className="text-xs text-slate-500">{permission.description}</p>
                  </td>
                  <td className="p-3 text-center">
                    <Checkmark enabled={true} />
                  </td>
                  <td className="p-3 text-center">
                     <Checkmark enabled={permission.id !== 'dev_admin_tools'} />
                  </td>
                   <td className="p-3 text-center">
                    <Checkmark enabled={['view_dashboard', 'enter_scores', 'view_guide'].includes(permission.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Checkmark: React.FC<{ enabled: boolean }> = ({ enabled }) => {
    if (enabled) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        );
    }
    return (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
    );
};

export default AccessControlStep;