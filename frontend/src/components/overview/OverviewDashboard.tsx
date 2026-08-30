import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Flame, Target, Award, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NutritionGoal, MealEntry } from '../../types/nutrition';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';
import { toLocalYmd, entryCreatedOnToLocalYmd } from '../../utils/dateLocal';

interface OverviewDashboardProps {
  goal: NutritionGoal;
  entries: MealEntry[];
  theme?: 'dark' | 'light';
  isLoading?: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ goal, entries, theme = 'dark', isLoading = false }) => {
  const isLight = theme === 'light';
  const [selectedMacro, setSelectedMacro] = useState<'general' | 'protein' | 'kcal' | 'carbs' | 'fat'>('general');
  const [timeMode, setTimeMode] = useState<'weekly' | 'monthly'>('weekly');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [animateBars, setAnimateBars] = useState(false);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  const chartCanvasRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  // Enforce Weekly Mode on Mobile Screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setTimeMode('weekly');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger growing bar animation when macro/timeMode/offsets change
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimateBars(false);
      setActiveBarIndex(null);
    }, 0);
    const timer2 = setTimeout(() => setAnimateBars(true), 60);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [selectedMacro, timeMode, weekOffset, monthOffset, entries]);

  // Calculate Monday of the selected week offset
  const getMondayOfOffsetWeek = (offset: number) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setDate(monday.getDate() + offset * 7);
    return monday;
  };

  const mondayDate = getMondayOfOffsetWeek(weekOffset);
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);

  const formattedWeekRange = `${mondayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sundayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Calculate selected Month Date
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const formattedMonthLabel = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function getTargetValueForMacro(macro: string, goalObj: NutritionGoal) {
    switch (macro) {
      case 'general':
        return 100;
      case 'protein':
        return goalObj.protein || 150;
      case 'kcal':
        return goalObj.kcal || 2000;
      case 'carbs':
        return goalObj.carbs || 200;
      case 'fat':
        return goalObj.fat || 65;
      default:
        return 100;
    }
  }

  // WEEKLY DATASET
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = daysOfWeek.map((dayLabel, index) => {
    const dateObj = new Date(mondayDate);
    dateObj.setDate(mondayDate.getDate() + index);

    const dayYmd = toLocalYmd(dateObj);
    const isFutureDay = dateObj > today;

    const dayEntries = entries.filter((entry) => {
      const entryDate = entryCreatedOnToLocalYmd(entry.createdOn);
      if (!entryDate) return false;
      return entryDate === dayYmd;
    });

    let value = 0;
    let goalPercent = 0;
    let isExceededAny = false;

    if (!isFutureDay && dayEntries.length > 0) {
      const sumKcal = dayEntries.reduce((acc, e) => acc + (e.kcal || 0), 0);
      const sumProtein = dayEntries.reduce((acc, e) => acc + (e.protein || 0), 0);
      const sumCarbs = dayEntries.reduce((acc, e) => acc + (e.carbs || 0), 0);
      const sumFat = dayEntries.reduce((acc, e) => acc + (e.fat || 0), 0);

      const targetK = goal.kcal || 2000;
      const targetP = goal.protein || 150;
      const targetC = goal.carbs || 200;
      const targetF = goal.fat || 65;

      const pctK = targetK > 0 ? (sumKcal / targetK) * 100 : 0;
      const pctP = targetP > 0 ? (sumProtein / targetP) * 100 : 0;
      const pctC = targetC > 0 ? (sumCarbs / targetC) * 100 : 0;
      const pctF = targetF > 0 ? (sumFat / targetF) * 100 : 0;

      isExceededAny = pctK > 115 || pctP > 115 || pctC > 115 || pctF > 115;

      if (selectedMacro === 'general') {
        value = Math.round((pctK + pctP + pctC + pctF) / 4);
        goalPercent = value;
      } else if (selectedMacro === 'protein') {
        value = sumProtein;
        goalPercent = Math.round(pctP);
      } else if (selectedMacro === 'kcal') {
        value = sumKcal;
        goalPercent = Math.round(pctK);
      } else if (selectedMacro === 'carbs') {
        value = sumCarbs;
        goalPercent = Math.round(pctC);
      } else if (selectedMacro === 'fat') {
        value = sumFat;
        goalPercent = Math.round(pctF);
      }
    }

    return {
      label: dayLabel,
      value,
      goalPercent,
      isFutureDay,
      hasEntries: !isFutureDay && dayEntries.length > 0,
      isExceededAny,
    };
  });

  // MONTHLY DATASET (Days in selected Month)
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
  const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNumber = i + 1;
    const dateObj = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), dayNumber);
    const dayYmd = toLocalYmd(dateObj);
    const isFutureDay = dateObj > today;

    const dayEntries = entries.filter((entry) => {
      const entryDate = entryCreatedOnToLocalYmd(entry.createdOn);
      if (!entryDate) return false;
      return entryDate === dayYmd;
    });

    let value = 0;
    let goalPercent = 0;
    let isExceededAny = false;

    if (!isFutureDay && dayEntries.length > 0) {
      const sumKcal = dayEntries.reduce((acc, e) => acc + (e.kcal || 0), 0);
      const sumProtein = dayEntries.reduce((acc, e) => acc + (e.protein || 0), 0);
      const sumCarbs = dayEntries.reduce((acc, e) => acc + (e.carbs || 0), 0);
      const sumFat = dayEntries.reduce((acc, e) => acc + (e.fat || 0), 0);

      const targetK = goal.kcal || 2000;
      const targetP = goal.protein || 150;
      const targetC = goal.carbs || 200;
      const targetF = goal.fat || 65;

      const pctK = targetK > 0 ? (sumKcal / targetK) * 100 : 0;
      const pctP = targetP > 0 ? (sumProtein / targetP) * 100 : 0;
      const pctC = targetC > 0 ? (sumCarbs / targetC) * 100 : 0;
      const pctF = targetF > 0 ? (sumFat / targetF) * 100 : 0;

      isExceededAny = pctK > 115 || pctP > 115 || pctC > 115 || pctF > 115;

      if (selectedMacro === 'general') {
        value = Math.round((pctK + pctP + pctC + pctF) / 4);
        goalPercent = value;
      } else if (selectedMacro === 'protein') {
        value = sumProtein;
        goalPercent = Math.round(pctP);
      } else if (selectedMacro === 'kcal') {
        value = sumKcal;
        goalPercent = Math.round(pctK);
      } else if (selectedMacro === 'carbs') {
        value = sumCarbs;
        goalPercent = Math.round(pctC);
      } else if (selectedMacro === 'fat') {
        value = sumFat;
        goalPercent = Math.round(pctF);
      }
    }

    return {
      label: `${dayNumber}`,
      value,
      goalPercent,
      isFutureDay,
      hasEntries: !isFutureDay && dayEntries.length > 0,
      isExceededAny,
    };
  });

  const activeChartData = timeMode === 'weekly' ? weeklyData : monthlyData;

  const targetValue = getTargetValueForMacro(selectedMacro, goal);
  const maxDataValue = Math.max(...activeChartData.map((d) => d.value), 0);
  const maxValue = Math.max(targetValue * 1.3, maxDataValue * 1.15, 10);

  const unit = selectedMacro === 'kcal' ? 'Kcal' : selectedMacro === 'general' ? '%' : 'g';

  const elapsedData = activeChartData.filter((d) => !d.isFutureDay && d.hasEntries);
  const elapsedDays = Math.max(1, activeChartData.filter((d) => !d.isFutureDay).length);
  const totalMonthlySum = activeChartData.reduce((sum, d) => sum + d.value, 0);
  const monthlyRequired = targetValue * (timeMode === 'weekly' ? 7 : daysInMonth);
  const dailyAverage = `${Math.round(totalMonthlySum / elapsedDays)} ${unit}`;

  const daysMetCount = activeChartData.filter((d) => d.hasEntries && !d.isExceededAny && d.goalPercent >= 85 && d.goalPercent <= 115).length;

  const handleTouchMoveChart = (e: React.TouchEvent) => {
    if (!chartCanvasRef.current) return;
    const touch = e.touches[0];
    const rect = chartCanvasRef.current.getBoundingClientRect();
    const relativeX = touch.clientX - rect.left;
    const barWidth = rect.width / activeChartData.length;
    const index = Math.floor(relativeX / barWidth);
    if (index >= 0 && index < activeChartData.length) {
      setActiveBarIndex(index);
    }
  };

  const cardBgClass = isLight
    ? 'bg-white/95 backdrop-blur-xs border border-slate-200/80 hover:border-slate-300 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
    : 'bg-[#121214] border border-white/[0.08] hover:border-white/[0.16] text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)]';

  const pillBgClass = isLight
    ? 'bg-slate-100/90 border-slate-300/80 text-slate-800'
    : 'bg-[#18181b] border-white/[0.08] text-white';

  const iconColorClass = isLight ? 'text-slate-700' : 'text-zinc-300';

  return (
    <div className={`space-y-8 animate-in fade-in duration-300 ${isLoading ? 'opacity-90' : ''}`}>
      
      {/* 1. TOP STATS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* KPI 1: Total Kcal */}
        <div className={`${cardBgClass} rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500`}>
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate mr-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Total Energy
            </span>
            <div className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/10 border-white/15 text-white'
            }`}>
              <Flame className={`w-4 h-4 ${iconColorClass}`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{formatCompactNumber(entries.reduce((acc, e) => acc + (e.kcal || 0), 0))}</span>
              <span className={`text-[10px] sm:text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Kcal</span>
            </div>
            <p className={`hidden sm:block text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              Total logged in history
            </p>
          </div>
        </div>

        {/* KPI 2: Current Streak */}
        <div className={`${cardBgClass} rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100`}>
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate mr-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Logging Consistency
            </span>
            <div className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/10 border-white/15 text-white'
            }`}>
              <TrendingUp className={`w-4 h-4 ${iconColorClass}`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{entries.length > 0 ? 'Active' : 'Ready'}</span>
            </div>
            <p className={`hidden sm:block text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              {entries.length > 0 ? 'Active logging habit' : 'Log a meal to start tracking'}
            </p>
          </div>
        </div>

        {/* KPI 3: Goal Hit Rate */}
        <div className={`${cardBgClass} rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200`}>
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate mr-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Goal Accuracy
            </span>
            <div className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/10 border-white/15 text-white'
            }`}>
              <Target className={`w-4 h-4 ${iconColorClass}`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{daysMetCount > 0 ? `${Math.round((daysMetCount / Math.max(1, elapsedDays)) * 100)}%` : '0%'}</span>
              <span className={`text-[10px] sm:text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Target Hit</span>
            </div>
            <p className={`hidden sm:block text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              Met goals (85-115%) {daysMetCount} of {elapsedDays} days
            </p>
          </div>
        </div>

        {/* KPI 4: Monthly Avg Protein */}
        <div className={`${cardBgClass} rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300`}>
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate mr-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Avg Protein Intake
            </span>
            <div className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/10 border-white/15 text-white'
            }`}>
              <Award className={`w-4 h-4 ${iconColorClass}`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{Math.round(elapsedData.reduce((s, d) => s + d.value, 0) / Math.max(1, elapsedDays))}g</span>
              <span className={`text-[10px] sm:text-sm font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Daily Avg</span>
            </div>
            <p className={`hidden sm:block text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              Based on logged entries
            </p>
          </div>
        </div>

      </div>

      {/* 2. MAIN CHART CONTAINER */}
      <div className={`${cardBgClass} rounded-[32px] p-6 sm:p-8 transition-all duration-300 delay-[400ms] lg:delay-0 animate-in fade-in slide-in-from-bottom-6 duration-600`}>
        
        {/* CARD TITLE & SELECTORS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Intake Analytics
            </h3>
            <p className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {timeMode === 'weekly' ? 'Weekly 7-Day Breakdown' : 'Full Monthly Breakdown'}
            </p>
          </div>

          {/* Selectors Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            {/* VIEW MODE SELECTOR */}
            <div className="relative w-full sm:w-auto hidden lg:block">
              <select
                value={timeMode}
                onChange={(e) => setTimeMode(e.target.value as 'weekly' | 'monthly')}
                className={`w-full sm:w-auto max-w-full truncate appearance-none text-xs sm:text-sm font-medium sm:font-semibold px-4 py-3 pr-11 sm:pr-12 rounded-2xl focus:outline-none cursor-pointer transition-all shadow-xs h-12 ${
                  isLight ? 'bg-slate-100/90 border border-slate-300/80 text-slate-800' : 'bg-[#18181b] border border-white/[0.12] text-zinc-200 focus:border-white/30'
                }`}
              >
                <option value="weekly">Weekly (7 Days)</option>
                <option value="monthly">Monthly (31 Days)</option>
              </select>
              <ChevronDown className={`w-4 h-4 ${iconColorClass} absolute right-3.5 top-4 pointer-events-none stroke-[2.2]`} />
            </div>

            {/* MACRO SELECTOR DROPDOWN */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedMacro}
                onChange={(e) => setSelectedMacro(e.target.value as 'general' | 'protein' | 'kcal' | 'carbs' | 'fat')}
                className={`w-full sm:w-auto max-w-full truncate appearance-none text-xs sm:text-sm font-medium sm:font-semibold px-4 py-3 pr-11 sm:pr-12 rounded-2xl focus:outline-none cursor-pointer transition-all shadow-xs h-12 ${
                  isLight ? 'bg-slate-100/90 border border-slate-300/80 text-slate-800' : 'bg-[#18181b] border border-white/[0.12] text-zinc-200 focus:border-white/30'
                }`}
              >
                <option value="general">General Goal Compliance (%)</option>
                <option value="protein">Protein (g)</option>
                <option value="kcal">Calories (Kcal)</option>
                <option value="carbs">Carbs (g)</option>
                <option value="fat">Fat (g)</option>
              </select>
              <ChevronDown className={`w-4 h-4 ${iconColorClass} absolute right-3.5 top-4 pointer-events-none stroke-[2.2]`} />
            </div>

          </div>
        </div>

        {/* TIME NAVIGATOR CONTAINER */}
        <div className={`w-full flex items-center justify-between rounded-2xl p-2 px-4 shadow-xs mb-6 h-12 border ${pillBgClass}`}>
          <button
            onClick={() => {
              if (timeMode === 'weekly') setWeekOffset((prev) => prev - 1);
              else setMonthOffset((prev) => prev - 1);
            }}
            className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95 ${iconColorClass}`}
            title={timeMode === 'weekly' ? 'Go to previous week' : 'Go to previous month'}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-center">
            <Calendar className={`w-4 h-4 ${iconColorClass} stroke-[2.2]`} />
            <span>{timeMode === 'weekly' ? formattedWeekRange : formattedMonthLabel}</span>
          </div>

          <button
            onClick={() => {
              if (timeMode === 'weekly') setWeekOffset((prev) => Math.min(0, prev + 1));
              else setMonthOffset((prev) => Math.min(0, prev + 1));
            }}
            disabled={timeMode === 'weekly' ? weekOffset >= 0 : monthOffset >= 0}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              (timeMode === 'weekly' ? weekOffset >= 0 : monthOffset >= 0)
                ? 'text-zinc-500 cursor-not-allowed opacity-40'
                : `hover:bg-black/5 dark:hover:bg-white/10 ${iconColorClass}`
            }`}
            title="Cannot navigate to future dates"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* SUMMARY STATS ROW */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 rounded-2xl border ${
          isLight ? 'bg-slate-100/70 border-slate-200/80' : 'bg-[#18181b] border-white/[0.08]'
        }`}>
          <div>
            <span className={`text-[11px] font-bold uppercase block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              {timeMode === 'weekly' ? 'Weekly Total' : 'Month Total'}
            </span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatCompactNumber(totalMonthlySum)} / {formatCompactNumber(monthlyRequired)} {unit}
            </span>
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Daily Average</span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{dailyAverage}</span>
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Target</span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatCompactNumber(targetValue)} {selectedMacro === 'general' ? '%' : unit}</span>
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Consistency</span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {Math.round((daysMetCount / Math.max(1, elapsedDays)) * 100)}% Met
            </span>
          </div>
        </div>

        {/* VERTICAL BAR CHART CANVAS */}
        <div
          ref={chartCanvasRef}
          onTouchStart={handleTouchMoveChart}
          onTouchMove={handleTouchMoveChart}
          onMouseLeave={() => setActiveBarIndex(null)}
          className={`relative h-64 w-full pt-6 pb-6 px-2 flex items-end justify-between space-x-1.5 sm:space-x-3 border-b select-none ${
            isLight ? 'border-slate-200/80' : 'border-white/[0.08]'
          }`}
        >
          {/* Target Goal Line */}
          <div
            className={`absolute left-0 right-0 border-t-2 border-dashed z-10 flex items-center justify-end pr-2 transition-all duration-500 ${
              isLight ? 'border-slate-400/80' : 'border-white/40'
            }`}
            style={{
              bottom: `${(targetValue / maxValue) * 100}%`,
            }}
          >
            <span className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md transform translate-y-[-50%] border ${
              isLight
                ? 'bg-black text-white font-extrabold border-slate-800'
                : 'bg-white text-black font-extrabold border-white'
            }`}>
              Target: {targetValue}{selectedMacro === 'general' ? '%' : ` ${unit}`}
            </span>
          </div>

          {/* Vertical Bars */}
          {activeChartData.map((d, index) => {
            const barHeightPercent = d.value > 0 ? (d.value / maxValue) * 100 : 0;
            
            const isTargetMetStrict = d.hasEntries && !d.isExceededAny && d.goalPercent >= 85 && d.goalPercent <= 115;
            const isExceeded = d.hasEntries && d.isExceededAny;
            const isActiveTooltip = activeBarIndex === index;

            // Unified Macro Color Bar Filling
            let baseMacroBg = 'bg-white';
            if (selectedMacro === 'protein') baseMacroBg = MACRO_COLORS.protein.bg;
            else if (selectedMacro === 'carbs') baseMacroBg = MACRO_COLORS.carbs.bg;
            else if (selectedMacro === 'fat') baseMacroBg = MACRO_COLORS.fat.bg;
            else if (selectedMacro === 'kcal') baseMacroBg = MACRO_COLORS.kcal.bg;
            else if (selectedMacro === 'general') baseMacroBg = isLight ? 'bg-black' : 'bg-white';

            const barColorClass = (isExceeded || isTargetMetStrict)
              ? `${baseMacroBg} shadow-xs`
              : isLight
              ? 'bg-slate-300 group-hover:bg-slate-400'
              : 'bg-zinc-700 group-hover:bg-zinc-600';

            const tooltipText = d.isFutureDay
              ? `${d.label}: Future`
              : d.goalPercent > 100
              ? `${d.label}: ${formatCompactNumber(d.value)}${selectedMacro === 'general' ? '%' : ` ${unit}`} (Exceeded)`
              : `${d.label}: ${formatCompactNumber(d.value)}${selectedMacro === 'general' ? '%' : ` ${unit}`}`;

            return (
              <div
                key={d.label + index}
                onClick={() => setActiveBarIndex(activeBarIndex === index ? null : index)}
                onMouseEnter={() => setActiveBarIndex(index)}
                className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer py-1"
              >
                {/* Active Tooltip */}
                <div
                  className={`transition-all duration-200 absolute -top-11 bg-[#18181b] text-white text-[11px] font-extrabold py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-lg border border-white/20 ${
                    isActiveTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                  }`}
                >
                  {tooltipText}
                </div>

                {/* Bar Element */}
                {!d.hasEntries || d.isFutureDay ? (
                  <div className={`w-full ${timeMode === 'weekly' ? 'max-w-[40px]' : 'max-w-[16px]'} h-1.5 rounded-t-xs ${
                    isLight ? 'bg-slate-200 border-b border-slate-300/80' : 'bg-white/10 border-b border-white/10'
                  }`} />
                ) : (
                  <div
                    className={`w-full ${timeMode === 'weekly' ? 'max-w-[40px]' : 'max-w-[16px]'} rounded-t-xl origin-bottom transition-all duration-700 ease-out shadow-xs ${
                      animateBars ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                    } ${barColorClass}`}
                    style={{
                      height: `${Math.max(barHeightPercent, 4)}%`,
                      transitionDelay: `${index * 20}ms`,
                    }}
                  />
                )}

                {/* Day Label */}
                <span className={`text-[9px] sm:text-xs font-bold mt-2.5 ${
                  d.isFutureDay || !d.hasEntries
                    ? 'text-zinc-500'
                    : isLight
                    ? 'text-slate-700'
                    : 'text-zinc-400 group-hover:text-white'
                }`}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
