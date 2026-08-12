import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Utensils, X, Check, AlertTriangle } from 'lucide-react';
import type { MealEntry, CreateMealEntryPayload } from '../../types/nutrition';

interface LatestEntriesSidebarProps {
  entries: MealEntry[];
  onAddMeal: (payload: CreateMealEntryPayload) => void;
  onUpdateMeal: (id: string, payload: CreateMealEntryPayload) => void;
  onDeleteMeal: (entryId: string) => void;
  selectedDateFormatted: string;
  theme?: 'dark' | 'light';
}

export const LatestEntriesSidebar: React.FC<LatestEntriesSidebarProps> = ({
  entries,
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
  selectedDateFormatted,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Adding / Editing
  const [mealName, setMealName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const resetForm = () => {
    setMealName('');
    setKcal('');
    setProtein('');
    setCarbs('');
    setFat('');
    setIsAddingInline(false);
    setEditingId(null);
    setDeleteConfirmId(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAddingInline(true);
  };

  const handleStartEdit = (entry: MealEntry) => {
    if (!entry.id) return;
    setIsAddingInline(false);
    setDeleteConfirmId(null);
    setEditingId(entry.id);
    setMealName(entry.mealName);
    setKcal(String(entry.kcal));
    setProtein(String(entry.protein));
    setCarbs(String(entry.carbs));
    setFat(String(entry.fat));
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    onAddMeal({
      mealName: mealName.trim(),
      kcal: Number(kcal) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      source: 'Manual',
    });

    resetForm();
  };

  const handleSaveEdit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    onUpdateMeal(id, {
      mealName: mealName.trim(),
      kcal: Number(kcal) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      source: 'Manual',
    });

    resetForm();
  };

  const handleConfirmDelete = (id: string) => {
    onDeleteMeal(id);
    resetForm();
  };

  const iconColorClass = isLight ? 'text-slate-700' : 'text-slate-200';

  return (
    <div className={`border-2 rounded-[32px] p-6 sm:p-8 flex flex-col h-full justify-between transition-all duration-300 ${
      isLight
        ? 'bg-white/95 backdrop-blur-sm border-slate-200/80 hover:border-[#6417ff]/25 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(100,23,255,0.05)]'
        : 'bg-[#161024] border-white/10 hover:border-[#6417ff]/40 hover:shadow-[0_20px_50px_-12px_rgba(100,23,255,0.25)] text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
    }`}>
      
      {/* Top Header Section */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Latest entries
            </h3>
            <p className={`text-xs font-semibold mt-0.5 ${
              isLight ? 'text-purple-700' : 'text-purple-300'
            }`}>
              {selectedDateFormatted}
            </p>
          </div>

          <button
            onClick={handleStartAdd}
            className="flex items-center space-x-1.5 bg-[#6417ff] hover:bg-[#5400e9] active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-md transition-all border border-white/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add meal</span>
          </button>
        </div>

        {/* Inline Add Form */}
        {isAddingInline && (
          <form
            onSubmit={handleSaveAdd}
            className={`p-4 rounded-2xl mb-4 animate-in fade-in slide-in-from-top-6 duration-700 ease-out space-y-3 shadow-lg border ${
              isLight
                ? 'bg-slate-100/90 border-slate-300'
                : 'bg-[#231a38] border-[#6417ff]/60'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <span className={`text-xs font-extrabold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Utensils className={`w-3.5 h-3.5 ${iconColorClass}`} />
                <span>Log New Meal</span>
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Meal Name (e.g. Chicken & Rice)"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-[#6417ff] ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
              }`}
              required
              autoFocus
            />

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Kcal</label>
                <input
                  type="number"
                  placeholder="450"
                  value={kcal}
                  onChange={(e) => setKcal(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Prot</label>
                <input
                  type="number"
                  placeholder="30"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Carb</label>
                <input
                  type="number"
                  placeholder="40"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Fat</label>
                <input
                  type="number"
                  placeholder="10"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={resetForm}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                  isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:text-white bg-white/5'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold text-white bg-[#6417ff] hover:bg-[#5400e9] active:scale-95 shadow-md border border-white/20"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </form>
        )}

        {/* List Container */}
        <div className={`space-y-3 max-h-[460px] overflow-y-auto pr-1 ${isLight ? 'custom-scrollbar-light' : 'custom-scrollbar'}`}>
          {entries.length === 0 && !isAddingInline ? (
            /* CLICKABLE EMPTY STATE BOX */
            <div
              onClick={handleStartAdd}
              className={`group text-center py-10 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm relative border p-6 animate-in fade-in duration-500 ${
                isLight
                  ? 'bg-slate-100/70 hover:bg-slate-200/60 border-slate-200/80 hover:border-[#6417ff]/25'
                  : 'bg-[#231a38] hover:bg-[#2d2248] border-white/10 hover:border-[#6417ff]/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#6417ff]/15 group-hover:bg-[#6417ff]/30 flex items-center justify-center mx-auto mb-3 transition-colors">
                <Plus className="w-6 h-6 text-[#6417ff] group-hover:scale-110 transition-transform stroke-[2.5]" />
              </div>
              <p className={`text-xs sm:text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                No meals logged for this date
              </p>
              <p className={`text-[11px] font-medium mt-1 transition-colors ${isLight ? 'text-purple-700 group-hover:text-[#6417ff]' : 'text-purple-300 group-hover:text-white'}`}>
                Tap here to log your meal intake now
              </p>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const entryId = entry.id || `entry-${idx}`;
              const isConfirmingDelete = deleteConfirmId === entryId;

              return (
                <div key={entryId} className="animate-in fade-in slide-in-from-top-4 duration-600 ease-out">
                  
                  {/* INLINE DELETE CONFIRMATION DIALOG */}
                  {isConfirmingDelete ? (
                    <div className={`p-4 rounded-2xl border border-rose-500/60 animate-in fade-in duration-300 space-y-3 ${
                      isLight ? 'bg-rose-50/90 text-rose-950' : 'bg-rose-950/40 text-rose-100'
                    }`}>
                      <div className="flex items-center space-x-2 text-rose-500 font-extrabold text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Delete "{entry.mealName}"?</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-300 dark:text-slate-300">
                        This action cannot be undone. Are you sure?
                      </p>
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(entryId)}
                          className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-rose-500 hover:bg-rose-600 active:scale-95 shadow-md transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ) : editingId === entryId ? (
                    /* Inline Edit Form */
                    <form
                      onSubmit={(e) => handleSaveEdit(entryId, e)}
                      className={`p-4 rounded-2xl space-y-3 shadow-md animate-in fade-in duration-300 border ${
                        isLight
                          ? 'bg-slate-100 border-[#6417ff]'
                          : 'bg-[#231a38] border-[#6417ff]'
                      }`}
                    >
                      <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={`text-xs font-extrabold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <Edit2 className={`w-3.5 h-3.5 ${iconColorClass}`} />
                          <span>Edit Meal Entry</span>
                        </span>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#6417ff] ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                        }`}
                        required
                      />
                      
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Kcal</label>
                          <input
                            type="number"
                            placeholder="Kcal"
                            value={kcal}
                            onChange={(e) => setKcal(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Prot</label>
                          <input
                            type="number"
                            placeholder="Prot"
                            value={protein}
                            onChange={(e) => setProtein(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Carb</label>
                          <input
                            type="number"
                            placeholder="Carb"
                            value={carbs}
                            onChange={(e) => setCarbs(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Fat</label>
                          <input
                            type="number"
                            placeholder="Fat"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Action Buttons Row with Red Delete Trigger */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(entryId)}
                          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/20 transition-all shadow-sm"
                          title="Delete meal entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={resetForm}
                            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                              isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:text-white bg-white/5'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold text-white bg-[#6417ff] hover:bg-[#5400e9] active:scale-95 shadow-md border border-white/20"
                          >
                            <Check className="w-4 h-4" />
                            <span>Update</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* Normal Meal Entry Card */
                    <div
                      onClick={() => handleStartEdit(entry)}
                      className={`group p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm relative border ${
                        isLight
                          ? 'bg-slate-100/70 hover:bg-slate-200/60 border-slate-200/80 hover:border-[#6417ff]/25'
                          : 'bg-[#231a38] hover:bg-[#2d2248] border-white/10 hover:border-[#6417ff]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`text-sm sm:text-base font-bold transition-colors ${
                            isLight ? 'text-slate-900 group-hover:text-[#6417ff]' : 'text-white group-hover:text-purple-300'
                          }`}>
                            {entry.mealName}
                          </h4>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider block mt-0.5 ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {entry.source || 'Manual Entry'}
                          </span>
                        </div>

                        {/* ALWAYS VISIBLE ON MOBILE TOUCH SCREENS */}
                        <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(entry);
                            }}
                            className={`p-1.5 sm:p-1 rounded-lg ${isLight ? 'hover:bg-slate-300 text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}
                            title="Edit meal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(entryId);
                            }}
                            className="p-1.5 sm:p-1 rounded-lg hover:bg-rose-500/20 text-rose-500 hover:text-rose-400"
                            title="Delete meal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Responsive Macro Boxes */}
                      <div className={`grid grid-cols-4 gap-1.5 sm:gap-2 mt-3.5 pt-3 border-t text-center ${
                        isLight ? 'border-slate-200/80' : 'border-white/10'
                      }`}>
                        <div className={`p-1.5 sm:p-2.5 rounded-xl border transition-colors min-w-0 flex flex-col items-center justify-center ${
                          isLight ? 'bg-white/90 border-slate-200 hover:border-[#6417ff]/25' : 'bg-[#161024] border-white/10 hover:border-[#6417ff]/40'
                        }`}>
                          <span className={`text-xs sm:text-sm lg:text-xs xl:text-sm font-black block truncate max-w-full ${isLight ? 'text-slate-900' : 'text-white'}`} title={`${entry.kcal} kcal`}>
                            {entry.kcal}
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 truncate max-w-full ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                            KCAL
                          </span>
                        </div>

                        <div className={`p-1.5 sm:p-2.5 rounded-xl border transition-colors min-w-0 flex flex-col items-center justify-center ${
                          isLight ? 'bg-white/90 border-slate-200 hover:border-[#6417ff]/25' : 'bg-[#161024] border-white/10 hover:border-[#6417ff]/40'
                        }`}>
                          <span className={`text-xs sm:text-sm lg:text-xs xl:text-sm font-black block truncate max-w-full ${isLight ? 'text-slate-900' : 'text-white'}`} title={`${entry.protein}g protein`}>
                            {entry.protein}g
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 truncate max-w-full ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                            PROTEIN
                          </span>
                        </div>

                        <div className={`p-1.5 sm:p-2.5 rounded-xl border transition-colors min-w-0 flex flex-col items-center justify-center ${
                          isLight ? 'bg-white/90 border-slate-200 hover:border-[#6417ff]/25' : 'bg-[#161024] border-white/10 hover:border-[#6417ff]/40'
                        }`}>
                          <span className={`text-xs sm:text-sm lg:text-xs xl:text-sm font-black block truncate max-w-full ${isLight ? 'text-slate-900' : 'text-white'}`} title={`${entry.carbs}g carbs`}>
                            {entry.carbs}g
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 truncate max-w-full ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                            CARBS
                          </span>
                        </div>

                        <div className={`p-1.5 sm:p-2.5 rounded-xl border transition-colors min-w-0 flex flex-col items-center justify-center ${
                          isLight ? 'bg-white/90 border-slate-200 hover:border-[#6417ff]/25' : 'bg-[#161024] border-white/10 hover:border-[#6417ff]/40'
                        }`}>
                          <span className={`text-xs sm:text-sm lg:text-xs xl:text-sm font-black block truncate max-w-full ${isLight ? 'text-slate-900' : 'text-white'}`} title={`${entry.fat}g fat`}>
                            {entry.fat}g
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block mt-0.5 truncate max-w-full ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                            FAT
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
