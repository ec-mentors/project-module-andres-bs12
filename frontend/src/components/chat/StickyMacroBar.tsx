import React from 'react';
import type { DailySummary, NutritionGoal } from '../../types/nutrition';
import { Target } from 'lucide-react';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';

interface StickyMacroBarProps {
  summary: DailySummary;
  goal: NutritionGoal;
  theme?: 'dark' | 'light';
  onOpenSetGoals?: () => void;
}

export const StickyMacroBar: React.FC<StickyMacroBarProps> = ({
  summary,
  goal,
  theme = 'dark',
  onOpenSetGoals,
}) => {
  const isLight = theme === 'light';

  const consumedKcal = summary.consumedKcal || 0;
  const targetKcal = goal.kcal || 2000;
  const kcalPercent = targetKcal > 0 ? Math.round((consumedKcal / targetKcal) * 100) : 0;
  const remainingKcal = targetKcal - consumedKcal;

  const macros = [
    {
      key: 'protein',
      label: 'PROT',
      val: summary.consumedProtein || 0,
      goal: goal.protein || 150,
      color: MACRO_COLORS.protein,
    },
    {
      key: 'carbs',
      label: 'CARBS',
      val: summary.consumedCarbs || 0,
      goal: goal.carbs || 200,
      color: MACRO_COLORS.carbs,
    },
    {
      key: 'fat',
      label: 'FAT',
      val: summary.consumedFat || 0,
      goal: goal.fat || 65,
      color: MACRO_COLORS.fat,
    },
  ];

  // SVG Circular progress radius & circumference
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(kcalPercent, 100) / 100) * circumference;

  return (
    <header className="sticky top-0 z-20 w-full shrink-0 select-none touch-manipulation animate-in fade-in duration-200">
      <div
        className={`p-[1px] rounded-2xl sm:rounded-3xl transition-all duration-300 ${
          isLight
            ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
            : 'bg-gradient-to-r from-white/[0.08] via-white/[0.14] to-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.7)]'
        }`}
      >
        <div
          className={`backdrop-blur-md px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border transition-colors ${
            isLight
              ? 'bg-[#f8fafc]/95 border-slate-300/80 text-slate-900'
              : 'bg-[#121214]/95 border-white/[0.08] text-white'
          }`}
        >
          {/* TIER 1 (Mobile) / LEFT (Desktop): CALORIE BUDGET HERO */}
          <div className="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-3 min-w-0">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              {/* Donut Progress Ring */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
                <svg className="w-9 h-9 sm:w-10 sm:h-10 transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    className={`stroke-current fill-none ${isLight ? 'text-slate-200' : 'text-white/10'}`}
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    className={`fill-none transition-all duration-700 ease-out ${
                      kcalPercent === 0
                        ? isLight ? 'stroke-slate-300' : 'stroke-white/20'
                        : isLight ? 'stroke-orange-500' : 'stroke-orange-400'
                    }`}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className={`absolute text-[11px] sm:text-xs font-black tracking-tight tabular-nums leading-none ${
                    kcalPercent === 0
                      ? isLight ? 'text-slate-400' : 'text-zinc-500'
                      : isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text
                  }`}
                >
                  {Math.min(kcalPercent, 999)}%
                </span>
              </div>

              {/* Numerical Fraction */}
              <div className="flex items-baseline space-x-1.5 min-w-0">
                <span
                  className={`text-sm sm:text-base font-black tracking-tight tabular-nums ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {formatCompactNumber(consumedKcal)}
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold tabular-nums ${
                    isLight ? 'text-slate-700' : 'text-zinc-300'
                  }`}
                >
                  / {formatCompactNumber(targetKcal)} kcal
                </span>
              </div>
            </div>

            {/* Right Group in Tier 1: Remaining Badge & Goal edit button on mobile */}
            <div className="flex items-center space-x-2 shrink-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-tight shrink-0 ${
                  isLight
                    ? 'bg-slate-200 text-slate-800 border border-slate-300'
                    : 'bg-white/10 text-zinc-200 border border-white/15'
                }`}
              >
                {remainingKcal >= 0
                  ? `${formatCompactNumber(remainingKcal)} Left`
                  : `${formatCompactNumber(Math.abs(remainingKcal))} Over`}
              </span>

              {onOpenSetGoals && (
                <button
                  onClick={onOpenSetGoals}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`sm:hidden p-2 rounded-xl border flex items-center justify-center transition-all active:scale-95 min-w-[36px] min-h-[36px] ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300/80 shadow-xs'
                      : 'bg-[#18181b] hover:bg-[#222226] text-zinc-300 border-white/[0.08]'
                  }`}
                  title="Edit Target Numbers"
                >
                  <Target className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* TIER 2 (Mobile) / RIGHT (Desktop): 3 BALANCED MACRO COLUMNS */}
          <div className={`grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-2.5 border-t sm:pt-0 sm:border-t-0 sm:flex sm:items-center sm:space-x-2.5 md:space-x-3 shrink-0 ${
            isLight ? 'border-slate-200/80' : 'border-white/[0.06]'
          }`}>
            {macros.map((m) => {
              const pct = m.goal > 0 ? Math.min(Math.round((m.val / m.goal) * 100), 100) : 0;
              return (
                <div
                  key={m.key}
                  className={`flex flex-col justify-between p-2 sm:px-3 sm:py-2 rounded-xl border transition-all sm:min-w-[85px] md:min-w-[100px] ${
                    isLight
                      ? 'bg-white/90 border-slate-300/80 shadow-xs'
                      : 'bg-[#18181b] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-1 mb-1.5 min-w-0">
                    <span
                      className={`text-xs font-black uppercase tracking-tight shrink-0 ${
                        isLight ? m.color.textLight : m.color.text
                      }`}
                    >
                      {m.label}
                    </span>
                    <span
                      className={`text-xs font-bold tabular-nums tracking-tight truncate ${
                        isLight ? 'text-slate-900' : 'text-zinc-100'
                      }`}
                    >
                      {formatCompactNumber(m.val)}/{formatCompactNumber(m.goal)}g
                    </span>
                  </div>
                  {/* Full-width Progress Bar Track */}
                  <div
                    className={`w-full h-1.5 sm:h-2 rounded-full overflow-hidden ${
                      isLight ? 'bg-slate-200' : 'bg-white/15'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full ${m.color.bg} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Quick Set Goal Button (Desktop only) */}
            {onOpenSetGoals && (
              <button
                onClick={onOpenSetGoals}
                onMouseDown={(e) => e.preventDefault()}
                className={`hidden sm:flex p-2 rounded-xl border items-center justify-center transition-all active:scale-95 ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300/80 shadow-xs'
                    : 'bg-[#18181b] hover:bg-[#222226] text-zinc-300 border-white/[0.08]'
                }`}
                title="Edit Target Numbers"
              >
                <Target className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
