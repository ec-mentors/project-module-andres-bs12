import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import type { NutritionGoal } from '../../types/nutrition';

interface SetGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: NutritionGoal;
  onSaveGoal: (goal: NutritionGoal) => void;
  theme?: 'dark' | 'light';
}

export const SetGoalsModal: React.FC<SetGoalsModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onSaveGoal,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [kcal, setKcal] = useState(currentGoal.kcal);
  const [protein, setProtein] = useState(currentGoal.protein);
  const [carbs, setCarbs] = useState(currentGoal.carbs);
  const [fat, setFat] = useState(currentGoal.fat);

  useEffect(() => {
    setKcal(currentGoal.kcal);
    setProtein(currentGoal.protein);
    setCarbs(currentGoal.carbs);
    setFat(currentGoal.fat);
  }, [currentGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoal({
      kcal: Number(kcal) || 2000,
      protein: Number(protein) || 150,
      carbs: Number(carbs) || 200,
      fat: Number(fat) || 65,
    });
    onClose();
  };

  return (
    /* Backdrop Overlay - Clicking outside closes modal */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {/* Inner Modal Card - Stops propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`border-2 rounded-[32px] p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 transition-all ${
          isLight
            ? 'bg-white/95 backdrop-blur-2xl border-white/90 text-slate-900 shadow-[0_20px_60px_rgba(100,23,255,0.15)] custom-scrollbar-light [color-scheme:light]'
            : 'bg-[#161024] border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] custom-scrollbar [color-scheme:dark]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
            isLight
              ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
              : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className={`flex items-center space-x-3 mb-6 border-b pb-4 ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="p-2.5 rounded-2xl bg-[#6417ff]/20 text-[#6417ff] border border-[#6417ff]/30">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Set Daily Goals
            </h3>
            <p className={`text-xs font-semibold ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
              Customize your target calories and macronutrients
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* KCAL */}
          <div>
            <label className={`block text-xs font-extrabold uppercase mb-1.5 ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Daily Calories (Kcal)
            </label>
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(Number(e.target.value))}
              className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#6417ff] ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-[#231a38] border-white/15 text-white'
              }`}
              required
              min={500}
              max={10000}
            />
          </div>

          {/* PROTEIN */}
          <div>
            <label className={`block text-xs font-extrabold uppercase mb-1.5 ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Daily Protein (g)
            </label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#6417ff] ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-[#231a38] border-white/15 text-white'
              }`}
              required
              min={0}
              max={1000}
            />
          </div>

          {/* CARBS */}
          <div>
            <label className={`block text-xs font-extrabold uppercase mb-1.5 ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Daily Carbs (g)
            </label>
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#6417ff] ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-[#231a38] border-white/15 text-white'
              }`}
              required
              min={0}
              max={1000}
            />
          </div>

          {/* FAT */}
          <div>
            <label className={`block text-xs font-extrabold uppercase mb-1.5 ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Daily Fat (g)
            </label>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              className={`w-full border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#6417ff] ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-[#231a38] border-white/15 text-white'
              }`}
              required
              min={0}
              max={1000}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold active:scale-95 transition-all ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-300'
                  : 'text-slate-300 hover:text-white bg-white/5'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-[#6417ff] hover:bg-[#5400e9] active:scale-95 shadow-md border border-white/20 transition-all"
            >
              Save Goals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
