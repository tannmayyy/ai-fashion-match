import React from 'react';
import type { User } from 'firebase/auth';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
             </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            AI Fashion Match
          </h1>
        </div>
        {user && (
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden sm:block font-medium">{user.displayName || user.email}</span>
                <button onClick={onLogout} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                    Logout
                </button>
            </div>
        )}
      </div>
    </header>
  );
};