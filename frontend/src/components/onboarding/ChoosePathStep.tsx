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

  // Render AI-Powered Setup Card Component with Crisp, Responsive Border Glow
  const renderAiCard = () => (
    <button
      type="button"
      onClick={() => onSelectPath('ai')}
      className={`group relative w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-between text-left transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${
        isLight
          ? 'bg-white hover:bg-purple-50/50 border-[#6417ff]/40 hover:border-[#6417ff] shadow-md shadow-[#6417ff]/10 hover:shadow-lg hover:shadow-[#6417ff]/20'
          : 'bg-[#150e26] hover:bg-[#1c1236] border-[#6417ff]/50 hover:border-[#8b46ff] shadow-md shadow-[#6417ff]/20 hover:shadow-xl hover:shadow-[#6417ff]/30'
      }`}
    >
      {/* Left: Squircle Icon & Titles */}
      <div className="flex items-center space-x-3.5 sm:space-x-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#6417ff]/15 text-[#6417ff] flex items-center justify-center shrink-0 border border-[#6417ff]/30 group-hover:scale-105 transition-transform shadow-sm">
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              AI-Powered Setup
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#6417ff] to-[#8b46ff] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
              Recommended
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
            Personalized calculation in 4 quick steps
          </p>
        </div>
      </div>

      {/* Right: Affordance Arrow */}
      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#6417ff] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </button>
  );

  // Render Manual Customization Card Component
  const renderManualCard = () => (
    <button
      type="button"
      onClick={() => onSelectPath('manual')}
      className={`group relative w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-between text-left transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${
        isLight
          ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-md'
          : 'bg-[#150e26]/90 hover:bg-[#1d1338] border-white/10 hover:border-white/25 shadow-md'
      }`}
    >
      {/* Left: Squircle Icon & Titles */}
      <div className="flex items-center space-x-3.5 sm:space-x-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform ${
          isLight
            ? 'bg-slate-100 border-slate-300 text-slate-700'
            : 'bg-white/10 border-white/15 text-slate-200'
        }`}>
          <Sliders className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div>
          <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Manual Customization
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
            Configure calories and macros directly
          </p>
        </div>
      </div>

      {/* Right: Affordance Arrow */}
      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
    </button>
  );

  const renderDivider = () => (
    <div className="flex items-center py-1 max-w-xs mx-auto w-full my-0.5">
      <div className={`flex-1 h-[1px] ${
        isLight
          ? 'bg-gradient-to-r from-transparent via-slate-300 to-slate-400'
          : 'bg-gradient-to-r from-transparent via-white/15 to-white/35'
      }`} />
      <span className={`px-3 text-xs font-bold uppercase tracking-wider ${
        isLight ? 'text-slate-500' : 'text-slate-400'
      }`}>or</span>
      <div className={`flex-1 h-[1px] ${
        isLight
          ? 'bg-gradient-to-l from-transparent via-slate-300 to-slate-400'
          : 'bg-gradient-to-l from-transparent via-white/15 to-white/35'
      }`} />
    </div>
  );

  return (
    <div className="w-full max-w-lg mx-auto text-center px-1 sm:px-4 animate-in fade-in duration-300">
      
      {/* Header Info (Pixel-perfect vertical alignment matching Step 2) */}
      <div className="pt-3 sm:pt-5 mb-5 sm:mb-7 text-center">
        {/* Step Badge (Step 1 of 5) */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#6417ff]/15 text-[#6417ff] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 sm:mb-3 border border-[#6417ff]/25 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 5</span>
        </div>

        {/* Section Title */}
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 sm:mb-2.5 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          How would you like to set your goals?
        </h1>

        {/* Subtitle */}
        <p className={`text-xs sm:text-sm font-normal max-w-sm sm:max-w-md mx-auto leading-relaxed ${
          isLight ? 'text-slate-600' : 'text-slate-300'
        }`}>
          Select an onboarding method to calculate your daily energy targets.
        </p>
      </div>

      {/* MOBILE LAYOUT (< sm): Manual on Top, AI on Bottom (Closer to thumb!) */}
      <div className="space-y-3 mb-5 sm:hidden">
        {renderManualCard()}
        {renderDivider()}
        {renderAiCard()}
      </div>

      {/* DESKTOP LAYOUT (>= sm): AI on Top, Manual on Bottom */}
      <div className="hidden sm:block space-y-3 sm:space-y-4 mb-6">
        {renderAiCard()}
        {renderDivider()}
        {renderManualCard()}
      </div>

      {/* Reassuring note directly below cards */}
      <p className={`text-xs max-w-sm mx-auto font-normal ${
        isLight ? 'text-slate-500' : 'text-slate-400'
      }`}>
        Don't worry, you can always change or fine-tune your goals later in your profile settings.
      </p>

    </div>
  );
};
