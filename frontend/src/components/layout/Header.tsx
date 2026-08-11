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
    <header className="pt-5 pb-6 flex justify-center items-center w-full z-30 px-4">
      {/* Outer Diffused Glass Container with Gradient Glow Border (No harsh solid line) */}
      <div className="p-[1px] rounded-full bg-gradient-to-r from-[#6417ff]/50 via-white/20 to-[#5400e9]/50 shadow-[0_18px_50px_-12px_rgba(100,23,255,0.35)]">
        
        {/* Inner Glass Content Box */}
        <div className="bg-[#161024]/95 backdrop-blur-2xl p-1.5 rounded-full flex items-center space-x-4 px-4">
          
          {/* Navigation Tabs Track Container with Deep Contrast */}
          <div className="relative flex bg-[#0a0714] border border-white/15 p-1 rounded-full w-64 justify-between items-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]">
            
            {/* Animated Sliding Gradient Purple Indicator Pill */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#6417ff] to-[#5400e9] rounded-full shadow-[0_4px_16px_rgba(100,23,255,0.6)] border border-white/20 transition-all duration-300 ease-out ${
                activeTab === 'today' ? 'left-1' : 'left-[calc(50%+2px)]'
              }`}
            />

            {/* Today Button */}
            <button
              onClick={() => setActiveTab('today')}
              className={`relative z-10 flex-1 py-1.5 text-xs font-extrabold tracking-wide transition-colors duration-200 text-center ${
                activeTab === 'today' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-200 hover:text-white'
              }`}
            >
              Today
            </button>

            {/* Overview Button */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative z-10 flex-1 py-1.5 text-xs font-extrabold tracking-wide transition-colors duration-200 text-center ${
                activeTab === 'overview' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-slate-200 hover:text-white'
              }`}
            >
              Overview
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-white/15" />

          {/* Action Group: Set Goals + User Profile Picture */}
          <div className="flex items-center space-x-3">
            {/* Set Goals Button */}
            <button
              onClick={onOpenSetGoals}
              className="flex items-center space-x-2 bg-[#271e3b] hover:bg-[#34284f] active:scale-95 text-white px-4 py-1.5 rounded-full text-xs font-extrabold border border-white/15 transition-all whitespace-nowrap shadow-md hover:border-[#6417ff]/60"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-300" />
              <span>Set goals</span>
            </button>

            {/* User Profile Avatar (Google Photo) */}
            <button
              onClick={onOpenAuth}
              className="w-8 h-8 rounded-full bg-[#271e3b] hover:bg-[#34284f] border border-white/20 flex items-center justify-center text-white overflow-hidden transition-all transform hover:scale-105 active:scale-95 shadow-md hover:border-[#6417ff]"
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
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
