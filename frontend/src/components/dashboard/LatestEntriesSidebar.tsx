import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Utensils, X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MealEntry, CreateMealEntryPayload } from '../../types/nutrition';

interface LatestEntriesSidebarProps {
  entries: MealEntry[];
  onAddMeal: (payload: CreateMealEntryPayload) => void;
  onUpdateMeal: (id: string, payload: CreateMealEntryPayload) => void;
  onDeleteMeal: (entryId: string) => void;
  selectedDateFormatted: string;
  theme?: 'dark' | 'light';
  isLoading?: boolean;
}

export const LatestEntriesSidebar: React.FC<LatestEntriesSidebarProps> = ({
  entries,
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
  selectedDateFormatted,
  theme = 'dark',
  isLoading: _isLoading = false,
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

  const handleSubmitAdd = (e: React.FormEvent) => {
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

  const iconColorClass = isLight ? 'text-[#161024]' : 'text-white';

  return (
    <div className={`border-2 rounded-[32px] p-6 sm:p-8 flex flex-col transition-all duration-300 w-full box-border relative overflow-hidden ${
      isLight
        ? 'bg-white/95 backdrop-blur-sm border-slate-200/80 hover:border-[#6417ff]/25 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(100,23,255,0.05)]'
        : 'bg-[#161024] border-white/10 hover:border-[#6417ff]/40 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
    }`}>
      
      {/* Header with Title and Add Meal Button */}
      <div className={`flex items-center justify-between mb-4 pb-4 border-b ${
        isLight ? 'border-slate-200/80' : 'border-white/10'
      }`}>
        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Meal Intake
          </h3>
          <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
            {selectedDateFormatted}
          </p>
        </div>

        {/* Prominent Add Meal Button */}
        {!isAddingInline && !editingId && (
          <button
            onClick={handleStartAdd}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-2xl bg-[#6417ff] hover:bg-[#5400e9] text-white text-xs font-bold shadow-md shadow-[#6417ff]/25 active:scale-95 transition-all cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Meal</span>
          </button>
        )}
      </div>

      {/* Entries List Area */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar min-h-0 w-full box-border">
        <AnimatePresence mode="popLayout" initial={false}>
          
          {/* INLINE ADD FORM */}
          {isAddingInline && (
            <motion.form
              key="inline-add-form"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSubmitAdd}
              className={`p-4 rounded-2xl border space-y-3 shadow-lg ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-slate-200/50'
                  : 'bg-[#1e1435] border-[#6417ff]/40 text-white shadow-black/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6417ff] uppercase tracking-wider flex items-center space-x-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Log New Meal</span>
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`p-1 rounded-lg transition-colors ${
                    isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-slate-400'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Meal Name Input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Meal / Food Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grilled Chicken Salad"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#6417ff] ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                  }`}
                  required
                  autoFocus
                />
              </div>

              {/* 4 Macro Inputs in Responsive Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Kcal</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="450"
                    value={kcal}
                    onChange={(e) => setKcal(e.target.value)}
                    className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                    }`}
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Prot</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="30"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                    }`}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Carb</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="40"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                    }`}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Fat</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="10"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                    }`}
                    autoComplete="off"
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
            </motion.form>
          )}

          {/* EMPTY STATE OR MEAL ENTRIES */}
          {entries.length === 0 && !isAddingInline ? (
            /* CLICKABLE EMPTY STATE BOX */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleStartAdd}
              className={`group text-center py-10 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm relative border p-6 w-full box-border ${
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
            </motion.div>
          ) : (
            entries.map((entry) => {
              const isEditing = editingId === entry.id;
              const isDeletingConfirm = deleteConfirmId === entry.id;

              return (
                <motion.div
                  key={entry.id || entry.mealName}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    layout: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.22 },
                    scale: { duration: 0.22 },
                    y: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className="w-full box-border"
                >
                  {isDeletingConfirm ? (
                    /* IN-PLACE MORPHED DELETE CONFIRMATION DIALOG (HOMOLOGATED 1:1 GEOMETRY) */
                    <div
                      className={`p-4 sm:p-5 rounded-2xl space-y-3 border overflow-hidden w-full box-border shadow-md ${
                        isLight
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-rose-500">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-bold">Delete "{entry.mealName}"?</span>
                      </div>
                      <p className="text-xs text-slate-400">This action cannot be undone.</p>
                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={resetForm}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(entry.id!)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  ) : isEditing ? (
                    /* IN-PLACE MORPHED EDIT FORM (HOMOLOGATED 1:1 GEOMETRY) */
                    <form
                      onSubmit={(e) => handleSaveEdit(entry.id!, e)}
                      className={`p-4 sm:p-5 rounded-2xl space-y-3 border overflow-hidden w-full box-border shadow-md ${
                        isLight
                          ? 'bg-slate-100 border-[#6417ff]/40 text-slate-900'
                          : 'bg-[#231a38] border-[#6417ff] text-white'
                      }`}
                    >
                      <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <Edit2 className={`w-3.5 h-3.5 ${iconColorClass}`} />
                          <span>Edit Meal</span>
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
                        className={`w-full border rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#6417ff] ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                        }`}
                        required
                      />

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Kcal</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={kcal}
                            onChange={(e) => setKcal(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Prot</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={protein}
                            onChange={(e) => setProtein(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Carb</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={carbs}
                            onChange={(e) => setCarbs(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Fat</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#6417ff] ${
                              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161024] border-white/15 text-white'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      {/* Actions inside Edit Box */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingId(null);
                            setDeleteConfirmId(entry.id!);
                          }}
                          className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center space-x-1 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={resetForm}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:text-white bg-white/5'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-[#6417ff] hover:bg-[#5400e9] shadow-md border border-white/20"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* NORMAL MEAL ENTRY CARD (HOMOLOGATED 1:1 GEOMETRY) */
                    <div
                      className={`group p-4 sm:p-5 rounded-2xl relative border overflow-hidden w-full box-border ${
                        isLight
                          ? 'bg-slate-100/80 hover:bg-slate-200/70 border-slate-200/90 text-slate-900 shadow-sm'
                          : 'bg-[#231a38] hover:bg-[#2d2248] border-white/10 text-white shadow-md'
                      }`}
                    >
                      {/* Header line: Title, Source & Action Icons */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className={`text-sm sm:text-base font-bold transition-colors ${
                            isLight ? 'text-slate-900 group-hover:text-[#6417ff]' : 'text-white group-hover:text-purple-200'
                          }`}>
                            {entry.mealName}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {entry.source || 'Manual'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            title="Edit Meal Entry"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isLight ? 'hover:bg-slate-300/60 text-slate-600' : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(entry.id!);
                            }}
                            title="Delete Meal Entry"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isLight ? 'hover:bg-rose-100 text-rose-500' : 'hover:bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Macro Grid */}
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className={`p-2 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#161024] border-white/5'
                        }`}>
                          <div className={`text-xs sm:text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {entry.kcal}
                          </div>
                          <div className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${
                            isLight ? 'text-purple-700' : 'text-purple-300'
                          }`}>
                            Kcal
                          </div>
                        </div>

                        <div className={`p-2 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#161024] border-white/5'
                        }`}>
                          <div className={`text-xs sm:text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {entry.protein}
                          </div>
                          <div className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${
                            isLight ? 'text-purple-700' : 'text-purple-300'
                          }`}>
                            Prot
                          </div>
                        </div>

                        <div className={`p-2 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#161024] border-white/5'
                        }`}>
                          <div className={`text-xs sm:text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {entry.carbs}
                          </div>
                          <div className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${
                            isLight ? 'text-purple-700' : 'text-purple-300'
                          }`}>
                            Carbs
                          </div>
                        </div>

                        <div className={`p-2 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#161024] border-white/5'
                        }`}>
                          <div className={`text-xs sm:text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {entry.fat}
                          </div>
                          <div className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${
                            isLight ? 'text-purple-700' : 'text-purple-300'
                          }`}>
                            Fat
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
