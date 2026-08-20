import React from 'react';
import type { DailySummary, NutritionGoal } from '../../types/nutrition';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';

interface ConsumedVsLeftTableProps {
  summary: DailySummary;
  goal: NutritionGoal;
  selectedDate?: Date;
  theme?: 'dark' | 'light';
  isLoading?: boolean;
}

export const ConsumedVsLeftTable: React.FC<ConsumedVsLeftTableProps> = ({
  summary,
  goal,
  selectedDate,
  theme = 'dark',
  isLoading = false,
}) => {
  const isLight = theme === 'light';

  // Defensive Math
  const safeKcalGoal = Math.max(goal.kcal, 1);
  const safeProteinGoal = Math.max(goal.protein, 1);
  const safeFatGoal = Math.max(goal.fat, 1);
  const safeCarbsGoal = Math.max(goal.carbs, 1);

  // Exact difference logic: if exceeded, display negative value (e.g. -20g or -150 kcal)
  const formatLeft = (consumed: number, target: number, unit: string) => {
    const diff = target - consumed;
    if (diff < 0) {
      return `-${formatCompactNumber(Math.abs(diff))} ${unit}`;
    }
    return `${formatCompactNumber(diff)} ${unit}`;
  };

  const pctKcal = Math.round((summary.consumedKcal / safeKcalGoal) * 100);
  const pctProtein = Math.round((summary.consumedProtein / safeProteinGoal) * 100);
  const pctFat = Math.round((summary.consumedFat / safeFatGoal) * 100);
  const pctCarbs = Math.round((summary.consumedCarbs / safeCarbsGoal) * 100);

  // Dynamic date calculation synced with selectedDate
  const activeDate = selectedDate || new Date();
  const isToday = activeDate.toDateString() === new Date().toDateString();
  
  const dateFormatted = isToday
    ? `Today, ${activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`
    : activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  // PROGRESS INFO HELPER using centralized Macro Colors:
  const getProgressInfo = (pct: number, defaultBgClass: string, defaultTextClass: string) => {
    return {
      color: defaultBgClass,
      textColor: pct === 0 ? (isLight ? 'text-slate-400 font-bold' : 'text-zinc-500 font-bold') : defaultTextClass,
      displayText: `${pct}%`,
      barWidth: Math.min(pct, 100),
    };
  };

  const infoKcal = getProgressInfo(
    pctKcal,
    MACRO_COLORS.kcal.bg,
    isLight ? `${MACRO_COLORS.kcal.textLight} font-black` : `${MACRO_COLORS.kcal.text} font-black`
  );
  const infoProtein = getProgressInfo(
    pctProtein,
    MACRO_COLORS.protein.bg,
    isLight ? `${MACRO_COLORS.protein.textLight} font-black` : `${MACRO_COLORS.protein.text} font-black`
  );
  const infoFat = getProgressInfo(
    pctFat,
    MACRO_COLORS.fat.bg,
    isLight ? `${MACRO_COLORS.fat.textLight} font-black` : `${MACRO_COLORS.fat.text} font-black`
  );
  const infoCarbs = getProgressInfo(
    pctCarbs,
    MACRO_COLORS.carbs.bg,
    isLight ? `${MACRO_COLORS.carbs.textLight} font-black` : `${MACRO_COLORS.carbs.text} font-black`
  );

  const rows = [
    {
      label: 'Calories',
      labelColor: isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text,
      consumed: `${formatCompactNumber(summary.consumedKcal)} kcal`,
      left: formatLeft(summary.consumedKcal, goal.kcal, 'kcal'),
      info: infoKcal,
    },
    {
      label: 'Protein',
      labelColor: isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text,
      consumed: `${formatCompactNumber(summary.consumedProtein)}g`,
      left: formatLeft(summary.consumedProtein, goal.protein, 'g'),
      info: infoProtein,
    },
    {
      label: 'Fat',
      labelColor: isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text,
      consumed: `${formatCompactNumber(summary.consumedFat)}g`,
      left: formatLeft(summary.consumedFat, goal.fat, 'g'),
      info: infoFat,
    },
    {
      label: 'Carbs',
      labelColor: isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text,
      consumed: `${formatCompactNumber(summary.consumedCarbs)}g`,
      left: formatLeft(summary.consumedCarbs, goal.carbs, 'g'),
      info: infoCarbs,
    },
  ];

  return (
    <div className={`border rounded-[32px] p-6 sm:p-8 transition-all duration-300 ${isLoading ? 'opacity-90' : ''} ${
      isLight
        ? 'bg-white/95 backdrop-blur-xs border-slate-200/80 hover:border-slate-300 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
        : 'bg-[#121214] border-white/[0.08] hover:border-white/[0.16] text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
    }`}>
      
      {/* Clean Header with Dynamic Selected Date Subtitle */}
      <div className={`mb-6 pb-4 border-b ${isLight ? 'border-slate-200/80' : 'border-white/[0.08]'}`}>
        <h3 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Consumed vs Left
        </h3>
        <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
          {dateFormatted}
        </p>
      </div>

      {/* Table Header Row */}
      <div className={`grid grid-cols-12 gap-2 text-xs font-black uppercase tracking-wider mb-3 px-2 ${
        isLight ? 'text-slate-700' : 'text-zinc-300'
      }`}>
        <div className="col-span-4 sm:col-span-3">Nutrient</div>
        <div className="col-span-4 sm:col-span-3 text-center sm:text-left">Consumed</div>
        <div className="col-span-4 sm:col-span-3 text-right sm:text-left">Left</div>
        <div className="hidden sm:block sm:col-span-3 text-right">Progress</div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((r) => {
          return (
            <div
              key={r.label}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 shadow-xs border ${
                isLight
                  ? 'bg-slate-100/70 hover:bg-slate-200/60 border-slate-200/80'
                  : 'bg-[#18181b] hover:bg-[#202024] border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              <div className="grid grid-cols-12 gap-2 items-center text-xs sm:text-sm">
                
                {/* Nutrient Label */}
                <div className={`col-span-4 sm:col-span-3 font-extrabold min-w-0 truncate ${r.labelColor}`}>
                  {r.label}
                </div>

                {/* Consumed */}
                <div className={`col-span-4 sm:col-span-3 font-black text-center sm:text-left truncate transition-colors duration-200 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {r.consumed}
                </div>

                {/* Left (CONSTANT NEUTRAL ZINC/SLATE) */}
                <div
                  className={`col-span-4 sm:col-span-3 font-bold text-right sm:text-left truncate transition-colors duration-200 ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}
                >
                  {r.left}
                </div>

                {/* Progress Bar & Percentage */}
                <div className="hidden sm:flex sm:col-span-3 items-center justify-end space-x-3">
                  <div className={`w-20 rounded-full h-2 overflow-hidden ${
                    isLight ? 'bg-slate-200' : 'bg-white/10'
                  }`}>
                    <div
                      className={`h-full rounded-full ${r.info.color} transition-all duration-500 ease-out`}
                      style={{ width: `${r.info.barWidth}%` }}
                    />
                  </div>
                  <span className={`text-xs sm:text-sm w-12 text-right ${r.info.textColor} transition-colors duration-200`}>
                    {r.info.displayText}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
