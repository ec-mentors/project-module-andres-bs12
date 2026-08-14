import React, { useState, useEffect, useRef } from 'react';
import { Flame, TrendingUp, Target, Award, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NutritionGoal, MealEntry } from '../../types/nutrition';

interface OverviewDashboardProps {
  goal: NutritionGoal;
  entries: MealEntry[];
  theme?: 'dark' | 'light';
  isLoading?: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ goal, entries, theme = 'dark', isLoading: _isLoading = false }) => {
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
    setAnimateBars(false);
    setActiveBarIndex(null);
    const timer = setTimeout(() => setAnimateBars(true), 60);
    return () => clearTimeout(timer);
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

    const dayNumber = dateObj.getDate();
    const isFutureDay = dateObj > today;

    const dayEntries = entries.filter((entry) => {
      if (!entry.createdOn) return false;
      const d = new Date(entry.createdOn);
      return d.getDate() === dayNumber && d.getMonth() === dateObj.getMonth() && d.getFullYear() === dateObj.getFullYear();
    });

    let value = 0;
    let goalPercent = 0;
    let isExceededAny = false;

    if (!isFutureDay && dayEntries.length > 0) {
      if (selectedMacro === 'general') {
        const dayKcal = dayEntries.reduce((s, item) => s + (Number(item.kcal) || 0), 0);
        const dayProtein = dayEntries.reduce((s, item) => s + (Number(item.protein) || 0), 0);
        const dayFat = dayEntries.reduce((s, item) => s + (Number(item.fat) || 0), 0);
        const dayCarbs = dayEntries.reduce((s, item) => s + (Number(item.carbs) || 0), 0);

        const kcalRatio = goal.kcal > 0 ? Math.round((dayKcal / goal.kcal) * 100) : 0;
        const proteinRatio = goal.protein > 0 ? Math.round((dayProtein / goal.protein) * 100) : 0;
        const fatRatio = goal.fat > 0 ? Math.round((dayFat / goal.fat) * 100) : 0;
        const carbsRatio = goal.carbs > 0 ? Math.round((dayCarbs / goal.carbs) * 100) : 0;

        isExceededAny = kcalRatio > 115 || proteinRatio > 115 || fatRatio > 115 || carbsRatio > 115;

        value = kcalRatio;
        goalPercent = kcalRatio;
      } else {
        const rawValue = dayEntries.reduce((sum, item) => {
          if (selectedMacro === 'protein') return sum + (Number(item.protein) || 0);
          if (selectedMacro === 'kcal') return sum + (Number(item.kcal) || 0);
          if (selectedMacro === 'carbs') return sum + (Number(item.carbs) || 0);
          if (selectedMacro === 'fat') return sum + (Number(item.fat) || 0);
          return sum;
        }, 0);
        value = rawValue;

        const targetG = getTargetValueForMacro(selectedMacro, goal);
        goalPercent = targetG > 0 ? Math.round((rawValue / targetG) * 100) : 0;
        isExceededAny = goalPercent > 115;
      }
    }

    return {
      label: `${dayLabel} ${dayNumber}`,
      day: dayNumber,
      value,
      goalPercent,
      isFutureDay,
      hasEntries: dayEntries.length > 0,
      isExceededAny,
    };
  });

  // MONTHLY DATASET
  const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
  const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNumber = i + 1;
    const dateObj = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), dayNumber);
    const isFutureDay = dateObj > today;

    const dayEntries = entries.filter((entry) => {
      if (!entry.createdOn) return false;
      const d = new Date(entry.createdOn);
      return d.getDate() === dayNumber && d.getMonth() === currentMonthDate.getMonth() && d.getFullYear() === currentMonthDate.getFullYear();
    });

    let value = 0;
    let goalPercent = 0;
    let isExceededAny = false;

    if (!isFutureDay && dayEntries.length > 0) {
      if (selectedMacro === 'general') {
        const dayKcal = dayEntries.reduce((s, item) => s + (Number(item.kcal) || 0), 0);
        const dayProtein = dayEntries.reduce((s, item) => s + (Number(item.protein) || 0), 0);
        const dayFat = dayEntries.reduce((s, item) => s + (Number(item.fat) || 0), 0);
        const dayCarbs = dayEntries.reduce((s, item) => s + (Number(item.carbs) || 0), 0);

        const kcalRatio = goal.kcal > 0 ? Math.round((dayKcal / goal.kcal) * 100) : 0;
        const proteinRatio = goal.protein > 0 ? Math.round((dayProtein / goal.protein) * 100) : 0;
        const fatRatio = goal.fat > 0 ? Math.round((dayFat / goal.fat) * 100) : 0;
        const carbsRatio = goal.carbs > 0 ? Math.round((dayCarbs / goal.carbs) * 100) : 0;

        isExceededAny = kcalRatio > 115 || proteinRatio > 115 || fatRatio > 115 || carbsRatio > 115;

        value = kcalRatio;
        goalPercent = kcalRatio;
      } else {
        const rawValue = dayEntries.reduce((sum, item) => {
          if (selectedMacro === 'protein') return sum + (Number(item.protein) || 0);
          if (selectedMacro === 'kcal') return sum + (Number(item.kcal) || 0);
          if (selectedMacro === 'carbs') return sum + (Number(item.carbs) || 0);
          if (selectedMacro === 'fat') return sum + (Number(item.fat) || 0);
          return sum;
        }, 0);
        value = rawValue;

        const targetG = getTargetValueForMacro(selectedMacro, goal);
        goalPercent = targetG > 0 ? Math.round((rawValue / targetG) * 100) : 0;
        isExceededAny = goalPercent > 115;
      }
    }

    return {
      label: `${dayNumber}`,
      day: dayNumber,
      value,
      goalPercent,
      isFutureDay,
      hasEntries: dayEntries.length > 0,
      isExceededAny,
    };
  });

  const activeChartData = timeMode === 'weekly' ? weeklyData : monthlyData;

  const targetValue = getTargetValueForMacro(selectedMacro, goal);
  const elapsedDays = timeMode === 'weekly' ? (weekOffset === 0 ? 2 : 7) : (monthOffset === 0 ? today.getDate() : daysInMonth);
  const monthlyRequired = selectedMacro === 'general' ? elapsedDays : targetValue * elapsedDays;
  
  // DYNAMIC CHART SCALE MATH
  const maxBarValue = Math.max(...activeChartData.map((d) => d.value), 0);
  const maxValue = selectedMacro === 'general'
    ? 140
    : Math.max(maxBarValue * 1.25, targetValue * 1.35);

  const elapsedData = activeChartData.filter((d) => !d.isFutureDay);
  
  // STRICT RULE: Goal is ONLY met if NOT exceeded on any macro and goalPercent is between 85% and 115%
  const daysMetCount = elapsedData.filter((d) => !d.isExceededAny && d.goalPercent >= 85 && d.goalPercent <= 115 && d.hasEntries).length;
  const totalMonthlySum = selectedMacro === 'general'
    ? daysMetCount
    : elapsedData.reduce((sum, d) => sum + d.value, 0);

  const dailyAverage = selectedMacro === 'general'
    ? `${Math.round((daysMetCount / Math.max(1, elapsedDays)) * 100)}%`
    : `${Math.round(totalMonthlySum / Math.max(1, elapsedDays))} ${selectedMacro === 'kcal' ? 'kcal' : 'g'}`;

  const unit = selectedMacro === 'general' ? 'days' : selectedMacro === 'kcal' ? 'kcal' : 'g';

  // Handle Mobile Touch Drag Across Chart Bars
  const handleTouchMoveChart = (e: React.TouchEvent) => {
    if (!chartCanvasRef.current) return;
    const rect = chartCanvasRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const barWidth = rect.width / activeChartData.length;
    const index = Math.floor(touchX / barWidth);
    if (index >= 0 && index < activeChartData.length) {
      setActiveBarIndex(index);
    }
  };

  const cardBgClass = isLight
    ? 'bg-white/95 backdrop-blur-sm border-2 border-slate-200/80 hover:border-[#6417ff]/50 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(100,23,255,0.08)]'
    : 'bg-[#161024] border-2 border-white/10 hover:border-[#6417ff]/40 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)]';

  const pillBgClass = isLight
    ? 'bg-slate-100/90 border border-slate-200/90 text-slate-900'
    : 'bg-[#231a38] border border-white/15 text-white';

  // STANDARD NEUTRAL SLATE-WHITE ICON COLOR (STANDARDIZED):
  const iconColorClass = isLight ? 'text-slate-700' : 'text-slate-200';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP ROW: 4 KPI STAT CARDS (ONLY MAIN TITLE IS PURPLE, SUBTEXT IS NEUTRAL SLATE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        
        {/* KPI 1: Weekly Balance */}
        <div className={`${cardBgClass} rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500`}>
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate mr-2 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              Weekly Balance
            </span>
            <span className={`p-2 sm:px-3 sm:py-1 rounded-xl sm:rounded-full text-xs font-bold flex items-center space-x-1 whitespace-nowrap border shrink-0 ${
              isLight ? 'bg-slate-100/80 text-slate-700 border-slate-200' : 'bg-white/10 text-slate-200 border-white/15'
            }`}>
              <TrendingUp className={`w-3.5 h-3.5 ${iconColorClass}`} />
              <span className="hidden sm:inline">0% vs last week</span>
            </span>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{Math.round(totalMonthlySum / Math.max(1, elapsedDays))}</span>
              <span className={`text-[10px] sm:text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Kcal/day</span>
            </div>
            <p className={`hidden sm:block text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Real logged entry average
            </p>
          </div>
        </div>

        {/* KPI 2: Streak Days */}
        <div className={`${cardBgClass} rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100`}>
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate mr-2 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              Active Streak
            </span>
            <div className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-purple-700' : 'bg-white/10 border-white/15 text-purple-200'
            }`}>
              <Flame className={`w-4 h-4 ${iconColorClass}`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{entries.length > 0 ? 1 : 0}</span>
              <span className={`text-[10px] sm:text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Streak Days</span>
            </div>
            <p className={`hidden sm:block text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {entries.length > 0 ? 'Active logging streak!' : 'Log a meal to start your streak!'}
            </p>
          </div>
        </div>

        {/* KPI 3: Goal Hit Rate */}
        <div className={`${cardBgClass} rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200`}>
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate mr-2 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              Goal Accuracy
            </span>
            <div className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-purple-700' : 'bg-white/10 border-white/15 text-purple-200'
            }`}>
              <Target className={`w-4 h-4 ${iconColorClass}`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{daysMetCount > 0 ? `${Math.round((daysMetCount / Math.max(1, elapsedDays)) * 100)}%` : '0%'}</span>
              <span className={`text-[10px] sm:text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Target Hit</span>
            </div>
            <p className={`hidden sm:block text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Met goals (85-115%) {daysMetCount} of {elapsedDays} days
            </p>
          </div>
        </div>

        {/* KPI 4: Monthly Avg Protein */}
        <div className={`${cardBgClass} rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300`}>
          <div className="flex justify-between items-start mb-2 sm:mb-4">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate mr-2 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              Avg Protein Intake
            </span>
            <div className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200 text-purple-700' : 'bg-white/10 border-white/15 text-purple-200'
            }`}>
              <Award className={`w-4 h-4 ${iconColorClass}`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold flex items-baseline gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>{Math.round(elapsedData.reduce((s, d) => s + d.value, 0) / Math.max(1, elapsedDays))}g</span>
              <span className={`text-[10px] sm:text-sm font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Daily Avg</span>
            </div>
            <p className={`hidden sm:block text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Based on logged entries
            </p>
          </div>
        </div>

      </div>

      {/* 2. MAIN CHART CONTAINER */}
      <div className={`${cardBgClass} rounded-[32px] p-6 sm:p-8 transition-all duration-300 delay-[400ms] lg:delay-0 animate-in fade-in slide-in-from-bottom-6 duration-600`}>
        
        {/* STEP 1: CARD TITLE & SELECTORS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Intake Analytics
            </h3>
            <p className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
                className={`w-full sm:w-auto max-w-full truncate appearance-none text-xs sm:text-sm font-medium sm:font-semibold px-4 py-3 pr-11 sm:pr-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6417ff] cursor-pointer transition-all shadow-sm h-12 ${
                  isLight ? 'bg-slate-100/90 border border-slate-300/80 text-slate-800' : 'bg-[#231a38] border border-white/15 text-slate-200'
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
                onChange={(e) => setSelectedMacro(e.target.value as any)}
                className={`w-full sm:w-auto max-w-full truncate appearance-none text-xs sm:text-sm font-medium sm:font-semibold px-4 py-3 pr-11 sm:pr-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6417ff] cursor-pointer transition-all shadow-sm h-12 ${
                  isLight ? 'bg-slate-100/90 border border-slate-300/80 text-slate-800' : 'bg-[#231a38] border border-white/15 text-slate-200'
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

        {/* STEP 2: FULL-WIDTH TIME NAVIGATOR CONTAINER */}
        <div className={`w-full flex items-center justify-between rounded-2xl p-2 px-4 shadow-sm mb-6 h-12 border ${pillBgClass}`}>
          {/* Far Left Arrow */}
          <button
            onClick={() => {
              if (timeMode === 'weekly') setWeekOffset((prev) => prev - 1);
              else setMonthOffset((prev) => prev - 1);
            }}
            className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-[#2d2248] transition-all active:scale-95 ${iconColorClass}`}
            title={timeMode === 'weekly' ? 'Go to previous week' : 'Go to previous month'}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Centered Date Range Text */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-center">
            <Calendar className={`w-4 h-4 ${iconColorClass} stroke-[2.2]`} />
            <span>{timeMode === 'weekly' ? formattedWeekRange : formattedMonthLabel}</span>
          </div>

          {/* Far Right Arrow */}
          <button
            onClick={() => {
              if (timeMode === 'weekly') setWeekOffset((prev) => Math.min(0, prev + 1));
              else setMonthOffset((prev) => Math.min(0, prev + 1));
            }}
            disabled={timeMode === 'weekly' ? weekOffset >= 0 : monthOffset >= 0}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              (timeMode === 'weekly' ? weekOffset >= 0 : monthOffset >= 0)
                ? 'text-slate-400 cursor-not-allowed opacity-40'
                : `hover:bg-black/5 dark:hover:bg-[#2d2248] ${iconColorClass}`
            }`}
            title="Cannot navigate to future dates"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* STEP 3: SUMMARY STATS ROW */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 rounded-2xl border ${
          isLight ? 'bg-slate-100/70 border-slate-200/80' : 'bg-[#231a38] border-white/10'
        }`}>
          <div>
            <span className={`text-[11px] font-bold uppercase block ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              {timeMode === 'weekly' ? 'Weekly Total' : 'Month Total'}
            </span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {totalMonthlySum.toLocaleString()} / {monthlyRequired.toLocaleString()} {unit}
            </span>
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase block ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>Daily Average</span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{dailyAverage}</span>
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase block ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>Target</span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{targetValue} {selectedMacro === 'general' ? '%' : unit}</span>
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase block ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>Consistency</span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {Math.round((daysMetCount / Math.max(1, elapsedDays)) * 100)}% Met
            </span>
          </div>
        </div>

        {/* STEP 4: VERTICAL BAR CHART CANVAS */}
        <div
          ref={chartCanvasRef}
          onTouchStart={handleTouchMoveChart}
          onTouchMove={handleTouchMoveChart}
          onMouseLeave={() => setActiveBarIndex(null)}
          className={`relative h-64 w-full pt-6 pb-6 px-2 flex items-end justify-between space-x-1.5 sm:space-x-3 border-b select-none ${
            isLight ? 'border-slate-200/80' : 'border-white/10'
          }`}
        >
          {/* Target Goal Line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-[#6417ff]/70 z-10 flex items-center justify-end pr-2 transition-all duration-500"
            style={{
              bottom: `${(targetValue / maxValue) * 100}%`,
            }}
          >
            <span className="bg-[#6417ff] text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md transform translate-y-[-50%] border border-white/20">
              Target Goal: {targetValue}{selectedMacro === 'general' ? '%' : ` ${unit}`}
            </span>
          </div>

          {/* Vertical Bars */}
          {activeChartData.map((d, index) => {
            const barHeightPercent = d.value > 0 ? (d.value / maxValue) * 100 : 0;
            
            // UNIFIED COLOR RULE:
            // 1. Target Met (85% to 115% AND NO macro exceeded): Purple (#6417ff)
            // 2. Exceeded (>115% on any macro): Unified Rose Red (bg-rose-500)
            // 3. Below Target (<85%): Gray (bg-slate-500)
            const isTargetMetStrict = d.hasEntries && !d.isExceededAny && d.goalPercent >= 85 && d.goalPercent <= 115;
            const isExceeded = d.hasEntries && d.isExceededAny;
            const isActiveTooltip = activeBarIndex === index;

            const barColorClass = isTargetMetStrict
              ? 'bg-[#6417ff] group-hover:bg-[#5400e9] shadow-sm shadow-[#6417ff]/40'
              : isExceeded
              ? 'bg-rose-500 group-hover:bg-rose-400 shadow-sm shadow-rose-500/40'
              : isLight
              ? 'bg-slate-300 group-hover:bg-slate-400'
              : 'bg-slate-600/70 group-hover:bg-slate-500';

            // TOOLTIP TEXT: SHOW '(Exceed)' WHEN PROGRESS > 100%
            const tooltipText = d.isFutureDay
              ? `${d.label}: Future`
              : d.goalPercent > 100
              ? `${d.label}: ${d.value}${selectedMacro === 'general' ? '%' : ` ${unit}`} (Exceed)`
              : `${d.label}: ${d.value}${selectedMacro === 'general' ? '%' : ` ${unit}`}`;

            return (
              <div
                key={d.label + index}
                onClick={() => setActiveBarIndex(activeBarIndex === index ? null : index)}
                onMouseEnter={() => setActiveBarIndex(index)}
                className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer py-1"
              >
                {/* Clean Active Tooltip */}
                <div
                  className={`transition-all duration-200 absolute -top-11 bg-slate-900 text-white text-[11px] font-extrabold py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-lg border border-white/20 ${
                    isActiveTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                  }`}
                >
                  {tooltipText}
                </div>

                {/* Bar Element */}
                {!d.hasEntries || d.isFutureDay ? (
                  <div className={`w-full ${timeMode === 'weekly' ? 'max-w-[40px]' : 'max-w-[16px]'} h-1.5 rounded-t-sm ${
                    isLight ? 'bg-slate-200 border-b border-slate-300/80' : 'bg-white/10 border-b border-white/10'
                  }`} />
                ) : (
                  <div
                    className={`w-full ${timeMode === 'weekly' ? 'max-w-[40px]' : 'max-w-[16px]'} rounded-t-xl origin-bottom transition-all duration-700 ease-out shadow-md ${
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
                    ? 'text-slate-400'
                    : isLight
                    ? 'text-slate-700 group-hover:text-[#6417ff]'
                    : 'text-slate-300 group-hover:text-[#6417ff]'
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
