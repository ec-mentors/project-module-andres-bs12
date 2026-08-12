import React from 'react';
import { Edit3, LogIn, Sun, Moon } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface HeaderProps {
  activeTab: 'today' | 'overview';
  setActiveTab: (tab: 'today' | 'overview') => void;
  onOpenSetGoals: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSetGoals,
  user,
  onOpenAuth,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';
  const iconColorClass = isLight ? 'text-slate-700' : 'text-purple-200';

  // UNIFIED ACTION BUTTON STYLING & HOVER BEHAVIOR (EXACT SAME AS SET GOALS)
  const actionBtnClass = isLight
    ? 'bg-slate-100/90 text-slate-800 border border-slate-300/80 hover:bg-slate-200/90 hover:border-purple-300'
    : 'bg-[#231a38] hover:bg-[#2d2248] text-white border border-white/15 hover:border-[#6417ff]/60';

  return (
    <header className="pt-4 pb-5 flex justify-center items-center w-full z-30 px-3 sm:px-8">
      {/* Outer Glass Gradient Glow */}
      <div className={`p-[1px] rounded-full transition-all duration-300 max-w-full ${
        isLight
          ? 'bg-gradient-to-r from-white/80 via-[#6417ff]/20 to-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
          : 'bg-gradient-to-r from-white/10 via-[#6417ff]/20 to-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
      }`}>
        
        {/* Inner Content Box */}
        <div className={`backdrop-blur-sm p-1.5 rounded-full flex items-center space-x-2.5 sm:space-x-3.5 px-3 sm:px-4 h-14 sm:h-16 transition-colors duration-300 ${
          isLight ? 'bg-white/95 text-slate-900 border border-slate-200/80 shadow-sm' : 'bg-[#161024]/95 text-white border border-white/10'
        }`}>
          
          {/* Navigation Track */}
          <div className={`relative flex p-1 rounded-full w-44 sm:w-56 h-10 justify-between items-center transition-colors duration-300 shrink-0 ${
            isLight
              ? 'bg-slate-100/90 border border-slate-300/70 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]'
              : 'bg-[#0a0714] border border-white/15 shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]'
          }`}>
            
            {/* Animated Sliding Indicator Pill (SOLID BRAND PURPLE #6417ff WITHOUT GRADIENTS IN LIGHT MODE) */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out ${
                isLight
                  ? 'bg-[#6417ff] shadow-sm'
                  : 'bg-[#6417ff] shadow-[0_4px_16px_rgba(100,23,255,0.4)] border border-white/20'
              } ${activeTab === 'today' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
            />

            {/* Today Button */}
            <button
              onClick={() => setActiveTab('today')}
              className={`relative z-10 flex-1 h-8 text-xs sm:text-sm font-extrabold tracking-wide transition-colors duration-200 text-center flex items-center justify-center ${
                activeTab === 'today'
                  ? 'text-white drop-shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Today
            </button>

            {/* Overview Button */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative z-10 flex-1 h-8 text-xs sm:text-sm font-extrabold tracking-wide transition-colors duration-200 text-center flex items-center justify-center ${
                activeTab === 'overview'
                  ? 'text-white drop-shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Overview
            </button>
          </div>

          {/* Symmetrical Vertical Divider */}
          <div className={`h-6 w-px shrink-0 ${isLight ? 'bg-slate-300/80' : 'bg-white/20'}`} />

          {/* Set Goals Button */}
          <button
            onClick={onOpenSetGoals}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 h-10 rounded-full text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap shadow-sm shrink-0 active:scale-95 ${actionBtnClass}`}
          >
            <Edit3 className={`w-3.5 h-3.5 ${iconColorClass} shrink-0`} />
            <span className="hidden sm:inline">Set goals</span>
            <span className="sm:hidden">Goals</span>
          </button>

          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden transition-all active:scale-95 shadow-sm shrink-0 ${actionBtnClass}`}
            title={`Switch to ${isLight ? 'Dark Glass' : 'Light Glass'} Mode`}
          >
            {isLight ? (
              <Sun className={`w-4 h-4 ${iconColorClass}`} />
            ) : (
              <Moon className={`w-4 h-4 ${iconColorClass}`} />
            )}
          </button>

          {/* Login / User Profile Button */}
          <button
            onClick={onOpenAuth}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden transition-all active:scale-95 shadow-sm shrink-0 ${actionBtnClass}`}
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
              <span className={`text-xs font-bold ${iconColorClass}`}>
                {user.firstName.charAt(0)}
              </span>
            ) : (
              <LogIn className={`w-4 h-4 ${iconColorClass}`} />
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
