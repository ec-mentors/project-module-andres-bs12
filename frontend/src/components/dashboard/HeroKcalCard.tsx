import React from 'react';
import type { DailySummary, NutritionGoal } from '../../types/nutrition';

interface HeroKcalCardProps {
  summary: DailySummary;
  goal: NutritionGoal;
}

interface MacroRingProps {
  label: string;
  valueText: string;
  subText: string;
  percentage: number;
  color: string;
  ringValue?: string;
}

const MacroRingCard: React.FC<MacroRingProps> = ({
  label,
  valueText,
  subText,
  percentage,
  color,
  ringValue,
}) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="flex-1 bg-white border border-[#e8e2f1] hover:border-[#6417ff]/40 rounded-[24px] p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
      <div>
        <span className="text-[11px] font-bold tracking-wider text-[#94a3b8] uppercase block mb-1">
          {label}
        </span>
        <div className="text-2xl font-bold text-[#0f172a] leading-tight">
          {valueText}
        </div>
        <div className="text-xs font-semibold text-[#5f6573] mt-0.5">
          {subText}
        </div>
      </div>

      {/* SVG Donut Ring */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-bold text-[#0f172a]">
          {ringValue || `${Math.round(percentage)}`}
        </span>
      </div>
    </div>
  );
};

export const HeroKcalCard: React.FC<HeroKcalCardProps> = ({ summary, goal }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const remainingKcal = Math.max(0, goal.kcal - summary.consumedKcal);
  const kcalPercent = goal.kcal > 0 ? (summary.consumedKcal / goal.kcal) * 100 : 0;
  
  const carbsRemaining = goal.carbs - summary.consumedCarbs;
  const fatRemaining = goal.fat - summary.consumedFat;
  const proteinRemaining = goal.protein - summary.consumedProtein;

  const carbsPercent = goal.carbs > 0 ? (summary.consumedCarbs / goal.carbs) * 100 : 0;
  const fatPercent = goal.fat > 0 ? (summary.consumedFat / goal.fat) * 100 : 0;
  const proteinPercent = goal.protein > 0 ? (summary.consumedProtein / goal.protein) * 100 : 0;

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[#e8e2f1] hover:border-[#6417ff]/30 transition-all duration-300">
      {/* Top Header Row with Date */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-6xl font-extrabold text-[#0f172a] tracking-tight">
            {remainingKcal}
          </h2>
          <p className="text-lg font-bold text-[#0f172a] mt-1">
            Kcal remaining
          </p>
        </div>

        <span className="text-xs font-bold text-[#94a3b8] bg-[#faf8fc] px-4 py-2 rounded-full border border-[#f1ecf7]">
          📅 {currentDate}
        </span>
      </div>

      {/* 4 Macro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KCAL */}
        <MacroRingCard
          label="KCAL"
          valueText={`${remainingKcal}`}
          subText={remainingKcal === 0 ? 'Goal Met' : 'Left'}
          percentage={kcalPercent}
          color="#f59e0b"
          ringValue={`${remainingKcal}`}
        />

        {/* CARBS */}
        <MacroRingCard
          label="CARBS"
          valueText={`${summary.consumedCarbs}g`}
          subText={carbsRemaining <= 0 ? 'Perfect' : `${carbsRemaining}g Left`}
          percentage={carbsPercent}
          color="#16a34a"
          ringValue={`${Math.round(carbsPercent)}`}
        />

        {/* FAT */}
        <MacroRingCard
          label="FAT"
          valueText={`${summary.consumedFat}g`}
          subText={fatRemaining < 0 ? 'Over' : `${fatRemaining}g Left`}
          percentage={fatPercent}
          color="#ef233c"
          ringValue={fatRemaining < 0 ? '100+' : `${Math.round(fatPercent)}`}
        />

        {/* PROTEIN */}
        <MacroRingCard
          label="PROTEIN"
          valueText={`${summary.consumedProtein}g`}
          subText={proteinRemaining <= 0 ? 'Goal Met' : `${proteinRemaining}g Left`}
          percentage={proteinPercent}
          color="#ef233c"
          ringValue={`${proteinRemaining > 0 ? proteinRemaining : 0}`}
        />
      </div>
    </div>
  );
};
