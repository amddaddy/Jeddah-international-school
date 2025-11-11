
import React from 'react';
import { SCHOOL_LOGO_BASE64 } from './assets';
import { User } from '../types';

interface HeaderProps {
  schoolName: string;
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ schoolName, user, onLogout }) => (
  <header className="bg-white shadow-md h-24">
    <div className="container mx-auto px-6 h-full flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <img src={SCHOOL_LOGO_BASE64} alt={`${schoolName} Logo`} className="h-16 w-16 object-contain" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase">{schoolName}</h1>
          <p className="text-slate-600">Student Performance Tracker</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
            <p className="text-sm text-slate-600">Welcome, <span className="font-semibold">{user.name}</span></p>
            <p className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block">{user.role}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
);

export default Header;
