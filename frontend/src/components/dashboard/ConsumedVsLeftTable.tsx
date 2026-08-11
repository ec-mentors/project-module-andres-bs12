import React, { useEffect, useState } from 'react';
import type { DailySummary, NutritionGoal } from '../../types/nutrition';

interface ConsumedVsLeftTableProps {
  summary: DailySummary;
  goal: NutritionGoal;
}

interface RowData {
  kind: string;
  consumed: string;
  goalText: string;
  extraText: string;
  percentage: number;
  barColor: string;
}

export const ConsumedVsLeftTable: React.FC<ConsumedVsLeftTableProps> = ({ summary, goal }) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 60);
    return () => clearTimeout(timer);
  }, [summary, goal]);

  // Calculate row metrics
  const kcalExtra = summary.consumedKcal - goal.kcal;
  const kcalPercent = goal.kcal > 0 ? Math.round((summary.consumedKcal / goal.kcal) * 100) : 0;

  const proteinLeft = goal.protein - summary.consumedProtein;
  const proteinPercent = goal.protein > 0 ? Math.round((summary.consumedProtein / goal.protein) * 100) : 0;

  const fatLeft = goal.fat - summary.consumedFat;
  const fatPercent = goal.fat > 0 ? Math.round((summary.consumedFat / goal.fat) * 100) : 0;

  const carbsLeft = goal.carbs - summary.consumedCarbs;
  const carbsPercent = goal.carbs > 0 ? Math.round((summary.consumedCarbs / goal.carbs) * 100) : 0;

  const rows: RowData[] = [
    {
      kind: 'Calories',
      consumed: `${summary.consumedKcal} kcal`,
      goalText: `${goal.kcal} kcal`,
      extraText: kcalExtra > 0 ? `${kcalExtra} kcal extra` : `${Math.abs(kcalExtra)} kcal left`,
      percentage: kcalPercent,
      barColor: kcalExtra > 0 ? 'bg-[#ef233c]' : 'bg-[#16a34a]',
    },
    {
      kind: 'Protein',
      consumed: `${summary.consumedProtein}g`,
      goalText: `${goal.protein}g`,
      extraText: proteinLeft > 0 ? `${proteinLeft}g left` : `${Math.abs(proteinLeft)}g extra`,
      percentage: proteinPercent,
      barColor: 'bg-[#f59e0b]',
    },
    {
      kind: 'Fat',
      consumed: `${summary.consumedFat}g`,
      goalText: `${goal.fat}g`,
      extraText: fatLeft > 0 ? `${fatLeft}g left` : `${Math.abs(fatLeft)}g extra`,
      percentage: fatPercent,
      barColor: 'bg-[#16a34a]',
    },
    {
      kind: 'Carbohydrates',
      consumed: `${summary.consumedCarbs}g`,
      goalText: `${goal.carbs}g`,
      extraText: carbsLeft > 0 ? `${carbsLeft}g left` : `${Math.abs(carbsLeft)}g extra`,
      percentage: carbsPercent,
      barColor: 'bg-[#6417ff]',
    },
  ];

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[#e8e2f1] hover:border-[#6417ff]/30 transition-all duration-300">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#0f172a]">
          Consumed vs left
        </h3>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
        <div className="col-span-3">Kind</div>
        <div className="col-span-2">Consumed</div>
        <div className="col-span-2">Goal</div>
        <div className="col-span-5">Extra / Progress</div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.kind}
            className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center rounded-2xl bg-[#faf8fc] hover:bg-[#f5f0fb] border border-[#f1ecf7] hover:border-[#6417ff]/20 text-sm font-semibold text-[#0f172a] transition-all"
          >
            <div className="col-span-3 font-bold text-[#0f172a]">{row.kind}</div>
            <div className="col-span-2">{row.consumed}</div>
            <div className="col-span-2 text-[#5f6573]">{row.goalText}</div>
            
            <div className="col-span-5 flex items-center space-x-4">
              <span
                className={`text-xs font-bold w-24 ${
                  row.extraText.includes('extra') ? 'text-[#ef233c]' : 'text-[#f59e0b]'
                }`}
              >
                {row.extraText}
              </span>
              
              {/* Progress Bar Container */}
              <div className="flex-1 bg-[#e8e2f1] h-3 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-[1000ms] ease-out ${row.barColor}`}
                  style={{ width: isAnimated ? `${Math.min(row.percentage, 100)}%` : '0%' }}
                />
              </div>

              <span className="text-xs font-bold text-[#0f172a] w-10 text-right">
                {row.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
