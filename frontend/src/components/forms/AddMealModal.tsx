import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import type { CreateMealEntryPayload } from '../../types/nutrition';
import { MACRO_COLORS } from '../../utils/macroTokens';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (payload: CreateMealEntryPayload) => Promise<void>;
  theme?: 'dark' | 'light';
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onAddMeal,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [mealName, setMealName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) {
      setErrorMsg('Please enter a meal name.');
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

      // Reset form
      setMealName('');
      setKcal('');
      setProtein('');
      setCarbs('');
      setFat('');
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error creating meal entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`rounded-[32px] max-w-md w-full p-8 shadow-2xl border relative animate-in fade-in zoom-in duration-200 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/10'
          : 'bg-[#121214] border-white/[0.08] text-white shadow-[0_20px_50px_rgba(0,0,0,0.9)]'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-1.5 rounded-full transition-all ${
            isLight
              ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-3 rounded-2xl ${
            isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'
          }`}>
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Log New Meal</h3>
            <p className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Add meal entry to daily log</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
              Meal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grilled Chicken & Quinoa"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none ${
                isLight
                  ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-500'
                  : 'border-white/[0.12] bg-[#18181b] text-white focus:border-white/30'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? MACRO_COLORS.kcal.textLight : MACRO_COLORS.kcal.text}`}>
                Calories (Kcal)
              </label>
              <input
                type="number"
                min="0"
                placeholder="450"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none ${
                  isLight
                    ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-500'
                    : 'border-white/[0.12] bg-[#18181b] text-white focus:border-white/30'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? MACRO_COLORS.protein.textLight : MACRO_COLORS.protein.text}`}>
                {MACRO_COLORS.protein.label} (g)
              </label>
              <input
                type="number"
                min="0"
                placeholder="40"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none ${
                  isLight
                    ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-500'
                    : 'border-white/[0.12] bg-[#18181b] text-white focus:border-white/30'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? MACRO_COLORS.carbs.textLight : MACRO_COLORS.carbs.text}`}>
                {MACRO_COLORS.carbs.label} (g)
              </label>
              <input
                type="number"
                min="0"
                placeholder="50"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none ${
                  isLight
                    ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-500'
                    : 'border-white/[0.12] bg-[#18181b] text-white focus:border-white/30'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? MACRO_COLORS.fat.textLight : MACRO_COLORS.fat.text}`}>
                {MACRO_COLORS.fat.label} (g)
              </label>
              <input
                type="number"
                min="0"
                placeholder="15"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none ${
                  isLight
                    ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-slate-500'
                    : 'border-white/[0.12] bg-[#18181b] text-white focus:border-white/30'
                }`}
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3.5 rounded-2xl border text-xs font-bold transition-all ${
                isLight
                  ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3.5 rounded-2xl text-xs font-black shadow-xs transition-all disabled:opacity-50 ${
                isLight
                  ? 'bg-black hover:bg-zinc-800 text-white'
                  : 'bg-white hover:bg-zinc-200 text-black'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Meal Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
