import React from 'react';
import { Edit3, LogIn, Sun, Moon, Zap } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface HeaderProps {
  activeTab: 'nutria' | 'overview';
  setActiveTab: (tab: 'nutria' | 'overview') => void;
  onOpenSetGoals: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isVisible?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSetGoals,
  user,
  onOpenAuth,
  theme,
  onToggleTheme,
  isVisible = true,
}) => {
  const isLight = theme === 'light';
  const iconColorClass = isLight ? 'text-slate-700' : 'text-zinc-300';

  const actionBtnClass = isLight
    ? 'bg-slate-100/90 text-slate-800 border border-slate-300/80 hover:bg-slate-200/90 hover:border-slate-400'
    : 'bg-[#141416] hover:bg-[#1c1c20] text-zinc-200 hover:text-white border border-white/[0.08] hover:border-white/[0.18] shadow-xs';

  return (
    <header className={`w-full z-30 sticky top-0 transition-transform duration-300 border-b backdrop-blur-xl shrink-0 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
    } ${
      isLight ? 'bg-white/85 border-slate-200 text-slate-900 shadow-sm' : 'bg-[#080808]/85 border-white/[0.08] text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-2 min-[360px]:px-2.5 sm:px-6 lg:px-8 py-2 sm:py-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center sm:flex sm:justify-between gap-1 min-[360px]:gap-1.5 sm:gap-3 min-w-0">
        {/* 1. LEFT: BRAND LOGO */}
        <div className="flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-tr from-white to-zinc-400 flex items-center justify-center shadow-sm text-black">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="hidden sm:block">
            <span className={`font-extrabold text-sm sm:text-base tracking-tight block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              NutritionTracker
            </span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
              AI Precision Nutrition
            </span>
          </div>

          {/* Mobile-only theme control balances the utility actions on the right. */}
          <button
            onClick={onToggleTheme}
            className={`sm:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xs shrink-0 touch-manipulation select-none ${actionBtnClass}`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? (
              <Sun className={`w-4 h-4 ${iconColorClass}`} />
            ) : (
              <Moon className={`w-4 h-4 ${iconColorClass}`} />
            )}
          </button>
        </div>

        {/* 2. CENTER: CLEAN SEGMENTED PILL (Cursor Monochromatic Black/White) */}
        <div className={`justify-self-center sm:justify-self-auto flex items-center p-0.5 sm:p-1 rounded-full border transition-colors shrink min-w-0 ${
          isLight ? 'bg-slate-100/90 border-slate-300/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]' : 'bg-[#141416] border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
        }`}>
          {/* Nutria Tab — 40px on very small phones, 44px from ~360px */}
          <button
            onClick={() => setActiveTab('nutria')}
            className={`min-h-10 sm:min-h-0 px-2 min-[360px]:px-3 sm:px-6 py-2 sm:py-1.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide transition-all touch-manipulation select-none ${
              activeTab === 'nutria'
                ? isLight
                  ? 'bg-black text-white font-black shadow-sm'
                  : 'bg-white text-black font-black shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Nutria
          </button>

          {/* Overview Tab */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`min-h-10 sm:min-h-0 px-2 min-[360px]:px-3 sm:px-6 py-2 sm:py-1.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide transition-all touch-manipulation select-none ${
              activeTab === 'overview'
                ? isLight
                  ? 'bg-black text-white font-black shadow-sm'
                  : 'bg-white text-black font-black shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Overview
          </button>
        </div>

        {/* 3. RIGHT: UTILITY ACTION BUTTONS — 40→44px targets + wider gaps on mobile */}
        <div className="justify-self-end sm:justify-self-auto flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-2.5 shrink-0">
          {/* Set Goals Button */}
          <button
            onClick={onOpenSetGoals}
            className={`w-10 h-10 sm:w-auto sm:h-9.5 sm:px-4 rounded-full flex items-center justify-center space-x-1.5 text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap shadow-xs active:scale-95 shrink-0 touch-manipulation select-none ${actionBtnClass}`}
            title="Set Goals"
          >
            <Edit3 className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${iconColorClass} shrink-0`} />
            <span className="hidden sm:inline">Set goals</span>
          </button>

          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            onClick={onToggleTheme}
            className={`hidden sm:flex sm:w-9.5 sm:h-9.5 rounded-full items-center justify-center transition-all active:scale-95 shadow-xs shrink-0 touch-manipulation select-none ${actionBtnClass}`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? (
              <Sun className={`w-4 h-4 ${iconColorClass}`} />
            ) : (
              <Moon className={`w-4 h-4 ${iconColorClass}`} />
            )}
          </button>

          {/* User Profile / Login Avatar */}
          <button
            onClick={onOpenAuth}
            className={`w-10 h-10 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center overflow-hidden transition-all active:scale-95 shadow-xs shrink-0 touch-manipulation select-none ${actionBtnClass}`}
            title={user ? `${user.firstName} (Settings)` : 'Sign in with Google'}
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
