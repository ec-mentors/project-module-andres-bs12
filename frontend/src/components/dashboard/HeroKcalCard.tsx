import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DailySummary, NutritionGoal } from '../../types/nutrition';

interface HeroKcalCardProps {
  summary: DailySummary;
  goal: NutritionGoal;
  onOpenSetGoals: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  theme?: 'dark' | 'light';
}

export const HeroKcalCard: React.FC<HeroKcalCardProps> = ({
  summary,
  goal,
  onOpenSetGoals,
  selectedDate,
  onDateChange,
  theme = 'dark',
}) => {
  const [animateDonuts, setAnimateDonuts] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    setAnimateDonuts(false);
    const timer = setTimeout(() => setAnimateDonuts(true), 60);
    return () => clearTimeout(timer);
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

  // UNIFIED ROSE RED COLOR PALETTE (stroke-rose-500 everywhere for exceeded!):
  // 1. Electric Purple (#6417ff) = Goal Met (85% to 115%)
  // 2. Unified Rose Red (stroke-rose-500) = Exceeded (>115%)
  // 3. Dim Charcoal/Slate = In Progress (<85%)
  const renderDonutRing = (
    percent: number,
    label: string,
    value: number,
    unit: string,
    goalVal: number
  ) => {
    const cappedPercentForRing = Math.min(percent, 100);
    const strokeDashoffset = circumference - (cappedPercentForRing / 100) * circumference;

    const ringColorClass =
      percent >= 85 && percent <= 115
        ? 'stroke-[#6417ff]'
        : percent > 115
        ? 'stroke-rose-500'
        : isLight
        ? 'stroke-slate-300'
        : 'stroke-white/15';

    return (
      <div
        onClick={onOpenSetGoals}
        className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group min-w-0 border ${
          isLight
            ? 'bg-slate-100/70 hover:bg-slate-200/60 border-slate-200/80 hover:border-[#6417ff]/25'
            : 'bg-[#231a38] hover:bg-[#2d2248] border-white/10 hover:border-[#6417ff]/50'
        }`}
        title={`Set ${label} Goal (${value} / ${goalVal}${unit})`}
      >
        {/* Macro Label ABOVE the Circle */}
        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 transition-colors truncate max-w-full ${
          isLight ? 'text-purple-700 group-hover:text-purple-900' : 'text-purple-300 group-hover:text-white'
        }`}>
          {label}
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
              className={`${ringColorClass} transition-all duration-[1000ms] ease-out`}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={animateDonuts ? strokeDashoffset : circumference}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
        </div>

        {/* Percentage Number Below Ring */}
        <span className={`text-xs sm:text-sm font-black mt-1.5 truncate max-w-full ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {percent}%
        </span>

        {/* Consumed Value */}
        <span className={`text-[11px] sm:text-xs font-extrabold mt-0.5 truncate max-w-full ${
          isLight ? 'text-slate-700' : 'text-slate-200'
        }`}>
          {value}{unit}
        </span>
      </div>
    );
  };

  return (
    <div className={`border-2 rounded-[32px] p-6 sm:p-8 transition-all duration-300 relative overflow-hidden ${
      isLight
        ? 'bg-white/95 backdrop-blur-sm border-slate-200/80 hover:border-[#6417ff]/25 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(100,23,255,0.05)]'
        : 'bg-[#161024] border-white/10 hover:border-[#6417ff]/40 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
    }`}>
      
      {/* Top Row: Daily Progress Headline on Left, Fixed Width Date Navigator Pill on Right */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className={`flex items-center text-xs font-bold uppercase tracking-wider ${
          isLight ? 'text-purple-700' : 'text-purple-300'
        }`}>
          <span>Daily Progress Today</span>
        </div>

        {/* Right Side FIXED WIDTH Date Pill */}
        <div className={`w-full sm:w-[170px] flex items-center justify-between rounded-2xl sm:rounded-full p-1 px-3 shadow-sm border transition-colors shrink-0 ${
          isLight
            ? 'bg-slate-100/90 border-slate-300/80 text-slate-800'
            : 'bg-[#231a38] border-white/15 text-white'
        }`}>
          <button
            onClick={handlePrevDay}
            className={`p-1 rounded-xl sm:rounded-full transition-all active:scale-95 shrink-0 ${
              isLight ? 'hover:bg-slate-200/90 text-slate-700' : 'hover:bg-white/10 text-white'
            }`}
            title="Previous day"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="flex items-center text-xs font-bold text-center px-1 truncate min-w-0 justify-center flex-1">
            <span className="truncate">{selectedDateFormatted}</span>
          </div>

          <button
            onClick={handleNextDay}
            disabled={isTodaySelected}
            className={`p-1 rounded-xl sm:rounded-full transition-all active:scale-95 shrink-0 ${
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
      <div className="relative z-10 space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className={`text-5xl sm:text-6xl font-black tracking-tight drop-shadow-sm ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {headlinePercentText}
          </span>
          <span
            className={`text-base sm:text-lg font-bold ${
              isAnyMacroExceeded
                ? 'text-rose-500'
                : isAllMacrosHit
                ? 'text-[#6417ff]'
                : isLight
                ? 'text-purple-700'
                : 'text-purple-300'
            }`}
          >
            {isAnyMacroExceeded
              ? 'Goal Exceeded'
              : isAllMacrosHit
              ? 'Goal Hit! 🎉'
              : 'In Progress'}
          </span>
        </div>

        <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          {remainingKcal.toLocaleString()} Kcal remaining ({safeConsumedKcal.toLocaleString()} / {goal.kcal.toLocaleString()} Kcal logged)
        </p>
      </div>

      {/* Donut Macro Cards */}
      <div className={`relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t ${
        isLight ? 'border-slate-200/80' : 'border-white/10'
      }`}>
        {renderDonutRing(kcalPercent, 'KCAL', safeConsumedKcal, '', goal.kcal)}
        {renderDonutRing(proteinPercent, 'PROTEIN', safeConsumedProtein, 'g', goal.protein)}
        {renderDonutRing(fatPercent, 'FAT', safeConsumedFat, 'g', goal.fat)}
        {renderDonutRing(carbsPercent, 'CARBS', safeConsumedCarbs, 'g', goal.carbs)}
      </div>

    </div>
  );
};
