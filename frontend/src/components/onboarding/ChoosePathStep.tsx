import React from 'react';
import { Sparkles, Sliders, ChevronRight } from 'lucide-react';
import type { OnboardingPath } from './types';

interface ChoosePathStepProps {
  onSelectPath: (path: OnboardingPath) => void;
  theme?: 'dark' | 'light';
}

export const ChoosePathStep: React.FC<ChoosePathStepProps> = ({
  onSelectPath,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  // Render AI-Powered Setup Card Component
  const renderAiCard = () => (
    <button
      type="button"
      onClick={() => onSelectPath('ai')}
      className={`group relative w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-center justify-between text-left transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${
        isLight
          ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-400 shadow-sm'
          : 'bg-[#121214] hover:bg-[#18181b] border-white/[0.08] hover:border-white/[0.18] shadow-xl text-white'
      }`}
    >
      {/* Left: Squircle Icon & Titles */}
      <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 flex-1">
        <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform shadow-xs ${
          isLight ? 'bg-slate-100 text-slate-900 border-slate-200' : 'bg-white/10 text-white border-white/15'
        }`}>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h3 className={`text-sm sm:text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              AI-Powered Setup
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0 shadow-xs ${
              isLight ? 'bg-black text-white' : 'bg-white text-black'
            }`}>
              Recommended
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-1 leading-snug ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Personalized calculation in 4 quick steps
          </p>
        </div>
      </div>

      {/* Right: Affordance Arrow */}
      <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
    </button>
  );

  // Render Manual Customization Card Component
  const renderManualCard = () => (
    <button
      type="button"
      onClick={() => onSelectPath('manual')}
      className={`group relative w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-center justify-between text-left transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${
        isLight
          ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
          : 'bg-[#121214] hover:bg-[#18181b] border-white/[0.08] hover:border-white/[0.18] shadow-md text-white'
      }`}
    >
      {/* Left: Squircle Icon & Titles */}
      <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 flex-1">
        <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform ${
          isLight
            ? 'bg-slate-100 border-slate-300 text-slate-700'
            : 'bg-white/5 border-white/10 text-zinc-300'
        }`}>
          <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm sm:text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Manual Customization
          </h3>
          <p className={`text-xs sm:text-sm mt-1 leading-snug ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Configure calories and macros directly
          </p>
        </div>
      </div>

      {/* Right: Affordance Arrow */}
      <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
    </button>
  );

  const renderDivider = () => (
    <div className="flex items-center py-2 max-w-xs mx-auto w-full my-1">
      <div className={`flex-1 h-[1px] ${
        isLight
          ? 'bg-gradient-to-r from-transparent via-slate-300 to-slate-400'
          : 'bg-gradient-to-r from-transparent via-white/10 to-white/20'
      }`} />
      <span className={`px-3 text-xs font-bold uppercase tracking-wider ${
        isLight ? 'text-slate-500' : 'text-zinc-500'
      }`}>or</span>
      <div className={`flex-1 h-[1px] ${
        isLight
          ? 'bg-gradient-to-l from-transparent via-slate-300 to-slate-400'
          : 'bg-gradient-to-l from-transparent via-white/10 to-white/20'
      }`} />
    </div>
  );

  return (
    <div className="w-full max-w-xl mx-auto h-full flex flex-col justify-between text-left animate-in fade-in duration-300">
      
      {/* Scrollable Middle Container */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-4 pt-2 pb-6 custom-scrollbar flex flex-col justify-center">
        
        {/* Header Content with Clear Hierarchy */}
        <div className="pt-3 sm:pt-6 pb-4 sm:pb-6 text-center space-y-1.5">
          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            How would you like to set up your goals?
          </h2>
          <p className={`text-xs sm:text-sm font-medium max-w-sm sm:max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Choose your preferred approach to determine your daily caloric intake and macro split.
          </p>
        </div>

        {/* Stacked Decision Cards */}
        <div className="space-y-3 sm:space-y-3.5 max-w-lg mx-auto w-full">
          {renderAiCard()}
          {renderDivider()}
          {renderManualCard()}
        </div>

      </div>

    </div>
  );
};
