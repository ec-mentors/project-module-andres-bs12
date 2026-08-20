import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import type { OnboardingPath } from './types';

interface ProcessingStepProps {
  path: OnboardingPath;
  onFinished: () => void;
  isReady?: boolean;
  theme?: 'dark' | 'light';
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  path,
  onFinished,
  isReady = true,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [progress, setProgress] = useState<number>(12);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (!isReady) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return 88;
          return prev + 3;
        });
      }, 70);
    } else {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 6;
        });
      }, 35);
    }

    return () => clearInterval(interval);
  }, [isReady]);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onFinished();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinished]);

  const isComplete = progress >= 100;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[55vh] text-center animate-in fade-in zoom-in-95 duration-400 my-auto">
      
      {/* Glowing AI Orb */}
      <div className="relative w-28 h-28 mx-auto mb-7 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
          isLight ? 'bg-slate-400/20' : 'bg-white/10'
        }`} />
        
        <div className={`absolute -inset-2 rounded-full border animate-spin [animation-duration:12s] ${
          isLight ? 'border-slate-300' : 'border-white/15'
        }`} />

        <div className={`absolute inset-1 rounded-full border-2 border-dashed animate-spin [animation-duration:6s] [animation-direction:reverse] ${
          isLight ? 'border-slate-400/40' : 'border-white/20'
        }`} />
        
        {/* Core Icon Shield */}
        <div className={`relative w-16 h-16 rounded-3xl flex items-center justify-center border shadow-2xl transition-all duration-500 backdrop-blur-xl ${
          isComplete 
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 scale-110 shadow-emerald-500/20' 
            : isLight
            ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
            : 'bg-white/10 border-white/20 text-white shadow-black/80'
        }`}>
          {isComplete ? (
            <CheckCircle2 className="w-8 h-8 animate-in zoom-in duration-300" />
          ) : path === 'ai' ? (
            <Cpu className="w-8 h-8 animate-pulse" />
          ) : (
            <Sparkles className="w-8 h-8 animate-pulse" />
          )}
        </div>
      </div>

      {/* Headline */}
      <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight mb-2 transition-all duration-300 ${
        isLight ? 'text-slate-900' : 'text-white'
      }`}>
        {isComplete 
          ? 'Roadmap Formulated!' 
          : path === 'ai' 
          ? 'Formulating Your AI Roadmap...' 
          : 'Setting Up Your Goals...'}
      </h2>

      {/* Subtitle */}
      <p className={`text-xs sm:text-sm max-w-xs mx-auto mb-8 font-medium leading-relaxed ${
        isLight ? 'text-slate-600' : 'text-zinc-400'
      }`}>
        {path === 'ai'
          ? 'Synthesizing metabolic rate, TDEE multiplier, and energy splits.'
          : 'Saving and calibrating your daily macronutrient targets.'}
      </p>

      {/* Progress Bar Container */}
      <div className="space-y-2.5 max-w-xs mx-auto w-full">
        <div className={`relative w-full h-3 rounded-full overflow-hidden p-0.5 border shadow-inner ${
          isLight 
            ? 'bg-slate-200/90 border-slate-300 shadow-slate-300/40' 
            : 'bg-[#18181b] border-white/[0.08] shadow-black/60'
        }`}>
          <div 
            className={`relative h-full rounded-full transition-all duration-100 ease-out overflow-hidden shadow-xs ${
              isLight ? 'bg-black' : 'bg-white'
            }`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_1.4s_infinite] -translate-x-full" />
          </div>
        </div>

        {/* Counter & Status Legend */}
        <div className="flex justify-between items-center text-xs sm:text-sm font-bold px-1">
          <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
            {path === 'ai' ? 'Metabolic Calibration' : 'Persisting Goals'}
          </span>
          <span className={`font-extrabold tabular-nums ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {progress}%
          </span>
        </div>
      </div>

    </div>
  );
};
