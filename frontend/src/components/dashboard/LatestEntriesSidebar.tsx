import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Utensils, X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MealEntry, CreateMealEntryPayload } from '../../types/nutrition';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';

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
  isLoading = false,
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
    setEditingId(null);
    setDeleteConfirmId(null);
    setMealName('');
    setKcal('');
    setProtein('');
    setCarbs('');
    setFat('');
    setIsAddingInline(true);
  };

  const handleStartEdit = (entry: MealEntry) => {
    setIsAddingInline(false);
    setDeleteConfirmId(null);
    setEditingId(entry.id || null);
    setMealName(entry.mealName);
    setKcal(String(entry.kcal || ''));
    setProtein(String(entry.protein || ''));
    setCarbs(String(entry.carbs || ''));
    setFat(String(entry.fat || ''));
  };

  const handlePromptDelete = (id: string) => {
    setIsAddingInline(false);
    setEditingId(null);
    setDeleteConfirmId(id);
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
      source: 'MANUAL',
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
      source: 'MANUAL',
    });

    resetForm();
  };

  const handleConfirmDelete = (id: string) => {
    onDeleteMeal(id);
    resetForm();
  };

  const iconColorClass = isLight ? 'text-slate-900' : 'text-white';

  return (
    <div className={`border rounded-[32px] p-6 sm:p-8 flex flex-col transition-all duration-300 w-full lg:h-full max-h-[500px] lg:max-h-none box-border relative overflow-hidden ${isLoading ? 'opacity-90' : ''} ${
      isLight
        ? 'bg-white/95 backdrop-blur-xs border-slate-200/80 hover:border-slate-300 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
        : 'bg-[#121214] border-white/[0.08] hover:border-white/[0.16] text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
    }`}>
      
      {/* Header with Title and Add Meal Button */}
      <div className={`flex items-center justify-between mb-4 pb-4 border-b shrink-0 ${
        isLight ? 'border-slate-200/80' : 'border-white/[0.08]'
      }`}>
        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Meal Intake
          </h3>
          <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            {selectedDateFormatted}
          </p>
        </div>

        {/* Add Meal Button */}
        {!isAddingInline && !editingId && (
          <button
            type="button"
            onClick={handleStartAdd}
            className={`flex items-center space-x-1 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs ${
              isLight
                ? 'bg-black hover:bg-zinc-800 text-white shadow-xs'
                : 'bg-white hover:bg-zinc-200 text-black font-extrabold'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Meal</span>
          </button>
        )}
      </div>

      {/* ADD FORM — outside scroll region so it cannot be clipped to height 0 */}
      <AnimatePresence initial={false}>
        {isAddingInline && (
          <motion.form
            key="inline-add-form"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmitAdd}
            className={`mb-4 shrink-0 p-4 rounded-2xl border space-y-3 shadow-lg ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-slate-200/50'
                : 'bg-[#18181b] border-white/[0.12] text-white shadow-black/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                isLight ? 'text-slate-900' : 'text-zinc-200'
              }`}>
                <Utensils className="w-3.5 h-3.5" />
                <span>Log New Meal</span>
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Meal description (e.g. Salmon & Brown Rice)"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none ${
                isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
              }`}
              required
              autoFocus
            />

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className={`text-[10px] sm:text-xs font-black uppercase block mb-1 ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>Kcal</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="350"
                  value={kcal}
                  onChange={(e) => setKcal(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-xs sm:text-sm font-bold focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                  }`}
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className={`text-[10px] sm:text-xs font-black uppercase block mb-1 ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
                  {MACRO_COLORS.protein.shortLabel}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="30"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-xs sm:text-sm font-bold focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                  }`}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className={`text-[10px] sm:text-xs font-black uppercase block mb-1 ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
                  {MACRO_COLORS.carbs.shortLabel}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="40"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-xs sm:text-sm font-bold focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                  }`}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className={`text-[10px] sm:text-xs font-black uppercase block mb-1 ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
                  {MACRO_COLORS.fat.shortLabel}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="10"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-xs sm:text-sm font-bold focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                  }`}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={resetForm}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                  isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-zinc-400 hover:text-white bg-white/5'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold active:scale-95 shadow-xs cursor-pointer ${
                  isLight
                    ? 'text-white bg-black hover:bg-zinc-800'
                    : 'text-black bg-white hover:bg-zinc-200'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Meal cards — internal scroll, hidden scrollbar (class must not hide the element) */}
      <div
        className="space-y-3 flex-1 overflow-y-auto pr-0 sm:pr-1 no-scrollbar min-h-0 w-full box-border"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <AnimatePresence initial={false}>
          
          {/* EMPTY STATE OR MEAL ENTRIES */}
          {entries.length === 0 && !isAddingInline ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleStartAdd}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStartAdd();
                }
              }}
              role="button"
              tabIndex={0}
              className={`group text-center py-10 sm:py-12 px-6 rounded-2xl transition-all duration-200 cursor-pointer shadow-xs relative border-2 border-dashed w-full box-border min-h-[160px] sm:min-h-[180px] flex flex-col items-center justify-center focus:outline-none focus:ring-2 ${
                isLight
                  ? 'bg-slate-100/60 hover:bg-slate-100 border-slate-300 hover:border-slate-400 focus:ring-slate-400'
                  : 'bg-[#18181b]/50 hover:bg-[#18181b] border-white/15 hover:border-white/30 focus:ring-white/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 ${
                isLight
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-white/10 text-white group-hover:bg-white/20'
              }`}>
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className={`text-xs sm:text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                No meals logged for this date
              </p>
              <p className={`text-[11px] sm:text-xs font-medium mt-1 transition-colors ${
                isLight ? 'text-slate-600 group-hover:text-slate-900' : 'text-zinc-400 group-hover:text-zinc-200'
              }`}>
                Tap here to log your meal intake now
              </p>
            </motion.div>
          ) : (
            [...entries]
              .sort((a, b) => {
                const timeA = a.createdOn ? new Date(a.createdOn).getTime() : 0;
                const timeB = b.createdOn ? new Date(b.createdOn).getTime() : 0;
                return timeB - timeA;
              })
              .map((entry) => {
              const isEditing = editingId === entry.id;
              const isDeletingConfirm = deleteConfirmId === entry.id;

              return (
                <motion.div
                  key={entry.id || entry.mealName}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="w-full box-border"
                >
                  {isDeletingConfirm ? (
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
                      <p className="text-xs text-zinc-400">This action cannot be undone.</p>
                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={resetForm}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-zinc-200'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(entry.id!)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-all cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  ) : isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveEdit(entry.id!, e)}
                      className={`p-4 sm:p-5 rounded-2xl space-y-3 border overflow-hidden w-full box-border shadow-md ${
                        isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-[#18181b] border-white/[0.12] text-white'
                      }`}
                    >
                      <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
                        <span className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <Edit2 className={`w-3.5 h-3.5 ${iconColorClass}`} />
                          <span>Edit Meal</span>
                        </span>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-zinc-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none ${
                          isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                        }`}
                        required
                      />

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className={`text-[10px] sm:text-xs font-black uppercase block mb-1 ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>Kcal</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={kcal}
                            onChange={(e) => setKcal(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs sm:text-sm font-bold focus:outline-none ${
                              isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] sm:text-xs font-black uppercase block mb-1 ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
                            {MACRO_COLORS.protein.shortLabel}
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={protein}
                            onChange={(e) => setProtein(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs sm:text-sm font-bold focus:outline-none ${
                              isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] sm:text-xs font-black uppercase block mb-1 ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
                            {MACRO_COLORS.carbs.shortLabel}
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={carbs}
                            onChange={(e) => setCarbs(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs sm:text-sm font-bold focus:outline-none ${
                              isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className={`text-[10px] sm:text-xs font-black uppercase block mb-1 ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
                            {MACRO_COLORS.fat.shortLabel}
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs sm:text-sm font-bold focus:outline-none ${
                              isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                            }`}
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={resetForm}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-zinc-400 hover:text-white bg-white/5'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer ${
                            isLight
                              ? 'text-white bg-black hover:bg-zinc-800'
                              : 'text-black bg-white hover:bg-zinc-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* NORMAL MEAL CARD DISPLAY */
                    <div
                      className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 shadow-xs border relative group w-full box-border ${
                        isLight
                          ? 'bg-slate-100/70 hover:bg-slate-200/60 border-slate-200/80 hover:border-slate-300'
                          : 'bg-[#18181b] hover:bg-[#202024] border-white/[0.08] hover:border-white/[0.16]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 pr-2 flex-1">
                          <h4 className={`text-sm sm:text-base font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {entry.mealName}
                          </h4>
                          {entry.source && (
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mt-0.5">
                              {entry.source === 'AI_PARSER' ? 'AI Logged' : 'Manual'}
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(entry)}
                            className={`p-2 rounded-xl transition-all active:scale-95 min-w-[32px] min-h-[32px] flex items-center justify-center ${
                              isLight
                                ? 'hover:bg-slate-200 text-slate-700'
                                : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                            }`}
                            title="Edit meal"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePromptDelete(entry.id!)}
                            className={`p-2 rounded-xl transition-all active:scale-95 min-w-[32px] min-h-[32px] flex items-center justify-center ${
                              isLight
                                ? 'hover:bg-rose-100 text-rose-600'
                                : 'hover:bg-rose-500/20 text-rose-400'
                            }`}
                            title="Delete meal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 4 Macro Chips */}
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#121214] border-white/[0.06]'
                        }`}>
                          <div className={`text-xs sm:text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {formatCompactNumber(entry.kcal)}
                          </div>
                          <div className={`text-[10px] sm:text-xs font-black tracking-wider uppercase mt-0.5 ${
                            isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text
                          }`}>
                            Kcal
                          </div>
                        </div>

                        <div className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#121214] border-white/[0.06]'
                        }`}>
                          <div className={`text-xs sm:text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {formatCompactNumber(entry.protein)}g
                          </div>
                          <div className={`text-[10px] sm:text-xs font-black tracking-wider uppercase mt-0.5 ${
                            isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text
                          }`}>
                            {MACRO_COLORS.protein.shortLabel}
                          </div>
                        </div>

                        <div className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#121214] border-white/[0.06]'
                        }`}>
                          <div className={`text-xs sm:text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {formatCompactNumber(entry.carbs)}g
                          </div>
                          <div className={`text-[10px] sm:text-xs font-black tracking-wider uppercase mt-0.5 ${
                            isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text
                          }`}>
                            {MACRO_COLORS.carbs.shortLabel}
                          </div>
                        </div>

                        <div className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#121214] border-white/[0.06]'
                        }`}>
                          <div className={`text-xs sm:text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {formatCompactNumber(entry.fat)}g
                          </div>
                          <div className={`text-[10px] sm:text-xs font-black tracking-wider uppercase mt-0.5 ${
                            isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text
                          }`}>
                            {MACRO_COLORS.fat.shortLabel}
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
