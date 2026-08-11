import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Utensils } from 'lucide-react';
import type { MealEntry, CreateMealEntryPayload } from '../../types/nutrition';

interface LatestEntriesSidebarProps {
  entries: MealEntry[];
  onAddMeal: (payload: CreateMealEntryPayload) => Promise<void>;
  onDeleteMeal: (id: string) => void;
}

export const LatestEntriesSidebar: React.FC<LatestEntriesSidebarProps> = ({
  entries,
  onAddMeal,
  onDeleteMeal,
}) => {
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [mealName, setMealName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggleInlineForm = () => {
    if (isAddingInline) {
      setIsAddingInline(false);
      resetForm();
    } else {
      setIsAddingInline(true);
    }
  };

  const resetForm = () => {
    setMealName('');
    setKcal('');
    setProtein('');
    setCarbs('');
    setFat('');
    setErrorMsg('');
  };

  const handleSubmitInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) {
      setErrorMsg('Meal name required');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      await onAddMeal({
        mealName: mealName.trim(),
        source: 'MANUAL',
        kcal: Number(kcal) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      resetForm();
      setIsAddingInline(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[#e8e2f1] h-full flex flex-col justify-between">
      <div>
        {/* Header with Title and Plus Button */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#0f172a]">
            Latest entries
          </h3>
          
          <button
            onClick={handleToggleInlineForm}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
              isAddingInline
                ? 'bg-slate-200 text-slate-700 shadow-none'
                : 'bg-[#6417ff] hover:bg-[#5400e9] text-white shadow-[#6417ff]/30'
            }`}
            title={isAddingInline ? 'Cancel adding meal' : 'Log new meal directly here'}
          >
            {isAddingInline ? (
              <X className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Plus className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Meal List Container */}
        <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
          
          {/* SMOOTH INLINE NEW ENTRY FORM CARD (Slides down pushing entries) */}
          {isAddingInline && (
            <div className="bg-[#faf8fc] border-2 border-[#6417ff]/40 rounded-2xl p-4 shadow-md animate-in slide-in-from-top-6 fade-in duration-300 mb-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-[#6417ff]">
                  <Utensils className="w-4 h-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">New Entry</span>
                </div>
                <span className="text-[10px] font-bold text-[#94a3b8]">Inline Form</span>
              </div>

              {errorMsg && (
                <div className="mb-2 text-[11px] font-semibold text-red-600">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitInline} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Meal name (e.g. Chicken Rice)"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#e8e2f1] bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6417ff]"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-[#94a3b8] block mb-0.5">KCAL</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="450"
                      value={kcal}
                      onChange={(e) => setKcal(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center font-bold rounded-lg border border-[#e8e2f1] bg-white text-[#0f172a]"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#94a3b8] block mb-0.5">PRO (g)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="40"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center font-bold rounded-lg border border-[#e8e2f1] bg-white text-[#0f172a]"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#94a3b8] block mb-0.5">FAT (g)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="15"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center font-bold rounded-lg border border-[#e8e2f1] bg-white text-[#0f172a]"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#94a3b8] block mb-0.5">CAR (g)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="50"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-center font-bold rounded-lg border border-[#e8e2f1] bg-white text-[#0f172a]"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handleToggleInlineForm}
                    className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-200/60 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 text-xs font-bold text-white bg-[#6417ff] hover:bg-[#5400e9] rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Saving...' : 'Add Meal'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Meals List */}
          {entries.length === 0 && !isAddingInline ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#faf8fc] border border-dashed border-[#e8e2f1]">
              <p className="text-sm font-semibold text-[#94a3b8]">No meals logged for today yet.</p>
              <button
                onClick={handleToggleInlineForm}
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
