import React, { useState } from 'react';
import { Check, Edit2, Trash2, Sparkles, CheckCircle2, Loader2, X, Star } from 'lucide-react';
import { MACRO_COLORS } from '../../utils/macroTokens';
import { favoritesTypography } from './favorites';
import type { FavoriteMeal, CreateFavoriteMealPayload } from '../../types/favoriteMeal';

export interface MealDraftData {
  id: string;
  mealName: string;
  kcal: number;
  carbs: number;
  fat: number;
  protein: number;
  confidenceNote?: string;
  isSaved?: boolean;
  source?: string;
}

interface MealDraftCardProps {
  draft: MealDraftData;
  onSave: (data: Omit<MealDraftData, 'id' | 'isSaved'>, isFavorite?: boolean) => Promise<void>;
  onDiscard: (id: string) => void;
  isFavorite?: boolean;
  favoriteItem?: FavoriteMeal | null;
  onToggleFavorite?: () => void;
  onUpdateFavorite?: (id: string, data: CreateFavoriteMealPayload) => void;
  theme?: 'dark' | 'light';
}

export const MealDraftCard: React.FC<MealDraftCardProps> = ({
  draft,
  onSave,
  onDiscard,
  isFavorite = false,
  favoriteItem = null,
  onToggleFavorite,
  onUpdateFavorite,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFavoriteMeal, setIsFavoriteMeal] = useState(isFavorite);
  const [showUnfavoriteConfirm, setShowUnfavoriteConfirm] = useState(false);
  const [showFavoriteUpdatePrompt, setShowFavoriteUpdatePrompt] = useState(false);

  const [prevIsFavorite, setPrevIsFavorite] = useState(isFavorite);
  if (prevIsFavorite !== isFavorite) {
    setPrevIsFavorite(isFavorite);
    setIsFavoriteMeal(isFavorite);
  }

  // Local editable state using strings to prevent stuck '0' on backspace
  const [mealName, setMealName] = useState(draft.mealName);
  const [kcalInput, setKcalInput] = useState(String(draft.kcal ?? ''));
  const [proteinInput, setProteinInput] = useState(String(draft.protein ?? ''));
  const [carbsInput, setCarbsInput] = useState(String(draft.carbs ?? ''));
  const [fatInput, setFatInput] = useState(String(draft.fat ?? ''));

  const isFavActive = isFavoriteMeal;

  const hasModifiedValues =
    mealName.trim() !== (draft.mealName || '').trim() ||
    Number(kcalInput) !== (draft.kcal ?? 0) ||
    Number(proteinInput) !== (draft.protein ?? 0) ||
    Number(carbsInput) !== (draft.carbs ?? 0) ||
    Number(fatInput) !== (draft.fat ?? 0);

  const handleSaveClick = async () => {
    if (draft.isSaved || isSaving) return;

    // If it's an existing favorite AND the user modified values, ask how they want to save!
    if (isFavActive && (favoriteItem || draft.source === 'FAVORITE') && hasModifiedValues) {
      setShowFavoriteUpdatePrompt(true);
      return;
    }

    await executeSave(false);
  };

  const executeSave = async (updateFavoriteToo: boolean) => {
    setIsSaving(true);
    const payload = {
      mealName: mealName.trim() || 'Meal Entry',
      kcal: Number(kcalInput) || 0,
      protein: Number(proteinInput) || 0,
      carbs: Number(carbsInput) || 0,
      fat: Number(fatInput) || 0,
      source: isFavActive ? 'FAVORITE' : (draft.source || 'AI_PARSER'),
    };

    try {
      if (updateFavoriteToo && favoriteItem && onUpdateFavorite) {
        onUpdateFavorite(favoriteItem.id, {
          mealName: payload.mealName,
          kcal: payload.kcal,
          protein: payload.protein,
          carbs: payload.carbs,
          fat: payload.fat,
          mealType: favoriteItem.mealType,
        });
      }
      await onSave(payload, isFavActive);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
      setShowFavoriteUpdatePrompt(false);
    }
  };

  const handleFavoriteClick = () => {
    if (isFavActive) {
      setShowUnfavoriteConfirm(true);
    } else {
      setIsFavoriteMeal(true);
      onToggleFavorite?.();
    }
  };

  const cardBg = isLight
    ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
    : 'bg-[#121214] border-white/[0.08] text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)]';

  const pillBg = isLight
    ? 'bg-slate-100/90 border-slate-200/90 text-slate-900'
    : 'bg-[#18181b] border-white/[0.08] text-white';

  const inputBg = isLight
    ? 'bg-slate-100 border-slate-300 text-slate-900 focus:bg-white'
    : 'bg-[#18181b] border-white/[0.12] text-white focus:bg-[#202024] focus:border-white/30';

  return (
    <div className={`w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all duration-300 relative ${cardBg}`}>
      
      {/* HEADER ROW */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
            isLight ? 'bg-slate-100 border border-slate-200 text-slate-900' : 'bg-white/10 border border-white/15 text-white'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
          
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="Meal Name"
                className={`text-sm sm:text-base font-bold px-2.5 py-1 rounded-xl border w-full focus:outline-none focus:ring-2 ${
                  isLight ? 'focus:ring-slate-400' : 'focus:ring-white/20'
                } ${inputBg}`}
              />
            ) : (
              <h4 className={`text-sm sm:text-base font-extrabold tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {mealName}
              </h4>
            )}

            {/* Subtitle */}
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-400'}`}>
                {draft.isSaved ? 'Recorded Entry' : 'Estimated Intake'}
              </span>
            </div>
          </div>
        </div>

        {/* FAVORITE STAR BUTTON IN TOP-RIGHT (Replaces Kcal badge) */}
        {!isEditing && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`relative group/favstar p-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer shrink-0 flex items-center justify-center ${
              isFavActive
                ? isLight
                  ? 'bg-amber-50 border-amber-300/80 text-amber-500 shadow-xs'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-xs'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400 hover:text-amber-500'
                : 'bg-white/5 hover:bg-white/10 border-white/[0.08] text-zinc-500 hover:text-amber-400'
            }`}
            aria-label={isFavActive ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavActive ? 'fill-amber-500 text-amber-500' : 'stroke-[2]'}`} />
            {!isFavActive && (
              <span
                className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap text-[10px] font-medium tracking-tight opacity-0 group-hover/favstar:opacity-100 transition-opacity duration-150 z-20 ${
                  isLight ? 'text-slate-500' : 'text-zinc-400'
                }`}
              >
                Add to favorites
              </span>
            )}
          </button>
        )}
      </div>

      {/* 4-MACRO GRID */}
      {isEditing ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2">
          <div>
            <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>Kcal</label>
            <input
              type="number"
              value={kcalInput}
              onChange={(e) => setKcalInput(e.target.value)}
              placeholder="0"
              className={`w-full text-xs font-bold px-2.5 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                isLight ? 'focus:ring-slate-400' : 'focus:ring-white/20'
              } ${inputBg}`}
            />
          </div>
          <div>
            <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
              Protein (g)
            </label>
            <input
              type="number"
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              placeholder="0"
              className={`w-full text-xs font-bold px-2.5 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                isLight ? 'focus:ring-slate-400' : 'focus:ring-white/20'
              } ${inputBg}`}
            />
          </div>
          <div>
            <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
              Carbs (g)
            </label>
            <input
              type="number"
              value={carbsInput}
              onChange={(e) => setCarbsInput(e.target.value)}
              placeholder="0"
              className={`w-full text-xs font-bold px-2.5 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                isLight ? 'focus:ring-slate-400' : 'focus:ring-white/20'
              } ${inputBg}`}
            />
          </div>
          <div>
            <label className={`${favoritesTypography.macroLabel} block mb-1 ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
              Fat (g)
            </label>
            <input
              type="number"
              value={fatInput}
              onChange={(e) => setFatInput(e.target.value)}
              placeholder="0"
              className={`w-full text-xs font-bold px-2.5 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                isLight ? 'focus:ring-slate-400' : 'focus:ring-white/20'
              } ${inputBg}`}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center ${pillBg}`}>
            <span className={`${favoritesTypography.macroValue} block ${isLight ? 'text-slate-900' : 'text-white'}`}>{Number(kcalInput) || 0}</span>
            <span className={`${favoritesTypography.macroLabel} ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>Kcal</span>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center ${pillBg}`}>
            <span className={`${favoritesTypography.macroValue} block ${isLight ? 'text-slate-900' : 'text-white'}`}>{Number(proteinInput) || 0}g</span>
            <span className={`${favoritesTypography.macroLabel} ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
              {MACRO_COLORS.protein.label}
            </span>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center ${pillBg}`}>
            <span className={`${favoritesTypography.macroValue} block ${isLight ? 'text-slate-900' : 'text-white'}`}>{Number(carbsInput) || 0}g</span>
            <span className={`${favoritesTypography.macroLabel} ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
              {MACRO_COLORS.carbs.label}
            </span>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center ${pillBg}`}>
            <span className={`${favoritesTypography.macroValue} block ${isLight ? 'text-slate-900' : 'text-white'}`}>{Number(fatInput) || 0}g</span>
            <span className={`${favoritesTypography.macroLabel} ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
              {MACRO_COLORS.fat.label}
            </span>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS ROW */}
      <div className={`flex items-center justify-between gap-3 mt-4 pt-3.5 border-t ${
        isLight ? 'border-slate-200/80' : 'border-white/[0.08]'
      }`}>
        
        {/* Left Discard / Cancel Button */}
        <div>
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          ) : !draft.isSaved ? (
            <button
              onClick={() => onDiscard(draft.id)}
              disabled={isSaving}
              className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                isLight
                  ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                  : 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          ) : null}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          
          {/* Edit Button */}
          {!isEditing && !draft.isSaved && (
            <button
              onClick={() => setIsEditing(true)}
              disabled={isSaving}
              className={`flex items-center space-x-1 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 whitespace-nowrap ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300/80 shadow-xs'
                  : 'bg-[#18181b] hover:bg-[#222226] text-zinc-200 border-white/[0.08]'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="sm:hidden">Edit</span>
              <span className="hidden sm:inline">Edit Details</span>
            </button>
          )}

          {/* Save / Saved State */}
          {draft.isSaved ? (
            /* Calm Muted Gray Badge */
            <div className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold border ${
              isLight
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-white/5 text-zinc-400 border-white/10'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 opacity-80" />
              <span>Added to daily log</span>
            </div>
          ) : (
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className={`flex items-center space-x-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer ${
                isLight
                  ? 'bg-black hover:bg-zinc-800 text-white shadow-xs'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-xs'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="sm:hidden">Save</span>
                  <span className="hidden sm:inline">Save Entry</span>
                </>
              )}
            </button>
          )}

        </div>

      </div>

      {/* Unfavorite Confirmation Pop-up Modal */}
      {showUnfavoriteConfirm && (
        <div
          onClick={() => setShowUnfavoriteConfirm(false)}
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
                Are you sure you want to remove <span className="font-bold text-amber-500">"{mealName}"</span> from your favorite meals?
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnfavoriteConfirm(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/15 text-zinc-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFavoriteMeal(false);
                  onToggleFavorite?.();
                  setShowUnfavoriteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-rose-500 hover:bg-rose-600 text-white transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choice Modal: Save as Entry Only vs Update Favorite Preset */}
      {showFavoriteUpdatePrompt && (
        <div
          onClick={() => setShowFavoriteUpdatePrompt(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`p-6 rounded-[28px] max-w-md w-full border shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
                : 'bg-[#121214] border-white/[0.12] text-white shadow-black/80'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold tracking-tight">Favorite Meal Modified</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                You modified <span className="font-bold text-amber-500">"{mealName}"</span>. How would you like to save these changes?
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-left">
              {/* Option 1: Log today only */}
              <button
                type="button"
                onClick={() => executeSave(false)}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center space-x-3.5 active:scale-98 cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-900'
                    : 'bg-[#18181b] hover:bg-[#202024] border-white/[0.08] hover:border-white/[0.16] text-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-extrabold tracking-tight">Save as Today's Entry Only</h4>
                  <p className={`text-xs mt-0.5 leading-snug ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Log today's meal with {kcalInput} kcal. Your saved favorite preset stays untouched.
                  </p>
                </div>
              </button>

              {/* Option 2: Update Favorite Preset */}
              <button
                type="button"
                onClick={() => executeSave(true)}
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
                    Update the master recipe in your favorites bar and log today's intake.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFavoriteUpdatePrompt(false)}
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

