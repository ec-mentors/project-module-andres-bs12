import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Utensils, Edit2 } from 'lucide-react';
import type { MealEntry, CreateMealEntryPayload } from '../../types/nutrition';

interface LatestEntriesSidebarProps {
  entries: MealEntry[];
  onAddMeal: (payload: CreateMealEntryPayload) => Promise<void>;
  onUpdateMeal: (id: string, payload: CreateMealEntryPayload) => Promise<void>;
  onDeleteMeal: (id: string) => void;
  selectedDateFormatted: string;
}

export const LatestEntriesSidebar: React.FC<LatestEntriesSidebarProps> = ({
  entries,
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
  selectedDateFormatted,
}) => {
  // New Meal Inline Form State
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [mealName, setMealName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Editing Existing Meal Inline Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMealName, setEditMealName] = useState('');
  const [editKcal, setEditKcal] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');

  const handleToggleInlineForm = () => {
    if (isAddingInline) {
      setIsAddingInline(false);
      resetAddForm();
    } else {
      setEditingId(null);
      setIsAddingInline(true);
    }
  };

  const resetAddForm = () => {
    setMealName('');
    setKcal('');
    setProtein('');
    setCarbs('');
    setFat('');
    setErrorMsg('');
  };

  const startEditing = (item: MealEntry) => {
    if (!item.id) return;
    setIsAddingInline(false);
    setEditingId(item.id);
    setEditMealName(item.mealName);
    setEditKcal(String(item.kcal));
    setEditProtein(String(item.protein));
    setEditCarbs(String(item.carbs));
    setEditFat(String(item.fat));
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSubmitNewMeal = async (e: React.FormEvent) => {
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

      resetAddForm();
      setIsAddingInline(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUpdateMeal = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editMealName.trim()) return;

    try {
      setIsSubmitting(true);
      await onUpdateMeal(id, {
        mealName: editMealName.trim(),
        source: 'MANUAL',
        kcal: Number(editKcal) || 0,
        protein: Number(editProtein) || 0,
        carbs: Number(editCarbs) || 0,
        fat: Number(editFat) || 0,
      });
      setEditingId(null);
    } catch (err: any) {
      console.error('Error updating meal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[#e8e2f1] h-full flex flex-col justify-between">
      <div>
        {/* Header with Title and Plus Button */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a]">
              Latest entries
            </h3>
            <span className="text-xs font-semibold text-[#94a3b8]">
              {selectedDateFormatted}
            </span>
          </div>
          
          <button
            onClick={handleToggleInlineForm}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all transform hover:scale-105 active:scale-95 ${
              isAddingInline
                ? 'bg-slate-200 text-slate-700 shadow-none'
                : 'bg-[#6417ff] hover:bg-[#5400e9] text-white shadow-[#6417ff]/30'
            }`}
            title={isAddingInline ? 'Cancel adding meal' : 'Log new meal directly here'}
          >
            {isAddingInline ? (
              <X className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Meal List Container (Height aligned with ConsumedVsLeftTable) */}
        <div className="space-y-3 max-h-[660px] overflow-y-auto pr-1">
          
          {/* INLINE NEW ENTRY FORM CARD */}
          {isAddingInline && (
            <div className="bg-[#faf8fc] border-2 border-[#6417ff]/40 rounded-2xl p-4 shadow-md animate-in slide-in-from-top-4 fade-in duration-300 mb-3 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-[#6417ff]">
                  <Utensils className="w-4 h-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">New Entry ({selectedDateFormatted})</span>
                </div>
                <span className="text-[10px] font-bold text-[#94a3b8]">Inline Form</span>
              </div>

              {errorMsg && (
                <div className="mb-2 text-[11px] font-semibold text-red-600">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitNewMeal} className="space-y-3">
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
                    className="flex-1 py-1.5 text-xs font-bold text-slate-500 bg-slate-200/60 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-1.5 text-xs font-bold text-white bg-[#6417ff] hover:bg-[#5400e9] rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
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
            <div className="text-center py-16 px-4 rounded-2xl bg-[#faf8fc] border border-dashed border-[#e8e2f1]">
              <p className="text-xs font-semibold text-[#94a3b8]">No meals logged for {selectedDateFormatted}.</p>
              <button
                onClick={handleToggleInlineForm}
                className="mt-2 text-xs font-bold text-[#6417ff] hover:underline"
              >
                + Log meal for this date
              </button>
            </div>
          ) : (
            entries.map((item) => {
              const isEditingThis = editingId === item.id;
              const timeFormatted = item.createdOn
                ? new Date(item.createdOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '12:45';

              if (isEditingThis && item.id) {
                /* INLINE EDIT FORM FOR EXISTING ENTRY */
                return (
                  <div
                    key={item.id}
                    className="bg-[#faf8fc] border-2 border-[#6417ff] rounded-2xl p-4 shadow-md animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-[#6417ff]">Editing Entry</span>
                      <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <form onSubmit={(e) => handleSubmitUpdateMeal(e, item.id!)} className="space-y-3">
                      <input
                        type="text"
                        required
                        value={editMealName}
                        onChange={(e) => setEditMealName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-[#e8e2f1] bg-white text-[#0f172a]"
                      />

                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <span className="text-[8px] font-bold text-[#94a3b8] block text-center">KCAL</span>
                          <input
                            type="number"
                            value={editKcal}
                            onChange={(e) => setEditKcal(e.target.value)}
                            className="w-full py-1 text-xs text-center font-bold rounded-lg border border-[#e8e2f1] bg-white text-[#0f172a]"
                          />
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[#94a3b8] block text-center">PRO</span>
                          <input
                            type="number"
                            value={editProtein}
                            onChange={(e) => setEditProtein(e.target.value)}
                            className="w-full py-1 text-xs text-center font-bold rounded-lg border border-[#e8e2f1] bg-white text-[#0f172a]"
                          />
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[#94a3b8] block text-center">FAT</span>
                          <input
                            type="number"
                            value={editFat}
                            onChange={(e) => setEditFat(e.target.value)}
                            className="w-full py-1 text-xs text-center font-bold rounded-lg border border-[#e8e2f1] bg-white text-[#0f172a]"
                          />
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[#94a3b8] block text-center">CAR</span>
                          <input
                            type="number"
                            value={editCarbs}
                            onChange={(e) => setEditCarbs(e.target.value)}
                            className="w-full py-1 text-xs text-center font-bold rounded-lg border border-[#e8e2f1] bg-white text-[#0f172a]"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="flex-1 py-1.5 text-xs font-bold text-slate-500 bg-slate-200 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-1.5 text-xs font-bold text-white bg-[#6417ff] rounded-xl shadow-md"
                        >
                          {isSubmitting ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </form>
                  </div>
                );
              }

              /* NORMAL MEAL ENTRY CARD (Clickable to Edit) */
              return (
                <div
                  key={item.id || item.mealName + Math.random()}
                  onClick={() => startEditing(item)}
                  className="group bg-[#faf8fc] hover:bg-[#f5f0fb] border border-[#f1ecf7] hover:border-[#6417ff]/30 rounded-2xl p-4 transition-all relative cursor-pointer"
                  title="Click anywhere on card or numbers to edit this meal"
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(item);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[#6417ff] hover:text-[#5400e9] transition-opacity p-1"
                        title="Edit entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {item.id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMeal(item.id!);
                          }}
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

                  {/* 4 Clickeable Macro Stat Chips */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white border border-[#e8e2f1] group-hover:border-[#6417ff]/40 rounded-xl p-2 text-center transition-colors">
                      <span className="text-[10px] font-bold text-[#94a3b8] group-hover:text-[#6417ff] block uppercase">KCAL</span>
                      <span className="text-xs font-bold text-[#0f172a]">{item.kcal}</span>
                    </div>

                    <div className="bg-[#ffffff] border border-[#e8e2f1] group-hover:border-[#6417ff]/40 rounded-xl p-2 text-center transition-colors">
                      <span className="text-[10px] font-bold text-[#94a3b8] group-hover:text-[#6417ff] block uppercase">PRO</span>
                      <span className="text-xs font-bold text-[#0f172a]">{item.protein}g</span>
                    </div>

                    <div className="bg-white border border-[#e8e2f1] group-hover:border-[#6417ff]/40 rounded-xl p-2 text-center transition-colors">
                      <span className="text-[10px] font-bold text-[#94a3b8] group-hover:text-[#6417ff] block uppercase">FAT</span>
                      <span className="text-xs font-bold text-[#0f172a]">{item.fat}g</span>
                    </div>

                    <div className="bg-white border border-[#e8e2f1] group-hover:border-[#6417ff]/40 rounded-xl p-2 text-center transition-colors">
                      <span className="text-[10px] font-bold text-[#94a3b8] group-hover:text-[#6417ff] block uppercase">CAR</span>
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
