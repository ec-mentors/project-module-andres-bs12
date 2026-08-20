import React, { useState } from 'react';
import { Check, Edit2, Trash2, Sparkles, CheckCircle2, Loader2, X } from 'lucide-react';
import { MACRO_COLORS } from '../../utils/macroTokens';

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
  onSave: (data: Omit<MealDraftData, 'id' | 'isSaved'>) => Promise<void>;
  onDiscard: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const MealDraftCard: React.FC<MealDraftCardProps> = ({
  draft,
  onSave,
  onDiscard,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local editable state using strings to prevent stuck '0' on backspace
  const [mealName, setMealName] = useState(draft.mealName);
  const [kcalInput, setKcalInput] = useState(String(draft.kcal ?? ''));
  const [proteinInput, setProteinInput] = useState(String(draft.protein ?? ''));
  const [carbsInput, setCarbsInput] = useState(String(draft.carbs ?? ''));
  const [fatInput, setFatInput] = useState(String(draft.fat ?? ''));

  const handleSaveClick = async () => {
    if (draft.isSaved || isSaving) return;
    setIsSaving(true);
    try {
      await onSave({
        mealName: mealName.trim() || 'Meal Entry',
        kcal: Number(kcalInput) || 0,
        protein: Number(proteinInput) || 0,
        carbs: Number(carbsInput) || 0,
        fat: Number(fatInput) || 0,
        confidenceNote: draft.confidenceNote,
        source: draft.source || 'AI_PARSER',
      });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
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

  // Format confidence note: if it's a number like "90", show "Confidence: 90%"
  const formatConfidence = (note?: string) => {
    if (!note) return null;
    const trimmed = note.trim();
    if (/^\d+$/.test(trimmed)) {
      return `Confidence: ${trimmed}%`;
    }
    if (trimmed.includes('%')) {
      return `Confidence: ${trimmed}`;
    }
    return `Confidence: ${trimmed}`;
  };

  const confidenceDisplay = formatConfidence(draft.confidenceNote);

  return (
    <div className={`w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all duration-300 ${cardBg}`}>
      
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

            {/* Subtle Confidence Tag (No bulky box) */}
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-400'}`}>
                {draft.isSaved ? 'Recorded Entry' : 'Estimated Intake'}
              </span>
              {confidenceDisplay && (
                <>
                  <span className="text-zinc-500 text-xs">•</span>
                  <span className={`text-[10px] sm:text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {confidenceDisplay}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* KCAL BADGE */}
        {!isEditing && (
          <div className={`px-3 py-1 rounded-xl sm:rounded-2xl border flex items-center space-x-1 shrink-0 ${
            isLight ? MACRO_COLORS.kcal.badgeLight : MACRO_COLORS.kcal.badgeDark
          }`}>
            <span className="text-xs sm:text-sm font-black">{Number(kcalInput) || 0}</span>
            <span className="text-[10px] font-bold opacity-80">Kcal</span>
          </div>
        )}
      </div>

      {/* 4-MACRO GRID */}
      {isEditing ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2">
          <div>
            <label className={`text-[10px] font-bold uppercase block mb-1 ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>Kcal</label>
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
            <label className={`text-[10px] font-bold uppercase block mb-1 ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
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
            <label className={`text-[10px] font-bold uppercase block mb-1 ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
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
            <label className={`text-[10px] font-bold uppercase block mb-1 ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
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
            <span className={`text-xs sm:text-sm font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>{Number(kcalInput) || 0}</span>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>Kcal</span>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center ${pillBg}`}>
            <span className={`text-xs sm:text-sm font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>{Number(proteinInput) || 0}g</span>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
              {MACRO_COLORS.protein.label}
            </span>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center ${pillBg}`}>
            <span className={`text-xs sm:text-sm font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>{Number(carbsInput) || 0}g</span>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
              {MACRO_COLORS.carbs.label}
            </span>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center ${pillBg}`}>
            <span className={`text-xs sm:text-sm font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>{Number(fatInput) || 0}g</span>
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
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

    </div>
  );
};
