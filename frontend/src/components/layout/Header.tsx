import React from 'react';
import { Edit3, LogIn } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface HeaderProps {
  activeTab: 'today' | 'overview';
  setActiveTab: (tab: 'today' | 'overview') => void;
  onOpenSetGoals: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSetGoals,
  user,
  onOpenAuth,
}) => {
  return (
    <header className="pt-6 pb-8 flex justify-center items-center w-full z-30 px-4">
      {/* Floating Glass Container */}
      <div className="bg-[#15111c]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-[0_18px_44px_-24px_rgba(100,23,255,0.24)] flex items-center space-x-3 max-w-xl w-full justify-between px-3">
        
        {/* Navigation Tabs Pill Container */}
        <div className="flex bg-transparent p-0.5 rounded-full justify-between space-x-1 flex-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2 px-6 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeTab === 'today'
                ? 'bg-[#6417ff] text-white shadow-lg shadow-[#6417ff]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-6 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-[#6417ff] text-white shadow-lg shadow-[#6417ff]/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
        </div>

        {/* Action Group: Set Goals + User Profile Picture */}
        <div className="flex items-center space-x-2">
          {/* Set Goals Button */}
          <button
            onClick={onOpenSetGoals}
            className="flex items-center space-x-2 bg-[#221c2d] hover:bg-[#2c243b] text-white px-4 py-2 rounded-full text-xs font-semibold border border-white/10 transition-all whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-300" />
            <span>Set goals</span>
          </button>

          {/* User Profile Avatar (Google Photo) */}
          <button
            onClick={onOpenAuth}
            className="w-9 h-9 rounded-full bg-[#221c2d] hover:bg-[#2c243b] border border-white/15 flex items-center justify-center text-white overflow-hidden transition-all transform hover:scale-105"
            title={user ? `${user.firstName} (Click for Settings)` : 'Sign in with Google'}
          >
            {user && user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.firstName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : user ? (
              <span className="text-xs font-bold text-[#6417ff]">
                {user.firstName.charAt(0)}
              </span>
            ) : (
              <LogIn className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
