import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { MealEntry } from '../../types/nutrition';

interface LatestEntriesSidebarProps {
  entries: MealEntry[];
  onOpenAddMeal: () => void;
  onDeleteMeal: (id: string) => void;
}

export const LatestEntriesSidebar: React.FC<LatestEntriesSidebarProps> = ({
  entries,
  onOpenAddMeal,
  onDeleteMeal,
}) => {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[#e8e2f1] h-full flex flex-col justify-between">
      <div>
        {/* Header with Title and Plus Button */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#0f172a]">
            Latest entries
          </h3>
          <button
            onClick={onOpenAddMeal}
            className="w-10 h-10 rounded-full bg-[#6417ff] hover:bg-[#5400e9] text-white flex items-center justify-center shadow-lg shadow-[#6417ff]/30 transition-all transform hover:scale-105 active:scale-95"
            title="Log new meal"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Meal List */}
        <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#faf8fc] border border-dashed border-[#e8e2f1]">
              <p className="text-sm font-semibold text-[#94a3b8]">No meals logged for today yet.</p>
              <button
                onClick={onOpenAddMeal}
                className="mt-3 text-xs font-bold text-[#6417ff] hover:underline"
              >
                + Log your first meal
              </button>
            </div>
          ) : (
            entries.map((item) => {
              const timeFormatted = item.createdOn
                ? new Date(item.createdOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '12:45';

              return (
                <div
                  key={item.id || item.mealName + Math.random()}
                  className="group bg-[#faf8fc] hover:bg-[#f5f0fb] border border-[#f1ecf7] rounded-2xl p-4 transition-all relative"
                >
                  {/* Top Badge & Time */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-[#eee6ff] text-[#6417ff] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.source || 'Manual'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-[#94a3b8]">
                        {timeFormatted}
                      </span>
                      {item.id && (
                        <button
                          onClick={() => onDeleteMeal(item.id!)}
                          className="opacity-0 group-hover:opacity-100 text-[#ef233c] hover:text-red-700 transition-opacity p-1"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Meal Name */}
                  <h4 className="text-base font-bold text-[#0f172a] mb-3">
                    {item.mealName}
                  </h4>

                  {/* 4 Macro Stat Chips */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white border border-[#e8e2f1] rounded-xl p-2 text-center">
                      <span className="text-[10px] font-bold text-[#94a3b8] block uppercase">KCAL</span>
                      <span className="text-xs font-bold text-[#0f172a]">{item.kcal}</span>
                    </div>

                    <div className="bg-white border border-[#e8e2f1] rounded-xl p-2 text-center">
                      <span className="text-[10px] font-bold text-[#94a3b8] block uppercase">PRO</span>
                      <span className="text-xs font-bold text-[#0f172a]">{item.protein}g</span>
                    </div>

                    <div className="bg-white border border-[#e8e2f1] rounded-xl p-2 text-center">
                      <span className="text-[10px] font-bold text-[#94a3b8] block uppercase">FAT</span>
                      <span className="text-xs font-bold text-[#0f172a]">{item.fat}g</span>
                    </div>

                    <div className="bg-white border border-[#e8e2f1] rounded-xl p-2 text-center">
                      <span className="text-[10px] font-bold text-[#94a3b8] block uppercase">CAR</span>
                      <span className="text-xs font-bold text-[#0f172a]">{item.carbs}g</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
