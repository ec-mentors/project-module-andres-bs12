import React from 'react';
import type { DailySummary, NutritionGoal } from '../../types/nutrition';

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
      return `-${Math.abs(diff).toLocaleString()} ${unit}`;
    }
    return `${diff.toLocaleString()} ${unit}`;
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

  // PROGRESS INFO HELPER:
  // 1. Below Range (<85%): Gray (bg-slate-500)
  // 2. Goal Met / Range Hit (85% to 115%): Morado (#6417ff)
  // 3. Exceeded Range (>115%): Rojo del circulito (bg-rose-500 / text-rose-500)
  const getProgressInfo = (pct: number) => {
    const isHit = pct >= 85 && pct <= 115;
    const isExceeded = pct > 115;

    return {
      color: isHit ? 'bg-[#6417ff]' : isExceeded ? 'bg-rose-500' : isLight ? 'bg-slate-300' : 'bg-slate-500',
      textColor: isHit
        ? 'text-[#6417ff] font-extrabold'
        : isExceeded
        ? 'text-rose-500 font-extrabold'
        : isLight
        ? 'text-slate-500 font-bold'
        : 'text-slate-400 font-bold',
      displayText: `${pct}%`,
      barWidth: Math.min(pct, 100),
    };
  };

  const infoKcal = getProgressInfo(pctKcal);
  const infoProtein = getProgressInfo(pctProtein);
  const infoFat = getProgressInfo(pctFat);
  const infoCarbs = getProgressInfo(pctCarbs);

  const rows = [
    {
      label: 'Calories',
      consumed: `${summary.consumedKcal.toLocaleString()} kcal`,
      left: formatLeft(summary.consumedKcal, goal.kcal, 'kcal'),
      info: infoKcal,
    },
    {
      label: 'Protein',
      consumed: `${summary.consumedProtein}g`,
      left: formatLeft(summary.consumedProtein, goal.protein, 'g'),
      info: infoProtein,
    },
    {
      label: 'Fat',
      consumed: `${summary.consumedFat}g`,
      left: formatLeft(summary.consumedFat, goal.fat, 'g'),
      info: infoFat,
    },
    {
      label: 'Carbs',
      consumed: `${summary.consumedCarbs}g`,
      left: formatLeft(summary.consumedCarbs, goal.carbs, 'g'),
      info: infoCarbs,
    },
  ];

  return (
    <div className={`border-2 rounded-[32px] p-6 sm:p-8 transition-all duration-300 ${
      isLight
        ? 'bg-white/95 backdrop-blur-sm border-slate-200/80 hover:border-[#6417ff]/25 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(100,23,255,0.05)]'
        : 'bg-[#161024] border-white/10 hover:border-[#6417ff]/40 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
    }`}>
      
      {/* Clean Header with Dynamic Selected Date Subtitle */}
      <div className={`mb-6 pb-4 border-b ${isLight ? 'border-slate-200/80' : 'border-white/10'}`}>
        <h3 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Consumed vs Left
        </h3>
        <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
          {dateFormatted}
        </p>
      </div>

      {/* Table Header Row */}
      <div className={`grid grid-cols-12 gap-2 text-xs font-extrabold uppercase tracking-wider mb-3 px-2 ${
        isLight ? 'text-slate-500' : 'text-slate-400'
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
              className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 shadow-sm border ${
                isLight
                  ? 'bg-slate-100/70 hover:bg-slate-200/60 border-slate-200/80'
                  : 'bg-[#231a38] hover:bg-[#2d2248] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="grid grid-cols-12 gap-2 items-center text-xs sm:text-sm">
                
                {/* Nutrient Label */}
                <div className={`col-span-4 sm:col-span-3 font-bold min-w-0 truncate ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {r.label}
                </div>

                {/* Consumed */}
                <div className={`col-span-4 sm:col-span-3 font-bold text-center sm:text-left truncate ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {isLoading ? (
                    <div className={`h-4 w-16 rounded-md animate-pulse my-0.5 mx-auto sm:mx-0 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                  ) : (
                    r.consumed
                  )}
                </div>

                {/* Left (NEVER CHANGES COLOR! ALWAYS CONSTANT NEUTRAL SLATE) */}
                <div
                  className={`col-span-4 sm:col-span-3 font-semibold text-right sm:text-left truncate ${
                    isLight ? 'text-slate-700 font-bold' : 'text-slate-300 font-bold'
                  }`}
                >
                  {isLoading ? (
                    <div className={`h-4 w-16 rounded-md animate-pulse my-0.5 ml-auto sm:ml-0 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                  ) : (
                    r.left
                  )}
                </div>

                {/* Progress Bar & Percentage */}
                <div className="hidden sm:flex sm:col-span-3 items-center justify-end space-x-3">
                  {isLoading ? (
                    <>
                      <div className={`w-20 rounded-full h-2 animate-pulse ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                      <div className={`h-3.5 w-8 rounded-md animate-pulse ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                    </>
                  ) : (
                    <>
                      <div className={`w-20 rounded-full h-2 overflow-hidden border ${
                        isLight ? 'bg-slate-200 border-slate-300/80' : 'bg-[#161024] border-white/10'
                      }`}>
                        <div
                          className={`h-full ${r.info.color} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${r.info.barWidth}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-10 text-right ${r.info.textColor}`}>
                        {r.info.displayText}
                      </span>
                    </>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
