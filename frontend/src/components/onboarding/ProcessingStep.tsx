import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import type { OnboardingPath } from './types';

interface ProcessingStepProps {
  path: OnboardingPath;
  onFinished: () => void;
  theme?: 'dark' | 'light';
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  path,
  onFinished,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [progress, setProgress] = useState<number>(12);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 85);

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 2400);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  const isComplete = progress >= 100;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[55vh] text-center animate-in fade-in zoom-in-95 duration-400 my-auto">
      
      {/* High-Fidelity Multi-Layered Glowing AI Orb */}
      <div className="relative w-28 h-28 mx-auto mb-7 flex items-center justify-center">
        {/* Ambient Outer Pulse Glow */}
        <div className="absolute inset-0 rounded-full bg-[#6417ff]/30 blur-2xl animate-pulse" />
        
        {/* Orbiting Subtle Glow Ring */}
        <div className="absolute -inset-2 rounded-full border border-[#6417ff]/30 animate-spin [animation-duration:12s]" />

        {/* Secondary Dashed Ring */}
        <div className="absolute inset-1 rounded-full border-2 border-dashed border-purple-400/40 animate-spin [animation-duration:6s] [animation-direction:reverse]" />
        
        {/* Core Glass Icon Shield */}
        <div className={`relative w-16 h-16 rounded-3xl flex items-center justify-center border-2 shadow-2xl transition-all duration-500 backdrop-blur-xl ${
          isComplete 
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 scale-110 shadow-emerald-500/20' 
            : 'bg-[#6417ff]/20 border-[#6417ff] text-[#6417ff] shadow-[#6417ff]/30'
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

      {/* Main Headline */}
      <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 transition-all duration-300 ${
        isLight ? 'text-slate-900' : 'text-white'
      }`}>
        {isComplete 
          ? 'Roadmap Formulated!' 
          : path === 'ai' 
          ? 'Formulating Your AI Roadmap...' 
          : 'Setting Up Your Goals...'}
      </h2>

      {/* Clear, High-Quality Status Subtitle */}
      <p className={`text-sm max-w-xs mx-auto mb-8 font-medium ${
        isLight ? 'text-slate-600' : 'text-purple-200/90'
      }`}>
        {path === 'ai'
          ? 'Synthesizing metabolic rate, TDEE multiplier, and energy splits.'
          : 'Saving and calibrating your daily macronutrient targets.'}
      </p>

      {/* State-of-the-Art Shimmering Progress Bar Container */}
      <div className="space-y-2.5 max-w-xs mx-auto">
        <div className={`relative w-full h-3 rounded-full overflow-hidden p-0.5 border shadow-inner ${
          isLight 
            ? 'bg-slate-200/90 border-slate-300 shadow-slate-300/40' 
            : 'bg-white/10 border-white/15 shadow-black/60'
        }`}>
          {/* Active Shimmering Fluid Progress Fill */}
          <div 
            className="relative h-full rounded-full bg-gradient-to-r from-[#6417ff] via-[#9333ea] to-emerald-400 transition-all duration-100 ease-out overflow-hidden shadow-sm"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Light Reflection Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-[shimmer_1.4s_infinite] -translate-x-full" />
          </div>
        </div>

        {/* Counter & Status Legend */}
        <div className="flex justify-between items-center text-xs font-bold px-1">
          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
            {path === 'ai' ? 'Metabolic Calibration' : 'Persisting Goals'}
          </span>
          <span className="text-[#6417ff] font-extrabold tabular-nums">
            {progress}%
          </span>
        </div>
      </div>

    </div>
  );
};
