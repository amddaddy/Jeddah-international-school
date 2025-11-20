import React from 'react';
import { User } from '../types';
import LogoutIcon from './icons/LogoutIcon';
import UserIcon from './icons/UserIcon';


interface HeaderProps {
  schoolName: string;
  currentUser: User | null;
  onLogout: () => void;
  logo: string;
}

const Header: React.FC<HeaderProps> = ({ schoolName, currentUser, onLogout, logo }) => {
  const roleDisplay: Record<User['role'], string> = {
      dev_admin: 'Developer Admin',
      admin: 'Administrator',
      teacher: 'Teacher'
  };

  return (
    <header className="bg-white shadow-md h-24">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={logo} alt={`${schoolName} Logo`} className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 uppercase">{schoolName}</h1>
            <p className="text-slate-600">Student Performance Tracker</p>
          </div>
        </div>

        {currentUser && (
            <div className="flex items-center space-x-4">
                 <div className="text-right">
                    <p className="font-semibold text-slate-800">{currentUser.name}</p>
                    <p className="text-sm text-slate-500">{roleDisplay[currentUser.role]}</p>
                </div>
                 <div className="p-2.5 bg-slate-100 rounded-full text-slate-500">
                    <UserIcon className="w-6 h-6" />
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center space-x-2 text-slate-600 hover:text-red-600 transition-colors"
                    aria-label="Logout"
                >
                    <LogoutIcon className="w-6 h-6" />
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;