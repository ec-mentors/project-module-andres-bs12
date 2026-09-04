import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, AlertTriangle, Star, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MealEntry, CreateMealEntryPayload } from '../../types/nutrition';
import type { FavoriteMeal, CreateFavoriteMealPayload } from '../../types/favoriteMeal';
import { MACRO_COLORS, formatCompactNumber } from '../../utils/macroTokens';
import { ManageFavoritesModal } from '../chat/ManageFavoritesModal';
import { getCurrentTimeMealType, favoritesTypography, TOUCH_TARGET_MIN } from '../chat/favorites';

interface LatestEntriesSidebarProps {
  userId: string;
  entries: MealEntry[];
  favorites?: FavoriteMeal[];
  onAddMeal: (payload: CreateMealEntryPayload) => void;
  onUpdateMeal: (id: string, payload: CreateMealEntryPayload) => void;
  onDeleteMeal: (entryId: string) => void;
  onAddFavorite?: (payload: CreateFavoriteMealPayload) => void;
  onUpdateFavorite?: (id: string, payload: CreateFavoriteMealPayload) => void;
  onDeleteFavorite?: (id: string) => void;
  selectedDateFormatted: string;
  theme?: 'dark' | 'light';
  isLoading?: boolean;
}

export const LatestEntriesSidebar: React.FC<LatestEntriesSidebarProps> = ({
  userId,
  entries,
  favorites = [],
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
  onAddFavorite = () => {},
  onUpdateFavorite = () => {},
  onDeleteFavorite = () => {},
  selectedDateFormatted,
  theme = 'dark',
  isLoading = false,
}) => {
  const isLight = theme === 'light';
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [unfavoriteConfirm, setUnfavoriteConfirm] = useState<FavoriteMeal | null>(null);
  const [favoriteUpdatePrompt, setFavoriteUpdatePrompt] = useState<{
    id: string;
    matchedFavorite: FavoriteMeal;
    payload: CreateMealEntryPayload;
  } | null>(null);

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
    setFavoriteUpdatePrompt(null);
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setDeleteConfirmId(null);
    setFavoriteUpdatePrompt(null);
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
    setFavoriteUpdatePrompt(null);
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
    setFavoriteUpdatePrompt(null);
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

    const payload: CreateMealEntryPayload = {
      mealName: mealName.trim(),
      kcal: Number(kcal) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      source: 'MANUAL',
    };

    const editingEntry = entries.find((entry) => entry.id === id);
    const matchedFavorite = favorites.find(
      (f) => f.mealName.trim().toLowerCase() === editingEntry?.mealName.trim().toLowerCase()
    );

    // Check if the user modified any macro or name
    const isModified =
      editingEntry &&
      (mealName.trim() !== editingEntry.mealName.trim() ||
        Number(kcal) !== Number(editingEntry.kcal) ||
        Number(protein) !== Number(editingEntry.protein) ||
        Number(carbs) !== Number(editingEntry.carbs) ||
        Number(fat) !== Number(editingEntry.fat));

    if (matchedFavorite && isModified) {
      setFavoriteUpdatePrompt({
        id,
        matchedFavorite,
        payload,
      });
      return;
    }

    onUpdateMeal(id, payload);
    resetForm();
  };

  const executeSaveEditWithFavorite = (updateFavoriteToo: boolean) => {
    if (!favoriteUpdatePrompt) return;
    const { id, matchedFavorite, payload } = favoriteUpdatePrompt;

    if (updateFavoriteToo && onUpdateFavorite) {
      onUpdateFavorite(matchedFavorite.id, {
        mealName: payload.mealName,
        kcal: payload.kcal,
        protein: payload.protein,
        carbs: payload.carbs,
        fat: payload.fat,
        mealType: matchedFavorite.mealType,
      });
    }

    onUpdateMeal(id, payload);
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

        {/* Add Meal & Favorites Buttons */}
        {!isAddingInline && !editingId && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsFavoritesModalOpen(true)}
              className={`p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center min-h-[44px] min-w-[44px] ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-amber-600 shadow-2xs'
                  : 'bg-white/5 hover:bg-white/10 border-white/[0.08] text-amber-400 shadow-2xs'
              }`}
              title="Manage & Import Favorites"
              aria-label="Manage & Import Favorites"
            >
              <Star className="w-4 h-4 fill-amber-500/30 text-amber-500" />
            </button>

            <button
              type="button"
              onClick={handleStartAdd}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-2xl ${favoritesTypography.buttonText} transition-all active:scale-95 cursor-pointer shadow-xs ${TOUCH_TARGET_MIN} ${
                isLight
                  ? 'bg-black hover:bg-zinc-800 text-white shadow-xs'
                  : 'bg-white hover:bg-zinc-200 text-black font-extrabold'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Meal</span>
            </button>
          </div>
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
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                New Meal Entry
              </span>

              <button
                type="button"
                onClick={resetForm}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Import from Favorites — secondary action, single-line */}
            <button
              type="button"
              onClick={() => setIsFavoritesModalOpen(true)}
              className={`w-full py-2.5 px-4 rounded-xl ${favoritesTypography.buttonText} transition-all flex items-center justify-center gap-2 border cursor-pointer active:scale-[0.99] group ${TOUCH_TARGET_MIN} ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900 shadow-2xs'
                  : 'bg-[#141416] hover:bg-[#1a1a1e] border-white/[0.1] text-white shadow-2xs'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/30 shrink-0" />
              <span className="whitespace-nowrap">
                <span className="sm:hidden">Import Favorites</span>
                <span className="hidden sm:inline">Import from Favorites</span>
              </span>
              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`} />
              <span className={`flex-shrink mx-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                or enter manually
              </span>
              <div className={`flex-grow border-t ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`} />
            </div>

            {/* MANUAL ENTRY INPUTS */}
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
                <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>Kcal</label>
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
                <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
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
                <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
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
                <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
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
                disabled={!mealName.trim()}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold active:scale-95 shadow-xs transition-all ${
                  !mealName.trim()
                    ? 'opacity-40 cursor-not-allowed bg-zinc-700 text-zinc-400'
                    : isLight
                    ? 'text-white bg-black hover:bg-zinc-800 cursor-pointer'
                    : 'text-black bg-white hover:bg-zinc-200 cursor-pointer'
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
              const matchedFav = favorites.find(
                (fav) => fav.mealName.trim().toLowerCase() === entry.mealName.trim().toLowerCase()
              );
              const isFav = !!matchedFav;

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
                          <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>Kcal</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={kcal}
                            onChange={(e) => setKcal(e.target.value)}
                            className={`w-full border rounded-xl px-2 py-1.5 text-xs sm:text-sm font-bold focus:outline-none ${
                              isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-slate-500' : 'bg-[#121214] border-white/[0.12] text-white focus:border-white/30'
                            }`}
                            required
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
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
                          <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
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
                          <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
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

                        {/* Favorite, Edit & Delete Action Buttons */}
                        <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (isFav && matchedFav) {
                                setUnfavoriteConfirm(matchedFav);
                              } else {
                                onAddFavorite?.({
                                  mealName: entry.mealName,
                                  kcal: entry.kcal,
                                  protein: entry.protein,
                                  carbs: entry.carbs,
                                  fat: entry.fat,
                                  mealType: getCurrentTimeMealType(),
                                });
                              }
                            }}
                            className={`relative group/favstar p-2 rounded-xl transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer ${
                              isFav
                                ? 'text-amber-500 hover:bg-amber-500/10'
                                : isLight
                                ? 'hover:bg-slate-200 text-slate-400 hover:text-amber-500'
                                : 'hover:bg-white/10 text-zinc-500 hover:text-amber-400'
                            }`}
                            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : 'stroke-[2]'}`} />
                            {!isFav && (
                              <span
                                className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap text-[10px] font-medium tracking-tight opacity-0 group-hover/favstar:opacity-100 transition-opacity duration-150 z-20 ${
                                  isLight ? 'text-slate-500' : 'text-zinc-400'
                                }`}
                              >
                                Add to favorites
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(entry)}
                            className={`p-2 rounded-xl transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer ${
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
                            className={`p-2 rounded-xl transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer ${
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
                          <div className={`${favoritesTypography.macroValue} ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {formatCompactNumber(entry.kcal)}
                          </div>
                          <div className={`${favoritesTypography.macroLabel} mt-0.5 ${
                            isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text
                          }`}>
                            Kcal
                          </div>
                        </div>

                        <div className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#121214] border-white/[0.06]'
                        }`}>
                          <div className={`${favoritesTypography.macroValue} ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {formatCompactNumber(entry.protein)}g
                          </div>
                          <div className={`${favoritesTypography.macroLabel} mt-0.5 ${
                            isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text
                          }`}>
                            {MACRO_COLORS.protein.shortLabel}
                          </div>
                        </div>

                        <div className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#121214] border-white/[0.06]'
                        }`}>
                          <div className={`${favoritesTypography.macroValue} ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {formatCompactNumber(entry.carbs)}g
                          </div>
                          <div className={`${favoritesTypography.macroLabel} mt-0.5 ${
                            isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text
                          }`}>
                            {MACRO_COLORS.carbs.shortLabel}
                          </div>
                        </div>

                        <div className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                          isLight ? 'bg-white border-slate-200/80' : 'bg-[#121214] border-white/[0.06]'
                        }`}>
                          <div className={`${favoritesTypography.macroValue} ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {formatCompactNumber(entry.fat)}g
                          </div>
                          <div className={`${favoritesTypography.macroLabel} mt-0.5 ${
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

      {/* Manage/Log Favorites Modal (Exact same modal from Settings with help text and + New Favorite) */}
      <ManageFavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        userId={userId}
        favorites={favorites}
        onAddFavorite={onAddFavorite}
        onUpdateFavorite={onUpdateFavorite}
        onDeleteFavorite={onDeleteFavorite}
        onLogMeal={(payload) => {
          onAddMeal(payload);
          resetForm();
          setIsFavoritesModalOpen(false);
        }}
        theme={theme}
      />

      {/* Unfavorite Confirmation Pop-up Modal */}
      {unfavoriteConfirm && (
        <div
          onClick={() => setUnfavoriteConfirm(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`p-6 rounded-[28px] max-w-sm w-full border shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
                : 'bg-[#121214] border-white/[0.12] text-white shadow-black/80'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold">Remove from Favorites?</h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Are you sure you want to remove <span className="font-bold text-amber-500">"{unfavoriteConfirm.mealName}"</span> from your saved favorite meals?
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setUnfavoriteConfirm(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/15 text-zinc-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteFavorite?.(unfavoriteConfirm.id);
                  setUnfavoriteConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-rose-500 hover:bg-rose-600 text-white transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Favorite Update Decision Pop-up Modal (When modifying a favorite entry) */}
      {favoriteUpdatePrompt && (
        <div
          onClick={() => setFavoriteUpdatePrompt(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`p-6 rounded-[28px] max-w-sm w-full border shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
                : 'bg-[#121214] border-white/[0.12] text-white shadow-black/80'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold">Update Favorite Preset?</h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                You modified <span className="font-bold text-amber-500">"{favoriteUpdatePrompt.matchedFavorite.mealName}"</span>. How would you like to apply these changes?
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-left">
              {/* Option 1: Update today's entry only */}
              <button
                type="button"
                onClick={() => executeSaveEditWithFavorite(false)}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center space-x-3.5 active:scale-98 cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                    : 'bg-[#18181b] hover:bg-[#202024] border-white/[0.08] text-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-extrabold tracking-tight">Save for Today Only</h4>
                  <p className={`text-xs mt-0.5 leading-snug ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Updates today's meal entry ({favoriteUpdatePrompt.payload.kcal} kcal). Favorite preset remains unchanged.
                  </p>
                </div>
              </button>

              {/* Option 2: Update favorite preset too */}
              <button
                type="button"
                onClick={() => executeSaveEditWithFavorite(true)}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center space-x-3.5 active:scale-98 cursor-pointer ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-slate-900'
                    : 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-white'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                  <Star className="w-5 h-5 fill-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-extrabold tracking-tight text-amber-500">Update Favorite Preset Too</h4>
                  <p className={`text-xs mt-0.5 leading-snug ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                    Updates both today's intake and your saved favorite recipe template.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setFavoriteUpdatePrompt(null)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
