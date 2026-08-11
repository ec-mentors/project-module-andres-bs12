import React, { useState } from 'react';
import { Flame, TrendingDown, Target, Award, Calendar, ChevronDown } from 'lucide-react';
import type { NutritionGoal } from '../../types/nutrition';

interface OverviewDashboardProps {
  goal: NutritionGoal;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ goal }) => {
  const [selectedMacro, setSelectedMacro] = useState<'protein' | 'kcal' | 'carbs' | 'fat'>('protein');
  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  // Simulated 30-day monthly intake dataset
  const daysInMonth = 31;
  const mockDailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    // Generate realistic daily variance
    let value = 0;
    if (selectedMacro === 'protein') {
      value = Math.floor(110 + Math.sin(day) * 35 + (day % 3) * 15);
    } else if (selectedMacro === 'kcal') {
      value = Math.floor(1800 + Math.cos(day) * 400 + (day % 4) * 100);
    } else if (selectedMacro === 'carbs') {
      value = Math.floor(160 + Math.sin(day * 2) * 50);
    } else {
      value = Math.floor(50 + Math.cos(day) * 20);
    }
    return { day, value };
  });

  const getTargetValue = () => {
    switch (selectedMacro) {
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
  const maxValue = Math.max(...mockDailyData.map((d) => d.value), targetValue * 1.2);
  const totalMonthlySum = mockDailyData.reduce((sum, d) => sum + d.value, 0);
  const dailyAverage = Math.round(totalMonthlySum / daysInMonth);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. TOP ROW: 4 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Weekly Balance vs Last Week */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)] border border-[#e8e2f1] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
              Weekly Balance
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center space-x-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-4.2% vs last week</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0f172a]">
              2,150 <span className="text-sm font-bold text-[#5f6573]">Kcal/day</span>
            </div>
            <p className="text-xs font-semibold text-[#94a3b8] mt-1">
              Same time window comparison
            </p>
          </div>
        </div>

        {/* KPI 2: Streak Days */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)] border border-[#e8e2f1] flex flex-col justify-between">
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
              <span>14</span>
              <span className="text-sm font-bold text-[#5f6573]">Streak Days 🔥</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              Logged meals 14 days in a row!
            </p>
          </div>
        </div>

        {/* KPI 3: Goal Hit Rate */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)] border border-[#e8e2f1] flex flex-col justify-between">
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
              92% <span className="text-sm font-bold text-[#5f6573]">Target Hit</span>
            </div>
            <p className="text-xs font-semibold text-[#5f6573] mt-1">
              Met goals 26 of 28 days
            </p>
          </div>
        </div>

        {/* KPI 4: Monthly Avg Protein */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_25px_rgba(15,23,42,0.06)] border border-[#e8e2f1] flex flex-col justify-between">
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
              142g <span className="text-sm font-bold text-[#5f6573]">Daily Avg</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-1">
              +12g over target
            </p>
          </div>
        </div>

      </div>

      {/* 2. MAIN CHART CONTAINER: VERTICAL BAR CHART FOR MONTHLY MACRO INTAKE */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[#e8e2f1]">
        
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-[#0f172a]">
              Monthly Intake Analytics
            </h3>
            <p className="text-xs font-semibold text-[#94a3b8] mt-0.5">
              Daily vertical bar breakdown vs target goal line
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Macro Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedMacro}
                onChange={(e) => setSelectedMacro(e.target.value as any)}
                className="appearance-none bg-[#faf8fc] border border-[#e8e2f1] text-[#0f172a] text-xs font-bold px-4 py-2.5 pr-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6417ff] cursor-pointer"
              >
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
                className="appearance-none bg-[#faf8fc] border border-[#e8e2f1] text-[#0f172a] text-xs font-bold px-4 py-2.5 pr-8 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6417ff] cursor-pointer"
              >
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
              <Calendar className="w-4 h-4 text-[#94a3b8] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Summary Stats Row inside Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-[#faf8fc] p-4 rounded-2xl border border-[#f1ecf7]">
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Monthly Total</span>
            <span className="text-lg font-bold text-[#0f172a]">{totalMonthlySum.toLocaleString()} {selectedMacro === 'kcal' ? 'kcal' : 'g'}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Daily Average</span>
            <span className="text-lg font-bold text-[#0f172a]">{dailyAverage} {selectedMacro === 'kcal' ? 'kcal' : 'g'}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Daily Target</span>
            <span className="text-lg font-bold text-[#6417ff]">{targetValue} {selectedMacro === 'kcal' ? 'kcal' : 'g'}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Consistency</span>
            <span className="text-lg font-bold text-emerald-600">92% Met</span>
          </div>
        </div>

        {/* Vertical Bar Chart Container */}
        <div className="relative h-64 w-full pt-6 pb-6 px-2 flex items-end justify-between space-x-1.5 border-b border-[#e8e2f1]">
          {/* Target Goal Line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-[#6417ff]/60 z-10 flex items-center justify-end pr-2"
            style={{
              bottom: `${(targetValue / maxValue) * 100}%`,
            }}
          >
            <span className="bg-[#6417ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm transform translate-y-[-50%]">
              Target: {targetValue}
            </span>
          </div>

          {/* Vertical Bars */}
          {mockDailyData.map((d) => {
            const barHeightPercent = (d.value / maxValue) * 100;
            const isTargetMet = d.value >= targetValue * 0.95;

            return (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
              >
                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-lg">
                  Day {d.day}: {d.value} {selectedMacro === 'kcal' ? 'kcal' : 'g'}
                </div>

                {/* Bar Element */}
                <div
                  className={`w-full max-w-[18px] rounded-t-lg transition-all duration-300 ${
                    isTargetMet
                      ? 'bg-[#6417ff] group-hover:bg-[#5400e9]'
                      : 'bg-amber-400 group-hover:bg-amber-500'
                  }`}
                  style={{ height: `${barHeightPercent}%` }}
                />

                {/* Day Label */}
                <span className="text-[10px] font-semibold text-[#94a3b8] mt-2 group-hover:text-[#0f172a]">
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
