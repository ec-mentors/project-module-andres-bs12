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
        
        {/* Navigation Tabs Pill Container with Sliding Purple Background Indicator */}
        <div className="relative flex bg-[#221c2d]/60 border border-white/5 p-1 rounded-full w-64 justify-between items-center">
          
          {/* Animated Sliding Purple Indicator Pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#6417ff] rounded-full shadow-lg shadow-[#6417ff]/40 transition-all duration-300 ease-out ${
              activeTab === 'today' ? 'left-1' : 'left-[calc(50%+2px)]'
            }`}
          />

          {/* Today Button */}
          <button
            onClick={() => setActiveTab('today')}
            className={`relative z-10 flex-1 py-1.5 text-xs font-bold transition-colors duration-200 text-center ${
              activeTab === 'today' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>

          {/* Overview Button */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative z-10 flex-1 py-1.5 text-xs font-bold transition-colors duration-200 text-center ${
              activeTab === 'overview' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
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
