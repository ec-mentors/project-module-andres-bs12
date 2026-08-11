import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Target, Award, Calendar, ChevronDown } from 'lucide-react';
import type { NutritionGoal, MealEntry } from '../../types/nutrition';

interface OverviewDashboardProps {
  goal: NutritionGoal;
  entries: MealEntry[];
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ goal, entries }) => {
  const [selectedMacro, setSelectedMacro] = useState<'general' | 'protein' | 'kcal' | 'carbs' | 'fat'>('general');
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [animateBars, setAnimateBars] = useState(false);

  // Today is August 11, 2026
  const today = new Date();
  const currentDayOfMonth = today.getDate(); // 11
  const isCurrentMonth = selectedMonth === 'August 2026';
  const currentMonthIndex = isCurrentMonth ? today.getMonth() : today.getMonth() - 1;
  const currentYear = today.getFullYear();

  // Trigger growing bar animation on mount or when macro/month changes
  useEffect(() => {
    setAnimateBars(false);
    const timer = setTimeout(() => setAnimateBars(true), 60);
    return () => clearTimeout(timer);
  }, [selectedMacro, selectedMonth, entries]);

  // Real dataset calculated dynamically from logged entries (0 when no entries exist)
  const daysInMonth = 31;
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isFutureDay = isCurrentMonth && day > currentDayOfMonth;

    // Filter real entries logged for this specific day of the month
    const dayEntries = entries.filter((entry) => {
      if (!entry.createdOn) return false;
      const d = new Date(entry.createdOn);
      return d.getDate() === day && d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
    });

    let value = 0;
    if (!isFutureDay && dayEntries.length > 0) {
      if (selectedMacro === 'general') {
        const dayKcal = dayEntries.reduce((s, item) => s + (Number(item.kcal) || 0), 0);
        const dayProtein = dayEntries.reduce((s, item) => s + (Number(item.protein) || 0), 0);
        const kcalMet = goal.kcal > 0 && dayKcal >= goal.kcal * 0.9;
        const proteinMet = goal.protein > 0 && dayProtein >= goal.protein * 0.9;
        
        if (kcalMet && proteinMet) {
          value = 100;
        } else if (kcalMet || proteinMet) {
          value = 65;
        } else {
          value = 35;
        }
      } else {
        value = dayEntries.reduce((sum, item) => {
          if (selectedMacro === 'protein') return sum + (Number(item.protein) || 0);
          if (selectedMacro === 'kcal') return sum + (Number(item.kcal) || 0);
          if (selectedMacro === 'carbs') return sum + (Number(item.carbs) || 0);
          if (selectedMacro === 'fat') return sum + (Number(item.fat) || 0);
          return sum;
        }, 0);
      }
    }

    return { day, value, isFutureDay, hasEntries: dayEntries.length > 0 };
  });

  const getTargetValue = () => {
    switch (selectedMacro) {
      case 'general':
        return 100;
      case 'protein':
        return goal.protein || 150;
      case 'kcal':
        return goal.kcal || 2000;
      case 'carbs':
        return goal.carbs || 200;
      case 'fat':
        return goal.fat || 65;
    }
  };

  const targetValue = getTargetValue();
  const elapsedDays = isCurrentMonth ? currentDayOfMonth : daysInMonth;
  const monthlyRequired = selectedMacro === 'general' ? elapsedDays : targetValue * elapsedDays;
  const maxValue = selectedMacro === 'general' ? 120 : Math.max(...dailyData.map((d) => d.value), targetValue * 1.25);
  
  const elapsedData = dailyData.filter((d) => !d.isFutureDay);
  const daysMetCount = elapsedData.filter((d) => d.value >= targetValue * 0.95 && d.hasEntries).length;
  const totalMonthlySum = selectedMacro === 'general'
    ? daysMetCount
    : elapsedData.reduce((sum, d) => sum + d.value, 0);

  const dailyAverage = selectedMacro === 'general'
    ? `${Math.round((daysMetCount / elapsedDays) * 100)}%`
    : `${Math.round(totalMonthlySum / elapsedDays)} ${selectedMacro === 'kcal' ? 'kcal' : 'g'}`;

  const unit = selectedMacro === 'general' ? 'days' : selectedMacro === 'kcal' ? 'kcal' : 'g';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP ROW: 4 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Weekly Balance */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)] border border-[#e8e2f1] hover:border-[#6417ff]/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Weekly Balance
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>0% vs last week</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0f172a]">
              {Math.round(totalMonthlySum / elapsedDays)} <span className="text-sm font-bold text-[#5f6573]">Kcal/day</span>
            </div>
            <p className="text-xs font-medium text-[#94a3b8] mt-1">
              Real logged entry average
            </p>
          </div>
        </div>

        {/* KPI 2: Streak Days */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)] border border-[#e8e2f1] hover:border-[#6417ff]/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Active Streak
            </span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0f172a] flex items-center space-x-2">
              <span>{entries.length > 0 ? 1 : 0}</span>
              <span className="text-sm font-bold text-[#5f6573]">Streak Days 🔥</span>
            </div>
            <p className="text-xs font-medium text-[#94a3b8] mt-1">
              {entries.length > 0 ? 'Active logging streak!' : 'Log a meal to start your streak!'}
            </p>
          </div>
        </div>

        {/* KPI 3: Goal Hit Rate */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)] border border-[#e8e2f1] hover:border-[#6417ff]/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Goal Accuracy
            </span>
            <div className="p-2 bg-purple-50 text-[#6417ff] rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0f172a]">
              {daysMetCount > 0 ? `${Math.round((daysMetCount / elapsedDays) * 100)}%` : '0%'} <span className="text-sm font-bold text-[#5f6573]">Target Hit</span>
            </div>
            <p className="text-xs font-medium text-[#94a3b8] mt-1">
              Met goals {daysMetCount} of {elapsedDays} days
            </p>
          </div>
        </div>

        {/* KPI 4: Monthly Avg Protein */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)] border border-[#e8e2f1] hover:border-[#6417ff]/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Avg Protein Intake
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0f172a]">
              {Math.round(elapsedData.reduce((s, d) => s + d.value, 0) / elapsedDays)}g <span className="text-sm font-bold text-[#5f6573]">Daily Avg</span>
            </div>
            <p className="text-xs font-medium text-[#94a3b8] mt-1">
              Based on logged entries
            </p>
          </div>
        </div>

      </div>

      {/* 2. MAIN CHART CONTAINER: VERTICAL BAR CHART */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[#e8e2f1] hover:border-[#6417ff]/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-600">
        
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-[#0f172a]">
              Monthly Intake Analytics
            </h3>
            <p className="text-xs font-semibold text-[#94a3b8] mt-0.5">
              Daily vertical bar breakdown (Real user entries logged)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Macro Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedMacro}
                onChange={(e) => setSelectedMacro(e.target.value as any)}
                className="appearance-none bg-[#faf8fc] border border-[#e8e2f1] hover:border-[#6417ff]/40 text-[#0f172a] text-xs font-bold px-4 py-2.5 pr-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6417ff] cursor-pointer transition-all"
              >
                <option value="general">🌟 General Goal Compliance (%)</option>
                <option value="protein">🥩 Protein (g)</option>
                <option value="kcal">🔥 Calories (Kcal)</option>
                <option value="carbs">🍞 Carbs (g)</option>
                <option value="fat">🥑 Fat (g)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#94a3b8] absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Month Selector */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-[#faf8fc] border border-[#e8e2f1] hover:border-[#6417ff]/40 text-[#0f172a] text-xs font-bold px-4 py-2.5 pr-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6417ff] cursor-pointer transition-all"
              >
                <option value="August 2026">August 2026 (Current)</option>
                <option value="July 2026">July 2026</option>
              </select>
              <Calendar className="w-4 h-4 text-[#94a3b8] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Summary Stats Row inside Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-[#faf8fc] p-4 rounded-2xl border border-[#f1ecf7]">
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Month-to-Date Total</span>
            <span className="text-lg font-bold text-[#0f172a]">
              {totalMonthlySum.toLocaleString()} / <span className="text-[#6417ff]">{monthlyRequired.toLocaleString()} {unit}</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Daily Average</span>
            <span className="text-lg font-bold text-[#0f172a]">{dailyAverage}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Target</span>
            <span className="text-lg font-bold text-[#6417ff]">{targetValue} {selectedMacro === 'general' ? '%' : unit}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Consistency</span>
            <span className="text-lg font-bold text-emerald-600">
              {Math.round((daysMetCount / elapsedDays) * 100)}% Met
            </span>
          </div>
        </div>

        {/* Vertical Bar Chart Container */}
        <div className="relative h-64 w-full pt-6 pb-6 px-2 flex items-end justify-between space-x-1.5 border-b border-[#e8e2f1]">
          {/* Target Goal Line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-[#6417ff]/60 z-10 flex items-center justify-end pr-2 transition-all duration-500"
            style={{
              bottom: `${(targetValue / maxValue) * 100}%`,
            }}
          >
            <span className="bg-[#6417ff] text-[#ffffff] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm transform translate-y-[-50%]">
              Target: {targetValue}{selectedMacro === 'general' ? '%' : ` ${unit}`}
            </span>
          </div>

          {/* Vertical Bars */}
          {dailyData.map((d, index) => {
            const barHeightPercent = d.value > 0 ? (d.value / maxValue) * 100 : 0;
            const isTargetMet = d.value >= targetValue * 0.95;

            return (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
              >
                {/* Clean Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[11px] font-extrabold py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-lg">
                  {d.isFutureDay
                    ? `Day ${d.day}: Future`
                    : `Day ${d.day}: ${d.value}${selectedMacro === 'general' ? '%' : ` ${unit}`}`}
                </div>

                {/* Bar Element: Render empty dashed placeholder if no entries or future day */}
                {!d.hasEntries || d.isFutureDay ? (
                  <div className="w-full max-w-[18px] h-1 bg-slate-100 border-b border-slate-200 rounded-t-sm" />
                ) : (
                  <div
                    className={`w-full max-w-[18px] rounded-t-lg origin-bottom transition-all duration-700 ease-out ${
                      animateBars ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
                    } ${
                      isTargetMet
                        ? 'bg-[#6417ff] group-hover:bg-[#5400e9] shadow-sm shadow-[#6417ff]/30'
                        : 'bg-[#cbd5e1] group-hover:bg-[#94a3b8]'
                    }`}
                    style={{
                      height: `${Math.max(barHeightPercent, 4)}%`,
                      transitionDelay: `${index * 15}ms`,
                    }}
                  />
                )}

                {/* Day Label */}
                <span className={`text-[10px] font-semibold mt-2 ${d.isFutureDay || !d.hasEntries ? 'text-slate-300' : 'text-[#94a3b8] group-hover:text-[#0f172a]'}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
