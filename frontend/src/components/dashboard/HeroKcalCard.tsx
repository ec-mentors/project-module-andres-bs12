import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DailySummary, NutritionGoal } from '../../types/nutrition';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';

interface HeroKcalCardProps {
  summary: DailySummary;
  goal: NutritionGoal;
  onOpenSetGoals: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  theme?: 'dark' | 'light';
  isLoading?: boolean;
}

export const HeroKcalCard: React.FC<HeroKcalCardProps> = ({
  summary,
  goal,
  onOpenSetGoals,
  selectedDate,
  onDateChange,
  theme = 'dark',
  isLoading = false,
}) => {
  const [animateDonuts, setAnimateDonuts] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimateDonuts(false), 0);
    const timer2 = setTimeout(() => setAnimateDonuts(true), 60);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [summary, selectedDate]);

  // Clamped Math Calculations
  const safeConsumedKcal = Math.max(0, summary.consumedKcal || 0);
  const safeConsumedProtein = Math.max(0, summary.consumedProtein || 0);
  const safeConsumedFat = Math.max(0, summary.consumedFat || 0);
  const safeConsumedCarbs = Math.max(0, summary.consumedCarbs || 0);

  const remainingKcal = Math.max(0, goal.kcal - safeConsumedKcal);
  const kcalPercent = goal.kcal > 0 ? Math.max(0, Math.min(Math.round((safeConsumedKcal / goal.kcal) * 100), 999)) : 0;
  const proteinPercent = goal.protein > 0 ? Math.max(0, Math.min(Math.round((safeConsumedProtein / goal.protein) * 100), 999)) : 0;
  const fatPercent = goal.fat > 0 ? Math.max(0, Math.min(Math.round((safeConsumedFat / goal.fat) * 100), 999)) : 0;
  const carbsPercent = goal.carbs > 0 ? Math.max(0, Math.min(Math.round((safeConsumedCarbs / goal.carbs) * 100), 999)) : 0;

  // DISPLAY HEADLINE %: IF >100%, DISPLAY '100%+'
  const headlinePercentText = kcalPercent > 100 ? '100%+' : `${kcalPercent}%`;

  // STRICT MULTI-MACRO GOAL COMPLIANCE RULE:
  const isAnyMacroExceeded = kcalPercent > 115 || proteinPercent > 115 || fatPercent > 115 || carbsPercent > 115;
  const isAllMacrosHit =
    kcalPercent >= 85 && kcalPercent <= 115 &&
    proteinPercent >= 85 && proteinPercent <= 115 &&
    fatPercent >= 85 && fatPercent <= 115 &&
    carbsPercent >= 85 && carbsPercent <= 115;

  // Date Navigation Controls
  const today = new Date();
  const isTodaySelected = selectedDate.toDateString() === today.toDateString();

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const handleNextDay = () => {
    if (isTodaySelected) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= today) {
      onDateChange(next);
    }
  };

  const selectedDateFormatted = isTodaySelected
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Donut SVG circumference for radius r=18 (2 * PI * 18 ≈ 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  // Dynamic Macro Ring Renderer using centralized Macro Colors
  const renderDonutRing = (
    percent: number,
    type: 'kcal' | 'protein' | 'carbs' | 'fat',
    value: number,
    unit: string,
    goalVal: number
  ) => {
    const cappedPercentForRing = Math.min(percent, 100);
    const strokeDashoffset = circumference - (cappedPercentForRing / 100) * circumference;

    let defaultHex: string;
    let labelText: string;
    let labelColorClass: string;

    if (type === 'kcal') {
      defaultHex = MACRO_COLORS.kcal.hex;
      labelText = 'KCAL';
      labelColorClass = isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text;
    } else if (type === 'protein') {
      defaultHex = MACRO_COLORS.protein.hex;
      labelText = MACRO_COLORS.protein.label.toUpperCase();
      labelColorClass = isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text;
    } else if (type === 'carbs') {
      defaultHex = MACRO_COLORS.carbs.hex;
      labelText = MACRO_COLORS.carbs.label.toUpperCase();
      labelColorClass = isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text;
    } else {
      defaultHex = MACRO_COLORS.fat.hex;
      labelText = MACRO_COLORS.fat.label.toUpperCase();
      labelColorClass = isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text;
    }

    const ringStroke = defaultHex;

    return (
      <div
        onClick={onOpenSetGoals}
        className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group min-w-0 border ${
          isLight
            ? 'bg-slate-100/70 hover:bg-slate-200/60 border-slate-200/80 hover:border-slate-300'
            : 'bg-[#18181b] hover:bg-[#202024] border-white/[0.08] hover:border-white/[0.18]'
        }`}
        title={`Set ${labelText} Goal (${formatCompactNumber(value)} / ${formatCompactNumber(goalVal)}${unit})`}
      >
        {/* Macro Label ABOVE the Circle */}
        <span className={`text-xs font-black uppercase tracking-wider mb-2 transition-colors truncate max-w-full ${labelColorClass}`}>
          {labelText}
        </span>

        {/* Donut SVG Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className={isLight ? 'stroke-slate-200' : 'stroke-white/10'}
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              stroke={percent === 0 ? (isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)') : ringStroke}
              className="transition-all duration-[800ms] ease-out"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={animateDonuts ? strokeDashoffset : circumference}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
        </div>

        {/* Percentage Number Below Ring */}
        <span className={`text-sm sm:text-base font-black mt-1.5 truncate max-w-full transition-colors duration-300 ${
          percent === 0
            ? isLight ? 'text-slate-400' : 'text-zinc-500'
            : isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {percent}%
        </span>

        {/* Consumed Value */}
        <span className={`text-xs sm:text-sm font-extrabold mt-0.5 truncate max-w-full transition-colors duration-300 ${
          percent === 0
            ? isLight ? 'text-slate-500' : 'text-zinc-400'
            : isLight ? 'text-slate-800' : 'text-zinc-200'
        }`}>
          {formatCompactNumber(value)}{unit}
        </span>
      </div>
    );
  };

  return (
    <div className={`border rounded-[32px] p-6 sm:p-8 transition-all duration-300 relative overflow-hidden ${isLoading ? 'opacity-90' : ''} ${
      isLight
        ? 'bg-white/95 backdrop-blur-xs border-slate-200/80 hover:border-slate-300 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
        : 'bg-[#121214] border-white/[0.08] hover:border-white/[0.16] text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
    }`}>
      
      {/* Top Row: Daily Progress Headline on Left, Fixed Width Date Navigator Pill on Right */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className={`flex items-center text-xs sm:text-sm font-bold uppercase tracking-wider ${
          isLight ? 'text-slate-700' : 'text-zinc-300'
        }`}>
          <span>Daily Progress Today</span>
        </div>

        {/* Right Side FIXED WIDTH Date Pill */}
        <div className={`w-full sm:w-[180px] flex items-center justify-between rounded-2xl sm:rounded-full p-1.5 px-3 shadow-xs border transition-colors shrink-0 ${
          isLight
            ? 'bg-slate-100/90 border-slate-300/80 text-slate-800'
            : 'bg-[#18181b] border-white/[0.08] text-white'
        }`}>
          <button
            onClick={handlePrevDay}
            className={`p-1.5 rounded-xl sm:rounded-full transition-all active:scale-95 shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center ${
              isLight ? 'hover:bg-slate-200/90 text-slate-700' : 'hover:bg-white/10 text-white'
            }`}
            title="Previous day"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="flex items-center text-xs sm:text-sm font-bold text-center px-1 truncate min-w-0 justify-center flex-1">
            <span className="truncate">{selectedDateFormatted}</span>
          </div>

          <button
            onClick={handleNextDay}
            disabled={isTodaySelected}
            className={`p-1.5 rounded-xl sm:rounded-full transition-all active:scale-95 shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center ${
              isTodaySelected
                ? 'text-slate-400 cursor-not-allowed opacity-30'
                : isLight
                ? 'hover:bg-slate-200/90 text-slate-700'
                : 'hover:bg-white/10 text-white'
            }`}
            title={isTodaySelected ? 'Cannot navigate to future days' : 'Next day'}
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Headline Display: Daily Progress Percentage */}
      <div className="relative z-10 space-y-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className={`text-5xl sm:text-6xl font-black tracking-tight drop-shadow-xs transition-all duration-300 ${
            kcalPercent === 0
              ? isLight ? 'text-slate-400' : 'text-zinc-500'
              : isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {headlinePercentText}
          </span>
          <span
            className={`text-base sm:text-lg font-bold transition-colors duration-300 ${
              safeConsumedKcal === 0
                ? isLight ? 'text-slate-400' : 'text-zinc-500'
                : isAnyMacroExceeded
                ? isLight ? 'text-slate-800 font-extrabold' : 'text-zinc-200 font-extrabold'
                : isAllMacrosHit
                ? isLight ? 'text-emerald-600 font-extrabold' : 'text-emerald-400 font-extrabold'
                : isLight
                ? 'text-slate-700 font-bold'
                : 'text-zinc-300 font-bold'
            }`}
          >
            {safeConsumedKcal === 0
              ? 'Not Started'
              : isAnyMacroExceeded
              ? 'Goal Exceeded'
              : isAllMacrosHit
              ? 'Goal Hit! 🎉'
              : 'In Progress'}
          </span>
        </div>

        <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
          {formatCompactNumber(remainingKcal)} Kcal remaining ({formatCompactNumber(safeConsumedKcal)} / {formatCompactNumber(goal.kcal)} Kcal logged)
        </p>
      </div>

      {/* Donut Macro Cards */}
      <div className={`relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t ${
        isLight ? 'border-slate-200/80' : 'border-white/[0.08]'
      }`}>
        {renderDonutRing(kcalPercent, 'kcal', safeConsumedKcal, '', goal.kcal)}
        {renderDonutRing(proteinPercent, 'protein', safeConsumedProtein, 'g', goal.protein)}
        {renderDonutRing(carbsPercent, 'carbs', safeConsumedCarbs, 'g', goal.carbs)}
        {renderDonutRing(fatPercent, 'fat', safeConsumedFat, 'g', goal.fat)}
      </div>

    </div>
  );
};
